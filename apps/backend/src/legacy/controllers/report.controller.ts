import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getProductivityReport = async (req: Request, res: Response) => {
    try {
        // This is a mock implementation. In a real app, you'd calculate these stats.
        const report = {
            score: 85,
            change: '+5%',
            trend: 'up',
            history: [65, 70, 75, 80, 85, 82, 85],
            topPerformers: [
                {
                    id: '1',
                    name: 'John Doe',
                    productivity: 95,
                    hours: 40,
                    trend: 'up'
                }
            ]
        };

        res.json({ success: true, data: report });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getProjectReport = async (req: Request, res: Response) => {
    try {
        const projects = await prisma.project.findMany({
            include: {
                _count: {
                    select: { members: true }
                }
            }
        });

        const projectStats = projects.map((p: any) => ({
            id: p.id,
            name: p.name,
            efficiency: 90, // mock
            teamSize: p._count.members,
            status: p.status,
            deadline: p.endDate?.toISOString() || 'N/A'
        }));

        const report = {
            efficiency: 88,
            utilization: 75,
            completion: 60,
            projects: projectStats
        };

        res.json({ success: true, data: report });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
