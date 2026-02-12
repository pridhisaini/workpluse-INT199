import type { Metadata } from 'next';
import './globals.css';
import AdminLayout from './AdminLayout';

export const metadata: Metadata = {
    title: 'Admin Portal — WorkForce Pro',
    description: 'Workforce management admin dashboard for time tracking, attendance, and team productivity',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body id="__next">
                <AdminLayout>{children}</AdminLayout>
            </body>
        </html>
    );
}
