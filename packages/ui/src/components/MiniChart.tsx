'use client';

import React from 'react';
import { Box } from '@mui/material';

interface MiniChartProps {
    data: number[];
    color?: string;
    height?: number;
}

export default function MiniChart({ data, color = '#6366f1', height = 40 }: MiniChartProps) {
    if (data.length === 0) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height }}>
            {data.map((value, index) => {
                const barHeight = ((value - min) / range) * height * 0.85 + height * 0.15;
                return (
                    <Box
                        key={index}
                        sx={{
                            flex: 1,
                            height: barHeight,
                            bgcolor: `${color}${index === data.length - 1 ? '' : '40'}`,
                            borderRadius: '3px',
                            transition: 'height 0.3s ease',
                            minWidth: 4,
                            maxWidth: 12,
                        }}
                    />
                );
            })}
        </Box>
    );
}
