'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@repo/types';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseSocketOptions {
    url: string;
    token?: string | null;
    userId?: string;
    autoConnect?: boolean;
}

interface UseSocketReturn {
    socket: TypedSocket | null;
    isConnected: boolean;
    connect: () => void;
    disconnect: () => void;
    emit: <K extends keyof ClientToServerEvents>(
        event: K,
        ...args: Parameters<ClientToServerEvents[K]>
    ) => void;
    on: <K extends keyof ServerToClientEvents>(
        event: K,
        callback: ServerToClientEvents[K]
    ) => void;
    off: <K extends keyof ServerToClientEvents>(
        event: K,
        callback?: ServerToClientEvents[K]
    ) => void;
}

export function useSocket({ url, token, userId, autoConnect = true }: UseSocketOptions): UseSocketReturn {
    const socketRef = useRef<TypedSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const connect = useCallback(() => {
        if (socketRef.current?.connected) return;

        const socket = io(url, {
            auth: token ? { token } : undefined,
            query: userId ? { userId } : undefined,
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
            randomizationFactor: 0.5,
        }) as TypedSocket;

        socket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
        });

        socketRef.current = socket;
    }, [url, token, userId]);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        }
    }, []);

    const emit = useCallback<UseSocketReturn['emit']>((event, ...args) => {
        socketRef.current?.emit(event, ...args);
    }, []);

    const on = useCallback<UseSocketReturn['on']>((event, callback) => {
        socketRef.current?.on(event as any, callback as any);
    }, []);

    const off = useCallback<UseSocketReturn['off']>((event, callback) => {
        socketRef.current?.off(event as any, callback as any);
    }, []);

    useEffect(() => {
        if (autoConnect) {
            connect();
        }
        return () => {
            disconnect();
        };
    }, [autoConnect, connect, disconnect]);

    return {
        socket: socketRef.current,
        isConnected,
        connect,
        disconnect,
        emit,
        on,
        off,
    };
}
