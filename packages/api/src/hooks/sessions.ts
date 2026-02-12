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
    return useApiQuery<TimeEntry | null>(
        client,
        sessionKeys.detail('current'),
        '/sessions/current'
    );
}

export function useStartSession(client: AxiosInstance) {
    return useApiMutation<TimeEntry, { projectId?: string; task?: string }>(
        client,
        '/sessions/start',
        'post'
    );
}

export function useStopSession(client: AxiosInstance) {
    return useApiMutation<TimeEntry, { entryId: string; seconds?: number }>(
        client,
        '/sessions/stop',
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
