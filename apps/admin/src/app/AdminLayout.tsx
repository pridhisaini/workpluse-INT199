'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider, AppShell } from '@repo/ui';
import { QueryProvider, useLogoutUtility } from '@repo/api';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import type { SidebarItem } from '@repo/ui';

const sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: <DashboardOutlinedIcon sx={{ fontSize: 20 }} />, href: '/' },
    { label: 'Employees', icon: <PeopleOutlineIcon sx={{ fontSize: 20 }} />, href: '/employees', badge: 24 },
    { label: 'Projects', icon: <FolderOutlinedIcon sx={{ fontSize: 20 }} />, href: '/projects' },
    { label: 'Attendance', icon: <EventNoteOutlinedIcon sx={{ fontSize: 20 }} />, href: '/attendance' },
    { label: 'Reports', icon: <BarChartOutlinedIcon sx={{ fontSize: 20 }} />, href: '/reports' },
    { label: 'Settings', icon: <SettingsOutlinedIcon sx={{ fontSize: 20 }} />, href: '/settings' },
];

export function AdminLayoutContent({ children, sidebarItems }: { children: React.ReactNode, sidebarItems: SidebarItem[] }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';
    const logout = useLogoutUtility();

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <AppShell
            sidebarItems={sidebarItems}
            appName="Admin Portal"
            userName="Admin User"
            userRole="Administrator"
            accentColor="#6366f1"
            currentPath={pathname}
            onLogout={logout}
        >
            <div className="page-enter">
                {children}
            </div>
        </AppShell>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <QueryProvider>
            <ThemeProvider>
                <AdminLayoutContent sidebarItems={sidebarItems}>
                    {children}
                </AdminLayoutContent>
            </ThemeProvider>
        </QueryProvider>
    );
}
