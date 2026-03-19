import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSuperAdminStore = defineStore('superadmin', () => {
  // State
  const hotelesGlobales = ref<any[]>([])
  const planesGlobales = ref<any[]>([])
  const metricasGlobales = ref<any>(null)
  const logsGlobales = ref<any[]>([])
  const impersonacionActual = ref<any>(null)
  
  // Flags
  const isImpersonando = computed(() => !!impersonacionActual.value)

  // Acciones
  const setHotelesGlobales = (hoteles: any[]) => {
    hotelesGlobales.value = hoteles
  }

  const setPlanesGlobales = (planes: any[]) => {
    planesGlobales.value = planes
  }

  const setMetricasGlobales = (metricas: any) => {
    metricasGlobales.value = metricas
  }

  const setLogsGlobales = (logs: any[]) => {
    logsGlobales.value = logs
  }

  const iniciarImpersonacion = (hotel: any) => {
    impersonacionActual.value = hotel
    localStorage.setItem('impersonacion_actual', JSON.stringify(hotel))
  }

  const terminarImpersonacion = () => {
    impersonacionActual.value = null
    localStorage.removeItem('impersonacion_actual')
  }

  const cargarImpersonacionGuardada = () => {
    const guardada = localStorage.getItem('impersonacion_actual')
    if (guardada) {
      impersonacionActual.value = JSON.parse(guardada)
    }
  }

  return {
    hotelesGlobales,
    planesGlobales,
    metricasGlobales,
    logsGlobales,
    impersonacionActual,
    isImpersonando,
    setHotelesGlobales,
    setPlanesGlobales,
    setMetricasGlobales,
    setLogsGlobales,
    iniciarImpersonacion,
    terminarImpersonacion,
    cargarImpersonacionGuardada
  }
})
