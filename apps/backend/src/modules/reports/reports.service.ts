import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { WorkSession } from '../sessions/entities/work-session.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(WorkSession)
        private sessionRepository: Repository<WorkSession>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Project)
        private projectRepository: Repository<Project>,
    ) { }

    async getAdminStats(organizationId: string) {
        const totalEmployees = await this.userRepository.count({ where: { organizationId, role: UserRole.EMPLOYEE } });

        // Currently working (sessions running or idle but not stopped)
        const activeEmployees = await this.sessionRepository.count({
            where: {
                organizationId,
                status: In(['running', 'inactive'])
            }
        });

        const activeProjects = await this.projectRepository.count({
            where: { organizationId, status: 'active' }
        });

        // Sum durations for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sessionsToday = await this.sessionRepository.find({
            where: {
                organizationId,
                date: today
            },
            relations: ['user']
        });

        const presentTodayData = await this.sessionRepository.createQueryBuilder('session')
            .select('DISTINCT session.userId')
            .where('session.organizationId = :orgId', { orgId: organizationId })
            .andWhere('session.date = :today', { today })
            .getRawMany();

        const presentToday = presentTodayData.length;

        const nowTime = new Date().getTime();
        const totalDuration = sessionsToday.reduce((acc, s) => {
            const lastActivity = s.lastActivityTimestamp || s.startTime;
            const gap = s.status === 'running' ? Math.max(0, Math.floor((nowTime - lastActivity.getTime()) / 1000)) : 0;
            return acc + (s.duration || 0) + gap;
        }, 0);

        const totalActive = sessionsToday.reduce((acc, s) => {
            const lastActivity = s.lastActivityTimestamp || s.startTime;
            const gap = s.status === 'running' ? Math.max(0, Math.floor((nowTime - lastActivity.getTime()) / 1000)) : 0;

            // Rule: Gaps larger than 60s are not productive for normal employees.
            // Admins are exempt - their presence counts as 100% productive.
            const isAdmin = s.user?.role === UserRole.ADMIN;
            const liveActive = (isAdmin || gap <= 60) ? gap : 0;

            return acc + (s.activeSeconds || 0) + liveActive;
        }, 0);

        const avgProductivity = totalDuration > 0 ? Math.round((totalActive / totalDuration) * 100) : 0;

        return {
            totalEmployees,
            activeEmployees,
            presentToday,
            absentToday: totalEmployees - presentToday,
            activeProjects,
            totalHoursToday: parseFloat((totalDuration / 3600).toFixed(1)),
            avgProductivity,
            pendingLeaves: 2, // Mock
            productivityTrend: [65, 78, 82, 75, 88, 92, 85]
        };
    }

    async getEmployeeStats(userId: string) {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];

        // Fetch sessions for today using direct string comparison for Postgres DATE column
        const sessionsToday = await this.sessionRepository.createQueryBuilder('session')
            .leftJoinAndSelect('session.user', 'user')
            .where('session.userId = :userId', { userId })
            .andWhere('session.date = :dateStr', { dateStr })
            .getMany();

        const nowTime = now.getTime();
        const totalDuration = sessionsToday.reduce((acc, s) => {
            const lastActivity = s.lastActivityTimestamp || s.startTime;
            const gap = s.status === 'running' ? Math.max(0, Math.floor((nowTime - new Date(lastActivity).getTime()) / 1000)) : 0;
            return acc + (s.duration || 0) + gap;
        }, 0);

        const totalActive = sessionsToday.reduce((acc, s) => {
            const lastActivity = s.lastActivityTimestamp || s.startTime;
            const gap = s.status === 'running' ? Math.max(0, Math.floor((nowTime - new Date(lastActivity).getTime()) / 1000)) : 0;

            const isAdmin = s.user?.role === UserRole.ADMIN;
            const liveActive = (isAdmin || gap <= 60) ? gap : 0;

            return acc + (s.activeSeconds || 0) + liveActive;
        }, 0);

        const avgProductivity = totalDuration > 0 ? Math.round((totalActive / totalDuration) * 100) : 0;

        return {
            todayHours: totalDuration / 3600, // High precision for frontend formatting
            productivity: avgProductivity,
            weekHours: (totalDuration / 3600) * 5, // Mock
            monthHours: (totalDuration / 3600) * 20, // Mock
            attendanceRate: 98, // Mock
            activeProjects: 3, // Mock
            pendingTasks: 5, // Mock
            currentStreak: 4, // Mock
        };
    }

    async getProductivityReport(userId: string, startDate: string, endDate: string) {
        const sessions = await this.sessionRepository.find({
            where: {
                userId,
                date: Between(new Date(startDate), new Date(endDate))
            },
            order: { date: 'ASC' }
        });

        // Group by day
        const grouped = sessions.reduce((acc, s) => {
            const dateObj = new Date(s.date);
            const day = dateObj.toISOString().split('T')[0];
            if (!acc[day]) acc[day] = { duration: 0, active: 0 };
            acc[day].duration += s.duration;
            acc[day].active += s.activeSeconds;
            return acc;
        }, {} as Record<string, { duration: number, active: number }>);

        const labels = Object.keys(grouped);
        const data = labels.map(day =>
            grouped[day].duration > 0 ? Math.round((grouped[day].active / grouped[day].duration) * 100) : 0
        );

        return { labels, data };
    }

    async getAttendanceReport(userId: string, startDate: string, endDate: string) {
        const sessions = await this.sessionRepository.find({
            where: {
                userId,
                date: Between(new Date(startDate), new Date(endDate))
            },
            order: { startTime: 'ASC' }
        });

        const grouped = sessions.reduce((acc, s) => {
            const dayStr = s.date instanceof Date ? s.date.toISOString().split('T')[0] : String(s.date);
            if (!acc[dayStr]) {
                acc[dayStr] = {
                    date: s.date,
                    checkIn: s.startTime,
                    checkOut: s.endTime,
                    totalDuration: 0,
                };
            }

            if (new Date(s.startTime) < new Date(acc[dayStr].checkIn)) {
                acc[dayStr].checkIn = s.startTime;
            }

            if (s.endTime && (!acc[dayStr].checkOut || new Date(s.endTime) > new Date(acc[dayStr].checkOut))) {
                acc[dayStr].checkOut = s.endTime;
            }

            acc[dayStr].totalDuration += s.duration;
            return acc;
        }, {} as Record<string, any>);

        const logs = Object.values(grouped).map(day => {
            const durationHrs = day.totalDuration / 3600;
            const checkInDate = new Date(day.checkIn);
            const checkOutDate = day.checkOut ? new Date(day.checkOut) : null;

            return {
                date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
                checkIn: checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                checkOut: checkOutDate ? checkOutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
                hours: `${Math.floor(durationHrs)}h ${Math.round((durationHrs % 1) * 60)}m`,
                status: durationHrs >= 4 ? 'present' : 'late' // Simplified logic
            };
        }).reverse(); // Latest first

        return {
            logs,
            summary: {
                presentDays: logs.filter(l => l.status === 'present').length,
                absentDays: 0,
                lateDays: logs.filter(l => l.status === 'late').length,
                attendanceRate: logs.length > 0 ? Math.round((logs.filter(l => l.status === 'present').length / logs.length) * 100) : 0
            }
        };
    }

    async getAdminAttendanceReport(organizationId: string, dateStr?: string) {
        const targetDate = dateStr ? new Date(dateStr) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const employees = await this.userRepository.find({
            where: { organizationId, role: UserRole.EMPLOYEE }
        });

        const logs = await Promise.all(employees.map(async (emp) => {
            const sessions = await this.sessionRepository.find({
                where: { userId: emp.id, date: targetDate },
                order: { startTime: 'ASC' }
            });

            if (sessions.length === 0) {
                return {
                    id: emp.id,
                    name: `${emp.firstName} ${emp.lastName}`,
                    avatar: emp.firstName.charAt(0),
                    checkIn: '--',
                    checkOut: '--',
                    hours: '0h 0m',
                    productivity: 0,
                    status: 'absent'
                };
            }

            const checkIn = sessions[0].startTime;
            const checkOut = sessions[sessions.length - 1].status === 'stopped' ? sessions[sessions.length - 1].endTime : null;

            const totalDuration = sessions.reduce((acc, s) => acc + s.duration, 0);
            const totalActive = sessions.reduce((acc, s) => acc + s.activeSeconds, 0);
            const productivity = totalDuration > 0 ? Math.round((totalActive / totalDuration) * 100) : 0;
            const durationHrs = totalDuration / 3600;

            return {
                id: emp.id,
                name: `${emp.firstName} ${emp.lastName}`,
                avatar: emp.firstName.charAt(0),
                checkIn: new Date(checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                checkOut: checkOut ? new Date(checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
                hours: `${Math.floor(durationHrs)}h ${Math.round((durationHrs % 1) * 60)}m`,
                productivity,
                status: durationHrs >= 4 ? 'present' : 'late'
            };
        }));

        return {
            logs,
            summary: {
                present: logs.filter(l => l.status === 'present').length,
                absent: logs.filter(l => l.status === 'absent').length,
                late: logs.filter(l => l.status === 'late').length,
                leave: 0 // Mock for now
            }
        };
    }

    async getAdminProductivityReport(organizationId: string) {
        const employees = await this.userRepository.find({
            where: { organizationId, role: UserRole.EMPLOYEE }
        });

        const topPerformers = await Promise.all(employees.map(async (emp) => {
            const sessions = await this.sessionRepository.find({
                where: { userId: emp.id }
            });

            const totalDuration = sessions.reduce((acc, s) => acc + s.duration, 0);
            const totalActive = sessions.reduce((acc, s) => acc + s.activeSeconds, 0);
            const productivity = totalDuration > 0 ? Math.round((totalActive / totalDuration) * 100) : 0;

            return {
                id: emp.id,
                name: `${emp.firstName} ${emp.lastName}`,
                avatar: emp.firstName.charAt(0),
                productivity,
                hours: Math.round(totalDuration / 3600),
                trend: productivity >= 80 ? 'up' : 'stable'
            };
        }));

        return {
            topPerformers: topPerformers.sort((a, b) => b.productivity - a.productivity).slice(0, 5),
            monthlyAvg: 85, // Mock
            attendanceRate: 92, // Mock
            overallProductivity: 87 // Mock
        };
    }

    async getAdminProjectReport(organizationId: string) {
        const projects = await this.projectRepository.find({
            where: { organizationId },
            relations: ['members']
        });

        const projectBreakdown = projects.map(p => ({
            id: p.id,
            name: p.name,
            efficiency: 85, // Mock
            resource: p.members?.length || 0,
            status: p.status,
            deadline: p.endDate ? new Date(p.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'
        }));

        return {
            projectBreakdown,
            overallEfficiency: 82,
            resourceUtilization: 94,
            projectCompletion: 68,
            budgetAdherence: 88
        };
    }
}
