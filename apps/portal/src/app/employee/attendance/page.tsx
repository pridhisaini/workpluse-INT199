'use client';

import React from 'react';
import { Box, Typography, Paper, Grid, } from '@mui/material';
import { DataTable, StatusBadge } from '@repo/ui';
import type { Column } from '@repo/ui';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useAuth } from '../../AuthContext';
import { useApiClient, useAttendanceReport } from '@repo/api';

const columns: Column<Record<string, any>>[] = [
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
    const { user } = useAuth();
    const client = useApiClient();

    // Current month range
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endDate = now.toISOString().split('T')[0];

    const { data: attendanceResponse, isLoading } = useAttendanceReport(client, {
        startDate,
        endDate,
        userId: user?.id
    });

    const attendanceLog = attendanceResponse?.data?.logs || [];
    const summary = attendanceResponse?.data?.summary || {
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        attendanceRate: 0
    };

    if (isLoading) return <Typography>Loading attendance...</Typography>;

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
                    { label: 'Present Days', value: String(summary.presentDays), icon: <CheckCircleOutlineIcon />, color: '#10b981', bg: '#ecfdf5' },
                    { label: 'Absent Days', value: String(summary.absentDays), icon: <CancelOutlinedIcon />, color: '#ef4444', bg: '#fef2f2' },
                    { label: 'Late Days', value: String(summary.lateDays), icon: <ScheduleIcon />, color: '#f59e0b', bg: '#fffbeb' },
                    { label: 'Attendance Rate', value: `${summary.attendanceRate}%`, icon: <CheckCircleOutlineIcon />, color: '#14b8a6', bg: '#f0fdfa' },
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

            <DataTable title={`Attendance Log — ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`} columns={columns} data={attendanceLog} />
        </Box>
    );
}
