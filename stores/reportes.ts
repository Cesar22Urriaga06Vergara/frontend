import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import { getErrorMessage, isUnavailableError } from '~/utils/http'

export const useReportesStore = defineStore('reportes', () => {
  const api = useApi()
  
  const loading = ref(false)
  const reportesReservas = ref<any>(null)
  const reportesServicios = ref<any>(null)
  const error = ref<string | null>(null)
  const unavailable = ref(false)

  /**
   * Obtener estadísticas de reservas de un hotel
   */
  const cargarEstadisticasReservas = async (idHotel: number, periodo?: string) => {
    error.value = null
    unavailable.value = false

    try {
      const params = periodo ? `?periodo=${periodo}` : ''
      const data = await api.get(`/reservas/stats/${idHotel}${params}`)
      reportesReservas.value = data
      return data
    } catch (err: any) {
      unavailable.value = isUnavailableError(err)
      error.value = getErrorMessage(err, 'Error al cargar estadísticas de reservas')
      reportesReservas.value = null
      throw err
    }
  }

  /**
   * Obtener estadísticas de servicios de un hotel
   */
  const cargarEstadisticasServicios = async (idHotel: number, periodo?: string) => {
    error.value = null
    unavailable.value = false

    try {
      const params = periodo ? `?periodo=${periodo}` : ''
      const data = await api.get(`/servicios/stats/${idHotel}${params}`)
      reportesServicios.value = data
      return data
    } catch (err: any) {
      unavailable.value = isUnavailableError(err)
      error.value = getErrorMessage(err, 'Error al cargar estadísticas de servicios')
      reportesServicios.value = null
      throw err
    }
  }

  /**
   * Cargar ambos reportes simultáneamente
   */
  const cargarTodosLosReportes = async (idHotel: number, periodo?: string) => {
    loading.value = true
    error.value = null
    unavailable.value = false

    const [reservasResult, serviciosResult] = await Promise.allSettled([
      cargarEstadisticasReservas(idHotel, periodo),
      cargarEstadisticasServicios(idHotel, periodo),
    ])

    const failedResults = [reservasResult, serviciosResult].filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    )

    if (failedResults.length > 0) {
      unavailable.value = failedResults.some(result => isUnavailableError(result.reason))
      error.value = getErrorMessage(failedResults[0].reason, 'Error al cargar reportes combinados')
    }

    loading.value = false

    return {
      reservas: reservasResult.status === 'fulfilled' ? reservasResult.value : null,
      servicios: serviciosResult.status === 'fulfilled' ? serviciosResult.value : null,
    }
  }

  // Computados para acceso fácil a datos
  const estadisticasReservas = computed(() => reportesReservas.value || {})
  const estadisticasServicios = computed(() => reportesServicios.value || {})

  // Totales combinados
  const totalReservas = computed(() => estadisticasReservas.value?.totalReservas || 0)
  const totalIngresos = computed(() => {
    const ing_reservas = estadisticasReservas.value?.ingresosBrutos || 0
    const ing_servicios = estadisticasServicios.value?.ingresosBrutos || 0
    return ing_reservas + ing_servicios
  })

  const tasaOcupacion = computed(() => estadisticasReservas.value?.tasaOcupacion || 0)
  
  const adr = computed(() => {
    // Average Daily Rate = Total Ingresos / Noches Totales
    const totalNoches = totalNochesReservadas.value
    if (totalNoches === 0) return 0
    return (totalIngresos.value / totalNoches).toFixed(2)
  })

  const totalNochesReservadas = computed(() => {
    // Sumar todas las noches de todas las reservas
    const reservas = reportesReservas.value || {}
    return reservas.promedioNochesPorReserva ? 
      (reservas.promedioNochesPorReserva * reservas.totalReservas) : 0
  })

  const resumenPorCategoria = computed(() => {
    return estadisticasServicios.value?.ingresoBrutoPorCategoria || {}
  })

  return {
    loading,
    error,
    unavailable,
    reportesReservas,
    reportesServicios,
    cargarEstadisticasReservas,
    cargarEstadisticasServicios,
    cargarTodosLosReportes,
    estadisticasReservas,
    estadisticasServicios,
    totalReservas,
    totalIngresos,
    tasaOcupacion,
    adr,
    resumenPorCategoria,
  }
})
