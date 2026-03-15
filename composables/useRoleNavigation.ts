// composables/useRoleNavigation.ts
import { useAuthStore } from '~/stores/auth'
import { UserRole } from '~/types/auth'
import { ROLE_LABELS, ROLE_COLORS, ROLE_ICONS, ROLE_DEFAULT_ROUTE } from '~/utils/constants'

export interface NavItem {
  title: string
  icon: string
  to: string
  badge?: number | string
  disabled?: boolean
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

export interface BreadcrumbItem {
  title: string
  to?: string
  disabled?: boolean
}

// Mapa completo de rutas con metadata para breadcrumbs
const ROUTE_META: Record<string, { title: string; parent?: string }> = {
  '/dashboard': { title: 'Dashboard' },
  '/dashboard/staff': { title: 'Panel de Control', parent: '/dashboard' },
  '/dashboard/staff/users': { title: 'Usuarios', parent: '/dashboard/staff' },
  '/dashboard/staff/users-[id]': { title: 'Editar Usuario', parent: '/dashboard/staff/users' },
  '/dashboard/staff/reservas': { title: 'Gestión de Reservas', parent: '/dashboard/staff' },
  '/dashboard/staff/rooms': { title: 'Habitaciones', parent: '/dashboard/staff' },
  '/dashboard/staff/room-types': { title: 'Tipos de Habitación', parent: '/dashboard/staff' },
  '/dashboard/staff/amenidades': { title: 'Amenidades', parent: '/dashboard/staff' },
  '/dashboard/staff/services': { title: 'Catálogo de Servicios', parent: '/dashboard/staff' },
  '/dashboard/staff/orders': { title: 'Gestión de Pedidos', parent: '/dashboard/staff' },
  '/dashboard/staff/reset-stats': { title: 'Reset Stats', parent: '/dashboard/staff' },
  '/dashboard/staff/recepcionista': { title: 'Dashboard - Recepcionista', parent: '/dashboard/staff' },
  '/dashboard/staff/recepcionista/reservas': { title: 'Gestión de Reservas', parent: '/dashboard/staff/recepcionista' },
  '/dashboard/staff/recepcionista/checkout': { title: 'Gestión de Check-out', parent: '/dashboard/staff/recepcionista' },
  '/dashboard/staff/checkin': { title: 'Check-in de Huéspedes', parent: '/dashboard/staff' },
  '/dashboard/staff/checkout': { title: 'Check-out de Huéspedes', parent: '/dashboard/staff' },
  '/dashboard/staff/reports': { title: 'Reportes y Análisis', parent: '/dashboard/staff' },
  '/dashboard/staff/area': { title: 'Gestión de Área', parent: '/dashboard/staff' },
  '/dashboard/profile': { title: 'Mi Perfil', parent: '/dashboard' },
  '/dashboard/cliente': { title: 'Mi Panel', parent: '/dashboard' },
  '/dashboard/cliente/cuenta': { title: 'Mi Cuenta', parent: '/dashboard/cliente' },
  '/dashboard/cliente/servicios': { title: 'Servicios', parent: '/dashboard/cliente' },
  '/dashboard/cliente/servicios/carrito': { title: 'Carrito', parent: '/dashboard/cliente/servicios' },
  '/dashboard/cliente/servicios/mis-pedidos': { title: 'Mis Pedidos', parent: '/dashboard/cliente/servicios' },
  '/reservas/nueva': { title: 'Nueva Reserva' },
  '/reservas/confirmacion': { title: 'Confirmación de Reserva', parent: '/reservas/nueva' },
}

export const useRoleNavigation = () => {
  const authStore = useAuthStore()
  const route = useRoute()

  // ── Información del rol ──
  const roleLabel = computed(() =>
    authStore.userRole ? ROLE_LABELS[authStore.userRole] : ''
  )

  const roleColor = computed(() =>
    authStore.userRole ? ROLE_COLORS[authStore.userRole] : 'primary'
  )

  const roleIcon = computed(() =>
    authStore.userRole ? ROLE_ICONS[authStore.userRole] : 'mdi-account'
  )

  const defaultRoute = computed(() =>
    authStore.userRole ? ROLE_DEFAULT_ROUTE[authStore.userRole] : '/dashboard'
  )

  // ── Navegación por secciones ──
  const navigationSections = computed((): NavSection[] => {
    const role = authStore.userRole

    const accountSection: NavSection = {
      title: 'Cuenta',
      items: [
        { title: 'Mi Perfil', icon: 'mdi-account-circle-outline', to: '/dashboard/profile' },
      ],
    }

    switch (role) {
      case UserRole.SUPERADMIN:
        return [
          {
            title: 'Principal',
            items: [
              { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/dashboard/staff' },
            ],
          },
          {
            title: 'Operaciones',
            items: [
              { title: 'Gestión de Reservas', icon: 'mdi-calendar-check-outline', to: '/dashboard/staff/reservas' },
            ],
          },
          {
            title: 'Configuración Hotel',
            items: [
              { title: 'Habitaciones', icon: 'mdi-door', to: '/dashboard/staff/rooms' },
              { title: 'Tipos de Habitación', icon: 'mdi-bed-outline', to: '/dashboard/staff/room-types' },
              { title: 'Amenidades', icon: 'mdi-star-outline', to: '/dashboard/staff/amenidades' },
            ],
          },
          {
            title: 'Administración',
            items: [
              { title: 'Usuarios', icon: 'mdi-account-group-outline', to: '/dashboard/staff/users' },
            ],
          },
          accountSection,
        ]

      case UserRole.ADMIN:
        return [
          {
            title: 'Principal',
            items: [
              { title: 'Inicio', icon: 'mdi-view-dashboard-outline', to: '/dashboard/staff' },
            ],
          },
          {
            title: 'Operaciones',
            items: [
              { title: 'Gestión de Reservas', icon: 'mdi-calendar-check-outline', to: '/dashboard/staff/reservas' },
            ],
          },
          {
            title: 'Administración',
            items: [
              { title: 'Usuarios', icon: 'mdi-account-group-outline', to: '/dashboard/staff/users' },
              { title: 'Reset Stats', icon: 'mdi-chart-bar', to: '/dashboard/staff/reset-stats' },
            ],
          },
          {
            title: 'Hotel',
            items: [
              { title: 'Catálogo de Servicios', icon: 'mdi-shopping-outline', to: '/dashboard/staff/services' },
              { title: 'Amenidades', icon: 'mdi-star-outline', to: '/dashboard/staff/amenidades' },
              { title: 'Tipos de Habitación', icon: 'mdi-bed-outline', to: '/dashboard/staff/room-types' },
              { title: 'Habitaciones', icon: 'mdi-door', to: '/dashboard/staff/rooms' },
            ],
          },
          accountSection,
        ]

      case UserRole.RECEPCIONISTA:
        return [
          {
            title: 'Principal',
            items: [
              { title: 'Inicio', icon: 'mdi-view-dashboard-outline', to: '/dashboard/staff/recepcionista' },
            ],
          },
          {
            title: 'Gestión',
            items: [
              { title: 'Check-in', icon: 'mdi-login-variant', to: '/dashboard/staff/checkin' },
              { title: 'Reservas', icon: 'mdi-calendar-check-outline', to: '/dashboard/staff/recepcionista/reservas' },
              { title: 'Check-out', icon: 'mdi-logout-variant', to: '/dashboard/staff/checkout' },
            ],
          },
          accountSection,
        ]

      case UserRole.CLIENTE:
        return [
          {
            title: 'Mis Servicios',
            items: [
              { title: 'Servicios', icon: 'mdi-shopping-outline', to: '/dashboard/cliente/servicios' },
              { title: 'Mis Pedidos', icon: 'mdi-list-status', to: '/dashboard/cliente/servicios/mis-pedidos' },
              { title: 'Mi Cuenta', icon: 'mdi-receipt-text-outline', to: '/dashboard/cliente/cuenta' },
            ],
          },
          {
            title: 'Reservas',
            items: [
              { title: 'Nueva Reserva', icon: 'mdi-calendar-plus', to: '/reservas/nueva' },
              { title: 'Mis Reservas', icon: 'mdi-calendar-check', to: '/reservas/mis-reservas' },
            ],
          },
          accountSection,
        ]

      case 'cafeteria':
      case 'lavanderia':
      case 'spa':
      case 'room_service':
      case UserRole.CAFETERIA:
      case UserRole.LAVANDERIA:
      case UserRole.SPA:
      case UserRole.ROOM_SERVICE:
        return [
          {
            title: 'Área de Trabajo',
            items: [
              { title: 'Gestión de Pedidos', icon: 'mdi-clipboard-list-outline', to: '/dashboard/staff/orders' },
            ],
          },
          accountSection,
        ]

      default:
        return [accountSection]
    }
  })

  // ── Lista plana de items (útil para búsquedas) ──
  const allNavItems = computed((): NavItem[] => {
    return navigationSections.value.flatMap((section) => section.items)
  })

  // ── Breadcrumbs dinámicos ──
  const breadcrumbs = computed((): BreadcrumbItem[] => {
    const path = route.path
    const crumbs: BreadcrumbItem[] = []

    // Intentar match directo, si no, intentar con el pattern dinámico
    let currentPath: string | undefined = path

    while (currentPath) {
      const meta: { title: string; parent?: string } | null = ROUTE_META[currentPath] || matchDynamicRoute(currentPath)
      if (meta) {
        crumbs.unshift({
          title: meta.title,
          to: currentPath === path ? undefined : currentPath,
          disabled: currentPath === path,
        })
        currentPath = meta.parent
      } else {
        break
      }
    }

    // Si no se encontró metadata, usar el nombre genérico
    if (crumbs.length === 0) {
      crumbs.push({ title: 'Dashboard', disabled: true })
    }

    return crumbs
  })

  /**
   * Intentar hacer match de rutas dinámicas (ej: /dashboard/staff/users/123)
   */
  const matchDynamicRoute = (path: string): { title: string; parent?: string } | null => {
    // /dashboard/staff/users/:id
    if (/^\/dashboard\/staff\/users\/[^/]+$/.test(path)) {
      return { title: 'Detalle de Usuario', parent: '/dashboard/staff/users' }
    }
    return null
  }

  // ── Título de la página actual ──
  const pageTitle = computed((): string => {
    const meta = ROUTE_META[route.path]
    return meta?.title || 'Dashboard'
  })

  // ── Verificación de permisos ──
  const canAccess = (targetRoute: string): boolean => {
    return allNavItems.value.some((item) => item.to === targetRoute)
  }

  // ── Obtener saludo personalizado ──
  const greeting = computed((): string => {
    const hour = new Date().getHours()
    const name = authStore.userName?.split(' ')[0] || ''

    if (hour < 12) return `Buenos días, ${name}`
    if (hour < 18) return `Buenas tardes, ${name}`
    return `Buenas noches, ${name}`
  })

  return {
    // Rol
    roleLabel,
    roleColor,
    roleIcon,
    defaultRoute,
    // Navegación
    navigationSections,
    allNavItems,
    breadcrumbs,
    pageTitle,
    // Utilidades
    canAccess,
    greeting,
  }
}
