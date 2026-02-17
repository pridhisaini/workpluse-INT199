'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Grid, Paper, Avatar, LinearProgress, Tab, Tabs } from '@mui/material';
import { StatCard, DataTable, StatusBadge, ActivityItem, MiniChart } from '@repo/ui';
import type { Column } from '@repo/ui';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { Snackbar, Alert } from '@mui/material';

import {
    useSocket,
    useApiClient,
    useUsers,
    useAdminStats,
    useProjects,
    useActivityLogs
} from '@repo/api';
import { useAuth } from '../AuthContext';
import { Attendance, UserStatus, ActivityLog } from '@repo/types';

const SOCKET_URL = 'http://localhost:5000';

export default function AdminDashboard() {
    const { user } = useAuth();
    const client = useApiClient();
    const router = useRouter();
    const [tab, setTab] = useState(0);
    const [alert, setAlert] = useState<{ message: string; severity: 'success' | 'error' | 'info' | 'warning' } | null>(null);

    // Queries
    const { data: employeesResponse, refetch: refetchUsers } = useUsers(client);
    const { data: statsResponse, refetch: refetchStats } = useAdminStats(client);
    const { data: projectsResponse, refetch: refetchProjects } = useProjects(client);
    const { data: activityResponse } = useActivityLogs(client, { limit: 10 });

    const [localEmployees, setLocalEmployees] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const employeesRef = React.useRef(localEmployees);

    React.useEffect(() => {
        employeesRef.current = localEmployees;
    }, [localEmployees]);

    // Socket
    const { isConnected, on } = useSocket({
        url: SOCKET_URL,
        token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
        userId: user?.id
    });

    // Initialize data
    React.useEffect(() => {
        if (activityResponse?.data) {
            setActivities(activityResponse.data.map(log => ({
                userName: log.userName || 'User',
                action: log.action,
                time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: log.type || 'system'
            })));
        }
    }, [activityResponse]);

    React.useEffect(() => {
        if (employeesResponse?.data) {
            setLocalEmployees(employeesResponse.data.map((e: any) => {
                const baseDuration = e.baseStats?.duration || 0;
                const baseActive = e.baseStats?.activeSeconds || 0;
                const currentDuration = e.currentSession?.duration || 0;
                const currentActive = e.currentSession?.activeSeconds || 0;

                const totalDuration = baseDuration + currentDuration;
                const totalActive = baseActive + currentActive;
                const productivity = totalDuration > 0 ? Math.round((totalActive / totalDuration) * 100) : 0;

                const hours = Math.floor(totalDuration / 3600);
                const mins = Math.floor((totalDuration % 3600) / 60);

                const displayStatus = (e.role === 'admin' && e.currentSession?.status === 'inactive')
                    ? 'online'
                    : (e.currentSession?.status === 'inactive' ? 'inactive' : (e.isWorking ? 'online' : 'offline'));

                return {
                    id: e.id,
                    name: `${e.firstName} ${e.lastName}`,
                    department: e.department || 'Engineering',
                    status: displayStatus,
                    hours: `${hours}h ${mins}m`,
                    avatar: e.firstName?.charAt(0) || 'U',
                    productivity: productivity,
                    lastSeen: e.updatedAt,
                    baseDuration,
                    baseActive,
                    rawDuration: currentDuration,
                    rawActive: currentActive
                };
            }));
        }
    }, [employeesResponse]);

    React.useEffect(() => {
        if (statsResponse?.data) {
            setStats(statsResponse.data);
        }
    }, [statsResponse]);

    // Smooth Local Ticker
    React.useEffect(() => {
        const interval = setInterval(() => {
            setLocalEmployees(prev => prev.map(emp => {
                if (emp.status === 'online') {
                    const newRawDuration = (emp.rawDuration || 0) + 1;
                    const newRawActive = (emp.rawActive || 0) + 1;
                    const totalD = (emp.baseDuration || 0) + newRawDuration;
                    const totalA = (emp.baseActive || 0) + newRawActive;

                    return {
                        ...emp,
                        hours: `${Math.floor(totalD / 3600)}h ${Math.floor((totalD % 3600) / 60)}m`,
                        productivity: totalD > 0 ? Math.round((totalA / totalD) * 100) : 0,
                        rawDuration: newRawDuration,
                        rawActive: newRawActive
                    };
                }
                return emp;
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Handle Real-time Updates
    React.useEffect(() => {
        const handleUserOnline = ({ userId }: { userId: string }) => {
            // We ignore socket online event for "Live Status" because user wants 
            // "Online" only when timer is started.
            // But we can refetch stats to be sure
            refetchStats();
        };

        const handleUserOffline = ({ userId }: { userId: string }) => {
            setLocalEmployees(prev => prev.map(emp =>
                emp.id === userId ? { ...emp, status: 'offline' } : emp
            ));
            refetchStats();
        };

        const handleSessionUpdate = (data: any) => {
            if (data.type === 'SESSION_TICK' || data.type === 'SESSION_START') {
                if (data.type === 'SESSION_START') {
                    refetchProjects();
                }
                setLocalEmployees(prev => prev.map(emp => {
                    if (emp.id === data.userId) {
                        const baseDuration = (emp as any).baseDuration || 0;
                        const baseActive = (emp as any).baseActive || 0;
                        const tickDuration = data.duration || 0;
                        const tickActive = data.activeSeconds || 0;

                        const totalDuration = baseDuration + tickDuration;
                        const totalActive = baseActive + tickActive;
                        const productivity = totalDuration > 0 ? Math.round((totalActive / totalDuration) * 100) : 0;

                        const hours = Math.floor(totalDuration / 3600);
                        const mins = Math.floor((totalDuration % 3600) / 60);

                        return {
                            ...emp,
                            status: (emp.role === 'admin' && data.status === 'inactive') ? 'online' : (data.status === 'inactive' ? 'inactive' : 'online'),
                            hours: `${hours}h ${mins}m`,
                            productivity: productivity,
                            rawDuration: tickDuration,
                            rawActive: tickActive
                        };
                    }
                    return emp;
                }));
            } else if (data.type === 'SESSION_STOP') {
                setLocalEmployees(prev => prev.map(emp =>
                    emp.id === data.userId ? { ...emp, status: 'offline' } : emp
                ));
                refetchStats();
                refetchUsers(); // Refresh to update baseDuration
                refetchProjects(); // Refresh project productivity/progress
            }
        };

        const handleStatsUpdate = (data: any) => {
            setStats((prev: any) => ({ ...prev, ...data }));
        };

        const handleAdminNotification = (data: any) => {
            console.log('Admin Notification:', data);
            setAlert({ message: data.message, severity: data.type === 'AUTO_CHECKOUT' ? 'warning' : 'info' });

            // Push to activity feed
            const emp = employeesRef.current.find(e => e.id === data.userId);
            setActivities(prev => [{
                userName: emp?.name || 'Employee',
                action: data.message,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: data.type === 'AUTO_CHECKOUT' ? 'system' : 'time'
            }, ...prev].slice(0, 10));

            refetchStats();
        };

        const handleSessionStartStop = (data: any) => {
            const emp = employeesRef.current.find(e => e.id === data.userId);
            if (data.type === 'SESSION_START' || data.type === 'SESSION_STOP') {
                setActivities(prev => [{
                    userName: emp?.name || 'Employee',
                    action: data.type === 'SESSION_START' ? 'started work session' : 'stopped work session',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    type: 'time'
                }, ...prev].slice(0, 10));
            }
        };

        on('USER_ONLINE', handleUserOnline);
        on('USER_OFFLINE', handleUserOffline);
        on('SESSION_UPDATE', (data) => {
            handleSessionUpdate(data);
            handleSessionStartStop(data);
        });
        on('dashboard:stats-update', handleStatsUpdate);
        on('ADMIN_NOTIFICATION', handleAdminNotification);
    }, [on, refetchStats, refetchUsers, refetchProjects]);

    const hourlyProductivity = [45, 52, 68, 85, 92, 88, 75, 82, 94, 91, 78, 84, 89, 72, 65, 50, 42, 35, 20, 15, 10, 5, 2, 0];
    const dailyProductivity = [82, 85, 78, 92, 88, 75, 40];

    const columns: Column<any>[] = [
        {
            key: 'name',
            label: 'Employee',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366f1', fontSize: '0.8rem', fontWeight: 600 }}>
                        {row.avatar}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>
                            {row.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                            {row.department}
                        </Typography>
                    </Box>
                </Box>
            ),
        },
        {
            key: 'status',
            label: 'Live Status',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                        width: 8, height: 8, borderRadius: '50%',
                        bgcolor: row.status === 'online' ? '#10b981' : row.status === 'inactive' ? '#f59e0b' : '#94a3b8',
                        boxShadow: row.status === 'online' ? '0 0 8px #10b981' : row.status === 'inactive' ? '0 0 8px #f59e0b' : 'none'
                    }} />
                    <StatusBadge status={row.status} />
                </Box>
            ),
        },
        {
            key: 'productivity',
            label: 'Productivity',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 60 }}>
                        <LinearProgress
                            variant="determinate"
                            value={row.productivity}
                            sx={{
                                height: 6, borderRadius: 3, bgcolor: '#f1f5f9',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: row.productivity > 85 ? '#10b981' : row.productivity > 70 ? '#6366f1' : '#f59e0b'
                                }
                            }}
                        />
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                        {row.productivity}%
                    </Typography>
                </Box>
            )
        },
        { key: 'hours', label: "Today's Hours", align: 'right' },
    ];


    const activeCount = localEmployees.filter(e => e.status === 'online').length;
    const workingCount = localEmployees.filter(e => e.status === 'online').length;

    // Derived Real-time Stats
    const totalDAll = localEmployees.reduce((acc, e) => acc + (e.baseDuration || 0) + (e.rawDuration || 0), 0);
    const totalAAll = localEmployees.reduce((acc, e) => acc + (e.baseActive || 0) + (e.rawActive || 0), 0);
    const displayProductivity = totalDAll > 0 ? Math.round((totalAAll / totalDAll) * 100) : 0;
    const displayTotalHours = (totalDAll / 3600).toFixed(1);
    const displayAvgHours = (totalDAll / (localEmployees.length || 1) / 3600).toFixed(1);

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 3.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                        Overview
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Workforce performance and real-time status
                    </Typography>
                </Box>
                <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', p: 0.5, borderRadius: '10px' }}>
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        sx={{
                            minHeight: 0,
                            '& .MuiTabs-indicator': { display: 'none' },
                            '& .MuiTab-root': {
                                minHeight: 32,
                                py: 0.5,
                                px: 2,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                borderRadius: '8px',
                                color: '#64748b',
                                '&.Mui-selected': { bgcolor: '#f1f5f9', color: '#1e293b' }
                            }
                        }}
                    >
                        <Tab label="Today" />
                        <Tab label="Week" />
                    </Tabs>
                </Paper>
            </Box>

            {/* Stat Cards */}
            <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Employees"
                        value={stats?.totalEmployees || localEmployees.length}
                        subtitle="vs last month"
                        icon={<PeopleOutlineIcon sx={{ fontSize: 22 }} />}
                        trend={{ value: 12, direction: 'up' }}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Active Now"
                        value={stats?.activeEmployees ?? activeCount}
                        subtitle={`${Math.round(((stats?.activeEmployees ?? activeCount) / (stats?.totalEmployees || localEmployees.length || 1)) * 100)}% of workforce`}
                        icon={<EventAvailableIcon sx={{ fontSize: 22 }} />}
                        trend={{ value: 4, direction: 'up' }}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Productivity Score"
                        value={`${displayProductivity}%`}
                        subtitle="Target: 95%"
                        icon={<TrendingUpIcon sx={{ fontSize: 22 }} />}
                        trend={{ value: 2.1, direction: 'up' }}
                        color="info"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Working Active"
                        value={stats?.activeEmployees ?? workingCount}
                        subtitle="Employees with active timers"
                        icon={<AccessTimeIcon sx={{ fontSize: 22 }} />}
                        trend={{ value: 15, direction: 'up' }}
                        color="warning"
                    />
                </Grid>
            </Grid>

            {/* Main Content */}
            <Grid container spacing={2.5}>
                {/* Left - Productivity & Projects */}
                <Grid item xs={12} lg={8}>
                    {/* Productivity Chart */}
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: '16px',
                            border: '1px solid rgba(226,232,240,0.8)',
                            p: 3,
                            mb: 2.5,
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1e293b' }}>
                                    Productivity Trend
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                    Average team efficiency over time
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                            <MiniChart
                                data={tab === 0 ? hourlyProductivity : dailyProductivity}
                                color="#6366f1"
                                height={180}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: '1px solid #f1f5f9' }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>{displayAvgHours}h</Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>Avg Active Time</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>{displayProductivity}%</Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>Avg Efficiency</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>{workingCount}</Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>Active Sessions</Typography>
                            </Box>
                        </Box>
                    </Paper>

                    <DataTable
                        title="Employee Status"
                        columns={columns}
                        data={localEmployees}
                    />
                </Grid>

                {/* Right - Activity Feed + Quick View */}
                <Grid item xs={12} lg={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: '16px',
                            border: '1px solid rgba(226,232,240,0.8)',
                            p: 3,
                            mb: 2.5,
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1e293b', mb: 2.5 }}>
                            Active Projects
                        </Typography>
                        {(projectsResponse?.data?.filter(p => p.status === 'active') || []).slice(0, 5).map((project, idx) => {
                            const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];
                            return (
                                <Box key={project.id} sx={{ mb: 2.5, '&:last-child': { mb: 0 } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                                            {project.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                            <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 600 }}>
                                                {(project as any).productivity || 0}% Prod
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                                                {project.progress}% Done
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={project.progress}
                                        sx={{
                                            height: 6,
                                            borderRadius: 3,
                                            bgcolor: '#f1f5f9',
                                            '& .MuiLinearProgress-bar': { bgcolor: colors[idx % colors.length], borderRadius: 3 },
                                        }}
                                    />
                                </Box>
                            );
                        })}
                        {(!projectsResponse?.data || projectsResponse.data.filter(p => p.status === 'active').length === 0) && (
                            <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', py: 2 }}>
                                No active projects
                            </Typography>
                        )}
                    </Paper>

                    {/* Activity Feed */}
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: '16px',
                            border: '1px solid rgba(226,232,240,0.8)',
                            p: 3,
                            mb: 2.5,
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1e293b', mb: 1.5 }}>
                            Real-time Activity
                        </Typography>
                        {activities.map((activity, idx) => (
                            <ActivityItem key={idx} {...activity} />
                        ))}
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            color: '#fff',
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: '1.1rem' }}>
                            Need Insights?
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 2, fontSize: '0.85rem' }}>
                            Generate detailed reports for specific teams or custom time periods.
                        </Typography>
                        <Box
                            component="button"
                            onClick={() => router.push('/reports')}
                            sx={{
                                width: '100%',
                                py: 1.2,
                                borderRadius: '8px',
                                border: 'none',
                                bgcolor: 'rgba(255,255,255,0.15)',
                                color: '#fff',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: '0.2s',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                            }}
                        >
                            View Reports
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar
                open={!!alert}
                autoHideDuration={6000}
                onClose={() => setAlert(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={alert?.severity || 'info'} onClose={() => setAlert(null)} sx={{ width: '100%', borderRadius: '12px' }}>
                    {alert?.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
