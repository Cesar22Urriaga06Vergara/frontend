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
  '/recepcionista/checkin': { title: 'Check-in', parent: '/recepcionista' },
  '/recepcionista/checkout': { title: 'Check-out', parent: '/recepcionista' },
  '/recepcionista/incidencias': { title: 'Incidencias', parent: '/recepcionista' },

  // ── Admin ──
  '/admin': { title: 'Panel Admin', parent: '/' },
  '/admin/usuarios': { title: 'Usuarios', parent: '/admin' },
  '/admin/usuarios/[id]': { title: 'Detalle Usuario', parent: '/admin/usuarios' },
  '/admin/reservas': { title: 'Gestión de Reservas', parent: '/admin' },
  '/admin/reportes': { title: 'Reportes y Análisis', parent: '/admin' },
  '/admin/habitaciones': { title: 'Habitaciones', parent: '/admin' },
  '/admin/tipos-habitacion': { title: 'Tipos de Habitación', parent: '/admin' },
  '/admin/amenidades': { title: 'Amenidades', parent: '/admin' },
  '/admin/servicios': { title: 'Catálogo de Servicios', parent: '/admin' },
  '/admin/facturas': { title: 'Facturas', parent: '/admin' },

  // ── Empleados de Área ──
  '/dashboard/empleado': { title: 'Dashboard Empleado', parent: '/' },
  '/dashboard/empleado/pedidos': { title: 'Gestión de Pedidos', parent: '/dashboard/empleado' },
  '/admin/medios-pago': { title: 'Medios de Pago', parent: '/admin' },
  '/admin/reset-stats': { title: 'Reset Stats', parent: '/admin' },

  // ── Áreas Operativas (empleados de área) ──
  '/areas': { title: 'Panel Operativo', parent: '/' },
  '/areas/cafeteria': { title: 'Cafetería — Gestión de Pedidos', parent: '/areas' },
  '/areas/lavanderia': { title: 'Lavandería — Gestión de Lotes', parent: '/areas' },
  '/areas/spa': { title: 'Spa — Gestión de Servicios', parent: '/areas' },
  '/areas/room-service': { title: 'Room Service — Entregas', parent: '/areas' },
  '/areas/minibar': { title: 'Minibar — Reposiciones', parent: '/areas' },
  '/areas/transporte': { title: 'Transporte — Traslados', parent: '/areas' },
  '/areas/tours': { title: 'Tours — Excursiones', parent: '/areas' },
  '/areas/eventos': { title: 'Eventos — Salonería', parent: '/areas' },
  '/areas/mantenimiento': { title: 'Mantenimiento — Tareas', parent: '/areas' },

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
  '/dashboard/profile': { title: 'Mi Perfil', parent: '/' },
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
            title: 'SaaS',
            items: [
              { title: 'Inicio', icon: 'mdi-view-dashboard-outline', to: '/superadmin' },
            ],
          },
          {
            title: 'Operaciones',
            items: [
              { title: 'Hoteles', icon: 'mdi-domain', to: '/superadmin/hoteles' },
              { title: 'Categorías', icon: 'mdi-shape-outline', to: '/superadmin/categorias' },
              { title: 'Métricas', icon: 'mdi-chart-line', to: '/superadmin/metricas' },
            ],
          },
          {
            title: 'Plataforma',
            items: [
              { title: 'Planes SaaS', icon: 'mdi-layers-outline', to: '/superadmin/planes' },
              { title: 'Configuración', icon: 'mdi-cog-outline', to: '/superadmin/configuracion' },
              { title: 'Soporte', icon: 'mdi-lifebuoy', to: '/superadmin/soporte' },
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
              { title: 'Facturas', icon: 'mdi-file-document-outline', to: '/admin/facturas' },
              { title: 'Supervisar Áreas', icon: 'mdi-eye-outline', to: '/areas' },
              { title: 'Reportes', icon: 'mdi-chart-bar', to: '/admin/reportes' },
              { title: 'Reset Stats', icon: 'mdi-lock-reset', to: '/admin/reset-stats' },
            ],
          },
          {
            title: 'Hotel',
            items: [
              { title: 'Catálogo de Servicios', icon: 'mdi-shopping-outline', to: '/admin/servicios' },
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
              { title: 'Check-in', icon: 'mdi-login', to: '/recepcionista/checkin' },
              { title: 'Check-out', icon: 'mdi-logout', to: '/recepcionista/checkout' },
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
              { title: 'Panel Cafetería', icon: 'mdi-coffee', to: '/areas/cafeteria' },
              { title: 'Gestión de Pedidos', icon: 'mdi-clipboard-list-outline', to: '/dashboard/empleado/pedidos' },
            ],
          },
          accountSection,
        ]

      case UserRole.LAVANDERIA:
        return [
          {
            title: 'Área de Trabajo',
            items: [
              { title: 'Panel Lavandería', icon: 'mdi-washing-machine', to: '/areas/lavanderia' },
              { title: 'Gestión de Lotes', icon: 'mdi-clipboard-list-outline', to: '/dashboard/empleado/pedidos' },
            ],
          },
          accountSection,
        ]

      case UserRole.SPA:
        return [
          {
            title: 'Área de Trabajo',
            items: [
              { title: 'Panel Spa', icon: 'mdi-spa', to: '/areas/spa' },
              { title: 'Gestión de Servicios', icon: 'mdi-clipboard-list-outline', to: '/dashboard/empleado/pedidos' },
            ],
          },
          accountSection,
        ]

      case UserRole.ROOM_SERVICE:
        return [
          {
            title: 'Área de Trabajo',
            items: [
              { title: 'Panel Room Service', icon: 'mdi-bell-service-outline', to: '/areas/room-service' },
              { title: 'Gestión de Entregas', icon: 'mdi-clipboard-list-outline', to: '/dashboard/empleado/pedidos' },
            ],
          },
          accountSection,
        ]

      case UserRole.MINIBAR:
        return [
          {
            title: 'Área de Trabajo',
            items: [
              { title: 'Panel Minibar', icon: 'mdi-fridge-outline', to: '/areas/minibar' },
              { title: 'Gestión de Reposiciones', icon: 'mdi-clipboard-list-outline', to: '/dashboard/empleado/pedidos' },
            ],
          },
          accountSection,
        ]

      case UserRole.TRANSPORTE:
        return [
          {
            title: 'Área de Trabajo',
            items: [
              { title: 'Panel Transporte', icon: 'mdi-car-outline', to: '/areas/transporte' },
              { title: 'Gestión de Traslados', icon: 'mdi-clipboard-list-outline', to: '/dashboard/empleado/pedidos' },
            ],
          },
          accountSection,
        ]

      case UserRole.TOURS:
        return [
          {
            title: 'Área de Trabajo',
            items: [
              { title: 'Panel Tours', icon: 'mdi-map-marker-path', to: '/areas/tours' },
              { title: 'Gestión de Tours', icon: 'mdi-clipboard-list-outline', to: '/dashboard/empleado/pedidos' },
            ],
          },
          accountSection,
        ]

      case UserRole.EVENTOS:
        return [
          {
            title: 'Área de Trabajo',
            items: [
              { title: 'Panel Eventos', icon: 'mdi-party-popper', to: '/areas/eventos' },
              { title: 'Gestión de Eventos', icon: 'mdi-clipboard-list-outline', to: '/dashboard/empleado/pedidos' },
            ],
          },
          accountSection,
        ]

      case UserRole.MANTENIMIENTO:
        return [
          {
            title: 'Área de Trabajo',
            items: [
              { title: 'Panel Mantenimiento', icon: 'mdi-toolbox-outline', to: '/areas/mantenimiento' },
              { title: 'Gestión de Tareas', icon: 'mdi-clipboard-list-outline', to: '/dashboard/empleado/pedidos' },
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
