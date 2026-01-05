import { useState, useEffect } from 'react'
import { useTheme } from '../ThemeContext'

interface FolderBrowserProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (path: string) => void
  initialPath?: string
}

interface BrowseResult {
  path: string
  parent: string | null
  directories: string[]
}

export function FolderBrowser({ isOpen, onClose, onSelect, initialPath }: FolderBrowserProps) {
  const { theme } = useTheme()
  const [currentPath, setCurrentPath] = useState<string>('')
  const [directories, setDirectories] = useState<string[]>([])
  const [parent, setParent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadDirectory(initialPath || '')
    }
  }, [isOpen, initialPath])

  const loadDirectory = async (path: string) => {
    setLoading(true)
    setError(null)
    try {
      const url = path
        ? `/api/browse?path=${encodeURIComponent(path)}`
        : '/api/browse'
      const res = await fetch(url)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to load directory')
      }
      const data: BrowseResult = await res.json()
      setCurrentPath(data.path)
      setDirectories(data.directories)
      setParent(data.parent)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = () => {
    onSelect(currentPath)
    onClose()
  }

  const navigateTo = (dir: string) => {
    const newPath = `${currentPath}/${dir}`
    loadDirectory(newPath)
  }

  const navigateUp = () => {
    if (parent) {
      loadDirectory(parent)
    }
  }

  if (!isOpen) return null

  // Parse path into breadcrumbs
  const pathParts = currentPath.split('/').filter(Boolean)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-4 rounded-lg shadow-xl overflow-hidden"
        style={{
          background: theme.colors.bg,
          border: `1px solid ${theme.colors.border}`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{
            background: theme.colors.bgSecondary,
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          <h2 className="font-semibold" style={{ color: theme.colors.text }}>
            Select Folder
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:opacity-80"
            style={{ color: theme.colors.textSecondary }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Breadcrumb */}
        <div
          className="px-4 py-2 flex items-center gap-1 text-sm overflow-x-auto"
          style={{
            background: theme.colors.bgTertiary,
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          <button
            onClick={() => loadDirectory('/')}
            className="hover:underline flex-shrink-0"
            style={{ color: theme.colors.primary }}
          >
            /
          </button>
          {pathParts.map((part, idx) => (
            <span key={idx} className="flex items-center gap-1 flex-shrink-0">
              <span style={{ color: theme.colors.textMuted }}>/</span>
              <button
                onClick={() => loadDirectory('/' + pathParts.slice(0, idx + 1).join('/'))}
                className="hover:underline"
                style={{ color: idx === pathParts.length - 1 ? theme.colors.text : theme.colors.primary }}
              >
                {part}
              </button>
            </span>
          ))}
        </div>

        {/* Directory List */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: '300px', minHeight: '200px' }}
        >
          {loading ? (
            <div className="p-4 text-center" style={{ color: theme.colors.textSecondary }}>
              Loading...
            </div>
          ) : error ? (
            <div className="p-4 text-center" style={{ color: theme.colors.error }}>
              {error}
            </div>
          ) : (
            <>
              {/* Go up button */}
              {parent && (
                <button
                  onClick={navigateUp}
                  className="w-full px-4 py-2 flex items-center gap-3 hover:opacity-80 transition-opacity"
                  style={{
                    background: theme.colors.bgSecondary,
                    color: theme.colors.textSecondary,
                    borderBottom: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  <span>..</span>
                </button>
              )}

              {/* Directories */}
              {directories.length === 0 ? (
                <div className="p-4 text-center" style={{ color: theme.colors.textMuted }}>
                  No subdirectories
                </div>
              ) : (
                directories.map(dir => (
                  <button
                    key={dir}
                    onClick={() => navigateTo(dir)}
                    className="w-full px-4 py-2 flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
                    style={{
                      color: theme.colors.text,
                      borderBottom: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>{dir}</span>
                  </button>
                ))
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{
            background: theme.colors.bgSecondary,
            borderTop: `1px solid ${theme.colors.border}`,
          }}
        >
          <span
            className="text-sm truncate max-w-[60%]"
            style={{ color: theme.colors.textSecondary, fontFamily: theme.fonts.mono }}
          >
            {currentPath}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded text-sm"
              style={{
                background: theme.colors.bgTertiary,
                color: theme.colors.textSecondary,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              className="px-4 py-1.5 rounded text-sm font-medium"
              style={{
                background: theme.colors.primary,
                color: theme.colors.buttonText,
              }}
            >
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
