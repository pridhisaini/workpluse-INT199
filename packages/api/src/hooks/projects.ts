import { AxiosInstance } from 'axios';
import { useApiMutation, useApiQuery, createQueryKeys } from './use-api';
import { Project, PaginatedResponse } from '@repo/types';

const projectKeys = createQueryKeys('projects');

export function useProjects(client: AxiosInstance, params?: Record<string, any>) {
    return useApiQuery<Project[]>(
        client,
        projectKeys.list(params || {}),
        '/projects',
        {
            axiosConfig: { params }
        }
    );
}

export function useProject(client: AxiosInstance, id: string) {
    return useApiQuery<Project>(
        client,
        projectKeys.detail(id),
        `/projects/${id}`
    );
}

export function useCreateProject(client: AxiosInstance) {
    return useApiMutation<Project, Partial<Project>>(
        client,
        '/projects',
        'post'
    );
}

export function useUpdateProject(client: AxiosInstance, id: string) {
    return useApiMutation<Project, Partial<Project>>(
        client,
        `/projects/${id}`,
        'put'
    );
}

export function useDeleteProject(client: AxiosInstance) {
    return useApiMutation<void, string>(
        client,
        '/projects', // Assuming DELETE /projects/:id but mutationFn usually takes variables
        'delete'
    );
}

export function useAssignEmployee(client: AxiosInstance, projectId: string) {
    return useApiMutation<void, { userId: string }>(
        client,
        `/projects/${projectId}/assign`,
        'post'
    );
}
