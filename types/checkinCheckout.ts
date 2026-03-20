/**
 * Estado de check-in/check-out en la reserva
 */
export type EstadoCheckinCheckout = 'PENDIENTE_CHECKIN' | 'CHECKIN_CONFIRMADO' | 'CHECKOUT_PENDIENTE' | 'CHECKOUT_CONFIRMADO'

export type TipoBloqueoCheckout = 'REQUIERE_COBRO' | 'SIN_FOLIO' | 'RESERVA_INVALIDA'

/**
 * Estado de limpieza de la habitación después del checkout
 */
export type EstadoLimpieza = 'LIMPIO' | 'SUCIO' | 'PENDIENTE_LIMPIEZA' | 'EN_LIMPIEZA'

/**
 * Datos de una reserva relevantes para check-in/check-out
 */
export interface ReservaParaCheckin {
  id: number
  numeroReserva: string
  idCliente: number
  estadoReservaOriginal?: string
  nombreCliente: string
  cedulaCliente: string
  idHabitacion: number
  numeroHabitacion: string
  tipoHabitacion: string
  checkinFecha: string
  checkoutFecha: string
  estado: 'pendiente' | 'confirmada' | 'checkedin' | 'completada' | 'cancelada'
  estadoCheckin: EstadoCheckinCheckout
  cantidadHuespedes: number
  tarifa: number
  montoTotal: number
  folioEstado?: 'ABIERTO' | 'CERRADO' | 'PAGADO' | 'NO_FOLIO'
  folioTotal?: number
  folioSaldo?: number
  folioPagado?: boolean
}

/**
 * Request para confirmar check-in
 */
export interface ConfirmarCheckinRequest {
  idReserva: number
  idHabitacion: number
  idCliente: number
  notasCheckin?: string
  horaCheckin?: string
}

/**
 * Response al confirmar check-in
 */
export interface ConfirmarCheckinResponse {
  reserva: ReservaParaCheckin
  folio: {
    id: number
    numeroHabitacion: string
    estado: 'ABIERTO'
    total: number
  }
  mensaje: string
  timestamp: string
}

/**
 * Request para confirmar checkout
 */
export interface ConfirmarCheckoutRequest {
  idReserva: number
  idHabitacion: number
  notasCheckout?: string
  estadoLimpieza: EstadoLimpieza
  horaCheckout?: string
}

/**
 * Response al confirmar checkout
 */
export interface FacturaCheckoutResumen {
  id: number
  numeroFactura: string
  total: number
  subtotal?: number
  montoIva?: number
  montoInc?: number
  estadoFactura?: string
  estado?: string
  fechaEmision?: string
}

export interface ConfirmarCheckoutResponse {
  reserva: any
  factura?: FacturaCheckoutResumen | null
  folio?: {
    id: number
    estado: 'PAGADO' | 'CERRADO'
    saldo: number
    pagado: boolean
  }
  habitacion?: {
    id: number
    numero: string
    estado: 'DISPONIBLE' | 'PENDIENTE_LIMPIEZA'
  }
  mensaje?: string
  timestamp?: string
}

/**
 * Resumen de pending de check-in/check-out
 */
export interface ResumenPendientes {
  pendientesCheckin: ReservaParaCheckin[]
  pendientesCheckout: ReservaParaCheckin[]
  totalPendientes: number
  timestamp: string
}

/**
 * Flujo de check-in/check-out del día
 */
export interface FlujoDelDia {
  checkinsRealizados: number
  checkoutsRealizados: number
  foliosCobrados: number
  foliosPendientes: number
  ingresoDelDia: number
  saldoPendiente: number
}

/**
 * Validación pre-checkin
 */
export interface ValidacionCheckin {
  esValido: boolean
  errores: string[]
  advertencias: string[]
  habitacionDisponible: boolean
  reservaActiva: boolean
  folioExistente: boolean
}

/**
 * Validación pre-checkout
 */
export interface ValidacionCheckout {
  esValido: boolean
  errores: string[]
  advertencias: string[]
  folioPagado: boolean
  puedeCheckout: boolean
  saldoRestante: number
  tipoBloqueo: TipoBloqueoCheckout | null
  folioEstado?: string
}
