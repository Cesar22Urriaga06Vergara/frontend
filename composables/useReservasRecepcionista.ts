import { ref, computed } from 'vue'
import type {
  Reserva,
  CrearReservaDto,
  ActualizarReservaDto,
  CancelarReservaDto,
  FiltrosReserva,
  EstadoReserva
} from '~/types/reserva'
import { useApi } from './useApi'
import { useNotification } from './useNotification'

export const useReservasRecepcionista = () => {
  const api = useApi()
  const { success, error } = useNotification()

  // State
  const reservas = ref<Reserva[]>([])
  const reservaActual = ref<Reserva | null>(null)
  const loadingReservas = ref(false)
  const loadingDetalle = ref(false)
  const loadingOperacion = ref(false)
  const errorMessage = ref('')

  // Filtros
  const filtros = ref<FiltrosReserva>({
    ordenarPor: 'checkin',
    orden: 'asc'
  })

  /**
   * Obtener todas las reservas del hotel (recepcionista) con filtros
   */
  const obtenerReservas = async (filtrosCustom?: FiltrosReserva) => {
    loadingReservas.value = true
    errorMessage.value = ''

    try {
      const params = new URLSearchParams()

      const filtrosFinales = { ...filtros.value, ...filtrosCustom }

      if (filtrosFinales.estado) params.append('estado', filtrosFinales.estado)
      if (filtrosFinales.fechaDesde) params.append('fechaDesde', filtrosFinales.fechaDesde)
      if (filtrosFinales.fechaHasta) params.append('fechaHasta', filtrosFinales.fechaHasta)
      if (filtrosFinales.idCliente) params.append('idCliente', filtrosFinales.idCliente.toString())
      if (filtrosFinales.numeroHabitacion) params.append('numero', filtrosFinales.numeroHabitacion)
      if (filtrosFinales.ordenarPor) params.append('ordenarPor', filtrosFinales.ordenarPor)
      if (filtrosFinales.orden) params.append('orden', filtrosFinales.orden)

      let query = '/reservas'
      if (params.toString()) {
        query += `?${params.toString()}`
      }

      const response = await api.get<Reserva[]>(query)
      reservas.value = response
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al obtener reservas'
      errorMessage.value = errorMsg
      error(errorMsg)
      return []
    } finally {
      loadingReservas.value = false
    }
  }

  /**
   * Obtener una reserva por ID
   */
  const obtenerPorId = async (id: number) => {
    loadingDetalle.value = true
    errorMessage.value = ''

    try {
      const response = await api.get<Reserva>(`/reservas/${id}`)
      reservaActual.value = response
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al obtener reserva'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loadingDetalle.value = false
    }
  }

  /**
   * Crear una nueva reserva (recepcionista en mostrador)
   */
  const crearReserva = async (
    idCliente: number,
    idTipoHabitacion: number,
    checkinFecha: string,
    checkoutFecha: string,
    numeroHuespedes: number,
    observaciones?: string
  ) => {
    loadingOperacion.value = true
    errorMessage.value = ''

    try {
      const dto: CrearReservaDto = {
        idCliente,
        idTipoHabitacion,
        checkinPrevisto: checkinFecha,
        checkoutPrevisto: checkoutFecha,
        numeroHuespedes,
        origenReserva: 'mostrador',
        observaciones
      }

      const response = await api.post<Reserva>('/reservas', dto)
      success('Reserva creada correctamente')
      
      // Agregar a lista local
      reservas.value.unshift(response)
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al crear reserva'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loadingOperacion.value = false
    }
  }

  /**
   * Actualizar una reserva
   */
  const actualizarReserva = async (
    id: number,
    datos: ActualizarReservaDto
  ) => {
    loadingOperacion.value = true
    errorMessage.value = ''

    try {
      const response = await api.patch<Reserva>(`/reservas/${id}`, datos)
      success('Reserva actualizada correctamente')
      
      // Actualizar en lista local
      const indice = reservas.value.findIndex((r) => r.id === id)
      if (indice !== -1) {
        reservas.value[indice] = response
      }
      
      if (reservaActual.value?.id === id) {
        reservaActual.value = response
      }
      
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al actualizar reserva'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loadingOperacion.value = false
    }
  }

  /**
   * Cancelar una reserva
   */
  const cancelarReserva = async (
    id: number,
    motivo: string,
    reembolso?: boolean
  ) => {
    loadingOperacion.value = true
    errorMessage.value = ''

    if (!motivo || motivo.trim().length < 5) {
      error('Motivo debe tener al menos 5 caracteres')
      loadingOperacion.value = false
      return
    }

    try {
      const dto: CancelarReservaDto = {
        motivo,
        reembolso
      }

      const response = await api.patch<Reserva>(`/reservas/${id}/cancelar`, dto)
      success('Reserva cancelada correctamente')
      
      // Actualizar en lista local
      const indice = reservas.value.findIndex((r) => r.id === id)
      if (indice !== -1) {
        reservas.value[indice] = response
      }
      
      if (reservaActual.value?.id === id) {
        reservaActual.value = response
      }
      
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al cancelar reserva'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loadingOperacion.value = false
    }
  }

  /**
   * Obtener reservas del día (hoy)
   */
  const obtenerDelDia = async () => {
    const hoy = new Date().toISOString().split('T')[0]
    return await obtenerReservas({
      fechaDesde: hoy,
      fechaHasta: hoy
    })
  }

  /**
   * Obtener reservas de los próximos días
   */
  const obtenerProximosDias = async (dias: number = 7) => {
    const hoy = new Date()
    const hasta = new Date(hoy.getTime() + dias * 24 * 60 * 60 * 1000)
    
    return await obtenerReservas({
      fechaDesde: hoy.toISOString().split('T')[0],
      fechaHasta: hasta.toISOString().split('T')[0]
    })
  }

  /**
   * Cambiar filtro de estado
   */
  const cambiarFiltroEstado = (estado: EstadoReserva | 'todos') => {
    if (estado === 'todos') {
      filtros.value.estado = undefined
    } else {
      filtros.value.estado = estado
    }
  }

  /**
   * Cambiar filtro de fecha
   */
  const cambiarFiltroFecha = (desde: string, hasta: string) => {
    filtros.value.fechaDesde = desde
    filtros.value.fechaHasta = hasta
  }

  /**
   * Cambiar ordenamiento
   */
  const cambiarOrdenamiento = (ordenarPor: 'checkin' | 'checkout' | 'creacion', orden: 'asc' | 'desc') => {
    filtros.value.ordenarPor = ordenarPor
    filtros.value.orden = orden
  }

  /**
   * Limpiar filtros
   */
  const limpiarFiltros = async () => {
    filtros.value = {
      ordenarPor: 'checkin',
      orden: 'asc'
    }
    await obtenerReservas()
  }

  /**
   * Computed: reservas filtradas por estado
   */
  const reservasPorEstado = computed(() => {
    if (!filtros.value.estado) return reservas.value
    return reservas.value.filter((r) => r.estadoReserva === filtros.value.estado)
  })

  /**
   * Computed: agrupar reservas por estado
   */
  const reservasAgrupadas = computed(() => {
    const agrupadas: Record<EstadoReserva, Reserva[]> = {
      reservada: [],
      confirmada: [],
      checkedin: [],
      completada: [],
      cancelada: [],
      rechazada: []
    }

    reservas.value.forEach((r) => {
      const estado = r.estadoReserva as EstadoReserva
      if (agrupadas[estado]) {
        agrupadas[estado].push(r)
      }
    })

    return agrupadas
  })

  /**
   * Computed: total de reservas
   */
  const totalReservas = computed(() => reservas.value.length)

  return {
    // State
    reservas,
    reservaActual,
    loadingReservas,
    loadingDetalle,
    loadingOperacion,
    errorMessage,
    filtros,

    // Computed
    reservasPorEstado,
    reservasAgrupadas,
    totalReservas,

    // Methods
    obtenerReservas,
    obtenerPorId,
    crearReserva,
    actualizarReserva,
    cancelarReserva,
    obtenerDelDia,
    obtenerProximosDias,
    cambiarFiltroEstado,
    cambiarFiltroFecha,
    cambiarOrdenamiento,
    limpiarFiltros
  }
}
