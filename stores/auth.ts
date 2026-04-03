// stores/auth.ts
import { defineStore } from 'pinia'
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RegisterClienteRequest,
  ProfileResponse,
  UserRole,
} from '~/types/auth'
import { ROLE_DEFAULT_ROUTE } from '~/utils/constants'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    refreshToken: null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token && !!state.user,
    userRole: (state): UserRole | null => {
      if (!state.user?.role) return null
      return state.user.role.toLowerCase() as UserRole
    },
    userName: (state) => state.user?.fullName || '',
    userEmail: (state) => state.user?.email || '',
    defaultRoute(): string {
      if (!this.user || !this.token) return '/login'
      
      const role = this.user?.role?.toLowerCase()
      if (!role) return '/'
      
      // ✅ Una sola fuente de verdad: ROLE_DEFAULT_ROUTE
      return ROLE_DEFAULT_ROUTE[role as UserRole] || '/'
    },
  },

  actions: {
    /**
     * Login con email y password
     */
    async login(credentials: LoginRequest): Promise<void> {
      this.loading = true
      try {
        const config = useRuntimeConfig()
        console.log('📡 Enviando login request a:', config.public.apiBase)
        
        let response = await $fetch<any>(`${config.public.apiBase}/auth/login`, {
          method: 'POST',
          body: credentials,
        })

        console.log('📦 Respuesta RAW del servidor:', response)
        console.log('📦 Tipo de respuesta:', typeof response)
        console.log('📦 Claves de respuesta:', Object.keys(response || {}))

        // Manejo flexible de diferentes estructuras de respuesta
        // El backend podría devolver { user, token, ... } o { data: { user, token, ... } }
        const data = response?.data || response
        
        console.log('📦 Datos extraídos:', data)
        console.log('📦 data.user:', data?.user)
        console.log('📦 data.token:', data?.token?.substring?.(0, 20))

        this.user = data?.user
        this.token = data?.token
        this.refreshToken = data?.refreshToken

        console.log('✅ Asignado al state:', { 
          userId: this.user?.id, 
          email: this.user?.email, 
          role: this.user?.role,
          isAuth: this.isAuthenticated,
          hasToken: !!this.token
        })

        if (!this.user || !this.token) {
          throw new Error('Respuesta de login incompleta: falta user o token')
        }

        // Persistir en localStorage
        this.persistSession()

        // Si es cliente, obtener hotel desde reserva activa
        if (this.user?.role === 'cliente') {
          await this.fetchReservaActivaAndSetHotel()
        }
      } catch (error) {
        console.error('❌ Error en authStore.login:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Registro de jugador
     */
    async register(data: RegisterRequest): Promise<void> {
      this.loading = true
      try {
        const config = useRuntimeConfig()
        const response = await $fetch<RegisterResponse>(`${config.public.apiBase}/auth/register`, {
          method:'POST',
          body: data,
        })

        this.user = response.user
        this.token = response.token
        this.refreshToken = response.refreshToken
        this.persistSession()

        // Si es cliente, obtener hotel desde reserva activa
        if (this.user?.role === 'cliente') {
          await this.fetchReservaActivaAndSetHotel()
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * Registro de cliente
     */
    async registerCliente(data: RegisterClienteRequest): Promise<void> {
      this.loading = true
      try {
        const config = useRuntimeConfig()
        const response = await $fetch<RegisterResponse>(`${config.public.apiBase}/auth/register`, {
          method: 'POST',
          body: data,
        })

        this.user = response.user
        this.token = response.token
        this.refreshToken = response.refreshToken
        this.persistSession()

        // Si es cliente, obtener hotel desde reserva activa
        if (this.user?.role === 'cliente') {
          await this.fetchReservaActivaAndSetHotel()
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * Logout
     */
    async logout(): Promise<void> {
      try {
        if (this.token) {
          const config = useRuntimeConfig()
          await $fetch(`${config.public.apiBase}/auth/logout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${this.token}` },
          }).catch(() => {
            // Silenciar error — limpiar sesión de todas formas
          })
        }
      } finally {
        this.clearSession()
      }
    },

    /**
     * Renovar tokens
     */
    async refreshTokens(): Promise<void> {
      if (!this.refreshToken || !this.user) {
        throw new Error('No refresh token available')
      }

      const config = useRuntimeConfig()
      const response = await $fetch<{ token?: string; accessToken?: string; refreshToken: string }>(
        `${config.public.apiBase}/auth/refresh`,
        {
          method: 'POST',
          body: {
            userId: this.user.id,
            refreshToken: this.refreshToken,
          },
        }
      )

      this.token = response.accessToken || response.token || this.token
      this.refreshToken = response.refreshToken
      this.persistSession()
    },

    /**
     * Obtener hotel desde reserva activa del cliente
     * Se ejecuta después del login de un cliente para determinar su idHotel
     */
    async fetchReservaActivaAndSetHotel(): Promise<void> {
      if (!this.token || !this.user || this.user.role !== 'cliente' || !this.user.idCliente) {
        return
      }

      try {
        const config = useRuntimeConfig()
        const response = await $fetch<any>(
          `${config.public.apiBase}/reservas/activa/${this.user.idCliente}`,
          {
            headers: { Authorization: `Bearer ${this.token}` },
          }
        )

        if (response && response.idHotel && this.user) {
          this.user.idHotel = response.idHotel
          this.persistSession()
        }
      } catch {
        // Sin reserva activa — el cliente puede ver el catálogo pero no hacer pedidos
        // idHotel permanece null
      }
    },

    /**
     * Obtener perfil actual
     */
    async fetchProfile(): Promise<void> {
      if (!this.token) return

      const config = useRuntimeConfig()
      const response = await $fetch<ProfileResponse>(`${config.public.apiBase}/auth/profile`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })

      this.user = response.user
      this.persistSession()
    },

    /**
     * Inicializar sesión desde localStorage
     */
    initSession(): void {
      if (import.meta.server) return

      const stored = localStorage.getItem('auth_session')
      if (stored) {
        try {
          const session = JSON.parse(stored)
          this.user = session.user
          this.token = session.token
          this.refreshToken = session.refreshToken
        } catch {
          this.clearSession()
        }
      }
    },

    /**
     * Persistir sesión en localStorage
     */
    persistSession(): void {
      if (import.meta.server) return

      localStorage.setItem(
        'auth_session',
        JSON.stringify({
          user: this.user,
          token: this.token,
          refreshToken: this.refreshToken,
        })
      )
    },

    /**
     * Establecer sesión directamente (usado por Google OAuth callback)
     */
    setSession(user: User, token: string, refreshToken?: string): void {
      this.user = user
      this.token = token
      this.refreshToken = refreshToken || null
      this.persistSession()
    },

    /**
     * Limpiar sesión
     */
    clearSession(): void {
      this.user = null
      this.token = null
      this.refreshToken = null

      if (!import.meta.server) {
        localStorage.removeItem('auth_session')
      }
    },
  },
})
