// stores/users.ts
import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import { normalizeUser } from '~/utils/entityAdapters'
import { getErrorMessage, isUnavailableError } from '~/utils/http'
import type {
  User,
  UserRole,
  UsersListResponse,
  UserResponse,
  UpdateUserRequest,
  PasswordResetStats,
  PasswordResetStatsResponse,
  CleanupResponse,
} from '~/types/auth'

interface UsersState {
  users: User[]
  currentUser: User | null
  loading: boolean
  error: string | null
  totalCount: number
  resetStats: PasswordResetStats | null
  resetStatsUnavailable: boolean
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null,
    totalCount: 0,
    resetStats: null,
    resetStatsUnavailable: false,
  }),

  getters: {
    /**
     * Usuarios activos
     */
    activeUsers: (state): User[] =>
      state.users.filter((u) => u.isActive),

    /**
     * Usuarios inactivos
     */
    inactiveUsers: (state): User[] =>
      state.users.filter((u) => !u.isActive),

    /**
     * Conteo por rol
     */
    countByRole: (state) => {
      const counts: Record<string, number> = {}
      state.users.forEach((u) => {
        counts[u.role] = (counts[u.role] || 0) + 1
      })
      return counts
    },
  },

  actions: {
    /**
     * Obtener todos los usuarios
     */
    async fetchAllUsers(): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const response = await api.get<UsersListResponse>('/users')
        this.users = response.users.map((user) => normalizeUser(user))
        this.totalCount = response.count
      } catch (error: any) {
        this.error = getErrorMessage(error, 'No fue posible cargar usuarios')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener usuarios por rol
     */
    async fetchUsersByRole(role: UserRole): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const response = await api.get<UsersListResponse>(`/users`)
        const normalized = response.users.map((user) => normalizeUser(user))
        this.users = normalized.filter((user) => user.role === role)
        this.totalCount = response.count
      } catch (error: any) {
        this.error = getErrorMessage(error, 'No fue posible cargar usuarios por rol')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener usuario por ID
     */
    async fetchUserById(id: number | string): Promise<User> {
      this.error = null
      const api = useApi()
      const response = await api.get<UserResponse>(`/users/${id}`)
      const normalized = normalizeUser(response.user)
      this.currentUser = normalized
      return normalized
    },

    /**
     * Crear un nuevo usuario
     */
    async createUser(data: {
      nombre: string
      email: string
      password: string
      role: string
      cedula?: string
      isActive?: boolean
    }): Promise<User> {
      this.error = null
      const api = useApi()
      const response = await api.post<UserResponse>('/users', data)
      const normalized = normalizeUser(response.user)

      // Agregar a la lista local
      this.users.push(normalized)
      this.totalCount = this.users.length

      return normalized
    },

    /**
     * Actualizar usuario
     */
    async updateUser(id: number | string, data: UpdateUserRequest): Promise<User> {
      this.error = null
      const api = useApi()
      const response = await api.patch<UserResponse>(`/users/${id}`, data)
      const normalized = normalizeUser(response.user)

      // Actualizar en la lista local
      const numId = typeof id === 'string' ? parseInt(id) : id
      const index = this.users.findIndex((u) => u.id === numId)
      if (index !== -1) {
        this.users[index] = normalized
      }
      this.currentUser = normalized

      return normalized
    },

    /**
     * Desactivar usuario
     */
    async deactivateUser(id: number | string): Promise<User> {
      this.error = null
      const api = useApi()
      const response = await api.del<UserResponse>(`/users/${id}`)
      const normalized = normalizeUser(response.user)

      // Actualizar en la lista local
      const index = this.users.findIndex((u) => u.id === (typeof id === 'string' ? parseInt(id) : id))
      if (index !== -1) {
        this.users[index] = normalized
      }

      return normalized
    },

    /**
     * Reactivar usuario
     */
    async reactivateUser(id: number | string): Promise<User> {
      this.error = null
      const api = useApi()
      const response = await api.post<UserResponse>(`/users/${id}/reactivate`)
      const normalized = normalizeUser(response.user)

      // Actualizar en la lista local
      const index = this.users.findIndex((u) => u.id === (typeof id === 'string' ? parseInt(id) : id))
      if (index !== -1) {
        this.users[index] = normalized
      }

      return normalized
    },

    /**
     * Obtener estadísticas de password reset
     */
    async fetchResetStats(): Promise<void> {
      const api = useApi()
      this.error = null
      try {
        const response = await api.get<PasswordResetStatsResponse>('/auth/admin/password-reset/stats')
        this.resetStats = response.stats
        this.resetStatsUnavailable = false
      } catch (error: any) {
        if (isUnavailableError(error)) {
          this.resetStats = null
          this.resetStatsUnavailable = true
          return
        }
        this.error = getErrorMessage(error, 'No fue posible cargar estadísticas de reset')
        throw error
      }
    },

    /**
     * Limpiar tokens expirados
     */
    async cleanupExpiredTokens(): Promise<number> {
      if (this.resetStatsUnavailable) {
        return 0
      }

      this.error = null
      const api = useApi()
      const response = await api.post<CleanupResponse>('/auth/admin/password-reset/cleanup')
      // Refrescar stats después de limpiar
      await this.fetchResetStats()
      return response.deletedCount
    },

    /**
     * Invalidar tokens de reset de un usuario
     */
    async invalidateUserResetTokens(userId: string): Promise<void> {
      if (this.resetStatsUnavailable) {
        return
      }

      this.error = null
      const api = useApi()
      await api.post(`/auth/admin/users/${userId}/invalidate-reset-tokens`)
    },
  },
})
