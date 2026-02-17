'use client';

import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Avatar,
    TextField,
    Button,
    Divider,
    Chip,
    Switch,
    Snackbar,
    Alert,
    CircularProgress
} from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import { useAuth } from '@/app/AuthContext';
import { useApiClient, useUpdateUser } from '@repo/api';

export default function ProfilePage() {
    const { user, updateUser: updateAuthUser } = useAuth();
    const client = useApiClient();

    const [formData, setFormData] = React.useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });

    const [alert, setAlert] = React.useState<{ message: string; severity: 'success' | 'error' } | null>(null);
    const [saving, setSaving] = React.useState(false);

    const updateUser = useUpdateUser(client, user?.id || '');

    // Initialize form from auth user
    React.useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    if (!user) return null;

    const fullName = `${user.firstName} ${user.lastName}`;
    const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateUser.mutateAsync(formData);
            updateAuthUser(formData);
            setAlert({ message: 'Profile updated successfully!', severity: 'success' });
        } catch (err: any) {
            setAlert({ message: err.message || 'Failed to update profile', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                    Profile
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Manage your personal information and preferences
                </Typography>
            </Box>

            <Grid container spacing={2.5}>
                {/* Profile Card */}
                <Grid item xs={12} lg={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: '16px',
                            border: '1px solid rgba(226,232,240,0.8)',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Banner */}
                        <Box
                            sx={{
                                height: 100,
                                background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
                                position: 'relative',
                            }}
                        />
                        <Box sx={{ px: 3, pb: 3, mt: -5, textAlign: 'center' }}>
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    bgcolor: '#0d9488',
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                    border: '4px solid #fff',
                                    mx: 'auto',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                }}
                            >
                                {initials}
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mt: 1.5 }}>
                                {fullName}
                            </Typography>
                            <Chip
                                label={user.designation || 'Employee'}
                                size="small"
                                sx={{ bgcolor: '#f0fdfa', color: '#0d9488', fontWeight: 600, mt: 0.5, fontSize: '0.75rem' }}
                            />
                            <Divider sx={{ my: 2 }} />
                            {[
                                { icon: <EmailOutlinedIcon sx={{ fontSize: 18 }} />, label: user.email },
                                { icon: <PhoneOutlinedIcon sx={{ fontSize: 18 }} />, label: user.phone || 'N/A' },
                                { icon: <BusinessOutlinedIcon sx={{ fontSize: 18 }} />, label: user.department || 'N/A' },
                                { icon: <BadgeOutlinedIcon sx={{ fontSize: 18 }} />, label: user.id.slice(0, 8).toUpperCase() },
                            ].map((item) => (
                                <Box
                                    key={item.label}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        py: 1,
                                        px: 1,
                                        color: '#64748b',
                                    }}
                                >
                                    {item.icon}
                                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                        {item.label}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* Details Form */}
                <Grid item xs={12} lg={8}>
                    <Paper
                        elevation={0}
                        sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(226,232,240,0.8)', mb: 2.5 }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1e293b' }}>
                                Personal Information
                            </Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Department"
                                    defaultValue={user.department || ''}
                                    size="small"
                                    disabled
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Designation"
                                    defaultValue={user.designation || ''}
                                    size="small"
                                    disabled
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Preferences */}
                    <Paper
                        elevation={0}
                        sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(226,232,240,0.8)' }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1e293b', mb: 2 }}>
                            Preferences
                        </Typography>
                        {[
                            { label: 'Email notifications', description: 'Receive project and task updates via email', defaultChecked: true },
                            { label: 'Desktop notifications', description: 'Show browser notifications for timer and reminders', defaultChecked: true },
                            { label: 'Weekly summary email', description: 'Get a weekly report of your hours and productivity', defaultChecked: false },
                            { label: 'Auto check-in', description: 'Automatically mark attendance when you start a timer', defaultChecked: true },
                        ].map((pref) => (
                            <Box
                                key={pref.label}
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
                                        {pref.label}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                        {pref.description}
                                    </Typography>
                                </Box>
                                <Switch defaultChecked={pref.defaultChecked} color="primary" />
                            </Box>
                        ))}
                    </Paper>

                    <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            startIcon={saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveOutlinedIcon />}
                            onClick={handleSave}
                            disabled={saving}
                            sx={{
                                bgcolor: '#14b8a6',
                                '&:hover': { bgcolor: '#0d9488' },
                                boxShadow: '0 4px 12px rgba(20,184,166,0.3)',
                                px: 4,
                            }}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar open={!!alert} autoHideDuration={4000} onClose={() => setAlert(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={alert?.severity} onClose={() => setAlert(null)} sx={{ borderRadius: '12px' }}>{alert?.message}</Alert>
            </Snackbar>
        </Box>
    );
}
