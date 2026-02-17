'use client';

import React from 'react';
import {
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    IconButton,
    Avatar,
    Tooltip,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { SidebarItem } from '../types';

interface SidebarProps {
    items: SidebarItem[];
    appName: string;
    appLogo?: React.ReactNode;
    open: boolean;
    onToggle: () => void;
    width: number;
    collapsedWidth: number;
    accentColor?: string;
    currentPath?: string;
    LinkComponent?: React.ElementType;
}

export default function Sidebar({
    items,
    appName,
    appLogo,
    open,
    onToggle,
    width,
    collapsedWidth,
    accentColor = '#6366f1',
    currentPath = '/',
    LinkComponent,
}: SidebarProps) {
    return (
        <Box
            sx={{
                width: open ? width : collapsedWidth,
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                zIndex: 1200,
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                borderRight: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            {/* Logo Area */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: open ? 'space-between' : 'center',
                    px: open ? 2.5 : 1,
                    py: 2.5,
                    minHeight: 72,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                {open && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {appLogo || (
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`,
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                }}
                            >
                                {appName.charAt(0)}
                            </Avatar>
                        )}
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '1.1rem',
                                letterSpacing: '-0.01em',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {appName}
                        </Typography>
                    </Box>
                )}
                <IconButton
                    onClick={onToggle}
                    sx={{
                        color: 'rgba(255,255,255,0.5)',
                        '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
                    }}
                    size="small"
                >
                    {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
            </Box>

            {/* Navigation */}
            <Box sx={{ flexGrow: 1, py: 1.5, overflow: 'auto' }}>
                {open && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'rgba(255,255,255,0.35)',
                            px: 3,
                            py: 1,
                            display: 'block',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                        }}
                    >
                        Main Menu
                    </Typography>
                )}
                <List sx={{ px: 1 }}>
                    {items.map((item) => {
                        const isActive = currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href));
                        const button = (
                            <ListItemButton
                                key={item.label}
                                component={LinkComponent || 'a'}
                                {...(LinkComponent ? { href: item.href } : { href: item.href })}
                                selected={isActive}
                                sx={{
                                    borderRadius: '10px',
                                    mb: 0.3,
                                    mx: 0.5,
                                    minHeight: 44,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: open ? 2 : 1.5,
                                    color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                                    bgcolor: isActive ? `${accentColor}22` : 'transparent',
                                    '&:hover': {
                                        bgcolor: isActive ? `${accentColor}33` : 'rgba(255,255,255,0.06)',
                                        color: '#fff',
                                    },
                                    '&.Mui-selected': {
                                        bgcolor: `${accentColor}22`,
                                        '&:hover': { bgcolor: `${accentColor}33` },
                                    },
                                    transition: 'all 0.2s',
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: open ? 40 : 'unset',
                                        color: isActive ? accentColor : 'rgba(255,255,255,0.45)',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                {open && (
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{
                                            fontSize: '0.875rem',
                                            fontWeight: isActive ? 600 : 400,
                                        }}
                                    />
                                )}
                                {open && item.badge !== undefined && item.badge > 0 && (
                                    <Box
                                        sx={{
                                            bgcolor: accentColor,
                                            color: '#fff',
                                            borderRadius: '6px',
                                            px: 1,
                                            py: 0.2,
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            minWidth: 20,
                                            textAlign: 'center',
                                        }}
                                    >
                                        {item.badge}
                                    </Box>
                                )}
                            </ListItemButton>
                        );

                        return open ? (
                            <React.Fragment key={item.label}>{button}</React.Fragment>
                        ) : (
                            <Tooltip key={item.label} title={item.label} placement="right" arrow>
                                {button}
                            </Tooltip>
                        );
                    })}
                </List>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    p: 2,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: open ? 'flex-start' : 'center',
                    gap: 1.5,
                }}
            >
                <Avatar
                    sx={{
                        width: 32,
                        height: 32,
                        bgcolor: `${accentColor}44`,
                        color: accentColor,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                    }}
                >
                    ⚡
                </Avatar>
                {open && (
                    <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', display: 'block', lineHeight: 1.2 }}>
                            Powered by
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.7rem' }}>
                            WorkForce Pro
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
