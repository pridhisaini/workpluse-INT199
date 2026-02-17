import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

async function seed() {
    const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'workpulse',
        synchronize: false,
    });

    await dataSource.initialize();
    console.log('Data Source initialized!');

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        // 1. Create Organization
        const orgId = randomUUID();
        await queryRunner.query(
            `INSERT INTO organizations (id, name, slug, status) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
            [orgId, 'WorkForce Pro', 'workforce-pro', 'active']
        );
        console.log('Organization created');

        // Get the orgId if it already existed
        const orgs = await queryRunner.query(`SELECT id FROM organizations WHERE slug = 'workforce-pro'`);
        const finalOrgId = orgs[0].id;

        // 2. Create Admin User
        const passwordHash = await bcrypt.hash('password', 10);
        await queryRunner.query(
            `INSERT INTO users (id, "organizationId", email, password, "firstName", "lastName", role, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
            [randomUUID(), finalOrgId, 'admin@workforce.pro', passwordHash, 'Admin', 'User', 'admin', 'active']
        );
        console.log('Admin user created');

        // 3. Create Employee User
        const employeeId = randomUUID();
        await queryRunner.query(
            `INSERT INTO users (id, "organizationId", email, password, "firstName", "lastName", role, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
            [employeeId, finalOrgId, 'employee@workforce.pro', passwordHash, 'Sarah', 'Johnson', 'employee', 'active']
        );
        console.log('Employee user created');

        // 4. Create a Project
        const projectId = randomUUID();
        await queryRunner.query(
            `INSERT INTO projects (id, "organizationId", name, description, status) 
             VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
            [projectId, finalOrgId, 'Internal Optimization', 'Improving internal tools and workflows', 'active']
        );
        console.log('Project created');

        // 5. Assign employee to project
        await queryRunner.query(
            `INSERT INTO project_members ("projectId", "userId") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [projectId, employeeId]
        );
        console.log('Employee assigned to project');

        await queryRunner.commitTransaction();
        console.log('Seed completed successfully!');
    } catch (err) {
        console.error('Error during seeding:', err);
        await queryRunner.rollbackTransaction();
    } finally {
        await queryRunner.release();
        await dataSource.destroy();
    }
}

seed().catch(console.error);
