import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password', 10);

    // Upsert Admin
    await prisma.user.upsert({
        where: { email: 'admin@workforce.pro' },
        update: {},
        create: {
            email: 'admin@workforce.pro',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            status: 'active',
        },
    });

    // Upsert Employee
    await prisma.user.upsert({
        where: { email: 'employee@workforce.pro' },
        update: {},
        create: {
            email: 'employee@workforce.pro',
            password: hashedPassword,
            firstName: 'Sarah',
            lastName: 'Johnson',
            role: 'employee',
            status: 'active',
            designation: 'Software Engineer',
            department: 'Engineering',
        },
    });

    // Upsert Projects
    const projects = [
        { id: 'proj-1', name: 'Website Redesign', description: 'Overhaul corporate website' },
        { id: 'proj-2', name: 'Mobile App v2', description: 'Developing the next version of our app' },
        { id: 'proj-3', name: 'API Migration', description: 'Migrating legacy APIs to GraphQL' },
        { id: 'proj-4', name: 'Analytics Dashboard', description: 'New data visualization platform' },
    ];

    for (const project of projects) {
        await prisma.project.upsert({
            where: { id: project.id },
            update: {},
            create: {
                id: project.id,
                name: project.name,
                description: project.description,
                status: 'active'
            }
        });
    }

    console.log('✅ Database seeded with demo accounts and projects.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
