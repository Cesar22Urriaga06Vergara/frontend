import { ref, computed } from 'vue'
import type {
  ReservaParaCheckin,
  ConfirmarCheckinRequest,
  ConfirmarCheckinResponse,
  ConfirmarCheckoutRequest,
  ConfirmarCheckoutResponse,
  ResumenPendientes,
  FlujoDelDia,
  EstadoLimpieza,
  ValidacionCheckin,
  ValidacionCheckout
} from '~/types/checkinCheckout'
import { useApi } from './useApi'
import { useNotification } from './useNotification'

export const useCheckinCheckout = () => {
  const api = useApi()
  const { success, error } = useNotification()

  // State
  const pendientesCheckin = ref<ReservaParaCheckin[]>([])
  const pendientesCheckout = ref<ReservaParaCheckin[]>([])
  const flujoDelDia = ref<FlujoDelDia | null>(null)
  
  const loadingPendientes = ref(false)
  const loadingOperacion = ref(false)
  const loadingFlujo = ref(false)
  const errorMessage = ref('')

  /**
   * Obtener listado de reservas pendientes de checkin y checkout
   */
  const obtenerPendientes = async (idHotel?: number) => {
    loadingPendientes.value = true
    errorMessage.value = ''

    try {
      let query = '/reservas/pendientes-checkin-checkout'
      if (idHotel) {
        query += `?idHotel=${idHotel}`
      }

      const response = await api.get<ResumenPendientes>(query)
      pendientesCheckin.value = response.pendientesCheckin || []
      pendientesCheckout.value = response.pendientesCheckout || []
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al obtener pendientes'
      errorMessage.value = errorMsg
      error(errorMsg)
      return { pendientesCheckin: [], pendientesCheckout: [], totalPendientes: 0, timestamp: '' }
    } finally {
      loadingPendientes.value = false
    }
  }

  /**
   * Validar si se puede hacer check-in en una reserva
   */
  const validarCheckin = async (idReserva: number): Promise<ValidacionCheckin> => {
    try {
      const response = await api.get<ValidacionCheckin>(`/reservas/${idReserva}/validacion-checkin`)
      return response
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
      const response = await api.get<ValidacionCheckout>(`/reservas/${idReserva}/validacion-checkout`)
      return response
    } catch (err: any) {
      return {
        esValido: false,
        errores: [err?.message || 'Error validando checkout'],
        advertencias: [],
        folioPagado: false,
        puedeCheckout: false,
        saldoRestante: 0
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
    notasCheckin?: string
  ) => {
    loadingOperacion.value = true
    errorMessage.value = ''

    try {
      const request: ConfirmarCheckinRequest = {
        idReserva,
        idHabitacion,
        idCliente,
        notasCheckin,
        horaCheckin: new Date().toISOString()
      }

      const response = await api.post<ConfirmarCheckinResponse>(
        `/reservas/${idReserva}/checkin`,
        request
      )

      success('Check-in realizado correctamente. Folio abierto.')
      
      // Actualizar pendientes
      await obtenerPendientes()
      
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
    estadoLimpieza: EstadoLimpieza = 'PENDIENTE_LIMPIEZA'
  ) => {
    loadingOperacion.value = true
    errorMessage.value = ''

    try {
      const request: ConfirmarCheckoutRequest = {
        idReserva,
        idHabitacion,
        notasCheckout,
        estadoLimpieza,
        horaCheckout: new Date().toISOString()
      }

      const response = await api.post<ConfirmarCheckoutResponse>(
        `/reservas/${idReserva}/checkout`,
        request
      )

      success('Check-out realizado correctamente.')
      
      // Actualizar pendientes
      await obtenerPendientes()
      
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
      let query = '/reservas/flujo-del-dia'
      if (idHotel) {
        query += `?idHotel=${idHotel}`
      }

      const response = await api.get<FlujoDelDia>(query)
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

  /**
   * Obtener una reserva pendiente por ID
   */
  const obtenerPendientePorId = (idReserva: number) => {
    const enCheckin = pendientesCheckin.value.find((r) => r.id === idReserva)
    if (enCheckin) return enCheckin

    const enCheckout = pendientesCheckout.value.find((r) => r.id === idReserva)
    if (enCheckout) return enCheckout

    return null
  }

  return {
    // State
    pendientesCheckin,
    pendientesCheckout,
    flujoDelDia,
    loadingPendientes,
    loadingOperacion,
    loadingFlujo,
    errorMessage,

    // Computed
    cantidadPendientesCheckin,
    cantidadPendientesCheckout,
    totalPendientes,

    // Methods
    obtenerPendientes,
    validarCheckin,
    validarCheckout,
    confirmarCheckin,
    confirmarCheckout,
    obtenerFlujoDelDia,
    obtenerPendientePorId
  }
}
