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
      if (!role) return '/dashboard'
      
      // ✅ Una sola fuente de verdad: ROLE_DEFAULT_ROUTE
      return ROLE_DEFAULT_ROUTE[role as UserRole] || '/dashboard/empleados'
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
        const response = await $fetch<LoginResponse>(`${config.public.apiBase}/auth/login`, {
          method: 'POST',
          body: credentials,
        })

        this.user = response.user
        this.token = response.token
        this.refreshToken = response.refreshToken

        // Persistir en localStorage
        this.persistSession()
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
        const response = await $fetch<RegisterResponse>(`${config.public.apiBase}/auth/register/cliente`, {
          method: 'POST',
          body: data,
        })

        this.user = response.user
        this.token = response.token
        this.refreshToken = response.refreshToken
        this.persistSession()
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
