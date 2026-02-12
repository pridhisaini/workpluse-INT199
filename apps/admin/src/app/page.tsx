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
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { useSocket } from '@repo/api';

const SOCKET_URL = 'http://localhost:3002';
const ADMIN_ID = 'admin-1';

// Enhanced Mock data
const recentEmployees: Record<string, unknown>[] = [
    { name: 'Sarah Johnson', department: 'Engineering', status: 'active', hours: '7h 45m', avatar: 'S', productivity: 94 },
    { name: 'Mike Chen', department: 'Design', status: 'active', hours: '8h 12m', avatar: 'M', productivity: 88 },
    { name: 'Emily Davis', department: 'Marketing', status: 'late', hours: '5h 30m', avatar: 'E', productivity: 72 },
    { name: 'James Wilson', department: 'Engineering', status: 'active', hours: '7h 58m', avatar: 'J', productivity: 91 },
    { name: 'Priya Patel', department: 'Product', status: 'absent', hours: '0h 00m', avatar: 'P', productivity: 0 },
    { name: 'Alex Thompson', department: 'Engineering', status: 'active', hours: '6h 20m', avatar: 'A', productivity: 85 },
];

const columns: Column<Record<string, unknown>>[] = [
    {
        key: 'name',
        label: 'Employee',
        render: (row) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366f1', fontSize: '0.8rem', fontWeight: 600 }}>
                    {String(row.avatar)}
                </Avatar>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>
                        {String(row.name)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                        {String(row.department)}
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
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: row.status === 'active' ? '#10b981' : row.status === 'late' ? '#f59e0b' : '#94a3b8' }} />
                <StatusBadge status={String(row.status)} />
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
                        value={Number(row.productivity)}
                        sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#f1f5f9',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: Number(row.productivity) > 85 ? '#10b981' : Number(row.productivity) > 70 ? '#6366f1' : '#f59e0b'
                            }
                        }}
                    />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                    {String(row.productivity)}%
                </Typography>
            </Box>
        )
    },
    { key: 'hours', label: "Today's Hours", align: 'right' },
];

const activities = [
    { userName: 'Sarah Johnson', action: 'checked in at 9:02 AM', time: '2 min ago', type: 'login' as const },
    { userName: 'Mike Chen', action: 'completed task "UI Redesign"', time: '15 min ago', type: 'project' as const },
    { userName: 'Emily Davis', action: 'logged 3.5 hours on Project Alpha', time: '1 hour ago', type: 'time' as const },
    { userName: 'System', action: 'Daily attendance report generated', time: '2 hours ago', type: 'system' as const },
];

const hourlyProductivity = [45, 52, 68, 85, 92, 88, 75, 82, 94, 91, 78, 84, 89, 72, 65, 50, 42, 35, 20, 15, 10, 5, 2, 0];
const dailyProductivity = [82, 85, 78, 92, 88, 75, 40]; // Last 7 days

export default function AdminDashboard() {
    const [employees, setEmployees] = useState(recentEmployees);
    const [activeCount, setActiveCount] = useState(184);
    const [tab, setTab] = useState(0);
    const router = useRouter();

    const { on } = useSocket({
        url: SOCKET_URL,
        userId: ADMIN_ID
    });

    React.useEffect(() => {
        on('user:status-change', ({ userId, status }) => {
            setEmployees(prev => prev.map(emp => {
                // Mapping mock IDs for demo
                const isSarah = userId === 'emp-sarah-johnson' && emp.name === 'Sarah Johnson';
                if (isSarah) {
                    return { ...emp, status: status === 'active' ? 'active' : 'inactive' };
                }
                return emp;
            }));

            if (status === 'active') setActiveCount(prev => prev + 1);
            else setActiveCount(prev => Math.max(0, prev - 1));
        });

        on('dashboard:stats-update', (data) => {
            if (data.userId === 'emp-sarah-johnson' && data.productivity) {
                setEmployees(prev => prev.map(emp =>
                    emp.name === 'Sarah Johnson' ? { ...emp, productivity: data.productivity } : emp
                ));
            }
        });
    }, [on]);

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
                        value={248}
                        subtitle="vs last month"
                        icon={<PeopleOutlineIcon sx={{ fontSize: 22 }} />}
                        trend={{ value: 12, direction: 'up' }}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Active Now"
                        value={activeCount}
                        subtitle={`${Math.round((activeCount / 248) * 100)}% of workforce`}
                        icon={<EventAvailableIcon sx={{ fontSize: 22 }} />}
                        trend={{ value: 4, direction: 'up' }}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Productivity Score"
                        value="92.4%"
                        subtitle="Target: 95%"
                        icon={<TrendingUpIcon sx={{ fontSize: 22 }} />}
                        trend={{ value: 2.1, direction: 'up' }}
                        color="info"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Late Arrivals"
                        value={12}
                        subtitle="vs 18 yesterday"
                        icon={<AccessTimeIcon sx={{ fontSize: 22 }} />}
                        trend={{ value: 15, direction: 'down' }}
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
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>8h 22m</Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>Avg Active Time</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>94%</Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>Peak Efficiency</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>12%</Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>Idle Time</Typography>
                            </Box>
                        </Box>
                    </Paper>

                    <DataTable
                        title="Employee Status"
                        columns={columns}
                        data={employees}
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
                        {[
                            { name: 'Website Redesign', progress: 78, color: '#6366f1' },
                            { name: 'Mobile App v2', progress: 45, color: '#0ea5e9' },
                            { name: 'API Migration', progress: 92, color: '#10b981' },
                        ].map((project) => (
                            <Box key={project.name} sx={{ mb: 2.5, '&:last-child': { mb: 0 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                                        {project.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                                        {project.progress}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={project.progress}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: '#f1f5f9',
                                        '& .MuiLinearProgress-bar': { bgcolor: project.color, borderRadius: 3 },
                                    }}
                                />
                            </Box>
                        ))}
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
        </Box>
    );
}
