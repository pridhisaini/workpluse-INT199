'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Avatar, LinearProgress, Tab, Tabs } from '@mui/material';
import { MiniChart, DataTable, StatusBadge } from '@repo/ui';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartOutlineIcon from '@mui/icons-material/PieChartOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const monthlyData = [65, 72, 81, 78, 69, 84, 75, 80, 73, 82, 76, 81];
const attendanceData = [92, 88, 95, 90, 87, 93, 91, 89, 94, 92, 90, 93];
const productivityData = [78, 82, 85, 80, 88, 86, 84, 89, 87, 91, 88, 90];

const employeeProductivity = [
    { name: 'Sarah Johnson', productivity: 94, trend: 'up', status: 'active', hours: 164 },
    { name: 'Mike Chen', productivity: 88, trend: 'down', status: 'active', hours: 158 },
    { name: 'Emily Davis', productivity: 72, trend: 'up', status: 'late', hours: 124 },
    { name: 'James Wilson', productivity: 91, trend: 'up', status: 'active', hours: 172 },
    { name: 'Priya Patel', productivity: 85, trend: 'stable', status: 'active', hours: 145 },
];

const projectBreakdown = [
    { name: 'Website Redesign', efficiency: 92, resource: 8, status: 'active', deadline: 'Mar 15' },
    { name: 'Mobile App v2.0', efficiency: 74, resource: 5, status: 'active', deadline: 'Apr 20' },
    { name: 'API Migration', efficiency: 96, resource: 3, status: 'active', deadline: 'Feb 28' },
    { name: 'Security Audit', efficiency: 82, resource: 2, status: 'planning', deadline: 'May 10' },
];

export default function ReportsPage() {
    const [tab, setTab] = useState(0);

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                        Reports & Analytics
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Performance metrics and resource allocation overview
                    </Typography>
                </Box>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 0.5 }}>
                    <Tab label="Productivity" sx={{ fontWeight: 600 }} />
                    <Tab label="Projects" sx={{ fontWeight: 600 }} />
                </Tabs>
            </Box>

            {tab === 0 ? (
                <Box>
                    <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
                        {[
                            { title: 'Monthly Work Hours', data: monthlyData, color: '#6366f1', value: '1,847h', change: '+5.2%' },
                            { title: 'Attendance Rate', data: attendanceData, color: '#10b981', value: '91.3%', change: '+2.1%' },
                            { title: 'Productivity Score', data: productivityData, color: '#0ea5e9', value: '87.4%', change: '+3.8%' },
                        ].map((report) => (
                            <Grid item xs={12} md={4} key={report.title}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: '16px',
                                        border: '1px solid rgba(226,232,240,0.8)',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                                            {report.title}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600, bgcolor: '#ecfdf5', px: 1, py: 0.3, borderRadius: '6px' }}>
                                            {report.change}
                                        </Typography>
                                    </Box>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 2 }}>
                                        {report.value}
                                    </Typography>
                                    <MiniChart data={report.data} color={report.color} height={50} />
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    <DataTable
                        title="Top Performers (Productivity)"
                        data={employeeProductivity}
                        columns={[
                            {
                                key: 'name',
                                label: 'Employee',
                                render: (row) => (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366f1', fontSize: '0.8rem' }}>{row.name.charAt(0)}</Avatar>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                                    </Box>
                                )
                            },
                            {
                                key: 'productivity',
                                label: 'Productivity Score',
                                render: (row) => (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ flex: 1, minWidth: 100 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={row.productivity}
                                                sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#6366f1' } }}
                                            />
                                        </Box>
                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>{row.productivity}%</Typography>
                                    </Box>
                                )
                            },
                            { key: 'hours', label: 'Monthly Hours', align: 'center' },
                            {
                                key: 'trend',
                                label: 'Trend',
                                render: (row) => (
                                    <Typography variant="caption" sx={{ color: row.trend === 'up' ? '#10b981' : row.trend === 'down' ? '#ef4444' : '#64748b', fontWeight: 700 }}>
                                        {row.trend.toUpperCase()}
                                    </Typography>
                                )
                            }
                        ]}
                    />
                </Box>
            ) : (
                <Box>
                    <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
                        <Grid item xs={12} md={8}>
                            <DataTable
                                title="Project Resource Allocation"
                                data={projectBreakdown}
                                columns={[
                                    { key: 'name', label: 'Project Name' },
                                    { key: 'resource', label: 'Team Size', align: 'center' },
                                    {
                                        key: 'efficiency',
                                        label: 'Efficiency Rate',
                                        render: (row) => (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ flex: 1, minWidth: 100 }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={row.efficiency}
                                                        sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#0ea5e9' } }}
                                                    />
                                                </Box>
                                                <Typography variant="caption" sx={{ fontWeight: 700 }}>{row.efficiency}%</Typography>
                                            </Box>
                                        )
                                    },
                                    { key: 'deadline', label: 'Upcoming Deadline' },
                                ]}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: '16px',
                                    border: '1px solid rgba(226,232,240,0.8)',
                                    height: '100%'
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', mb: 3 }}>
                                    Overall Efficiency
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                                    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                                        <Box sx={{ width: 120, height: 120, borderRadius: '50%', border: '12px solid #f1f5f9', position: 'absolute' }} />
                                        <Box sx={{ width: 120, height: 120, borderRadius: '50%', border: '12px solid #6366f1', borderBottomColor: 'transparent', transform: 'rotate(45deg)' }} />
                                        <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Typography variant="h4" sx={{ fontWeight: 800 }}>82%</Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" sx={{ textAlign: 'center', color: '#64748b' }}>
                                        Your team efficiency is <Box component="span" sx={{ fontWeight: 700, color: '#10b981' }}>high</Box> this month.
                                    </Typography>
                                </Box>
                                <Box sx={{ mt: 2 }}>
                                    {[
                                        { label: 'Resource Utilization', value: '94%', color: '#6366f1' },
                                        { label: 'Project Completion', value: '68%', color: '#10b981' },
                                        { label: 'Budget Adherence', value: '88%', color: '#f59e0b' },
                                    ].map(item => (
                                        <Box key={item.label} sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 700 }}>{item.value}</Typography>
                                            </Box>
                                            <LinearProgress variant="determinate" value={parseInt(item.value)} sx={{ height: 4, borderRadius: 2, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: item.color } }} />
                                        </Box>
                                    ))}
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </Box>
    );
}
