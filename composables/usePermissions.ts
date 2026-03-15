import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import type { UserRole } from '~/types/auth'

/**
 * Composable para verificar permisos por rol y acción
 * Uso:
 * ```
 * const { can, canAny, canAll } = usePermissions()
 * if (can('manage_users')) { ... }
 * ```
 */
export const usePermissions = () => {
  const authStore = useAuthStore()

  /**
   * Matriz de permisos por rol
   * Mapea cada rol a un array de permisos que puede realizar
   */
  const ROLE_PERMISSIONS: Record<string, string[]> = {
    superadmin: [
      'manage_users',
      'manage_rooms',
      'manage_reservations',
      'manage_orders',
      'manage_services',
      'view_reports',
      'checkin_checkout',
      'manage_hotels',
      'manage_amenities',
    ],
    admin: [
      'manage_users',
      'manage_rooms',
      'manage_reservations',
      'manage_orders',
      'manage_services',
      'view_reports',
      'checkin_checkout',
      'manage_amenities',
    ],
    recepcionista: [
      'manage_reservations',
      'checkin_checkout',
      'view_reports',
    ],
    cafeteria: ['manage_orders'],
    lavanderia: ['manage_orders'],
    spa: ['manage_orders'],
    room_service: ['manage_orders'],
    cliente: [],
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  const can = (permission: string): boolean => {
    const role = authStore.userRole?.toLowerCase()
    if (!role) return false
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
  }

  /**
   * Verificar si el usuario tiene AL MENOS UNO de los permisos
   */
  const canAny = (...permissions: string[]): boolean =>
    permissions.some((p) => can(p))

  /**
   * Verificar si el usuario tiene TODOS los permisos
   */
  const canAll = (...permissions: string[]): boolean =>
    permissions.every((p) => can(p))

  /**
   * Obtener lista de permisos del usuario actual
   */
  const userPermissions = computed((): string[] => {
    const role = authStore.userRole?.toLowerCase()
    if (!role) return []
    return ROLE_PERMISSIONS[role] || []
  })

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const hasRole = (role: UserRole | string): boolean => {
    const userRole = authStore.userRole?.toLowerCase()
    const checkRole = String(role).toLowerCase()
    return userRole === checkRole
  }

  /**
   * Verificar si el usuario tiene AL MENOS UNO de los roles
   */
  const hasAnyRole = (...roles: (UserRole | string)[]): boolean =>
    roles.some((r) => hasRole(r))

  return {
    can,
    canAny,
    canAll,
    userPermissions,
    hasRole,
    hasAnyRole,
  }
}
