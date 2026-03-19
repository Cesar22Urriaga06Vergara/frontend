import { ref } from 'vue'
import { useApi } from './useApi'
import type { MetricasPlataforma, MetricasCrecimiento } from '~/types/superadmin'

export const useSuperAdminMetricas = () => {
  const { get, post, patch } = useApi()
  
  // State
  const metricasPlataforma = ref<MetricasPlataforma | null>(null)
  const metricasCrecimiento = ref<MetricasCrecimiento | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const periodoCrecimiento = ref<'mes' | 'trimestre' | 'año'>('mes')

  // Métodos
  const obtenerMetricasPlataforma = async () => {
    isLoading.value = true
    error.value = null
    try {
      metricasPlataforma.value = await $fetch('/superadmin/metricas/plataforma')
    } catch (err: any) {
      error.value = err.message || 'Error al obtener métricas'
    } finally {
      isLoading.value = false
    }
  }

  const obtenerMetricasCrecimiento = async (periodo: 'mes' | 'trimestre' | 'año' = 'mes') => {
    isLoading.value = true
    error.value = null
    try {
      metricasCrecimiento.value = await $fetch('/superadmin/metricas/crecimiento', {
        query: { periodo }
      })
      periodoCrecimiento.value = periodo
    } catch (err: any) {
      error.value = err.message || 'Error al obtener métricas de crecimiento'
    } finally {
      isLoading.value = false
    }
  }

  const cambiarPeriodoCrecimiento = async (periodo: 'mes' | 'trimestre' | 'año') => {
    await obtenerMetricasCrecimiento(periodo)
  }

  const obtenerMetricasDetalladas = async (hotelId?: number) => {
    isLoading.value = true
    error.value = null
    try {
      const params = hotelId ? { hotelId } : {}
      return await $fetch('/superadmin/metricas/detalladas', {
        query: params
      })
    } catch (err: any) {
      error.value = err.message || 'Error al obtener métricas detalladas'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const exportarMetricas = async (formato: 'pdf' | 'csv' = 'pdf') => {
    isLoading.value = true
    error.value = null
    try {
      const blob = await get<Blob>('/superadmin/metricas/exportar', { formato })
      
      // Descargar archivo
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `metricas-plataforma.${formato}`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      error.value = err.message || 'Error al exportar métricas'
    } finally {
      isLoading.value = false
    }
  }

  return {
    metricasPlataforma,
    metricasCrecimiento,
    isLoading,
    error,
    periodoCrecimiento,
    obtenerMetricasPlataforma,
    obtenerMetricasCrecimiento,
    cambiarPeriodoCrecimiento,
    obtenerMetricasDetalladas,
    exportarMetricas
  }
}
