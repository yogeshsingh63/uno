import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { registerSocketHandlers } from './socket/handlers';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// Socket.io setup
const io = new Server(server, {
  cors: { origin: CORS_ORIGIN, methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`🃏 UNO Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});
