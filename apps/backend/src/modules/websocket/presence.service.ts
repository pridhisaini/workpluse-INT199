import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class PresenceService {
    private readonly PRESENCE_KEY = 'presence';

    constructor(@Inject('REDIS_CLIENT') private redis: Redis) { }

    async setUserOnline(userId: string, orgId: string) {
        // Use a set per organization for easy listing
        await this.redis.sadd(`presence:org:${orgId}`, userId);
        // Track the user's organization for quick cleanup
        await this.redis.set(`presence:user:${userId}:org`, orgId);
    }

    async setUserOffline(userId: string) {
        const orgId = await this.redis.get(`presence:user:${userId}:org`);
        if (orgId) {
            await this.redis.srem(`presence:org:${orgId}`, userId);
            await this.redis.del(`presence:user:${userId}:org`);
        }
    }

    async getOnlineUsers(orgId: string): Promise<string[]> {
        return this.redis.smembers(`presence:org:${orgId}`);
    }

    async isUserOnline(userId: string): Promise<boolean> {
        const orgId = await this.redis.get(`presence:user:${userId}:org`);
        return !!orgId;
    }
}
