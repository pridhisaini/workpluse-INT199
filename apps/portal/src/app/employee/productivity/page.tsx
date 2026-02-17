'use client';

import React from 'react';
import { Box, Typography, Grid, Paper, LinearProgress, Chip, CircularProgress } from '@mui/material';
import { StatCard, MiniChart } from '@repo/ui';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { useAuth } from '../../AuthContext';
import {
    useApiClient,
    useEmployeeStats,
    useProductivityReport,
    useEmployeeProjects,
    useSessionHistory
} from '@repo/api';
import { Project } from '@repo/types';

const PROJECT_COLORS = ['#14b8a6', '#6366f1', '#0ea5e9', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function ProductivityPage() {
    const { user } = useAuth();
    const client = useApiClient();

    // Date ranges
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const startDate = formatDate(sevenDaysAgo);
    const endDate = formatDate(now);

    // Current week start (Monday) for specific calculations
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartDate = formatDate(weekStart);

    // API calls
    const { data: statsResponse, isLoading: loadingStats } = useEmployeeStats(client, user?.id || '');
    const { data: productivityData, isLoading: loadingProd } = useProductivityReport(client, { startDate, endDate, userId: user?.id });
    const { data: projectsResponse, isLoading: loadingProjects } = useEmployeeProjects(client, user?.id || '');
    const { data: sessionsResponse, isLoading: loadingSessions } = useSessionHistory(client, { startDate: weekStartDate, endDate });

    const stats = statsResponse?.data;
    const projects: Project[] = projectsResponse?.data || [];
    const sessionList: any[] = sessionsResponse?.data || [];
    const trendData = productivityData?.data?.data || [];
    const trendLabels = productivityData?.data?.labels || [];

    // Compute project-wise stats from sessions
    const projectSessionData: Record<string, { duration: number; active: number }> = {};
    sessionList.forEach((s: any) => {
        if (s.projectId) {
            if (!projectSessionData[s.projectId]) {
                projectSessionData[s.projectId] = { duration: 0, active: 0 };
            }
            projectSessionData[s.projectId].duration += (s.duration || 0);
            projectSessionData[s.projectId].active += (s.activeSeconds || 0);
        }
    });

    const projectStats = projects.map((p, i) => {
        const data = projectSessionData[p.id] || { duration: 0, active: 0 };
        const hours = Math.round(data.duration / 3600);
        const productivity = data.duration > 0 ? Math.round((data.active / data.duration) * 100) : 0;
        return {
            name: p.name,
            hours,
            productivity,
            color: PROJECT_COLORS[i % PROJECT_COLORS.length],
        };
    }).filter(p => p.hours > 0 || projects.length <= 6); // Show all if few, otherwise filter by hours

    // Compute daily stats from sessions (Mon-Fri current week)
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dailyBuckets: Record<string, { duration: number; active: number }> = {};
    sessionList.forEach((s: any) => {
        const d = new Date(s.date || s.startTime);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
        if (!dailyBuckets[dayName]) {
            dailyBuckets[dayName] = { duration: 0, active: 0 };
        }
        dailyBuckets[dayName].duration += (s.duration || 0);
        dailyBuckets[dayName].active += (s.activeSeconds || 0);
    });

    const dailyStats = weekDays.map(day => {
        const data = dailyBuckets[day] || { duration: 0, active: 0 };
        const hours = parseFloat((data.duration / 3600).toFixed(1));
        const score = data.duration > 0 ? Math.round((data.active / data.duration) * 100) : 0;
        return { day: day.slice(0, 3), hours, score };
    });

    // Compute effective hours and total hours for the week
    const totalWeekDuration = sessionList.reduce((acc: number, s: any) => acc + (s.duration || 0), 0);
    const totalWeekActive = sessionList.reduce((acc: number, s: any) => acc + (s.activeSeconds || 0), 0);
    const effectiveHours = parseFloat((totalWeekActive / 3600).toFixed(1));
    const totalHours = parseFloat((totalWeekDuration / 3600).toFixed(1));
    const focusScore = totalWeekDuration > 0 ? Math.round((totalWeekActive / totalWeekDuration) * 100) : 0;

    // Deep work = sessions > 1 hour
    const deepWorkSeconds = sessionList
        .filter((s: any) => (s.duration || 0) >= 3600)
        .reduce((acc: number, s: any) => acc + (s.activeSeconds || 0), 0);
    const deepWorkHours = Math.round(deepWorkSeconds / 3600);
    const deepWorkPercent = totalWeekActive > 0 ? Math.round((deepWorkSeconds / totalWeekActive) * 100) : 0;

    const isLoading = loadingStats || loadingProd || loadingProjects || loadingSessions;

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                <CircularProgress sx={{ color: '#14b8a6' }} />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                    Productivity Insights
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                    A detailed breakdown of your work efficiency and focus
                </Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Focus Score"
                        value={`${focusScore}%`}
                        subtitle={focusScore >= 80 ? 'Great focus!' : 'Room to improve'}
                        icon={<PrecisionManufacturingIcon sx={{ fontSize: 22 }} />}
                        color="primary"
                        trend={{ value: stats?.currentStreak || 0, direction: focusScore >= 80 ? 'up' : 'down' }}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Effective Hours"
                        value={`${effectiveHours}h`}
                        subtitle={`Out of ${totalHours}h total`}
                        icon={<AccessTimeIcon sx={{ fontSize: 22 }} />}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Deep Work"
                        value={`${deepWorkHours}h`}
                        subtitle={`${deepWorkPercent}% of your time`}
                        icon={<WorkspacePremiumIcon sx={{ fontSize: 22 }} />}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Productivity"
                        value={`${stats?.productivity || 0}%`}
                        subtitle={`Today's score`}
                        icon={<TrendingUpIcon sx={{ fontSize: 22 }} />}
                        color="info"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Daily Summary */}
                <Grid item xs={12} lg={7}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: '20px',
                            border: '1px solid rgba(226,232,240,0.8)',
                            height: '100%'
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1e293b' }}>
                            Daily Productivity Summary
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {dailyStats.map((stat) => (
                                <Box key={stat.day}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1 }}>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155' }}>
                                                {stat.day}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                                {stat.hours > 0 ? `${stat.hours} hours logged` : 'No hours logged'}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#14b8a6' }}>
                                            {stat.hours > 0 ? `${stat.score}%` : '--'}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={stat.score}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: '#f1f5f9',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: stat.score > 85 ? '#10b981' : stat.score > 75 ? '#14b8a6' : stat.score > 0 ? '#f59e0b' : '#e2e8f0',
                                                borderRadius: 4
                                            }
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* Project Breakdown */}
                <Grid item xs={12} lg={5}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: '20px',
                            border: '1px solid rgba(226,232,240,0.8)',
                            height: '100%'
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1e293b' }}>
                            Project-wise Efficiency
                        </Typography>
                        {projectStats.length === 0 ? (
                            <Box sx={{ py: 4, textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                                    No project data available yet
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                {projectStats.map((project) => (
                                    <Box
                                        key={project.name}
                                        sx={{
                                            p: 2,
                                            borderRadius: '16px',
                                            bgcolor: '#f8fafc',
                                            border: '1px solid #f1f5f9'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                {project.name}
                                            </Typography>
                                            <Chip
                                                label={`${project.productivity}%`}
                                                size="small"
                                                sx={{
                                                    bgcolor: `${project.color}15`,
                                                    color: project.color,
                                                    fontWeight: 700,
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Typography variant="caption" sx={{ color: '#64748b', minWidth: 60 }}>
                                                {project.hours}h spent
                                            </Typography>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={project.productivity}
                                                    sx={{
                                                        height: 4,
                                                        borderRadius: 2,
                                                        bgcolor: '#e2e8f0',
                                                        '& .MuiLinearProgress-bar': {
                                                            bgcolor: project.color,
                                                            borderRadius: 2
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {trendData.length > 0 && (
                            <Box sx={{ mt: 4, p: 2, borderRadius: '12px', bgcolor: 'rgba(20,184,166,0.05)', border: '1px dashed rgba(20,184,166,0.3)' }}>
                                <Typography variant="caption" sx={{ color: '#0d9488', fontWeight: 600, display: 'block', mb: 0.5 }}>
                                    Weekly Trend ✨
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#0d9488' }}>
                                    {focusScore >= 85
                                        ? 'Excellent! Your focus score is above 85%. Keep up the great work!'
                                        : focusScore >= 70
                                            ? 'Good progress! Try to minimize distractions to push your focus score higher.'
                                            : 'Consider breaking your work into focused blocks to improve your productivity score.'}
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
