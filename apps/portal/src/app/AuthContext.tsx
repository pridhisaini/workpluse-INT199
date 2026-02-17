'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type UserRole = 'admin' | 'employee';

export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    organizationId: string;
    department?: string;
    designation?: string;
    phone?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateUser: (updatedUser: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);


const AUTH_STORAGE_KEY = 'workforce_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Load user from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
                const storedToken = localStorage.getItem('token');

                if (storedUser && storedToken) {
                    setUser(JSON.parse(storedUser));
                } else {
                    // Inconsistent state, clear both
                    localStorage.removeItem(AUTH_STORAGE_KEY);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            } catch {
                localStorage.removeItem(AUTH_STORAGE_KEY);
                localStorage.removeItem('token');
                setUser(null);
            }
            setIsLoaded(true);
        }
    }, []);

    // Route protection
    useEffect(() => {
        if (!isLoaded) return;

        const isAuthPage = pathname === '/login';

        if (!user && !isAuthPage) {
            router.replace('/login');
            return;
        }

        if (user && isAuthPage) {
            router.replace(user.role === 'admin' ? '/' : '/employee');
            return;
        }

        const isEmployeeRoute = pathname === '/employee' || pathname.startsWith('/employee/');

        // Prevent employees from accessing admin routes
        if (user && user.role === 'employee' && !isEmployeeRoute && pathname !== '/login') {
            router.replace('/employee');
            return;
        }

        // Prevent admins from accessing employee-only dashboard routes
        if (user && user.role === 'admin' && isEmployeeRoute) {
            router.replace('/');
            return;
        }
    }, [user, pathname, isLoaded, router]);

    const logout = useCallback(() => {
        setUser(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            localStorage.removeItem('token');
        }
        router.push('/login');
    }, [router]);

    // Handle unauthorized event from API client
    useEffect(() => {
        const handleUnauthorized = () => {
            logout();
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('auth:unauthorized', handleUnauthorized);
            return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
        }
    }, [logout]);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (result.success) {
                const { user, tokens } = result.data;
                setUser(user);
                if (typeof window !== 'undefined') {
                    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
                    localStorage.setItem('token', tokens.accessToken);
                }
                return { success: true };
            } else {
                return { success: false, error: result.message || 'Invalid credentials' };
            }
        } catch (error) {
            return { success: false, error: 'Connection to backend failed. Please ensure the server is running.' };
        }
    }, [router]);


    const updateUser = useCallback((updatedData: Partial<AuthUser>) => {
        setUser(prev => {
            if (!prev) return null;
            const newUser = { ...prev, ...updatedData };
            if (typeof window !== 'undefined') {
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
            }
            return newUser;
        });
    }, []);


    // Show nothing until we've loaded auth state from localStorage
    if (!isLoaded) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
