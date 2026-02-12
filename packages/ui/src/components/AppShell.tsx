'use client';

import React, { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import type { SidebarItem } from '../types';

interface AppShellProps {
    children: React.ReactNode;
    sidebarItems: SidebarItem[];
    appName: string;
    appLogo?: React.ReactNode;
    userName?: string;
    userRole?: string;
    userAvatar?: string;
    accentColor?: string;
    currentPath?: string;
    onLogout?: () => void;
}

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 72;

export default function AppShell({
    children,
    sidebarItems,
    appName,
    appLogo,
    userName = 'User',
    userRole = 'Member',
    userAvatar,
    accentColor = '#6366f1',
    currentPath = '/',
    onLogout,
}: AppShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
            <Sidebar
                items={sidebarItems}
                appName={appName}
                appLogo={appLogo}
                open={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                width={SIDEBAR_WIDTH}
                collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
                accentColor={accentColor}
                currentPath={currentPath}
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    ml: `${sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH}px`,
                    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    minHeight: '100vh',
                }}
            >
                <TopBar
                    userName={userName}
                    userRole={userRole}
                    userAvatar={userAvatar}
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                    onLogout={onLogout}
                />
                <Box
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        overflow: 'auto',
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
