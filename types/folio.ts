/**
 * Estado de un folio en su ciclo de vida
 */
export type EstadoFolio = 'ABIERTO' | 'CERRADO' | 'PAGADO' | 'CANCELADO'

/**
 * Tipo de cargo que se puede agregar al folio
 */
export type TipoCargo = 'CONSUMO' | 'SERVICIO' | 'ADICIONAL' | 'DESCUENTO' | 'OTRO'

/**
 * Método de pago disponible
 */
export type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'CHEQUE' | 'OTRO'

/**
 * Un cargo individual en el folio (item de consumo)
 */
export interface Cargo {
  id: string
  descripcion: string
  monto: number
  cantidad?: number
  precioUnitario?: number
  tipo: TipoCargo
  usuarioRegistro: string
  fechaRegistro: string
  referencia?: string
  categoria?: string
  automatico?: boolean
  idServicio?: number
  notes?: string
}

/**
 * Desglose de cálculos en el folio
 */
export interface DesgloseCalculos {
  subtotal: number
  porcentajeIva?: number
  montoIva?: number
  porcentajeInc?: number
  montoInc?: number
  descuentoTotal?: number
  totalAcobrar: number
}

/**
 * Folio completo con todos los campos
 */
export interface Folio {
  id: number
  idHabitacion: number
  numeroHabitacion: string
  idReserva?: number
  idCliente?: number
  idFactura?: number
  numeroFactura?: string
  nombreCliente?: string
  cedulaCliente?: string
  emailCliente?: string
  estado: EstadoFolio
  fechaApertura: string
  fechaCierre?: string
  cargos: Cargo[]
  subtotal: number
  montoIva: number
  montoInc: number
  descuentoTotal?: number
  total: number
  saldo?: number
  
  // Pago
  pagado: boolean
  montoRecibido?: number
  medioPago?: MetodoPago
  fechaPago?: string
  vuelto?: number
  
  // Notas
  observaciones?: string
  
  // Auditoría
  createdAt?: string
  updatedAt?: string
  usuarioApertura?: string
  usuarioCierre?: string
  usuarioPago?: string
}

/**
 * DTO para crear un folio
 */
export interface CreateFolioDto {
  idHabitacion: number
  idReserva?: number
  idCliente?: number
  usuarioApertura?: string
}

/**
 * DTO para agregar un cargo al folio
 */
export interface AgregarCargoDto {
  descripcion: string
  monto: number
  cantidad?: number
  tipo: TipoCargo
  idServicio?: number
  referencia?: string
}

/**
 * DTO para eliminar un cargo
 */
export interface EliminarCargoDto {
  idCargo: string
  motivo?: string
}

/**
 * DTO para cerrar folio
 */
export interface CerrarFolioDto {
  observaciones?: string
  usuarioCierre?: string
}

/**
 * DTO para pagar folio
 */
export interface CobrarFolioDto {
  idHabitacion: number
  idMedioPago: number
  montoCobrar: number
  montoRecibido?: number
  referenciaPago?: string
  observacionesCobro?: string
  cobrador?: string
}

export interface MedioPagoCatalogo {
  id: number
  nombre: string
  descripcion?: string
  requiereReferencia?: boolean
}

export interface CobrarFolioMixtoLineaDto {
  idMedioPago: number
  montoCobrar: number
  montoRecibido?: number
  referenciaPago?: string
  observaciones?: string
}

export interface CobrarFolioMixtoDto {
  idHabitacion: number
  pagos: CobrarFolioMixtoLineaDto[]
  observacionesCobro?: string
  cobrador?: string
}

/**
 * Interface básica de Factura para la respuesta de pago
 */
export interface FacturaResumen {
  id: number
  numeroFactura: string
  uuid?: string
  idHotel?: number
  subtotal: number
  montoIva: number
  montoInc: number
  porcentajeIva?: number
  porcentajeInc?: number
  total: number
  desgloseImpuestos?: Record<string, Record<string, number>>
  desgloseMonetario?: Record<string, any>
  detalles?: Array<{
    id: number
    descripcion: string
    cantidad: number
    precioUnitario: number
    subtotal: number
    montoIva?: number
    montoInc?: number
    total: number
    categoriaNombre?: string
  }>
  xmlDian?: string
}

/**
 * Respuesta de pago
 */
export interface RespuestaCobro {
  folio: Folio
  transaccion: {
    montoRecibido: number
    totalACobrar: number
    vuelto: number
    medioPago: MetodoPago
    lineas?: Array<{
      idMedioPago: number
      medioPago?: string
      monto: number
      montoRecibido?: number
      cambioDevuelto?: number
      referencia?: string
    }>
    timestamp: string
  }
  factura?: FacturaResumen
}

/**
 * Resumen de folio para visualización rápida
 */
export interface ResumenFolio {
  id: number
  idHabitacion: number
  numeroHabitacion: string
  idFactura?: number
  numeroFactura?: string
  nombreCliente?: string
  cedulaCliente?: string
  estado: EstadoFolio
  subtotal: number
  iva: number
  inc: number
  total: number
  saldo: number
  cantidadCargos: number
  pagado: boolean
}
