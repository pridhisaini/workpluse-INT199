import { ReactNode } from 'react';

export interface SidebarItem {
    label: string;
    icon: ReactNode;
    href: string;
    badge?: number;
    children?: SidebarItem[];
}

export interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: ReactNode;
    trend?: {
        value: number;
        direction: 'up' | 'down';
    };
    color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export interface Column<T = Record<string, unknown>> {
    key: string;
    label: string;
    width?: string | number;
    align?: 'left' | 'center' | 'right';
    render?: (row: T) => ReactNode;
    sortable?: boolean;
}
