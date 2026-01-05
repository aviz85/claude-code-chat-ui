import express from 'express';
import { query, type SDKMessage } from '@anthropic-ai/claude-agent-sdk';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

// ES module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Session data interface
interface SessionData {
  sessionId: string;
  cwd: string;
  name: string;
  createdAt: string;
  lastAccessed: string;
}

// Sessions file path
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

// Load sessions from file
function loadSessions(): Map<string, SessionData> {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
      return new Map(Object.entries(data));
    }
  } catch (err) {
    console.error('Failed to load sessions:', err);
  }
  return new Map();
}

// Save sessions to file
function saveSessions(sessions: Map<string, SessionData>): void {
  try {
    const data = Object.fromEntries(sessions);
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to save sessions:', err);
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Enable CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Store active sessions (loaded from file)
const sessions = loadSessions();

// Chat endpoint with Server-Sent Events for streaming
app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Get session data for cwd
  const sessionData = sessionId ? sessions.get(sessionId) : null;
  const workingDir = sessionData?.cwd || process.cwd();

  try {
    const options: any = {
      cwd: workingDir,
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep', 'WebSearch', 'WebFetch', 'TodoWrite'],
      maxTurns: 10,
    };

    // Resume session if it has a real SDK session ID (not temp)
    if (sessionId && sessionData && !sessionData.sessionId.startsWith('session_')) {
      options.resume = sessionData.sessionId;
    }

    let currentSessionId = '';
    let fullResponse = '';

    for await (const msg of query({ prompt: message, options })) {
      const sdkMsg = msg as SDKMessage;

      // Capture session ID from system message
      if (sdkMsg.type === 'system' && 'session_id' in sdkMsg) {
        currentSessionId = sdkMsg.session_id;
        res.write(`data: ${JSON.stringify({ type: 'session', sessionId: currentSessionId, cwd: workingDir })}\n\n`);
      }

      // Stream assistant messages
      if (sdkMsg.type === 'assistant' && 'message' in sdkMsg) {
        const content = sdkMsg.message.content;
        if (typeof content === 'string') {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ type: 'content', content })}\n\n`);
        } else if (Array.isArray(content)) {
          for (const block of content) {
            if (block.type === 'text' && block.text) {
              fullResponse += block.text;
              res.write(`data: ${JSON.stringify({ type: 'content', content: block.text })}\n\n`);
            } else if (block.type === 'tool_use') {
              res.write(`data: ${JSON.stringify({
                type: 'tool_use',
                tool: block.name,
                input: block.input
              })}\n\n`);
            }
          }
        }
      }

      // Handle result message
      if (sdkMsg.type === 'result') {
        const resultMsg = sdkMsg as any;
        res.write(`data: ${JSON.stringify({
          type: 'result',
          success: resultMsg.subtype === 'success',
          usage: resultMsg.usage,
          cost: resultMsg.total_cost_usd
        })}\n\n`);

        // Store/update session for continuation
        if (currentSessionId && sessionId) {
          // Update existing session with real SDK session ID
          const existingSession = sessions.get(sessionId);
          if (existingSession) {
            // If this was a temp session, delete old key and add new one
            if (existingSession.sessionId !== currentSessionId) {
              sessions.delete(sessionId);
              existingSession.sessionId = currentSessionId;
              existingSession.lastAccessed = new Date().toISOString();
              sessions.set(currentSessionId, existingSession);
              saveSessions(sessions);
            }
          }
        } else if (currentSessionId) {
          // Create new session entry for sessions created without going through /api/sessions
          const newSession: SessionData = {
            sessionId: currentSessionId,
            cwd: workingDir,
            name: path.basename(workingDir),
            createdAt: new Date().toISOString(),
            lastAccessed: new Date().toISOString()
          };
          sessions.set(currentSessionId, newSession);
          saveSessions(sessions);
        }
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();

  } catch (error: any) {
    console.error('Chat error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Directory browsing endpoint
app.get('/api/browse', (req, res) => {
  const requestedPath = (req.query.path as string) || os.homedir();

  // Resolve and normalize path
  const resolvedPath = path.resolve(requestedPath);

  // Security: prevent path traversal - ensure resolved path doesn't contain suspicious patterns
  if (resolvedPath.includes('\0')) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  try {
    // Check if path exists and is a directory
    const stats = fs.statSync(resolvedPath);
    if (!stats.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory' });
    }

    // Read directory contents
    const entries = fs.readdirSync(resolvedPath, { withFileTypes: true });

    // Filter to only directories, exclude hidden folders
    const directories = entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    // Get parent path
    const parent = path.dirname(resolvedPath);
    const hasParent = parent !== resolvedPath;

    res.json({
      path: resolvedPath,
      parent: hasParent ? parent : null,
      directories
    });
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'Directory not found' });
    }
    if (err.code === 'EACCES') {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.status(500).json({ error: 'Failed to browse directory' });
  }
});

// Get all sessions
app.get('/api/sessions', (req, res) => {
  const sessionList = Array.from(sessions.values());
  res.json({ sessions: sessionList });
});

// Create new session
app.post('/api/sessions', (req, res) => {
  const { cwd } = req.body;

  if (!cwd) {
    return res.status(400).json({ error: 'Working directory (cwd) is required' });
  }

  // Validate directory exists
  try {
    const stats = fs.statSync(cwd);
    if (!stats.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory' });
    }
  } catch (err) {
    return res.status(400).json({ error: 'Directory does not exist' });
  }

  // Create temporary session ID (will be replaced by SDK session ID on first message)
  const tempSessionId = `session_${Date.now()}`;
  const folderName = path.basename(cwd);

  const sessionData: SessionData = {
    sessionId: tempSessionId,
    cwd,
    name: folderName,
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString()
  };

  sessions.set(tempSessionId, sessionData);
  saveSessions(sessions);

  res.json(sessionData);
});

// Delete session
app.delete('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  if (sessions.has(sessionId)) {
    sessions.delete(sessionId);
    saveSessions(sessions);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Claude Code Chat server running on http://localhost:${PORT}`);
});
