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
  '/dashboard/empleados': { title: 'Panel de Control', parent: '/dashboard' },
  '/dashboard/empleados/usuarios': { title: 'Usuarios', parent: '/dashboard/empleados' },
  '/dashboard/empleados/usuarios-[id]': { title: 'Editar Usuario', parent: '/dashboard/empleados/usuarios' },
  '/dashboard/empleados/reservas': { title: 'Gestión de Reservas', parent: '/dashboard/empleados' },
  '/dashboard/empleados/habitaciones': { title: 'Habitaciones', parent: '/dashboard/empleados' },
  '/dashboard/empleados/tipos-habitacion': { title: 'Tipos de Habitación', parent: '/dashboard/empleados' },
  '/dashboard/empleados/amenidades': { title: 'Amenidades', parent: '/dashboard/empleados' },
  '/dashboard/empleados/servicios': { title: 'Catálogo de Servicios', parent: '/dashboard/empleados' },
  '/dashboard/empleados/pedidos': { title: 'Gestión de Pedidos', parent: '/dashboard/empleados' },
  '/dashboard/empleados/reset-stats': { title: 'Reset Stats', parent: '/dashboard/empleados' },
  '/dashboard/empleados/recepcionista': { title: 'Dashboard - Recepcionista', parent: '/dashboard/empleados' },
  '/dashboard/empleados/recepcionista/reservas': { title: 'Gestión de Reservas', parent: '/dashboard/empleados/recepcionista' },
  '/dashboard/empleados/recepcionista/checkout': { title: 'Gestión de Check-out', parent: '/dashboard/empleados/recepcionista' },
  '/dashboard/empleados/checkin': { title: 'Check-in de Huéspedes', parent: '/dashboard/empleados' },
  '/dashboard/empleados/checkout': { title: 'Check-out de Huéspedes', parent: '/dashboard/empleados' },
  '/dashboard/empleados/reportes': { title: 'Reportes y Análisis', parent: '/dashboard/empleados' },
  '/dashboard/empleados/area': { title: 'Gestión de Área', parent: '/dashboard/empleados' },
  '/dashboard/profile': { title: 'Mi Perfil', parent: '/dashboard' },
  '/dashboard/cliente': { title: 'Dashboard', parent: '/dashboard' },
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
              { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/dashboard/empleados' },
            ],
          },
          {
            title: 'Operaciones',
            items: [
              { title: 'Gestión de Reservas', icon: 'mdi-calendar-check-outline', to: '/dashboard/empleados/reservas' },
            ],
          },
          {
            title: 'Configuración Hotel',
            items: [
              { title: 'Habitaciones', icon: 'mdi-door', to: '/dashboard/empleados/habitaciones' },
              { title: 'Tipos de Habitación', icon: 'mdi-bed-outline', to: '/dashboard/empleados/tipos-habitacion' },
              { title: 'Amenidades', icon: 'mdi-star-outline', to: '/dashboard/empleados/amenidades' },
            ],
          },
          {
            title: 'Administración',
            items: [
              { title: 'Usuarios', icon: 'mdi-account-group-outline', to: '/dashboard/empleados/usuarios' },
            ],
          },
          accountSection,
        ]

      case UserRole.ADMIN:
        return [
          {
            title: 'Principal',
            items: [
              { title: 'Inicio', icon: 'mdi-view-dashboard-outline', to: '/dashboard/empleados' },
            ],
          },
          {
            title: 'Operaciones',
            items: [
              { title: 'Gestión de Reservas', icon: 'mdi-calendar-check-outline', to: '/dashboard/empleados/reservas' },
            ],
          },
          {
            title: 'Administración',
            items: [
              { title: 'Usuarios', icon: 'mdi-account-group-outline', to: '/dashboard/empleados/usuarios' },
              { title: 'Reset Stats', icon: 'mdi-chart-bar', to: '/dashboard/empleados/reset-stats' },
            ],
          },
          {
            title: 'Hotel',
            items: [
              { title: 'Catálogo de Servicios', icon: 'mdi-shopping-outline', to: '/dashboard/empleados/servicios' },
              { title: 'Amenidades', icon: 'mdi-star-outline', to: '/dashboard/empleados/amenidades' },
              { title: 'Tipos de Habitación', icon: 'mdi-bed-outline', to: '/dashboard/empleados/tipos-habitacion' },
              { title: 'Habitaciones', icon: 'mdi-door', to: '/dashboard/empleados/habitaciones' },
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
              { title: 'Check-in', icon: 'mdi-login-variant', to: '/dashboard/empleados/checkin' },
              { title: 'Reservas', icon: 'mdi-calendar-check-outline', to: '/dashboard/empleados/recepcionista/reservas' },
              { title: 'Check-out', icon: 'mdi-logout-variant', to: '/dashboard/empleados/checkout' },
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
              { title: 'Gestión de Pedidos', icon: 'mdi-clipboard-list-outline', to: '/dashboard/empleados/area' },
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
    // /dashboard/empleados/usuarios/:id
    if (/^\/dashboard\/empleados\/usuarios\/[^\/]+$/.test(path)) {
      return { title: 'Detalle de Usuario', parent: '/dashboard/empleados/usuarios' }
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
