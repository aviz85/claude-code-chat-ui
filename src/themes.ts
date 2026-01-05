export interface Theme {
  id: string
  name: string
  description: string
  colors: {
    // Backgrounds
    bg: string
    bgSecondary: string
    bgTertiary: string
    // Text
    text: string
    textSecondary: string
    textMuted: string
    // Accents
    primary: string
    primaryHover: string
    primaryMuted: string
    // User messages
    userBg: string
    userText: string
    userBorder: string
    // Assistant messages
    assistantBg: string
    assistantText: string
    assistantBorder: string
    // UI elements
    border: string
    borderHover: string
    inputBg: string
    buttonBg: string
    buttonText: string
    // Status
    success: string
    warning: string
    error: string
  }
  fonts: {
    body: string
    mono: string
  }
  borderRadius: string
  shadows: {
    sm: string
    md: string
    lg: string
  }
}

export const themes: Record<string, Theme> = {
  // 1. Terminal (Original)
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    description: 'Retro CRT terminal aesthetic',
    colors: {
      bg: '#0a0a0a',
      bgSecondary: '#111111',
      bgTertiary: '#1a1a1a',
      text: '#00ff41',
      textSecondary: '#00cc34',
      textMuted: 'rgba(0, 255, 65, 0.5)',
      primary: '#00ff41',
      primaryHover: '#33ff66',
      primaryMuted: 'rgba(0, 255, 65, 0.15)',
      userBg: '#111111',
      userText: '#00ff41',
      userBorder: 'rgba(0, 255, 65, 0.3)',
      assistantBg: '#0a0a0a',
      assistantText: '#00ff41',
      assistantBorder: 'rgba(0, 255, 65, 0.1)',
      border: 'rgba(0, 255, 65, 0.2)',
      borderHover: 'rgba(0, 255, 65, 0.4)',
      inputBg: 'rgba(0, 0, 0, 0.5)',
      buttonBg: '#00ff41',
      buttonText: '#0a0a0a',
      success: '#00ff41',
      warning: '#ffb000',
      error: '#ff4444',
    },
    fonts: {
      body: "'JetBrains Mono', monospace",
      mono: "'JetBrains Mono', monospace",
    },
    borderRadius: '4px',
    shadows: {
      sm: '0 0 10px rgba(0, 255, 65, 0.1)',
      md: '0 0 20px rgba(0, 255, 65, 0.2)',
      lg: '0 0 40px rgba(0, 255, 65, 0.3)',
    },
  },

  // 2. Minimal Light - Clean and professional
  light: {
    id: 'light',
    name: 'Minimal Light',
    description: 'Clean, professional light theme',
    colors: {
      bg: '#ffffff',
      bgSecondary: '#f8f9fa',
      bgTertiary: '#f1f3f4',
      text: '#1a1a1a',
      textSecondary: '#4a4a4a',
      textMuted: '#8a8a8a',
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      primaryMuted: 'rgba(37, 99, 235, 0.1)',
      userBg: '#2563eb',
      userText: '#ffffff',
      userBorder: 'transparent',
      assistantBg: '#f8f9fa',
      assistantText: '#1a1a1a',
      assistantBorder: '#e5e7eb',
      border: '#e5e7eb',
      borderHover: '#d1d5db',
      inputBg: '#ffffff',
      buttonBg: '#2563eb',
      buttonText: '#ffffff',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    fonts: {
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'SF Mono', 'Fira Code', monospace",
    },
    borderRadius: '12px',
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
  },

  // 3. Dark Elegant - Sophisticated dark theme
  elegant: {
    id: 'elegant',
    name: 'Dark Elegant',
    description: 'Sophisticated dark with purple accents',
    colors: {
      bg: '#0f0f14',
      bgSecondary: '#16161d',
      bgTertiary: '#1e1e28',
      text: '#e4e4e7',
      textSecondary: '#a1a1aa',
      textMuted: '#71717a',
      primary: '#a78bfa',
      primaryHover: '#c4b5fd',
      primaryMuted: 'rgba(167, 139, 250, 0.15)',
      userBg: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
      userText: '#ffffff',
      userBorder: 'transparent',
      assistantBg: '#16161d',
      assistantText: '#e4e4e7',
      assistantBorder: '#27272a',
      border: '#27272a',
      borderHover: '#3f3f46',
      inputBg: '#16161d',
      buttonBg: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
      buttonText: '#ffffff',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
    },
    fonts: {
      body: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    borderRadius: '16px',
    shadows: {
      sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
      md: '0 8px 24px rgba(0, 0, 0, 0.4)',
      lg: '0 16px 48px rgba(0, 0, 0, 0.5)',
    },
  },

  // 4. Notion-style - Warm and readable
  notion: {
    id: 'notion',
    name: 'Notion',
    description: 'Warm, readable, content-focused',
    colors: {
      bg: '#ffffff',
      bgSecondary: '#fbfbfa',
      bgTertiary: '#f7f6f3',
      text: '#37352f',
      textSecondary: '#6b6b6b',
      textMuted: '#9b9a97',
      primary: '#2eaadc',
      primaryHover: '#0b95c9',
      primaryMuted: 'rgba(46, 170, 220, 0.1)',
      userBg: '#f7f6f3',
      userText: '#37352f',
      userBorder: '#e9e9e7',
      assistantBg: '#ffffff',
      assistantText: '#37352f',
      assistantBorder: '#e9e9e7',
      border: '#e9e9e7',
      borderHover: '#d3d3d0',
      inputBg: '#ffffff',
      buttonBg: '#37352f',
      buttonText: '#ffffff',
      success: '#0f7b6c',
      warning: '#cb912f',
      error: '#e03e3e',
    },
    fonts: {
      body: "'Georgia', 'Times New Roman', serif",
      mono: "'SFMono-Regular', Consolas, monospace",
    },
    borderRadius: '4px',
    shadows: {
      sm: '0 1px 1px rgba(0, 0, 0, 0.03)',
      md: '0 2px 4px rgba(0, 0, 0, 0.04)',
      lg: '0 4px 8px rgba(0, 0, 0, 0.06)',
    },
  },

  // 5. Midnight - Modern dark with blue accents
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    description: 'Modern dark with blue accents',
    colors: {
      bg: '#0d1117',
      bgSecondary: '#161b22',
      bgTertiary: '#21262d',
      text: '#e6edf3',
      textSecondary: '#8b949e',
      textMuted: '#6e7681',
      primary: '#58a6ff',
      primaryHover: '#79c0ff',
      primaryMuted: 'rgba(88, 166, 255, 0.15)',
      userBg: '#1f6feb',
      userText: '#ffffff',
      userBorder: 'transparent',
      assistantBg: '#161b22',
      assistantText: '#e6edf3',
      assistantBorder: '#30363d',
      border: '#30363d',
      borderHover: '#484f58',
      inputBg: '#0d1117',
      buttonBg: '#238636',
      buttonText: '#ffffff',
      success: '#3fb950',
      warning: '#d29922',
      error: '#f85149',
    },
    fonts: {
      body: "'-apple-system', BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif",
      mono: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
    },
    borderRadius: '6px',
    shadows: {
      sm: '0 1px 0 rgba(27, 31, 36, 0.04)',
      md: '0 3px 6px rgba(0, 0, 0, 0.15)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.25)',
    },
  },
}

export const themeList = Object.values(themes)
export type ThemeId = keyof typeof themes
