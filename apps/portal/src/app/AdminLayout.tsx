'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ThemeProvider, AppShell } from '@repo/ui';
import { QueryProvider } from '@repo/api';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import type { SidebarItem } from '@repo/ui';
import { AuthProvider, useAuth } from './AuthContext';
import { useApiClient, useUsers, useSocket, useProjects, useAdminStats } from '@repo/api';
import { Snackbar, Alert } from '@mui/material';

const SOCKET_URL = 'http://localhost:5000';

const adminSidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: <DashboardOutlinedIcon sx={{ fontSize: 20 }} />, href: '/' },
    { label: 'Employees', icon: <PeopleOutlineIcon sx={{ fontSize: 20 }} />, href: '/employees' },
    { label: 'Projects', icon: <FolderOutlinedIcon sx={{ fontSize: 20 }} />, href: '/projects' },
    { label: 'Attendance', icon: <EventNoteOutlinedIcon sx={{ fontSize: 20 }} />, href: '/attendance' },
    { label: 'Reports', icon: <BarChartOutlinedIcon sx={{ fontSize: 20 }} />, href: '/reports' },
    { label: 'Settings', icon: <SettingsOutlinedIcon sx={{ fontSize: 20 }} />, href: '/settings' },
];

const employeeSidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: <DashboardOutlinedIcon sx={{ fontSize: 20 }} />, href: '/employee' },
    { label: 'Productivity', icon: <InsightsOutlinedIcon sx={{ fontSize: 20 }} />, href: '/employee/productivity' },
    { label: 'Timesheet', icon: <AccessTimeOutlinedIcon sx={{ fontSize: 20 }} />, href: '/employee/timesheet' },
    { label: 'Projects', icon: <FolderOutlinedIcon sx={{ fontSize: 20 }} />, href: '/employee/projects' },
    { label: 'Attendance', icon: <EventNoteOutlinedIcon sx={{ fontSize: 20 }} />, href: '/employee/attendance' },
    { label: 'Profile', icon: <PersonOutlineIcon sx={{ fontSize: 20 }} />, href: '/employee/profile' },
];

function AppLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout, isAuthenticated } = useAuth();
    const [notification, setNotification] = React.useState<{ message: string; severity: 'info' | 'warning' | 'error' | 'success' } | null>(null);

    const isAuthPage = pathname === '/login';
    const isAdmin = user?.role === 'admin';
    const client = useApiClient();

    // Move all hooks before conditional returns
    const { data: usersData } = useUsers(client, { enabled: isAuthenticated });
    const { data: projectsData } = useProjects(client, { enabled: isAuthenticated && isAdmin });
    const { data: statsData } = useAdminStats(client, { enabled: isAuthenticated && isAdmin });

    // Global Socket for Notifications
    const { on } = useSocket({
        url: SOCKET_URL,
        token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
        userId: user?.id,
        autoConnect: isAuthenticated
    });

    React.useEffect(() => {
        if (!isAdmin || !isAuthenticated) return;

        const handleAlert = (data: any) => {
            setNotification({
                message: data.message || 'New alert received',
                severity: 'warning'
            });
        };

        const handleNotification = (data: any) => {
            setNotification({
                message: data.message || data.title || 'New notification',
                severity: 'info'
            });
        };

        on('INACTIVE_ALERT', handleAlert);
        on('OVERTIME_ALERT', handleAlert);
        on('notification', handleNotification);
    }, [on, isAdmin, isAuthenticated]);

    const sidebarItems = React.useMemo(() => {
        const baseItems = isAdmin ? [...adminSidebarItems] : [...employeeSidebarItems];
        if (isAdmin) {
            // Employees Badge
            if (usersData?.data) {
                const employeesIndex = baseItems.findIndex(item => item.href === '/employees');
                if (employeesIndex > -1) {
                    baseItems[employeesIndex] = {
                        ...baseItems[employeesIndex],
                        badge: usersData.data.length
                    };
                }
            }
            // Projects Badge
            if (projectsData?.data) {
                const projectsIndex = baseItems.findIndex(item => item.href === '/projects');
                if (projectsIndex > -1) {
                    baseItems[projectsIndex] = {
                        ...baseItems[projectsIndex],
                        badge: projectsData.data.length
                    };
                }
            }
            // Attendance/Active Sessions Badge
            if (statsData?.data) {
                const attendanceIndex = baseItems.findIndex(item => item.href === '/attendance');
                if (attendanceIndex > -1) {
                    // For attendance, showing count of active employees might be more useful
                    const activeEmployees = statsData.data.activeEmployees || 0;
                    if (activeEmployees > 0) {
                        baseItems[attendanceIndex] = {
                            ...baseItems[attendanceIndex],
                            badge: activeEmployees
                        };
                    }
                }
            }
        }
        return baseItems;
    }, [isAdmin, usersData, projectsData, statsData]);

    if (isAuthPage || !isAuthenticated) {
        return <>{children}</>;
    }

    const appName = isAdmin ? 'Admin Portal' : 'Employee Portal';
    const userName = user ? `${user.firstName} ${user.lastName}` : 'User';
    const userRole = isAdmin ? 'Administrator' : 'Employee';
    const accentColor = isAdmin ? '#6366f1' : '#14b8a6';

    return (
        <>
            <AppShell
                sidebarItems={sidebarItems}
                appName={appName}
                userName={userName}
                userRole={userRole}
                accentColor={accentColor}
                currentPath={pathname}
                onLogout={logout}
                LinkComponent={Link}
            >
                <div className="page-enter">
                    {children}
                </div>
            </AppShell>

            <Snackbar
                open={!!notification}
                autoHideDuration={6000}
                onClose={() => setNotification(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setNotification(null)}
                    severity={notification?.severity || 'info'}
                    sx={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                >
                    {notification?.message}
                </Alert>
            </Snackbar>
        </>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <QueryProvider baseURL="http://localhost:5000/api">
            <ThemeProvider>
                <AuthProvider>
                    <AppLayoutContent>
                        {children}
                    </AppLayoutContent>
                </AuthProvider>
            </ThemeProvider>
        </QueryProvider>
    );
}
