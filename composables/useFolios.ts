import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type {
  Folio,
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

  const mapEstadoFolio = (estado?: string): EstadoFolio => {
    const normalized = String(estado || '').toUpperCase()

    if (normalized === 'ACTIVO' || normalized === 'ABIERTO') return 'ABIERTO'
    if (normalized === 'CERRADO') return 'CERRADO'
    if (normalized === 'PAGADO') return 'PAGADO'
    return 'CANCELADO'
  }

  const mapTipoCargo = (categoria?: string) => {
    const normalized = String(categoria || '').toUpperCase()

    if (normalized === 'ALOJAMIENTO') return 'SERVICIO'
    if (normalized === 'CAFETERIA' || normalized === 'MINIBAR') return 'CONSUMO'
    if (normalized === 'LAVANDERIA' || normalized === 'SPA' || normalized === 'ROOM_SERVICE') {
      return 'SERVICIO'
    }
    if (normalized === 'ADICIONAL') return 'ADICIONAL'
    if (normalized === 'SERVICIO' || normalized === 'CONSUMO') return 'SERVICIO'
    return 'OTRO'
  }

  const normalizarCargo = (cargo: any) => ({
    id: String(cargo?.idCargo || cargo?.id || `${cargo?.descripcion || 'cargo'}-${Date.now()}`),
    descripcion: cargo?.descripcion || 'Cargo',
    monto: Number(cargo?.monto || 0),
    cantidad: Number(cargo?.cantidad || 1),
    precioUnitario: cargo?.precioUnitario !== undefined ? Number(cargo.precioUnitario) : undefined,
    tipo: mapTipoCargo(cargo?.categoria || cargo?.tipo),
    usuarioRegistro: cargo?.agregadoPor || cargo?.usuarioRegistro || 'Sistema',
    fechaRegistro: cargo?.fechaAñadido || cargo?.fechaRegistro || new Date().toISOString(),
    referencia: cargo?.referencia,
    categoria: cargo?.categoria,
    automatico: Boolean(cargo?.automatico),
  })

  const normalizarFolio = (raw: any, extras?: Partial<Folio>): Folio => {
    const estado = mapEstadoFolio(raw?.estadoPago || raw?.estado)
    const total = Number(raw?.total || 0)
    const montoRecibido = Number(raw?.montoRecibido || extras?.montoRecibido || 0)
    const pagado = estado === 'PAGADO' || Boolean(raw?.pagado)

    return {
      id: Number(raw?.id || 0),
      idHabitacion: Number(raw?.idHabitacion || 0),
      numeroHabitacion: String(
        raw?.numeroHabitacion || raw?.habitacion?.numeroHabitacion || raw?.idHabitacion || ''
      ),
      idReserva: raw?.idReserva ? Number(raw.idReserva) : undefined,
      idCliente: raw?.idCliente ? Number(raw.idCliente) : undefined,
      nombreCliente: raw?.nombreCliente || raw?.reserva?.nombreCliente || undefined,
      estado,
      fechaApertura: String(raw?.fechaApertura || new Date().toISOString()),
      fechaCierre: raw?.fechaCierre ? String(raw.fechaCierre) : undefined,
      cargos: Array.isArray(raw?.cargos) ? raw.cargos.map(normalizarCargo) : [],
      subtotal: Number(raw?.subtotal || 0),
      montoIva: Number(raw?.montoIva || raw?.iva || 0),
      montoInc: Number(raw?.montoInc || raw?.inc || 0),
      descuentoTotal: raw?.descuentoTotal ? Number(raw.descuentoTotal) : undefined,
      total,
      saldo: pagado ? 0 : Math.max(0, total - montoRecibido),
      pagado,
      montoRecibido: montoRecibido || undefined,
      medioPago: (extras?.medioPago || raw?.medioPago) as any,
      fechaPago: (extras?.fechaPago as string | undefined) || raw?.fechaPago || raw?.fechaCierre,
      vuelto: extras?.vuelto,
      observaciones: raw?.observaciones,
      createdAt: raw?.createdAt,
      updatedAt: raw?.updatedAt,
      usuarioApertura: raw?.usuarioApertura,
    }
  }

  const construirPayloadCargo = (cargo: AgregarCargoDto) => {
    const cantidad = cargo.cantidad && cargo.cantidad > 0 ? cargo.cantidad : 1
    const montoTotal = Math.abs(Number(cargo.monto || 0))
    const precioUnitario = montoTotal / cantidad

    const categoriaMap: Record<string, 'SERVICIO' | 'ADICIONAL' | 'INCIDENCIA' | 'OTRO'> = {
      CONSUMO: 'SERVICIO',
      SERVICIO: 'SERVICIO',
      ADICIONAL: 'ADICIONAL',
      DESCUENTO: 'OTRO',
      OTRO: 'OTRO',
    }

    return {
      descripcion: cargo.descripcion,
      cantidad,
      precioUnitario,
      categoria: categoriaMap[String(cargo.tipo || '').toUpperCase()] || 'OTRO',
    }
  }

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
      }

      const response = await api.post<any>('/folios', dto)
      const folioNormalizado = normalizarFolio(response)
      folioActual.value = folioNormalizado
      success('Folio abierto correctamente')
      return folioNormalizado
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
      const response = await api.get<any>(`/folios/${idHabitacion}`)
      const folioNormalizado = normalizarFolio(response)
      folioActual.value = folioNormalizado
      return folioNormalizado as unknown as ResumenFolio
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
      const response = await api.post<any>(
        `/folios/${idHabitacion}/cargos`,
        construirPayloadCargo(cargo)
      )
      const folioNormalizado = normalizarFolio(response)
      folioActual.value = folioNormalizado
      success(`Cargo agregado: ${cargo.descripcion}`)
      return folioNormalizado
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
      const response = await api.del<any>(
        `/folios/${idHabitacion}/cargos/${idCargo}`
      )
      const folioNormalizado = normalizarFolio(response)
      folioActual.value = folioNormalizado
      success('Cargo eliminado correctamente')
      return folioNormalizado
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
      const response = await api.put<any>(
        `/folios/${idHabitacion}/cerrar`,
        { observaciones }
      )
      const folioNormalizado = normalizarFolio(response)
      folioActual.value = folioNormalizado
      success('Folio cerrado correctamente')
      return folioNormalizado
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
    medioPago: string,
    referencia?: string
  ) => {
    loadingOperacion.value = true
    errorMessage.value = ''

    if (!montoRecibido || montoRecibido <= 0) {
      error('El monto recibido debe ser mayor a 0')
      loadingOperacion.value = false
      return
    }

    try {
      const dto = {
        monto: montoRecibido,
        referencia,
        concepto: `Pago de folio habitación ${idHabitacion} por ${medioPago}`,
      }

      const response = await api.post<any>(
        `/folios/${idHabitacion}/cobrar`,
        dto
      )

      const totalFolio = Number(response?.folio?.total || folioActual.value?.total || 0)
      const vuelto = Number(response?.pago?.vuelto ?? Math.max(0, montoRecibido - totalFolio))
      const folioNormalizado = normalizarFolio(response?.folio, {
        montoRecibido,
        medioPago: medioPago as any,
        vuelto,
        fechaPago: new Date().toISOString(),
      })

      folioActual.value = folioNormalizado
      success(`Cobro registrado: ${vuelto >= 0 ? 'Cambio: $' + vuelto.toLocaleString('es-CO') : 'Sin cambio'}`)

      return {
        folio: folioNormalizado,
        transaccion: {
          montoRecibido,
          totalACobrar: totalFolio,
          vuelto,
          medioPago,
          timestamp: new Date().toISOString(),
        },
        factura: response?.factura || undefined,
      } as RespuestaCobro
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
      const estadoBackendMap: Record<EstadoFolio, string> = {
        ABIERTO: 'ACTIVO',
        CERRADO: 'CERRADO',
        PAGADO: 'PAGADO',
        CANCELADO: 'CANCELADO',
      }

      if (filtros?.idHotel) params.append('idHotel', filtros.idHotel.toString())
      if (filtros?.estado) params.append('estado', estadoBackendMap[filtros.estado] || filtros.estado)
      if (filtros?.fechaDesde) params.append('fechaDesde', filtros.fechaDesde)
      if (filtros?.fechaHasta) params.append('fechaHasta', filtros.fechaHasta)

      if (params.toString()) {
        query += `?${params.toString()}`
      }

      const response = await api.get<any[]>(query)
      const historialNormalizado = Array.isArray(response)
        ? response.map((folio) => normalizarFolio(folio))
        : []

      historialFolios.value = historialNormalizado
      return historialNormalizado
    } catch (err: any) {
      const statusCode = Number(err?.statusCode || err?.status || err?.response?.status || 0)

      if (statusCode === 404) {
        historialFolios.value = []
        return []
      }

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
