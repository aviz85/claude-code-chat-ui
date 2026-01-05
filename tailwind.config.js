/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        phosphor: {
          DEFAULT: '#00ff41',
          dim: '#00cc34',
          bright: '#33ff66',
          glow: 'rgba(0, 255, 65, 0.15)',
        },
        terminal: {
          bg: '#0a0a0a',
          surface: '#111111',
          border: '#1a1a1a',
          muted: '#2a2a2a',
        },
        amber: {
          terminal: '#ffb000',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        display: ['Space Mono', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'cursor-blink': 'blink 1s step-end infinite',
        'scanline': 'scanline 8s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'typing': 'typing 0.8s ease-out',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.8 },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'slide-up': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'typing': {
          '0%': { opacity: 0, transform: 'translateX(-5px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 255, 65, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 255, 65, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(0, 255, 65, 0.1)',
      },
    },
  },
  plugins: [],
}
