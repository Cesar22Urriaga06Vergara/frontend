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

  // ── SuperAdmin SaaS ──
  '/superadmin': { title: 'Dashboard SaaS', parent: '/' },
  '/superadmin/hoteles': { title: 'Gestión de Hoteles', parent: '/superadmin' },
  '/superadmin/hoteles/[id]': { title: 'Detalle Hotel', parent: '/superadmin/hoteles' },
  '/superadmin/planes': { title: 'Gestión de Planes', parent: '/superadmin' },
  '/superadmin/planes/[id]': { title: 'Detalle Plan', parent: '/superadmin/planes' },
  '/superadmin/categorias': { title: 'Categorías Globales', parent: '/superadmin' },
  '/superadmin/metricas': { title: 'Métricas de Plataforma', parent: '/superadmin' },
  '/superadmin/soporte': { title: 'Soporte y Debugging', parent: '/superadmin' },
  '/superadmin/configuracion': { title: 'Configuración del Sistema', parent: '/superadmin' },

  // ── Recepcionista ──
  '/recepcionista': { title: 'Panel Recepcionista', parent: '/' },
  '/recepcionista/caja': { title: 'Caja', parent: '/recepcionista' },
  '/recepcionista/checkin-checkout': { title: 'Check-in / Check-out', parent: '/recepcionista' },
  '/recepcionista/habitaciones': { title: 'Habitaciones', parent: '/recepcionista' },
  '/recepcionista/reservas': { title: 'Gestión de Reservas', parent: '/recepcionista' },

  // ── Admin ──
  '/admin': { title: 'Panel Admin', parent: '/' },
  '/admin/usuarios': { title: 'Usuarios', parent: '/admin' },
  '/admin/usuarios/[id]': { title: 'Detalle Usuario', parent: '/admin/usuarios' },
  '/admin/reservas': { title: 'Gestión de Reservas', parent: '/admin' },
  '/admin/habitaciones': { title: 'Habitaciones', parent: '/admin' },
  '/admin/tipos-habitacion': { title: 'Tipos de Habitación', parent: '/admin' },
  '/admin/amenidades': { title: 'Amenidades', parent: '/admin' },
  '/admin/servicios': { title: 'Catálogo de Servicios', parent: '/admin' },
  '/admin/categorias-servicios': { title: 'Categorías de Servicios', parent: '/admin' },
  '/admin/pedidos': { title: 'Gestión de Pedidos', parent: '/admin' },
  '/admin/facturas': { title: 'Facturas', parent: '/admin' },
  '/admin/medios-pago': { title: 'Medios de Pago', parent: '/admin' },
  '/admin/reset-stats': { title: 'Reset Stats', parent: '/admin' },

  // ── Reportes ──
  '/reportes/oficina': { title: 'Reportes Oficina', parent: '/' },
  '/reportes/area': { title: 'Mi Área', parent: '/' },
  '/reportes/area/cafeteria': { title: 'Mi Área — Cafetería', parent: '/reportes/area' },
  '/reportes/area/lavanderia': { title: 'Mi Área — Lavandería', parent: '/reportes/area' },
  '/reportes/area/spa': { title: 'Mi Área — Spa', parent: '/reportes/area' },
  '/reportes/area/room-service': { title: 'Mi Área — Room Service', parent: '/reportes/area' },

  // ── Cliente ──
  '/cliente': { title: 'Mi Dashboard', parent: '/' },
  '/cliente/cuenta': { title: 'Mi Cuenta', parent: '/cliente' },
  '/cliente/mis-facturas': { title: 'Mis Facturas', parent: '/cliente' },
  '/cliente/servicios': { title: 'Servicios', parent: '/cliente' },
  '/cliente/reservas/nueva': { title: 'Nueva Reserva', parent: '/cliente' },
  '/cliente/reservas/mis-reservas': { title: 'Mis Reservas', parent: '/cliente' },
  '/cliente/reservas/confirmacion': { title: 'Confirmación de Reserva', parent: '/cliente/reservas/nueva' },
  '/cliente/facturas/[id]': { title: 'Detalle Factura', parent: '/cliente/mis-facturas' },

  // ── Compartidas ──
  '/profile': { title: 'Mi Perfil', parent: '/' },
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
        { title: 'Mi Perfil', icon: 'mdi-account-circle-outline', to: '/profile' },
      ],
    }

    switch (role) {
      case UserRole.SUPERADMIN:
        return [
          {
            title: 'Dashboard SaaS',
            items: [
              { title: 'Inicio', icon: 'mdi-view-dashboard-outline', to: '/superadmin' },
            ],
          },
          {
            title: 'Hoteles',
            items: [
              { title: 'Crear Hotel', icon: 'mdi-plus-circle', to: '/superadmin/hoteles' },
              { title: 'Suspender Hotel', icon: 'mdi-pause-circle', to: '/superadmin/hoteles' },
              { title: 'Bloquear Hotel', icon: 'mdi-lock', to: '/superadmin/hoteles' },
              { title: 'Ver Hoteles', icon: 'mdi-hospital-box-outline', to: '/superadmin/hoteles' },
            ],
          },
          {
            title: 'Planes',
            items: [
              { title: 'Crear Planes', icon: 'mdi-plus-circle', to: '/superadmin/planes' },
              { title: 'Editar Planes', icon: 'mdi-pencil', to: '/superadmin/planes' },
              { title: 'Límites Sistema', icon: 'mdi-gauge', to: '/superadmin/planes' },
            ],
          },
          {
            title: 'Categorías Globales',
            items: [
              { title: 'Categorías Servicios', icon: 'mdi-folder-outline', to: '/superadmin/categorias' },
              { title: 'Módulos Sistema', icon: 'mdi-puzzle-outline', to: '/superadmin/categorias' },
            ],
          },
          {
            title: 'Métricas',
            items: [
              { title: 'Uso Plataforma', icon: 'mdi-chart-line-variant', to: '/superadmin/metricas' },
              { title: 'Crecimiento Hoteles', icon: 'mdi-trending-up', to: '/superadmin/metricas' },
            ],
          },
          {
            title: 'Soporte',
            items: [
              { title: 'Impersonate Hotel', icon: 'mdi-account-switch-outline', to: '/superadmin/soporte' },
              { title: 'Logs Sistema', icon: 'mdi-file-document-outline', to: '/superadmin/soporte' },
            ],
          },
          {
            title: 'Configuración Sistema',
            items: [
              { title: 'Features Flags', icon: 'mdi-toggle-switch-outline', to: '/superadmin/configuracion' },
              { title: 'Parámetros Globales', icon: 'mdi-cog-outline', to: '/superadmin/configuracion' },
            ],
          },
          accountSection,
        ]

      case UserRole.ADMIN:
        return [
          {
            title: 'Principal',
            items: [
              { title: 'Inicio', icon: 'mdi-view-dashboard-outline', to: '/admin' },
            ],
          },
          {
            title: 'Operaciones',
            items: [
              { title: 'Gestión de Reservas', icon: 'mdi-calendar-check-outline', to: '/admin/reservas' },
            ],
          },
          {
            title: 'Administración',
            items: [
              { title: 'Usuarios', icon: 'mdi-account-group-outline', to: '/admin/usuarios' },
              { title: 'Pedidos', icon: 'mdi-clipboard-list-outline', to: '/admin/pedidos' },
              { title: 'Facturas', icon: 'mdi-file-document-outline', to: '/admin/facturas' },
              { title: 'Reportes', icon: 'mdi-chart-bar', to: '/reportes/oficina' },
              { title: 'Reset Stats', icon: 'mdi-lock-reset', to: '/admin/reset-stats' },
            ],
          },
          {
            title: 'Hotel',
            items: [
              { title: 'Catálogo de Servicios', icon: 'mdi-shopping-outline', to: '/admin/servicios' },
              { title: 'Categorías de Servicios', icon: 'mdi-folder-outline', to: '/admin/categorias-servicios' },
              { title: 'Amenidades', icon: 'mdi-star-outline', to: '/admin/amenidades' },
              { title: 'Tipos de Habitación', icon: 'mdi-bed-outline', to: '/admin/tipos-habitacion' },
              { title: 'Habitaciones', icon: 'mdi-door', to: '/admin/habitaciones' },
            ],
          },
          accountSection,
        ]

      case UserRole.RECEPCIONISTA:
        return [
          {
            title: 'Principal',
            items: [
              { title: 'Inicio', icon: 'mdi-view-dashboard-outline', to: '/recepcionista' },
            ],
          },
          {
            title: 'Gestión de Operaciones',
            items: [
              { title: 'Caja / Folios', icon: 'mdi-cash-register', to: '/recepcionista/caja' },
              { title: 'Check-in / Check-out', icon: 'mdi-door-open', to: '/recepcionista/checkin-checkout' },
              { title: 'Habitaciones', icon: 'mdi-bed', to: '/recepcionista/habitaciones' },
              { title: 'Gestión de Reservas', icon: 'mdi-calendar-check', to: '/recepcionista/reservas' },
              { title: 'Incidencias', icon: 'mdi-alert-circle', to: '/recepcionista/incidencias' },
            ],
          },
          accountSection,
        ]

      case UserRole.CLIENTE:
        return [
          {
            title: 'Mi Hotel',
            items: [
              { title: 'Dashboard', icon: 'mdi-home', to: '/cliente' },
              { title: 'Mi Cuenta', icon: 'mdi-account-edit', to: '/cliente/cuenta' },
              { title: 'Mis Facturas', icon: 'mdi-file-document', to: '/cliente/mis-facturas' },
            ],
          },
          {
            title: 'Servicios',
            items: [
              { title: 'Solicitar Servicio', icon: 'mdi-room-service', to: '/cliente/servicios' },
              { title: 'Mis Pedidos', icon: 'mdi-list-status', to: '/cliente/servicios/mis-pedidos' },
            ],
          },
          {
            title: 'Reservas',
            items: [
              { title: 'Nueva Reserva', icon: 'mdi-calendar-plus', to: '/cliente/reservas/nueva' },
              { title: 'Mis Reservas', icon: 'mdi-calendar-check', to: '/cliente/reservas/mis-reservas' },
            ],
          },
          accountSection,
        ]

      case UserRole.CAFETERIA:
        return [
          {
            title: 'Área de Trabajo',
            items: [
              { title: 'Mi Área — Cafetería', icon: 'mdi-coffee', to: '/reportes/area/cafeteria' },
              { title: 'Mis Reportes', icon: 'mdi-chart-line', to: '/reportes/area/cafeteria' },
            ],
          },
          accountSection,
        ]

      case UserRole.LAVANDERIA:
        return [
          {
            title: 'Área de Trabajo',
            items: [
              { title: 'Mi Área — Lavandería', icon: 'mdi-washing-machine', to: '/reportes/area/lavanderia' },
              { title: 'Mis Reportes', icon: 'mdi-chart-line', to: '/reportes/area/lavanderia' },
            ],
          },
          accountSection,
        ]

      case UserRole.SPA:
        return [
          {
            title: 'Área de Trabajo',
            items: [
              { title: 'Mi Área — Spa', icon: 'mdi-spa', to: '/reportes/area/spa' },
              { title: 'Mis Reportes', icon: 'mdi-chart-line', to: '/reportes/area/spa' },
            ],
          },
          accountSection,
        ]

      case UserRole.ROOM_SERVICE:
        return [
          {
            title: 'Área de Trabajo',
            items: [
              { title: 'Mi Área — Room Service', icon: 'mdi-bell-service-outline', to: '/reportes/area/room-service' },
              { title: 'Mis Reportes', icon: 'mdi-chart-line', to: '/reportes/area/room-service' },
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
   * Intentar hacer match de rutas dinámicas (ej: /admin/usuarios/123)
   */
  const matchDynamicRoute = (path: string): { title: string; parent?: string } | null => {
    // /admin/usuarios/:id
    if (/^\/admin\/usuarios\/[^\/]+$/.test(path)) {
      return { title: 'Detalle de Usuario', parent: '/admin/usuarios' }
    }
    // /admin/habitaciones/:id
    if (/^\/admin\/habitaciones\/[^\/]+$/.test(path)) {
      return { title: 'Detalle de Habitación', parent: '/admin/habitaciones' }
    }
    // /admin/tipos-habitacion/:id
    if (/^\/admin\/tipos-habitacion\/[^\/]+$/.test(path)) {
      return { title: 'Detalle Tipo Habitación', parent: '/admin/tipos-habitacion' }
    }
    // /cliente/facturas/:id
    if (/^\/cliente\/facturas\/[^\/]+$/.test(path)) {
      return { title: 'Detalle de Factura', parent: '/cliente/mis-facturas' }
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
