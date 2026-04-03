// stores/reservas.ts
import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import type { Reserva, ReservaResponse, ReservasListResponse, EstadoReserva } from '~/types/api'
import type { CheckoutResponse } from '~/types/factura'
import { normalizeReserva } from '~/utils/entityAdapters'
import { getErrorMessage } from '~/utils/http'

interface ReservasState {
  reservas: Reserva[]
  currentReserva: Reserva | null
  loading: boolean
  error: string | null
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
    error: null,
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
      this.error = null
      try {
        const api = useApi()
        const response = await api.get<ReservasListResponse>(
          `/reservas/hotel/${idHotel}`
        )
        this.reservas = response.reservas.map((reserva) => normalizeReserva(reserva))
        this.totalCount = response.count
      } catch (error: any) {
        this.error = getErrorMessage(error, 'No fue posible cargar reservas')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener todas las reservas (solo para superadmin)
     */
    async fetchAllReservas(): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const response = await api.get<ReservasListResponse>('/reservas')
        this.reservas = response.reservas.map((reserva) => normalizeReserva(reserva))
        this.totalCount = response.count
      } catch (error: any) {
        this.error = getErrorMessage(error, 'No fue posible cargar reservas')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Buscar reservas por cédula del cliente (filtra localmente de las reservas cargadas)
     */
    async fetchReservasByCedula(cedula: string, idHotel?: number): Promise<Reserva[]> {
      this.loading = true
      try {
        // Si no hay reservas cargadas y tenemos idHotel, cargamos primero
        if (this.reservas.length === 0 && idHotel) {
          await this.fetchReservasByHotel(idHotel)
        }
        
        // Filtrar las reservas cargadas por cédula
        const reservasFiltradas = this.reservas.filter(r => 
          r.cedulaCliente?.toString() === cedula.toString()
        )
        
        return reservasFiltradas
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
      this.error = null
      const api = useApi()
      const reserva = await api.get<Reserva>(`/reservas/${id}`)
      const normalized = normalizeReserva(reserva)
      this.currentReserva = normalized
      return normalized
    },



    /**
     * Cancelar una reserva
     */
    async cancelarReserva(id: number, motivo?: string): Promise<Reserva> {
      this.error = null
      const api = useApi()
      const reserva = normalizeReserva(await api.post<Reserva>(
        `/reservas/${id}/cancelar`,
        motivo ? { motivo } : {}
      ))

      // Actualizar en la lista local
      const index = this.reservas.findIndex((r) => r.id === id)
      if (index !== -1) {
        this.reservas[index] = reserva
      }
      this.currentReserva = reserva

      return reserva
    },

    /**
     * Confirmar entrada de una reserva (Check-in)
     * No requiere parámetros adicionales - el backend registra la hora actual
     */
    async confirmarCheckin(id: number): Promise<Reserva> {
      this.error = null
      const api = useApi()
      const reserva = normalizeReserva(await api.post<Reserva>(
        `/reservas/${id}/checkin`,
        {}
      ))

      // Actualizar en la lista local
      const index = this.reservas.findIndex((r) => r.id === id)
      if (index !== -1) {
        this.reservas[index] = reserva
      }
      this.currentReserva = reserva

      return reserva
    },

    /**
     * Alias para compatibilidad legacy - confirmar entrada (Check-in)
     */
    async confirmarReserva(id: number, cedula?: string): Promise<Reserva> {
      return this.confirmarCheckin(id)
    },

    /**
     * Confirmar reserva (cambiar estado de 'reservada' a 'confirmada')
     * Sin necesidad de verificar datos del cliente
     */
    async confirmarReservaEstado(id: number): Promise<Reserva> {
      this.error = null
      const api = useApi()
      const reserva = normalizeReserva(await api.post<Reserva>(
        `/reservas/${id}/confirmar`,
        {}
      ))

      // Actualizar en la lista local
      const index = this.reservas.findIndex((r) => r.id === id)
      if (index !== -1) {
        this.reservas[index] = reserva
      }
      this.currentReserva = reserva

      return reserva
    },

    /**
     * Completar una reserva (Check-out)
     * Registra la salida del huésped y genera factura
     */
    async confirmarCheckout(id: number): Promise<CheckoutResponse> {
      this.error = null
      const api = useApi()
      const response = await api.post<CheckoutResponse>(
        `/reservas/${id}/checkout`,
        {}
      )

      // Actualizar en la lista local
      const index = this.reservas.findIndex((r) => r.id === id)
      if (index !== -1) {
        this.reservas[index] = normalizeReserva(response.reserva)
      }
      this.currentReserva = normalizeReserva(response.reserva)

      return response
    },

    /**
     * Alias para compatibilidad legacy - completar reserva (Check-out)
     */
    async completarReserva(id: number): Promise<CheckoutResponse> {
      return this.confirmarCheckout(id)
    },

    /**
      * Obtener reservas del cliente actual desde endpoint dedicado de cliente
     */
    async obtenerReservasDelCliente(idCliente: number, _idHotel?: number): Promise<Reserva[]> {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const reservasDelCliente = await api.get<Reserva[]>(`/reservas/cliente/${idCliente}`)
        const normalized = (reservasDelCliente || []).map((reserva) => normalizeReserva(reserva))
        this.reservas = normalized
        this.totalCount = normalized.length
        return normalized
      } catch (error: any) {
        this.error = getErrorMessage(error, 'No fue posible cargar las reservas del cliente')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Establecer filtro por estado
     */
    setEstadoFilter(estado?: EstadoReserva | string): void {
      this.filter.estado = estado
    },

    clearError(): void {
      this.error = null
    },
  },
})
