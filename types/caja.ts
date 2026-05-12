export type CajaTurnoEstado = 'ABIERTA' | 'CERRADA'
export type CajaMovimientoTipo = 'INGRESO' | 'EGRESO'
export type CajaMovimientoOrigen = 'MANUAL' | 'FOLIO' | 'FACTURA' | 'DEVOLUCION' | 'AJUSTE'

export interface CajaMovimiento {
  id: number
  idTurno: number
  idHotel: number
  idUsuario: number
  tipo: CajaMovimientoTipo
  origen: CajaMovimientoOrigen
  monto: number
  idMedioPago?: number | null
  metodoPago?: string | null
  concepto: string
  referencia?: string | null
  idFolio?: number | null
  idFactura?: number | null
  observaciones?: string | null
  fechaMovimiento: string
}

export interface CajaTurno {
  id: number
  idHotel: number
  idUsuarioApertura: number
  idUsuarioCierre?: number | null
  estado: CajaTurnoEstado
  montoInicial: number
  totalIngresos: number
  totalEgresos: number
  totalEsperado: number
  montoContado?: number | null
  diferencia?: number | null
  observacionesApertura?: string | null
  observacionesCierre?: string | null
  fechaApertura: string
  fechaCierre?: string | null
  movimientos?: CajaMovimiento[]
}

export interface AbrirCajaTurnoDto {
  montoInicial: number
  observaciones?: string
}

export interface CrearCajaMovimientoDto {
  tipo: CajaMovimientoTipo
  origen?: CajaMovimientoOrigen
  monto: number
  concepto: string
  metodoPago?: string
  referencia?: string
  observaciones?: string
}

export interface CerrarCajaTurnoDto {
  montoContado: number
  observaciones?: string
}
