import { ref } from 'vue'
import type { Ref } from 'vue'
import type { 
  Factura, 
  FacturaCambio, 
  HistorialCambiosResponse,
  EstadoFactura 
} from '~/types/factura'
import { useApi } from './useApi'
import { useNotification } from './useNotification'

export const useFacturas = () => {
  const api = useApi()
  const { success, error } = useNotification()

  // State
  const facturas = ref<Factura[]>([])
  const facturaActual = ref<Factura | null>(null)
  const historialCambios = ref<FacturaCambio[]>([])
  const loadingFacturas = ref(false)
  const loadingDetalle = ref(false)
  const loadingHistorial = ref(false)
  const loadingOperacion = ref(false)
  const errorMessage = ref('')

  /**
   * Obtener todas las facturas con filtros opcionales
   */
  const obtenerTodas = async (filtros?: {
    idHotel?: number
    estado?: string
    idCliente?: number
  }) => {
    loadingFacturas.value = true
    errorMessage.value = ''

    try {
      let query = '/facturas'
      const params = new URLSearchParams()

      if (filtros?.idHotel) params.append('idHotel', filtros.idHotel.toString())
      if (filtros?.estado) params.append('estado', filtros.estado)
      if (filtros?.idCliente) params.append('idCliente', filtros.idCliente.toString())

      if (params.toString()) {
        query += `?${params.toString()}`
      }

      const response = await api.get<Factura[]>(query)
      facturas.value = response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al obtener facturas'
      errorMessage.value = errorMsg
      error(errorMsg)
    } finally {
      loadingFacturas.value = false
    }
  }

  /**
   * Obtener una factura por ID con detalles
   */
  const obtenerPorId = async (id: number) => {
    loadingDetalle.value = true
    errorMessage.value = ''

    try {
      const response = await api.get<Factura>(`/facturas/${id}`)
      facturaActual.value = response
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al obtener factura'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loadingDetalle.value = false
    }
  }

  /**
   * Emitir factura: BORRADOR → EMITIDA
   */
  const emitir = async (idFactura: number, usuarioId?: number) => {
    loadingOperacion.value = true
    errorMessage.value = ''

    try {
      const response = await api.patch<Factura>(
        `/facturas/${idFactura}/emitir`,
        { usuarioId }
      )
      facturaActual.value = response
      success('Factura emitida correctamente')
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al emitir factura'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loadingOperacion.value = false
    }
  }

  /**
   * Anular factura: → ANULADA
   */
  const anular = async (
    idFactura: number,
    motivo: string,
    usuarioId?: number
  ) => {
    loadingOperacion.value = true
    errorMessage.value = ''

    if (!motivo || motivo.trim().length === 0) {
      error('El motivo de anulación es obligatorio')
      loadingOperacion.value = false
      return
    }

    try {
      const response = await api.patch<Factura>(
        `/facturas/${idFactura}/anular`,
        { motivo, usuarioId }
      )
      facturaActual.value = response
      success('Factura anulada correctamente')
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al anular factura'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loadingOperacion.value = false
    }
  }

  /**
   * Marcar factura como pagada: EMITIDA → PAGADA
   */
  const marcarComoPagada = async (
    idFactura: number,
    fechaPago?: Date,
    usuarioId?: number
  ) => {
    loadingOperacion.value = true
    errorMessage.value = ''

    try {
      const response = await api.patch<Factura>(
        `/facturas/${idFactura}/marcar-pagada`,
        {
          fechaPago: fechaPago ? fechaPago.toISOString() : undefined,
          usuarioId
        }
      )
      facturaActual.value = response
      success('Factura pagada registrada correctamente')
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al marcar factura como pagada'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loadingOperacion.value = false
    }
  }

  /**
   * Obtener historial de cambios (auditoría) de una factura
   */
  const obtenerHistorial = async (idFactura: number) => {
    loadingHistorial.value = true
    errorMessage.value = ''

    try {
      const response = await api.get<HistorialCambiosResponse>(
        `/facturas/${idFactura}/historial-cambios`
      )
      historialCambios.value = response.cambios || []
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al obtener historial'
      errorMessage.value = errorMsg
      error(errorMsg)
      return { cambios: [], total: 0 }
    } finally {
      loadingHistorial.value = false
    }
  }

  /**
   * Validar si se puede hacer una transición de estado
   */
  const puedeTransicionar = (
    estadoActual: EstadoFactura,
    estadoNuevo: EstadoFactura
  ): boolean => {
    const transicionesPermitidas: Record<EstadoFactura, EstadoFactura[]> = {
      BORRADOR: ['EDITABLE', 'EMITIDA', 'ANULADA'],
      EDITABLE: ['EMITIDA', 'BORRADOR', 'ANULADA'],
      EMITIDA: ['PAGADA', 'ANULADA'],
      PAGADA: [],
      ANULADA: []
    }

    const permitidas = transicionesPermitidas[estadoActual] || []
    return permitidas.includes(estadoNuevo)
  }

  /**
   * Obtener color para estado según Vuetify
   */
  const getColorEstado = (estado: EstadoFactura): string => {
    switch (estado) {
      case 'BORRADOR':
        return 'warning'
      case 'EDITABLE':
        return 'info'
      case 'EMITIDA':
        return 'success'
      case 'PAGADA':
        return 'success'
      case 'ANULADA':
        return 'error'
      default:
        return 'default'
    }
  }

  /**
   * Obtener ícono según estado
   */
  const getIconoEstado = (estado: EstadoFactura): string => {
    switch (estado) {
      case 'BORRADOR':
        return 'mdi-file-document-outline'
      case 'EDITABLE':
        return 'mdi-file-document-edit'
      case 'EMITIDA':
        return 'mdi-check-circle'
      case 'PAGADA':
        return 'mdi-check-circle-outline'
      case 'ANULADA':
        return 'mdi-cancel'
      default:
        return 'mdi-file-document'
    }
  }

  /**
   * Obtener etiqueta en español según estado
   */
  const getEtiquetaEstado = (estado: EstadoFactura): string => {
    switch (estado) {
      case 'BORRADOR':
        return 'Borrador'
      case 'EDITABLE':
        return 'Editable'
      case 'EMITIDA':
        return 'Emitida'
      case 'PAGADA':
        return 'Pagada'
      case 'ANULADA':
        return 'Anulada'
      default:
        return 'Desconocido'
    }
  }

  return {
    // State
    facturas,
    facturaActual,
    historialCambios,
    loadingFacturas,
    loadingDetalle,
    loadingHistorial,
    loadingOperacion,
    errorMessage,

    // Métodos
    obtenerTodas,
    obtenerPorId,
    emitir,
    anular,
    marcarComoPagada,
    obtenerHistorial,
    puedeTransicionar,
    getColorEstado,
    getIconoEstado,
    getEtiquetaEstado
  }
}
