'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import type { StatCardProps } from '../types';

const colorMap = {
    primary: { bg: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', light: '#eef2ff' },
    success: { bg: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', light: '#ecfdf5' },
    warning: { bg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', light: '#fffbeb' },
    error: { bg: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)', light: '#fef2f2' },
    info: { bg: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)', light: '#f0f9ff' },
};

export default function StatCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    color = 'primary',
}: StatCardProps) {
    const colors = colorMap[color];

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: '16px',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.08)',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                },
            }}
        >
            {/* Decorative gradient */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: colors.bg,
                    opacity: 0.08,
                }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#94a3b8',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontSize: '0.7rem',
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            color: '#1e293b',
                            mt: 0.5,
                            fontSize: '1.85rem',
                            letterSpacing: '-0.02em',
                            lineHeight: 1,
                        }}
                    >
                        {value}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        background: colors.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        boxShadow: `0 4px 12px ${color === 'primary' ? 'rgba(99,102,241,0.3)' : 'rgba(0,0,0,0.15)'}`,
                    }}
                >
                    {icon}
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {trend && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.3,
                            color: trend.direction === 'up' ? '#10b981' : '#ef4444',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            bgcolor: trend.direction === 'up' ? '#ecfdf5' : '#fef2f2',
                            px: 0.8,
                            py: 0.2,
                            borderRadius: '6px',
                        }}
                    >
                        {trend.direction === 'up' ? (
                            <TrendingUpIcon sx={{ fontSize: 14 }} />
                        ) : (
                            <TrendingDownIcon sx={{ fontSize: 14 }} />
                        )}
                        {trend.value}%
                    </Box>
                )}
                {subtitle && (
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
}
