'use client';

import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, Avatar, CircularProgress, TextField, Button, LinearProgress } from '@mui/material';
import { DataTable, StatusBadge } from '@repo/ui';
import type { Column } from '@repo/ui';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useApiClient, useAdminAttendanceReport } from '@repo/api';

const columns: Column<any>[] = [
    {
        key: 'name',
        label: 'Employee',
        render: (row) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366f1', fontSize: '0.8rem', fontWeight: 600 }}>
                    {row.avatar}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>
                    {row.name}
                </Typography>
            </Box>
        ),
    },
    { key: 'checkIn', label: 'Check In' },
    { key: 'checkOut', label: 'Check Out' },
    { key: 'hours', label: 'Work Hours', align: 'center' },
    {
        key: 'productivity',
        label: 'Productivity',
        render: (row) => (
            <Box sx={{ width: '120px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
                        {row.productivity}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={row.productivity}
                    sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: '#f1f5f9',
                        '& .MuiLinearProgress-bar': {
                            bgcolor: row.productivity > 80 ? '#10b981' : row.productivity > 60 ? '#f59e0b' : '#ef4444',
                            borderRadius: 3
                        }
                    }}
                />
            </Box>
        )
    },
    {
        key: 'status',
        label: 'Status',
        render: (row) => <StatusBadge status={row.status} />,
    },
];

export default function AttendancePage() {
    const client = useApiClient();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const { data: attendanceResponse, isLoading } = useAdminAttendanceReport(client, { date: selectedDate });

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
    };

    const resetToToday = () => {
        setSelectedDate(new Date().toISOString().split('T')[0]);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress sx={{ color: '#6366f1' }} />
            </Box>
        );
    }

    const attendanceData = attendanceResponse?.data?.logs || [];
    const summary = attendanceResponse?.data?.summary || { present: 0, absent: 0, late: 0, leave: 0 };

    const summaryCards = [
        { label: 'Present', value: summary.present.toString(), icon: <EventAvailableIcon />, color: '#10b981', bg: '#ecfdf5' },
        { label: 'Absent', value: summary.absent.toString(), icon: <EventBusyIcon />, color: '#ef4444', bg: '#fef2f2' },
        { label: 'Late', value: summary.late.toString(), icon: <ScheduleIcon />, color: '#f59e0b', bg: '#fffbeb' },
        { label: 'On Leave', value: summary.leave.toString(), icon: <BeachAccessIcon />, color: '#6366f1', bg: '#eef2ff' },
    ];

    const displayDate = new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                        Attendance
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Attendance overview — {displayDate}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        type="date"
                        size="small"
                        value={selectedDate}
                        onChange={handleDateChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                bgcolor: '#fff'
                            }
                        }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<RestartAltIcon />}
                        onClick={resetToToday}
                        sx={{
                            borderRadius: '10px',
                            borderColor: '#e2e8f0',
                            color: '#64748b',
                            '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
                        }}
                    >
                        Today
                    </Button>
                </Box>
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

            <DataTable title={`Attendance Log - ${displayDate}`} columns={columns} data={attendanceData} />
        </Box>
    );
}
