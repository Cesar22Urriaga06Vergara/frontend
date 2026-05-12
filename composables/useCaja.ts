import type {
  AbrirCajaTurnoDto,
  CajaTurno,
  CerrarCajaTurnoDto,
  CrearCajaMovimientoDto,
} from '~/types/caja'
import { useApi } from './useApi'
import { useNotification } from './useNotification'

export const useCaja = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const turnoActual = useState<CajaTurno | null>('caja.turnoActual', () => null)
  const turnos = useState<CajaTurno[]>('caja.turnos', () => [])
  const loadingCaja = useState<boolean>('caja.loading', () => false)

  const normalizarTurno = (raw: any): CajaTurno | null => {
    if (!raw) return null

    return {
      ...raw,
      id: Number(raw.id || 0),
      idHotel: Number(raw.idHotel || raw.id_hotel || 0),
      idUsuarioApertura: Number(raw.idUsuarioApertura || raw.id_usuario_apertura || 0),
      idUsuarioCierre: raw.idUsuarioCierre == null ? null : Number(raw.idUsuarioCierre),
      montoInicial: Number(raw.montoInicial || 0),
      totalIngresos: Number(raw.totalIngresos || 0),
      totalEgresos: Number(raw.totalEgresos || 0),
      totalEsperado: Number(raw.totalEsperado || 0),
      montoContado: raw.montoContado == null ? null : Number(raw.montoContado),
      diferencia: raw.diferencia == null ? null : Number(raw.diferencia),
      movimientos: Array.isArray(raw.movimientos)
        ? raw.movimientos.map((movimiento: any) => ({
            ...movimiento,
            id: Number(movimiento.id || 0),
            monto: Number(movimiento.monto || 0),
          }))
        : [],
    }
  }

  const obtenerTurnoActual = async () => {
    loadingCaja.value = true
    try {
      const response = await api.get<any>('/caja/turnos/actual')
      turnoActual.value = normalizarTurno(response)
      return turnoActual.value
    } catch (err: any) {
      error(err?.message || 'No se pudo obtener la caja abierta')
      throw err
    } finally {
      loadingCaja.value = false
    }
  }

  const abrirTurno = async (dto: AbrirCajaTurnoDto) => {
    loadingCaja.value = true
    try {
      const response = await api.post<any>('/caja/turnos/abrir', dto)
      turnoActual.value = normalizarTurno(response)
      success('Caja abierta correctamente')
      return turnoActual.value
    } catch (err: any) {
      error(err?.message || 'No se pudo abrir la caja')
      throw err
    } finally {
      loadingCaja.value = false
    }
  }

  const registrarMovimiento = async (dto: CrearCajaMovimientoDto) => {
    loadingCaja.value = true
    try {
      await api.post<any>('/caja/movimientos', { ...dto, origen: dto.origen || 'MANUAL' })
      await obtenerTurnoActual()
      success('Movimiento registrado')
    } catch (err: any) {
      error(err?.message || 'No se pudo registrar el movimiento')
      throw err
    } finally {
      loadingCaja.value = false
    }
  }

  const cerrarTurno = async (idTurno: number, dto: CerrarCajaTurnoDto) => {
    loadingCaja.value = true
    try {
      const response = await api.post<any>(`/caja/turnos/${idTurno}/cerrar`, dto)
      turnoActual.value = normalizarTurno(response)
      success('Caja cerrada correctamente')
      return turnoActual.value
    } catch (err: any) {
      error(err?.message || 'No se pudo cerrar la caja')
      throw err
    } finally {
      loadingCaja.value = false
    }
  }

  const listarTurnos = async () => {
    const response = await api.get<any[]>('/caja/turnos')
    turnos.value = Array.isArray(response)
      ? response.map((turno) => normalizarTurno(turno)).filter(Boolean) as CajaTurno[]
      : []
    return turnos.value
  }

  return {
    turnoActual,
    turnos,
    loadingCaja,
    obtenerTurnoActual,
    abrirTurno,
    registrarMovimiento,
    cerrarTurno,
    listarTurnos,
  }
}
