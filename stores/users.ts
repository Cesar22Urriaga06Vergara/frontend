// stores/users.ts
import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
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
  totalCount: number
  resetStats: PasswordResetStats | null
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    users: [],
    currentUser: null,
    loading: false,
    totalCount: 0,
    resetStats: null,
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
      try {
        const api = useApi()
        const response = await api.get<UsersListResponse>('/users')
        this.users = response.users
        this.totalCount = response.count
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener usuarios por rol
     */
    async fetchUsersByRole(role: UserRole): Promise<void> {
      this.loading = true
      try {
        const api = useApi()
        const response = await api.get<UsersListResponse>(`/users/role/${role}`)
        this.users = response.users
        this.totalCount = response.count
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener usuario por ID
     */
    async fetchUserById(id: number | string): Promise<User> {
      const api = useApi()
      const response = await api.get<UserResponse>(`/users/${id}`)
      this.currentUser = response.user
      return response.user
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
      const api = useApi()
      const response = await api.post<UserResponse>('/users', data)

      // Agregar a la lista local
      this.users.push(response.user)
      this.totalCount = this.users.length

      return response.user
    },

    /**
     * Actualizar usuario
     */
    async updateUser(id: number | string, data: UpdateUserRequest): Promise<User> {
      const api = useApi()
      const response = await api.patch<UserResponse>(`/users/${id}`, data)

      // Actualizar en la lista local
      const numId = typeof id === 'string' ? parseInt(id) : id
      const index = this.users.findIndex((u) => u.id === numId)
      if (index !== -1) {
        this.users[index] = response.user
      }
      this.currentUser = response.user

      return response.user
    },

    /**
     * Desactivar usuario
     */
    async deactivateUser(id: number | string): Promise<User> {
      const api = useApi()
      const response = await api.del<UserResponse>(`/users/${id}`)

      // Actualizar en la lista local
      const index = this.users.findIndex((u) => u.id === (typeof id === 'string' ? parseInt(id) : id))
      if (index !== -1) {
        this.users[index] = response.user
      }

      return response.user
    },

    /**
     * Reactivar usuario
     */
    async reactivateUser(id: number | string): Promise<User> {
      const api = useApi()
      const response = await api.post<UserResponse>(`/users/${id}/reactivate`)

      // Actualizar en la lista local
      const index = this.users.findIndex((u) => u.id === (typeof id === 'string' ? parseInt(id) : id))
      if (index !== -1) {
        this.users[index] = response.user
      }

      return response.user
    },

    /**
     * Obtener estadísticas de password reset
     */
    async fetchResetStats(): Promise<void> {
      const api = useApi()
      const response = await api.get<PasswordResetStatsResponse>('/auth/admin/password-reset/stats')
      this.resetStats = response.stats
    },

    /**
     * Limpiar tokens expirados
     */
    async cleanupExpiredTokens(): Promise<number> {
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
      const api = useApi()
      await api.post(`/auth/admin/users/${userId}/invalidate-reset-tokens`)
    },
  },
})
