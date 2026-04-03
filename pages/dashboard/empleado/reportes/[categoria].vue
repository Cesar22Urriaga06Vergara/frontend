<template>
  <div>
    <PageHeader
      :title="`Reporte - ${formatearCategoria(categoria)}`"
      subtitle="Análisis detallado de pedidos e ingresos por categoría"
    />

    <!-- Filtros -->
    <SectionCard class="mb-6" title="Filtros" subtitle="Ajusta período y exporta resultados">
      <ReporteFiltros
        :loading="loading"
        :tiene-reporte="tieneReporte"
        @actualizar="cargarReporte"
        @exportar="exportarCSV"
      />
    </SectionCard>

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
          <StatCard label="Total pedidos" :value="resumen?.contadores.total || 0" icon="mdi-clipboard-list" color="primary" />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <StatCard
            label="Ingresos"
            :value="`$${formatearMoneda(resumen?.financiero.ingresoTotal || 0)}`"
            icon="mdi-cash"
            color="success"
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <StatCard
            label="Entregados"
            :value="resumen?.contadores.entregado || 0"
            icon="mdi-check-circle"
            color="info"
            :helper="`${getTasaEntrega(resumen)}% de tasa`"
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <StatCard
            label="Ticket promedio"
            :value="`$${formatearMoneda(resumen?.financiero.ticketPromedio || 0)}`"
            icon="mdi-chart-line"
            color="warning"
          />
        </v-col>
      </v-row>

      <StandardDataTable
        class="mb-6"
        title="Pedidos Detallados"
        subtitle="Desglose de pedidos e importes del período"
        :headers="headers"
        :items="detalle"
        :items-per-page="10"
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
      </StandardDataTable>
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
import { UserRole } from '~/types/auth'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import ReporteFiltros from '~/components/reportes/ReporteFiltros.vue'

definePageMeta({
  layout: 'operacion',
  middleware: ['auth', 'role'],
  roles: [UserRole.CAFETERIA, UserRole.LAVANDERIA, UserRole.SPA, UserRole.ROOM_SERVICE],
})

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
  } catch (_error) {
    // El composable ya expone el estado de error; evitamos romper el render.
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

