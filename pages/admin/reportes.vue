<template>
  <div>
    <PageHeader
      title="Reportes y Análisis"
      subtitle="Visualizar estadísticas consolidadas del hotel"
    >
      <template #status>
        <StatusBadge :status="viewState.status.value" />
      </template>
    </PageHeader>

    <SectionCard class="mb-6">
      <ActionToolbar>
        <template #filters>
          <v-select
            v-model="periodoReporte"
            label="Período"
            :items="periodosOptions"
            class="toolbar-field"
            :disabled="reportesStore.loading"
            @update:model-value="refrescarReportes"
          />
          <v-select
            v-model="tipoReporte"
            label="Tipo de Reporte"
            :items="tiposReporte"
            class="toolbar-field"
            :disabled="reportesStore.loading"
            @update:model-value="refrescarReportes"
          />
        </template>
        <template #actions>
          <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" :loading="reportesStore.loading" @click="refrescarReportes">
            Actualizar
          </v-btn>
        </template>
      </ActionToolbar>
    </SectionCard>

    <SectionCard v-if="viewState.isUnavailable.value || viewState.isError.value" :padded="false" class="mb-6">
      <EmptyState
        v-if="viewState.isUnavailable.value"
        icon="mdi-cloud-off-outline"
        title="Backend de reportes no disponible"
        description="El endpoint de estadísticas no está disponible por ahora para este hotel."
        action-label="Reintentar"
        @action="refrescarReportes"
      />
      <EmptyState
        v-else
        icon="mdi-alert-circle-outline"
        title="No fue posible cargar reportes"
        :description="reportesStore.error || 'Error inesperado consultando reportes'"
        action-label="Reintentar"
        @action="refrescarReportes"
      />
    </SectionCard>

    <template v-if="!viewState.isUnavailable.value && !viewState.isError.value">
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <StatCard
            label="Reservas"
            :value="totalReservas"
            icon="mdi-calendar-check"
            color="primary"
            :loading="reportesStore.loading"
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <StatCard
            label="Ingresos Totales"
            :value="`$${totalIngresos}`"
            icon="mdi-cash"
            color="success"
            :loading="reportesStore.loading"
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <StatCard
            label="Tasa de Ocupación"
            :value="`${tasaOcupacion}%`"
            icon="mdi-percent"
            color="warning"
            :loading="reportesStore.loading"
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <StatCard
            label="ADR"
            :value="`$${averageDailyRate}`"
            icon="mdi-chart-line"
            color="info"
            :loading="reportesStore.loading"
          />
        </v-col>
      </v-row>

      <SectionCard v-if="viewState.isEmpty.value" :padded="false" class="mb-6">
        <EmptyState
          icon="mdi-chart-box-outline"
          title="Sin datos para el período seleccionado"
          description="Ajusta filtros o espera nuevas transacciones para visualizar métricas."
        />
      </SectionCard>

      <template v-else>
        <v-row>
          <v-col cols="12" md="6">
            <SectionCard title="Ocupación Mensual" subtitle="Placeholder estructural para futura gráfica">
              <div class="d-flex align-center justify-center" style="height: 220px">
                <p class="text-medium-emphasis">Gráfico de ocupación pendiente de integración</p>
              </div>
            </SectionCard>
          </v-col>

          <v-col cols="12" md="6">
            <SectionCard title="Ingresos por Tipo" subtitle="Placeholder estructural para futura gráfica">
              <div class="d-flex align-center justify-center" style="height: 220px">
                <p class="text-medium-emphasis">Gráfico de ingresos pendiente de integración</p>
              </div>
            </SectionCard>
          </v-col>
        </v-row>

        <StandardDataTable
          class="mt-6"
          :title="`Detalles del período — ${periodoReporte}`"
          subtitle="Comparativo de reservas y servicios"
          :headers="headersDetalles"
          :items="detallesReporte"
          :loading="reportesStore.loading"
          :items-per-page="6"
          empty-icon="mdi-table-off"
          empty-title="Sin detalles para el período"
          empty-description="Modifica los filtros para consultar más información."
        />

        <SectionCard class="mt-6" v-if="resumenPorCategoria.length > 0" title="Ingresos por Categoría de Servicios">
          <v-list density="compact">
            <v-list-item
              v-for="(item, idx) in resumenPorCategoria"
              :key="idx"
            >
              <template #prepend>
                <v-avatar
                  :color="['primary', 'success', 'warning', 'info', 'error'][idx % 5]"
                  size="small"
                  variant="tonal"
                >
                  <v-icon icon="mdi-tag" size="18" />
                </v-avatar>
              </template>
              <v-list-item-title>{{ item.categoria }}</v-list-item-title>
              <template #append>
                <div class="text-right">
                  <div class="text-body-2 font-weight-bold">{{ item.ingreso }}</div>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </SectionCard>

        <SectionCard class="mt-6">
          <v-btn prepend-icon="mdi-download" color="primary" variant="tonal">
            Descargar PDF
          </v-btn>
          <v-btn prepend-icon="mdi-file-excel" color="success" variant="tonal" class="ml-2">
            Exportar Excel
          </v-btn>
        </SectionCard>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { UserRole } from '~/types/auth'
import { useViewState } from '~/composables/useViewState'
import { useReportesStore } from '~/stores/reportes'
import { useAuthStore } from '~/stores/auth'
import PageHeader from '~/components/shared/PageHeader.vue'
import StatusBadge from '~/components/shared/StatusBadge.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import ActionToolbar from '~/components/shared/ActionToolbar.vue'
import StatCard from '~/components/shared/StatCard.vue'
import EmptyState from '~/components/shared/EmptyState.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN, UserRole.SUPERADMIN],
})

useHead({ title: 'Reportes y Análisis' })

const authStore = useAuthStore()
const reportesStore = useReportesStore()

const periodoReporte = ref('mes_actual')
const tipoReporte = ref('general')

const periodosOptions = [
  { title: 'Mes Actual', value: 'mes_actual' },
  { title: 'Trimestre Actual', value: 'trimestre_actual' },
  { title: 'Año Actual', value: 'anio_actual' },
  { title: 'Todos los períodos', value: null },
]

const tiposReporte = [
  { title: 'General', value: 'general' },
  { title: 'Reservas', value: 'reservas' },
  { title: 'Servicios', value: 'servicios' },
]

const headersDetalles = [
  { title: 'Métrica', key: 'metrica', width: '40%' },
  { title: 'Reservas', key: 'reservas', align: 'end' as const },
  { title: 'Servicios', key: 'servicios', align: 'end' as const },
  { title: 'Total', key: 'total', align: 'end' as const },
]

const hasData = computed(() => {
  return Number(reportesStore.totalReservas) > 0 || Object.keys(reportesStore.resumenPorCategoria || {}).length > 0
})
const viewState = useViewState(
  computed(() => reportesStore.loading),
  hasData,
  computed(() => reportesStore.error),
  computed(() => reportesStore.unavailable),
)

onMounted(async () => {
  const idHotel = authStore.user?.idHotel
  if (idHotel) {
    try {
      await refrescarReportes()
    } catch (_error) {
      // El store ya marca error/unavailable; evitamos romper render por rechazo no controlado.
    }
  }
})

const refrescarReportes = async () => {
  const idHotel = authStore.user?.idHotel
  if (!idHotel) return

  const periodo = periodoReporte.value || undefined
  await reportesStore.cargarTodosLosReportes(idHotel, periodo)
}

const totalReservas = computed(() => reportesStore.totalReservas)
const totalIngresos = computed(() => reportesStore.totalIngresos.toFixed(2))
const tasaOcupacion = computed(() => Number(reportesStore.tasaOcupacion || 0).toFixed(2))
const averageDailyRate = computed(() => reportesStore.adr)

const detallesReporte = computed(() => {
  const res = reportesStore.estadisticasReservas
  const serv = reportesStore.estadisticasServicios

  return [
    {
      metrica: 'Total de Transacciones',
      reservas: res.totalReservas || 0,
      servicios: serv.totalPedidos || 0,
      total: (res.totalReservas || 0) + (serv.totalPedidos || 0),
    },
    {
      metrica: 'Confirmadas/Entregadas',
      reservas: res.reservasConfirmadas || 0,
      servicios: serv.pedidosEntregados || 0,
      total: (res.reservasConfirmadas || 0) + (serv.pedidosEntregados || 0),
    },
    {
      metrica: 'Completadas',
      reservas: res.reservasCompletadas || 0,
      servicios: '-',
      total: res.reservasCompletadas || 0,
    },
    {
      metrica: 'Canceladas',
      reservas: res.reservasCanceladas || 0,
      servicios: serv.pedidosCancelados || 0,
      total: (res.reservasCanceladas || 0) + (serv.pedidosCancelados || 0),
    },
    {
      metrica: 'Ingresos Brutos',
      reservas: `$${(res.ingresosBrutos || 0).toFixed(2)}`,
      servicios: `$${(serv.ingresosBrutos || 0).toFixed(2)}`,
      total: `$${reportesStore.totalIngresos.toFixed(2)}`,
    },
    {
      metrica: 'Ticket Promedio',
      reservas: `$${((res.ingresosBrutos || 0) / (res.totalReservas || 1)).toFixed(2)}`,
      servicios: `$${serv.ticketPromedio?.toFixed(2) || '0.00'}`,
      total: '-',
    },
  ]
})

const resumenPorCategoria = computed(() => {
  const categorias = reportesStore.resumenPorCategoria
  return Object.entries(categorias).map(([categoria, monto]) => ({
    categoria: categoria.charAt(0).toUpperCase() + categoria.slice(1),
    ingreso: `$${monto}`,
    montoNumerado: monto as number,
  }))
})
</script>

<style scoped>
.toolbar-field {
  width: 240px;
  max-width: 100%;
}
</style>

