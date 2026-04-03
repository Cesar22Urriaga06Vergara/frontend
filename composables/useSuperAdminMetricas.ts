import { ref } from 'vue'
import { useApi } from './useApi'
import type { MetricasPlataforma, MetricasCrecimiento } from '~/types/superadmin'

export const useSuperAdminMetricas = () => {
  const { get } = useApi()

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
      metricasPlataforma.value = await get<MetricasPlataforma>('/superadmin/metricas/plataforma')
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
      metricasCrecimiento.value = await get<MetricasCrecimiento>(
        `/superadmin/metricas/crecimiento?periodo=${encodeURIComponent(periodo)}`,
      )
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

  return {
    metricasPlataforma,
    metricasCrecimiento,
    isLoading,
    error,
    periodoCrecimiento,
    obtenerMetricasPlataforma,
    obtenerMetricasCrecimiento,
    cambiarPeriodoCrecimiento,
  }
}
