# Claude Code Chat UI

A modern chat interface for Claude Code with multiple themes and RTL support.

![Claude Code Chat UI](https://img.shields.io/badge/Claude-Code-blue)

## Features

- **5 Beautiful Themes**: Terminal, Minimal Light, Dark Elegant, Notion, Midnight
- **RTL Support**: Automatic right-to-left for Hebrew text
- **Streaming Responses**: Real-time message streaming
- **Tool Indicators**: See when Claude is using tools
- **Session Persistence**: Continue conversations across page reloads
- **Token Usage**: Track input/output tokens and costs

## Prerequisites

You need to be authenticated with Claude Code before using this app.

### Option 1: Claude Code CLI (Recommended)

```bash
# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Login (opens browser for OAuth)
claude
```

### Option 2: API Key

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

## Installation

```bash
# Clone the repository
git clone https://github.com/aviz85/claude-code-chat-ui.git

# Navigate to the directory
cd claude-code-chat-ui

# Install dependencies
npm install
```

## Usage

```bash
# Start the development server
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

Open http://localhost:5173 in your browser.

## Build for Production

```bash
# Build the frontend
npm run build

# Start production server
npm start
```

## Project Structure

```
chat-ui/
├── server/
│   └── index.ts        # Express backend with Claude SDK
├── src/
│   ├── components/
│   │   ├── ChatInput.tsx    # Input with RTL support
│   │   ├── ChatMessage.tsx  # Message display
│   │   └── ThemeSelector.tsx
│   ├── App.tsx         # Main chat application
│   ├── ThemeContext.tsx # Theme state management
│   ├── themes.ts       # Theme definitions
│   └── index.css       # Global styles
├── package.json
└── README.md
```

## Themes

| Theme | Description |
|-------|-------------|
| **Terminal** | Retro CRT with phosphor green |
| **Minimal Light** | Clean, professional light theme |
| **Dark Elegant** | Sophisticated dark with purple accents |
| **Notion** | Warm, readable, content-focused |
| **Midnight** | GitHub-style dark with blue accents |

## Configuration

### Allowed Tools

Edit `server/index.ts` to customize which tools Claude can use:

```typescript
allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep', 'WebSearch', 'WebFetch', 'TodoWrite'],
```

### Working Directory

By default, Claude operates in the server's current directory. Change it in `server/index.ts`:

```typescript
cwd: '/path/to/your/project',
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `3001` |
| `ANTHROPIC_API_KEY` | API key (if not using OAuth) | - |

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Express, TypeScript
- **SDK**: @anthropic-ai/claude-agent-sdk

## License

MIT
