import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                department: true,
                designation: true,
                status: true,
                avatar: true,
                createdAt: true,
            }
        });

        res.json({ success: true, data: users });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                department: true,
                designation: true,
                status: true,
                avatar: true,
                createdAt: true,
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, data: user });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createUser = async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, role, department, designation } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password || 'password', 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: role || 'employee',
                department,
                designation,
                status: 'active',
                avatar: firstName ? firstName.charAt(0).toUpperCase() : '?'
            }
        });

        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({ success: true, data: userWithoutPassword });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { password, projects, ...data } = req.body;

    try {
        const updateData: any = { ...data };

        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // If projects are provided as an array of IDs
        if (Array.isArray(projects)) {
            updateData.projects = {
                set: projects.map((projectId: string) => ({ id: projectId }))
            };
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            include: { projects: true }
        });

        const { password: _, ...userWithoutPassword } = user;
        res.json({ success: true, data: userWithoutPassword });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id } });
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
