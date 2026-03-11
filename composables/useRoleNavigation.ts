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
  '/dashboard/profile': { title: 'Mi Perfil', parent: '/dashboard' },
  '/dashboard/superadmin/reservas': { title: 'Gestión de Reservas', parent: '/dashboard' },
  '/dashboard/superadmin/hoteles': { title: 'Hoteles', parent: '/dashboard' },
  '/dashboard/superadmin/empleados': { title: 'Empleados', parent: '/dashboard' },
  '/dashboard/superadmin/habitaciones': { title: 'Habitaciones', parent: '/dashboard' },
  '/dashboard/superadmin/amenidades': { title: 'Amenidades', parent: '/dashboard' },
  '/dashboard/superadmin/tipos-habitacion': { title: 'Tipos de Habitación', parent: '/dashboard' },
  '/dashboard/admin/users': { title: 'Usuarios', parent: '/dashboard' },
  '/dashboard/admin/reservas': { title: 'Gestión de Reservas', parent: '/dashboard' },
  '/dashboard/admin/reset-stats': { title: 'Reset Stats', parent: '/dashboard' },
  '/dashboard/admin/amenidades': { title: 'Amenidades', parent: '/dashboard' },
  '/dashboard/admin/tipos-habitacion': { title: 'Tipos de Habitación', parent: '/dashboard' },
  '/dashboard/admin/habitaciones': { title: 'Habitaciones', parent: '/dashboard' },
  '/dashboard/cliente': { title: 'Dashboard', parent: '/dashboard' },
  '/dashboard/player': { title: 'Dashboard', parent: '/dashboard' },
  '/dashboard/player/clues': { title: 'Mis Pistas', parent: '/dashboard/player' },
  '/dashboard/sponsor': { title: 'Dashboard', parent: '/dashboard' },
  '/dashboard/recepcionista': { title: 'Dashboard - Recepcionista', parent: '/dashboard' },
  '/dashboard/recepcionista/reservas': { title: 'Gestión de Reservas', parent: '/dashboard/recepcionista' },
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
              { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/dashboard' },
            ],
          },
          {
            title: 'Operaciones',
            items: [
              { title: 'Gestión de Reservas', icon: 'mdi-calendar-check-outline', to: '/dashboard/superadmin/reservas' },
            ],
          },
          {
            title: 'Configuración Hotel',
            items: [
              { title: 'Hoteles', icon: 'mdi-building-outline', to: '/dashboard/superadmin/hoteles' },
              { title: 'Habitaciones', icon: 'mdi-door', to: '/dashboard/superadmin/habitaciones' },
              { title: 'Tipos de Habitación', icon: 'mdi-bed-outline', to: '/dashboard/superadmin/tipos-habitacion' },
              { title: 'Amenidades', icon: 'mdi-star-outline', to: '/dashboard/superadmin/amenidades' },
            ],
          },
          {
            title: 'Administración',
            items: [
              { title: 'Empleados', icon: 'mdi-account-group-outline', to: '/dashboard/superadmin/empleados' },
            ],
          },
          accountSection,
        ]

      case UserRole.ADMIN:
        return [
          {
            title: 'Principal',
            items: [
              { title: 'Inicio', icon: 'mdi-view-dashboard-outline', to: '/dashboard' },
            ],
          },
          {
            title: 'Operaciones',
            items: [
              { title: 'Gestión de Reservas', icon: 'mdi-calendar-check-outline', to: '/dashboard/admin/reservas' },
            ],
          },
          {
            title: 'Administración',
            items: [
              { title: 'Usuarios', icon: 'mdi-account-group-outline', to: '/dashboard/admin/users' },
              { title: 'Reset Stats', icon: 'mdi-chart-bar', to: '/dashboard/admin/reset-stats' },
            ],
          },
          {
            title: 'Hotel',
            items: [
              { title: 'Amenidades', icon: 'mdi-star-outline', to: '/dashboard/admin/amenidades' },
              { title: 'Tipos de Habitación', icon: 'mdi-bed-outline', to: '/dashboard/admin/tipos-habitacion' },
              { title: 'Habitaciones', icon: 'mdi-door', to: '/dashboard/admin/habitaciones' },
            ],
          },
          accountSection,
        ]

      case UserRole.RECEPCIONISTA:
        return [
          {
            title: 'Principal',
            items: [
              { title: 'Inicio', icon: 'mdi-view-dashboard-outline', to: '/dashboard/recepcionista' },
            ],
          },
          {
            title: 'Gestión',
            items: [
              { title: 'Reservas', icon: 'mdi-calendar-check-outline', to: '/dashboard/recepcionista/reservas' },
            ],
          },
          accountSection,
        ]

      case UserRole.CLIENTE:
        return [
          {
            title: 'Reservas',
            items: [
              { title: 'Nueva Reserva', icon: 'mdi-calendar-plus', to: '/reservas/nueva' },
              { title: 'Mis Reservas', icon: 'mdi-calendar-check', to: '/reservas/mis-reservas' },
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
   * Intentar hacer match de rutas dinámicas (ej: /dashboard/admin/users/123)
   */
  const matchDynamicRoute = (path: string): { title: string; parent?: string } | null => {
    // /dashboard/admin/users/:id
    if (/^\/dashboard\/admin\/users\/[^/]+$/.test(path)) {
      return { title: 'Detalle de Usuario', parent: '/dashboard/admin/users' }
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
