'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider, AppShell } from '@repo/ui';
import { QueryProvider, useLogoutUtility } from '@repo/api';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import type { SidebarItem } from '@repo/ui';

const sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: <DashboardOutlinedIcon sx={{ fontSize: 20 }} />, href: '/' },
    { label: 'Productivity', icon: <InsightsOutlinedIcon sx={{ fontSize: 20 }} />, href: '/productivity' },
    { label: 'Timesheet', icon: <AccessTimeOutlinedIcon sx={{ fontSize: 20 }} />, href: '/timesheet' },
    { label: 'Projects', icon: <FolderOutlinedIcon sx={{ fontSize: 20 }} />, href: '/projects' },
    { label: 'Attendance', icon: <EventNoteOutlinedIcon sx={{ fontSize: 20 }} />, href: '/attendance' },
    { label: 'Profile', icon: <PersonOutlineIcon sx={{ fontSize: 20 }} />, href: '/profile' },
];

export function EmployeeLayoutContent({ children, sidebarItems }: { children: React.ReactNode, sidebarItems: SidebarItem[] }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';
    const logout = useLogoutUtility();

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <AppShell
            sidebarItems={sidebarItems}
            appName="Employee Portal"
            userName="Sarah Johnson"
            userRole="Sr. Developer"
            accentColor="#14b8a6"
            currentPath={pathname}
            onLogout={logout}
        >
            <div className="page-enter">
                {children}
            </div>
        </AppShell>
    );
}

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    return (
        <QueryProvider>
            <ThemeProvider>
                <EmployeeLayoutContent sidebarItems={sidebarItems}>
                    {children}
                </EmployeeLayoutContent>
            </ThemeProvider>
        </QueryProvider>
    );
}
