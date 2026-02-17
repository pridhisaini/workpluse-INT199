import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';

@Injectable()
export class ActivityService {
    constructor(
        @InjectRepository(ActivityLog)
        private activityRepository: Repository<ActivityLog>,
    ) { }

    async findAll(): Promise<ActivityLog[]> {
        return this.activityRepository.find({ relations: ['user'] });
    }

    async findByUserId(userId: string): Promise<ActivityLog[]> {
        return this.activityRepository.find({ where: { userId }, relations: ['user'] });
    }

    async log(data: Partial<ActivityLog>): Promise<ActivityLog> {
        const log = this.activityRepository.create(data);
        return this.activityRepository.save(log);
    }
}
