import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WorkSession } from './entities/work-session.entity';
import { StartSessionDto } from './dto/start-session.dto';
import { CreateActivityDto, ActivityType } from './dto/create-activity.dto';
import { ActivityLog } from '../activity/entities/activity-log.entity';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import Redis from 'ioredis';

import { LogManualSessionDto } from './dto/log-manual-session.dto';

@Injectable()
export class SessionsService {
    constructor(
        @InjectRepository(WorkSession)
        private sessionRepository: Repository<WorkSession>,
        @InjectRepository(ActivityLog)
        private activityLogRepository: Repository<ActivityLog>,
        private dataSource: DataSource,
        @Inject('REDIS_CLIENT') private redis: Redis,
        @Inject(forwardRef(() => WebsocketGateway))
        private wsGateway: WebsocketGateway,
    ) { }

    async logManualSession(userId: string, orgId: string, dto: LogManualSessionDto) {
        const start = new Date(dto.startTime);
        const end = new Date(dto.endTime);
        const durationMs = end.getTime() - start.getTime();

        if (durationMs <= 0) {
            throw new BadRequestException('End time must be after start time');
        }

        const session = this.sessionRepository.create({
            userId,
            organizationId: orgId,
            projectId: dto.projectId,
            task: dto.task,
            description: dto.description,
            startTime: start,
            endTime: end,
            duration: Math.floor(durationMs / 1000),
            activeSeconds: Math.floor(durationMs / 1000), // Manual logs assumed 100% active for now or we could omit
            idleSeconds: 0,
            status: 'stopped',
            date: start,
            version: 1,
            isManual: true,
        });

        const saved = await this.sessionRepository.save(session);

        // Notify dashboard of historical data update
        this.wsGateway.emitSessionUpdate(orgId, {
            type: 'SESSION_STOP', // Using STOP to signify completion
            userId,
            sessionId: saved.id,
            session: saved
        });

        return saved;
    }

    async startSession(userId: string, orgId: string, dto: StartSessionDto) {
        const activeSessionId = await this.getActiveSessionId(userId);
        if (activeSessionId) {
            throw new BadRequestException('User already has an active session');
        }

        const session = this.sessionRepository.create({
            ...dto,
            userId,
            organizationId: orgId,
            startTime: new Date(),
            status: 'running',
            date: new Date(),
            version: 1,
        });

        const savedSession = await this.sessionRepository.save(session);
        await this.redis.set(`active_session:${userId}`, savedSession.id);

        // Emit event to organization dashboard
        this.wsGateway.emitSessionUpdate(orgId, {
            type: 'SESSION_START',
            userId,
            session: savedSession
        });

        return savedSession;
    }

    async stopSession(sessionId: string, userId: string) {
        const result = await this.dataSource.transaction(async (manager) => {
            const session = await manager.findOne(WorkSession, {
                where: { id: sessionId, userId, status: 'running' },
            });

            if (!session) {
                throw new NotFoundException('Active session not found');
            }

            session.endTime = new Date();
            session.status = 'stopped';

            const durationMs = session.endTime.getTime() - session.startTime.getTime();
            session.duration = Math.floor(durationMs / 1000);

            const saved = await manager.save(session);
            await this.redis.del(`active_session:${userId}`);

            return saved;
        });

        // Emit only after successful transaction
        this.wsGateway.emitSessionUpdate(result.organizationId, {
            type: 'SESSION_STOP',
            userId,
            sessionId: result.id
        });

        return result;
    }

    async findOne(id: string, userId: string) {
        const session = await this.sessionRepository.findOne({
            where: { id, userId },
        });
        if (!session) {
            throw new NotFoundException('Session not found');
        }
        return session;
    }

    async getActiveSession(userId: string) {
        const sessionId = await this.getActiveSessionId(userId);
        if (!sessionId) return null;

        return this.sessionRepository.findOne({ where: { id: sessionId } });
    }

    async recordActivity(sessionId: string, userId: string, orgId: string, dto: CreateActivityDto) {
        const result = await this.dataSource.transaction(async (manager) => {
            const session = await manager.findOne(WorkSession, {
                where: { id: sessionId, userId, status: 'running' },
                lock: { mode: 'pessimistic_write' }
            });

            if (!session) {
                throw new BadRequestException('Session is not active or does not exist');
            }

            const currentTimestamp = new Date(dto.timestamp);
            let secondsToAdd = 0;
            if (session.lastActivityTimestamp) {
                const diffMs = currentTimestamp.getTime() - session.lastActivityTimestamp.getTime();
                secondsToAdd = Math.min(Math.max(0, Math.floor(diffMs / 1000)), 300);
            } else {
                const diffMs = currentTimestamp.getTime() - session.startTime.getTime();
                secondsToAdd = Math.min(Math.max(0, Math.floor(diffMs / 1000)), 300);
            }

            if (dto.type === ActivityType.ACTIVE) {
                session.activeSeconds += secondsToAdd;
            } else {
                session.idleSeconds += secondsToAdd;
            }
            session.duration += secondsToAdd;
            session.lastActivityTimestamp = currentTimestamp;

            const log = manager.create(ActivityLog, {
                id: crypto.randomUUID(),
                organizationId: orgId,
                userId,
                sessionId,
                action: dto.action,
                details: dto.details,
                type: dto.type,
                timestamp: currentTimestamp,
            });

            await manager.save(log);
            return manager.save(session);
        });

        // Emit update for real-time dashboard tracking
        this.wsGateway.emitSessionUpdate(orgId, {
            type: 'SESSION_TICK',
            userId,
            duration: result.duration,
            activeSeconds: result.activeSeconds,
            idleSeconds: result.idleSeconds,
            lastActivity: result.lastActivityTimestamp
        });

        return result;
    }

    async updateLastActivity(userId: string) {
        const sessionId = await this.getActiveSessionId(userId);
        if (sessionId) {
            const session = await this.sessionRepository.findOne({
                where: { id: sessionId },
                relations: ['user']
            });
            if (!session) return;

            const now = new Date();
            const lastActivity = session.lastActivityTimestamp || session.startTime;
            const gapSeconds = Math.max(0, Math.floor((now.getTime() - lastActivity.getTime()) / 1000));

            const pingsInterval = 30;
            const continuousThreshold = 60;
            const isAdmin = session.user?.role === 'admin';

            let activeToAdd = gapSeconds;
            let idleToAdd = 0;

            if (!isAdmin && gapSeconds > continuousThreshold) {
                activeToAdd = pingsInterval;
                idleToAdd = gapSeconds - pingsInterval;
            }

            await this.sessionRepository.update(sessionId, {
                lastActivityTimestamp: now,
                status: 'running',
                duration: session.duration + gapSeconds,
                activeSeconds: session.activeSeconds + activeToAdd,
                idleSeconds: session.idleSeconds + idleToAdd
            });

            const updatedDuration = session.duration + gapSeconds;
            const updatedActive = session.activeSeconds + activeToAdd;

            this.wsGateway.emitSessionUpdate(session.organizationId, {
                type: 'SESSION_TICK',
                userId,
                duration: updatedDuration,
                activeSeconds: updatedActive,
                status: 'running',
                productivity: updatedDuration > 0
                    ? Math.round((updatedActive / updatedDuration) * 100)
                    : 0
            });
        }
    }

    async getUserSessions(userId: string, startDate?: string, endDate?: string) {
        const query = this.sessionRepository.createQueryBuilder('session')
            .where('session.userId = :userId', { userId })
            .leftJoinAndSelect('session.project', 'project')
            .orderBy('session.startTime', 'DESC');

        if (startDate) {
            query.andWhere('session.date >= :startDate', { startDate });
        }
        if (endDate) {
            query.andWhere('session.date <= :endDate', { endDate });
        }

        return query.getMany();
    }

    private async getActiveSessionId(userId: string): Promise<string | null> {
        return this.redis.get(`active_session:${userId}`);
    }
}
