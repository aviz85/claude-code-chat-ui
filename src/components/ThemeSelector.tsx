import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../ThemeContext'
import { themeList, ThemeId } from '../themes'

export default function ThemeSelector() {
  const { themeId, setTheme, theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentTheme = themeList.find(t => t.id === themeId)

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all
                   border hover:shadow-md"
        style={{
          background: theme.colors.bgSecondary,
          borderColor: theme.colors.border,
          color: theme.colors.textSecondary,
        }}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: theme.colors.primary }}
        />
        <span style={{ fontFamily: theme.fonts.body }}>{currentTheme?.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg z-50 overflow-hidden border"
          style={{
            background: theme.colors.bgSecondary,
            borderColor: theme.colors.border,
            boxShadow: theme.shadows.lg,
          }}
        >
          <div
            className="px-3 py-2 text-xs font-medium uppercase tracking-wider border-b"
            style={{
              color: theme.colors.textMuted,
              borderColor: theme.colors.border,
              fontFamily: theme.fonts.body,
            }}
          >
            Choose Theme
          </div>
          {themeList.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id as ThemeId)
                setIsOpen(false)
              }}
              className="w-full px-3 py-3 flex items-center gap-3 transition-colors text-left"
              style={{
                background: themeId === t.id ? t.colors.primaryMuted : 'transparent',
                fontFamily: t.fonts.body,
              }}
              onMouseEnter={(e) => {
                if (themeId !== t.id) {
                  e.currentTarget.style.background = theme.colors.bgTertiary
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = themeId === t.id ? t.colors.primaryMuted : 'transparent'
              }}
            >
              {/* Theme preview */}
              <div
                className="w-10 h-10 rounded-lg overflow-hidden border flex-shrink-0"
                style={{ borderColor: t.colors.border }}
              >
                <div className="h-1/2" style={{ background: t.colors.bg }} />
                <div className="h-1/2 flex">
                  <div className="w-1/2" style={{ background: t.colors.primary }} />
                  <div className="w-1/2" style={{ background: t.colors.bgSecondary }} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className="font-medium text-sm"
                  style={{ color: theme.colors.text }}
                >
                  {t.name}
                </div>
                <div
                  className="text-xs truncate"
                  style={{ color: theme.colors.textMuted }}
                >
                  {t.description}
                </div>
              </div>

              {themeId === t.id && (
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: theme.colors.primary }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
