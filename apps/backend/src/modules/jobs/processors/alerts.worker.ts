import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { WorkSession } from '../../sessions/entities/work-session.entity';
import { Alert } from '../../alerts/entities/alert.entity';
import { WebsocketGateway } from '../../websocket/websocket.gateway';
import { QUEUES, JOBS } from '../jobs.constants';
import { Logger } from '@nestjs/common';

import { SessionsService } from '../../sessions/sessions.service';

@Processor(QUEUES.ALERTS)
export class AlertsWorker extends WorkerHost {
    private readonly logger = new Logger(AlertsWorker.name);

    constructor(
        @InjectRepository(WorkSession)
        private sessionRepository: Repository<WorkSession>,
        @InjectRepository(Alert)
        private alertRepository: Repository<Alert>,
        private wsGateway: WebsocketGateway,
        private sessionsService: SessionsService,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        switch (job.name) {
            case JOBS.IDLE_DETECTION:
                return this.checkIdleSessions();
            case JOBS.OVERTIME_CHECK:
                return this.checkOvertime();
            default:
                this.logger.warn(`Unknown job name: ${job.name}`);
        }
    }

    private async checkIdleSessions() {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

        // Find all running sessions
        const runningSessions = await this.sessionRepository.find({
            where: { status: 'running' },
            relations: ['organization', 'user']
        });

        for (const session of runningSessions) {
            // Rule: Admins should not be marked as inactive or auto-checked out
            if (session.user?.role === 'admin') {
                continue;
            }
            const lastActivity = session.lastActivityTimestamp || session.startTime;

            // 2. If inactive more than 2 hours, stop timer
            if (lastActivity < twoHoursAgo) {
                this.logger.log(`Auto-checkout: User ${session.userId} inactive for over 2 hours`);
                await this.sessionsService.stopSession(session.id, session.userId);

                // Notify admin of auto-checkout
                this.wsGateway.emitAdminAlert(session.organizationId, {
                    type: 'AUTO_CHECKOUT',
                    userId: session.userId,
                    message: `User inactive for over 2 hours. Session auto-completed.`
                });
                continue;
            }

            // 1. If inactive for 5 mins, send alert to admin
            if (lastActivity < fiveMinutesAgo) {
                this.logger.log(`Inactivity detected: User ${session.userId} inactive for over 5 minutes`);

                // Update session status to inactive
                await this.sessionRepository.update(session.id, { status: 'inactive' });

                const alertData = {
                    type: 'USER_INACTIVE',
                    userId: session.userId,
                    lastActivity: lastActivity,
                    message: `User has been inactive for over 5 minutes.`
                };

                // Notify Admin
                this.wsGateway.emitAdminAlert(session.organizationId, alertData);

                // Notify through session update to change status on dashboard
                this.wsGateway.emitSessionUpdate(session.organizationId, {
                    type: 'SESSION_TICK',
                    userId: session.userId,
                    status: 'inactive'
                });

                // Also notify User
                this.wsGateway.emitInactiveAlert(session.userId, alertData);
            }
        }
    }

    private async checkOvertime() {
        const nineHoursSeconds = 9 * 60 * 60;

        // Find users exceeding 9 hours today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const activeSessions = await this.sessionRepository.find({
            where: {
                status: 'running',
                startTime: Between(startOfDay, new Date())
            }
        });

        // Group by user and check total duration
        const userTotals = activeSessions.reduce((acc, s) => {
            acc[s.userId] = (acc[s.userId] || 0) + s.duration;
            return acc;
        }, {} as Record<string, number>);

        for (const [userId, total] of Object.entries(userTotals)) {
            if (total > nineHoursSeconds) {
                const session = activeSessions.find(s => s.userId === userId);

                const recentAlert = await this.alertRepository.findOne({
                    where: {
                        userId,
                        type: 'overtime',
                        createdAt: Between(startOfDay, new Date())
                    }
                });

                if (!recentAlert && session) {
                    const alert = await this.alertRepository.save({
                        organizationId: session.organizationId,
                        userId,
                        type: 'overtime',
                        severity: 'high',
                        title: 'Overtime Alert',
                        message: 'You have exceeded 9 hours of work today. Please consider taking a break.',
                    });

                    this.wsGateway.emitOvertimeAlert(userId, alert);
                }
            }
        }
    }
}

// Re-importing Between as it was missing from typeorm imports in previous step if I copied it wrong
import { Between } from 'typeorm';
