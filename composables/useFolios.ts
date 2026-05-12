import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type {
  Folio,
  EstadoFolio,
  CreateFolioDto,
  AgregarCargoDto,
  CobrarFolioDto,
  CobrarFolioMixtoDto,
  ResumenFolio,
  RespuestaCobro,
  DesgloseCalculos
} from '~/types/folio'
import { useApi } from './useApi'
import { useNotification } from './useNotification'

export const useFolios = () => {
  const api = useApi()
  const { success, error } = useNotification()

  // Caché de medios de pago: nombre → ID
  const medioPagoCache = ref<Record<string, number>>({})
  const medioPagoCacheLoaded = ref(false)

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
      idFactura: raw?.idFactura ? Number(raw.idFactura) : undefined,
      numeroFactura: raw?.numeroFactura || undefined,
      nombreCliente: raw?.nombreCliente || raw?.reserva?.nombreCliente || undefined,
      cedulaCliente: raw?.cedulaCliente || raw?.reserva?.cedulaCliente || undefined,
      emailCliente: raw?.emailCliente || raw?.reserva?.emailCliente || undefined,
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
  const buscandoCedula = ref(false)

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
   * Obtener medios de pago del servidor (caché)
   */
  const cargarMediosPago = async () => {
    if (medioPagoCacheLoaded.value && Object.keys(medioPagoCache.value).length > 0) {
      return medioPagoCache.value
    }

    try {
      const response = await api.get<any[]>('/medios-pago')
      medioPagoCache.value = {}
      
      // Mapear nombre → id
      if (response && Array.isArray(response)) {
        response.forEach((medio: any) => {
          if (medio.nombre) {
            medioPagoCache.value[medio.nombre.toUpperCase()] = medio.id
          }
        })
      }
      
      medioPagoCacheLoaded.value = true
      return medioPagoCache.value
    } catch (err: any) {
      console.warn('No se pudieron obtener medios de pago, usando defaults:', err.message)
      
      // Fallback a valores por defecto si el servidor falla
      medioPagoCache.value = {
        'EFECTIVO': 1,
        'TARJETA': 2,
        'TRANSFERENCIA': 3,
        'CHEQUE': 4,
        'OTRO': 5,
      }
      medioPagoCacheLoaded.value = true
      return medioPagoCache.value
    }
  }

  /**
   * Cobrar folio (registra pago y cierra folio)
   * Actualizado para usar el nuevo DTO con montoCobrar e idMedioPago
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
      // Obtener mapping de medios de pago
      const medioPagoMap = await cargarMediosPago()
      const idMedioPago = medioPagoMap[medioPago.toUpperCase()] || medioPagoMap['EFECTIVO'] || 1
      const totalFolio = Number(folioActual.value?.total || 0)
      
      if (montoRecibido < totalFolio) {
        error(`Monto insuficiente. Se requieren $${totalFolio.toLocaleString('es-CO')}, se recibió $${montoRecibido.toLocaleString('es-CO')}`)
        loadingOperacion.value = false
        return
      }

      // Nuevo DTO según backend
      const dto: CobrarFolioDto = {
        idHabitacion,
        idMedioPago,
        montoCobrar: totalFolio,
        montoRecibido,
        referenciaPago: referencia || undefined,
      }

      const response = await api.post<any>(
        `/folios/${idHabitacion}/cobrar`,
        dto
      )

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
   * Obtener folio por cedula del cliente.
   */
  const obtenerFolioPorCedula = async (cedulaCliente: string) => {
    const cedula = String(cedulaCliente || '').trim()

    if (!cedula) {
      folioActual.value = null
      errorMessage.value = 'Ingresa la cedula del cliente'
      return null
    }

    loadingFolio.value = true
    buscandoCedula.value = true
    errorMessage.value = ''

    try {
      const response = await api.get<any>(`/folios/cedula/${encodeURIComponent(cedula)}`)
      const folioNormalizado = normalizarFolio(response)
      folioActual.value = folioNormalizado
      return folioNormalizado as unknown as ResumenFolio
    } catch (err: any) {
      folioActual.value = null
      const errorMsg = err?.message || 'No hay folio activo para esta cedula'
      errorMessage.value = errorMsg
      return null
    } finally {
      loadingFolio.value = false
      buscandoCedula.value = false
    }
  }

  /**
   * Cobrar folio con varias lineas/metodos de pago.
   */
  const cobrarFolioMixto = async (
    idHabitacion: number,
    dto: CobrarFolioMixtoDto,
  ) => {
    loadingOperacion.value = true
    errorMessage.value = ''

    try {
      const response = await api.post<any>(
        `/folios/${idHabitacion}/cobrar-mixto`,
        dto,
      )

      const totalRecibido = Array.isArray(response?.pago?.lineas)
        ? response.pago.lineas.reduce((sum: number, linea: any) => {
            return sum + Number(linea.montoRecibido ?? linea.monto ?? 0)
          }, 0)
        : dto.pagos.reduce((sum, linea) => sum + Number(linea.montoRecibido ?? linea.montoCobrar ?? 0), 0)
      const totalCambio = Number(response?.pago?.vuelto || 0)

      const folioNormalizado = normalizarFolio(response?.folio, {
        montoRecibido: totalRecibido,
        medioPago: 'OTRO' as any,
        vuelto: totalCambio,
        fechaPago: new Date().toISOString(),
      })

      folioActual.value = folioNormalizado
      success(`Pago mixto registrado. Cambio total: $${totalCambio.toLocaleString('es-CO')}`)

      return {
        folio: folioNormalizado,
        transaccion: {
          montoRecibido: totalRecibido,
          totalACobrar: folioNormalizado.total,
          vuelto: totalCambio,
          medioPago: 'OTRO' as any,
          lineas: response?.pago?.lineas || [],
          timestamp: new Date().toISOString(),
        },
        factura: response?.factura || undefined,
      } as RespuestaCobro
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al cobrar folio con pago mixto'
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
    buscandoCedula,
    
    // Computed
    saldoPendiente,
    puedeSerCerrado,
    puedeSerCobrado,
    
    // Methods
    crearFolio,
    obtenerFolio,
    obtenerFolioPorCedula,
    agregarCargo,
    eliminarCargo,
    cerrarFolio,
    cobrarFolio,
    cobrarFolioMixto,
    cargarMediosPago,
    obtenerHistorial,
    limpiarFolioActual
  }
}
