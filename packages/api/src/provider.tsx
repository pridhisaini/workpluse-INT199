'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createApiClient } from './client';
import { AxiosInstance } from 'axios';

const ApiClientContext = createContext<AxiosInstance | null>(null);

export function useApiClient() {
    const context = useContext(ApiClientContext);
    if (!context) {
        throw new Error('useApiClient must be used within an ApiClientProvider');
    }
    return context;
}

export function useLogoutUtility() {
    return () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    };
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

interface QueryProviderProps {
    children: React.ReactNode;
    baseURL?: string;
}

export function QueryProvider({ children, baseURL = 'http://localhost:3001' }: QueryProviderProps) {
    const client = useMemo(() => createApiClient({
        baseURL,
        getToken: () => {
            if (typeof window !== 'undefined') {
                return localStorage.getItem('token');
            }
            return null;
        }
    }), [baseURL]);

    return (
        <ApiClientContext.Provider value={client}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </ApiClientContext.Provider>
    );
}
