import express from 'express';
import { query, type SDKMessage } from '@anthropic-ai/claude-agent-sdk';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Enable CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Store active sessions
const sessions = new Map<string, string>();

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

  try {
    const options: any = {
      cwd: process.cwd(),
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep', 'WebSearch', 'WebFetch', 'TodoWrite'],
      maxTurns: 10,
    };

    // Resume session if provided
    if (sessionId && sessions.has(sessionId)) {
      options.resume = sessions.get(sessionId);
    }

    let currentSessionId = '';
    let fullResponse = '';

    for await (const msg of query({ prompt: message, options })) {
      const sdkMsg = msg as SDKMessage;

      // Capture session ID from system message
      if (sdkMsg.type === 'system' && 'session_id' in sdkMsg) {
        currentSessionId = sdkMsg.session_id;
        res.write(`data: ${JSON.stringify({ type: 'session', sessionId: currentSessionId, cwd: process.cwd() })}\n\n`);
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

        // Store session for continuation
        if (currentSessionId) {
          sessions.set(currentSessionId, currentSessionId);
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

app.listen(PORT, () => {
  console.log(`🚀 Claude Code Chat server running on http://localhost:${PORT}`);
});
