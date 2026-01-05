import { useState } from 'react'
import { useTheme } from '../ThemeContext'
import { FolderBrowser } from './FolderBrowser'

export interface SessionData {
  sessionId: string
  cwd: string
  name: string
  createdAt: string
  lastAccessed: string
}

interface SessionSidebarProps {
  sessions: SessionData[]
  activeSessionId: string | null
  isCollapsed: boolean
  onToggleCollapse: () => void
  onSelectSession: (sessionId: string) => void
  onCreateSession: (cwd: string) => void
  onDeleteSession: (sessionId: string) => void
}

export function SessionSidebar({
  sessions,
  activeSessionId,
  isCollapsed,
  onToggleCollapse,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
}: SessionSidebarProps) {
  const { theme } = useTheme()
  const [showFolderBrowser, setShowFolderBrowser] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleCreateSession = (path: string) => {
    onCreateSession(path)
    setShowFolderBrowser(false)
  }

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    if (deletingId === sessionId) {
      onDeleteSession(sessionId)
      setDeletingId(null)
    } else {
      setDeletingId(sessionId)
      // Reset after 3 seconds if not confirmed
      setTimeout(() => setDeletingId(null), 3000)
    }
  }

  if (isCollapsed) {
    return (
      <>
        <div
          className="h-screen flex-shrink-0"
          style={{
            background: theme.colors.bgSecondary,
            borderRight: `1px solid ${theme.colors.border}`,
          }}
        >
          <button
            onClick={onToggleCollapse}
            className="h-full flex items-center px-1 hover:opacity-80 transition-opacity"
            style={{
              color: theme.colors.textSecondary,
            }}
            title="Open sessions"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
        <FolderBrowser
          isOpen={showFolderBrowser}
          onClose={() => setShowFolderBrowser(false)}
          onSelect={handleCreateSession}
        />
      </>
    )
  }

  return (
    <>
      <div
        className="h-screen flex flex-col"
        style={{
          width: '260px',
          background: theme.colors.bgSecondary,
          borderRight: `1px solid ${theme.colors.border}`,
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${theme.colors.border}` }}
        >
          <h2 className="font-semibold text-sm" style={{ color: theme.colors.text }}>
            Sessions
          </h2>
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded hover:opacity-80"
            style={{ color: theme.colors.textSecondary }}
            title="Collapse sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        {/* New Session Button */}
        <div className="p-3">
          <button
            onClick={() => setShowFolderBrowser(true)}
            className="w-full px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              background: theme.colors.primary,
              color: theme.colors.buttonText,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Session
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-2">
          {sessions.length === 0 ? (
            <div
              className="text-center py-8 text-sm"
              style={{ color: theme.colors.textMuted }}
            >
              No sessions yet
            </div>
          ) : (
            sessions.map(session => (
              <button
                key={session.sessionId}
                onClick={() => onSelectSession(session.sessionId)}
                className="w-full mb-1 px-3 py-2 rounded-lg text-left transition-all group"
                style={{
                  background: session.sessionId === activeSessionId
                    ? theme.colors.bgTertiary
                    : 'transparent',
                  border: session.sessionId === activeSessionId
                    ? `1px solid ${theme.colors.border}`
                    : '1px solid transparent',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: theme.colors.primary, flexShrink: 0 }}
                    >
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: theme.colors.text }}
                    >
                      {session.name}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, session.sessionId)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity"
                    style={{
                      color: deletingId === session.sessionId ? theme.colors.error : theme.colors.textMuted,
                    }}
                    title={deletingId === session.sessionId ? 'Click again to confirm' : 'Delete session'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
                <div
                  className="mt-1 text-xs truncate"
                  style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.mono }}
                  title={session.cwd}
                >
                  {session.cwd}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <FolderBrowser
        isOpen={showFolderBrowser}
        onClose={() => setShowFolderBrowser(false)}
        onSelect={handleCreateSession}
      />
    </>
  )
}
