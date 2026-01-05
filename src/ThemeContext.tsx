import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Theme, themes, ThemeId } from './themes'

interface ThemeContextType {
  theme: Theme
  themeId: ThemeId
  setTheme: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('chat-theme')
    return (saved as ThemeId) || 'midnight'
  })

  const theme = themes[themeId]

  useEffect(() => {
    localStorage.setItem('chat-theme', themeId)

    // Apply CSS variables to document
    const root = document.documentElement
    const { colors, fonts, borderRadius, shadows } = theme

    root.style.setProperty('--color-bg', colors.bg)
    root.style.setProperty('--color-bg-secondary', colors.bgSecondary)
    root.style.setProperty('--color-bg-tertiary', colors.bgTertiary)
    root.style.setProperty('--color-text', colors.text)
    root.style.setProperty('--color-text-secondary', colors.textSecondary)
    root.style.setProperty('--color-text-muted', colors.textMuted)
    root.style.setProperty('--color-primary', colors.primary)
    root.style.setProperty('--color-primary-hover', colors.primaryHover)
    root.style.setProperty('--color-primary-muted', colors.primaryMuted)
    root.style.setProperty('--color-user-bg', colors.userBg)
    root.style.setProperty('--color-user-text', colors.userText)
    root.style.setProperty('--color-user-border', colors.userBorder)
    root.style.setProperty('--color-assistant-bg', colors.assistantBg)
    root.style.setProperty('--color-assistant-text', colors.assistantText)
    root.style.setProperty('--color-assistant-border', colors.assistantBorder)
    root.style.setProperty('--color-border', colors.border)
    root.style.setProperty('--color-border-hover', colors.borderHover)
    root.style.setProperty('--color-input-bg', colors.inputBg)
    root.style.setProperty('--color-button-bg', colors.buttonBg)
    root.style.setProperty('--color-button-text', colors.buttonText)
    root.style.setProperty('--color-success', colors.success)
    root.style.setProperty('--color-warning', colors.warning)
    root.style.setProperty('--color-error', colors.error)
    root.style.setProperty('--font-body', fonts.body)
    root.style.setProperty('--font-mono', fonts.mono)
    root.style.setProperty('--border-radius', borderRadius)
    root.style.setProperty('--shadow-sm', shadows.sm)
    root.style.setProperty('--shadow-md', shadows.md)
    root.style.setProperty('--shadow-lg', shadows.lg)
  }, [theme, themeId])

  const setTheme = (id: ThemeId) => {
    setThemeId(id)
  }

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
