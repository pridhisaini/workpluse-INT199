import { AxiosInstance } from 'axios';
import { useApiMutation, useApiQuery, createQueryKeys } from './use-api';
import { AuthResponse, LoginCredentials, User, ApiResponse } from '@repo/types';

const authKeys = createQueryKeys('auth');

export function useLogin(client: AxiosInstance) {
    return useApiMutation<AuthResponse, LoginCredentials>(
        client,
        '/auth/login',
        'post'
    );
}

export function useLogout(client: AxiosInstance) {
    return useApiMutation<void, void>(
        client,
        '/auth/logout',
        'post'
    );
}

export function useMe(client: AxiosInstance, options?: { enabled?: boolean }) {
    return useApiQuery<User>(
        client,
        authKeys.detail('me'),
        '/auth/me',
        options
    );
}

export function useRegister(client: AxiosInstance) {
    return useApiMutation<AuthResponse, any>(
        client,
        '/auth/register',
        'post'
    );
}
