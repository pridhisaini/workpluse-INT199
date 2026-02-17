import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getActivityLogs = async (req: Request, res: Response) => {
    const { type, userId, startDate, endDate } = req.query;

    try {
        const logs = await prisma.activityLog.findMany({
            where: {
                userId: userId as string || undefined,
                type: type as any || undefined,
                timestamp: {
                    gte: startDate ? new Date(startDate as string) : undefined,
                    lte: endDate ? new Date(endDate as string) : undefined,
                }
            },
            orderBy: { timestamp: 'desc' },
            take: 100
        });

        res.json({ success: true, data: logs });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getEmployeeActivityLogs = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const logs = await prisma.activityLog.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: 50
        });

        res.json({ success: true, data: logs });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createActivityLog = async (userId: string, userName: string, action: string, type: any, details?: string) => {
    try {
        await prisma.activityLog.create({
            data: {
                userId,
                userName,
                action,
                type,
                details,
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Failed to create activity log:', error);
    }
};
