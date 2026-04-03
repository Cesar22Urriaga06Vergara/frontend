/**
 * Composable para reportes financieros de áreas
 * ⚠️ Sensible: Acceso auditado a datos financieros por área
 *
 * Uso:
 * ```
 * const { cargarReporte, reporte, resumen, loading, error } = useAreaReportes()
 * await cargarReporte(idHotel, 'cafeteria')
 * ```
 */

import { ref, computed } from 'vue'
import { useApi } from './useApi'
import { getErrorMessage } from '~/utils/http'
import type { AreaReportResponse, PedidoAreaReporte, AreaReportsResumen } from '~/types/servicios'

export const useAreaReportes = () => {
  const api = useApi()

  // State
  const reporte = ref<PedidoAreaReporte[]>([])
  const resumen = ref<AreaReportsResumen | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const ultimaCarga = ref<Date | null>(null)

  // Getters
  const tieneReporte = computed(() => reporte.value.length > 0)
  
  const ingresosPendientes = computed(() => resumen.value?.financiero.ingresoPendiente ?? 0)
  const ingresosEntregados = computed(() => resumen.value?.financiero.ingresoEntregado ?? 0)
  const ingresoTotal = computed(() => resumen.value?.financiero.ingresoTotal ?? 0)
  const ticketPromedio = computed(() => resumen.value?.financiero.ticketPromedio ?? 0)

  /**
   * Cargar reporte de área
   * ⚠️ Esta acción se registra en auditoría
   */
  const cargarReporte = async (
    idHotel: number,
    categoria: string,
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
      const url = `/servicios/reportes/area/${idHotel}/${categoria}${queryString ? '?' + queryString : ''}`

      const response = await api.get<AreaReportResponse>(url)

      reporte.value = response.detalle
      resumen.value = response.resumen
      ultimaCarga.value = new Date()
    } catch (err: any) {
      const mensaje = getErrorMessage(err, 'Error al cargar reporte de area')
      error.value = mensaje
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Exportar reporte a CSV
   * (Cliente-side, no requiere backend especial)
   */
  const exportarCSV = (nombreArchivo: string = 'reporte-area.csv'): void => {
    if (!tieneReporte.value) {
      return
    }

    // Crear CSV con encabezados
    const headers = [
      'ID Pedido',
      'Reserva',
      'Estado',
      'Tipo Entrega',
      'Fecha',
      'Total Pedido',
      'Items',
    ]

    const rows = reporte.value.map((p) => [
      p.id,
      p.idReserva,
      p.estadoPedido,
      p.tipoEntrega,
      new Date(p.fechaPedido).toLocaleString(),
      `$${p.totalPedido.toFixed(2)}`,
      p.items.length,
    ])

    // Agregar fila vacía y resumen
    rows.push([])
    if (resumen.value) {
      rows.push(['RESUMEN DEL PERÍODO'])
      rows.push(['Total Pedidos', resumen.value.contadores.total])
      rows.push(['Entregados', resumen.value.contadores.entregado])
      rows.push(['Ingresos Total', `$${resumen.value.financiero.ingresoTotal.toFixed(2)}`])
      rows.push(['Ingresos Entregado', `$${resumen.value.financiero.ingresoEntregado.toFixed(2)}`])
      rows.push(['Ticket Promedio', `$${resumen.value.financiero.ticketPromedio.toFixed(2)}`])
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
   * Limpiar datos (logout o cambio de usuario)
   */
  const limpiar = (): void => {
    reporte.value = []
    resumen.value = null
    error.value = null
    ultimaCarga.value = null
  }

  return {
    // State
    reporte,
    resumen,
    loading,
    error,
    ultimaCarga,

    // Computed
    tieneReporte,
    ingresosPendientes,
    ingresosEntregados,
    ingresoTotal,
    ticketPromedio,

    // Actions
    cargarReporte,
    exportarCSV,
    limpiar,
  }
}
