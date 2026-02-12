import type { Metadata } from 'next';
import './globals.css';
import EmployeeLayout from './EmployeeLayout';

export const metadata: Metadata = {
    title: 'Employee Portal — WorkForce Pro',
    description: 'Employee self-service portal for time tracking, attendance, and project management',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body id="__next">
                <EmployeeLayout>{children}</EmployeeLayout>
            </body>
        </html>
    );
}
