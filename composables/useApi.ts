// composables/useApi.ts
import { useAuthStore } from '~/stores/auth'
import type { ApiError } from '~/types/api'

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
  query?: Record<string, any>
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const baseURL = config.public.apiBase as string

  /**
   * Petición base con inyección de token
   */
  const request = async <T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
    const headers: Record<string, string> = options.headers || {}

    // No establecer Content-Type si es FormData (el navegador lo hace automáticamente)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    // Inyectar token si existe
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }

    try {
      const response = await $fetch<T>(`${baseURL}${endpoint}`, {
        method: options.method || 'GET',
        headers,
        body: options.body,
        query: options.query,
      })

      return response
    } catch (error: any) {
      // Si es 401 y tenemos refresh token, intentar refresh
      if (error?.statusCode === 401 && authStore.refreshToken && authStore.user) {
        const refreshed = await attemptRefresh()
        if (refreshed) {
          // Reintentar la petición original con el nuevo token
          headers['Authorization'] = `Bearer ${authStore.token}`
          return await $fetch<T>(`${baseURL}${endpoint}`, {
            method: options.method || 'GET',
            headers,
            body: options.body,
            query: options.query,
          })
        }
      }

      // Si no se pudo resolver, propagar el error
      throw parseError(error)
    }
  }

  /**
   * Intento de refresh token
   */
  const attemptRefresh = async (): Promise<boolean> => {
    try {
      await authStore.refreshTokens()
      return true
    } catch {
      // Refresh falló — cerrar sesión
      await authStore.logout()
      navigateTo('/login')
      return false
    }
  }

  /**
   * Parsear errores de la API
   */
  const parseError = (error: any): ApiError => {
    if (error?.data) {
      return {
        statusCode: error.statusCode || error.data.statusCode || 500,
        message: error.data.message || 'Error desconocido',
        error: error.data.error,
      }
    }
    return {
      statusCode: 500,
      message: error?.message || 'Error de conexión con el servidor',
    }
  }

  // Métodos convenientes
  const get = <T = any>(endpoint: string, query?: Record<string, any>) =>
    request<T>(endpoint, { method: 'GET', query })

  const post = <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'POST', body })

  const put = <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PUT', body })

  const patch = <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PATCH', body })

  const del = <T = any>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' })

  return { request, get, post, put, patch, del }
}
