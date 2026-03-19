// Hoteles
export interface Hotel {
  id: number
  nombre: string
  email: string
  telefono: string
  direccion: string
  ciudad: string
  paisId: number
  planId: number
  estado: 'activo' | 'suspendido' | 'bloqueado'
  fechaRegistro: Date
  usuariosActivos: number
  habitacionesTotal: number
}

export interface CreateHotelDto {
  nombre: string
  email: string
  telefono: string
  direccion: string
  ciudad: string
  paisId: number
  planId: number
}

export interface UpdateHotelDto {
  nombre?: string
  email?: string
  telefono?: string
  direccion?: string
  ciudad?: string
}

// Planes
export interface Plan {
  id: number
  nombre: string
  descripcion: string
  precioMensual: number
  precioAnual: number
  usuariosMaximos: number
  habitacionesMaximas: number
  modulos: string[]
  esActivo: boolean
  fechaCreacion: Date
}

export interface CreatePlanDto {
  nombre: string
  descripcion: string
  precioMensual: number
  precioAnual: number
  usuariosMaximos: number
  habitacionesMaximas: number
  modulos: string[]
}

export interface UpdatePlanDto {
  nombre?: string
  descripcion?: string
  precioMensual?: number
  precioAnual?: number
  usuariosMaximos?: number
  habitacionesMaximas?: number
  modulos?: string[]
  esActivo?: boolean
}

// Límites Sistema
export interface LimiteSistema {
  clave: string
  descripcion: string
  valorDefecto: number
  valorActual: number
  valorMinimo: number
  valorMaximo: number
  categoria: 'usuario' | 'hotel' | 'transaccion' | 'sistema'
}

export interface UpdateLimiteDto {
  valorActual: number
}

// Categorías Globales
export interface CategoriaServicio {
  id: number
  nombre: string
  descripcion: string
  icono?: string
  esActiva: boolean
}

export interface ModuloSistema {
  id: number
  nombre: string
  descripcion: string
  clave: string
  esActivo: boolean
  requeridos?: string[]
}

// Métricas
export interface MetricasPlataforma {
  hotelesActivos: number
  usuariosTotales: number
  serviciosActivos: number
  ingresosSaaS: number
  hotelGeneral: {
    nombre: string
    usuarios: number
    suscripcion: {
      plan: string
      vencimiento: Date
    }
    estado: 'activo' | 'suspendido' | 'bloqueado'
  }[]
}

export interface MetricasCrecimiento {
  periodo: 'mes' | 'trimestre' | 'año'
  hotelesNuevos: number
  usuariosNuevos: number
  tasaCrecimiento: number
  ingresoPromedio: number
  datos: Array<{
    fecha: Date
    hoteles: number
    usuarios: number
    ingresos: number
  }>
}

// Soporte
export interface Impersonation {
  hotelId: number
  hotelNombre: string
  iniciadaPor: number
  usuarioSuperAdmin: string
  fechaInicio: Date
  ipOrigen: string
}

export interface LogSistema {
  id: number
  tipoEvento: 'login' | 'cambio_config' | 'error' | 'acceso_recurso' | 'cambio_estado'
  descripcion: string
  usuarioId?: number
  hotelId?: number
  detalles: Record<string, any>
  nivelSeveridad: 'info' | 'warning' | 'error' | 'critical'
  fechaCreacion: Date
}

// Configuración Sistema
export interface FeaturesFlag {
  id: number
  nombre: string
  descripcion: string
  clave: string
  esActivo: boolean
  hotelAprobado?: number[]
  hotelBloqueado?: number[]
  porcentajeDeploy: number
  fechaActivacion: Date
  fechaVencimiento?: Date
}

export interface ParametroGlobal {
  id: number
  clave: string
  descripcion: string
  valor: string
  tipo: 'string' | 'number' | 'boolean' | 'json'
  categoria: 'email' | 'seguridad' | 'integracion' | 'facturacion'
  esModificable: boolean
  ultimaActualizacion: Date
}

// Dashboard SaaS
export interface DashboardSaaSData {
  metricas: {
    hotelesActivos: number
    usuariosTotales: number
    serviciosActivos: number
    ingresosSaaS: number
  }
  tendencias: {
    hotelesArquivo: number
    usuariosAñadidos: number
    serviciosNuevos: number
    ingresosMes: number
  }
}
