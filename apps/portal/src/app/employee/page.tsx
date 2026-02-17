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
    MenuItem,
    Snackbar,
    Alert
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
import {
    useSocket,
    useApiClient,
    useCurrentSession,
    useStartSession,
    useStopSession,
    useLogManualSession,
    useEmployeeProjects,
    useEmployeeStats,
    useEmployeeActivityLogs,
    useProductivityReport
} from '@repo/api';
import { useAuth } from '../AuthContext';
import { Project } from '@repo/types';

const SOCKET_URL = 'http://localhost:5000';

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const client = useApiClient();
    const [isTimerRunning, setIsTimerRunning] = React.useState(false);
    const [timerSeconds, setTimerSeconds] = React.useState(0);
    const [activeSession, setActiveSession] = React.useState<any>(null);
    const [openLogModal, setOpenLogModal] = React.useState(false);
    const [selectedProjectId, setSelectedProjectId] = React.useState<string>('');
    const [taskName, setTaskName] = React.useState('Daily Development');
    const [alert, setAlert] = React.useState<{ message: string; severity: 'info' | 'warning' | 'error' | 'success' } | null>(null);

    // Initial date range for reports (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    // Manual Log State
    const [manualLogData, setManualLogData] = React.useState({
        projectId: '',
        task: '',
        startTime: '',
        endTime: '',
        description: ''
    });

    // Queries & Mutations
    const { data: projectsResponse } = useEmployeeProjects(client, user?.id || '');
    const projects = projectsResponse?.data || [];

    const { data: currentSessionResponse, refetch: refetchCurrent } = useCurrentSession(client);
    const { data: statsResponse, refetch: refetchStats } = useEmployeeStats(client, user?.id || '');
    const { data: activityLogsResponse, refetch: refetchLogs } = useEmployeeActivityLogs(client, user?.id || '');
    const { data: productivityData, refetch: refetchTrend } = useProductivityReport(client, { startDate, endDate, userId: user?.id });

    const startSession = useStartSession(client);
    const stopSession = useStopSession(client);
    const logManual = useLogManualSession(client);

    const stats = statsResponse?.data;
    const logs = activityLogsResponse?.data || [];
    const trendData = productivityData?.data?.data || [0, 0, 0, 0, 0, 0, 0];

    const refreshAll = React.useCallback(() => {
        refetchCurrent();
        refetchStats();
        refetchLogs();
        refetchTrend();
    }, [refetchCurrent, refetchStats, refetchLogs, refetchTrend]);

    // Socket
    const { on, emit, isConnected } = useSocket({
        url: SOCKET_URL,
        token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
        userId: user?.id
    });

    // Activity Tracking
    React.useEffect(() => {
        if (!isTimerRunning || !isConnected || !emit) return;

        let lastPing = 0;
        const PING_INTERVAL = 30000; // 30 seconds

        const handleActivity = () => {
            const now = Date.now();
            if (now - lastPing > PING_INTERVAL) {
                lastPing = now;
                emit('activity:ping');
                console.log('Activity ping sent');
            }
        };

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('click', handleActivity);
        window.addEventListener('scroll', handleActivity);

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('scroll', handleActivity);
        };
    }, [isTimerRunning, isConnected, emit]);

    // Initialize from existing session
    React.useEffect(() => {
        if (currentSessionResponse?.data) {
            const session = currentSessionResponse.data;
            setActiveSession(session);
            setIsTimerRunning(true);
            setTimerSeconds(session.duration || 0);
            setSelectedProjectId(session.projectId || '');
            setTaskName(session.task || 'Daily Development');
        } else {
            setIsTimerRunning(false);
            setActiveSession(null);
            setTimerSeconds(0);
        }
    }, [currentSessionResponse]);

    // Local Smooth Timer Ticker
    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimerSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isTimerRunning]);

    // Handle Socket Events
    React.useEffect(() => {
        const handleSessionUpdate = (data: any) => {
            if (data.userId !== user?.id) return;

            if (data.type === 'SESSION_TICK') {
                setTimerSeconds(data.duration);
            } else if (data.type === 'SESSION_STOP' || data.type === 'SESSION_START') {
                refreshAll();
            }
        };

        const handleSync = (data: any) => {
            if (data.session && data.session.userId === user?.id) {
                setActiveSession(data.session);
                setIsTimerRunning(true);
                setTimerSeconds(data.session.duration || 0);
            }
        };

        const handleAlert = (data: any) => {
            setAlert({ message: data.message, severity: 'warning' });
        };

        on('SESSION_UPDATE', handleSessionUpdate);
        on('SESSION_SYNC', handleSync);
        on('INACTIVE_ALERT', handleAlert);
        on('OVERTIME_ALERT', handleAlert);

        return () => { };
    }, [on, user?.id, refreshAll]);

    const handleToggleTimer = async () => {
        if (!isTimerRunning) {
            if (!selectedProjectId) {
                setAlert({ message: 'Please select a project first', severity: 'error' });
                return;
            }
            try {
                await startSession.mutateAsync({
                    projectId: selectedProjectId,
                    task: taskName || 'Development'
                });
                setAlert({ message: 'Session started!', severity: 'success' });
            } catch (err: any) {
                setAlert({ message: err.message || 'Failed to start session', severity: 'error' });
            }
        } else {
            const sid = activeSession?.id;
            if (!sid) return;
            try {
                await stopSession.mutateAsync({ id: sid });
                setAlert({ message: 'Session stopped.', severity: 'info' });
            } catch (err: any) {
                setAlert({ message: err.message || 'Failed to stop session', severity: 'error' });
            }
        }
    };

    const handleManualLogSubmit = async () => {
        if (!manualLogData.projectId || !manualLogData.task || !manualLogData.startTime || !manualLogData.endTime) {
            setAlert({ message: 'Please fill in all required fields', severity: 'error' });
            return;
        }

        try {
            const start = new Date(manualLogData.startTime);
            const end = new Date(manualLogData.endTime);

            if (end <= start) {
                setAlert({ message: 'End time must be after start time', severity: 'error' });
                return;
            }

            const payload = {
                ...manualLogData,
                startTime: start.toISOString(),
                endTime: end.toISOString()
            };

            await logManual.mutateAsync(payload);
            setAlert({ message: 'Manual log saved successfully!', severity: 'success' });
            setOpenLogModal(false);
            setManualLogData({ projectId: '', task: '', startTime: '', endTime: '', description: '' });
            refreshAll();
        } catch (err: any) {
            const errorMsg = err.response?.data?.message?.[0] || err.response?.data?.message || err.message || 'Failed to save manual log';
            setAlert({ message: errorMsg, severity: 'error' });
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
                        Welcome back, {user?.firstName || 'Employee'}! 👋
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenLogModal(true)}
                        sx={{
                            borderRadius: '12px',
                            borderColor: '#cbd5e1',
                            color: '#475569',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 2.5,
                            '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' }
                        }}
                    >
                        Log Hours
                    </Button>
                    {!isTimerRunning && (
                        <TextField
                            select
                            size="small"
                            label="Project"
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            sx={{ width: 180, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        >
                            {projects.map((p: Project) => (
                                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                            ))}
                        </TextField>
                    )}
                    <Button
                        variant="contained"
                        startIcon={isTimerRunning ? <StopRoundedIcon /> : <PlayArrowRoundedIcon />}
                        onClick={handleToggleTimer}
                        disabled={startSession.isPending || stopSession.isPending}
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
                        : '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box
                        sx={{
                            width: 64, height: 64, borderRadius: '18px',
                            background: isTimerRunning ? 'linear-gradient(135deg, #10b981, #14b8a6)' : '#f1f5f9',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isTimerRunning ? '#fff' : '#94a3b8',
                            boxShadow: isTimerRunning ? '0 4px 15px rgba(20,184,166,0.3)' : 'none',
                        }}
                    >
                        <AccessTimeIcon sx={{ fontSize: 30 }} />
                    </Box>
                    <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                            {isTimerRunning ? 'Active Session' : 'Ready to work?'}
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', lineHeight: 1 }}>
                            {formatTime(timerSeconds)}
                        </Typography>
                        {isTimerRunning && (
                            <Chip
                                label={activeSession?.task || taskName}
                                size="small"
                                sx={{ mt: 0.5, bgcolor: '#14b8a615', color: '#0d9488', fontWeight: 600, fontSize: '0.7rem' }}
                            />
                        )}
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontWeight: 600 }}>Productivity</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#6366f1' }}>{stats?.productivity || 0}%</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontWeight: 600 }}>Daily Hours</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#14b8a6' }}>{Math.floor(stats?.todayHours || 0)}h {Math.round(((stats?.todayHours || 0) % 1) * 60)}m</Typography>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(100, ((stats?.todayHours || 0) / 8) * 100)}
                            sx={{ mt: 0.5, width: 120, height: 6, borderRadius: 3, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#14b8a6' } }}
                        />
                    </Box>
                </Box>
            </Paper>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #f1f5f9', mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Productivity Trend</Typography>
                            <Chip label="Last 7 Days" size="small" variant="outlined" sx={{ borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700 }} />
                        </Box>
                        <Box sx={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: 2, px: 1 }}>
                            <MiniChart data={trendData} height={160} color="#14b8a6" />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, px: 1 }}>
                            {productivityData?.data?.labels?.map((label: string, i: number) => (
                                <Typography key={i} variant="caption" sx={{ color: '#94a3b8', fontSize: '0.65rem' }}>
                                    {new Date(label).toLocaleDateString('en-US', { weekday: 'short' })}
                                </Typography>
                            ))}
                        </Box>
                    </Paper>

                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Assigned Projects</Typography>
                    <Grid container spacing={2}>
                        {projects.map((p: Project) => (
                            <Grid item xs={12} sm={6} key={p.id}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2.5, borderRadius: '16px', border: '1px solid #f1f5f9',
                                        transition: '0.2s', cursor: 'pointer',
                                        bgcolor: selectedProjectId === p.id ? '#f0fdfa' : '#fff',
                                        borderColor: selectedProjectId === p.id ? '#14b8a6' : '#f1f5f9',
                                        '&:hover': { borderColor: '#14b8a6', transform: 'translateY(-2px)' }
                                    }}
                                    onClick={() => !isTimerRunning && setSelectedProjectId(p.id)}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Avatar sx={{ bgcolor: '#f1f5f9', color: '#14b8a6' }}><FolderOutlinedIcon /></Avatar>
                                        <Chip label={p.status} size="small" sx={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }} />
                                    </Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>{p.name}</Typography>
                                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2, height: 32, overflow: 'hidden' }}>
                                        {p.description || 'No description provided.'}
                                    </Typography>
                                    <LinearProgress variant="determinate" value={75} sx={{ height: 4, borderRadius: 2, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#14b8a6' } }} />
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <StatCard
                                title="Pulse Status"
                                value={isConnected ? 'Connected' : 'Syncing...'}
                                subtitle={isConnected ? 'Live tracking enabled' : 'Waiting for connection'}
                                icon={<WhatshotIcon />}
                                color={isConnected ? 'success' : 'warning'}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <StatCard
                                title="Avg Productivity"
                                value={`${stats?.productivity || 0}%`}
                                subtitle="vs 95% target"
                                icon={<TrendingUpIcon />}
                                color="info"
                                trend={{ value: stats?.currentStreak || 0, direction: (stats?.currentStreak || 0) >= 0 ? 'up' : 'down' }}
                            />
                        </Grid>
                    </Grid>

                    <Paper elevation={0} sx={{ p: 3, mt: 3, borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Recent Activity</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            {logs.slice(0, 5).map((log: any) => (
                                <ActivityItem
                                    key={log.id}
                                    userName="You"
                                    action={log.action}
                                    time={new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    type={log.type}
                                />
                            ))}
                            {logs.length === 0 && (
                                <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', py: 4 }}>No recent activity</Typography>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Manual Log Modal */}
            <Dialog open={openLogModal} onClose={() => setOpenLogModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
                <DialogTitle sx={{ fontWeight: 800, px: 3, pt: 3 }}>Log Work Hours Manually</DialogTitle>
                <DialogContent sx={{ px: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <TextField
                            select
                            label="Project"
                            fullWidth
                            value={manualLogData.projectId}
                            onChange={(e) => setManualLogData({ ...manualLogData, projectId: e.target.value })}
                        >
                            {projects.map((p: Project) => (
                                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Task Description"
                            placeholder="E.g. Code review, client meeting..."
                            fullWidth
                            value={manualLogData.task}
                            onChange={(e) => setManualLogData({ ...manualLogData, task: e.target.value })}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Start Time"
                                type="datetime-local"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={manualLogData.startTime}
                                onChange={(e) => setManualLogData({ ...manualLogData, startTime: e.target.value })}
                            />
                            <TextField
                                label="End Time"
                                type="datetime-local"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={manualLogData.endTime}
                                onChange={(e) => setManualLogData({ ...manualLogData, endTime: e.target.value })}
                            />
                        </Box>
                        <TextField
                            label="Notes (Optional)"
                            multiline
                            rows={3}
                            fullWidth
                            value={manualLogData.description}
                            onChange={(e) => setManualLogData({ ...manualLogData, description: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenLogModal(false)} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleManualLogSubmit}
                        disabled={logManual.isPending}
                        sx={{ bgcolor: '#14b8a6', '&:hover': { bgcolor: '#0d9488' }, borderRadius: '10px', px: 4, fontWeight: 700 }}
                    >
                        Save Log
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={!!alert} autoHideDuration={6000} onClose={() => setAlert(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={alert?.severity} onClose={() => setAlert(null)} sx={{ borderRadius: '12px' }}>{alert?.message}</Alert>
            </Snackbar>
        </Box>
    );
}

