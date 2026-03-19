import { ref, computed } from 'vue'
import { useApi } from './useApi'
import type { RoomIncident } from '~/types/incidencias'

export const useIncidencias = () => {
  const api = useApi()

  // State
  const incidencias = ref<RoomIncident[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const estadisticas = ref<any>(null)

  // Métodos
  const crearIncidencia = async (data: any): Promise<RoomIncident | null> => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post<RoomIncident>('/incidencias', data)
      incidencias.value.push(response)
      return response
    } catch (err: any) {
      error.value = err.message || 'Error al crear incidencia'
      return null
    } finally {
      loading.value = false
    }
  }

  const obtenerTodas = async (filtros?: {
    estado?: string
    tipo?: string
    prioridad?: string
    areaAsignada?: string
    esResponsabilidadCliente?: boolean
  }): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const query = Object.fromEntries(
        Object.entries(filtros || {}).filter(([, v]) => v !== undefined && v !== null),
      )
      const response = await api.get<RoomIncident[]>('/incidencias/listado/todas', query)
      incidencias.value = response
    } catch (err: any) {
      error.value = err.message || 'Error al cargar incidencias'
    } finally {
      loading.value = false
    }
  }

  const obtenerActivas = async (): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<RoomIncident[]>('/incidencias/listado/activas')
      incidencias.value = response
    } catch (err: any) {
      error.value = err.message || 'Error al cargar incidencias activas'
    } finally {
      loading.value = false
    }
  }

  const obtenerPorArea = async (
    area: string,
    filtros?: { estado?: string; prioridad?: string },
  ): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const query = Object.fromEntries(
        Object.entries(filtros || {}).filter(([, v]) => v !== undefined && v !== null),
      )
      const response = await api.get<RoomIncident[]>(`/incidencias/area/${area}`, query)
      incidencias.value = response
    } catch (err: any) {
      error.value = err.message || 'Error al cargar incidencias del área'
    } finally {
      loading.value = false
    }
  }

  const obtenerPorHabitacion = async (idHabitacion: number): Promise<RoomIncident[]> => {
    try {
      return await api.get<RoomIncident[]>(`/incidencias/habitacion/${idHabitacion}`)
    } catch (err: any) {
      error.value = err.message || 'Error al cargar incidencias'
      return []
    }
  }

  const obtenerPorId = async (id: number): Promise<RoomIncident | null> => {
    loading.value = true
    error.value = null
    try {
      return await api.get<RoomIncident>(`/incidencias/${id}`)
    } catch (err: any) {
      error.value = err.message || 'Error al cargar incidencia'
      return null
    } finally {
      loading.value = false
    }
  }

  const actualizar = async (id: number, data: any): Promise<RoomIncident | null> => {
    loading.value = true
    error.value = null
    try {
      const response = await api.patch<RoomIncident>(`/incidencias/${id}`, data)
      const idx = incidencias.value.findIndex(i => i.id === id)
      if (idx !== -1) {
        incidencias.value[idx] = response
      }
      return response
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar incidencia'
      return null
    } finally {
      loading.value = false
    }
  }

  const cancelar = async (id: number, razon?: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await api.post(`/incidencias/${id}/cancelar`, { razon })
      const idx = incidencias.value.findIndex(i => i.id === id)
      if (idx !== -1) {
        incidencias.value.splice(idx, 1)
      }
      return true
    } catch (err: any) {
      error.value = err.message || 'Error al cancelar incidencia'
      return false
    } finally {
      loading.value = false
    }
  }

  const obtenerEstadisticas = async (desde?: Date, hasta?: Date): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const query: any = {}
      if (desde) query.desde = desde.toISOString()
      if (hasta) query.hasta = hasta.toISOString()
      estadisticas.value = await api.get('/incidencias/stats/general', query)
    } catch (err: any) {
      error.value = err.message || 'Error al cargar estadísticas'
    } finally {
      loading.value = false
    }
  }

  // Computed
  const tieneIncidencias = computed(() => incidencias.value.length > 0)
  const incidenciasActivas = computed(() =>
    incidencias.value.filter(i => ['reported', 'in_progress'].includes(i.estado)),
  )
  const incidenciasResueltas = computed(() =>
    incidencias.value.filter(i => i.estado === 'resolved'),
  )

  return {
    // State
    incidencias,
    loading,
    error,
    estadisticas,

    // Métodos
    crearIncidencia,
    obtenerTodas,
    obtenerActivas,
    obtenerPorArea,
    obtenerPorHabitacion,
    obtenerPorId,
    actualizar,
    cancelar,
    obtenerEstadisticas,

    // Computed
    tieneIncidencias,
    incidenciasActivas,
    incidenciasResueltas,
  }
}
