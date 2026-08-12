import React, { createContext, useContext, useMemo } from 'react';
import { useMenuTree } from '../hooks/useMenuTree';
import { PermissionSet, MenuTreeResponse } from '../api/rbac/types';

interface PermissionContextValue {
  menuTree: MenuTreeResponse | undefined;
  isLoading: boolean;
  getPagePermissions: (pageCode: string) => PermissionSet | null;
  hasPageAccess: (pageCode: string) => boolean;
}

const PermissionContext = createContext<PermissionContextValue>({
  menuTree: undefined,
  isLoading: true,
  getPagePermissions: () => null,
  hasPageAccess: () => false,
});

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { data: menuTree, isLoading } = useMenuTree();

  const value = useMemo<PermissionContextValue>(() => ({
    menuTree,
    isLoading,
    getPagePermissions: (pageCode: string) => {
      if (!menuTree) return null;
      for (const mod of menuTree.modules) {
        const page = mod.pages.find(p => p.code === pageCode);
        if (page) return page.permissions;
      }
      return null;
    },
    hasPageAccess: (pageCode: string) => {
      if (!menuTree) return false;
      for (const mod of menuTree.modules) {
        if (mod.pages.some(p => p.code === pageCode)) return true;
      }
      return false;
    },
  }), [menuTree, isLoading]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export const usePermissions = () => useContext(PermissionContext);
