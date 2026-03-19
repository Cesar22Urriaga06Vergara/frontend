import { ref } from 'vue'
import { useApi } from './useApi'
import type { Impersonation, LogSistema } from '~/types/superadmin'

export const useSuperAdminSoporte = () => {
  const { get, post, patch } = useApi()
  
  // State
  const impersonacionesActivas = ref<Impersonation[]>([])
  const logsActivos = ref<LogSistema[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const filtroSeveridad = ref<'info' | 'warning' | 'error' | 'critical' | 'todos'>('todos')
  const filtroTipoEvento = ref<string>('todos')

  // Métodos Impersonación
  const obtenerImpersonacionesActivas = async () => {
    isLoading.value = true
    error.value = null
    try {
      impersonacionesActivas.value = await get<Impersonation[]>('/superadmin/soporte/impersonaciones-activas')
    } catch (err: any) {
      error.value = err.message || 'Error al obtener impersonaciones'
    } finally {
      isLoading.value = false
    }
  }

  const impersonarHotel = async (hotelId: number) => {
    isLoading.value = true
    error.value = null
    try {
      const impersonacion = await post<Impersonation>('/superadmin/soporte/impersonar', { hotelId })
      impersonacionesActivas.value.push(impersonacion)
      return impersonacion
    } catch (err: any) {
      error.value = err.message || 'Error al impersonar hotel'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const terminarImpersonacion = async (hotelId: number) => {
    isLoading.value = true
    error.value = null
    try {
      await post('/superadmin/soporte/terminar-impersonacion', { hotelId })
      impersonacionesActivas.value = impersonacionesActivas.value.filter(i => i.hotelId !== hotelId)
    } catch (err: any) {
      error.value = err.message || 'Error al terminar impersonación'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Métodos Logs
  const obtenerLogs = async () => {
    isLoading.value = true
    error.value = null
    try {
      const params: Record<string, any> = {}
      if (filtroSeveridad.value !== 'todos') {
        params.severidad = filtroSeveridad.value
      }
      if (filtroTipoEvento.value !== 'todos') {
        params.tipoEvento = filtroTipoEvento.value
      }
      
      logsActivos.value = await get<LogSistema[]>('/superadmin/soporte/logs', params)
    } catch (err: any) {
      error.value = err.message || 'Error al obtener logs'
    } finally {
      isLoading.value = false
    }
  }

  const obtenerLogsPorHotel = async (hotelId: number) => {
    isLoading.value = true
    error.value = null
    try {
      return await get<LogSistema[]>(`/superadmin/soporte/logs/hotel/${hotelId}`)
    } catch (err: any) {
      error.value = err.message || 'Error al obtener logs del hotel'
      return []
    } finally {
      isLoading.value = false
    }
  }

  const obtenerLogsPorUsuario = async (usuarioId: number) => {
    isLoading.value = true
    error.value = null
    try {
      return await get<LogSistema[]>(`/superadmin/soporte/logs/usuario/${usuarioId}`)
    } catch (err: any) {
      error.value = err.message || 'Error al obtener logs del usuario'
      return []
    } finally {
      isLoading.value = false
    }
  }

  const filtrarPorSeveridad = async (severidad: 'info' | 'warning' | 'error' | 'critical' | 'todos') => {
    filtroSeveridad.value = severidad
    await obtenerLogs()
  }

  const filtrarPorTipoEvento = async (tipoEvento: string) => {
    filtroTipoEvento.value = tipoEvento
    await obtenerLogs()
  }

  const exportarLogs = async (formato: 'pdf' | 'csv' = 'csv') => {
    isLoading.value = true
    error.value = null
    try {
      const blob = await get<Blob>('/superadmin/soporte/logs/exportar', { formato })
      
      // Descargar archivo
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `logs-sistema.${formato}`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      error.value = err.message || 'Error al exportar logs'
    } finally {
      isLoading.value = false
    }
  }

  return {
    impersonacionesActivas,
    logsActivos,
    isLoading,
    error,
    filtroSeveridad,
    filtroTipoEvento,
    obtenerImpersonacionesActivas,
    impersonarHotel,
    terminarImpersonacion,
    obtenerLogs,
    obtenerLogsPorHotel,
    obtenerLogsPorUsuario,
    filtrarPorSeveridad,
    filtrarPorTipoEvento,
    exportarLogs
  }
}
