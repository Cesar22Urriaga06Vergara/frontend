<template>
  <div class="metricas-page">
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">Métricas de la Plataforma</h1>
      <p class="text-gray-600 dark:text-gray-400">Análisis de crecimiento y uso de la plataforma</p>
    </div>

    <!-- Controles -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
      <div class="flex items-center gap-4">
        <span class="text-sm font-semibold">Período:</span>
        <v-btn-toggle
          v-model="periodoCrecimiento"
          @update:model-value="cambiarPeriodoCrecimiento"
          color="primary"
          variant="outlined"
          group
        >
          <v-btn value="mes">Mes</v-btn>
          <v-btn value="trimestre">Trimestre</v-btn>
          <v-btn value="año">Año</v-btn>
        </v-btn-toggle>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="exportarMetricas('pdf')" prepend-icon="mdi-file-pdf">
          Exportar PDF
        </v-btn>
        <v-btn color="primary" variant="outlined" @click="exportarMetricas('csv')" prepend-icon="mdi-file-csv">
          Exportar CSV
        </v-btn>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Hoteles en el tiempo -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hoteles Activos</h3>
        <div class="h-40 flex items-center justify-center text-gray-500">
          [Gráfico de línea - Hoteles en el tiempo]
        </div>
      </div>

      <!-- Usuarios agregados -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Usuarios Nuevos</h3>
        <div class="h-40 flex items-center justify-center text-gray-500">
          [Gráfico de línea - Usuarios nuevos]
        </div>
      </div>

      <!-- Ingresos -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ingresos SaaS</h3>
        <div class="h-40 flex items-center justify-center text-gray-500">
          [Gráfico de columnas - Ingresos]
        </div>
      </div>

      <!-- Distribución por Plan -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribución por Plan</h3>
        <div class="h-40 flex items-center justify-center text-gray-500">
          [Gráfico de pastel - Planes]
        </div>
      </div>
    </div>

    <!-- Tabla de Crecimiento Detallado -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Datos Detallados</h3>
      </div>
      <v-table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th class="text-right">Hoteles</th>
            <th class="text-right">Usuarios</th>
            <th class="text-right">Ingresos (COP)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="metricasCrecimiento?.datos" v-for="dato in metricasCrecimiento.datos" :key="String(dato.fecha)">
            <td>{{ new Date(dato.fecha).toLocaleDateString('es-CO') }}</td>
            <td class="text-right">{{ dato.hoteles }}</td>
            <td class="text-right">{{ dato.usuarios }}</td>
            <td class="text-right">${{ dato.ingresos.toLocaleString('es-CO') }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSuperAdminMetricas } from '~/composables/useSuperAdminMetricas'

definePageMeta({
  middleware: ['auth'],
  layout: 'default'
})

const {
  metricasCrecimiento,
  periodoCrecimiento,
  obtenerMetricasCrecimiento,
  cambiarPeriodoCrecimiento,
  exportarMetricas
} = useSuperAdminMetricas()

onMounted(() => {
  obtenerMetricasCrecimiento('mes')
})
</script>

<style scoped>
.metricas-page {
  padding: 2rem;
}
</style>
