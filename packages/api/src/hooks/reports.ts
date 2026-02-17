import { AxiosInstance } from 'axios';
import { useApiQuery, createQueryKeys } from './use-api';
import {
    AdminDashboardStats,
    EmployeeDashboardStats,
    TimesheetSummary,
    ProjectReport,
    ProductivityReport,
    ProductivityTrend,
    ApiResponse
} from '@repo/types';

const reportKeys = createQueryKeys('reports');

export function useAdminStats(client: AxiosInstance, options?: any) {
    return useApiQuery<ApiResponse<AdminDashboardStats>>(
        client,
        reportKeys.detail('admin-stats'),
        '/reports/admin-stats',
        options
    );
}

export function useEmployeeStats(client: AxiosInstance, userId: string, options?: any) {
    return useApiQuery<ApiResponse<EmployeeDashboardStats>>(
        client,
        reportKeys.detail(`employee-stats-${userId}`),
        `/reports/employee-stats/${userId}`,
        options
    );
}

export function useTimesheetReport(client: AxiosInstance, params: { startDate: string; endDate: string; userId?: string }, options?: any) {
    return useApiQuery<ApiResponse<TimesheetSummary[]>>(
        client,
        reportKeys.list(params),
        '/reports/timesheet',
        {
            ...options,
            axiosConfig: { params }
        }
    );
}

export function useProjectReport(client: AxiosInstance, projectId: string, options?: any) {
    return useApiQuery<ApiResponse<ProjectReport>>(
        client,
        reportKeys.detail(`project-${projectId}`),
        `/reports/projects/${projectId}`,
        options
    );
}

export function useProductivityReport(client: AxiosInstance, params: { startDate: string; endDate: string; userId?: string }, options?: any) {
    return useApiQuery<ApiResponse<ProductivityTrend>>(
        client,
        reportKeys.list({ ...params, type: 'productivity' }),
        '/reports/productivity',
        {
            ...options,
            axiosConfig: { params }
        }
    );
}

export function useAttendanceReport(client: AxiosInstance, params: { startDate: string; endDate: string; userId?: string }, options?: any) {
    return useApiQuery<ApiResponse<any>>(
        client,
        reportKeys.list({ ...params, type: 'attendance' }),
        '/reports/attendance',
        {
            ...options,
            axiosConfig: { params }
        }
    );
}

export function useAdminAttendanceReport(client: AxiosInstance, params?: { date: string }, options?: any) {
    return useApiQuery<ApiResponse<any>>(
        client,
        reportKeys.detail(`admin-attendance-${params?.date || 'today'}`),
        '/reports/admin/attendance',
        {
            ...options,
            axiosConfig: { params }
        }
    );
}

export function useAdminProductivityReport(client: AxiosInstance, options?: any) {
    return useApiQuery<ApiResponse<any>>(
        client,
        reportKeys.detail('admin-productivity'),
        '/reports/admin/productivity',
        options
    );
}

export function useAdminProjectReport(client: AxiosInstance, options?: any) {
    return useApiQuery<ApiResponse<any>>(
        client,
        reportKeys.detail('admin-projects'),
        '/reports/admin/projects',
        options
    );
}
