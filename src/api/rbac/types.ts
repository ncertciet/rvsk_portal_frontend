export interface PermissionSet {
  canView: boolean;
  canEdit: boolean;
  canExport: boolean;
  canDelete: boolean;
}

export interface MenuPage {
  id: string;
  code: string;
  name: string;
  routePath: string;
  icon: string;
  displayOrder: number;
  permissions: PermissionSet;
}

export interface MenuModule {
  id: string;
  code: string;
  name: string;
  icon: string;
  displayOrder: number;
  pages: MenuPage[];
}

export interface MenuTreeResponse {
  modules: MenuModule[];
}
