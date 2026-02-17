'use client';

import React from 'react';
import { Box, Typography, Paper, Button, Chip, CircularProgress } from '@mui/material';
import { DataTable, StatusBadge } from '@repo/ui';
import type { Column } from '@repo/ui';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../AuthContext';
import { useApiClient, useSessionHistory } from '@repo/api';

export default function TimesheetPage() {
    const { user } = useAuth();
    const client = useApiClient();

    // Current month by default
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const startDate = formatDate(firstDayOfMonth);
    const endDate = formatDate(now);

    const { data: sessionsResponse, isLoading } = useSessionHistory(client, { startDate, endDate });

    // Handle both wrapped and unwrapped response formats
    const sessionList: any[] = Array.isArray(sessionsResponse)
        ? sessionsResponse
        : (sessionsResponse?.data || []);

    // Build time entries from sessions
    const entries = sessionList.map((s: any) => {
        const startTime = new Date(s.startTime);
        const endTime = s.endTime ? new Date(s.endTime) : null;
        const durationSec = s.duration || 0;
        const hours = Math.floor(durationSec / 3600);
        const minutes = Math.round((durationSec % 3600) / 60);

        return {
            date: startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            task: s.task || 'Untitled Task',
            project: s.project?.name || 'No Project',
            start: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            end: endTime ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
            duration: `${hours}h ${minutes}m`,
            status: s.status === 'running' ? 'running' : 'completed',
        };
    });

    // Build weekly summary from sessions specifically for the current week
    const mondayOffset = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dailyTotals: Record<string, number> = {};

    sessionList.forEach((s: any) => {
        const d = new Date(s.date || s.startTime);
        if (d >= weekStart) {
            const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
            dailyTotals[dayName] = (dailyTotals[dayName] || 0) + (s.duration || 0);
        }
    });

    const targetDailySeconds = 8 * 3600; // 8 hours
    const weeklySummary = weekDays.map(day => {
        const totalSec = dailyTotals[day] || 0;
        const hrs = Math.floor(totalSec / 3600);
        const mins = Math.round((totalSec % 3600) / 60);
        return {
            day,
            hours: totalSec > 0 ? `${hrs}h ${mins}m` : '--',
            target: totalSec > 0 ? Math.min(100, Math.round((totalSec / targetDailySeconds) * 100)) : 0,
        };
    });

    const totalWeekSeconds = Object.values(dailyTotals).reduce((a, b) => a + b, 0);
    const totalWeekHrs = Math.floor(totalWeekSeconds / 3600);
    const totalWeekMins = Math.round((totalWeekSeconds % 3600) / 60);

    const columns: Column<Record<string, unknown>>[] = [
        { key: 'date', label: 'Date', width: 80 },
        {
            key: 'task',
            label: 'Task',
            render: (row) => (
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                        {String(row.task)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                        {String(row.project)}
                    </Typography>
                </Box>
            ),
        },
        { key: 'start', label: 'Start' },
        { key: 'end', label: 'End' },
        { key: 'duration', label: 'Duration', align: 'center' },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge status={String(row.status)} />,
        },
    ];

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                <CircularProgress sx={{ color: '#14b8a6' }} />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                        Timesheet
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Track and manage your work hours
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                        variant="outlined"
                        startIcon={<CalendarTodayIcon />}
                        sx={{ borderColor: '#e2e8f0', color: '#64748b', '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' } }}
                    >
                        This Week
                    </Button>
                </Box>
            </Box>

            {/* Weekly Summary */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: '16px',
                    border: '1px solid rgba(226,232,240,0.8)',
                    mb: 3,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1e293b' }}>
                        Weekly Summary
                    </Typography>
                    <Chip
                        label={`${totalWeekHrs}h ${totalWeekMins}m / 40h`}
                        size="small"
                        sx={{ bgcolor: '#f0fdfa', color: '#0d9488', fontWeight: 600, fontSize: '0.72rem' }}
                    />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {weeklySummary.map((day) => (
                        <Box key={day.day} sx={{ flex: 1, textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.72rem' }}>
                                {day.day.slice(0, 3)}
                            </Typography>
                            <Box
                                sx={{
                                    mt: 1,
                                    height: 60,
                                    bgcolor: '#f8fafc',
                                    borderRadius: '8px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        width: '100%',
                                        height: `${day.target}%`,
                                        bgcolor: day.target >= 100 ? '#10b981' : day.target > 0 ? '#14b8a6' : '#e2e8f0',
                                        borderRadius: '8px',
                                        transition: 'height 0.5s ease',
                                    }}
                                />
                            </Box>
                            <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600, mt: 0.5, display: 'block', fontSize: '0.72rem' }}>
                                {day.hours}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Paper>

            {entries.length > 0 ? (
                <DataTable title="Time Entries" columns={columns} data={entries} />
            ) : (
                <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                        No time entries this week. Start a session to begin tracking!
                    </Typography>
                </Paper>
            )}
        </Box>
    );
}
