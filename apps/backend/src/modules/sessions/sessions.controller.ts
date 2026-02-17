import { Controller, Post, Body, Get, Param, Query, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { StartSessionDto } from './dto/start-session.dto';
import { LogManualSessionDto } from './dto/log-manual-session.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

    @Post('manual')
    async logManual(@Req() req: any, @Body() dto: LogManualSessionDto) {
        return this.sessionsService.logManualSession(req.user.id, req.user.organizationId, dto);
    }

    @Post('start')
    async start(@Req() req: any, @Body() dto: StartSessionDto) {
        return this.sessionsService.startSession(req.user.id, req.user.organizationId, dto);
    }

    @Post(':id/stop')
    @HttpCode(HttpStatus.OK)
    async stop(@Param('id') id: string, @Req() req: any) {
        return this.sessionsService.stopSession(id, req.user.id);
    }

    @Get('active')
    async getActive(@Req() req: any) {
        return this.sessionsService.getActiveSession(req.user.id);
    }

    @Get('history')
    async getHistory(
        @Req() req: any,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        return this.sessionsService.getUserSessions(
            req.user.id,
            startDate,
            endDate
        );
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req: any) {
        return this.sessionsService.findOne(id, req.user.id);
    }

    @Post(':id/activity')
    @HttpCode(HttpStatus.OK)
    async recordActivity(
        @Param('id') id: string,
        @Req() req: any,
        @Body() dto: CreateActivityDto
    ) {
        return this.sessionsService.recordActivity(
            id,
            req.user.id,
            req.user.organizationId,
            dto
        );
    }
}
