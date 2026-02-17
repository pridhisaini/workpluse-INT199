import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getProjects = async (req: Request, res: Response) => {
    try {
        const projects = await prisma.project.findMany({
            include: {
                _count: {
                    select: { members: true }
                }
            }
        });

        res.json({ success: true, data: projects });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                members: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        role: true
                    }
                }
            }
        });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        res.json({ success: true, data: project });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createProject = async (req: Request, res: Response) => {
    const { name, description, budget, members } = req.body;
    try {
        const project = await prisma.project.create({
            data: {
                name,
                description,
                budget,
                members: {
                    connect: members?.map((id: string) => ({ id })) || []
                }
            }
        });

        res.status(201).json({ success: true, data: project });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const project = await prisma.project.update({
            where: { id },
            data: {
                ...data,
                members: data.members ? {
                    set: data.members.map((userId: string) => ({ id: userId }))
                } : undefined
            }
        });

        res.json({ success: true, data: project });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.project.delete({ where: { id } });
        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
