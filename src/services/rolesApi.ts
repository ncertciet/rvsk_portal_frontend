import apiClient from './apiClient';

/**
 * RVSK-RBAC-ROLE-002-A — Roles API client.
 *
 * Fetches the dynamic role catalog from the backend so the frontend no longer
 * hardcodes role lists. role_code remains the stable authorization key; this
 * only supplies the option lists (dropdowns / filters).
 */
export interface Role {
  id: string;
  roleCode: string;
  roleName: string;
  description: string | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

/** GET /roles. Pass activeOnly=true for dropdowns (the common case). */
export async function fetchRoles(activeOnly = true): Promise<Role[]> {
  const res = await apiClient.get<Role[]>('/roles', {
    params: activeOnly ? { activeOnly: 'true' } : undefined,
  });
  return res.data;
}
