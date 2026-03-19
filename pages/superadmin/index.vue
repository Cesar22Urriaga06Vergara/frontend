<template>
  <div class="superadmin-dashboard">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Dashboard SaaS
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Panel de control general de la plataforma
      </p>
    </div>

    <!-- Métricas principales -->
    <div v-if="!isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Hoteles Activos -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 dark:text-gray-400 text-sm font-medium">Hoteles Activos</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {{ metricasPlataforma?.hotelesActivos || 0 }}
            </p>
          </div>
          <div class="bg-blue-100 dark:bg-blue-900 p-4 rounded-full">
            <v-icon class="text-blue-600 dark:text-blue-400 text-2xl">mdi-hotel</v-icon>
          </div>
        </div>
        <p class="text-green-600 text-xs mt-4">
          ↑ {{ tendencias.hotelesArquivo }}% esta semana
        </p>
      </div>

      <!-- Usuarios Totales -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 dark:text-gray-400 text-sm font-medium">Usuarios Totales</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {{ metricasPlataforma?.usuariosTotales || 0 }}
            </p>
          </div>
          <div class="bg-purple-100 dark:bg-purple-900 p-4 rounded-full">
            <v-icon class="text-purple-600 dark:text-purple-400 text-2xl">mdi-account-multiple</v-icon>
          </div>
        </div>
        <p class="text-green-600 text-xs mt-4">
          ↑ {{ tendencias.usuariosAñadidos }} nuevos usuarios
        </p>
      </div>

      <!-- Servicios Activos -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 dark:text-gray-400 text-sm font-medium">Servicios Activos</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {{ metricasPlataforma?.serviciosActivos || 0 }}
            </p>
          </div>
          <div class="bg-green-100 dark:bg-green-900 p-4 rounded-full">
            <v-icon class="text-green-600 dark:text-green-400 text-2xl">mdi-briefcase</v-icon>
          </div>
        </div>
        <p class="text-green-600 text-xs mt-4">
          ↑ {{ tendencias.serviciosNuevos }} nuevos
        </p>
      </div>

      <!-- Ingresos SaaS -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 dark:text-gray-400 text-sm font-medium">Ingresos SaaS</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              ${{ formatCurrency(metricasPlataforma?.ingresosSaaS || 0) }}
            </p>
          </div>
          <div class="bg-orange-100 dark:bg-orange-900 p-4 rounded-full">
            <v-icon class="text-orange-600 dark:text-orange-400 text-2xl">mdi-cash-multiple</v-icon>
          </div>
        </div>
        <p class="text-green-600 text-xs mt-4">
          ↑ ${{ formatCurrency(tendencias.ingresosMes) }} este mes
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="flex items-center justify-center py-16">
      <v-progress-circular indeterminate size="48" class="mr-4"></v-progress-circular>
      <span class="text-gray-600 dark:text-gray-400">Cargando métricas...</span>
    </div>

    <!-- Acciones Rápidas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Crear Hotel -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer" @click="navigateTo('/superadmin/hoteles')">
        <v-icon class="text-2xl text-blue-600 dark:text-blue-400 mb-2">mdi-plus-circle</v-icon>
        <h3 class="font-semibold text-gray-900 dark:text-white">Crear Hotel</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">Registrar nuevo hotel</p>
      </div>

      <!-- Gestionar Planes -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer" @click="navigateTo('/superadmin/planes')">
        <v-icon class="text-2xl text-purple-600 dark:text-purple-400 mb-2">mdi-layers</v-icon>
        <h3 class="font-semibold text-gray-900 dark:text-white">Gestionar Planes</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">Crear y editar planes</p>
      </div>

      <!-- Ver Métricas -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer" @click="navigateTo('/superadmin/metricas')">
        <v-icon class="text-2xl text-orange-600 dark:text-orange-400 mb-2">mdi-chart-line</v-icon>
        <h3 class="font-semibold text-gray-900 dark:text-white">Ver Métricas</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">Análisis de crecimiento</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSuperAdminMetricas } from '~/composables/useSuperAdminMetricas'

definePageMeta({
  middleware: ['auth'],
  layout: 'default'
})

const { metricasPlataforma, isLoading, obtenerMetricasPlataforma } = useSuperAdminMetricas()

const tendencias = ref({
  hotelesArquivo: 12,
  usuariosAñadidos: 245,
  serviciosNuevos: 34,
  ingresosMes: 15000
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

onMounted(async () => {
  await obtenerMetricasPlataforma()
})
</script>

<style scoped>
.superadmin-dashboard {
  padding: 2rem;
}
</style>
