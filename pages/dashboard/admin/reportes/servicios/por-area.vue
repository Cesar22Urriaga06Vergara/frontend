<template>
  <div class="pa-4">
    <!-- Header -->
    <div class="mb-6">
      <v-breadcrumbs
        :items="[
          { title: 'Dashboard', href: '/dashboard/admin' },
          { title: 'Reportes', href: '/dashboard/admin/reportes/servicios' },
          { title: 'Por Área', disabled: true },
        ]"
        divider="/"
      />
      <h1 class="text-h4 font-weight-bold mt-2 mb-1">Análisis Detallado por Área</h1>
      <p class="text-body-2 text-medium-emphasis">Comparativa de desempeño entre todas las áreas</p>
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
      <p class="text-center mt-4 text-medium-emphasis">Cargando análisis...</p>
    </div>

    <!-- Contenido -->
    <div v-else-if="tieneReporte">
      <!-- Tabla Comparativa -->
      <ReporteTablaAreas :areas="areasDetalle" titulo="Comparativa de Desempeño" />

      <!-- Cards de Análisis por Área -->
      <v-row class="mt-8">
        <v-col v-for="area in areasDetalle" :key="area.categoria" cols="12" sm="6" lg="4">
          <v-card class="card-glow h-100">
            <!-- Header del área -->
            <v-card-text class="pa-4 border-bottom">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <h3 class="text-h6 font-weight-bold">{{ formatearCategoria(area.categoria) }}</h3>
                  <div class="text-caption text-medium-emphasis mt-1">
                    {{ area.totalPedidos }} pedidos • ${{ formatearMoneda(area.ingresoTotal) }}
                  </div>
                </div>
                <v-avatar :color="getColorArea(area.ingresoTotal)" size="48" variant="tonal" rounded="lg">
                  <v-icon icon="mdi-store" size="24" />
                </v-avatar>
              </div>
            </v-card-text>

            <!-- Métricas -->
            <v-card-text class="pa-4">
              <!-- Ingresos Entregado -->
              <div class="mb-4">
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2">Entregados</span>
                  <span class="text-body-2 font-weight-bold">
                    ${{ formatearMoneda(area.ingresoEntregado) }}
                  </span>
                </div>
                <v-progress-linear
                  :model-value="(area.ingresoEntregado / area.ingresoTotal) * 100"
                  color="success"
                  height="6"
                />
              </div>

              <!-- Ingresos Pendiente -->
              <div class="mb-4">
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2">Pendiente/Preparación</span>
                  <span class="text-body-2 font-weight-bold">
                    ${{ formatearMoneda(area.ingresoPendiente) }}
                  </span>
                </div>
                <v-progress-linear
                  :model-value="(area.ingresoPendiente / area.ingresoTotal) * 100"
                  color="warning"
                  height="6"
                />
              </div>

              <!-- Ticket Promedio -->
              <div class="mb-4">
                <div class="d-flex justify-space-between mb-1">
                  <span class="text-caption text-medium-emphasis">Ticket Promedio</span>
                  <span class="text-caption font-weight-bold">
                    ${{ formatearMoneda(area.ticketPromedio) }}
                  </span>
                </div>
              </div>

              <!-- Tasa Entrega -->
              <div class="mb-4">
                <div class="d-flex justify-space-between mb-1">
                  <span class="text-caption text-medium-emphasis">Tasa Entrega</span>
                  <v-chip
                    size="small"
                    :color="getTasaColor(area.tasaEntrega)"
                    variant="tonal"
                  >
                    {{ area.tasaEntrega.toFixed(1) }}%
                  </v-chip>
                </div>
              </div>

              <!-- Contadores de Estado -->
              <div class="border-top pt-3">
                <div class="text-caption font-weight-bold mb-2">Por Estado</div>
                <div class="d-flex gap-1 flex-wrap">
                  <v-chip
                    size="small"
                    variant="flat"
                    color="warning"
                  >
                    Pendiente: {{ area.contadores.pendiente }}
                  </v-chip>
                  <v-chip
                    size="small"
                    variant="flat"
                    color="info"
                  >
                    Prep: {{ area.contadores.en_preparacion }}
                  </v-chip>
                  <v-chip
                    size="small"
                    variant="flat"
                    color="success"
                  >
                    Listo: {{ area.contadores.listo }}
                  </v-chip>
                  <v-chip
                    size="small"
                    variant="flat"
                    color="success"
                  >
                    Entregado: {{ area.contadores.entregado }}
                  </v-chip>
                </div>
              </div>
            </v-card-text>

            <!-- Botón para ir a reporte del área -->
            <v-card-actions>
              <v-btn
                :to="`/dashboard/admin/reportes/servicios/${area.categoria}`"
                color="primary"
                variant="text"
                size="small"
              >
                Ver Detalle
                <v-icon icon="mdi-chevron-right" size="small" />
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Gráfico global -->
      <div class="mt-8">
        <ReporteGraficos :tendencias="tendencias" />
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
import ReporteTablaAreas from '~/components/reportes/ReporteTablaAreas.vue'
import ReporteGraficos from '~/components/reportes/ReporteGraficos.vue'

const authStore = useAuthStore()
const adminReportesComposable = useAdminReportes()

// State
const loading = ref(false)

// Computed
const tieneReporte = computed(() => !!adminReportesComposable.reporte.value)
const areasDetalle = computed(() => adminReportesComposable.reporte.value?.areasDetalle || [])
const tendencias = computed(() => adminReportesComposable.reporte.value?.tendencias || [])

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

const getTasaColor = (tasa: number): string => {
  if (tasa >= 90) return 'success'
  if (tasa >= 75) return 'warning'
  return 'error'
}

const getColorArea = (ingresos: number): string => {
  if (ingresos > 1000) return 'success'
  if (ingresos > 500) return 'info'
  return 'warning'
}

// Lifecycle
onMounted(async () => {
  await cargarReporte()
})
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card-glow:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}

.border-top {
  border-top: 1px solid #e0e0e0;
}

.gap-1 {
  gap: 0.25rem;
}

.h-100 {
  height: 100%;
}
</style>
