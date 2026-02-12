'use client';

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Avatar,
    Chip,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Tooltip,
    Paper
} from '@mui/material';
import { DataTable, StatusBadge } from '@repo/ui';
import type { Column } from '@repo/ui';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const initialEmployees: Record<string, unknown>[] = [
    { id: 'EMP001', name: 'Sarah Johnson', email: 'sarah.j@company.com', department: 'Engineering', designation: 'Sr. Developer', status: 'active', avatar: 'S', projects: ['Website Redesign'] },
    { id: 'EMP002', name: 'Mike Chen', email: 'mike.c@company.com', department: 'Design', designation: 'UI/UX Lead', status: 'active', avatar: 'M', projects: ['Mobile App v2'] },
    { id: 'EMP003', name: 'Emily Davis', email: 'emily.d@company.com', department: 'Marketing', designation: 'Marketing Manager', status: 'active', avatar: 'E', projects: [] },
    { id: 'EMP004', name: 'James Wilson', email: 'james.w@company.com', department: 'Engineering', designation: 'DevOps Engineer', status: 'active', avatar: 'J', projects: ['API Migration'] },
    { id: 'EMP005', name: 'Priya Patel', email: 'priya.p@company.com', department: 'Product', designation: 'Product Manager', status: 'inactive', avatar: 'P', projects: [] },
    { id: 'EMP006', name: 'Alex Thompson', email: 'alex.t@company.com', department: 'Engineering', designation: 'Frontend Dev', status: 'active', avatar: 'A', projects: ['Website Redesign'] },
];

const projects = ['Website Redesign', 'Mobile App v2', 'API Migration', 'Analytics Dashboard', 'Security Audit'];

export default function EmployeesPage() {
    const [employees, setEmployees] = useState(initialEmployees);
    const [openAdd, setOpenAdd] = useState(false);
    const [openAssign, setOpenAssign] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', email: '', department: 'Engineering', designation: '' });
    const [assignedProjects, setAssignedProjects] = useState<string[]>([]);

    const handleAddOpen = () => {
        setSelectedEmp(null);
        setFormData({ name: '', email: '', department: 'Engineering', designation: '' });
        setOpenAdd(true);
    };

    const handleAddSubmit = () => {
        if (selectedEmp) {
            setEmployees(employees.map(emp =>
                emp.id === selectedEmp.id ? { ...emp, ...formData } : emp
            ));
        } else {
            const newEmp = {
                id: `EMP00${employees.length + 1}`,
                ...formData,
                status: 'active',
                avatar: formData.name.charAt(0).toUpperCase(),
                projects: []
            };
            setEmployees([newEmp, ...employees]);
        }
        setOpenAdd(false);
    };

    const handleAssignOpen = (emp: any) => {
        setSelectedEmp(emp);
        setAssignedProjects(emp.projects || []);
        setOpenAssign(true);
    };

    const handleAssignSubmit = () => {
        setEmployees(employees.map(emp =>
            emp.id === selectedEmp.id ? { ...emp, projects: assignedProjects } : emp
        ));
        setOpenAssign(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            setEmployees(employees.filter(emp => emp.id !== id));
        }
    };

    const handleEditOpen = (emp: any) => {
        setSelectedEmp(emp);
        setFormData({
            name: String(emp.name),
            email: String(emp.email),
            department: String(emp.department),
            designation: String(emp.designation)
        });
        setOpenAdd(true);
    };

    const columns: Column<Record<string, unknown>>[] = [
        {
            key: 'name',
            label: 'Employee',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#6366f1', fontSize: '0.8rem', fontWeight: 600 }}>
                        {String(row.avatar)}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>
                            {String(row.name)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                            {String(row.email)}
                        </Typography>
                    </Box>
                </Box>
            ),
        },
        { key: 'department', label: 'Department' },
        {
            key: 'projects',
            label: 'Projects',
            render: (row: any) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(row.projects as string[])?.slice(0, 2).map(p => (
                        <Chip key={p} label={p} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                    ))}
                    {(row.projects as string[])?.length > 2 && (
                        <Chip label={`+${(row.projects as string[]).length - 2}`} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                    )}
                    {(row.projects as string[])?.length === 0 && (
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>None</Typography>
                    )}
                </Box>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge status={String(row.status)} />,
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (row) => (
                <Box>
                    <Tooltip title="Assign Projects">
                        <IconButton size="small" onClick={() => handleAssignOpen(row)} sx={{ color: '#6366f1' }}>
                            <AssignmentIndOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEditOpen(row)} sx={{ color: '#64748b' }}>
                            <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(String(row.id))} sx={{ color: '#ef4444' }}>
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                        Employees
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Manage your team members and their project assignments
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FilterListIcon />}
                        sx={{ borderColor: '#e2e8f0', color: '#64748b', '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' } }}
                    >
                        Filter
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddOpen}
                        sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
                    >
                        Add Employee
                    </Button>
                </Box>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { label: 'Total', value: employees.length, color: '#6366f1' },
                    { label: 'Active', value: employees.filter(e => e.status === 'active').length, color: '#10b981' },
                    { label: 'On Leave', value: '12', color: '#f59e0b' },
                    { label: 'Inactive', value: employees.filter(e => e.status === 'inactive').length, color: '#ef4444' },
                ].map((stat) => (
                    <Grid item xs={6} sm={3} key={stat.label}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: '12px',
                                border: '1px solid rgba(226,232,240,0.8)',
                                bgcolor: '#fff',
                                textAlign: 'center',
                            }}
                        >
                            <Typography variant="h5" sx={{ fontWeight: 800, color: stat.color }}>
                                {stat.value}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                                {stat.label}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <DataTable columns={columns} data={employees} />

            {/* Add/Edit Employee Dialog */}
            <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>{selectedEmp ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <TextField
                            label="Full Name"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            label="Email Address"
                            fullWidth
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <TextField
                            select
                            label="Department"
                            fullWidth
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        >
                            {['Engineering', 'Design', 'Marketing', 'Product', 'HR'].map(dept => (
                                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Designation"
                            fullWidth
                            value={formData.designation}
                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setOpenAdd(false)} color="inherit">Cancel</Button>
                    <Button variant="contained" onClick={handleAddSubmit} sx={{ bgcolor: '#6366f1' }}>
                        {selectedEmp ? 'Save Changes' : 'Create Account'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Assign Projects Dialog */}
            <Dialog open={openAssign} onClose={() => setOpenAssign(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Assign Projects: {selectedEmp?.name}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                        {projects.map(project => (
                            <Box
                                key={project}
                                onClick={() => {
                                    if (assignedProjects.includes(project)) {
                                        setAssignedProjects(assignedProjects.filter(p => p !== project));
                                    } else {
                                        setAssignedProjects([...assignedProjects, project]);
                                    }
                                }}
                                sx={{
                                    p: 1.5,
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor: assignedProjects.includes(project) ? '#6366f1' : '#e2e8f0',
                                    bgcolor: assignedProjects.includes(project) ? '#f5f3ff' : 'transparent',
                                    cursor: 'pointer',
                                    transition: '0.2s',
                                    '&:hover': { borderColor: '#6366f1' }
                                }}
                            >
                                <Typography variant="body2" sx={{ fontWeight: 600, color: assignedProjects.includes(project) ? '#6366f1' : '#334155' }}>
                                    {project}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setOpenAssign(false)} color="inherit">Cancel</Button>
                    <Button variant="contained" onClick={handleAssignSubmit} sx={{ bgcolor: '#6366f1' }}>Save Assignments</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}
