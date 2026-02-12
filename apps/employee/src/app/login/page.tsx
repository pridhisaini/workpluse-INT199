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
    Fade
} from '@mui/material';
import {
    EmailOutlined,
    LockOutlined,
    VisibilityOutlined,
    VisibilityOffOutlined
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate login
        setTimeout(() => {
            setIsLoading(false);
            router.push('/');
        }, 1500);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #e0f2fe 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Background elements for modern look */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-5%',
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)',
                    zIndex: 0
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '-10%',
                    left: '-5%',
                    width: 500,
                    height: 500,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)',
                    zIndex: 0
                }}
            />

            <Fade in={true} timeout={1000}>
                <Container maxWidth="xs" sx={{ zIndex: 1 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            borderRadius: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.7)',
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                        }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    p: 1.5,
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
                                    color: '#fff',
                                    mb: 2,
                                    boxShadow: '0 8px 16px rgba(20,184,166,0.2)'
                                }}
                            >
                                <LockOutlined sx={{ fontSize: 28 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
                                Welcome Back
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                Sign in to your employee portal
                            </Typography>
                        </Box>

                        <form onSubmit={handleLogin}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    variant="outlined"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="sarah@workforce.pro"
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
                                            borderRadius: '12px',
                                            bgcolor: 'rgba(255,255,255,0.5)',
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
                                            borderRadius: '12px',
                                            bgcolor: 'rgba(255,255,255,0.5)',
                                        }
                                    }}
                                />

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Link
                                        href="#"
                                        sx={{
                                            fontSize: '0.8rem',
                                            color: '#14b8a6',
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
                                    disabled={isLoading}
                                    sx={{
                                        py: 1.5,
                                        borderRadius: '12px',
                                        bgcolor: '#14b8a6',
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        boxShadow: '0 10px 20px rgba(20,184,166,0.2)',
                                        '&:hover': {
                                            bgcolor: '#0d9488',
                                            boxShadow: '0 12px 24px rgba(20,184,166,0.3)',
                                        }
                                    }}
                                >
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </Button>

                                <Typography variant="caption" sx={{ textAlign: 'center', color: '#94a3b8', mt: 1 }}>
                                    Don't have an account? Contact your HR manager.
                                </Typography>
                            </Box>
                        </form>
                    </Paper>
                </Container>
            </Fade>
        </Box>
    );
}
