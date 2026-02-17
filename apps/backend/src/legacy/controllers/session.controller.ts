import { Request, Response } from 'express';
import prisma from '../utils/prisma';
// import { TimeEntryStatus } from '@prisma/client';

export const getSessions = async (req: Request, res: Response) => {
    const { userId, projectId, startDate, endDate } = req.query;

    try {
        const sessions = await prisma.timeEntry.findMany({
            where: {
                userId: userId as string || req.user?.id,
                projectId: projectId as string || undefined,
                startTime: {
                    gte: startDate ? new Date(startDate as string) : undefined,
                    lte: endDate ? new Date(endDate as string) : undefined,
                }
            },
            include: {
                project: {
                    select: { name: true }
                }
            },
            orderBy: { startTime: 'desc' }
        });

        res.json({ success: true, data: sessions });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCurrentSession = async (req: Request, res: Response) => {
    try {
        const session = await prisma.timeEntry.findFirst({
            where: {
                userId: req.user?.id,
                status: 'running'
            },
            include: {
                project: {
                    select: { name: true }
                }
            }
        });

        res.json({ success: true, data: session });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const startSession = async (req: Request, res: Response) => {
    const { projectId, task, description } = req.body;
    const userId = req.user?.id;

    try {
        // Stop any currently running session
        await prisma.timeEntry.updateMany({
            where: { userId, status: 'running' },
            data: {
                status: 'completed',
                endTime: new Date(),
                // duration logic would go here in a real app or calculated on stop
            }
        });

        const session = await prisma.timeEntry.create({
            data: {
                userId: userId!,
                projectId,
                task,
                description,
                status: 'running',
                startTime: new Date(),
                date: new Date(),
            }
        });

        res.status(201).json({ success: true, data: session });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const stopSession = async (req: Request, res: Response) => {
    const { entryId, seconds } = req.body;
    const userId = req.user?.id;

    try {
        const session = await prisma.timeEntry.findUnique({
            where: { id: entryId }
        });

        if (!session || session.userId !== userId) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        const endTime = new Date();
        const duration = seconds || Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);

        const updatedSession = await prisma.timeEntry.update({
            where: { id: entryId },
            data: {
                status: 'completed',
                endTime,
                duration
            }
        });

        res.json({ success: true, data: updatedSession });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateSession = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    try {
        const session = await prisma.timeEntry.update({
            where: { id },
            data
        });
        res.json({ success: true, data: session });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
