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
    Container,
    Fade,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    EmailOutlined,
    LockOutlined,
    VisibilityOutlined,
    VisibilityOffOutlined,
    WorkOutlineOutlined,
    EastOutlined
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';

export default function UnifiedLoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Small delay for UX feel
        await new Promise(res => setTimeout(res, 800));

        const result = await login(email, password);
        if (result.success) {
            // AuthContext handles the redirect
        } else {
            setError(result.error || 'Invalid credentials');
            setIsLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f8fafc',
                position: 'relative',
                overflow: 'hidden',
                backgroundImage: `
                    radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.05) 0%, transparent 40%),
                    radial-gradient(circle at 100% 100%, rgba(20, 184, 166, 0.05) 0%, transparent 40%),
                    radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.03) 0%, transparent 40%),
                    radial-gradient(circle at 0% 100%, rgba(14, 165, 233, 0.03) 0%, transparent 40%)
                `
            }}
        >
            {/* Soft decorative blur orbs */}
            <Box sx={{
                position: 'absolute',
                top: '10%',
                right: '15%',
                width: '30vw',
                height: '30vw',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.03)',
                filter: 'blur(100px)',
                zIndex: 0
            }} />
            <Box sx={{
                position: 'absolute',
                bottom: '10%',
                left: '10%',
                width: '25vw',
                height: '25vw',
                borderRadius: '50%',
                background: 'rgba(20, 184, 166, 0.03)',
                filter: 'blur(80px)',
                zIndex: 0
            }} />

            <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
                <Fade in={true} timeout={1000}>
                    <Box>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    p: 1.5,
                                    borderRadius: '16px',
                                    bgcolor: 'white',
                                    color: '#6366f1',
                                    mb: 2.5,
                                    boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.15)',
                                    border: '1px solid rgba(99, 102, 241, 0.1)'
                                }}
                            >
                                <WorkOutlineOutlined sx={{ fontSize: 32 }} />
                            </Box>
                            <Typography variant="h4" sx={{
                                fontWeight: 800,
                                color: '#0f172a',
                                mb: 1,
                                letterSpacing: '-1px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1
                            }}>
                                WorkForce <Box component="span" sx={{ color: '#6366f1' }}>Pro</Box>
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
                                Sign in to manage your time & tasks
                            </Typography>
                        </Box>

                        <Paper
                            elevation={0}
                            sx={{
                                p: 4.5,
                                borderRadius: '32px',
                                border: '1px solid rgba(226, 232, 240, 0.8)',
                                bgcolor: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(20px)',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
                            }}
                        >
                            {error && (
                                <Fade in={!!error}>
                                    <Alert
                                        severity="error"
                                        onClose={() => setError(null)}
                                        sx={{
                                            mb: 3,
                                            borderRadius: '16px',
                                            bgcolor: '#fef2f2',
                                            color: '#991b1b',
                                            '& .MuiAlert-icon': { color: '#ef4444' },
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {error}
                                    </Alert>
                                </Fade>
                            )}

                            <form onSubmit={handleLogin}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 1, display: 'block', ml: 0.5 }}>
                                            EMAIL ADDRESS
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="sarah@workforce.pro"
                                            required
                                            disabled={isLoading}
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
                                                    bgcolor: '#f8fafc',
                                                    '& fieldset': { borderColor: '#e2e8f0' },
                                                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                                                    '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: '2px' },
                                                    transition: 'all 0.2s'
                                                },
                                            }}
                                        />
                                    </Box>

                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, px: 0.5 }}>
                                            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700 }}>
                                                PASSWORD
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: '#6366f1',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    '&:hover': { color: '#4f46e5', textDecoration: 'underline' }
                                                }}
                                            >
                                                Forgot?
                                            </Typography>
                                        </Box>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            disabled={isLoading}
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
                                                            sx={{ color: '#94a3b8' }}
                                                        >
                                                            {showPassword ? <VisibilityOffOutlined sx={{ fontSize: 18 }} /> : <VisibilityOutlined sx={{ fontSize: 18 }} />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '16px',
                                                    bgcolor: '#f8fafc',
                                                    '& fieldset': { borderColor: '#e2e8f0' },
                                                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                                                    '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: '2px' },
                                                    transition: 'all 0.2s'
                                                },
                                            }}
                                        />
                                    </Box>

                                    <Button
                                        fullWidth
                                        type="submit"
                                        variant="contained"
                                        disabled={isLoading}
                                        endIcon={!isLoading && <EastOutlined />}
                                        sx={{
                                            py: 1.8,
                                            borderRadius: '16px',
                                            bgcolor: '#1e293b',
                                            color: 'white',
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            boxShadow: '0 10px 15px -3px rgba(30, 41, 59, 0.2)',
                                            '&:hover': {
                                                bgcolor: '#0f172a',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 12px 20px -3px rgba(30, 41, 59, 0.3)',
                                            },
                                            '&:disabled': {
                                                bgcolor: '#94a3b8',
                                                color: 'white'
                                            },
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Continue to Dashboard'}
                                    </Button>
                                </Box>
                            </form>
                        </Paper>

                        {/* Demo access hint */}
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    py: 1.5,
                                    px: 2.5,
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    bgcolor: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5
                                }}
                            >
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#6366f1' }} />
                                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                                    Admin: admin@workforce.pro
                                </Typography>
                            </Paper>
                            <Paper
                                elevation={0}
                                sx={{
                                    py: 1.5,
                                    px: 2.5,
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    bgcolor: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5
                                }}
                            >
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#14b8a6' }} />
                                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                                    Staff: employee@workforce.pro
                                </Typography>
                            </Paper>
                        </Box>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
}
