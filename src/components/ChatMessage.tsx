import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useTheme } from '../ThemeContext'

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
            <span>{message.content}</span>
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
