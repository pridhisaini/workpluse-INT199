'use client';

import React from 'react';
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';
import { DataTable, StatusBadge } from '@repo/ui';
import type { Column } from '@repo/ui';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';

const attendanceLog: Record<string, unknown>[] = [
    { date: 'Feb 12, Wed', checkIn: '9:02 AM', checkOut: '--', hours: '6h 45m', status: 'present' },
    { date: 'Feb 11, Tue', checkIn: '8:45 AM', checkOut: '6:00 PM', hours: '8h 15m', status: 'present' },
    { date: 'Feb 10, Mon', checkIn: '9:10 AM', checkOut: '5:45 PM', hours: '7h 35m', status: 'present' },
    { date: 'Feb 7, Fri', checkIn: '9:30 AM', checkOut: '5:30 PM', hours: '7h 00m', status: 'late' },
    { date: 'Feb 6, Thu', checkIn: '8:55 AM', checkOut: '6:10 PM', hours: '8h 15m', status: 'present' },
    { date: 'Feb 5, Wed', checkIn: '--', checkOut: '--', hours: '--', status: 'leave' },
    { date: 'Feb 4, Tue', checkIn: '9:00 AM', checkOut: '5:50 PM', hours: '7h 50m', status: 'present' },
    { date: 'Feb 3, Mon', checkIn: '8:50 AM', checkOut: '6:05 PM', hours: '8h 15m', status: 'present' },
];

const columns: Column<Record<string, unknown>>[] = [
    { key: 'date', label: 'Date', width: 130 },
    { key: 'checkIn', label: 'Check In' },
    { key: 'checkOut', label: 'Check Out' },
    { key: 'hours', label: 'Total Hours', align: 'center' },
    {
        key: 'status',
        label: 'Status',
        render: (row) => <StatusBadge status={String(row.status)} />,
    },
];

export default function AttendancePage() {
    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                    My Attendance
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Your attendance history and summary
                </Typography>
            </Box>

            {/* Monthly Summary */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { label: 'Present Days', value: '18', icon: <CheckCircleOutlineIcon />, color: '#10b981', bg: '#ecfdf5' },
                    { label: 'Absent Days', value: '1', icon: <CancelOutlinedIcon />, color: '#ef4444', bg: '#fef2f2' },
                    { label: 'Late Days', value: '2', icon: <ScheduleIcon />, color: '#f59e0b', bg: '#fffbeb' },
                    { label: 'Attendance Rate', value: '96%', icon: <CheckCircleOutlineIcon />, color: '#14b8a6', bg: '#f0fdfa' },
                ].map((card) => (
                    <Grid item xs={6} sm={3} key={card.label}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: '14px',
                                border: '1px solid rgba(226,232,240,0.8)',
                                textAlign: 'center',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-1px)' },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '10px',
                                    bgcolor: card.bg,
                                    color: card.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 1,
                                }}
                            >
                                {React.cloneElement(card.icon as React.ReactElement, { sx: { fontSize: 20 } })}
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                {card.value}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                                {card.label}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <DataTable title="Attendance Log — February 2026" columns={columns} data={attendanceLog} />
        </Box>
    );
}
