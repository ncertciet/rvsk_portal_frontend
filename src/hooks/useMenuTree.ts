import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { MenuTreeResponse } from '../api/rbac/types';

export const useMenuTree = () => {
  return useQuery<MenuTreeResponse>({
    queryKey: ['menuTree'],
    queryFn: () => apiClient.get('/menu/tree').then(r => r.data),
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    retry: 1,
  });
};
