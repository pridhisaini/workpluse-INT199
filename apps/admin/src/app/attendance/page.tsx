'use client';

import React from 'react';
import { Box, Typography, Grid, Paper, Avatar, Chip } from '@mui/material';
import { DataTable, StatusBadge } from '@repo/ui';
import type { Column } from '@repo/ui';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';

const attendanceData: Record<string, unknown>[] = [
    { name: 'Sarah Johnson', checkIn: '9:02 AM', checkOut: '6:15 PM', hours: '8h 13m', status: 'present', avatar: 'S' },
    { name: 'Mike Chen', checkIn: '8:45 AM', checkOut: '--', hours: '6h 30m', status: 'present', avatar: 'M' },
    { name: 'Emily Davis', checkIn: '10:22 AM', checkOut: '--', hours: '4h 53m', status: 'late', avatar: 'E' },
    { name: 'James Wilson', checkIn: '9:00 AM', checkOut: '5:58 PM', hours: '7h 58m', status: 'present', avatar: 'J' },
    { name: 'Priya Patel', checkIn: '--', checkOut: '--', hours: '--', status: 'absent', avatar: 'P' },
    { name: 'Alex Thompson', checkIn: '8:55 AM', checkOut: '--', hours: '6h 20m', status: 'present', avatar: 'A' },
    { name: 'Lisa Wang', checkIn: '--', checkOut: '--', hours: '--', status: 'leave', avatar: 'L' },
    { name: 'David Brown', checkIn: '9:15 AM', checkOut: '1:00 PM', hours: '3h 45m', status: 'half-day', avatar: 'D' },
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
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>
                    {String(row.name)}
                </Typography>
            </Box>
        ),
    },
    { key: 'checkIn', label: 'Check In' },
    { key: 'checkOut', label: 'Check Out' },
    { key: 'hours', label: 'Work Hours', align: 'center' },
    {
        key: 'status',
        label: 'Status',
        render: (row) => <StatusBadge status={String(row.status)} />,
    },
];

const summaryCards = [
    { label: 'Present', value: '216', icon: <EventAvailableIcon />, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Absent', value: '12', icon: <EventBusyIcon />, color: '#ef4444', bg: '#fef2f2' },
    { label: 'Late', value: '8', icon: <ScheduleIcon />, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'On Leave', value: '12', icon: <BeachAccessIcon />, color: '#6366f1', bg: '#eef2ff' },
];

export default function AttendancePage() {
    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                    Attendance
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Today&apos;s attendance overview — February 12, 2026
                </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                {summaryCards.map((card) => (
                    <Grid item xs={6} sm={3} key={card.label}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: '14px',
                                border: '1px solid rgba(226,232,240,0.8)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-1px)' },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '12px',
                                    bgcolor: card.bg,
                                    color: card.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {React.cloneElement(card.icon as React.ReactElement, { sx: { fontSize: 22 } })}
                            </Box>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>
                                    {card.value}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                                    {card.label}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <DataTable title="Today's Attendance Log" columns={columns} data={attendanceData} />
        </Box>
    );
}
