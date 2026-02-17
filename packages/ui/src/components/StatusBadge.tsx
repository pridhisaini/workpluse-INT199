'use client';

import React from 'react';
import { Chip } from '@mui/material';

interface StatusBadgeProps {
    status: string;
    size?: 'small' | 'medium';
}

const statusColors: Record<string, { bg: string; color: string }> = {
    active: { bg: '#ecfdf5', color: '#059669' },
    present: { bg: '#ecfdf5', color: '#059669' },
    completed: { bg: '#ecfdf5', color: '#059669' },
    online: { bg: '#ecfdf5', color: '#059669' },
    inactive: { bg: '#fffbeb', color: '#d97706' },
    absent: { bg: '#fef2f2', color: '#dc2626' },
    suspended: { bg: '#fef2f2', color: '#dc2626' },
    offline: { bg: '#f1f5f9', color: '#64748b' },
    late: { bg: '#fffbeb', color: '#d97706' },
    'on-hold': { bg: '#fffbeb', color: '#d97706' },
    pending: { bg: '#fffbeb', color: '#d97706' },
    'half-day': { bg: '#fff7ed', color: '#ea580c' },
    leave: { bg: '#f5f3ff', color: '#7c3aed' },
    holiday: { bg: '#f0f9ff', color: '#0284c7' },
    planning: { bg: '#f0f9ff', color: '#0284c7' },
    running: { bg: '#ecfdf5', color: '#059669' },
    paused: { bg: '#fffbeb', color: '#d97706' },
    archived: { bg: '#f1f5f9', color: '#64748b' },
};

export default function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
    const colors = statusColors[status] || { bg: '#f1f5f9', color: '#64748b' };

    return (
        <Chip
            label={status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            size={size}
            sx={{
                bgcolor: colors.bg,
                color: colors.color,
                fontWeight: 600,
                fontSize: '0.75rem',
                border: 'none',
                borderRadius: '8px',
                '& .MuiChip-label': { px: 1.5 },
            }}
        />
    );
}
