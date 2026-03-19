/**
 * Estados posibles de una reserva
 */
export type EstadoReserva = 'reservada' | 'confirmada' | 'cancelada' | 'rechazada' | 'completada' | 'checkedin'

/**
 * Origen de la reserva
 */
export type OrigenReserva = 'web' | 'mostrador' | 'telefono' | 'email' | 'agencia'

/**
 * Entidad Reserva completa
 */
export interface Reserva {
  id: number
  numeroReserva?: string
  idCliente: number
  nombreCliente: string
  cedulaCliente?: string
  emailCliente?: string
  idHotel: number
  idTipoHabitacion?: number
  idHabitacion?: number
  numeroHabitacion?: string
  tipoHabitacion?: {
    id: number
    nombre: string
    capacidad: number
  }
  checkinPrevisto: string
  checkoutPrevisto: string
  checkinReal?: string
  checkoutReal?: string
  numeroHuespedes: number
  estadoReserva: EstadoReserva
  origenReserva: OrigenReserva
  codigoConfirmacion: string
  precioNocheSnapshot?: number
  observaciones?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
}

/**
 * DTO para crear una reserva
 */
export interface CrearReservaDto {
  idCliente: number
  idTipoHabitacion: number
  idHabitacion?: number
  checkinPrevisto: string
  checkoutPrevisto: string
  numeroHuespedes: number
  origenReserva: OrigenReserva
  observaciones?: string
}

/**
 * DTO para actualizar una reserva
 */
export interface ActualizarReservaDto {
  idHabitacion?: number
  checkinPrevisto?: string
  checkoutPrevisto?: string
  numeroHuespedes?: number
  observaciones?: string
}

/**
 * DTO para cancelar una reserva
 */
export interface CancelarReservaDto {
  motivo: string
  reembolso?: boolean
  motivo_reembolso?: string
}

/**
 * Respuesta al consultar disponibilidad
 */
export interface DisponibilidadResponse {
  disponibles: Array<{
    id: number
    numero: string
    tipoHabitacion: string
    capacidad: number
    precio: number
    amenidades: string[]
  }>
  noDisponibles: Array<{
    id: number
    numero: string
    razon: string
  }>
  total: number
}

/**
 * Filtros para listar reservas
 */
export interface FiltrosReserva {
  estado?: EstadoReserva
  idHotel?: number
  fechaDesde?: string
  fechaHasta?: string
  idCliente?: number
  numeroHabitacion?: string
  ordenarPor?: 'checkin' | 'checkout' | 'creacion'
  orden?: 'asc' | 'desc'
}

/**
 * Resumen de disponibilidad para un período
 */
export interface DisponibilidadPeriodo {
  idTipoHabitacion: number
  nombre: string
  capacidad: number
  precio: number
  disponible: number
  ocupada: number
  pendiente: number
  porcentajeOcupacion: number
}
