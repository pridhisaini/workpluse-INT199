'use client';

import React from 'react';
import { Box, Typography, Paper, Button, Chip, IconButton, Avatar } from '@mui/material';
import { DataTable, StatusBadge } from '@repo/ui';
import type { Column } from '@repo/ui';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const entries: Record<string, unknown>[] = [
    { date: 'Feb 12', task: 'API endpoint review', project: 'Website Redesign', start: '9:15 AM', end: '11:30 AM', duration: '2h 15m', status: 'completed' },
    { date: 'Feb 12', task: 'Database migration script', project: 'API Migration', start: '11:45 AM', end: '--', duration: '1h 45m', status: 'running' },
    { date: 'Feb 12', task: 'Code review PR #234', project: 'Mobile App v2', start: '1:30 PM', end: '2:00 PM', duration: '0h 30m', status: 'completed' },
    { date: 'Feb 11', task: 'Sprint retrospective', project: 'General', start: '9:00 AM', end: '10:00 AM', duration: '1h 00m', status: 'completed' },
    { date: 'Feb 11', task: 'Auth module refactor', project: 'Website Redesign', start: '10:30 AM', end: '1:00 PM', duration: '2h 30m', status: 'completed' },
    { date: 'Feb 11', task: 'Test case writing', project: 'API Migration', start: '2:00 PM', end: '5:30 PM', duration: '3h 30m', status: 'completed' },
    { date: 'Feb 10', task: 'UI component library', project: 'Website Redesign', start: '9:00 AM', end: '12:00 PM', duration: '3h 00m', status: 'completed' },
    { date: 'Feb 10', task: 'Client meeting prep', project: 'General', start: '1:00 PM', end: '2:30 PM', duration: '1h 30m', status: 'completed' },
];

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

const weeklySummary = [
    { day: 'Monday', hours: '7h 30m', target: 94 },
    { day: 'Tuesday', hours: '8h 15m', target: 100 },
    { day: 'Wednesday', hours: '6h 45m', target: 84 },
    { day: 'Thursday', hours: '--', target: 0 },
    { day: 'Friday', hours: '--', target: 0 },
];

export default function TimesheetPage() {
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
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{ bgcolor: '#14b8a6', '&:hover': { bgcolor: '#0d9488' }, boxShadow: '0 4px 12px rgba(20,184,166,0.3)' }}
                    >
                        Add Entry
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
                        label="32h 30m / 40h"
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

            <DataTable title="Time Entries" columns={columns} data={entries} />
        </Box>
    );
}
