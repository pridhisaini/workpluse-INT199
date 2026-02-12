'use client';

import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';

interface ActivityItemProps {
    userName: string;
    action: string;
    time: string;
    type?: 'login' | 'logout' | 'time' | 'project' | 'attendance' | 'system';
}

const typeColors: Record<string, string> = {
    login: '#10b981',
    logout: '#ef4444',
    time: '#6366f1',
    project: '#0ea5e9',
    attendance: '#f59e0b',
    system: '#64748b',
};

export default function ActivityItem({ userName, action, time, type = 'system' }: ActivityItemProps) {
    const color = typeColors[type] || '#64748b';

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                py: 1.5,
                px: 0,
                borderBottom: '1px solid #f1f5f9',
                '&:last-child': { borderBottom: 'none' },
            }}
        >
            <Avatar
                sx={{
                    width: 32,
                    height: 32,
                    bgcolor: `${color}18`,
                    color: color,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                }}
            >
                {userName.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.84rem', lineHeight: 1.4 }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>{userName}</Box>{' '}
                    {action}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                    {time}
                </Typography>
            </Box>
        </Box>
    );
}
