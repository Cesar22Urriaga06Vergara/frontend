export type EstadoResolucionFacturacion = 'activa' | 'inactiva' | 'vencida' | 'agotada'
export type AmbienteResolucionFacturacion = 'desarrollo' | 'produccion'

export interface ResolucionFacturacion {
  id: number
  idHotel: number
  numeroResolucion: string
  prefijo: string
  fechaResolucion?: string | null
  fechaInicio: string
  fechaFin: string
  rangoDesde: number
  rangoHasta: number
  numeroActual: number
  tipoDocumento: string
  ambiente: AmbienteResolucionFacturacion
  estado: EstadoResolucionFacturacion
  observaciones?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateResolucionFacturacionDto {
  idHotel?: number
  numeroResolucion: string
  prefijo: string
  fechaResolucion?: string
  fechaInicio: string
  fechaFin: string
  rangoDesde: number
  rangoHasta: number
  numeroActual?: number
  tipoDocumento?: string
  ambiente?: AmbienteResolucionFacturacion
  observaciones?: string
}

export interface UpdateResolucionFacturacionDto {
  estado?: EstadoResolucionFacturacion
  observaciones?: string
}
