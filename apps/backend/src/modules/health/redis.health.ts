import { Injectable, Inject } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
    constructor(@Inject('REDIS_CLIENT') private redis: Redis) {
        super();
    }

    async isHealthy(key: string): Promise<HealthIndicatorResult> {
        try {
            const status = await this.redis.ping();
            if (status !== 'PONG') {
                throw new Error('Redis ping failed');
            }
            return this.getStatus(key, true);
        } catch (e: any) {
            throw new HealthCheckError(
                'Redis check failed',
                this.getStatus(key, false, { message: e.message }),
            );
        }
    }
}
