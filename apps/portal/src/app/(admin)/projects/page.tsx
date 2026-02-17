'use client';

import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    LinearProgress,
    Avatar,
    AvatarGroup,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Tooltip,
    Alert,
    Snackbar
} from '@mui/material';
import { StatusBadge } from '@repo/ui';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import { useProjects, useUsers, useCreateProject, useUpdateProject, useDeleteProject, useAssignMembers, useApiClient } from '@repo/api';
import { Project, User } from '@repo/types';
import { useAuth } from '../../AuthContext';

export default function ProjectsPage() {
    const { user: authUser } = useAuth();
    const client = useApiClient();
    const { data: projectsResponse, refetch: refetchProjects, isLoading: loadingProjects } = useProjects(client);
    const { data: usersResponse } = useUsers(client);
    const users = usersResponse?.data || [];
    const projects = projectsResponse?.data || [];

    const createProject = useCreateProject(client);
    const updateProject = useUpdateProject(client, ''); // dummy ID for now, will override
    const deleteProject = useDeleteProject(client, '');
    const assignMembers = useAssignMembers(client, '');

    const [openAdd, setOpenAdd] = useState(false);
    const [openAssign, setOpenAssign] = useState(false);
    const [selectedPrj, setSelectedPrj] = useState<Project | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', endDate: '', budget: '', color: '#6366f1', status: 'active' });
    const [assignedTeam, setAssignedTeam] = useState<string[]>([]);
    const [alert, setAlert] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

    const handleAddOpen = () => {
        setSelectedPrj(null);
        setFormData({ name: '', description: '', endDate: '', budget: '', color: '#6366f1', status: 'active' });
        setOpenAdd(true);
    };

    const handleEditOpen = (prj: Project) => {
        setSelectedPrj(prj);
        setFormData({
            name: prj.name,
            description: prj.description || '',
            endDate: prj.endDate ? new Date(prj.endDate).toISOString().split('T')[0] : '',
            budget: prj.budget?.toString() || '',
            color: '#6366f1', // Using default since entity doesn't have color yet
            status: prj.status || 'planning'
        });
        setOpenAdd(true);
    };

    const handleAddSubmit = async () => {
        try {
            const data: any = {
                ...formData,
                organizationId: authUser?.organizationId,
                budget: formData.budget ? parseFloat(formData.budget) : undefined,
                startDate: new Date().toISOString()
            };

            if (selectedPrj) {
                const updateMut = createUpdateMutation(selectedPrj.id);
                await updateMut.mutateAsync(data);
                setAlert({ message: 'Project updated successfully', severity: 'success' });
            } else {
                await createProject.mutateAsync(data);
                setAlert({ message: 'Project created successfully', severity: 'success' });
            }
            refetchProjects();
            setOpenAdd(false);
        } catch (err: any) {
            setAlert({ message: err.message || 'Failed to save project', severity: 'error' });
        }
    };

    const handleAssignOpen = (prj: Project) => {
        setSelectedPrj(prj);
        setAssignedTeam(prj.members?.map(m => m.id) || []);
        setOpenAssign(true);
    };

    const handleAssignSubmit = async () => {
        if (!selectedPrj) return;
        try {
            const assignMut = createAssignMutation(selectedPrj.id);
            await assignMut.mutateAsync({ userIds: assignedTeam });
            setAlert({ message: 'Team updated successfully', severity: 'success' });
            refetchProjects();
            setOpenAssign(false);
        } catch (err: any) {
            setAlert({ message: err.message || 'Failed to update team', severity: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                const delMut = createDeleteMutation(id);
                await delMut.mutateAsync();
                setAlert({ message: 'Project deleted successfully', severity: 'success' });
                refetchProjects();
            } catch (err: any) {
                setAlert({ message: err.message || 'Failed to delete project', severity: 'error' });
            }
        }
    };

    // Helper functions to create mutations with dynamic IDs
    const createUpdateMutation = (id: string) => {
        // We use the hook with the correct ID
        // Note: In a real app, you might want to wrap this in a component or use a different pattern
        return { mutateAsync: (data: any) => client.patch(`/projects/${id}`, data) };
    };

    const createAssignMutation = (id: string) => {
        return { mutateAsync: (data: { userIds: string[] }) => client.post(`/projects/${id}/members`, data) };
    };

    const createDeleteMutation = (id: string) => {
        return { mutateAsync: () => client.delete(`/projects/${id}`) };
    };

    if (loadingProjects) return <Typography sx={{ p: 4 }}>Loading projects...</Typography>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                        Projects
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Track and manage all active, planned, and completed projects
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddOpen}
                    sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
                >
                    New Project
                </Button>
            </Box>

            <Grid container spacing={2.5}>
                {projects.map((project) => (
                    <Grid item xs={12} md={6} lg={4} key={project.id}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: '16px',
                                border: '1px solid rgba(226,232,240,0.8)',
                                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                position: 'relative',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px -5px rgba(0,0,0,0.08)',
                                    borderColor: `#6366f140`,
                                },
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#6366f1' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>
                                        {project.name}
                                    </Typography>
                                </Box>
                                <StatusBadge status={project.status} />
                            </Box>

                            <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5, fontSize: '0.83rem', lineHeight: 1.6, minHeight: 40 }}>
                                {project.description}
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>Progress</Typography>
                                        <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 700 }}>{(project as any).productivity || 0}% Prod</Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 700 }}>{project.progress}% Done</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={project.progress}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: '#f1f5f9',
                                        '& .MuiLinearProgress-bar': { bgcolor: '#6366f1', borderRadius: 3 },
                                    }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.7rem', border: '2px solid #fff' } }}>
                                    {project.members?.map((user, i) => (
                                        <Tooltip key={user.id} title={`${user.firstName} ${user.lastName}`}>
                                            <Avatar sx={{ bgcolor: '#6366f1' }}>{user.firstName.charAt(0)}</Avatar>
                                        </Tooltip>
                                    ))}
                                </AvatarGroup>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.68rem' }}>
                                        Deadline
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600, fontSize: '0.75rem' }}>
                                        {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ pt: 2, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                    Budget: <Box component="span" sx={{ color: '#1e293b' }}>{project.budget || '0'} hrs</Box>
                                </Typography>
                                <Box>
                                    <Tooltip title="Manage Team">
                                        <IconButton size="small" onClick={() => handleAssignOpen(project)} sx={{ color: '#6366f1', p: 0.5 }}>
                                            <GroupAddOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit">
                                        <IconButton size="small" onClick={() => handleEditOpen(project)} sx={{ color: '#64748b', p: 0.5 }}>
                                            <EditOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton size="small" onClick={() => handleDelete(project.id)} sx={{ color: '#ef4444', p: 0.5 }}>
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>


            <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>{selectedPrj ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <TextField
                            label="Project Name"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    label="Deadline"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    select
                                    label="Status"
                                    fullWidth
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <MenuItem value="planning">Planning</MenuItem>
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="on-hold">On Hold</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                        <TextField
                            label="Target Hours (Budget)"
                            fullWidth
                            placeholder="e.g. 100"
                            value={formData.budget}
                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setOpenAdd(false)} color="inherit">Cancel</Button>
                    <Button variant="contained" onClick={handleAddSubmit} sx={{ bgcolor: '#6366f1' }}>
                        {selectedPrj ? 'Save Changes' : 'Create Project'}
                    </Button>
                </DialogActions>
            </Dialog>


            <Dialog open={openAssign} onClose={() => setOpenAssign(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Manage Team: {selectedPrj?.name}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                        {users.map(emp => (
                            <Box
                                key={emp.id}
                                onClick={() => {
                                    if (assignedTeam.includes(emp.id)) {
                                        setAssignedTeam(assignedTeam.filter(id => id !== emp.id));
                                    } else {
                                        setAssignedTeam([...assignedTeam, emp.id]);
                                    }
                                }}
                                sx={{
                                    p: 1.5,
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor: assignedTeam.includes(emp.id) ? '#6366f1' : '#e2e8f0',
                                    bgcolor: assignedTeam.includes(emp.id) ? '#f5f3ff' : 'transparent',
                                    cursor: 'pointer',
                                    transition: '0.2s',
                                    '&:hover': { borderColor: '#6366f1' },
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5
                                }}
                            >
                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: assignedTeam.includes(emp.id) ? '#6366f1' : '#cbd5e1' }}>
                                    {emp.firstName.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: assignedTeam.includes(emp.id) ? '#6366f1' : '#334155' }}>
                                        {emp.firstName} {emp.lastName}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>{emp.designation || 'Employee'}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setOpenAssign(false)} color="inherit">Cancel</Button>
                    <Button variant="contained" onClick={handleAssignSubmit} sx={{ bgcolor: '#6366f1' }} disabled={assignMembers.isPending}>
                        Update Team
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={!!alert} autoHideDuration={6000} onClose={() => setAlert(null)}>
                <Alert severity={alert?.severity} onClose={() => setAlert(null)} sx={{ width: '100%' }}>
                    {alert?.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
