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
              <div class="text-caption text-medium-emphasis mb-1">Ingresos</div>
              <div class="text-h6 font-weight-bold">${{ totalIngresos }}</div>
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
              <div class="text-caption text-medium-emphasis mb-1">Ocupación</div>
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
        Detalles del Período
      </v-card-title>
      <v-card-text class="pa-0">
        <v-data-table
          :headers="headersDetalles"
          :items="detallesReporte"
          :loading="loading"
          class="elevation-0"
        />
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
import { ref } from 'vue'
import { UserRole } from '~/types/auth'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN],
})

useHead({ title: 'Reportes y Análisis' })

const loading = ref(false)
const periodoReporte = ref('mes_actual')
const tipoReporte = ref('general')

const periodosOptions = [
  { title: 'Mes Actual', value: 'mes_actual' },
  { title: 'Mes Anterior', value: 'mes_anterior' },
  { title: 'Últimos 3 meses', value: 'trimestre' },
  { title: 'Año', value: 'año' },
  { title: 'Personalizado', value: 'personalizado' },
]

const tiposReporte = [
  { title: 'General', value: 'general' },
  { title: 'Ocupación', value: 'ocupacion' },
  { title: 'Ingresos', value: 'ingresos' },
  { title: 'Servicios', value: 'servicios' },
]

// Datos simulados
const totalReservas = ref(45)
const totalIngresos = ref('12,500')
const tasaOcupacion = ref(78)
const averageDailyRate = ref('285')

const headersDetalles = [
  { title: 'Fecha', key: 'fecha' },
  { title: 'Reservas', key: 'reservas' },
  { title: 'Check-in', key: 'checkin' },
  { title: 'Check-out', key: 'checkout' },
  { title: 'Ingresos', key: 'ingresos' },
  { title: 'Ocupación', key: 'ocupacion' },
]

const detallesReporte = ref([])

const refrescarReportes = async () => {
  loading.value = true
  try {
    // Cargar datos del reporte
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>

