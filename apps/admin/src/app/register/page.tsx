'use client';

import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    InputAdornment,
    IconButton,
    Link,
    Container,
    Fade,
    Alert,
    Grid
} from '@mui/material';
import {
    EmailOutlined,
    LockOutlined,
    VisibilityOutlined,
    VisibilityOffOutlined,
    PersonOutline,
    HowToRegOutlined
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useRegister, useApiClient } from '@repo/api';

export default function AdminRegisterPage() {
    const router = useRouter();
    const client = useApiClient();
    const registerMutation = useRegister(client);

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await registerMutation.mutateAsync({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                role: 'admin' // Force admin role for this page
            });
            router.push('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register. Please try again.');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #dbeafe 100%)',
                position: 'relative',
                overflow: 'hidden',
                py: 4
            }}
        >
            {/* Artistic background elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '-15%',
                    left: '-10%',
                    width: 600,
                    height: 600,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
                    zIndex: 0
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '-20%',
                    right: '-10%',
                    width: 700,
                    height: 700,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)',
                    zIndex: 0
                }}
            />

            <Fade in={true} timeout={1000}>
                <Container maxWidth="sm" sx={{ zIndex: 1 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 4, md: 6 },
                            borderRadius: '32px',
                            border: '1px solid rgba(255, 255, 255, 0.8)',
                            background: 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(24px)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 5 }}>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    p: 2,
                                    borderRadius: '20px',
                                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                    color: '#fff',
                                    mb: 3,
                                    boxShadow: '0 10px 20px rgba(99,102,241,0.3)'
                                }}
                            >
                                <HowToRegOutlined sx={{ fontSize: 32 }} />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e1b4b', mb: 1, letterSpacing: '-0.5px' }}>
                                Create Admin Account
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
                                Join our professional management suite
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 4, borderRadius: '16px' }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleRegister}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="firstName"
                                        label="First Name"
                                        variant="outlined"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="John"
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonOutline sx={{ color: '#94a3b8', fontSize: 20 }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '16px',
                                                bgcolor: 'rgba(255,255,255,0.6)',
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="lastName"
                                        label="Last Name"
                                        variant="outlined"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Doe"
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonOutline sx={{ color: '#94a3b8', fontSize: 20 }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '16px',
                                                bgcolor: 'rgba(255,255,255,0.6)',
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="email"
                                        label="Email Address"
                                        variant="outlined"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="admin@workforce.pro"
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailOutlined sx={{ color: '#94a3b8', fontSize: 20 }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '16px',
                                                bgcolor: 'rgba(255,255,255,0.6)',
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="password"
                                        label="Password"
                                        variant="outlined"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockOutlined sx={{ color: '#94a3b8', fontSize: 20 }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                        size="small"
                                                    >
                                                        {showPassword ? <VisibilityOffOutlined sx={{ fontSize: 20 }} /> : <VisibilityOutlined sx={{ fontSize: 20 }} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '16px',
                                                bgcolor: 'rgba(255,255,255,0.6)',
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="confirmPassword"
                                        label="Confirm Password"
                                        variant="outlined"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockOutlined sx={{ color: '#94a3b8', fontSize: 20 }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '16px',
                                                bgcolor: 'rgba(255,255,255,0.6)',
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        fullWidth
                                        type="submit"
                                        variant="contained"
                                        disabled={registerMutation.isPending}
                                        sx={{
                                            py: 2,
                                            mt: 1,
                                            borderRadius: '16px',
                                            bgcolor: '#6366f1',
                                            textTransform: 'none',
                                            fontWeight: 800,
                                            fontSize: '1.05rem',
                                            boxShadow: '0 12px 24px rgba(99,102,241,0.25)',
                                            '&:hover': {
                                                bgcolor: '#4f46e5',
                                                boxShadow: '0 15px 30px rgba(99,102,241,0.35)',
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {registerMutation.isPending ? 'Creating Account...' : 'Create Admin Account'}
                                    </Button>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ textAlign: 'center', color: '#64748b' }}>
                                        Already have an account?{' '}
                                        <Link
                                            href="/login"
                                            sx={{
                                                color: '#6366f1',
                                                textDecoration: 'none',
                                                fontWeight: 700,
                                                '&:hover': { textDecoration: 'underline' }
                                            }}
                                        >
                                            Sign In
                                        </Link>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Container>
            </Fade>
        </Box>
    );
}
