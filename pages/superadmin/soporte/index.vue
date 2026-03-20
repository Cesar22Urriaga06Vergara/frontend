<template>
  <div class="soporte-page">
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">Soporte y Debugging</h1>
      <p class="text-gray-600 dark:text-gray-400">Herramientas avanzadas para soporte y troubleshooting</p>
    </div>

    <!-- Tabs -->
    <v-tabs v-model="tabActiva" class="mb-6">
      <v-tab value="impersonacion" prepend-icon="mdi-account-switch">
        Impersonaciones ({{ impersonacionesActivas.length }})
      </v-tab>
      <v-tab value="logs" prepend-icon="mdi-file-document">
        Logs del Sistema
      </v-tab>
    </v-tabs>

    <!-- Tab Impersonaciones -->
    <div v-if="tabActiva === 'impersonacion'" class="space-y-6">
      <!-- Impersonaciones Activas -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Sesiones Activas ({{ impersonacionesActivas.length }})
        </h2>

        <div v-if="impersonacionesActivas.length === 0" class="text-center py-8 text-gray-500">
          No hay sesiones activas de impersonación
        </div>

        <div v-else class="space-y-4">
          <div v-for="imp in impersonacionesActivas" :key="imp.hotelId" class="border border-orange-300 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">{{ imp.hotelNombre }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Iniciada por: <strong>{{ imp.usuarioSuperAdmin }}</strong>
                </p>
                <p class="text-xs text-gray-500 mt-2">
                  IP: {{ imp.ipOrigen }} | {{ new Date(imp.fechaInicio).toLocaleString('es-CO') }}
                </p>
              </div>
              <v-btn color="orange" @click="terminarImpersonacion(imp.hotelId)">
                Terminar
              </v-btn>
            </div>
          </div>
        </div>
      </div>

      <!-- Generar nueva impersonación -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Impersonar Hotel
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Selecciona un hotel para acceder como SuperAdmin en su contexto
        </p>
        <div class="flex gap-4">
          <v-autocomplete
            v-model="hotelSeleccionadoId"
            :items="hotelesDisponibles"
            item-title="nombre"
            item-value="id"
            label="Seleccionar hotel"
            class="flex-1"
          ></v-autocomplete>
          <v-btn color="primary" @click="hotelSeleccionadoId && impersonarHotel(hotelSeleccionadoId)" :disabled="!hotelSeleccionadoId">
            Impersonar
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Tab Logs -->
    <div v-if="tabActiva === 'logs'" class="space-y-6">
      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filtros</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <v-select
            v-model="filtroSeveridad"
            :items="['todos', 'info', 'warning', 'error', 'critical']"
            label="Severidad"
            @update:model-value="filtrarPorSeveridad"
          ></v-select>
          <v-select
            v-model="filtroTipoEvento"
            :items="['todos', 'login', 'cambio_config', 'error', 'acceso_recurso', 'cambio_estado']"
            label="Tipo de Evento"
            @update:model-value="filtrarPorTipoEvento"
          ></v-select>
        </div>
        <v-btn color="primary" @click="exportarLogs('csv')" prepend-icon="mdi-download" class="mt-4">
          Descargar CSV
        </v-btn>
      </div>

      <!-- Tabla de Logs -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <v-table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo Evento</th>
              <th>Descripción</th>
              <th>Severidad</th>
              <th>Hotel/Usuario</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logsActivos" :key="log.id">
              <td class="text-sm">{{ new Date(log.fechaCreacion).toLocaleString('es-CO') }}</td>
              <td>
                <v-chip size="small" variant="outlined">{{ log.tipoEvento }}</v-chip>
              </td>
              <td class="text-sm">{{ log.descripcion }}</td>
              <td>
                <v-chip
                  :color="log.nivelSeveridad === 'critical' ? 'red' : log.nivelSeveridad === 'error' ? 'orange' : log.nivelSeveridad === 'warning' ? 'amber' : 'blue'"
                  size="small"
                  text-color="white"
                >
                  {{ log.nivelSeveridad }}
                </v-chip>
              </td>
              <td class="text-sm">
                <span v-if="log.hotelId">Hotel {{ log.hotelId }}</span>
                <span v-else-if="log.usuarioId">Usuario {{ log.usuarioId }}</span>
                <span v-else>Sistema</span>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSuperAdminSoporte } from '~/composables/useSuperAdminSoporte'

import { UserRole } from '~/types/auth'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.SUPERADMIN],
  layout: 'default'
})

const {
  impersonacionesActivas,
  logsActivos,
  filtroSeveridad,
  filtroTipoEvento,
  obtenerImpersonacionesActivas,
  impersonarHotel,
  terminarImpersonacion,
  obtenerLogs,
  filtrarPorSeveridad,
  filtrarPorTipoEvento,
  exportarLogs
} = useSuperAdminSoporte()

const tabActiva = ref('impersonacion')
const hotelSeleccionadoId = ref<number | null>(null)
const hotelesDisponibles = ref([
  { id: 1, nombre: 'Hotel Premium' },
  { id: 2, nombre: 'Hotel Standard' },
  { id: 3, nombre: 'Hotel Económico' }
])

onMounted(async () => {
  await obtenerImpersonacionesActivas()
  await obtenerLogs()
})
</script>

<style scoped>
.soporte-page {
  padding: 2rem;
}
</style>
