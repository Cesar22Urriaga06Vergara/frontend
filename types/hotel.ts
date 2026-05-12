/**
 * Tipos relacionados con hoteles
 */

/**
 * Estado de un hotel
 */
export type EstadoHotel = 'activo' | 'suspendido'

/**
 * Entidad Hotel
 */
export interface Hotel {
  id: number
  nombre: string
  nit: string
  razonSocial?: string
  direccion?: string
  ciudad?: string
  pais?: string
  telefono?: string
  email?: string
  estrellas?: number
  descripcion?: string
  logoUrl?: string
  resolucionFacturacion?: string
  prefijoFacturacion?: string
  pieFactura?: string
  moneda?: string
  posFormatoDefault?: '58mm' | '80mm'
  estado: EstadoHotel
  fechaRegistro?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * DTO para crear un hotel
 */
export interface CreateHotelDto {
  nombre: string
  nit: string
  razonSocial?: string
  direccion?: string
  ciudad?: string
  pais?: string
  telefono?: string
  email?: string
  estrellas?: number
  descripcion?: string
  logoUrl?: string
  resolucionFacturacion?: string
  prefijoFacturacion?: string
  pieFactura?: string
  moneda?: string
  posFormatoDefault?: '58mm' | '80mm'
}

/**
 * DTO para actualizar un hotel
 */
export interface UpdateHotelDto {
  nombre?: string
  razonSocial?: string
  direccion?: string
  ciudad?: string
  pais?: string
  telefono?: string
  email?: string
  estrellas?: number
  descripcion?: string
  logoUrl?: string
  resolucionFacturacion?: string
  prefijoFacturacion?: string
  pieFactura?: string
  moneda?: string
  posFormatoDefault?: '58mm' | '80mm'
  estado?: EstadoHotel
}
