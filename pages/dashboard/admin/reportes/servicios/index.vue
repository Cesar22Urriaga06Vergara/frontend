<template>
  <div class="pa-4">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold mb-1">Reportes de Servicios</h1>
      <p class="text-body-2 text-medium-emphasis">Consolidado de todas las áreas del hotel</p>
    </div>

    <!-- Filtros -->
    <ReporteFiltros
      :loading="loading"
      :tiene-reporte="tieneReporte"
      @actualizar="cargarReporte"
      @exportar="adminReportesComposable.exportarCSV"
    />

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" :size="60" />
      <p class="text-center mt-4 text-medium-emphasis">Cargando reporte consolidado...</p>
    </div>

    <!-- Contenido -->
    <div v-else-if="tieneReporte">
      <!-- KPIs Principales -->
      <ReporteKpis :kpis="kpis" :top-area-ingresos="topAreaIngresos" />

      <!-- Desglose por Área -->
      <div class="mt-8">
        <ReporteTablaAreas :areas="areasDetalle" titulo="Desglose Detallado por Área" />
      </div>

      <!-- Estadísticas de Entrega -->
      <v-row class="mt-8 mb-6">
        <v-col cols="12" md="6">
          <v-card class="card-glow pa-4">
            <div class="text-subtitle-2 font-weight-bold mb-4">Tipo de Entrega</div>
            <div class="d-flex flex-column gap-3">
              <!-- Delivery -->
              <div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2">
                    <v-icon icon="mdi-truck-fast" color="info" size="20" class="mr-1" />
                    Delivery
                  </span>
                  <span class="text-body-2 font-weight-bold">{{ estadisticasEntrega?.delivery.cantidad }} ({{ estadisticasEntrega?.delivery.porcentaje }}%)</span>
                </div>
                <v-progress-linear
                  :model-value="estadisticasEntrega?.delivery.porcentaje || 0"
                  color="info"
                  height="8"
                />
                <div class="text-caption text-medium-emphasis mt-1">
                  ${{ formatearMoneda(estadisticasEntrega?.delivery.ingresos || 0) }}
                </div>
              </div>

              <!-- Recogida -->
              <div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2">
                    <v-icon icon="mdi-hand-pickup" color="warning" size="20" class="mr-1" />
                    Recogida
                  </span>
                  <span class="text-body-2 font-weight-bold">{{ estadisticasEntrega?.recogida.cantidad }} ({{ estadisticasEntrega?.recogida.porcentaje }}%)</span>
                </div>
                <v-progress-linear
                  :model-value="estadisticasEntrega?.recogida.porcentaje || 0"
                  color="warning"
                  height="8"
                />
                <div class="text-caption text-medium-emphasis mt-1">
                  ${{ formatearMoneda(estadisticasEntrega?.recogida.ingresos || 0) }}
                </div>
              </div>
            </div>
          </v-card>
        </v-col>

        <!-- Top 5 Áreas -->
        <v-col cols="12" md="6">
          <v-card class="card-glow pa-4">
            <div class="text-subtitle-2 font-weight-bold mb-4">Top 5 Áreas por Ingresos</div>
            <div class="d-flex flex-column gap-2">
              <div v-for="(area, idx) in topAreas" :key="area.categoria" class="d-flex align-center justify-space-between py-2 px-2 rounded-lg" :style="{ backgroundColor: idx === 0 ? '#e8f5e9' : 'transparent' }">
                <div class="d-flex align-center gap-2">
                  <v-avatar color="primary" size="32" variant="tonal">
                    {{ area.ranking }}
                  </v-avatar>
                  <div>
                    <div class="text-body-2 font-weight-bold">{{ formatearCategoria(area.categoria) }}</div>
                    <div class="text-caption text-medium-emphasis">{{ area.pedidos }} pedidos</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-body-2 font-weight-bold text-success">
                    ${{ formatearMoneda(area.ingresos) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">{{ area.porcentajeDelTotal }}%</div>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Gráficos de Tendencia -->
      <ReporteGraficos :tendencias="tendencias" />

      <!-- Botón para ir a análisis por área -->
      <div class="mt-8 text-center">
        <v-btn
          to="/dashboard/admin/reportes/servicios/por-area"
          color="primary"
          variant="elevated"
          prepend-icon="mdi-table-large"
        >
          Ver Análisis Detallado por Área
        </v-btn>
      </div>
    </div>

    <!-- Sin datos -->
    <div v-else class="text-center py-8">
      <v-icon icon="mdi-inbox-outline" size="64" class="text-medium-emphasis mb-2" />
      <p class="text-body-1 text-medium-emphasis">No hay datos para mostrar</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAdminReportes } from '~/composables/useAdminReportes'
import ReporteFiltros from '~/components/reportes/ReporteFiltros.vue'
import ReporteKpis from '~/components/reportes/ReporteKpis.vue'
import ReporteTablaAreas from '~/components/reportes/ReporteTablaAreas.vue'
import ReporteGraficos from '~/components/reportes/ReporteGraficos.vue'

const authStore = useAuthStore()
const adminReportesComposable = useAdminReportes()

// State
const loading = ref(false)

// Computed
const tieneReporte = computed(() => !!adminReportesComposable.reporte.value)
const kpis = computed(() => adminReportesComposable.reporte.value?.kpis || null)
const areasDetalle = computed(() => adminReportesComposable.reporte.value?.areasDetalle || [])
const topAreas = computed(() => adminReportesComposable.reporte.value?.topAreas || [])
const estadisticasEntrega = computed(() => adminReportesComposable.reporte.value?.estadisticasEntrega || null)
const tendencias = computed(() => adminReportesComposable.reporte.value?.tendencias || [])
const topAreaIngresos = computed(() => {
  const areas = adminReportesComposable.reporte.value?.topAreas
  return areas && areas.length > 0 ? areas[0].ingresos : 0
})

// Actions
const cargarReporte = async (desde?: Date, hasta?: Date) => {
  if (!authStore.user?.idHotel) {
    console.error('No hotel ID')
    return
  }

  loading.value = true
  try {
    await adminReportesComposable.cargarReporte(
      authStore.user.idHotel,
      desde,
      hasta,
    )
  } finally {
    loading.value = false
  }
}

// Utils
const formatearMoneda = (valor: number): string => {
  return valor.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const formatearCategoria = (cat: string): string => {
  return cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')
}

// Lifecycle
onMounted(async () => {
  await cargarReporte()
})
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 1rem;
}
</style>
