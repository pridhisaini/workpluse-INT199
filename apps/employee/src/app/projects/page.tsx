'use client';

import React from 'react';
import { Box, Typography, Grid, Paper, LinearProgress, Avatar, AvatarGroup, Chip } from '@mui/material';
import { StatusBadge } from '@repo/ui';

const myProjects = [
    {
        name: 'Website Redesign',
        role: 'Lead Developer',
        progress: 78,
        tasks: { completed: 18, total: 24 },
        team: ['S', 'M', 'J', 'A'],
        deadline: 'Mar 15, 2026',
        color: '#14b8a6',
        myHours: '42h',
    },
    {
        name: 'API Migration',
        role: 'Backend Dev',
        progress: 92,
        tasks: { completed: 11, total: 12 },
        team: ['J', 'S', 'D'],
        deadline: 'Feb 28, 2026',
        color: '#6366f1',
        myHours: '28h',
    },
    {
        name: 'Mobile App v2',
        role: 'Code Reviewer',
        progress: 45,
        tasks: { completed: 3, total: 8 },
        team: ['M', 'E', 'S'],
        deadline: 'Apr 20, 2026',
        color: '#0ea5e9',
        myHours: '12h',
    },
    {
        name: 'Analytics Dashboard',
        role: 'Frontend Dev',
        progress: 15,
        tasks: { completed: 1, total: 10 },
        team: ['S', 'E', 'P'],
        deadline: 'May 10, 2026',
        color: '#f59e0b',
        myHours: '6h',
    },
];

export default function ProjectsPage() {
    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                    My Projects
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Projects you&apos;re currently assigned to
                </Typography>
            </Box>

            <Grid container spacing={2.5}>
                {myProjects.map((project) => (
                    <Grid item xs={12} md={6} key={project.name}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: '16px',
                                border: '1px solid rgba(226,232,240,0.8)',
                                transition: 'all 0.3s',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
                                    borderColor: `${project.color}40`,
                                },
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: project.color }} />
                                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>
                                            {project.name}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={project.role}
                                        size="small"
                                        sx={{ bgcolor: `${project.color}12`, color: project.color, fontWeight: 600, fontSize: '0.7rem', borderRadius: '6px' }}
                                    />
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>My Hours</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: project.color }}>{project.myHours}</Typography>
                                </Box>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                        {project.tasks.completed}/{project.tasks.total} tasks
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: project.color, fontWeight: 700 }}>{project.progress}%</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={project.progress}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: '#f1f5f9',
                                        '& .MuiLinearProgress-bar': { bgcolor: project.color, borderRadius: 3 },
                                    }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.7rem', border: '2px solid #fff' } }}>
                                    {project.team.map((initial, i) => (
                                        <Avatar key={i} sx={{ bgcolor: project.color, fontWeight: 600 }}>{initial}</Avatar>
                                    ))}
                                </AvatarGroup>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                                    Due {project.deadline}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
