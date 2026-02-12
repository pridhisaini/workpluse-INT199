'use client';

import React from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
} from '@mui/material';
import type { Column } from '../types';

interface DataTableProps<T extends Record<string, unknown>> {
    columns: Column<T>[];
    data: T[];
    title?: string;
    emptyMessage?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
    columns,
    data,
    title,
    emptyMessage = 'No data available',
}: DataTableProps<T>) {
    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: '16px',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                overflow: 'hidden',
            }}
        >
            {title && (
                <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f1f5f9' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1e293b' }}>
                        {title}
                    </Typography>
                </Box>
            )}
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {columns.map((col) => (
                                <TableCell
                                    key={col.key}
                                    align={col.align || 'left'}
                                    sx={{
                                        fontWeight: 600,
                                        color: '#64748b',
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        bgcolor: '#f8fafc',
                                        borderBottom: '1px solid #e2e8f0',
                                        py: 1.5,
                                        width: col.width,
                                    }}
                                >
                                    {col.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    align="center"
                                    sx={{ py: 6, color: '#94a3b8' }}
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, idx) => (
                                <TableRow
                                    key={idx}
                                    sx={{
                                        '&:hover': { bgcolor: '#f8fafc' },
                                        transition: 'background 0.15s',
                                        '&:last-child td': { borderBottom: 0 },
                                    }}
                                >
                                    {columns.map((col) => (
                                        <TableCell
                                            key={col.key}
                                            align={col.align || 'left'}
                                            sx={{
                                                fontSize: '0.875rem',
                                                color: '#334155',
                                                py: 1.8,
                                                borderBottom: '1px solid #f1f5f9',
                                            }}
                                        >
                                            {col.render ? col.render(row) : String(row[col.key] ?? '')}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}
