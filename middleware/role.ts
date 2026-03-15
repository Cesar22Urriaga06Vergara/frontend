// middleware/role.ts
import { useAuthStore } from '~/stores/auth'
import type { UserRole } from '~/types/auth'

export default defineNuxtRouteMiddleware((to, _from) => {
  const authStore = useAuthStore()

  // Inicializar sesión
  if (!authStore.isAuthenticated) {
    authStore.initSession()
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // Extraer roles permitidos de la meta de la ruta
  const allowedRoles = to.meta.roles as UserRole[] | undefined

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = authStore.userRole

    if (!userRole) {
      return navigateTo('/login')
    }

    // Normalizar roles a minúsculas para comparación consistente
    const allowed = allowedRoles.map((r) => String(r).toLowerCase())
    const normalizedUserRole = String(userRole).toLowerCase()
    
    if (!allowed.includes(normalizedUserRole)) {
      // Sin permiso — redirigir a su ruta por defecto
      return navigateTo(authStore.defaultRoute)
    }
  }
})
