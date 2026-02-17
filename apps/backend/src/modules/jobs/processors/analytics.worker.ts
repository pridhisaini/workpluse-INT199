import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorkSession } from '../../sessions/entities/work-session.entity';
import { DailySummary } from '../../reports/entities/daily-summary.entity';
import { QUEUES, JOBS } from '../jobs.constants';
import { Logger } from '@nestjs/common';

@Processor(QUEUES.ANALYTICS)
export class AnalyticsWorker extends WorkerHost {
    private readonly logger = new Logger(AnalyticsWorker.name);

    constructor(
        @InjectRepository(WorkSession)
        private sessionRepository: Repository<WorkSession>,
        @InjectRepository(DailySummary)
        private summaryRepository: Repository<DailySummary>,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        switch (job.name) {
            case JOBS.DAILY_SUMMARY:
                return this.generateDailySummary(job.data);
            default:
                this.logger.warn(`Unknown job name: ${job.name}`);
        }
    }

    private async generateDailySummary(data: { userId: string, orgId: string, date: string }) {
        const { userId, orgId, date } = data;
        const targetDate = new Date(date);

        // Use identity to ensure idempotency: find existing or create new
        let summary = await this.summaryRepository.findOne({
            where: { userId, date: targetDate }
        });

        if (!summary) {
            summary = this.summaryRepository.create({
                userId,
                organizationId: orgId,
                date: targetDate,
            });
        }

        // Aggregate sessions for this user on this day
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const sessions = await this.sessionRepository.find({
            where: {
                userId,
                startTime: Between(startOfDay, endOfDay)
            }
        });

        summary.totalWorkSeconds = sessions.reduce((acc, s) => acc + s.duration, 0);
        summary.totalIdleSeconds = sessions.reduce((acc, s) => acc + s.idleSeconds, 0);

        // Simplified productivity score
        const activeSeconds = summary.totalWorkSeconds - summary.totalIdleSeconds;
        summary.productivityScore = summary.totalWorkSeconds > 0
            ? (activeSeconds / summary.totalWorkSeconds) * 100
            : 0;

        return this.summaryRepository.save(summary);
    }
}
