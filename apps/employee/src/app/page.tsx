'use client';

import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Button,
    LinearProgress,
    Chip,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem
} from '@mui/material';
import { StatCard, MiniChart, ActivityItem } from '@repo/ui';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AddIcon from '@mui/icons-material/Add';
import { useSocket } from '@repo/api';

const SOCKET_URL = 'http://localhost:3002';
const USER_ID = 'emp-sarah-johnson'; // Mock user ID

const weeklyHours = [7.5, 8.2, 7.8, 8.0, 6.5, 0, 0, 8.1, 7.9, 8.3, 7.6, 0];
const productivityData = [82, 85, 78, 90, 88, 92, 85, 87, 91, 94, 88, 90];

const todayTasks = [
    { name: 'API endpoint review', project: 'Website Redesign', hours: '2h 15m', status: 'completed' },
    { name: 'Database migration script', project: 'API Migration', hours: '1h 45m', status: 'running' },
    { name: 'Code review PR #234', project: 'Mobile App v2', hours: '0h 30m', status: 'completed' },
    { name: 'Sprint planning prep', project: 'General', hours: '--', status: 'pending' },
];

const recentActivity = [
    { userName: 'You', action: 'checked in at 9:02 AM', time: '3 hours ago', type: 'login' as const },
    { userName: 'You', action: 'started working on "Database migration"', time: '1 hour ago', type: 'time' as const },
    { userName: 'You', action: 'completed "API endpoint review"', time: '45 min ago', type: 'project' as const },
    { userName: 'Mike Chen', action: 'assigned you code review PR #234', time: '2 hours ago', type: 'project' as const },
];

const projects = [
    'Website Redesign',
    'API Migration',
    'Mobile App v2',
    'Analytics Dashboard',
    'General'
];

export default function EmployeeDashboard() {
    const [isTimerRunning, setIsTimerRunning] = React.useState(false);
    const [timerSeconds, setTimerSeconds] = React.useState(16338); // 04:32:18
    const [openLogModal, setOpenLogModal] = React.useState(false);

    const { isConnected, emit, on } = useSocket({
        url: SOCKET_URL,
        userId: USER_ID
    });

    React.useEffect(() => {
        on('session:sync', (data) => {
            if (data.type === 'start') {
                setIsTimerRunning(true);
            } else if (data.type === 'stop') {
                setIsTimerRunning(false);
                if (data.seconds !== undefined) {
                    setTimerSeconds(data.seconds);
                }
            }
        });
    }, [on]);

    React.useEffect(() => {
        let interval: any;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimerSeconds(prev => {
                    const next = prev + 1;
                    // Periodically update productivity/admin
                    if (next % 60 === 0) {
                        emit('productivity:update', { value: 85 + Math.floor(Math.random() * 10) });
                    }
                    return next;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, emit]);

    const handleToggleTimer = () => {
        const nextState = !isTimerRunning;
        setIsTimerRunning(nextState);

        if (nextState) {
            emit('time:start', { projectId: 'Website Redesign', task: 'Database migration script' });
        } else {
            emit('time:stop', { seconds: timerSeconds });
        }
    };

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3.5 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                        Good Morning, Sarah! 👋
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Thursday, February 12, 2026 — You&apos;ve been productive today!
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenLogModal(true)}
                        sx={{
                            color: '#14b8a6',
                            borderColor: '#14b8a6',
                            '&:hover': { borderColor: '#0d9488', bgcolor: '#14b8a610' },
                            borderRadius: '12px',
                            px: 3,
                            py: 1.2,
                            fontWeight: 600,
                            textTransform: 'none'
                        }}
                    >
                        Log Hours
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={isTimerRunning ? <StopRoundedIcon /> : <PlayArrowRoundedIcon />}
                        onClick={handleToggleTimer}
                        sx={{
                            bgcolor: isTimerRunning ? '#f43f5e' : '#14b8a6',
                            '&:hover': { bgcolor: isTimerRunning ? '#e11d48' : '#0d9488' },
                            boxShadow: `0 4px 12px ${isTimerRunning ? 'rgba(244,63,94,0.3)' : 'rgba(20,184,166,0.3)'}`,
                            borderRadius: '12px',
                            px: 3,
                            py: 1.2,
                            fontWeight: 600,
                            textTransform: 'none'
                        }}
                    >
                        {isTimerRunning ? 'Stop Timer' : 'Start Timer'}
                    </Button>
                </Box>
            </Box>

            {/* Timer Card */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: '16px',
                    border: '1px solid rgba(226,232,240,0.8)',
                    background: isTimerRunning
                        ? 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)'
                        : 'linear-gradient(135deg, #f0fdfa 0%, #f0f9ff 100%)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background 0.3s ease'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '16px',
                            background: isTimerRunning
                                ? 'linear-gradient(135deg, #10b981, #14b8a6)'
                                : 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            boxShadow: '0 4px 15px rgba(20,184,166,0.3)',
                            animation: isTimerRunning ? 'pulse 2s infinite' : 'none',
                            '@keyframes pulse': {
                                '0%': { boxShadow: '0 0 0 0 rgba(20,184,166,0.4)' },
                                '70%': { boxShadow: '0 0 0 10px rgba(20,184,166,0)' },
                                '100%': { boxShadow: '0 0 0 0 rgba(20,184,166,0)' }
                            }
                        }}
                    >
                        <AccessTimeIcon sx={{ fontSize: 30 }} />
                    </Box>
                    <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                            {isTimerRunning ? 'Session Active' : 'Last Session'}
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', lineHeight: 1 }}>
                            {formatTime(timerSeconds)}
                        </Typography>
                        <Chip
                            label="Database migration script"
                            size="small"
                            sx={{ mt: 0.5, bgcolor: '#14b8a615', color: '#0d9488', fontWeight: 500, fontSize: '0.72rem' }}
                        />
                    </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>Today&apos;s Total</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#14b8a6' }}>6h 45m</Typography>
                    <LinearProgress
                        variant="determinate"
                        value={84}
                        sx={{
                            mt: 0.5,
                            width: 120,
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#e2e8f0',
                            '& .MuiLinearProgress-bar': { bgcolor: '#14b8a6', borderRadius: 3 },
                        }}
                    />
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem' }}>84% of 8h target</Typography>
                </Box>
            </Paper>

            {/* Stats */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Today's Hours"
                        value="6h 45m"
                        subtitle="84% of target"
                        icon={<AccessTimeIcon sx={{ fontSize: 22 }} />}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="This Week"
                        value="32.4h"
                        subtitle="Target: 40h"
                        icon={<CalendarTodayIcon sx={{ fontSize: 22 }} />}
                        trend={{ value: 5, direction: 'up' }}
                        color="info"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Active Projects"
                        value={4}
                        subtitle="2 tasks due today"
                        icon={<FolderOutlinedIcon sx={{ fontSize: 22 }} />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Streak"
                        value="12 days"
                        subtitle="Keep it up! 🔥"
                        icon={<WhatshotIcon sx={{ fontSize: 22 }} />}
                        trend={{ value: 100, direction: 'up' }}
                        color="warning"
                    />
                </Grid>
            </Grid>

            {/* Content */}
            <Grid container spacing={2.5}>
                {/* Left - Tasks */}
                <Grid item xs={12} lg={8}>
                    <Paper
                        elevation={0}
                        sx={{ borderRadius: '16px', border: '1px solid rgba(226,232,240,0.8)', overflow: 'hidden' }}
                    >
                        <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1e293b' }}>
                                Today&apos;s Tasks
                            </Typography>
                            <Chip label="4 tasks" size="small" sx={{ bgcolor: '#f1f5f9', fontWeight: 600, fontSize: '0.72rem' }} />
                        </Box>
                        {todayTasks.map((task, idx) => (
                            <Box
                                key={idx}
                                sx={{
                                    px: 3,
                                    py: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderBottom: '1px solid #f8fafc',
                                    '&:last-child': { borderBottom: 'none' },
                                    '&:hover': { bgcolor: '#f8fafc' },
                                    transition: 'background 0.15s',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor:
                                                task.status === 'completed' ? '#10b981' :
                                                    task.status === 'running' ? '#14b8a6' : '#94a3b8',
                                            boxShadow: task.status === 'running' ? '0 0 8px rgba(20,184,166,0.5)' : 'none',
                                        }}
                                    />
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                                            {task.name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                                            {task.project}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                                        {task.hours}
                                    </Typography>
                                    <Chip
                                        label={task.status}
                                        size="small"
                                        sx={{
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            bgcolor:
                                                task.status === 'completed' ? '#ecfdf5' :
                                                    task.status === 'running' ? '#f0fdfa' : '#f8fafc',
                                            color:
                                                task.status === 'completed' ? '#059669' :
                                                    task.status === 'running' ? '#0d9488' : '#94a3b8',
                                            borderRadius: '8px',
                                        }}
                                    />
                                </Box>
                            </Box>
                        ))}
                    </Paper>

                    {/* Productivity Chart */}
                    <Paper
                        elevation={0}
                        sx={{
                            mt: 2.5,
                            p: 3,
                            borderRadius: '16px',
                            border: '1px solid rgba(226,232,240,0.8)',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1e293b' }}>
                                Productivity Trend
                            </Typography>
                            <Chip
                                label="Last 12 weeks"
                                size="small"
                                sx={{ bgcolor: '#f1f5f9', fontWeight: 500, fontSize: '0.72rem' }}
                            />
                        </Box>
                        <MiniChart data={productivityData} color="#14b8a6" height={60} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>12 weeks ago</Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>This week</Typography>
                        </Box>
                    </Paper>

                    {/* Assigned Projects */}
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1e293b', mt: 3, mb: 2 }}>
                        My Projects
                    </Typography>
                    <Grid container spacing={2}>
                        {projects.slice(0, 4).map((project, idx) => (
                            <Grid item xs={12} sm={6} key={idx}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        borderRadius: '12px',
                                        border: '1px solid rgba(226,232,240,0.8)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        '&:hover': { bgcolor: '#f8fafc', borderColor: '#14b8a640' },
                                        transition: 'all 0.2s',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '10px',
                                            bgcolor: idx === 0 ? '#14b8a615' : idx === 1 ? '#6366f115' : idx === 2 ? '#0ea5e915' : '#f59e0b15',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: idx === 0 ? '#14b8a6' : idx === 1 ? '#6366f1' : idx === 2 ? '#0ea5e9' : '#f59e0b',
                                        }}
                                    >
                                        <FolderOutlinedIcon sx={{ fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                            {project}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                            Active • 12.5h this week
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>

                {/* Right - Activity + Weekly */}
                <Grid item xs={12} lg={4}>
                    {/* Weekly Summary */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: '16px',
                            border: '1px solid rgba(226,232,240,0.8)',
                            mb: 2.5,
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1e293b', mb: 2 }}>
                            This Week
                        </Typography>
                        <MiniChart data={weeklyHours} color="#14b8a6" height={50} />
                        <Box sx={{ mt: 2 }}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                                <Box
                                    key={day}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        py: 0.8,
                                        borderBottom: '1px solid #f8fafc',
                                        '&:last-child': { borderBottom: 'none' },
                                    }}
                                >
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: i === 2 ? 700 : 400 }}>
                                        {day} {i === 2 && '(Today)'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>
                                        {weeklyHours[i] ? `${weeklyHours[i]}h` : '--'}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>

                    {/* Activity */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: '16px',
                            border: '1px solid rgba(226,232,240,0.8)',
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1e293b', mb: 1 }}>
                            Recent Activity
                        </Typography>
                        {recentActivity.map((activity, idx) => (
                            <ActivityItem key={idx} {...activity} />
                        ))}
                    </Paper>
                </Grid>
            </Grid>

            {/* Log Hours Dialog */}
            <Dialog
                open={openLogModal}
                onClose={() => setOpenLogModal(false)}
                PaperProps={{
                    sx: { borderRadius: '20px', p: 1, maxWidth: '400px', width: '100%' }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>Log Work Hours</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                        Add manual work hours for your assigned projects.
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                            select
                            fullWidth
                            label="Select Project"
                            defaultValue="Website Redesign"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        >
                            {projects.map((option) => (
                                MenuItem ? (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ) : null
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            label="Hours"
                            placeholder="e.g. 2.5"
                            type="number"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            placeholder="What did you work on?"
                            multiline
                            rows={3}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button
                        onClick={() => setOpenLogModal(false)}
                        sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => setOpenLogModal(false)}
                        variant="contained"
                        sx={{
                            bgcolor: '#14b8a6',
                            '&:hover': { bgcolor: '#0d9488' },
                            borderRadius: '10px',
                            px: 3,
                            fontWeight: 600,
                            textTransform: 'none'
                        }}
                    >
                        Save Hours
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
