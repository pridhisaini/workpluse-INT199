import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, []);

    const emit = (event: string, data: any) => {
        socketRef.current?.emit(event, data);
    };

    const subscribe = (event: string, callback: (data: any) => void) => {
        socketRef.current?.on(event, callback);
    };

    const unsubscribe = (event: string, callback: (data: any) => void) => {
        socketRef.current?.off(event, callback);
    };

    return { socket: socketRef.current, isConnected, emit, subscribe, unsubscribe };
};
