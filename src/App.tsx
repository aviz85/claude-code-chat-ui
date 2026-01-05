import { useState, useRef, useEffect, useCallback } from 'react'
import { ThemeProvider, useTheme } from './ThemeContext'
import ChatMessage, { Message, ToolUse } from './components/ChatMessage'
import ChatInput from './components/ChatInput'
import ThemeSelector from './components/ThemeSelector'
import { SessionSidebar, SessionData } from './components/SessionSidebar'

// Store messages per session in localStorage
function getStoredMessages(sessionId: string): Message[] {
  try {
    const stored = localStorage.getItem(`messages-${sessionId}`)
    if (stored) {
      const messages = JSON.parse(stored)
      return messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }))
    }
  } catch (e) {}
  return []
}

function storeMessages(sessionId: string, messages: Message[]): void {
  try {
    localStorage.setItem(`messages-${sessionId}`, JSON.stringify(messages))
  } catch (e) {}
}

function ChatApp() {
  const { theme, themeId } = useTheme()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [workingDir, setWorkingDir] = useState<string | null>(null)
  const [currentTools, setCurrentTools] = useState<ToolUse[]>([])
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load sessions from server on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const res = await fetch('/api/sessions')
        if (res.ok) {
          const data = await res.json()
          setSessions(data.sessions)
        }
      } catch (e) {
        console.error('Failed to load sessions:', e)
      }
    }
    loadSessions()
  }, [])

  // Store messages when they change
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      storeMessages(sessionId, messages)
    }
  }, [sessionId, messages])

  // Create new session
  const createSession = async (cwd: string) => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cwd }),
      })
      if (res.ok) {
        const newSession: SessionData = await res.json()
        setSessions(prev => [...prev, newSession])
        selectSession(newSession.sessionId)
      }
    } catch (e) {
      console.error('Failed to create session:', e)
    }
  }

  // Select a session
  const selectSession = (id: string) => {
    const session = sessions.find(s => s.sessionId === id)
    if (session) {
      setSessionId(id)
      setWorkingDir(session.cwd)
      setMessages(getStoredMessages(id))
      setCurrentTools([])
    }
  }

  // Delete a session
  const deleteSession = async (id: string) => {
    try {
      const res = await fetch(`/api/sessions/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.sessionId !== id))
        localStorage.removeItem(`messages-${id}`)
        if (sessionId === id) {
          setSessionId(null)
          setWorkingDir(null)
          setMessages([])
        }
      }
    } catch (e) {
      console.error('Failed to delete session:', e)
    }
  }

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setCurrentTools([])

    abortControllerRef.current = new AbortController()

    const assistantId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      isThinking: true,
      thinking: '',
      tools: [],
    }
    setMessages(prev => [...prev, assistantMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, sessionId }),
        signal: abortControllerRef.current.signal,
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No response body')

      let fullContent = ''
      const tools: ToolUse[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'session') {
                const newSessionId = data.sessionId
                setSessionId(newSessionId)
                if (data.cwd) {
                  setWorkingDir(data.cwd)
                }
                // Update sessions list with new SDK session ID
                setSessions(prev => prev.map(s =>
                  s.sessionId === sessionId && s.sessionId !== newSessionId
                    ? { ...s, sessionId: newSessionId }
                    : s
                ))
              } else if (data.type === 'thinking') {
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantId
                      ? { ...m, thinking: (m.thinking || '') + data.content, isThinking: true }
                      : m
                  )
                )
              } else if (data.type === 'content') {
                // When content starts, thinking is done
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantId ? { ...m, isThinking: false } : m
                  )
                )
                fullContent += data.content
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantId ? { ...m, content: fullContent } : m
                  )
                )
              } else if (data.type === 'tool_use') {
                const tool: ToolUse = {
                  name: data.tool,
                  input: data.input,
                  status: 'running',
                }
                tools.push(tool)
                setCurrentTools([...tools])
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantId ? { ...m, tools: [...tools] } : m
                  )
                )
              } else if (data.type === 'result') {
                const completedTools = tools.map(t => ({ ...t, status: 'complete' as const }))
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantId
                      ? { ...m, tools: completedTools, usage: data.usage, cost: data.cost }
                      : m
                  )
                )
              } else if (data.type === 'done') {
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantId ? { ...m, isStreaming: false, isThinking: false } : m
                  )
                )
              } else if (data.type === 'error') {
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantId
                      ? { ...m, content: `Error: ${data.error}`, isStreaming: false, isError: true }
                      : m
                  )
                )
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: `Connection error: ${error.message}`, isStreaming: false, isError: true }
              : m
          )
        )
      }
    } finally {
      setIsLoading(false)
      setCurrentTools([])
    }
  }

  const stopGeneration = () => {
    abortControllerRef.current?.abort()
    setIsLoading(false)
  }

  const clearChat = () => {
    setMessages([])
    setSessionId(null)
    setWorkingDir(null)
  }

  const isTerminal = themeId === 'terminal'

  return (
    <div className="flex h-screen" style={{ background: theme.colors.bg }}>
      {/* Session Sidebar */}
      <SessionSidebar
        sessions={sessions}
        activeSessionId={sessionId}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSelectSession={selectSession}
        onCreateSession={createSession}
        onDeleteSession={deleteSession}
      />

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col relative overflow-hidden"
        style={{
          fontFamily: theme.fonts.body,
          color: theme.colors.text,
        }}
      >
        {/* CRT effects only for terminal theme */}
        {isTerminal && <div className="crt-overlay" />}

        {/* Header */}
      <header
        className="border-b backdrop-blur-sm relative z-50"
        style={{
          background: `${theme.colors.bgSecondary}cc`,
          borderColor: theme.colors.border,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: theme.colors.primary }}
            />
            <h1
              className="text-lg font-semibold tracking-tight"
              style={{ color: theme.colors.text }}
            >
              Claude Code
            </h1>
            {sessionId && (
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  background: theme.colors.primaryMuted,
                  color: theme.colors.textMuted,
                  fontFamily: theme.fonts.mono,
                }}
              >
                {sessionId.slice(0, 8)}
              </span>
            )}
            {workingDir && (
              <span
                className="text-xs px-2 py-0.5 rounded flex items-center gap-1.5"
                style={{
                  background: theme.colors.bgSecondary,
                  color: theme.colors.textSecondary,
                  fontFamily: theme.fonts.mono,
                  border: `1px solid ${theme.colors.border}`,
                }}
                title={workingDir}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                {workingDir.split('/').pop() || workingDir}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ThemeSelector />
            <button
              onClick={clearChat}
              className="text-sm px-3 py-1.5 rounded-md border transition-all hover:shadow-sm"
              style={{
                color: theme.colors.textSecondary,
                borderColor: theme.colors.border,
                background: theme.colors.bgSecondary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.colors.borderHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div
                className="text-5xl mb-6"
                style={{ color: theme.colors.primary }}
              >
                {isTerminal ? '>_' : '💬'}
              </div>
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: theme.colors.text }}
              >
                {isTerminal ? 'TERMINAL READY' : 'Start a conversation'}
              </h2>
              <p
                className="text-sm max-w-md"
                style={{ color: theme.colors.textMuted }}
              >
                {isTerminal
                  ? 'Initialize connection with Claude Code agent. Type your command below to begin execution.'
                  : 'Ask Claude Code to help you with coding tasks, file operations, and more.'}
              </p>

              <div
                className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm w-full max-w-lg"
              >
                {[
                  { title: 'Capabilities', items: ['Read, Write, Edit files', 'Execute shell commands', 'Web search & fetch'] },
                  { title: 'Examples', items: ['"List all TypeScript files"', '"Fix the bug in auth.ts"', '"Run the test suite"'] },
                ].map((section) => (
                  <div
                    key={section.title}
                    className="p-4 rounded-lg border"
                    style={{
                      background: theme.colors.bgSecondary,
                      borderColor: theme.colors.border,
                      borderRadius: theme.borderRadius,
                    }}
                  >
                    <div
                      className="font-medium mb-2"
                      style={{ color: theme.colors.primary }}
                    >
                      {section.title}
                    </div>
                    {section.items.map((item) => (
                      <div
                        key={item}
                        className="text-xs mb-1"
                        style={{ color: theme.colors.textMuted }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Active tools */}
      {currentTools.length > 0 && (
        <div
          className="border-t backdrop-blur-sm relative z-10"
          style={{
            background: `${theme.colors.bgSecondary}cc`,
            borderColor: theme.colors.warning + '40',
          }}
        >
          <div className="max-w-4xl mx-auto px-4 py-2">
            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: theme.colors.warning, fontFamily: theme.fonts.mono }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: theme.colors.warning }}
              />
              <span>Running:</span>
              {currentTools.map((tool, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded"
                  style={{ background: theme.colors.warning + '20' }}
                >
                  {tool.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <footer
        className="border-t backdrop-blur-sm relative z-10"
        style={{
          background: `${theme.colors.bgSecondary}cc`,
          borderColor: theme.colors.border,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <ChatInput
            onSend={sendMessage}
            onStop={stopGeneration}
            isLoading={isLoading}
          />
        </div>
      </footer>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ChatApp />
    </ThemeProvider>
  )
}
