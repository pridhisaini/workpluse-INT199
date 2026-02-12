import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosError } from 'axios';
import type { ApiResponse } from '@repo/types';

export interface ApiClientConfig {
    baseURL: string;
    getToken?: () => string | null;
    onError?: (error: ApiError) => void;
}

export interface ApiError {
    message: string;
    status?: number;
    code?: string;
    errors?: Record<string, string[]>;
}

export function createApiClient(config: ApiClientConfig): AxiosInstance {
    const client = axios.create({
        baseURL: config.baseURL,
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 30000,
    });

    // Request interceptor for auth
    client.interceptors.request.use(
        (reqConfig: InternalAxiosRequestConfig) => {
            const token = config.getToken?.();
            if (token && reqConfig.headers) {
                reqConfig.headers.Authorization = `Bearer ${token}`;
            }
            return reqConfig;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor
    client.interceptors.response.use(
        (response) => {
            // If the response follows our ApiResponse structure, we might want to unwrap it
            // but usually axios handles the status code.
            return response;
        },
        (error: AxiosError<ApiResponse<any>>) => {
            const apiError: ApiError = {
                message: 'An unexpected error occurred',
                status: error.response?.status,
            };

            if (error.response?.data) {
                const data = error.response.data;
                apiError.message = data.error || data.message || apiError.message;
                // If there's a more detailed error structure (e.g. validation errors)
                // we can add it here.
            } else if (error.request) {
                apiError.message = 'No response from server. Please check your connection.';
            } else {
                apiError.message = error.message;
            }

            if (apiError.status === 401) {
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
                }
            }

            if (config.onError) {
                config.onError(apiError);
            }

            return Promise.reject(apiError);
        }
    );

    return client;
}
