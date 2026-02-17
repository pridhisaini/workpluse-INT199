'use client';

import React from 'react';
import { Box, Typography, Grid, Paper, LinearProgress, Avatar, AvatarGroup, Chip, CircularProgress } from '@mui/material';
import { useAuth } from '../../AuthContext';
import { useApiClient, useEmployeeProjects, useSessionHistory } from '@repo/api';
import { Project, User } from '@repo/types';

const PROJECT_COLORS = ['#14b8a6', '#6366f1', '#0ea5e9', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#10b981'];

export default function ProjectsPage() {
    const { user } = useAuth();
    const client = useApiClient();

    const { data: projectsResponse, isLoading: loadingProjects } = useEmployeeProjects(client, user?.id || '');
    const projects: Project[] = projectsResponse?.data || [];

    // Fetch all session history to compute hours per project
    const { data: sessionsResponse, isLoading: loadingSessions } = useSessionHistory(client);
    const sessionList: any[] = sessionsResponse?.data || [];

    // Compute hours per project
    const projectHours: Record<string, number> = {};
    sessionList.forEach((s: any) => {
        if (s.projectId) {
            projectHours[s.projectId] = (projectHours[s.projectId] || 0) + (s.duration || 0);
        }
    });

    const isLoading = loadingProjects || loadingSessions;

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                <CircularProgress sx={{ color: '#14b8a6' }} />
            </Box>
        );
    }

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

            {projects.length === 0 ? (
                <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                        You are not assigned to any projects yet.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={2.5}>
                    {projects.map((project, index) => {
                        const color = PROJECT_COLORS[index % PROJECT_COLORS.length];
                        const totalSeconds = projectHours[project.id] || 0;
                        const totalHrs = Math.round(totalSeconds / 3600);
                        const progress = project.progress || 0;
                        const members = project.members || [];
                        const deadline = project.endDate
                            ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'No deadline';

                        return (
                            <Grid item xs={12} md={6} key={project.id}>
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
                                            borderColor: `${color}40`,
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
                                                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>
                                                    {project.name}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={project.status}
                                                size="small"
                                                sx={{ bgcolor: `${color}12`, color: color, fontWeight: 600, fontSize: '0.7rem', borderRadius: '6px', textTransform: 'capitalize' }}
                                            />
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>My Hours</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: color }}>{totalHrs}h</Typography>
                                        </Box>
                                    </Box>

                                    {project.description && (
                                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2, height: 32, overflow: 'hidden' }}>
                                            {project.description}
                                        </Typography>
                                    )}

                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                                Progress
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: color, fontWeight: 700 }}>{progress}%</Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={progress}
                                            sx={{
                                                height: 6,
                                                borderRadius: 3,
                                                bgcolor: '#f1f5f9',
                                                '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.7rem', border: '2px solid #fff' } }}>
                                            {members.map((m: User, i: number) => (
                                                <Avatar key={m.id || i} sx={{ bgcolor: color, fontWeight: 600 }}>
                                                    {m.firstName?.charAt(0) || '?'}
                                                </Avatar>
                                            ))}
                                        </AvatarGroup>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                                            Due {deadline}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
}
