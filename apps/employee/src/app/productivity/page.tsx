'use client';

import React from 'react';
import { Box, Typography, Grid, Paper, LinearProgress, Chip, useTheme } from '@mui/material';
import { StatCard, MiniChart } from '@repo/ui';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

const projectStats = [
    { name: 'Website Redesign', hours: 42, productivity: 85, color: '#14b8a6' },
    { name: 'API Migration', hours: 28, productivity: 92, color: '#6366f1' },
    { name: 'Mobile App v2', hours: 12, productivity: 78, color: '#0ea5e9' },
    { name: 'Analytics Dashboard', hours: 6, productivity: 65, color: '#f59e0b' },
];

const dailyStats = [
    { day: 'Mon', hours: 7.5, score: 82 },
    { day: 'Tue', hours: 8.2, score: 85 },
    { day: 'Wed', hours: 7.8, score: 78 },
    { day: 'Thu', hours: 8.0, score: 90 },
    { day: 'Fri', hours: 6.5, score: 88 },
];

export default function ProductivityPage() {
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
                        value="88%"
                        subtitle="+4% from last week"
                        icon={<PrecisionManufacturingIcon sx={{ fontSize: 22 }} />}
                        color="primary"
                        trend={{ value: 4, direction: 'up' }}
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Effective Hours"
                        value="32.4h"
                        subtitle="Out of 38.5 total"
                        icon={<AccessTimeIcon sx={{ fontSize: 22 }} />}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Deep Work"
                        value="18h"
                        subtitle="55% of your time"
                        icon={<WorkspacePremiumIcon sx={{ fontSize: 22 }} />}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Productivity"
                        value="Optimal"
                        subtitle="Top 10% in team"
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
                                                {stat.hours} hours logged
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#14b8a6' }}>
                                            {stat.score}%
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
                                                bgcolor: stat.score > 85 ? '#10b981' : stat.score > 75 ? '#14b8a6' : '#f59e0b',
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

                        <Box sx={{ mt: 4, p: 2, borderRadius: '12px', bgcolor: 'rgba(20,184,166,0.05)', border: '1px dashed rgba(20,184,166,0.3)' }}>
                            <Typography variant="caption" sx={{ color: '#0d9488', fontWeight: 600, display: 'block', mb: 0.5 }}>
                                AI Insight ✨
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#0d9488' }}>
                                You are most productive between 9:00 AM and 11:30 AM. Try scheduling your deep work tasks during this window.
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
