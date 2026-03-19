import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type {
  Folio,
  Cargo,
  EstadoFolio,
  CreateFolioDto,
  AgregarCargoDto,
  CobrarFolioDto,
  ResumenFolio,
  RespuestaCobro,
  DesgloseCalculos
} from '~/types/folio'
import { useApi } from './useApi'
import { useNotification } from './useNotification'

export const useFolios = () => {
  const api = useApi()
  const { success, error } = useNotification()

  // State
  const folioActual = ref<Folio | null>(null)
  const historialFolios = ref<Folio[]>([])
  const loadingFolio = ref(false)
  const loadingOperacion = ref(false)
  const loadingHistorial = ref(false)
  const errorMessage = ref('')
  const buscandoHabitacion = ref(false)

  /**
   * Crear un nuevo folio (abrir caja para una habitación)
   */
  const crearFolio = async (
    idHabitacion: number,
    idReserva?: number,
    usuarioId?: string
  ) => {
    loadingOperacion.value = true
    errorMessage.value = ''

    try {
      const dto: CreateFolioDto = {
        idHabitacion,
        idReserva,
        usuarioApertura: usuarioId || 'sistema'
      }

      const response = await api.post<Folio>('/folios', dto)
      folioActual.value = response
      success('Folio abierto correctamente')
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al crear folio'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loadingOperacion.value = false
    }
  }

  /**
   * Obtener folio actual de una habitación
   */
  const obtenerFolio = async (idHabitacion: number) => {
    loadingFolio.value = true
    errorMessage.value = ''

    try {
      const response = await api.get<ResumenFolio>(`/folios/${idHabitacion}`)
      
      // Si hay folio abierto, intenta obtener completo
      if (response?.id) {
        const folioCompleto = await api.get<Folio>(`/folios/${idHabitacion}`)
        folioActual.value = folioCompleto
      }
      
      return response
    } catch (err: any) {
      // Si no hay folio, se limpia el actual
      folioActual.value = null
      const errorMsg = err?.message || 'No hay folio activo para esta habitación'
      errorMessage.value = errorMsg
      // No mostrar error en notificación - es esperado que no haya folio
      return null
    } finally {
      loadingFolio.value = false
    }
  }

  /**
   * Agregar un cargo al folio actual
   */
  const agregarCargo = async (
    idHabitacion: number,
    cargo: AgregarCargoDto
  ) => {
    loadingOperacion.value = true
    errorMessage.value = ''

    try {
      const response = await api.post<Folio>(
        `/folios/${idHabitacion}/cargos`,
        cargo
      )
      folioActual.value = response
      success(`Cargo agregado: ${cargo.descripcion}`)
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al agregar cargo'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loadingOperacion.value = false
    }
  }

  /**
   * Eliminar un cargo del folio
   */
  const eliminarCargo = async (
    idHabitacion: number,
    idCargo: string,
    motivo?: string
  ) => {
    loadingOperacion.value = true
    errorMessage.value = ''

    try {
      const response = await api.del<Folio>(
        `/folios/${idHabitacion}/cargos/${idCargo}`
      )
      folioActual.value = response
      success('Cargo eliminado correctamente')
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al eliminar cargo'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loadingOperacion.value = false
    }
  }

  /**
   * Cerrar folio (prepara para cobro sin confirmar pago aún)
   */
  const cerrarFolio = async (
    idHabitacion: number,
    observaciones?: string
  ) => {
    loadingOperacion.value = true
    errorMessage.value = ''

    try {
      const response = await api.put<Folio>(
        `/folios/${idHabitacion}/cerrar`,
        { observaciones }
      )
      folioActual.value = response
      success('Folio cerrado correctamente')
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al cerrar folio'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loadingOperacion.value = false
    }
  }

  /**
   * Cobrar folio (registra pago y cierra folio)
   */
  const cobrarFolio = async (
    idHabitacion: number,
    montoRecibido: number,
    medioPago: string
  ) => {
    loadingOperacion.value = true
    errorMessage.value = ''

    if (!montoRecibido || montoRecibido <= 0) {
      error('El monto recibido debe ser mayor a 0')
      loadingOperacion.value = false
      return
    }

    try {
      const dto: CobrarFolioDto = {
        montoRecibido,
        medioPago: medioPago as any
      }

      const response = await api.post<RespuestaCobro>(
        `/folios/${idHabitacion}/cobrar`,
        dto
      )

      folioActual.value = response.folio
      success(`Cobro registrado: ${response.transaccion.vuelto >= 0 ? 'Cambio: $' + response.transaccion.vuelto : 'Sin cambio'}`)
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al cobrar folio'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loadingOperacion.value = false
    }
  }

  /**
   * Obtener historial de folios (folios cerrados/pagados del día)
   */
  const obtenerHistorial = async (filtros?: {
    idHotel?: number
    estado?: EstadoFolio
    fechaDesde?: string
    fechaHasta?: string
  }) => {
    loadingHistorial.value = true
    errorMessage.value = ''

    try {
      let query = '/folios/historial'
      const params = new URLSearchParams()

      if (filtros?.idHotel) params.append('idHotel', filtros.idHotel.toString())
      if (filtros?.estado) params.append('estado', filtros.estado)
      if (filtros?.fechaDesde) params.append('fechaDesde', filtros.fechaDesde)
      if (filtros?.fechaHasta) params.append('fechaHasta', filtros.fechaHasta)

      if (params.toString()) {
        query += `?${params.toString()}`
      }

      const response = await api.get<Folio[]>(query)
      historialFolios.value = response
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al obtener historial'
      errorMessage.value = errorMsg
      error(errorMsg)
      return []
    } finally {
      loadingHistorial.value = false
    }
  }

  /**
   * Computed: saldo restante (lo que falta por cobrar)
   */
  const saldoPendiente = computed(() => {
    if (!folioActual.value) return 0
    const pagado = folioActual.value.montoRecibido || 0
    return Math.max(0, folioActual.value.total - pagado)
  })

  /**
   * Computed: si folio está listo para cerrar
   */
  const puedeSerCerrado = computed(() => {
    if (!folioActual.value) return false
    return folioActual.value.estado === 'ABIERTO' && folioActual.value.cargos.length > 0
  })

  /**
   * Computed: si folio está listo para cobrar
   */
  const puedeSerCobrado = computed(() => {
    if (!folioActual.value) return false
    return folioActual.value.estado === 'CERRADO' && !folioActual.value.pagado
  })

  /**
   * Limpiar folio actual (al cerrar caja o cambiar habitación buscada)
   */
  const limpiarFolioActual = () => {
    folioActual.value = null
    errorMessage.value = ''
  }

  return {
    // State
    folioActual,
    historialFolios,
    loadingFolio,
    loadingOperacion,
    loadingHistorial,
    errorMessage,
    buscandoHabitacion,
    
    // Computed
    saldoPendiente,
    puedeSerCerrado,
    puedeSerCobrado,
    
    // Methods
    crearFolio,
    obtenerFolio,
    agregarCargo,
    eliminarCargo,
    cerrarFolio,
    cobrarFolio,
    obtenerHistorial,
    limpiarFolioActual
  }
}
