import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '~/composables/useApi'

export const useReportesStore = defineStore('reportes', () => {
  const api = useApi()
  
  const loading = ref(false)
  const reportesReservas = ref<any>(null)
  const reportesServicios = ref<any>(null)
  const error = ref<string | null>(null)

  /**
   * Obtener estadísticas de reservas de un hotel
   */
  const cargarEstadisticasReservas = async (idHotel: number, periodo?: string) => {
    loading.value = true
    error.value = null
    
    try {
      const params = periodo ? `?periodo=${periodo}` : ''
      const { data } = await api.get(`/reservas/stats/${idHotel}${params}`)
      reportesReservas.value = data
      return data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar estadísticas de reservas'
      console.error('Error cargar estadísticas reservas:', err)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener estadísticas de servicios de un hotel
   */
  const cargarEstadisticasServicios = async (idHotel: number, periodo?: string) => {
    loading.value = true
    error.value = null
    
    try {
      const params = periodo ? `?periodo=${periodo}` : ''
      const { data } = await api.get(`/servicios/stats/${idHotel}${params}`)
      reportesServicios.value = data
      return data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar estadísticas de servicios'
      console.error('Error cargar estadísticas servicios:', err)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Cargar ambos reportes simultáneamente
   */
  const cargarTodosLosReportes = async (idHotel: number, periodo?: string) => {
    loading.value = true
    error.value = null
    
    try {
      const [reservas, servicios] = await Promise.all([
        cargarEstadisticasReservas(idHotel, periodo),
        cargarEstadisticasServicios(idHotel, periodo),
      ])
      
      return { reservas, servicios }
    } catch (err) {
      error.value = 'Error al cargar reportes combinados'
      console.error('Error cargar todos los reportes:', err)
      throw error
    } finally {
      loading.value = false
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
    const totalNoches = estadounidenses.value
    if (totalNoches === 0) return 0
    return (totalIngresos.value / totalNoches).toFixed(2)
  })

  const estadounidenses = computed(() => {
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
