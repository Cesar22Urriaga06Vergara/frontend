/**
 * Estado de una factura en su ciclo de vida
 */
export type EstadoFactura = 'BORRADOR' | 'EDITABLE' | 'EMITIDA' | 'PAGADA' | 'ANULADA'

/**
 * Desglose de impuestos por categoría
 */
export interface DesgloseImpuestosItem {
  categoria: string
  subtotal: number
  iva?: number
  inc?: number
  otros?: number
  total: number
}

/**
 * Desglose monetario agrupado por categoría
 */
export interface DesgloseMonetario {
  [categoria: string]: {
    subtotal: number
    iva?: number
    inc?: number
    otros?: number
    total: number
  }
}

/**
 * Detalle de una línea en la factura
 */
export interface DetalleFactura {
  id: number
  idFactura?: number
  tipoConcepto: 'habitacion' | 'servicio' | 'servicio_alcoholico' | 'descuento' | string
  descripcion: string
  cantidad: number
  precioUnitario: number
  subtotal: number
  descuento: number
  total: number
  montoIva?: number
  porcentajeInc?: number
  montoInc?: number
  categoriaServiciosId?: number
  categoriaNombre?: string
  idReferencia?: number
}

/**
 * Factura completa con todos los campos
 */
export interface Factura {
  id: number
  numeroFactura: string
  uuid: string
  idReserva: number
  idCliente: number
  nombreCliente: string
  cedulaCliente: string
  emailCliente: string
  idHotel: number
  idResolucionFacturacion?: number | null
  prefijoFactura?: string | null
  consecutivoFactura?: number | null
  resolucionNumero?: string | null
  subtotal: number
  porcentajeIva: number
  montoIva: number
  porcentajeInc?: number
  montoInc: number
  total: number
  
  // FASE 5: Nuevo estado máquina
  estadoFactura: EstadoFactura
  
  // FASE 5: Desglose de impuestos
  desgloseImpuestos?: DesgloseMonetario | null
  desgloseMonetario?: DesgloseMonetario | null
  
  // Estado antiguo (backward compat)
  estado: string
  
  // Fechas
  fechaEmision?: string
  fechaVencimiento?: string
  createdAt?: string
  updatedAt?: string
  
  // Datos
  jsonData?: string
  xmlData?: string
  observaciones?: string
  cufe?: string
  
  // Relaciones
  detalles?: DetalleFactura[]
  pagos?: PagoFactura[]
}

/**
 * Un pago registrado para una factura
 */
export interface PagoFactura {
  id: number
  idFactura: number
  idMedioPago?: number
  monto: number
  montoRecibido?: number
  cambioDevuelto?: number
  referenciaPago?: string
  estado: 'pendiente' | 'completado' | 'fallido' | 'devuelto'
  metodoPago?: string
  medioPago?: {
    id: number
    nombre: string
    descripcion?: string
    requiereReferencia?: boolean
  }
  fechaPago?: string
}

export interface PagoMixtoLineaPayload {
  idMedioPago: number
  montoCobrar: number
  montoRecibido?: number
  referenciaPago?: string
  observaciones?: string
}

export interface PagoMixtoPayload {
  idFactura: number
  pagos: PagoMixtoLineaPayload[]
  observaciones?: string
}

/**
 * Cambio en la auditoría de una factura
 */
export interface FacturaCambio {
  id: number
  idFactura: number
  usuarioId?: number
  usuarioEmail?: string
  tipoCambio: 'CREACIÓN' | 'ACTUALIZACIÓN' | 'CAMBIO_ESTADO'
  descripcion: string
  valorAnterior?: any
  valorNuevo?: any
  fecha: string
  fechaFormateada?: string
}

/**
 * Respuesta del endpoint historial
 */
export interface HistorialCambiosResponse {
  cambios: FacturaCambio[]
  total: number
  resumen?: {
    estadoActual: EstadoFactura
    ultimoCambio?: string
    ultimaCambioFecha?: string
  }
}

export interface CheckoutResponse {
  reserva: any
  factura: Factura
}

export type FormatoTicketPos = '58mm' | '80mm'

export interface FacturaPosTicket {
  formato: FormatoTicketPos
  widthMm: number
  generadoEn: string
  hotel: {
    id: number
    nombre: string
    razonSocial?: string
    nit?: string
    direccion?: string
    ciudad?: string
    telefono?: string
    email?: string
    logoUrl?: string | null
    resolucionDian?: string | null
    prefijoFacturacion?: string | null
    pieFactura?: string | null
    moneda?: string
  }
  factura: {
    id: number
    numeroFactura: string
    estadoFactura: EstadoFactura
    fechaEmision?: string
    fechaCreacion?: string
    cufe?: string | null
    uuid?: string | null
    idResolucionFacturacion?: number | null
    prefijoFactura?: string | null
    consecutivoFactura?: number | null
    resolucionNumero?: string | null
  }
  recepcionista?: {
    nombre?: string
    email?: string
  }
  estancia: {
    idReserva: number
    habitacion?: string
    huesped: string
    documento?: string
    email?: string
  }
  detalles: Array<{
    descripcion: string
    cantidad: number
    precioUnitario: number
    subtotal: number
    descuento: number
    iva?: number
    inc?: number
    total: number
  }>
  totales: {
    subtotal: number
    descuento: number
    iva: number
    inc: number
    total: number
    pagado: number
    saldo: number
  }
  pagos: Array<{
    metodo: string
    monto: number
    estado: string
    fecha?: string
  }>
  qrData?: string | null
}
