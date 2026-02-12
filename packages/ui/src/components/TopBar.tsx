'use client';

import React from 'react';
import {
    Box,
    IconButton,
    Avatar,
    Typography,
    Badge,
    InputBase,
    Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Menu, MenuItem, Divider } from '@mui/material';

interface TopBarProps {
    userName?: string;
    userRole?: string;
    userAvatar?: string;
    onMenuClick?: () => void;
    onLogout?: () => void;
}

export default function TopBar({
    userName = 'User',
    userRole = 'Member',
    userAvatar,
    onMenuClick,
    onLogout,
}: TopBarProps) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleUserClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogoutClick = () => {
        handleClose();
        if (onLogout) onLogout();
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3,
                py: 1.5,
                bgcolor: '#fff',
                borderBottom: '1px solid #e2e8f0',
                minHeight: 64,
                position: 'sticky',
                top: 0,
                zIndex: 1100,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={onMenuClick} sx={{ display: { md: 'none' } }}>
                    <MenuIcon />
                </IconButton>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        px: 2,
                        py: 0.5,
                        minWidth: 280,
                        transition: 'border-color 0.2s',
                        '&:focus-within': {
                            borderColor: '#6366f1',
                            boxShadow: '0 0 0 3px rgba(99,102,241,0.1)',
                        },
                    }}
                >
                    <SearchIcon sx={{ color: '#94a3b8', fontSize: 20, mr: 1 }} />
                    <InputBase
                        placeholder="Search anything..."
                        sx={{
                            fontSize: '0.875rem',
                            color: '#334155',
                            '& ::placeholder': { color: '#94a3b8' },
                        }}
                    />
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Notifications">
                    <IconButton
                        sx={{
                            color: '#64748b',
                            '&:hover': { bgcolor: '#f1f5f9', color: '#334155' },
                        }}
                    >
                        <Badge
                            variant="dot"
                            sx={{
                                '& .MuiBadge-badge': {
                                    bgcolor: '#ef4444',
                                    width: 8,
                                    height: 8,
                                    minWidth: 8,
                                },
                            }}
                        >
                            <NotificationsNoneOutlinedIcon sx={{ fontSize: 22 }} />
                        </Badge>
                    </IconButton>
                </Tooltip>

                <Tooltip title="Settings">
                    <IconButton
                        sx={{
                            color: '#64748b',
                            '&:hover': { bgcolor: '#f1f5f9', color: '#334155' },
                        }}
                    >
                        <SettingsOutlinedIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                </Tooltip>

                <Box
                    onClick={handleUserClick}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        ml: 1,
                        pl: 2,
                        borderLeft: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        py: 0.5,
                        pr: 1,
                        '&:hover': { bgcolor: '#f8fafc' },
                        transition: 'background 0.2s',
                    }}
                >
                    <Avatar
                        src={userAvatar}
                        sx={{
                            width: 36,
                            height: 36,
                            bgcolor: '#6366f1',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                        }}
                    >
                        {userName.charAt(0)}
                    </Avatar>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: '#1e293b', lineHeight: 1.3, fontSize: '0.85rem' }}
                        >
                            {userName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                            {userRole}
                        </Typography>
                    </Box>
                    <KeyboardArrowDownIcon sx={{ color: '#94a3b8', fontSize: 18, ml: 0.5 }} />
                </Box>

                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    onClick={handleClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                        elevation: 0,
                        sx: {
                            mt: 1.5,
                            borderRadius: '12px',
                            minWidth: 180,
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02)',
                        },
                    }}
                >
                    <MenuItem sx={{ py: 1, px: 2, gap: 1.5 }} onClick={handleClose}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem' }}>{userName.charAt(0)}</Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>My Profile</Typography>
                    </MenuItem>
                    <MenuItem sx={{ py: 1, px: 2, gap: 1.5 }} onClick={handleClose}>
                        <SettingsOutlinedIcon sx={{ fontSize: 20, color: '#64748b' }} />
                        <Typography variant="body2">Settings</Typography>
                    </MenuItem>
                    <Divider sx={{ my: 1, borderColor: '#f1f5f9' }} />
                    <MenuItem
                        sx={{ py: 1, px: 2, gap: 1.5, color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' } }}
                        onClick={handleLogoutClick}
                    >
                        <LogoutOutlinedIcon sx={{ fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Sign Out</Typography>
                    </MenuItem>
                </Menu>
            </Box>
        </Box>
    );
}
