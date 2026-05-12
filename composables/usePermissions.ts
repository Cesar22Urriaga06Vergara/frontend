import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import type { UserRole } from '~/types/auth'
import type { EstadoFactura } from '~/types/factura'

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
      'reserva:checkin',
      'reserva:checkout',
      'caja:ver',
      'manage_hotels',
      'manage_amenities',
      // FASE 7: Permisos de facturas
      'factura:ver',
      'factura:ver-historial',
      'factura:cambiar-estado',
      'factura:emitir',
      'factura:anular',
    ],
    admin: [
      'manage_users',
      'manage_rooms',
      'manage_reservations',
      'manage_orders',
      'manage_services',
      'view_reports',
      'checkin_checkout',
      'reserva:checkin',
      'reserva:checkout',
      'caja:ver',
      'manage_amenities',
      // FASE 7: Permisos de facturas
      'factura:ver',
      'factura:ver-historial',
      'factura:cambiar-estado',
      'factura:emitir',
      'factura:anular',
    ],
    recepcionista: [
      'manage_reservations',
      'checkin_checkout',
      'reserva:checkin',
      'reserva:checkout',
      'caja:ver',
      'caja:abrir',
      'caja:movimientos',
      'caja:cerrar',
      'view_reports',
      // FASE 7: Permisos de facturas
      'factura:ver',
      'factura:ver-historial',
    ],
    cajero: [
      'caja:ver',
      'caja:abrir',
      'caja:movimientos',
      'caja:cerrar',
      'factura:ver',
      'factura:ver-historial',
    ],
    cafeteria: ['manage_orders'],
    lavanderia: ['manage_orders'],
    spa: ['manage_orders'],
    room_service: ['manage_orders'],
    minibar: ['manage_orders'],
    transporte: ['manage_orders'],
    tours: ['manage_orders'],
    eventos: ['manage_orders'],
    mantenimiento: ['manage_orders'],
    cliente: [
      // FASE 7: Clientes ven solo sus propias facturas
      'factura:ver',
      'factura:ver-historial',
    ],
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

  /**
   * FASE 7: Validar si puede cambiar estado de factura
   * Valida permisos + transición de estado
   */
  const canCambiarEstadoFactura = (
    estadoActual: EstadoFactura,
    estadoNuevo: EstadoFactura
  ): boolean => {
    const role = authStore.userRole?.toLowerCase()

    // Solo admin y superadmin pueden cambiar estados
    if (!['admin', 'superadmin'].includes(role || '')) {
      return false
    }

    // Matriz de transiciones permitidas
    const transicionesPermitidas: Record<EstadoFactura, EstadoFactura[]> = {
      BORRADOR: ['EDITABLE', 'EMITIDA', 'ANULADA'],
      EDITABLE: ['EMITIDA', 'BORRADOR', 'ANULADA'],
      EMITIDA: ['PAGADA', 'ANULADA'],
      PAGADA: [], // Terminal - no se puede cambiar
      ANULADA: [], // Terminal - no se puede cambiar
    }

    const permitidas = transicionesPermitidas[estadoActual] || []
    return permitidas.includes(estadoNuevo)
  }

  /**
   * Validar si puede emitir (específico para factura)
   */
  const puedeEmitirFactura = (estadoActual: EstadoFactura): boolean =>
    canCambiarEstadoFactura(estadoActual, 'EMITIDA')

  /**
   * Validar si puede anular (más restrictivo que emitir)
   */
  const puedeAnularFactura = (estadoActual: EstadoFactura): boolean => {
    const role = authStore.userRole?.toLowerCase()
    // Anular es más restrictivo: solo superadmin en estados iniciales
    if (role !== 'superadmin' && estadoActual === 'PAGADA') {
      return false
    }
    return canCambiarEstadoFactura(estadoActual, 'ANULADA')
  }

  /**
   * Validar si puede marcar como pagada
   */
  const puedePagarFactura = (estadoActual: EstadoFactura): boolean =>
    canCambiarEstadoFactura(estadoActual, 'PAGADA')

  return {
    can,
    canAny,
    canAll,
    userPermissions,
    hasRole,
    hasAnyRole,
    // FASE 7: Métodos de factura
    canCambiarEstadoFactura,
    puedeEmitirFactura,
    puedeAnularFactura,
    puedePagarFactura,
  }
}
