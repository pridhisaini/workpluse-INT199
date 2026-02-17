import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
// import { UserRole } from '@prisma/client';

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            data: {
                user: userWithoutPassword,
                tokens: {
                    accessToken: token,
                    refreshToken: 'mock-refresh-token', // Implementation for refresh tokens can be added later
                },
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const register = async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, role } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: (role) || 'employee',
            },
        });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        const { password: _, ...userWithoutPassword } = user;

        res.status(201).json({
            success: true,
            data: {
                user: userWithoutPassword,
                tokens: {
                    accessToken: token,
                    refreshToken: 'mock-refresh-token',
                },
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user?.id },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { password: _, ...userWithoutPassword } = user;
        res.json({ success: true, data: userWithoutPassword });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
