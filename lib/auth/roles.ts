export type UserRole = 'super_admin' | 'admin' | 'staff'

export const ROLES = {
  SUPER_ADMIN: 'super_admin' as const,
  ADMIN: 'admin' as const,
  STAFF: 'staff' as const,
} as const

export interface RolePermissions {
  canManageUsers: boolean
  canManageClients: boolean
  canManageProjects: boolean
  canManagePayments: boolean
  canManageInvoices: boolean
  canManageHosting: boolean
  canManageReminders: boolean
  canManagePortfolio: boolean
  canViewAnalytics: boolean
  canManageSettings: boolean
  canDeleteRecords: boolean
  canExportData: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  super_admin: {
    canManageUsers: true,
    canManageClients: true,
    canManageProjects: true,
    canManagePayments: true,
    canManageInvoices: true,
    canManageHosting: true,
    canManageReminders: true,
    canManagePortfolio: true,
    canViewAnalytics: true,
    canManageSettings: true,
    canDeleteRecords: true,
    canExportData: true,
  },
  admin: {
    canManageUsers: false,
    canManageClients: true,
    canManageProjects: true,
    canManagePayments: true,
    canManageInvoices: true,
    canManageHosting: true,
    canManageReminders: true,
    canManagePortfolio: true,
    canViewAnalytics: true,
    canManageSettings: false,
    canDeleteRecords: true,
    canExportData: true,
  },
  staff: {
    canManageUsers: false,
    canManageClients: true,
    canManageProjects: true,
    canManagePayments: false,
    canManageInvoices: false,
    canManageHosting: true,
    canManageReminders: true,
    canManagePortfolio: true,
    canViewAnalytics: true,
    canManageSettings: false,
    canDeleteRecords: false,
    canExportData: false,
  },
}

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[role][permission]
}

export function requireRole(userRole: UserRole, requiredRole: UserRole | UserRole[]): boolean {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  const roleHierarchy: Record<UserRole, number> = {
    super_admin: 3,
    admin: 2,
    staff: 1,
  }
  
  const userLevel = roleHierarchy[userRole]
  return roles.some((role) => roleHierarchy[role] <= userLevel)
}