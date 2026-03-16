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

  // ── Recepcionista ──
  '/dashboard/empleados/recepcionista': { title: 'Panel Recepcionista', parent: '/dashboard' },
  '/dashboard/empleados/recepcionista/reservas': { title: 'Gestión de Reservas', parent: '/dashboard/empleados/recepcionista' },
  '/dashboard/empleados/recepcionista/checkin': { title: 'Registrar Entrada', parent: '/dashboard/empleados/recepcionista' },
  '/dashboard/empleados/recepcionista/checkout': { title: 'Gestión de Check-out', parent: '/dashboard/empleados/recepcionista' },

  // ── Admin ──
  '/dashboard/empleados/admin': { title: 'Panel Admin', parent: '/dashboard' },
  '/dashboard/empleados/admin/usuarios': { title: 'Usuarios', parent: '/dashboard/empleados/admin' },
  '/dashboard/empleados/admin/usuarios-[id]': { title: 'Detalle Usuario', parent: '/dashboard/empleados/admin/usuarios' },
  '/dashboard/empleados/admin/reservas': { title: 'Gestión de Reservas', parent: '/dashboard/empleados/admin' },
  '/dashboard/empleados/admin/habitaciones': { title: 'Habitaciones', parent: '/dashboard/empleados/admin' },
  '/dashboard/empleados/admin/tipos-habitacion': { title: 'Tipos de Habitación', parent: '/dashboard/empleados/admin' },
  '/dashboard/empleados/admin/amenidades': { title: 'Amenidades', parent: '/dashboard/empleados/admin' },
  '/dashboard/empleados/admin/servicios': { title: 'Catálogo de Servicios', parent: '/dashboard/empleados/admin' },
  '/dashboard/empleados/admin/pedidos': { title: 'Gestión de Pedidos', parent: '/dashboard/empleados/admin' },
  '/dashboard/empleados/admin/reportes': { title: 'Reportes y Análisis', parent: '/dashboard/empleados/admin' },
  '/dashboard/empleados/admin/reset-stats': { title: 'Reset Stats', parent: '/dashboard/empleados/admin' },
  '/dashboard/empleados/admin/checkin': { title: 'Registrar Entrada', parent: '/dashboard/empleados/admin' },
  '/dashboard/empleados/admin/checkout': { title: 'Registrar Salida', parent: '/dashboard/empleados/admin' },

  // ── SuperAdmin ──
  '/dashboard/empleados/superadmin': { title: 'Panel SuperAdmin', parent: '/dashboard' },
  '/dashboard/empleados/superadmin/usuarios': { title: 'Usuarios', parent: '/dashboard/empleados/superadmin' },
  '/dashboard/empleados/superadmin/usuarios-[id]': { title: 'Detalle Usuario', parent: '/dashboard/empleados/superadmin/usuarios' },
  '/dashboard/empleados/superadmin/reservas': { title: 'Gestión de Reservas', parent: '/dashboard/empleados/superadmin' },
  '/dashboard/empleados/superadmin/habitaciones': { title: 'Habitaciones', parent: '/dashboard/empleados/superadmin' },
  '/dashboard/empleados/superadmin/tipos-habitacion': { title: 'Tipos de Habitación', parent: '/dashboard/empleados/superadmin' },
  '/dashboard/empleados/superadmin/amenidades': { title: 'Amenidades', parent: '/dashboard/empleados/superadmin' },
  '/dashboard/empleados/superadmin/servicios': { title: 'Catálogo de Servicios', parent: '/dashboard/empleados/superadmin' },
  '/dashboard/empleados/superadmin/pedidos': { title: 'Gestión de Pedidos', parent: '/dashboard/empleados/superadmin' },
  '/dashboard/empleados/superadmin/reportes': { title: 'Reportes y Análisis', parent: '/dashboard/empleados/superadmin' },
  '/dashboard/empleados/superadmin/reset-stats': { title: 'Reset Stats', parent: '/dashboard/empleados/superadmin' },
  '/dashboard/empleados/superadmin/checkin': { title: 'Registrar Entrada', parent: '/dashboard/empleados/superadmin' },
  '/dashboard/empleados/superadmin/checkout': { title: 'Registrar Salida', parent: '/dashboard/empleados/superadmin' },

  // ── Roles de Área ──
  '/dashboard/empleados/area': { title: 'Mi Área de Trabajo', parent: '/dashboard' },
  '/dashboard/empleados/area/cafeteria': { title: 'Mi Área — Cafetería', parent: '/dashboard/empleados/area' },
  '/dashboard/empleados/area/lavanderia': { title: 'Mi Área — Lavandería', parent: '/dashboard/empleados/area' },
  '/dashboard/empleados/area/spa': { title: 'Mi Área — Spa', parent: '/dashboard/empleados/area' },
  '/dashboard/empleados/area/room-service': { title: 'Mi Área — Room Service', parent: '/dashboard/empleados/area' },

  // ── Compartidas ──
  '/dashboard/profile': { title: 'Mi Perfil', parent: '/dashboard' },
  '/dashboard/cliente': { title: 'Dashboard Cliente', parent: '/dashboard' },
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
              { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/dashboard/empleados/superadmin' },
            ],
          },
          {
            title: 'Operaciones',
            items: [
              { title: 'Gestión de Reservas', icon: 'mdi-calendar-check-outline', to: '/dashboard/empleados/superadmin/reservas' },
              { title: 'Check-in', icon: 'mdi-login-variant', to: '/dashboard/empleados/superadmin/checkin' },
              { title: 'Check-out', icon: 'mdi-logout-variant', to: '/dashboard/empleados/superadmin/checkout' },
            ],
          },
          {
            title: 'Configuración Hotel',
            items: [
              { title: 'Habitaciones', icon: 'mdi-door', to: '/dashboard/empleados/superadmin/habitaciones' },
              { title: 'Tipos de Habitación', icon: 'mdi-bed-outline', to: '/dashboard/empleados/superadmin/tipos-habitacion' },
              { title: 'Amenidades', icon: 'mdi-star-outline', to: '/dashboard/empleados/superadmin/amenidades' },
              { title: 'Catálogo de Servicios', icon: 'mdi-shopping-outline', to: '/dashboard/empleados/superadmin/servicios' },
            ],
          },
          {
            title: 'Administración',
            items: [
              { title: 'Usuarios', icon: 'mdi-account-group-outline', to: '/dashboard/empleados/superadmin/usuarios' },
              { title: 'Pedidos', icon: 'mdi-clipboard-list-outline', to: '/dashboard/empleados/superadmin/pedidos' },
              { title: 'Reportes', icon: 'mdi-chart-bar', to: '/dashboard/empleados/superadmin/reportes' },
              { title: 'Reset Stats', icon: 'mdi-lock-reset', to: '/dashboard/empleados/superadmin/reset-stats' },
            ],
          },
          accountSection,
        ]

      case UserRole.ADMIN:
        return [
          {
            title: 'Principal',
            items: [
              { title: 'Inicio', icon: 'mdi-view-dashboard-outline', to: '/dashboard/empleados/admin' },
            ],
          },
          {
            title: 'Operaciones',
            items: [
              { title: 'Gestión de Reservas', icon: 'mdi-calendar-check-outline', to: '/dashboard/empleados/admin/reservas' },
              { title: 'Check-in', icon: 'mdi-login-variant', to: '/dashboard/empleados/admin/checkin' },
              { title: 'Check-out', icon: 'mdi-logout-variant', to: '/dashboard/empleados/admin/checkout' },
            ],
          },
          {
            title: 'Administración',
            items: [
              { title: 'Usuarios', icon: 'mdi-account-group-outline', to: '/dashboard/empleados/admin/usuarios' },
              { title: 'Pedidos', icon: 'mdi-clipboard-list-outline', to: '/dashboard/empleados/admin/pedidos' },
              { title: 'Reportes', icon: 'mdi-chart-bar', to: '/dashboard/empleados/admin/reportes' },
              { title: 'Reset Stats', icon: 'mdi-lock-reset', to: '/dashboard/empleados/admin/reset-stats' },
            ],
          },
          {
            title: 'Hotel',
            items: [
              { title: 'Catálogo de Servicios', icon: 'mdi-shopping-outline', to: '/dashboard/empleados/admin/servicios' },
              { title: 'Amenidades', icon: 'mdi-star-outline', to: '/dashboard/empleados/admin/amenidades' },
              { title: 'Tipos de Habitación', icon: 'mdi-bed-outline', to: '/dashboard/empleados/admin/tipos-habitacion' },
              { title: 'Habitaciones', icon: 'mdi-door', to: '/dashboard/empleados/admin/habitaciones' },
            ],
          },
          accountSection,
        ]

      case UserRole.RECEPCIONISTA:
        return [
          {
            title: 'Principal',
            items: [
              { title: 'Inicio', icon: 'mdi-view-dashboard-outline', to: '/dashboard/empleados/recepcionista' },
            ],
          },
          {
            title: 'Gestión',
            items: [
              { title: 'Entrada del Cliente', icon: 'mdi-login-variant', to: '/dashboard/empleados/recepcionista/checkin' },
              { title: 'Salida del Cliente', icon: 'mdi-logout-variant', to: '/dashboard/empleados/recepcionista/checkout' },
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
        return [
          {
            title: 'Área de Trabajo',
            items: [
              { title: 'Gestión de Pedidos', icon: 'mdi-clipboard-list-outline', to: '/dashboard/empleados/area' },
              { title: 'Mi Área — Cafetería', icon: 'mdi-coffee', to: '/dashboard/empleados/area/cafeteria' },
            ],
          },
          accountSection,
        ]

      case UserRole.LAVANDERIA:
        return [
          {
            title: 'Área de Trabajo',
            items: [
              { title: 'Gestión de Pedidos', icon: 'mdi-clipboard-list-outline', to: '/dashboard/empleados/area' },
              { title: 'Mi Área — Lavandería', icon: 'mdi-washing-machine', to: '/dashboard/empleados/area/lavanderia' },
            ],
          },
          accountSection,
        ]

      case UserRole.SPA:
        return [
          {
            title: 'Área de Trabajo',
            items: [
              { title: 'Gestión de Pedidos', icon: 'mdi-clipboard-list-outline', to: '/dashboard/empleados/area' },
              { title: 'Mi Área — Spa', icon: 'mdi-spa', to: '/dashboard/empleados/area/spa' },
            ],
          },
          accountSection,
        ]

      case UserRole.ROOM_SERVICE:
        return [
          {
            title: 'Área de Trabajo',
            items: [
              { title: 'Gestión de Pedidos', icon: 'mdi-clipboard-list-outline', to: '/dashboard/empleados/area' },
              { title: 'Mi Área — Room Service', icon: 'mdi-bell-service-outline', to: '/dashboard/empleados/area/room-service' },
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
   * Intentar hacer match de rutas dinámicas (ej: /dashboard/empleados/usuarios/123)
   */
  const matchDynamicRoute = (path: string): { title: string; parent?: string } | null => {
    // /dashboard/empleados/admin/usuarios/:id
    if (/^\/dashboard\/empleados\/admin\/usuarios\/[^\/]+$/.test(path)) {
      return { title: 'Detalle de Usuario', parent: '/dashboard/empleados/admin/usuarios' }
    }
    // /dashboard/empleados/superadmin/usuarios/:id
    if (/^\/dashboard\/empleados\/superadmin\/usuarios\/[^\/]+$/.test(path)) {
      return { title: 'Detalle de Usuario', parent: '/dashboard/empleados/superadmin/usuarios' }
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
