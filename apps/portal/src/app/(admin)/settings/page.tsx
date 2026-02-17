'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Switch,
    TextField,
    Button,
    Divider,
    Grid,
    FormControlLabel,
    Snackbar,
    Alert,
} from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useApiClient, useOrganization, useUpdateOrganization } from '@repo/api';
import { useAuth } from '../../AuthContext';

export default function SettingsPage() {
    const { user } = useAuth();
    const client = useApiClient();
    const { data: orgResponse, isLoading } = useOrganization(client, user?.organizationId);
    const updateMutation = useUpdateOrganization(client);

    const [formData, setFormData] = useState({
        name: '',
        adminEmail: '',
        timezone: 'Asia/Kolkata (IST)',
        workHours: '8',
    });

    const [alert, setAlert] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (orgResponse?.data) {
            setFormData(prev => ({
                ...prev,
                name: orgResponse.data.name || '',
            }));
        }
    }, [orgResponse]);

    const handleSave = async () => {
        if (!user?.organizationId) return;

        try {
            await updateMutation.mutateAsync({
                id: user.organizationId,
                data: {
                    name: formData.name,
                }
            });
            setAlert({ message: 'Settings saved successfully!', severity: 'success' });
        } catch (error) {
            setAlert({ message: 'Failed to save settings.', severity: 'error' });
        }
    };

    if (isLoading) return <Typography>Loading settings...</Typography>;

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                    Settings
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Manage your portal configuration and preferences
                </Typography>
            </Box>

            <Grid container spacing={2.5}>
                <Grid item xs={12} lg={8}>
                    {/* General Settings */}
                    <Paper
                        elevation={0}
                        sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(226,232,240,0.8)', mb: 2.5 }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1e293b', mb: 2.5 }}>
                            General
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Organization Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Admin Email"
                                    defaultValue={user?.email}
                                    disabled
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Timezone"
                                    value={formData.timezone}
                                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Work Hours / Day"
                                    value={formData.workHours}
                                    onChange={(e) => setFormData({ ...formData, workHours: e.target.value })}
                                    type="number"
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Notifications */}
                    <Paper
                        elevation={0}
                        sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(226,232,240,0.8)', mb: 2.5 }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1e293b', mb: 2 }}>
                            Notifications
                        </Typography>
                        {[
                            { label: 'Employee check-in/out alerts', description: 'Get notified when employees check in or out', defaultChecked: true },
                            { label: 'Late attendance alerts', description: 'Receive alerts for late arrivals', defaultChecked: true },
                            { label: 'Weekly summary reports', description: 'Automated weekly attendance and productivity reports', defaultChecked: false },
                            { label: 'Project milestone updates', description: 'Notifications for project progress milestones', defaultChecked: true },
                        ].map((item) => (
                            <Box
                                key={item.label}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    py: 1.5,
                                    borderBottom: '1px solid #f1f5f9',
                                    '&:last-child': { borderBottom: 'none' },
                                }}
                            >
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                                        {item.label}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                        {item.description}
                                    </Typography>
                                </Box>
                                <Switch defaultChecked={item.defaultChecked} color="primary" />
                            </Box>
                        ))}
                    </Paper>

                    {/* Security */}
                    <Paper
                        elevation={0}
                        sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(226,232,240,0.8)' }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1e293b', mb: 2 }}>
                            Security
                        </Typography>
                        {[
                            { label: 'Two-factor authentication', description: 'Add an extra layer of security to admin accounts', defaultChecked: false },
                            { label: 'Session timeout', description: 'Auto-logout after 30 minutes of inactivity', defaultChecked: true },
                            { label: 'IP whitelisting', description: 'Restrict access to approved IP addresses only', defaultChecked: false },
                        ].map((item) => (
                            <Box
                                key={item.label}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    py: 1.5,
                                    borderBottom: '1px solid #f1f5f9',
                                    '&:last-child': { borderBottom: 'none' },
                                }}
                            >
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                                        {item.label}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                        {item.description}
                                    </Typography>
                                </Box>
                                <Switch defaultChecked={item.defaultChecked} color="primary" />
                            </Box>
                        ))}
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Paper
                        elevation={0}
                        sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(226,232,240,0.8)' }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1e293b', mb: 2.5 }}>
                            Quick Actions
                        </Typography>
                        {[
                            { label: 'Export All Data', color: '#6366f1' },
                            { label: 'Generate Reports', color: '#0ea5e9' },
                            { label: 'Backup Database', color: '#10b981' },
                            { label: 'Clear Cache', color: '#f59e0b' },
                        ].map((action) => (
                            <Button
                                key={action.label}
                                fullWidth
                                variant="outlined"
                                sx={{
                                    mb: 1.5,
                                    borderColor: '#e2e8f0',
                                    color: action.color,
                                    fontWeight: 600,
                                    justifyContent: 'flex-start',
                                    borderRadius: '10px',
                                    py: 1.2,
                                    '&:hover': {
                                        borderColor: action.color,
                                        bgcolor: `${action.color}08`,
                                    },
                                }}
                            >
                                {action.label}
                            </Button>
                        ))}
                    </Paper>
                </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    startIcon={<SaveOutlinedIcon />}
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    sx={{
                        bgcolor: '#6366f1',
                        '&:hover': { bgcolor: '#4f46e5' },
                        boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                        px: 4,
                        borderRadius: '10px'
                    }}
                >
                    {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
                </Button>
            </Box>

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
