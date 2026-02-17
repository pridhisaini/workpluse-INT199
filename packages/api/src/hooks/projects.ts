import { AxiosInstance } from 'axios';
import { useApiMutation, useApiQuery, createQueryKeys } from './use-api';
import { Project, ApiResponse } from '@repo/types';

const projectKeys = createQueryKeys('projects');

export function useProjects(client: AxiosInstance, params?: Record<string, any>) {
    return useApiQuery<ApiResponse<Project[]>>(
        client,
        projectKeys.list(params || {}),
        '/projects',
        {
            axiosConfig: { params }
        }
    );
}

export function useProject(client: AxiosInstance, id: string) {
    return useApiQuery<ApiResponse<Project>>(
        client,
        projectKeys.detail(id),
        `/projects/${id}`
    );
}

export function useCreateProject(client: AxiosInstance) {
    return useApiMutation<ApiResponse<Project>, Partial<Project>>(
        client,
        '/projects',
        'post'
    );
}

export function useUpdateProject(client: AxiosInstance, id: string) {
    return useApiMutation<ApiResponse<Project>, Partial<Project>>(
        client,
        `/projects/${id}`,
        'patch'
    );
}

export function useDeleteProject(client: AxiosInstance, id: string) {
    return useApiMutation<ApiResponse<void>, void>(
        client,
        `/projects/${id}`,
        'delete'
    );
}

export function useEmployeeProjects(client: AxiosInstance, userId: string) {
    return useApiQuery<ApiResponse<Project[]>>(
        client,
        projectKeys.list({ employeeId: userId }),
        `/projects/employee/${userId}`
    );
}

export function useAssignMembers(client: AxiosInstance, projectId: string) {
    return useApiMutation<ApiResponse<Project>, { userIds: string[] }>(
        client,
        `/projects/${projectId}/members`,
        'post'
    );
}
