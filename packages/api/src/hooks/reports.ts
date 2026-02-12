import { AxiosInstance } from 'axios';
import { useApiQuery, createQueryKeys } from './use-api';
import {
    AdminDashboardStats,
    EmployeeDashboardStats,
    TimesheetSummary,
    ProjectReport,
    ProductivityReport
} from '@repo/types';

const reportKeys = createQueryKeys('reports');

export function useAdminStats(client: AxiosInstance) {
    return useApiQuery<AdminDashboardStats>(
        client,
        reportKeys.detail('admin-stats'),
        '/reports/admin-stats'
    );
}

export function useEmployeeStats(client: AxiosInstance, userId: string) {
    return useApiQuery<EmployeeDashboardStats>(
        client,
        reportKeys.detail(`employee-stats-${userId}`),
        `/reports/employee-stats/${userId}`
    );
}

export function useTimesheetReport(client: AxiosInstance, params: { startDate: string; endDate: string; userId?: string }) {
    return useApiQuery<TimesheetSummary[]>(
        client,
        reportKeys.list(params),
        '/reports/timesheet',
        {
            axiosConfig: { params }
        }
    );
}

export function useProjectReport(client: AxiosInstance, projectId: string) {
    return useApiQuery<ProjectReport>(
        client,
        reportKeys.detail(`project-${projectId}`),
        `/reports/projects/${projectId}`
    );
}

export function useProductivityReport(client: AxiosInstance, params: { startDate: string; endDate: string; userId?: string }) {
    return useApiQuery<ProductivityReport>(
        client,
        reportKeys.list({ ...params, type: 'productivity' }),
        '/reports/productivity',
        {
            axiosConfig: { params }
        }
    );
}
