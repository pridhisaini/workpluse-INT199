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
    Alert
} from '@mui/material';
import {
    EmailOutlined,
    LockOutlined,
    VisibilityOutlined,
    VisibilityOffOutlined,
    AdminPanelSettingsOutlined
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useLogin, useApiClient } from '@repo/api';

export default function AdminLoginPage() {
    const router = useRouter();
    const client = useApiClient();
    const loginMutation = useLogin(client);

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await loginMutation.mutateAsync({ email, password });
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to sign in. Please check your credentials.');
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
                overflow: 'hidden'
            }}
        >
            {/* Artistic background elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '-15%',
                    right: '-10%',
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
                    left: '-10%',
                    width: 700,
                    height: 700,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)',
                    zIndex: 0
                }}
            />

            <Fade in={true} timeout={1000}>
                <Container maxWidth="xs" sx={{ zIndex: 1 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            borderRadius: '32px',
                            border: '1px solid rgba(255, 255, 255, 0.8)',
                            background: 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(24px)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
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
                                <AdminPanelSettingsOutlined sx={{ fontSize: 32 }} />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e1b4b', mb: 1, letterSpacing: '-0.5px' }}>
                                Admin Portal
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
                                Professional Management Suite
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleLogin}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    variant="outlined"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                            '&:hover': {
                                                bgcolor: 'rgba(255,255,255,0.9)',
                                            }
                                        }
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label="Password"
                                    variant="outlined"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                                            '&:hover': {
                                                bgcolor: 'rgba(255,255,255,0.9)',
                                            }
                                        }
                                    }}
                                />

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
                                    <Link
                                        href="#"
                                        sx={{
                                            fontSize: '0.85rem',
                                            color: '#6366f1',
                                            textDecoration: 'none',
                                            fontWeight: 600,
                                            '&:hover': { textDecoration: 'underline' }
                                        }}
                                    >
                                        Forgot Password?
                                    </Link>
                                </Box>

                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    disabled={loginMutation.isPending}
                                    sx={{
                                        py: 1.8,
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
                                    {loginMutation.isPending ? 'Authenticating...' : 'Sign In'}
                                </Button>

                                <Typography variant="body2" sx={{ textAlign: 'center', color: '#64748b', mt: 1 }}>
                                    Need an admin account?{' '}
                                    <Link
                                        href="/register"
                                        sx={{
                                            color: '#6366f1',
                                            textDecoration: 'none',
                                            fontWeight: 700,
                                            '&:hover': { textDecoration: 'underline' }
                                        }}
                                    >
                                        Register Now
                                    </Link>
                                </Typography>
                            </Box>
                        </form>
                    </Paper>
                </Container>
            </Fade>
        </Box>
    );
}
