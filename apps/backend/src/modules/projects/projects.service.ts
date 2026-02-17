import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from './entities/project.entity';
import { User } from '../users/entities/user.entity';
import { WorkSession } from '../sessions/entities/work-session.entity';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private projectsRepository: Repository<Project>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(WorkSession)
        private sessionsRepository: Repository<WorkSession>,
    ) { }

    async findAll(): Promise<Project[]> {
        const projects = await this.projectsRepository.find({ relations: ['members'] });
        return this.calculateDynamicProgress(projects);
    }

    async findOne(id: string): Promise<Project | null> {
        const project = await this.projectsRepository.findOne({ where: { id }, relations: ['members'] });
        if (!project) return null;
        const augmented = await this.calculateDynamicProgress([project]);
        return augmented[0];
    }

    async findByEmployee(userId: string): Promise<Project[]> {
        const projects = await this.projectsRepository.createQueryBuilder('project')
            .innerJoin('project.members', 'member')
            .where('member.id = :userId', { userId })
            .getMany();
        return this.calculateDynamicProgress(projects);
    }

    private async calculateDynamicProgress(projects: Project[]): Promise<Project[]> {
        if (projects.length === 0) return [];

        const projectIds = projects.map(p => p.id);

        // Aggregating durations per project from sessions
        const sessionTotals = await this.sessionsRepository.createQueryBuilder('session')
            .select('session.projectId', 'projectId')
            .addSelect('SUM(session.duration)', 'totalDuration')
            .where('session.projectId IN (:...projectIds)', { projectIds })
            .groupBy('session.projectId')
            .getRawMany();

        const totalsMap = sessionTotals.reduce((acc, curr) => {
            acc[curr.projectId] = parseInt(curr.totalDuration, 10);
            return acc;
        }, {} as Record<string, number>);

        return projects.map(p => {
            const totalSeconds = totalsMap[p.id] || 0;
            const totalHours = totalSeconds / 3600;

            // If budget exists and is > 0, we calculate progress as (Logged Hours / Budget) * 100
            if (p.budget && p.budget > 0) {
                p.progress = Math.min(100, Math.round((totalHours / p.budget) * 100));
            } else {
                // Keep existing progress if no budget is defined
            }
            return p;
        });
    }

    async create(createData: Partial<Project>): Promise<Project> {
        const project = this.projectsRepository.create(createData);
        return this.projectsRepository.save(project);
    }

    async update(id: string, updateData: any): Promise<Project | null> {
        const { memberIds, ...rest } = updateData;

        let project = await this.findOne(id);
        if (!project) return null;

        if (memberIds) {
            // Find users by IDs
            const users = await this.usersRepository.find({
                where: { id: In(memberIds as string[]) }
            });
            project.members = users;
        }

        Object.assign(project, rest);
        return this.projectsRepository.save(project);
    }

    async assignMembers(id: string, memberIds: string[]): Promise<Project | null> {
        const project = await this.findOne(id);
        if (!project) return null;

        const users = await this.usersRepository.find({
            where: { id: In(memberIds) }
        });
        project.members = users;
        return this.projectsRepository.save(project);
    }

    async remove(id: string): Promise<void> {
        const project = await this.findOne(id);
        if (project) {
            await this.projectsRepository.remove(project);
        }
    }
}
