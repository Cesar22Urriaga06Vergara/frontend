// stores/reservas.ts
import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import type { Reserva, ReservaResponse, ReservasListResponse, EstadoReserva } from '~/types/api'

interface ReservasState {
  reservas: Reserva[]
  currentReserva: Reserva | null
  loading: boolean
  totalCount: number
  filter: {
    estado?: EstadoReserva | string
  }
}

export const useReservasStore = defineStore('reservas', {
  state: (): ReservasState => ({
    reservas: [],
    currentReserva: null,
    loading: false,
    totalCount: 0,
    filter: {
      estado: undefined,
    },
  }),

  getters: {
    /**
     * Reservas filtradas
     */
    filteredReservas: (state): Reserva[] => {
      if (!state.filter.estado) {
        return state.reservas
      }
      return state.reservas.filter((r) => r.estadoReserva === state.filter.estado)
    },

    /**
     * Conteo por estado
     */
    countByEstado: (state) => {
      const counts: Record<string, number> = {}
      state.reservas.forEach((r) => {
        const estado = r.estadoReserva as string
        counts[estado] = (counts[estado] || 0) + 1
      })
      return counts
    },

    /**
     * Reservas confirmadas hoy
     */
    confirmedTodayCount: (state): number => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      return state.reservas.filter((r) => {
        if (r.estadoReserva !== 'confirmada') return false

        const createdDate = new Date(r.createdAt || '')
        createdDate.setHours(0, 0, 0, 0)

        return createdDate.getTime() === today.getTime()
      }).length
    },

    /**
     * Check-ins pendientes (confirmadas con checkinPrevisto en el futuro)
     */
    pendingCheckinsCount: (state): number => {
      const now = new Date()

      return state.reservas.filter(
        (r) =>
          r.estadoReserva === 'confirmada' &&
          !r.checkinReal &&
          new Date(r.checkinPrevisto) >= now
      ).length
    },

    /**
     * Check-outs pendientes (realizadas con checkoutPrevisto en el futuro)
     */
    pendingCheckoutsCount: (state): number => {
      const now = new Date()

      return state.reservas.filter(
        (r) =>
          r.checkinReal &&
          !r.checkoutReal &&
          new Date(r.checkoutPrevisto) >= now
      ).length
    },
  },

  actions: {
    /**
     * Obtener reservas del hotel
     */
    async fetchReservasByHotel(idHotel: number): Promise<void> {
      this.loading = true
      try {
        const api = useApi()
        const response = await api.get<ReservasListResponse>(
          `/reservas/hotel/${idHotel}`
        )
        this.reservas = response.reservas
        this.totalCount = response.count
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener todas las reservas (solo para superadmin)
     */
    async fetchAllReservas(): Promise<void> {
      this.loading = true
      try {
        const api = useApi()
        const response = await api.get<ReservasListResponse>('/reservas')
        this.reservas = response.reservas
        this.totalCount = response.count
      } finally {
        this.loading = false
      }
    },

    /**
     * Buscar reservas por cédula del cliente
     */
    async fetchReservasByCedula(cedula: string, idHotel?: number): Promise<Reserva[]> {
      this.loading = true
      try {
        const api = useApi()
        const endpoint = idHotel
          ? `/reservas/cedula/${cedula}/${idHotel}`
          : `/reservas/cedula/${cedula}`
        const response = await api.get<ReservasListResponse>(endpoint)
        this.reservas = response.reservas
        this.totalCount = response.count
        return response.reservas
      } finally {
        this.loading = false
      }
    },

    /**
     * Buscar reservas por cédula del cliente (alias legacyCompatibility)
     */
    async buscarReservasPorCedula(cedula: string, idHotel: number): Promise<Reserva[]> {
      return this.fetchReservasByCedula(cedula, idHotel)
    },

    /**
     * Obtener reserva por ID
     */
    async fetchReservaById(id: number): Promise<Reserva> {
      const api = useApi()
      const response = await api.get<ReservaResponse>(`/reservas/${id}`)
      this.currentReserva = response.reserva
      return response.reserva
    },

    /**
     * Confirmar check-in de una reserva
     */
    async confirmarCheckin(id: number): Promise<Reserva> {
      const api = useApi()
      const response = await api.post<ReservaResponse>(`/reservas/${id}/checkin`)

      // Actualizar en la lista local
      const index = this.reservas.findIndex((r) => r.id === id)
      if (index !== -1) {
        this.reservas[index] = response.reserva
      }
      this.currentReserva = response.reserva

      return response.reserva
    },

    /**
     * Confirmar check-out de una reserva
     */
    async confirmarCheckout(id: number): Promise<Reserva> {
      const api = useApi()
      const response = await api.post<ReservaResponse>(`/reservas/${id}/checkout`)

      // Actualizar en la lista local
      const index = this.reservas.findIndex((r) => r.id === id)
      if (index !== -1) {
        this.reservas[index] = response.reserva
      }
      this.currentReserva = response.reserva

      return response.reserva
    },

    /**
     * Cancelar una reserva
     */
    async cancelarReserva(id: number, motivo?: string): Promise<Reserva> {
      const api = useApi()
      const response = await api.post<ReservaResponse>(
        `/reservas/${id}/cancelar`,
        motivo ? { motivo } : {}
      )

      // Actualizar en la lista local
      const index = this.reservas.findIndex((r) => r.id === id)
      if (index !== -1) {
        this.reservas[index] = response.reserva
      }
      this.currentReserva = response.reserva

      return response.reserva
    },

    /**
     * Confirmar entrada de una reserva (Check-in)
     * Recepcionista verifica la cédula del cliente
     */
    async confirmarReserva(id: number, cedula: string): Promise<Reserva> {
      const api = useApi()
      const response = await api.post<ReservaResponse>(
        `/reservas/${id}/confirmar`,
        { cedula }
      )

      // Actualizar en la lista local
      const index = this.reservas.findIndex((r) => r.id === id)
      if (index !== -1) {
        this.reservas[index] = response.reserva
      }
      this.currentReserva = response.reserva

      return response.reserva
    },

    /**
     * Completar una reserva (Check-out)
     */
    async completarReserva(id: number): Promise<Reserva> {
      const api = useApi()
      const response = await api.post<ReservaResponse>(
        `/reservas/${id}/completar`,
        {}
      )

      // Actualizar en la lista local
      const index = this.reservas.findIndex((r) => r.id === id)
      if (index !== -1) {
        this.reservas[index] = response.reserva
      }
      this.currentReserva = response.reserva

      return response.reserva
    },

    /**
     * Establecer filtro por estado
     */
    setEstadoFilter(estado?: EstadoReserva | string): void {
      this.filter.estado = estado
    },
  },
})
