import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

interface UserSession {
  userId: string;
  socketId: string;
  status: 'active' | 'inactive';
  lastActivity: number;
}

const onlineUsers = new Map<string, UserSession>();

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId as string;
  if (!userId) {
    socket.disconnect();
    return;
  }

  console.log(`User connected: ${userId}`);
  
  onlineUsers.set(userId, {
    userId,
    socketId: socket.id,
    status: 'active',
    lastActivity: Date.now()
  });

  // Broadcast status change
  io.emit('user:status-change', { userId, status: 'active' });

  socket.on('time:start', (data) => {
    console.log(`Timer started by ${userId}`, data);
    // Sync to other tabs of the same user
    socket.broadcast.emit('session:sync', { type: 'start', ...data });
    // Update admin
    io.emit('time:tick', { userId, duration: 0 }); // Just a signal
  });

  socket.on('time:stop', (data) => {
    console.log(`Timer stopped by ${userId}`, data);
    socket.broadcast.emit('session:sync', { type: 'stop', ...data });
  });

  socket.on('productivity:update', (data) => {
    // Broadcast productivity to admins
    io.emit('dashboard:stats-update', { 
        userId, 
        productivity: data.value 
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId}`);
    onlineUsers.delete(userId);
    io.emit('user:status-change', { userId, status: 'inactive' });
  });
});

const PORT = 3002;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
