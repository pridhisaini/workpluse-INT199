import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import prisma from './utils/prisma';
import routes from './routes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // For development ease
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api', routes);

// Socket.IO Logic
interface UserSession {
    userId: string;
    socketId: string;
    status: 'active' | 'inactive';
    lastActivity: number;
}

const onlineUsers = new Map<string, UserSession>();

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId as string;

    console.log('A user connected:', socket.id, 'User ID:', userId);

    if (userId) {
        onlineUsers.set(userId, {
            userId,
            socketId: socket.id,
            status: 'active',
            lastActivity: Date.now()
        });
        io.emit('user:status-change', { userId, status: 'active' });
    }

    socket.on('time:start', (data) => {
        console.log(`Timer started by ${userId}`, data);
        socket.broadcast.emit('session:sync', { type: 'start', ...data });
        io.emit('time:tick', { userId, duration: 0 });
    });

    socket.on('time:stop', (data) => {
        console.log(`Timer stopped by ${userId}`, data);
        socket.broadcast.emit('session:sync', { type: 'stop', ...data });
    });

    socket.on('productivity:update', (data) => {
        io.emit('dashboard:stats-update', {
            userId,
            productivity: data.value
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (userId) {
            onlineUsers.delete(userId);
            io.emit('user:status-change', { userId, status: 'inactive' });
        }
    });
});

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});

export { io, prisma };
