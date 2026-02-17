import { Controller, Get, Query, UseGuards, Req, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('admin-stats')
    async getAdminStats(@Req() req: any) {
        return this.reportsService.getAdminStats(req.user.organizationId);
    }

    @Get('employee-stats/:userId')
    async getEmployeeStats(@Param('userId') userId: string) {
        return this.reportsService.getEmployeeStats(userId);
    }

    @Get('productivity')
    async getProductivityReport(
        @Req() req: any,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('userId') userId?: string
    ) {
        // If admin, can query any user. If employee, only self.
        const targetUserId = userId || req.user.id;
        return this.reportsService.getProductivityReport(targetUserId, startDate, endDate);
    }

    @Get('attendance')
    async getAttendanceReport(
        @Req() req: any,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('userId') userId?: string
    ) {
        const targetUserId = userId || req.user.id;
        return this.reportsService.getAttendanceReport(targetUserId, startDate, endDate);
    }

    @Get('admin/attendance')
    async getAdminAttendanceReport(
        @Req() req: any,
        @Query('date') date?: string
    ) {
        return this.reportsService.getAdminAttendanceReport(req.user.organizationId, date);
    }

    @Get('admin/productivity')
    async getAdminProductivityReport(@Req() req: any) {
        return this.reportsService.getAdminProductivityReport(req.user.organizationId);
    }

    @Get('admin/projects')
    async getAdminProjectReport(@Req() req: any) {
        return this.reportsService.getAdminProjectReport(req.user.organizationId);
    }
}
