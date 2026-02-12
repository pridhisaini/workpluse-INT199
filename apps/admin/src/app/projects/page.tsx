'use client';

import React, { useState } from 'react';
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
    Tooltip
} from '@mui/material';
import { StatusBadge } from '@repo/ui';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';

const initialProjects = [
    {
        id: 'PRJ001',
        name: 'Website Redesign',
        description: 'Complete overhaul of the company website with modern UI',
        status: 'active',
        progress: 78,
        team: ['Sarah Johnson', 'Mike Chen', 'James Wilson', 'Alex Thompson', 'Lisa Wang'],
        deadline: '2026-03-15',
        color: '#6366f1',
        budget: '$45,000',
    },
    {
        id: 'PRJ002',
        name: 'Mobile App v2.0',
        description: 'Native mobile app with offline support and push notifications',
        status: 'active',
        progress: 45,
        team: ['Mike Chen', 'Emily Davis', 'David Brown'],
        deadline: '2026-04-20',
        color: '#0ea5e9',
        budget: '$62,000',
    },
    {
        id: 'PRJ003',
        name: 'API Migration',
        description: 'Migrate legacy REST API to GraphQL with improved caching',
        status: 'active',
        progress: 92,
        team: ['James Wilson', 'Alex Thompson', 'David Brown'],
        deadline: '2026-02-28',
        color: '#10b981',
        budget: '$28,000',
    },
];

const allEmployees = ['Sarah Johnson', 'Mike Chen', 'Emily Davis', 'James Wilson', 'Priya Patel', 'Alex Thompson', 'Lisa Wang', 'David Brown'];

export default function ProjectsPage() {
    const [projects, setProjects] = useState(initialProjects);
    const [openAdd, setOpenAdd] = useState(false);
    const [openAssign, setOpenAssign] = useState(false);
    const [selectedPrj, setSelectedPrj] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', description: '', deadline: '', budget: '', color: '#6366f1' });
    const [assignedTeam, setAssignedTeam] = useState<string[]>([]);

    const handleAddOpen = () => {
        setSelectedPrj(null);
        setFormData({ name: '', description: '', deadline: '', budget: '', color: '#6366f1' });
        setOpenAdd(true);
    };

    const handleEditOpen = (prj: any) => {
        setSelectedPrj(prj);
        setFormData({
            name: prj.name,
            description: prj.description,
            deadline: prj.deadline,
            budget: prj.budget,
            color: prj.color
        });
        setOpenAdd(true);
    };

    const handleAddSubmit = () => {
        if (selectedPrj) {
            setProjects(projects.map(prj =>
                prj.id === selectedPrj.id ? { ...prj, ...formData } : prj
            ));
        } else {
            const newPrj = {
                id: `PRJ00${projects.length + 1}`,
                ...formData,
                status: 'planning',
                progress: 0,
                team: []
            };
            setProjects([...projects, newPrj]);
        }
        setOpenAdd(false);
    };

    const handleAssignOpen = (prj: any) => {
        setSelectedPrj(prj);
        setAssignedTeam(prj.team || []);
        setOpenAssign(true);
    };

    const handleAssignSubmit = () => {
        setProjects(projects.map(prj =>
            prj.id === selectedPrj.id ? { ...prj, team: assignedTeam } : prj
        ));
        setOpenAssign(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            setProjects(projects.filter(p => p.id !== id));
        }
    };

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
                                    borderColor: `${project.color}40`,
                                },
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: project.color }} />
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
                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>Progress</Typography>
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

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.7rem', border: '2px solid #fff' } }}>
                                    {project.team.map((name, i) => (
                                        <Avatar key={i} sx={{ bgcolor: project.color }}>{name.charAt(0)}</Avatar>
                                    ))}
                                </AvatarGroup>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.68rem' }}>
                                        Deadline
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600, fontSize: '0.75rem' }}>
                                        {project.deadline}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ pt: 2, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                    Budget: <Box component="span" sx={{ color: '#1e293b' }}>{project.budget}</Box>
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


            {/* New Project Dialog */}
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
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Budget"
                                    fullWidth
                                    placeholder="$0.00"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                        <TextField
                            select
                            label="Theme Color"
                            fullWidth
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        >
                            {[
                                { name: 'Indigo', value: '#6366f1' },
                                { name: 'Sky', value: '#0ea5e9' },
                                { name: 'Emerald', value: '#10b981' },
                                { name: 'Amber', value: '#f59e0b' },
                                { name: 'Rose', value: '#f43f5e' },
                            ].map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: option.value }} />
                                        {option.name}
                                    </Box>
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setOpenAdd(false)} color="inherit">Cancel</Button>
                    <Button variant="contained" onClick={handleAddSubmit} sx={{ bgcolor: '#6366f1' }}>
                        {selectedPrj ? 'Save Changes' : 'Create Project'}
                    </Button>
                </DialogActions>
            </Dialog>


            {/* Manage Team Dialog */}
            <Dialog open={openAssign} onClose={() => setOpenAssign(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Manage Team: {selectedPrj?.name}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                        {allEmployees.map(emp => (
                            <Box
                                key={emp}
                                onClick={() => {
                                    if (assignedTeam.includes(emp)) {
                                        setAssignedTeam(assignedTeam.filter(p => p !== emp));
                                    } else {
                                        setAssignedTeam([...assignedTeam, emp]);
                                    }
                                }}
                                sx={{
                                    p: 1.5,
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor: assignedTeam.includes(emp) ? '#6366f1' : '#e2e8f0',
                                    bgcolor: assignedTeam.includes(emp) ? '#f5f3ff' : 'transparent',
                                    cursor: 'pointer',
                                    transition: '0.2s',
                                    '&:hover': { borderColor: '#6366f1' }
                                }}
                            >
                                <Typography variant="body2" sx={{ fontWeight: 600, color: assignedTeam.includes(emp) ? '#6366f1' : '#334155' }}>
                                    {emp}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setOpenAssign(false)} color="inherit">Cancel</Button>
                    <Button variant="contained" onClick={handleAssignSubmit} sx={{ bgcolor: '#6366f1' }}>Update Team</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
