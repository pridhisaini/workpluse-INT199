import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import { ApiResponse } from '@repo/types';

export const useOrganization = (client: AxiosInstance, id: string | undefined) => {
    return useQuery({
        queryKey: ['organization', id],
        queryFn: async () => {
            const { data } = await client.get<ApiResponse<any>>(`/organizations/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useUpdateOrganization = (client: AxiosInstance) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const result = await client.post<ApiResponse<any>>(`/organizations/${id}`, data);
            return result.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['organization', id] });
        },
    });
};
