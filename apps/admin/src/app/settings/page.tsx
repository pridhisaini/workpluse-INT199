'use client';

import React from 'react';
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
} from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

export default function SettingsPage() {
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
                                    defaultValue="Acme Corporation"
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Admin Email"
                                    defaultValue="admin@acme.com"
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Timezone"
                                    defaultValue="Asia/Kolkata (IST)"
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Work Hours / Day"
                                    defaultValue="8"
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
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1e293b', mb: 2 }}>
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
                    sx={{
                        bgcolor: '#6366f1',
                        '&:hover': { bgcolor: '#4f46e5' },
                        boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                        px: 4,
                    }}
                >
                    Save Settings
                </Button>
            </Box>
        </Box>
    );
}
