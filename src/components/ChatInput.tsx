import { useState, useRef, useEffect, KeyboardEvent, useMemo } from 'react'
import { useTheme } from '../ThemeContext'

// Hebrew character range: \u0590-\u05FF
const STARTS_WITH_HEBREW_REGEX = /^[\s\d\-\.\)\]\•\*\#]*[\u0590-\u05FF]/

function getTextDirection(text: string): 'rtl' | 'ltr' {
  if (STARTS_WITH_HEBREW_REGEX.test(text)) {
    return 'rtl'
  }
  return 'ltr'
}

interface Props {
  onSend: (message: string) => void
  onStop: () => void
  isLoading: boolean
}

export default function ChatInput({ onSend, onStop, isLoading }: Props) {
  const { theme, themeId } = useTheme()
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isTerminal = themeId === 'terminal'
  const inputDirection = useMemo(() => getTextDirection(input), [input])

  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus()
    }
  }, [isLoading])

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [input])

  return (
    <div className="relative">
      <div
        className="flex items-end gap-3 p-3 transition-all"
        style={{
          background: theme.colors.inputBg,
          border: `1px solid ${isFocused ? theme.colors.primary : theme.colors.border}`,
          borderRadius: theme.borderRadius,
          boxShadow: isFocused ? theme.shadows.md : 'none',
        }}
      >
        {/* Prompt indicator */}
        {isTerminal && (
          <div className="flex items-center h-[38px]">
            <span
              style={{
                color: theme.colors.primary,
                fontWeight: 'bold',
                fontSize: '1.125rem',
                textShadow: `0 0 10px ${theme.colors.primary}`,
              }}
            >
              &gt;
            </span>
          </div>
        )}

        {/* Input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isLoading ? 'Processing...' : 'Type a message...'}
          disabled={isLoading}
          rows={1}
          dir={inputDirection}
          className="flex-1 bg-transparent border-none resize-none focus:outline-none
                     disabled:opacity-50 min-h-[38px] py-2"
          style={{
            color: theme.colors.text,
            fontFamily: theme.fonts.body,
            fontSize: '0.9375rem',
            caretColor: theme.colors.primary,
            textAlign: inputDirection === 'rtl' ? 'right' : 'left',
          }}
        />

        {/* Button */}
        {isLoading ? (
          <button
            onClick={onStop}
            className="flex items-center gap-2 px-4 py-2 transition-all"
            style={{
              background: theme.colors.error + '20',
              border: `1px solid ${theme.colors.error}50`,
              borderRadius: theme.borderRadius,
              color: theme.colors.error,
              fontFamily: theme.fonts.body,
              fontSize: '0.875rem',
            }}
          >
            <span
              className="w-2 h-2 rounded-sm"
              style={{ background: theme.colors.error }}
            />
            Stop
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="flex items-center gap-2 px-4 py-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: theme.colors.buttonBg,
              borderRadius: theme.borderRadius,
              color: theme.colors.buttonText,
              fontFamily: theme.fonts.body,
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              if (input.trim()) {
                e.currentTarget.style.boxShadow = theme.shadows.md
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'none'
            }}
          >
            <span>{isTerminal ? 'EXEC' : 'Send'}</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Hints */}
      <div
        className="flex items-center justify-between mt-2 px-1 text-xs"
        style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.mono }}
      >
        <div className="flex items-center gap-3">
          <span>
            <kbd
              className="px-1.5 py-0.5 rounded"
              style={{ background: theme.colors.bgTertiary }}
            >
              Enter
            </kbd>{' '}
            send
          </span>
          <span>
            <kbd
              className="px-1.5 py-0.5 rounded"
              style={{ background: theme.colors.bgTertiary }}
            >
              Shift+Enter
            </kbd>{' '}
            newline
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: isLoading ? theme.colors.warning : theme.colors.success,
            }}
          />
          <span>{isLoading ? 'Processing' : 'Ready'}</span>
        </div>
      </div>
    </div>
  )
}
