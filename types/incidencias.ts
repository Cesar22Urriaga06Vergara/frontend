export interface RoomIncident {
  id: number
  idHabitacion: number
  idReserva?: number
  idCliente?: number
  tipo: 'daño' | 'mantenimiento' | 'limpieza' | 'cliente_complaint' | 'otros'
  estado: 'reported' | 'in_progress' | 'resolved' | 'cancelled'
  descripcion: string
  idEmpleadoReporta: number
  nombreEmpleadoReporta: string
  tipoReportador: 'cliente' | 'empleado'
  areaAsignada: string
  idEmpleadoAtiende?: number
  nombreEmpleadoAtiende?: string
  notaResolucion?: string
  prioridad: 'baja' | 'media' | 'alta' | 'urgente'
  esResponsabilidadCliente: boolean
  cargoAdicional?: number
  descripcionCargo?: string
  fechaReporte: Date
  fechaResolucion?: Date
  updatedAt: Date
  reserva?: any
  habitacion?: any
}

export interface CreateIncidenciaDto {
  idHabitacion: number
  idReserva?: number
  idCliente?: number
  tipo: 'daño' | 'mantenimiento' | 'limpieza' | 'cliente_complaint' | 'otros'
  descripcion: string
  areaAsignada: 'mantenimiento' | 'plomeria' | 'limpieza' | 'electricidad' | 'seguridad' | 'otro'
  prioridad?: 'baja' | 'media' | 'alta' | 'urgente'
  esResponsabilidadCliente?: boolean
  cargoAdicional?: number
  descripcionCargo?: string
}

export interface EstadisticasIncidencias {
  kpis: {
    totalIncidencias: number
    incidenciasActivas: number
    incidenciasResueltas: number
    tiempoPromedioResolucion: number
    cargoTotal: number
  }
  incidenciasPorEstado: Record<string, number>
  incidenciasPorArea: Record<string, any>
  incidenciasPorTipo: Record<string, any>
}
