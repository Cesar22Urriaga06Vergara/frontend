/**
 * Composable para reportes consolidados del ADMIN
 * 📊 Acceso a datos consolidados de todas las áreas
 * ⚠️ Auditoría: Registra todos los accesos
 *
 * Uso:
 * ```
 * const { cargarReporte, reporte, kpis, loading } = useAdminReportes()
 * await cargarReporte(idHotel)
 * ```
 */

import { ref, computed } from 'vue'
import { useApi } from './useApi'
import { getErrorMessage } from '~/utils/http'
import type {
  HotelReportConsolidado,
  TopArea,
  AreaResumen,
  TendenciasDiarias,
} from '~/types/servicios'

export const useAdminReportes = () => {
  const api = useApi()

  // State
  const reporte = ref<HotelReportConsolidado | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const ultimaCarga = ref<Date | null>(null)

  // Getters
  const tieneReporte = computed(() => !!reporte.value)

  const kpis = computed(() => reporte.value?.kpis || null)
  const topAreas = computed(() => reporte.value?.topAreas || [])
  const areasDetalle = computed(() => reporte.value?.areasDetalle || [])
  const estadisticas = computed(() => reporte.value?.estadisticasEntrega || null)
  const tendencias = computed(() => reporte.value?.tendencias || [])

  // Cálculos útiles
  const areaConMasIngresos = computed(() => topAreas.value[0]?.categoria || 'N/A')
  const ingresoTotal = computed(() => kpis.value?.totalIngresos || 0)
  const totalPedidos = computed(() => kpis.value?.totalPedidos || 0)
  const ticketPromedio = computed(() => kpis.value?.ticketPromedio || 0)

  /**
   * Cargar reporte consolidado del hotel
   * ⚠️ Esta acción se registra en auditoría
   */
  const cargarReporte = async (
    idHotel: number,
    fechaDesde?: Date,
    fechaHasta?: Date,
  ): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      // Construir query params
      const params = new URLSearchParams()
      if (fechaDesde) {
        params.append('desde', fechaDesde.toISOString())
      }
      if (fechaHasta) {
        params.append('hasta', fechaHasta.toISOString())
      }

      const queryString = params.toString()
      const url = `/servicios/reportes/hotel/${idHotel}${queryString ? '?' + queryString : ''}`

      const response = await api.get<HotelReportConsolidado>(url)

      reporte.value = response
      ultimaCarga.value = new Date()
    } catch (err: any) {
      const mensaje = getErrorMessage(err, 'Error al cargar reporte del hotel')
      error.value = mensaje
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Exportar reporte a CSV
   */
  const exportarCSV = (nombreArchivo: string = 'reporte-hotel.csv'): void => {
    if (!tieneReporte.value) {
      return
    }

    const headers = [
      'Área',
      'Pedidos',
      'Ingresos Total',
      'Ingresos Entregado',
      'Ticket Promedio',
      'Tasa Entrega %',
    ]

    const rows = areasDetalle.value.map((area) => [
      area.categoria,
      area.totalPedidos,
      `$${area.ingresoTotal.toFixed(2)}`,
      `$${area.ingresoEntregado.toFixed(2)}`,
      `$${area.ticketPromedio.toFixed(2)}`,
      `${area.tasaEntrega.toFixed(2)}%`,
    ])

    // Agregar resumen
    rows.push([])
    if (kpis.value) {
      rows.push(['RESUMEN DEL PERÍODO'])
      rows.push(['Total Pedidos', kpis.value.totalPedidos])
      rows.push(['Total Ingresos', `$${kpis.value.totalIngresos.toFixed(2)}`])
      rows.push(['Ingresos Entregados', `$${kpis.value.ingresoEntregado.toFixed(2)}`])
      rows.push(['Ticket Promedio', `$${kpis.value.ticketPromedio.toFixed(2)}`])
      rows.push(['Tasa Entrega Global', `${kpis.value.tasaEntregaGlobal.toFixed(2)}%`])
      rows.push(['Pedidos Hoy', kpis.value.pedidosHoy])
      rows.push(['Ingresos Hoy', `$${kpis.value.ingresosHoy.toFixed(2)}`])
    }

    // Convertir a CSV
    const csv = [
      headers.join(','),
      ...rows.map((r) => r.map((v) => `"${v}"`).join(',')),
    ].join('\n')

    // Descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = nombreArchivo
    link.click()
  }

  /**
   * Limpiar datos
   */
  const limpiar = (): void => {
    reporte.value = null
    error.value = null
    ultimaCarga.value = null
  }

  return {
    // State
    reporte,
    loading,
    error,
    ultimaCarga,

    // Computed
    tieneReporte,
    kpis,
    topAreas,
    areasDetalle,
    estadisticas,
    tendencias,
    areaConMasIngresos,
    ingresoTotal,
    totalPedidos,
    ticketPromedio,

    // Actions
    cargarReporte,
    exportarCSV,
    limpiar,
  }
}
