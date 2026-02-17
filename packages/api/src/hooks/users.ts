import { AxiosInstance } from 'axios';
import { useApiQuery, useApiMutation } from './use-api';
import { User, ApiResponse } from '@repo/types';

export function useUsers(client: AxiosInstance, options?: any) {
    return useApiQuery<ApiResponse<User[]>>(
        client,
        ['users'],
        '/users',
        options
    );
}

export function useUser(client: AxiosInstance, id: string) {
    return useApiQuery<ApiResponse<User>>(
        client,
        ['users', id],
        `/users/${id}`,
        { enabled: !!id }
    );
}

export function useCreateUser(client: AxiosInstance) {
    return useApiMutation<ApiResponse<User>, Partial<User>>(
        client,
        '/users',
        'post'
    );
}

export function useUpdateUser(client: AxiosInstance, id: string) {
    return useApiMutation<ApiResponse<User>, Partial<User>>(
        client,
        `/users/${id}`,
        'put'
    );
}

export function useDeleteUser(client: AxiosInstance, id: string) {
    return useApiMutation<ApiResponse<void>, any>(
        client,
        `/users/${id}`,
        'delete'
    );
}
