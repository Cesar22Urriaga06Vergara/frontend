// utils/constants.ts
import { UserRole } from '~/types/auth'

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPERADMIN]: 'SuperAdministrador',
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.RECEPCIONISTA]: 'Recepcionista',
  [UserRole.CLIENTE]: 'Cliente',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.SUPERADMIN]: 'success',
  [UserRole.ADMIN]: 'error',
  [UserRole.RECEPCIONISTA]: 'warning',
  [UserRole.CLIENTE]: 'primary',
}

export const ROLE_ICONS: Record<UserRole, string> = {
  [UserRole.SUPERADMIN]: 'mdi-shield-admin',
  [UserRole.ADMIN]: 'mdi-shield-crown',
  [UserRole.RECEPCIONISTA]: 'mdi-account-tie',
  [UserRole.CLIENTE]: 'mdi-account',
}

export const ROLE_DEFAULT_ROUTE: Record<UserRole, string> = {
  [UserRole.SUPERADMIN]: '/dashboard/superadmin/reservas',
  [UserRole.ADMIN]: '/dashboard/admin/users',
  [UserRole.RECEPCIONISTA]: '/dashboard/recepcionista',
  [UserRole.CLIENTE]: '/reservas/nueva',
}
