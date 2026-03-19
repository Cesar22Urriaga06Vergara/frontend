<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Reportes y Análisis</h1>
        <p class="text-body-2 text-medium-emphasis">
          Visualizar estadísticas y reportes del hotel
        </p>
      </div>
    </div>

    <!-- Filtros -->
    <v-card class="card-glow mb-6 pa-6">
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="periodoReporte"
            label="Período"
            :items="periodosOptions"
            @update:model-value="refrescarReportes"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="tipoReporte"
            label="Tipo de Reporte"
            :items="tiposReporte"
            @update:model-value="refrescarReportes"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Tarjetas de Estadísticas -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Reservas</div>
              <div class="text-h6 font-weight-bold">{{ totalReservas }}</div>
            </div>
            <v-avatar color="primary" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-calendar-check" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Ingresos Totales</div>
              <div class="text-h6 font-weight-bold text-success">${{ totalIngresos }}</div>
            </div>
            <v-avatar color="success" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-cash" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Tasa de Ocupación</div>
              <div class="text-h6 font-weight-bold">{{ tasaOcupacion }}%</div>
            </div>
            <v-avatar color="warning" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-percent" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">ADR</div>
              <div class="text-h6 font-weight-bold">${{ averageDailyRate }}</div>
            </div>
            <v-avatar color="info" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-chart-line" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Gráficos (Placeholder) -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="card-glow pa-6">
          <v-card-title class="text-subtitle-1 font-weight-bold mb-4">
            Ocupación Mensual
          </v-card-title>
          <v-card-text class="d-flex align-center justify-center" style="height: 300px">
            <p class="text-medium-emphasis">Gráfico de ocupación (implementar con Chart.js)</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="card-glow pa-6">
          <v-card-title class="text-subtitle-1 font-weight-bold mb-4">
            Ingresos por Tipo
          </v-card-title>
          <v-card-text class="d-flex align-center justify-center" style="height: 300px">
            <p class="text-medium-emphasis">Gráfico de ingresos (implementar con Chart.js)</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabla de Detalles -->
    <v-card class="card-glow mt-6">
      <v-card-title class="text-subtitle-1 font-weight-bold">
        Detalles del Período — {{ periodoReporte }}
      </v-card-title>
      <v-card-text class="pa-0">
        <v-data-table
          :headers="headersDetalles"
          :items="detallesReporte"
          :loading="reportesStore.loading"
          class="elevation-0"
          density="compact"
        />
      </v-card-text>
    </v-card>

    <!-- Resumen por Categoría de Servicios -->
    <v-card class="card-glow mt-6" v-if="resumenPorCategoria.length > 0">
      <v-card-title class="text-subtitle-1 font-weight-bold">
        Ingresos por Categoría de Servicios
      </v-card-title>
      <v-card-text>
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
      </v-card-text>
    </v-card>

    <!-- Actions -->
    <v-card class="card-glow mt-6 pa-6">
      <v-btn
        prepend-icon="mdi-download"
        color="primary"
        variant="tonal"
      >
        Descargar PDF
      </v-btn>
      <v-btn
        prepend-icon="mdi-file-excel"
        color="success"
        variant="tonal"
        class="ml-2"
      >
        Exportar Excel
      </v-btn>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { UserRole } from '~/types/auth'
import { useReportesStore } from '~/stores/reportes'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
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

onMounted(async () => {
  const idHotel = authStore.user?.idHotel
  if (idHotel) {
    await refrescarReportes()
  }
})

const refrescarReportes = async () => {
  const idHotel = authStore.user?.idHotel
  if (!idHotel) return

  try {
    const periodo = periodoReporte.value || undefined
    await reportesStore.cargarTodosLosReportes(idHotel, periodo)
  } catch (err) {
    console.error('Error al refrescar reportes:', err)
  }
}

// Computados para acceso fácil
const totalReservas = computed(() => reportesStore.totalReservas)
const totalIngresos = computed(() => reportesStore.totalIngresos.toFixed(2))
const tasaOcupacion = computed(() => reportesStore.tasaOcupacion.toFixed(2))
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
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>

