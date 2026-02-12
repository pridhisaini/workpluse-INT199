'use client';

import {
    useQuery,
    useMutation,
    UseQueryOptions,
    UseMutationOptions,
    QueryKey,
} from '@tanstack/react-query';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiError } from '../client';

// Generic query hook
export function useApiQuery<TData>(
    client: AxiosInstance,
    queryKey: QueryKey,
    url: string,
    options?: Omit<UseQueryOptions<TData, ApiError>, 'queryKey' | 'queryFn'> & {
        axiosConfig?: AxiosRequestConfig;
    }
) {
    const { axiosConfig, ...queryOptions } = options || {};
    return useQuery<TData, ApiError>({
        queryKey,
        queryFn: async () => {
            const { data } = await client.get<TData>(url, axiosConfig);
            return data;
        },
        ...queryOptions,
    });
}

// Generic mutation hook
export function useApiMutation<TData, TVariables>(
    client: AxiosInstance,
    url: string,
    method: 'post' | 'put' | 'patch' | 'delete' = 'post',
    options?: Omit<UseMutationOptions<TData, ApiError, TVariables>, 'mutationFn'> & {
        axiosConfig?: AxiosRequestConfig;
    }
) {
    const { axiosConfig, ...mutationOptions } = options || {};
    return useMutation<TData, ApiError, TVariables>({
        mutationFn: async (variables: TVariables) => {
            const config = { ...axiosConfig };
            const { data } = await client[method]<TData>(url, variables, config);
            return data;
        },
        ...mutationOptions,
    });
}

// Query key factory
export function createQueryKeys(scope: string) {
    return {
        all: [scope] as const,
        lists: () => [...createQueryKeys(scope).all, 'list'] as const,
        list: (filters: Record<string, unknown>) =>
            [...createQueryKeys(scope).lists(), filters] as const,
        details: () => [...createQueryKeys(scope).all, 'detail'] as const,
        detail: (id: string) => [...createQueryKeys(scope).details(), id] as const,
    };
}
