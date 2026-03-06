import type { Ref } from 'vue'
import type {
  DisponibilidadResponseDto,
  HabitacionDisponibleDto,
  CreateReservaDto,
  Reserva,
} from '~/types/api'

export const useReservas = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const disponibilidad = ref<DisponibilidadResponseDto | null>(null)
  const habitacionesDisponibles = ref<HabitacionDisponibleDto[]>([])
  const reservas = ref<Reserva[]>([])
  const loadingDisponibilidad = ref(false)
  const loadingHabitaciones = ref(false)
  const creandoReserva = ref(false)
  const errorMessage = ref('')

  /**
   * Obtener habitaciones disponibles del hotel (sin filtro de fechas)
   */
  const obtenerHabitacionesDisponibles = async (idHotel: number) => {
    loadingHabitaciones.value = true
    errorMessage.value = ''

    try {
      const response = await api.get<any[]>(
        `/habitaciones?idHotel=${idHotel}&disponibles=false`,
      )

      // Mapear la respuesta al formato esperado
      habitacionesDisponibles.value = response
        .map((h) => ({
          id: h.id,
          numeroHabitacion: h.numeroHabitacion,
          piso: h.piso,
          imagenes: h.imagenes,
          tipoHabitacionId: h.idTipoHabitacion,
          tipoHabitacionNombre: h.tipoHabitacion?.nombreTipo || '',
          capacidadPersonas: h.tipoHabitacion?.capacidadPersonas || 0,
          precioBase: h.tipoHabitacion?.precioBase || 0,
          amenidades: h.tipoHabitacion?.amenidades?.map((a: any) => ({
            id: a.id,
            nombre: a.nombre,
            icono: a.icono,
          })) || [],
          disponibleDesde: new Date(),
          disponibleHasta: new Date(),
        }))
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al obtener habitaciones disponibles'
      errorMessage.value = errorMsg
      error(errorMsg)
    } finally {
      loadingHabitaciones.value = false
    }
  }

  /**
   * Consultar disponibilidad de habitaciones
   */
  const consultarDisponibilidad = async (
    idHotel: number,
    checkinFecha: string,
    checkoutFecha: string,
    idTipoHabitacion?: number,
  ) => {
    loadingDisponibilidad.value = true
    errorMessage.value = ''

    try {
      // Validar fechas
      const checkin = new Date(checkinFecha)
      const checkout = new Date(checkoutFecha)

      if (checkin >= checkout) {
        throw new Error('La fecha de check-in debe ser anterior a check-out')
      }

      const queryParams = new URLSearchParams({
        idHotel: String(idHotel),
        checkinFecha,
        checkoutFecha,
        ...(idTipoHabitacion && { idTipoHabitacion: String(idTipoHabitacion) }),
      })

      const response = await api.get<DisponibilidadResponseDto>(
        `/reservas/disponibilidad?${queryParams}`,
      )

      disponibilidad.value = response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al consultar disponibilidad'
      errorMessage.value = errorMsg
      error(errorMsg)
    } finally {
      loadingDisponibilidad.value = false
    }
  }

  /**
   * Crear una nueva reserva
   */
  const crearReserva = async (createReservaDto: CreateReservaDto): Promise<Reserva | null> => {
    creandoReserva.value = true
    errorMessage.value = ''

    try {
      const response = await api.post<Reserva>('/reservas', createReservaDto)
      success('¡Reserva creada exitosamente!')
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al crear la reserva'
      errorMessage.value = errorMsg
      error(errorMsg)
      return null
    } finally {
      creandoReserva.value = false
    }
  }

  /**
   * Obtener reservas del cliente actual
   */
  const obtenerMisReservas = async (idCliente: number) => {
    try {
      const response = await api.get<Reserva[]>(`/reservas/cliente/${idCliente}`)
      reservas.value = response
    } catch (err: any) {
      error(err?.message || 'Error al obtener tus reservas')
    }
  }

  /**
   * Obtener detalle de una reserva
   */
  const obtenerReserva = async (id: number): Promise<Reserva | null> => {
    try {
      return await api.get<Reserva>(`/reservas/${id}`)
    } catch (err: any) {
      error(err?.message || 'Error al obtener la reserva')
      return null
    }
  }

  /**
   * Obtener reserva por código de confirmación
   */
  const obtenerReservaPorCodigo = async (codigo: string): Promise<Reserva | null> => {
    try {
      return await api.get<Reserva>(`/reservas/codigo/${codigo}`)
    } catch (err: any) {
      error(err?.message || 'Error al obtener la reserva')
      return null
    }
  }

  /**
   * Cancelar una reserva
   */
  const cancelarReserva = async (id: number): Promise<boolean> => {
    try {
      console.log(`🗑️ Cancelando reserva ${id}...`)
      const response = await api.post(`/reservas/${id}/cancelar`, {})
      console.log('✅ Reserva cancelada:', response)
      success('Reserva cancelada correctamente')
      return true
    } catch (err: any) {
      console.error('❌ Error cancelando reserva:', err)
      error(err?.message || 'Error al cancelar la reserva')
      return false
    }
  }

  /**
   * Calcular número de noches
   */
  const calcularNoches = (checkinFecha: string, checkoutFecha: string): number => {
    if (!checkinFecha || !checkoutFecha) return 0
    const checkin = new Date(checkinFecha)
    const checkout = new Date(checkoutFecha)
    return Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24))
  }

  /**
   * Calcular precio total
   */
  const calcularPrecioTotal = (precioNoche: number, numeroNoches: number): number => {
    return precioNoche * numeroNoches
  }

  return {
    // Estado
    disponibilidad,
    habitacionesDisponibles,
    reservas,
    loadingDisponibilidad,
    loadingHabitaciones,
    creandoReserva,
    errorMessage,

    // Métodos
    obtenerHabitacionesDisponibles,
    consultarDisponibilidad,
    crearReserva,
    obtenerMisReservas,
    obtenerReserva,
    obtenerReservaPorCodigo,
    cancelarReserva,
    calcularNoches,
    calcularPrecioTotal,
  }
}
