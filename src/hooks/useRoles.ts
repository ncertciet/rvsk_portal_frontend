import { useQuery } from '@tanstack/react-query';
import { fetchRoles, Role } from '../services/rolesApi';

/**
 * RVSK-RBAC-ROLE-002-A — dynamic role catalog for dropdowns/filters.
 *
 * Fetches active roles from GET /roles?activeOnly=true and caches them.
 * Consumers should fall back to a static list if `data` is undefined so the UI
 * never breaks while loading or if the endpoint is briefly unavailable.
 */
export const useRoles = (activeOnly = true) => {
  return useQuery<Role[]>({
    queryKey: ['roles', activeOnly],
    queryFn: () => fetchRoles(activeOnly),
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    retry: 1,
  });
};
