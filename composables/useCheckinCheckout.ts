import { ref, computed } from 'vue'
import type {
  ReservaParaCheckin,
  ConfirmarCheckinResponse,
  ConfirmarCheckoutResponse,
  ResumenPendientes,
  FlujoDelDia,
  EstadoLimpieza,
  ValidacionCheckin,
  ValidacionCheckout,
  TipoBloqueoCheckout,
} from '~/types/checkinCheckout'
import type { Reserva as ReservaApi } from '~/types/api'
import { useApi } from './useApi'
import { useNotification } from './useNotification'
import { useAuthStore } from '~/stores/auth'

interface ReservasHotelResponse {
  reservas: ReservaApi[]
  count: number
}

const MS_DAY = 1000 * 60 * 60 * 24

export const useCheckinCheckout = () => {
  const api = useApi()
  const { success, error } = useNotification()
  const authStore = useAuthStore()

  // State
  const pendientesCheckin = ref<ReservaParaCheckin[]>([])
  const pendientesCheckout = ref<ReservaParaCheckin[]>([])
  const todasLasReservas = ref<ReservaParaCheckin[]>([])
  const flujoDelDia = ref<FlujoDelDia | null>(null)
  const searchCedula = ref('')
  const searchActivo = ref(false)
  const searchLoading = ref(false)
  
  const loadingPendientes = ref(false)
  const loadingOperacion = ref(false)
  const loadingFlujo = ref(false)
  const errorMessage = ref('')

  const esMismoDia = (fecha?: string | Date | null): boolean => {
    if (!fecha) return false
    const date = new Date(fecha)
    if (Number.isNaN(date.getTime())) return false

    const hoy = new Date()
    return (
      date.getFullYear() === hoy.getFullYear() &&
      date.getMonth() === hoy.getMonth() &&
      date.getDate() === hoy.getDate()
    )
  }

  const resolverIdHotel = (idHotel?: number): number | null => {
    if (idHotel) return idHotel
    const hotelUsuario = authStore.user?.idHotel
    return hotelUsuario || null
  }

  const resolverIdHabitacionReserva = (reserva: ReservaApi): number | null => {
    const idHabitacion = Number(reserva.idHabitacion || reserva.habitacion?.id || 0)
    return idHabitacion > 0 ? idHabitacion : null
  }

  const mapReservaAOperacion = (reserva: ReservaApi): ReservaParaCheckin => {
    const estadoReserva = String(reserva.estadoReserva || '').toLowerCase()
    const tieneCheckin = Boolean(reserva.checkinReal)
    const tieneCheckout = Boolean(reserva.checkoutReal)

    let estado: ReservaParaCheckin['estado'] = 'pendiente'
    if (estadoReserva === 'completada') {
      estado = 'completada'
    } else if (estadoReserva === 'cancelada' || estadoReserva === 'rechazada') {
      estado = 'cancelada'
    } else if (tieneCheckin && !tieneCheckout) {
      estado = 'checkedin'
    } else if (estadoReserva === 'confirmada') {
      estado = 'confirmada'
    }

    let estadoCheckin: ReservaParaCheckin['estadoCheckin'] = 'PENDIENTE_CHECKIN'
    if (tieneCheckout) {
      estadoCheckin = 'CHECKOUT_CONFIRMADO'
    } else if (tieneCheckin) {
      estadoCheckin = 'CHECKOUT_PENDIENTE'
    }

    const checkinFecha = new Date(reserva.checkinPrevisto)
    const checkoutFecha = new Date(reserva.checkoutPrevisto)
    const noches = Math.max(
      1,
      Math.ceil((checkoutFecha.getTime() - checkinFecha.getTime()) / MS_DAY)
    )

    const tarifa = Number(
      reserva.precioNocheSnapshot || reserva.tipoHabitacion?.precioBase || 0
    )

    return {
      id: reserva.id,
      numeroReserva: reserva.codigoConfirmacion || `RSV-${reserva.id}`,
      idCliente: reserva.idCliente,
      estadoReservaOriginal: estadoReserva,
      nombreCliente: reserva.nombreCliente || 'Cliente',
      cedulaCliente: reserva.cedulaCliente || 'N/A',
      idHabitacion: resolverIdHabitacionReserva(reserva) || 0,
      numeroHabitacion: String(
        reserva.habitacion?.numeroHabitacion ||
          (reserva as any).numeroHabitacion ||
          reserva.idHabitacion ||
          'N/A'
      ),
      tipoHabitacion: String(
        reserva.tipoHabitacion?.nombreTipo ||
          (reserva.tipoHabitacion as any)?.nombre ||
          'Sin tipo'
      ),
      checkinFecha: new Date(reserva.checkinPrevisto).toISOString(),
      checkoutFecha: new Date(reserva.checkoutPrevisto).toISOString(),
      estado,
      estadoCheckin,
      cantidadHuespedes: Number(reserva.numeroHuespedes || 1),
      tarifa,
      montoTotal: tarifa * noches,
    }
  }

  const extraerReservas = (
    response: ReservasHotelResponse | ReservaApi[] | null | undefined
  ): ReservaApi[] => {
    if (Array.isArray(response)) {
      return response
    }

    return Array.isArray(response?.reservas) ? response.reservas : []
  }

  const obtenerReservasHotel = async (idHotel?: number): Promise<ReservaApi[]> => {
    const hotelId = resolverIdHotel(idHotel)
    if (!hotelId) {
      return []
    }

    const response = await api.get<ReservasHotelResponse | ReservaApi[]>(
      `/reservas/hotel/${hotelId}`
    )

    return extraerReservas(response)
  }

  const resetearListados = () => {
    pendientesCheckin.value = []
    pendientesCheckout.value = []
    todasLasReservas.value = []
  }

  const construirResumenPendientes = async (
    reservas: ReservaApi[]
  ): Promise<ResumenPendientes> => {
    const normalizadas = reservas.map(mapReservaAOperacion)

    todasLasReservas.value = normalizadas

    const pendientesCheckinCalculadas = normalizadas.filter(
      (r) =>
        (r.estado === 'pendiente' || r.estado === 'confirmada') &&
        r.estadoCheckin === 'PENDIENTE_CHECKIN'
    )

    const pendientesCheckoutCalculadas = normalizadas.filter(
      (r) => r.estado === 'checkedin' && r.estadoCheckin === 'CHECKOUT_PENDIENTE'
    )

    const pendientesCheckoutConFolio = await hidratarFoliosCheckout(
      pendientesCheckoutCalculadas
    )

    const response: ResumenPendientes = {
      pendientesCheckin: pendientesCheckinCalculadas,
      pendientesCheckout: pendientesCheckoutConFolio,
      totalPendientes:
        pendientesCheckinCalculadas.length + pendientesCheckoutConFolio.length,
      timestamp: new Date().toISOString(),
    }

    pendientesCheckin.value = response.pendientesCheckin
    pendientesCheckout.value = response.pendientesCheckout

    return response
  }

  const hidratarFoliosCheckout = async (
    reservas: ReservaParaCheckin[]
  ): Promise<ReservaParaCheckin[]> => {
    if (!reservas.length) return reservas

    const reservasConFolio = await Promise.all(
      reservas.map(async (reserva) => {
        if (!reserva.idHabitacion) {
          return {
            ...reserva,
            folioEstado: 'NO_FOLIO' as const,
            folioTotal: 0,
            folioSaldo: 0,
            folioPagado: false,
          }
        }

        try {
          const folio = await api.get<any>(`/folios/${reserva.idHabitacion}`)
          const estado = String(folio?.estadoPago || folio?.estado || 'ABIERTO').toUpperCase()
          const total = Number(folio?.total || 0)
          const pagado = estado === 'PAGADO'
          const saldo = pagado ? 0 : total

          return {
            ...reserva,
            folioEstado:
              estado === 'PAGADO' || estado === 'CERRADO' || estado === 'ABIERTO'
                ? (estado as 'ABIERTO' | 'CERRADO' | 'PAGADO')
                : 'ABIERTO',
            folioTotal: total,
            folioSaldo: saldo,
            folioPagado: pagado,
          }
        } catch {
          return {
            ...reserva,
            folioEstado: 'NO_FOLIO' as const,
            folioTotal: 0,
            folioSaldo: 0,
            folioPagado: false,
          }
        }
      })
    )

    return reservasConFolio
  }

  /**
   * Obtener listado de reservas pendientes de checkin y checkout
   */
  const obtenerPendientes = async (idHotel?: number) => {
    loadingPendientes.value = true
    errorMessage.value = ''

    try {
      const reservas = await obtenerReservasHotel(idHotel)
      return await construirResumenPendientes(reservas)
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al obtener pendientes'
      errorMessage.value = errorMsg
      resetearListados()
      error(errorMsg)
      return { pendientesCheckin: [], pendientesCheckout: [], totalPendientes: 0, timestamp: '' }
    } finally {
      loadingPendientes.value = false
    }
  }

  const obtenerPendientesPorCedula = async (cedula: string, idHotel?: number) => {
    loadingPendientes.value = true
    searchLoading.value = true
    errorMessage.value = ''

    const cedulaNormalizada = cedula.trim()
    searchCedula.value = cedulaNormalizada
    searchActivo.value = Boolean(cedulaNormalizada)

    try {
      const hotelId = resolverIdHotel(idHotel)
      if (!hotelId || !cedulaNormalizada) {
        resetearListados()
        return { pendientesCheckin: [], pendientesCheckout: [], totalPendientes: 0, timestamp: '' }
      }

      const response = await api.get<ReservasHotelResponse | ReservaApi[]>(
        `/reservas/cedula/${encodeURIComponent(cedulaNormalizada)}/${hotelId}`
      )

      return await construirResumenPendientes(extraerReservas(response))
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al buscar reservas por cédula'
      errorMessage.value = errorMsg
      resetearListados()
      error(errorMsg)
      return { pendientesCheckin: [], pendientesCheckout: [], totalPendientes: 0, timestamp: '' }
    } finally {
      loadingPendientes.value = false
      searchLoading.value = false
    }
  }

  const limpiarBusqueda = async (idHotel?: number) => {
    searchCedula.value = ''
    searchActivo.value = false
    searchLoading.value = false
    return await obtenerPendientes(idHotel)
  }

  const refrescarReservas = async (idHotel?: number) => {
    if (searchActivo.value && searchCedula.value.trim()) {
      return await obtenerPendientesPorCedula(searchCedula.value, idHotel)
    }

    return await obtenerPendientes(idHotel)
  }

  /**
   * Validar si se puede hacer check-in en una reserva
   */
  const validarCheckin = async (idReserva: number): Promise<ValidacionCheckin> => {
    try {
      const reserva = await api.get<ReservaApi>(`/reservas/${idReserva}`)
      const estado = String(reserva.estadoReserva || '').toLowerCase()

      const errores: string[] = []
      const advertencias: string[] = []

      if (!['reservada', 'confirmada'].includes(estado)) {
        errores.push(
          `La reserva está en estado "${estado}" y no admite check-in`
        )
      }

      if (reserva.checkoutReal) {
        errores.push('La reserva ya tiene check-out registrado')
      }

      if (reserva.checkinReal) {
        errores.push('La reserva ya tiene check-in registrado')
      }

      const habitacionDisponible = Boolean(
        reserva.idHabitacion || reserva.habitacion?.id
      )

      if (!habitacionDisponible) {
        advertencias.push('La reserva no tiene habitación asignada')
      }

      return {
        esValido: errores.length === 0,
        errores,
        advertencias,
        habitacionDisponible,
        reservaActiva: ['reservada', 'confirmada'].includes(estado),
        folioExistente: false,
      }
    } catch (err: any) {
      return {
        esValido: false,
        errores: [err?.message || 'Error validando check-in'],
        advertencias: [],
        habitacionDisponible: false,
        reservaActiva: false,
        folioExistente: false
      }
    }
  }

  /**
   * Validar si se puede hacer checkout en una reserva
   */
  const validarCheckout = async (idReserva: number): Promise<ValidacionCheckout> => {
    try {
      const reserva = await api.get<ReservaApi>(`/reservas/${idReserva}`)
      const estado = String(reserva.estadoReserva || '').toLowerCase()
      const idHabitacion = resolverIdHabitacionReserva(reserva)

      const errores: string[] = []
      const advertencias: string[] = []
      let tipoBloqueo: TipoBloqueoCheckout | null = null
      let folioEstado: string | undefined

      if (!reserva.checkinReal) {
        errores.push('No se puede hacer check-out sin check-in previo')
        tipoBloqueo = 'RESERVA_INVALIDA'
      }

      if (reserva.checkoutReal) {
        errores.push('La reserva ya tiene check-out registrado')
        tipoBloqueo = 'RESERVA_INVALIDA'
      }

      if (estado === 'cancelada' || estado === 'rechazada') {
        errores.push(`La reserva está en estado "${estado}"`)
        tipoBloqueo = 'RESERVA_INVALIDA'
      }

      let folioPagado = false
      let saldoRestante = 0

      if (!idHabitacion) {
        errores.push('La reserva no tiene habitación asignada para validar el folio')
        tipoBloqueo = tipoBloqueo || 'SIN_FOLIO'
      } else if (tipoBloqueo !== 'RESERVA_INVALIDA') {
        try {
          const folio = await api.get<any>(`/folios/${idHabitacion}`)
          const estadoFolio = String(folio?.estadoPago || folio?.estado || '').toUpperCase()
          const totalFolio = Number(folio?.total || 0)

          folioEstado = estadoFolio || undefined
          saldoRestante = totalFolio

          // CAMBIO IMPORTANTE: Acepta CERRADO o PAGADO para permitir checkout
          // CERRADO = folio listo, puede hace checkout sin pago (se paga en Caja después)
          // PAGADO = folio ya pagado en Caja
          if (estadoFolio === 'CERRADO' || estadoFolio === 'PAGADO' || totalFolio <= 0) {
            folioPagado = true // Permite checkout
          } else if (estadoFolio === 'ABIERTO') {
            // Folio está abierto, puede cerrarse en checkout
            folioPagado = false
            advertencias.push('Folio aún está abierto. Se cerrará al confirmar check-out.')
          } else {
            // Otro estado desconocido
            folioPagado = false
          }
        } catch (err) {
          errores.push('No existe folio activo para la habitación. Debe abrirse en check-in o validarse en Caja')
          tipoBloqueo = tipoBloqueo || 'SIN_FOLIO'
        }
      }

      return {
        esValido: errores.length === 0,
        errores,
        advertencias,
        folioPagado,
        puedeCheckout: errores.length === 0,
        saldoRestante,
        tipoBloqueo,
        folioEstado,
      }
    } catch (err: any) {
      return {
        esValido: false,
        errores: [err?.message || 'Error validando checkout'],
        advertencias: [],
        folioPagado: false,
        puedeCheckout: false,
        saldoRestante: 0,
        tipoBloqueo: 'RESERVA_INVALIDA',
      }
    }
  }

  /**
   * Confirmar check-in de una reserva
   */
  const confirmarCheckin = async (
    idReserva: number,
    idHabitacion: number,
    idCliente: number,
    notasCheckin?: string,
    horaCheckin?: string,
    documentoHuespedPrincipal?: string
  ) => {
    loadingOperacion.value = true
    errorMessage.value = ''

    try {
      const response = await api.post<ConfirmarCheckinResponse>(
        `/reservas/${idReserva}/checkin`,
        {
          idReserva,
          ...(notasCheckin ? { observacionesCheckin: notasCheckin } : {}),
          ...(horaCheckin ? { horaCheckin } : {}),
          ...(documentoHuespedPrincipal ? { documentoHuespedPrincipal } : {}),
        }
      )

      success('Check-in realizado correctamente. Folio abierto.')
      
      // Actualizar pendientes
      await refrescarReservas(authStore.user?.idHotel)
      
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al realizar check-in'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loadingOperacion.value = false
    }
  }

  /**
   * Confirmar check-out de una reserva
   */
  const confirmarCheckout = async (
    idReserva: number,
    idHabitacion: number,
    notasCheckout?: string,
    estadoLimpieza: EstadoLimpieza = 'PENDIENTE_LIMPIEZA',
    horaCheckout?: string
  ) => {
    loadingOperacion.value = true
    errorMessage.value = ''

    try {

      // Checkout es una acción limpia: registra la hora de salida
      // La factura se genera SOLO en caja cuando se cobra el folio
      const response = await api.post<ConfirmarCheckoutResponse>(
        `/reservas/${idReserva}/checkout`,
        {
          idReserva,
          idHabitacion,
          estadoLimpieza,
          ...(notasCheckout ? { observacionesCheckout: notasCheckout } : {}),
          ...(horaCheckout ? { horaCheckout } : {}),
        }
      )

      success('Check-out realizado correctamente.')
      
      // Actualizar pendientes
      await refrescarReservas(authStore.user?.idHotel)
      
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al realizar checkout'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loadingOperacion.value = false
    }
  }

  /**
   * Obtener flujo del día (KPIs de check-in/check-out)
   */
  const obtenerFlujoDelDia = async (idHotel?: number) => {
    loadingFlujo.value = true
    errorMessage.value = ''

    try {
      const reservas = await obtenerReservasHotel(idHotel)
      const normalizadas = reservas.map(mapReservaAOperacion)

      const checkinsRealizados = reservas.filter((r) => esMismoDia(r.checkinReal as any)).length
      const checkoutsRealizados = reservas.filter((r) => esMismoDia(r.checkoutReal as any)).length

      const foliosPendientes = normalizadas.filter(
        (r) => r.estado === 'checkedin' && r.estadoCheckin === 'CHECKOUT_PENDIENTE'
      ).length

      const response: FlujoDelDia = {
        checkinsRealizados,
        checkoutsRealizados,
        foliosCobrados: 0,
        foliosPendientes,
        ingresoDelDia: 0,
        saldoPendiente: 0,
      }

      flujoDelDia.value = response
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al obtener flujo del día'
      errorMessage.value = errorMsg
      error(errorMsg)
      return null
    } finally {
      loadingFlujo.value = false
    }
  }

  /**
   * Computed: cantidad de pendientes de checkin
   */
  const cantidadPendientesCheckin = computed(() => {
    return pendientesCheckin.value?.length || 0
  })

  /**
   * Computed: cantidad de pendientes de checkout
   */
  const cantidadPendientesCheckout = computed(() => {
    return pendientesCheckout.value?.length || 0
  })

  /**
   * Computed: total de pendientes
   */
  const totalPendientes = computed(() => {
    return cantidadPendientesCheckin.value + cantidadPendientesCheckout.value
  })

  const cantidadTodasLasReservas = computed(() => {
    return todasLasReservas.value.length
  })

  /**
   * Obtener una reserva pendiente por ID
   */
  const obtenerPendientePorId = (idReserva: number) => {
    const enCheckin = pendientesCheckin.value.find((r) => r.id === idReserva)
    if (enCheckin) return enCheckin

    const enCheckout = pendientesCheckout.value.find((r) => r.id === idReserva)
    if (enCheckout) return enCheckout

    const enTodas = todasLasReservas.value.find((r) => r.id === idReserva)
    if (enTodas) return enTodas

    return null
  }

  return {
    // State
    pendientesCheckin,
    pendientesCheckout,
    todasLasReservas,
    flujoDelDia,
    loadingPendientes,
    loadingOperacion,
    loadingFlujo,
    errorMessage,
    searchCedula,
    searchActivo,
    searchLoading,

    // Computed
    cantidadPendientesCheckin,
    cantidadPendientesCheckout,
    cantidadTodasLasReservas,
    totalPendientes,

    // Methods
    obtenerPendientes,
    obtenerPendientesPorCedula,
    limpiarBusqueda,
    validarCheckin,
    validarCheckout,
    confirmarCheckin,
    confirmarCheckout,
    obtenerFlujoDelDia,
    obtenerPendientePorId
  }
}
