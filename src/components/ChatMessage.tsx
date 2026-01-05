import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useTheme } from '../ThemeContext'

// Hebrew character range: \u0590-\u05FF
const HEBREW_REGEX = /[\u0590-\u05FF]/
// Matches text that starts with optional symbols/numbers followed by Hebrew
const STARTS_WITH_HEBREW_REGEX = /^[\s\d\-\.\)\]\•\*\#]*[\u0590-\u05FF]/

function getTextDirection(text: string): 'rtl' | 'ltr' {
  // Check if text starts with Hebrew (after optional leading symbols)
  if (STARTS_WITH_HEBREW_REGEX.test(text)) {
    return 'rtl'
  }
  return 'ltr'
}

function hasHebrew(text: string): boolean {
  return HEBREW_REGEX.test(text)
}

export interface ToolUse {
  name: string
  input: Record<string, any>
  status: 'running' | 'complete' | 'error'
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
  isError?: boolean
  isThinking?: boolean
  thinking?: string
  tools?: ToolUse[]
  usage?: {
    input_tokens: number
    output_tokens: number
  }
  cost?: number
}

interface Props {
  message: Message
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function formatToolInput(input: Record<string, any>): string {
  if (input.command) return input.command
  if (input.file_path) return input.file_path
  if (input.pattern) return input.pattern
  if (input.query) return input.query
  return JSON.stringify(input).slice(0, 80)
}

export default function ChatMessage({ message }: Props) {
  const { theme, themeId } = useTheme()
  const [showThinking, setShowThinking] = useState(false)
  const isUser = message.role === 'user'
  const isTerminal = themeId === 'terminal'

  return (
    <div
      className={`animate-fade-in ${isUser ? 'flex justify-end' : ''}`}
      style={{ animationDuration: '0.2s' }}
    >
      <div
        className={`relative ${isUser ? 'max-w-[80%]' : 'max-w-full'}`}
        style={{
          background: isUser ? theme.colors.userBg : theme.colors.assistantBg,
          color: isUser ? theme.colors.userText : theme.colors.assistantText,
          border: `1px solid ${isUser ? theme.colors.userBorder : theme.colors.assistantBorder}`,
          borderRadius: theme.borderRadius,
          padding: '12px 16px',
          boxShadow: theme.shadows.sm,
        }}
      >
        {/* Header for assistant */}
        {!isUser && (
          <div
            className="flex items-center gap-2 mb-2 text-xs"
            style={{ fontFamily: theme.fonts.mono }}
          >
            <span style={{ color: theme.colors.primary, fontWeight: 500 }}>
              {isTerminal ? 'CLAUDE' : 'Claude'}
            </span>
            <span style={{ color: theme.colors.textMuted }}>•</span>
            <span style={{ color: theme.colors.textMuted }}>
              {formatTime(message.timestamp)}
            </span>
            {message.isStreaming && (
              <span
                className="flex items-center gap-1"
                style={{ color: theme.colors.textMuted }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: theme.colors.primary }}
                />
                typing...
              </span>
            )}
          </div>
        )}

        {/* Thinking indicator */}
        {(message.isThinking || message.thinking) && (
          <div className="mb-3">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-xs w-full transition-colors"
              style={{
                background: theme.colors.primary + '15',
                borderLeft: `2px solid ${theme.colors.primary}`,
                fontFamily: theme.fonts.mono,
              }}
            >
              {message.isThinking && !message.thinking ? (
                <>
                  <span className="flex gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: theme.colors.primary, animationDelay: '0ms' }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: theme.colors.primary, animationDelay: '150ms' }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: theme.colors.primary, animationDelay: '300ms' }}
                    />
                  </span>
                  <span style={{ color: theme.colors.primary }}>Thinking...</span>
                </>
              ) : (
                <>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      color: theme.colors.primary,
                      transform: showThinking ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                  <span style={{ color: theme.colors.primary }}>Thinking</span>
                  <span style={{ color: theme.colors.textMuted }}>
                    ({message.thinking?.length || 0} chars)
                  </span>
                </>
              )}
            </button>
            {showThinking && message.thinking && (
              <div
                className="mt-2 px-3 py-2 rounded text-xs overflow-auto max-h-64"
                style={{
                  background: theme.colors.bgTertiary,
                  border: `1px solid ${theme.colors.border}`,
                  fontFamily: theme.fonts.mono,
                  color: theme.colors.textMuted,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {message.thinking}
              </div>
            )}
          </div>
        )}

        {/* Tool indicators */}
        {message.tools && message.tools.length > 0 && (
          <div className="mb-3 space-y-1">
            {message.tools.map((tool, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-xs"
                style={{
                  background: theme.colors.warning + '15',
                  borderLeft: `2px solid ${theme.colors.warning}`,
                  fontFamily: theme.fonts.mono,
                }}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${tool.status === 'running' ? 'animate-pulse' : ''}`}
                  style={{
                    background:
                      tool.status === 'running'
                        ? theme.colors.warning
                        : tool.status === 'complete'
                        ? theme.colors.success
                        : theme.colors.error,
                  }}
                />
                <span style={{ color: theme.colors.warning, fontWeight: 500 }}>
                  {tool.name}
                </span>
                <span
                  className="truncate max-w-[250px]"
                  style={{ color: theme.colors.textMuted }}
                >
                  {formatToolInput(tool.input)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div
          className="text-sm leading-relaxed"
          style={{
            fontFamily: isUser ? theme.fonts.body : theme.fonts.body,
            color: message.isError ? theme.colors.error : undefined,
          }}
        >
          {isUser ? (
            <span dir={getTextDirection(message.content)} style={{ display: 'block', textAlign: getTextDirection(message.content) === 'rtl' ? 'right' : 'left' }}>
              {message.content}
            </span>
          ) : message.content ? (
            <div
              className="prose prose-sm max-w-none"
              style={
                {
                  '--tw-prose-body': theme.colors.text,
                  '--tw-prose-headings': theme.colors.text,
                  '--tw-prose-links': theme.colors.primary,
                  '--tw-prose-code': theme.colors.primary,
                  '--tw-prose-pre-bg': theme.colors.bgTertiary,
                } as React.CSSProperties
              }
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }) {
                    const isInline = !className
                    if (isInline) {
                      return (
                        <code
                          style={{
                            background: theme.colors.primaryMuted,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontFamily: theme.fonts.mono,
                            fontSize: '0.875em',
                          }}
                          {...props}
                        >
                          {children}
                        </code>
                      )
                    }
                    return (
                      <code
                        style={{ fontFamily: theme.fonts.mono }}
                        className={className}
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                  pre({ children }) {
                    return (
                      <pre
                        style={{
                          background: theme.colors.bgTertiary,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: theme.borderRadius,
                          padding: '12px',
                          overflow: 'auto',
                          fontFamily: theme.fonts.mono,
                          fontSize: '0.85em',
                        }}
                      >
                        {children}
                      </pre>
                    )
                  },
                  a({ href, children }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: theme.colors.primary }}
                      >
                        {children}
                      </a>
                    )
                  },
                  p({ children }) {
                    const text = String(children)
                    const dir = getTextDirection(text)
                    return (
                      <p dir={dir} style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                        {children}
                      </p>
                    )
                  },
                  li({ children }) {
                    const text = String(children)
                    const dir = getTextDirection(text)
                    return (
                      <li dir={dir} style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                        {children}
                      </li>
                    )
                  },
                  h1({ children }) {
                    const text = String(children)
                    const dir = getTextDirection(text)
                    return <h1 dir={dir} style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>{children}</h1>
                  },
                  h2({ children }) {
                    const text = String(children)
                    const dir = getTextDirection(text)
                    return <h2 dir={dir} style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>{children}</h2>
                  },
                  h3({ children }) {
                    const text = String(children)
                    const dir = getTextDirection(text)
                    return <h3 dir={dir} style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>{children}</h3>
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : message.isStreaming ? (
            <span style={{ color: theme.colors.textMuted }}>Thinking...</span>
          ) : null}

          {/* Streaming cursor */}
          {message.isStreaming && message.content && (
            <span
              className="inline-block w-2 h-4 ml-0.5 animate-pulse"
              style={{ background: theme.colors.primary }}
            />
          )}
        </div>

        {/* Usage stats */}
        {message.usage && !message.isStreaming && (
          <div
            className="mt-3 pt-2 flex items-center gap-3 text-xs"
            style={{
              borderTop: `1px solid ${theme.colors.border}`,
              color: theme.colors.textMuted,
              fontFamily: theme.fonts.mono,
            }}
          >
            <span>{message.usage.input_tokens.toLocaleString()} in</span>
            <span>{message.usage.output_tokens.toLocaleString()} out</span>
            {message.cost !== undefined && (
              <span>${message.cost.toFixed(4)}</span>
            )}
          </div>
        )}

        {/* User message timestamp */}
        {isUser && (
          <div
            className="mt-1 text-xs text-right"
            style={{ color: theme.colors.userText + 'aa' }}
          >
            {formatTime(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  )
}
