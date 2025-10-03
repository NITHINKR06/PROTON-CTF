import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import authRoutes from './routes/auth.js';
import challengeRoutes from './routes/challenge.js';
import scoreboardRoutes from './routes/scoreboard.js';
import adminRoutes from './routes/admin.js';
import adminFlagRoutes from './routes/adminFlag.js';
import { mainDb } from './config/database.js';
import { globalLimiter } from './middleware/rateLimiter.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const PORT = process.env.PORT || 5000;

// Middleware
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(globalLimiter);

// Trust proxy
app.set('trust proxy', 1);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/challenge', challengeRoutes);
app.use('/api/scoreboard', scoreboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminFlagRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString()
  });
});

// WebSocket for real-time scoreboard
const wsClients = new Set();

wss.on('connection', (ws) => {
  wsClients.add(ws);
  console.log(`WebSocket client connected (Total: ${wsClients.size})`);

  sendScoreboard(ws);

  ws.on('close', () => {
    wsClients.delete(ws);
    console.log(`WebSocket client disconnected (Total: ${wsClients.size})`);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    wsClients.delete(ws);
  });
});

function sendScoreboard(ws: any) {
  try {
    const stmt = mainDb.prepare(`
      SELECT 
        u.username,
        s.points,
        s.solved_at
      FROM scores s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.points DESC, s.solved_at ASC
      LIMIT 100
    `);

    const scores = stmt.all() as any[];

    const scoreboard = scores.map((score, index) => ({
      rank: index + 1,
      username: score.username,
      points: score.points,
      solvedAt: score.solved_at,
    }));

    if (ws.readyState === 1) {
      ws.send(JSON.stringify({
        type: 'scoreboard_update',
        data: scoreboard,
      }));
    }
  } catch (error) {
    console.error('Failed to send scoreboard:', error);
  }
}

function broadcastScoreboard() {
  wsClients.forEach((client) => {
    sendScoreboard(client);
  });
}

// Broadcast scoreboard updates every 10 seconds
setInterval(broadcastScoreboard, 10000);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 WebSocket server running on ws://localhost:${PORT}/ws`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    mainDb.close();
    process.exit(0);
  });
});