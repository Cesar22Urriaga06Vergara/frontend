// types/api.ts

export interface ApiError {
  statusCode: number
  message: string | string[]
  error?: string
}

export interface ApiResponse<T = any> {
  message: string
  [key: string]: T | string | number | boolean | undefined
}
// Amenidad
export interface Amenidad {
  id: number
  nombre: string
  icono?: string
  categoria?: string
  descripcion?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateAmenidadDto {
  nombre: string
  icono?: string
  categoria?: string
  descripcion?: string
}

export interface UpdateAmenidadDto extends Partial<CreateAmenidadDto> {}

// Tipo de Habitación
export interface TipoHabitacion {
  id: number
  idHotel: number
  nombreTipo: string
  descripcion?: string
  capacidadPersonas: number
  precioBase?: number
  activo: boolean
  amenidades: Amenidad[]
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateTipoHabitacionDto {
  idHotel: number
  nombreTipo: string
  descripcion?: string
  capacidadPersonas: number
  precioBase?: number
  activo?: boolean
  amenidadesIds?: number[]
}

export interface UpdateTipoHabitacionDto extends Partial<CreateTipoHabitacionDto> {}

// Habitación
export interface Habitacion {
  id: number
  idHotel: number
  numeroHabitacion: string
  piso?: string
  estado?: string
  idTipoHabitacion: number
  imagenes?: string
  tipoHabitacion?: TipoHabitacion
  fechaActualizacion?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateHabitacionDto {
  idHotel: number
  numeroHabitacion: string
  piso?: string
  estado?: string
  idTipoHabitacion: number
  imagenes?: string
}

export interface UpdateHabitacionDto extends Partial<CreateHabitacionDto> {}

// Reserva
export enum EstadoReserva {
  PENDIENTE = 'pendiente',
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
  RECHAZADA = 'rechazada',
  COMPLETADA = 'completada',
}

export enum OrigenReserva {
  WEB = 'web',
  MOSTRADOR = 'mostrador',
  TELEFONO = 'telefono',
}

export interface Reserva {
  id: number
  idCliente: number
  idHotel: number
  idTipoHabitacion?: number
  idHabitacion?: number
  checkinPrevisto: Date | string
  checkoutPrevisto: Date | string
  checkinReal?: Date
  checkoutReal?: Date
  numeroHuespedes: number
  estadoReserva: EstadoReserva | string
  origenReserva: OrigenReserva | string
  codigoConfirmacion: string
  precioNocheSnapshot?: number
  observaciones?: string
  habitacion?: Habitacion
  tipoHabitacion?: TipoHabitacion
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateReservaDto {
  idCliente: number
  idHotel: number
  idTipoHabitacion: number
  checkinPrevisto: string
  checkoutPrevisto: string
  numeroHuespedes: number
  observaciones?: string
}

export interface UpdateReservaDto extends Partial<CreateReservaDto> {
  estadoReserva?: string
}

export interface HabitacionDisponibleDto {
  id: number
  numeroHabitacion: string
  piso?: string
  imagenes?: string
  tipoHabitacionId: number
  tipoHabitacionNombre: string
  capacidadPersonas: number
  precioBase: number
  amenidades: Array<{
    id: number
    nombre: string
    icono?: string
  }>
  disponibleDesde: Date | string
  disponibleHasta: Date | string
}

export interface DisponibilidadResponseDto {
  idHotel: number
  checkinFecha: Date | string
  checkoutFecha: Date | string
  numeroNoches: number
  habitacionesDisponibles: HabitacionDisponibleDto[]
  totalDisponibles: number
  tiposHabitacionDisponibles: Array<{
    id: number
    nombre: string
    cantidad: number
  }>
}