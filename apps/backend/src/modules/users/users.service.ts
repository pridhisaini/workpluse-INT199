import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findAll(): Promise<any[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find users, join with today's completed sessions for base totals, and look for an active session
        const query = this.usersRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.organization', 'organization')
            .leftJoin('work_sessions', 'activeSession', 'activeSession.userId = user.id AND activeSession.status IN (:...statuses)', { statuses: ['running', 'inactive'] })
            // Base duration from COMPLETED sessions today
            .leftJoin('work_sessions', 'completedSessions', 'completedSessions.userId = user.id AND completedSessions.date = :today AND completedSessions.status = :stopped', { today, stopped: 'stopped' })
            .select('user.id', 'userId')
            // Select user fields manually to allow grouping
            .addSelect('user.firstName', 'firstName')
            .addSelect('user.lastName', 'lastName')
            .addSelect('user.email', 'email')
            .addSelect('user.department', 'department')
            .addSelect('user.designation', 'designation')
            .addSelect('user.role', 'role')
            .addSelect('user.organizationId', 'organizationId')
            .addSelect('user.avatar', 'avatar')
            .addSelect('organization.name', 'orgName')
            .addSelect('activeSession.id', 'activeSessionId')
            .addSelect('activeSession.status', 'sessionStatus')
            .addSelect('activeSession.duration', 'activeDuration')
            .addSelect('activeSession.activeSeconds', 'activeActiveSeconds')
            .addSelect('COALESCE(SUM(completedSessions.duration), 0)', 'completedDuration')
            .addSelect('COALESCE(SUM(completedSessions.activeSeconds), 0)', 'completedActive')
            .groupBy('user.id')
            .addGroupBy('organization.id')
            .addGroupBy('activeSession.id');

        const rawResults = await query.getRawMany();

        return rawResults.map(raw => {
            const baseDuration = parseInt(raw.completedDuration || '0');
            const baseActive = parseInt(raw.completedActive || '0');
            const currentDuration = parseInt(raw.activeDuration || '0');
            const currentActive = parseInt(raw.activeActiveSeconds || '0');

            return {
                id: raw.userId,
                firstName: raw.firstName,
                lastName: raw.lastName,
                email: raw.email,
                department: raw.department,
                designation: raw.designation,
                role: raw.role,
                organizationId: raw.organizationId,
                avatar: raw.avatar,
                organization: { name: raw.orgName },
                isWorking: !!raw.activeSessionId,
                currentSession: raw.activeSessionId ? {
                    id: raw.activeSessionId,
                    status: raw.sessionStatus,
                    duration: currentDuration,
                    activeSeconds: currentActive
                } : null,
                baseStats: {
                    duration: baseDuration,
                    activeSeconds: baseActive
                }
            };
        });
    }

    async findOne(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'organizationId', 'department', 'designation', 'phone'],
        });
    }

    async create(userData: Partial<User>): Promise<User> {
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }
        const user = this.usersRepository.create(userData);
        return this.usersRepository.save(user);
    }

    async update(id: string, updateData: Partial<User>): Promise<User | null> {
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        await this.usersRepository.update(id, updateData);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.usersRepository.delete(id);
    }
}
