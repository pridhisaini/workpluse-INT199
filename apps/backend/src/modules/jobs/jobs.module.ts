import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsWorker } from './processors/analytics.worker';
import { AlertsWorker } from './processors/alerts.worker';
import { WorkSession } from '../sessions/entities/work-session.entity';
import { DailySummary } from '../reports/entities/daily-summary.entity';
import { Alert } from '../alerts/entities/alert.entity';
import { QUEUES, JOBS } from './jobs.constants';
import { WebsocketModule } from '../websocket/websocket.module';
import { Queue } from 'bullmq';

import { SessionsModule } from '../sessions/sessions.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([WorkSession, DailySummary, Alert]),
        BullModule.registerQueue(
            {
                name: QUEUES.ANALYTICS,
                defaultJobOptions: {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 1000,
                    },
                    removeOnComplete: true,
                    removeOnFail: 1000,
                },
            },
            {
                name: QUEUES.ALERTS,
                defaultJobOptions: {
                    attempts: 1,
                    removeOnComplete: true,
                    removeOnFail: 1000,
                },
            },
        ),
        WebsocketModule,
        SessionsModule,
    ],
    providers: [AnalyticsWorker, AlertsWorker],
    exports: [BullModule],
})
export class JobsModule implements OnModuleInit {
    constructor(
        @InjectQueue(QUEUES.ALERTS) private alertsQueue: Queue,
    ) { }

    async onModuleInit() {
        // Schedule idle detection every 5 minutes
        await this.alertsQueue.add(
            JOBS.IDLE_DETECTION,
            {},
            {
                repeat: { pattern: '*/5 * * * *' },
                jobId: 'idle-detection-repeat',
            },
        );

        // Schedule overtime check every hour
        await this.alertsQueue.add(
            JOBS.OVERTIME_CHECK,
            {},
            {
                repeat: { pattern: '0 * * * *' },
                jobId: 'overtime-check-repeat',
            },
        );
    }
}
