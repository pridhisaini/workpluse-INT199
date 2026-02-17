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
    Paper,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import { DataTable, StatusBadge } from '@repo/ui';
import type { Column } from '@repo/ui';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
    useApiClient,
    useUsers,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
    useProjects,
    useSocket
} from '@repo/api';
import { User } from '@repo/types';
import { useAuth } from '../../AuthContext';

const SOCKET_URL = 'http://localhost:5000';

export default function EmployeesPage() {
    const { user: currentUser } = useAuth();
    const client = useApiClient();
    const { data: employeesData, isLoading, refetch } = useUsers(client);
    const { data: projectsData } = useProjects(client);
    const createUser = useCreateUser(client);
    const updateUser = useUpdateUser(client, '');
    const deleteUser = useDeleteUser(client, '');

    const [openAdd, setOpenAdd] = useState(false);
    const [openAssign, setOpenAssign] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState<User | null>(null);
    const [localEmployees, setLocalEmployees] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        department: 'Engineering',
        designation: '',
        role: 'employee',
        password: ''
    });
    const [assignedProjects, setAssignedProjects] = useState<string[]>([]);
    const [alert, setAlert] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

    // Socket for real-time status
    const { on } = useSocket({
        url: SOCKET_URL,
        token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
        userId: currentUser?.id
    });

    // Initialize local state
    React.useEffect(() => {
        if (employeesData?.data) {
            setLocalEmployees(employeesData.data.map((e: any) => ({
                ...e,
                realTimeStatus: (e.role === 'admin' && e.currentSession?.status === 'inactive') ? 'online' : (e.currentSession?.status === 'inactive' ? 'inactive' : (e.isWorking ? 'online' : 'offline'))
            })));
        }
    }, [employeesData]);

    // Handle real-time updates
    React.useEffect(() => {
        const handleUserOnline = ({ userId }: { userId: string }) => {
            // Ignore socket connection for Live Status (Working = Online)
        };

        const handleUserOffline = ({ userId }: { userId: string }) => {
            setLocalEmployees(prev => prev.map(emp =>
                emp.id === userId ? { ...emp, realTimeStatus: 'offline' } : emp
            ));
        };

        const handleSessionUpdate = (data: any) => {
            if (data.type === 'SESSION_TICK' || data.type === 'SESSION_START') {
                setLocalEmployees(prev => prev.map(emp => {
                    if (emp.id === data.userId) {
                        const displayStatus = (emp.role === 'admin' && data.status === 'inactive') ? 'online' : (data.status === 'inactive' ? 'inactive' : 'online');
                        return { ...emp, realTimeStatus: displayStatus };
                    }
                    return emp;
                }));
            } else if (data.type === 'SESSION_STOP') {
                setLocalEmployees(prev => prev.map(emp =>
                    emp.id === data.userId ? { ...emp, realTimeStatus: 'offline' } : emp
                ));
            }
        };

        on('USER_ONLINE', handleUserOnline);
        on('USER_OFFLINE', handleUserOffline);
        on('SESSION_UPDATE', handleSessionUpdate);
    }, [on]);

    const handleAddOpen = () => {
        setSelectedEmp(null);
        setFormData({ firstName: '', lastName: '', email: '', department: 'Engineering', designation: '', role: 'employee', password: '' });
        setOpenAdd(true);
    };

    const handleAddSubmit = async () => {
        try {
            if (selectedEmp) {
                // For a real app, you'd use the useUpdateUser hook properly with the correct ID.
                // For simplicity here, we'll just refetch after a manual axios call or wait for the mutation.
                await client.put(`/users/${selectedEmp.id}`, formData);
            } else {
                await createUser.mutateAsync({
                    ...formData,
                    organizationId: currentUser?.organizationId
                } as any);
            }
            refetch();
            setAlert({ message: selectedEmp ? 'Employee updated.' : 'Employee created.', severity: 'success' });
            setOpenAdd(false);
        } catch (error) {
            console.error('Failed to save employee:', error);
        }
    };

    const handleAssignOpen = (emp: User & { projects?: any[] }) => {
        setSelectedEmp(emp);
        const currentProjects = (emp as any).projects || [];
        setAssignedProjects(currentProjects.map((p: any) => p.id));
        setOpenAssign(true);
    };

    const handleAssignSubmit = async () => {
        if (!selectedEmp) return;
        try {
            await client.put(`/users/${selectedEmp.id}`, { projects: assignedProjects });
            refetch();
            setOpenAssign(false);
        } catch (error) {
            console.error('Failed to assign projects:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (id === currentUser?.id) {
            setAlert({ message: 'You cannot delete your own account.', severity: 'error' });
            return;
        }

        if (window.confirm('Are you sure you want to delete this employee? All their work history will be removed.')) {
            try {
                await client.delete(`/users/${id}`);
                setAlert({ message: 'Employee deleted successfully.', severity: 'success' });
                refetch();
            } catch (error: any) {
                console.error('Failed to delete employee:', error);
                setAlert({
                    message: error.message || 'Failed to delete employee. Please try again.',
                    severity: 'error'
                });
            }
        }
    };

    const handleEditOpen = (emp: User) => {
        setSelectedEmp(emp);
        setFormData({
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            department: emp.department || 'Engineering',
            designation: emp.designation || '',
            role: emp.role || 'employee',
            password: ''
        });
        setOpenAdd(true);
    };

    const columns: Column<any>[] = [
        {
            key: 'name',
            label: 'Employee',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#6366f1', fontSize: '0.8rem', fontWeight: 600 }}>
                        {(row.firstName || ' ').charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>
                            {row.firstName} {row.lastName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                            {row.email}
                        </Typography>
                    </Box>
                </Box>
            ),
        },
        { key: 'department', label: 'Department' },
        {
            key: 'role',
            label: 'Role',
            render: (row) => (
                <Chip
                    label={row.role === 'admin' ? 'Admin' : 'Employee'}
                    size="small"
                    sx={{
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        bgcolor: row.role === 'admin' ? '#f5f3ff' : '#f0fdfa',
                        color: row.role === 'admin' ? '#6366f1' : '#14b8a6',
                        borderRadius: '6px',
                    }}
                />
            )
        },
        {
            key: 'status',
            label: 'Live Status',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                        width: 8, height: 8, borderRadius: '50%',
                        bgcolor: row.realTimeStatus === 'online' ? '#10b981' : row.realTimeStatus === 'inactive' ? '#f59e0b' : '#94a3b8',
                        boxShadow: row.realTimeStatus === 'online' ? '0 0 8px #10b981' : row.realTimeStatus === 'inactive' ? '0 0 8px #f59e0b' : 'none'
                    }} />
                    <StatusBadge status={row.realTimeStatus || 'offline'} />
                </Box>
            ),
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
                        <IconButton size="small" onClick={() => handleDelete(row.id)} sx={{ color: '#ef4444' }}>
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress sx={{ color: '#6366f1' }} />
            </Box>
        );
    }

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
                    { label: 'Total', value: localEmployees.length, color: '#6366f1' },
                    { label: 'Online', value: localEmployees.filter((e: any) => e.realTimeStatus === 'online').length, color: '#10b981' },
                    { label: 'Offline', value: localEmployees.filter((e: any) => e.realTimeStatus === 'offline').length, color: '#64748b' },
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

            <DataTable columns={columns as any} data={localEmployees as any} />

            {/* Add/Edit Employee Dialog */}
            <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>{selectedEmp ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="First Name"
                                fullWidth
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                            <TextField
                                label="Last Name"
                                fullWidth
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </Box>
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
                        <TextField
                            select
                            label="Role"
                            fullWidth
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <MenuItem value="employee">Employee</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </TextField>
                        {!selectedEmp && (
                            <TextField
                                label="Password"
                                type="password"
                                fullWidth
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                helperText="Initial password for the employee"
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setOpenAdd(false)} color="inherit">Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleAddSubmit}
                        sx={{ bgcolor: '#6366f1' }}
                        disabled={createUser.isPending}
                    >
                        {selectedEmp ? 'Save Changes' : 'Create Account'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Assign Projects Dialog */}
            <Dialog open={openAssign} onClose={() => setOpenAssign(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Assign Projects: {selectedEmp?.firstName} {selectedEmp?.lastName}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                        {(projectsData?.data || []).map(project => (
                            <Box
                                key={project.id}
                                onClick={() => {
                                    if (assignedProjects.includes(project.id)) {
                                        setAssignedProjects(assignedProjects.filter(p => p !== project.id));
                                    } else {
                                        setAssignedProjects([...assignedProjects, project.id]);
                                    }
                                }}
                                sx={{
                                    p: 1.5,
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor: assignedProjects.includes(project.id) ? '#6366f1' : '#e2e8f0',
                                    bgcolor: assignedProjects.includes(project.id) ? '#f5f3ff' : 'transparent',
                                    cursor: 'pointer',
                                    transition: '0.2s',
                                    '&:hover': { borderColor: '#6366f1' }
                                }}
                            >
                                <Typography variant="body2" sx={{ fontWeight: 600, color: assignedProjects.includes(project.id) ? '#6366f1' : '#334155' }}>
                                    {project.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                    {project.description}
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

            <Snackbar
                open={!!alert}
                autoHideDuration={4000}
                onClose={() => setAlert(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setAlert(null)} severity={alert?.severity} sx={{ width: '100%', borderRadius: '10px' }}>
                    {alert?.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
