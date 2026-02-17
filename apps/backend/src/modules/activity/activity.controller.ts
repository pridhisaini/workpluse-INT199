import { Controller, Get, Param } from '@nestjs/common';
import { ActivityService } from './activity.service';

@Controller('activity-logs')
export class ActivityController {
    constructor(private readonly activityService: ActivityService) { }

    @Get()
    findAll() {
        return this.activityService.findAll();
    }

    @Get('employee/:userId')
    findByUser(@Param('userId') userId: string) {
        return this.activityService.findByUserId(userId);
    }
}
