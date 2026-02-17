import { AxiosInstance } from 'axios';
import { useApiQuery, createQueryKeys } from './use-api';
import { ActivityLog, ApiResponse } from '@repo/types';

const activityKeys = createQueryKeys('activity');

export function useActivityLogs(client: AxiosInstance, params?: Record<string, any>) {
    return useApiQuery<ApiResponse<ActivityLog[]>>(
        client,
        activityKeys.list(params || {}),
        '/activity-logs',
        {
            axiosConfig: { params }
        }
    );
}

export function useEmployeeActivityLogs(client: AxiosInstance, userId: string, params?: Record<string, any>) {
    return useApiQuery<ApiResponse<ActivityLog[]>>(
        client,
        activityKeys.list({ userId, ...params }),
        `/activity-logs/employee/${userId}`,
        {
            axiosConfig: { params }
        }
    );
}
