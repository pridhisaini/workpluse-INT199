import { AxiosInstance } from 'axios';
import { useApiMutation, useApiQuery, createQueryKeys } from './use-api';
import { TimeEntry } from '@repo/types';

const sessionKeys = createQueryKeys('sessions');

export function useSessions(client: AxiosInstance, params?: Record<string, any>) {
    return useApiQuery<TimeEntry[]>(
        client,
        sessionKeys.list(params || {}),
        '/sessions',
        {
            axiosConfig: { params }
        }
    );
}

export function useCurrentSession(client: AxiosInstance) {
    return useApiQuery<any | null>(
        client,
        sessionKeys.detail('active'),
        '/sessions/active'
    );
}

export function useStartSession(client: AxiosInstance) {
    return useApiMutation<any, { projectId?: string; task?: string }>(
        client,
        '/sessions/start',
        'post'
    );
}

export function useLogManualSession(client: AxiosInstance) {
    return useApiMutation<any, { projectId: string; task: string; startTime: string; endTime: string; description?: string }>(
        client,
        '/sessions/manual',
        'post'
    );
}

export function useStopSession(client: AxiosInstance) {
    return useApiMutation<any, { id: string }>(
        client,
        (variables) => `/sessions/${variables.id}/stop`,
        'post'
    );
}

export function useUpdateSession(client: AxiosInstance, id: string) {
    return useApiMutation<TimeEntry, Partial<TimeEntry>>(
        client,
        `/sessions/${id}`,
        'put'
    );
}

export function useSessionHistory(client: AxiosInstance, params?: { startDate?: string; endDate?: string }) {
    return useApiQuery<any>(
        client,
        sessionKeys.list({ type: 'history', ...params }),
        '/sessions/history',
        {
            axiosConfig: { params }
        }
    );
}
