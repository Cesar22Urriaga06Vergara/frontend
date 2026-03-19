<template>
  <div class="pa-4">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold mb-1">Reportes de Incidencias</h1>
      <p class="text-body-2 text-medium-emphasis">Consolidado de todas las incidencias del hotel</p>
    </div>

    <!-- Filtros de fecha -->
    <v-card class="mb-6" variant="outlined">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="desde"
              label="Desde"
              type="date"
              @update:model-value="cargarEstadisticas"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="hasta"
              label="Hasta"
              type="date"
              @update:model-value="cargarEstadisticas"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Loading -->
    <div v-if="composable.loading.value" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" :size="60" />
      <p class="text-center mt-4 text-medium-emphasis">Cargando reportes...</p>
    </div>

    <!-- Contenido -->
    <div v-else-if="composable.estadisticas.value">
      <!-- KPIs Principales -->
      <v-row class="mb-8">
        <v-col cols="12" sm="6" md="3">
          <v-card class="card-glow pa-4">
            <div class="text-caption text-medium-emphasis">Total de Incidencias</div>
            <div class="text-h5 font-weight-bold mt-2">{{ composable.estadisticas.value.kpis.totalIncidencias }}</div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="card-glow pa-4">
            <div class="text-caption text-medium-emphasis">Activas</div>
            <div class="text-h5 font-weight-bold mt-2 text-warning">{{ composable.estadisticas.value.kpis.incidenciasActivas }}</div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="card-glow pa-4">
            <div class="text-caption text-medium-emphasis">Resueltas</div>
            <div class="text-h5 font-weight-bold mt-2 text-success">{{ composable.estadisticas.value.kpis.incidenciasResueltas }}</div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="card-glow pa-4">
            <div class="text-caption text-medium-emphasis">Tiempo Promedio (hs)</div>
            <div class="text-h5 font-weight-bold mt-2">{{ composable.estadisticas.value.kpis.tiempoPromedioResolucion }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Por Estado -->
      <v-row class="mb-8">
        <v-col cols="12" md="6">
          <v-card class="card-glow pa-4">
            <div class="text-subtitle-2 font-weight-bold mb-4">Incidencias por Estado</div>
            <div class="d-flex flex-column gap-3">
              <div
                v-for="(count, estado) in composable.estadisticas.value.incidenciasPorEstado"
                :key="estado"
                class="d-flex align-center justify-space-between py-2 px-2 rounded-lg"
                :style="{ backgroundColor: colorEstadoBg(estado) }"
              >
                <span class="text-body-2 font-weight-bold">{{ labelEstado(estado) }}</span>
                <v-chip :color="colorEstado(estado)" text-color="white" size="small">
                  {{ count }}
                </v-chip>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="card-glow pa-4">
            <div class="text-subtitle-2 font-weight-bold mb-4">Cargos a Clientes</div>
            <div class="text-h5 font-weight-bold text-error">
              ${{ formatearMoneda(composable.estadisticas.value.kpis.cargoTotal) }}
            </div>
            <p class="text-caption text-medium-emphasis mt-2">Monto total de cargos por daños</p>
          </v-card>
        </v-col>
      </v-row>

      <!-- Por Área -->
      <v-card class="card-glow pa-4 mb-8">
        <div class="text-subtitle-2 font-weight-bold mb-4">Incidencias por Área</div>
        <v-table class="elevation-0">
          <thead>
            <tr>
              <th class="text-left">Área</th>
              <th class="text-center">Total</th>
              <th class="text-center">Resueltas</th>
              <th class="text-center">Activas</th>
              <th class="text-right">Cargo Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(datos, area) in composable.estadisticas.value.incidenciasPorArea" :key="area">
              <td class="text-left font-weight-bold">{{ formatearArea(area) }}</td>
              <td class="text-center">{{ datos.total }}</td>
              <td class="text-center">
                <v-chip color="success" text-color="white" size="small">{{ datos.resueltas }}</v-chip>
              </td>
              <td class="text-center">
                <v-chip color="warning" text-color="white" size="small">{{ datos.activas }}</v-chip>
              </td>
              <td class="text-right font-weight-bold">${{ formatearMoneda(datos.cargoTotal) }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <!-- Por Tipo -->
      <v-card class="card-glow pa-4">
        <div class="text-subtitle-2 font-weight-bold mb-4">Incidencias por Tipo</div>
        <v-table class="elevation-0">
          <thead>
            <tr>
              <th class="text-left">Tipo</th>
              <th class="text-center">Total</th>
              <th class="text-center">Resueltas</th>
              <th class="text-center">% Resolución</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(datos, tipo) in composable.estadisticas.value.incidenciasPorTipo" :key="tipo">
              <td class="text-left font-weight-bold">{{ formatearTipo(tipo) }}</td>
              <td class="text-center">{{ datos.total }}</td>
              <td class="text-center">
                <v-chip color="success" text-color="white" size="small">{{ datos.resueltas }}</v-chip>
              </td>
              <td class="text-center">
                {{ datos.total > 0 ? Math.round((datos.resueltas / datos.total) * 100) : 0 }}%
              </td>
            </tr>
          </tbody>
        </v-table>
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
import { ref, onMounted } from 'vue'
import { useIncidencias } from '~/composables/useIncidencias'

definePageMeta({
  middleware: 'auth',
})

const composable = useIncidencias()

// State
const desde = ref<string>('')
const hasta = ref<string>('')

// Métodos
const cargarEstadisticas = async () => {
  const desdeDate = desde.value ? new Date(desde.value) : undefined
  const hastaDate = hasta.value ? new Date(hasta.value) : undefined
  await composable.obtenerEstadisticas(desdeDate, hastaDate)
}

const colorEstado = (estado: string): string => {
  const colores: Record<string, string> = {
    reported: 'error',
    in_progress: 'warning',
    resolved: 'success',
    cancelled: 'surface',
  }
  return colores[estado] || 'surface'
}

const colorEstadoBg = (estado: string): string => {
  const colores: Record<string, string> = {
    reported: '#ffebee',
    in_progress: '#fff3e0',
    resolved: '#e8f5e9',
    cancelled: '#f5f5f5',
  }
  return colores[estado] || '#f5f5f5'
}

const labelEstado = (estado: string): string => {
  const labels: Record<string, string> = {
    reported: 'Reportado',
    in_progress: 'En Progreso',
    resolved: 'Resuelto',
    cancelled: 'Cancelado',
  }
  return labels[estado] || estado
}

const formatearArea = (area: string): string => {
  const labels: Record<string, string> = {
    mantenimiento: 'Mantenimiento',
    plomeria: 'Plomería',
    limpieza: 'Limpieza',
    electricidad: 'Electricidad',
    seguridad: 'Seguridad',
    otro: 'Otro',
  }
  return labels[area] || area
}

const formatearTipo = (tipo: string): string => {
  const labels: Record<string, string> = {
    daño: 'Daño',
    mantenimiento: 'Mantenimiento',
    limpieza: 'Limpieza',
    cliente_complaint: 'Queja del Cliente',
    otros: 'Otro',
  }
  return labels[tipo] || tipo
}

const formatearMoneda = (valor: number): string => {
  return parseInt(String(valor)).toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Lifecycle
onMounted(async () => {
  await cargarEstadisticas()
})
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.gap-3 {
  gap: 1rem;
}
</style>
