<template>
  <div class="pa-4">
    <!-- Header -->
    <div class="mb-6">
      <v-breadcrumbs
        :items="[
          { title: 'Dashboard', href: '/dashboard/empleado' },
          { title: 'Reportes', href: '/dashboard/empleado/reportes' },
          { title: formatearCategoria(categoria), disabled: true },
        ]"
        divider="/"
      />
      <h1 class="text-h4 font-weight-bold mt-2 mb-1">
        Reporte - {{ formatearCategoria(categoria) }}
      </h1>
      <p class="text-body-2 text-medium-emphasis">análisis detallado de pedidos y ingresos</p>
    </div>

    <!-- Filtros -->
    <ReporteFiltros
      :loading="loading"
      :tiene-reporte="tieneReporte"
      @actualizar="cargarReporte"
      @exportar="exportarCSV"
    />

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" :size="60" />
      <p class="text-center mt-4 text-medium-emphasis">Cargando reporte...</p>
    </div>

    <!-- Contenido -->
    <div v-else-if="tieneReporte">
      <!-- KPIs del Área -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <v-card class="card-glow pa-4">
            <div class="text-caption text-medium-emphasis mb-1">Total Pedidos</div>
            <div class="text-h5 font-weight-bold">{{ resumen?.contadores.total || 0 }}</div>
            <v-sparkline
              :value="[1, 2, 3, 2, 3, 4, 3]"
              color="primary"
              line-width="2"
              padding="8"
              class="mt-2"
            />
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="card-glow pa-4">
            <div class="text-caption text-medium-emphasis mb-1">Ingresos Total</div>
            <div class="text-h5 font-weight-bold text-success">
              ${{ formatearMoneda(resumen?.financiero.ingresoTotal || 0) }}
            </div>
            <v-sparkline
              :value="[2, 3, 4, 3, 4, 5, 4]"
              color="success"
              line-width="2"
              padding="8"
              class="mt-2"
            />
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="card-glow pa-4">
            <div class="text-caption text-medium-emphasis mb-1">Entregados</div>
            <div class="text-h5 font-weight-bold text-success">
              {{ resumen?.contadores.entregado || 0 }}
            </div>
            <div class="text-caption text-success mt-2">
              {{ getTasaEntrega(resumen) }}% de tasa
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="card-glow pa-4">
            <div class="text-caption text-medium-emphasis mb-1">Ticket Promedio</div>
            <div class="text-h5 font-weight-bold">
              ${{ formatearMoneda(resumen?.financiero.ticketPromedio || 0) }}
            </div>
            <v-sparkline
              :value="[3, 2, 1, 2, 2, 3, 2]"
              color="info"
              line-width="2"
              padding="8"
              class="mt-2"
            />
          </v-card>
        </v-col>
      </v-row>

      <!-- Tabla de Pedidos -->
      <v-card class="card-glow mb-6">
        <v-card-title class="text-subtitle-1 font-weight-bold">
          <v-icon icon="mdi-clipboard-list" class="mr-2" />
          Pedidos Detallados
        </v-card-title>

        <v-data-table
          :headers="headers"
          :items="detalle"
          density="compact"
          :items-per-page="10"
          class="elevation-0"
        >
          <template #item.totalPedido="{ item }">
            <span class="font-weight-bold text-success">
              ${{ formatearMoneda(item.totalPedido) }}
            </span>
          </template>

          <template #item.estadoPedido="{ item }">
            <v-chip :color="getColorEstado(item.estadoPedido)" size="small" variant="tonal">
              {{ formatearEstado(item.estadoPedido) }}
            </v-chip>
          </template>

          <template #item.fechaPedido="{ item }">
            {{ new Date(item.fechaPedido).toLocaleDateString('es-CO') }}
          </template>

          <template #item.items="{ item }">
            <span class="text-body-2">{{ item.items?.length || 0 }} artículos</span>
          </template>
        </v-data-table>
      </v-card>
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
import { useRoute } from 'vue-router'
import { useAreaReportes } from '~/composables/useAreaReportes'
import { useAuthStore } from '~/stores/auth'
import ReporteFiltros from '~/components/reportes/ReporteFiltros.vue'

const route = useRoute()
const authStore = useAuthStore()
const reportesComposable = useAreaReportes()

// Props desde URL
const categoria = computed(() => (route.params.categoria as string) || '')

// State
const loading = ref(false)

// Computed
const tieneReporte = reportesComposable.tieneReporte
const detalle = computed(() => reportesComposable.reporte.value || [])
const resumen = computed(() => reportesComposable.resumen.value)

// Headers de tabla
const headers: any[] = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Reserva', key: 'idReserva', sortable: true },
  { title: 'Total', key: 'totalPedido', sortable: true, align: 'end' },
  { title: 'Estado', key: 'estadoPedido', sortable: true },
  { title: 'Fecha', key: 'fechaPedido', sortable: true },
  { title: 'Items', key: 'items' },
]

// Actions
const cargarReporte = async (desde?: Date, hasta?: Date) => {
  if (!authStore.user?.idHotel) {
    console.error('No hotel ID')
    return
  }

  loading.value = true
  try {
    await reportesComposable.cargarReporte(
      authStore.user.idHotel,
      categoria.value,
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

const formatearEstado = (estado: string): string => {
  const estados: Record<string, string> = {
    pendiente: 'Pendiente',
    en_preparacion: 'En Preparación',
    listo: 'Listo',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  }
  return estados[estado] || estado
}

const getColorEstado = (estado: string): string => {
  const colores: Record<string, string> = {
    pendiente: 'warning',
    en_preparacion: 'info',
    listo: 'success',
    entregado: 'success',
    cancelado: 'error',
  }
  return colores[estado] || 'secondary'
}

const getTasaEntrega = (resumen: any): number => {
  if (!resumen) return 0
  const total = resumen.contadores.total
  if (total === 0) return 0
  return Number(((resumen.contadores.entregado / total) * 100).toFixed(1))
}

const exportarCSV = (): void => {
  reportesComposable.exportarCSV(`reporte-${categoria.value}.csv`)
}

// Lifecycle
onMounted(async () => {
  if (categoria.value) {
    await cargarReporte()
  }
})
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
