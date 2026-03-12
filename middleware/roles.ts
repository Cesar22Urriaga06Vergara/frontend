// middleware/roles.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, _from) => {
  const authStore = useAuthStore()

  const roleRoutes: Record<string, string> = {
    cliente: '/dashboard/cliente',
    recepcionista: '/dashboard/recepcionista',
    admin: '/dashboard/admin',
    superadmin: '/dashboard/superadmin',
    cafeteria: '/dashboard/area',
    lavanderia: '/dashboard/area',
    spa: '/dashboard/area',
    room_service: '/dashboard/area',
  }

  const rol = authStore.user?.role

  // Si no tiene rol definido, redirigir a login
  if (!rol) {
    return navigateTo('/login')
  }

  // Redirigir a dashboard correspondiente si intenta acceder a /
  if (to.path === '/' || to.path === '/dashboard') {
    const redirectTo = roleRoutes[rol]
    if (redirectTo && to.path !== redirectTo) {
      return navigateTo(redirectTo)
    }
  }

  // Validar permisos si la ruta especifica roles requeridos
  const requiredRoles = (to.meta.roles as string[]) || []

  if (requiredRoles.length > 0) {
    if (!requiredRoles.includes(rol)) {
      // Redirigir al dashboard del usuario
      const redirectTo = roleRoutes[rol] || '/dashboard'
      return navigateTo(redirectTo)
    }
  }
})
