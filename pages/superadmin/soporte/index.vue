<template>
  <div>
    <PageHeader
      title="Soporte y Debugging"
      subtitle="Herramientas avanzadas para soporte, trazabilidad y troubleshooting"
    />

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Impersonaciones" :value="impersonacionesActivas.length" icon="mdi-account-switch" color="warning" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Logs" :value="logsActivos.length" icon="mdi-file-document" color="info" />
      </v-col>
    </v-row>

    <v-alert
      type="info"
      variant="tonal"
      class="mb-6"
      prepend-icon="mdi-clock-alert-outline"
    >
      <strong>Módulo en despliegue.</strong> La impersonación de hoteles y los logs del sistema están en desarrollo. Las acciones de este módulo no tendrán efecto hasta que el backend de soporte esté disponible.
    </v-alert>


    <SectionCard class="mb-6" title="Módulos de soporte" subtitle="Selecciona el flujo a gestionar">
      <v-tabs v-model="tabActiva">
        <v-tab value="impersonacion" prepend-icon="mdi-account-switch">
          Impersonaciones ({{ impersonacionesActivas.length }})
        </v-tab>
        <v-tab value="logs" prepend-icon="mdi-file-document">
          Logs del Sistema
        </v-tab>
      </v-tabs>
    </SectionCard>

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

      <StandardDataTable
        title="Logs del sistema"
        subtitle="Trazas operativas filtradas por severidad y tipo"
        :headers="logsHeaders"
        :items="logsActivos"
        :items-per-page="12"
        empty-title="No hay logs disponibles"
        empty-description="El backend de logs aún no está activo."
      >
        <template #item.fechaCreacion="{ item }">
          {{ new Date(item.fechaCreacion).toLocaleString('es-CO') }}
        </template>
        <template #item.tipoEvento="{ item }">
          <v-chip size="small" variant="outlined">{{ item.tipoEvento }}</v-chip>
        </template>
        <template #item.nivelSeveridad="{ item }">
          <v-chip
            :color="item.nivelSeveridad === 'critical' ? 'red' : item.nivelSeveridad === 'error' ? 'orange' : item.nivelSeveridad === 'warning' ? 'amber' : 'blue'"
            size="small"
            text-color="white"
          >
            {{ item.nivelSeveridad }}
          </v-chip>
        </template>
        <template #item.origen="{ item }">
          <span v-if="item.hotelId">Hotel {{ item.hotelId }}</span>
          <span v-else-if="item.usuarioId">Usuario {{ item.usuarioId }}</span>
          <span v-else>Sistema</span>
        </template>
      </StandardDataTable>
    </div>

    <StandardDataTable
      class="mt-6"
      title="Resumen de soporte"
      subtitle="Estado de módulos operativos"
      :headers="resumenHeaders"
      :items="resumenItems"
      :items-per-page="5"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import { useSuperAdminSoporte } from '~/composables/useSuperAdminSoporte'
import { useSuperAdminHoteles } from '~/composables/useSuperAdminHoteles'
import { UserRole } from '~/types/auth'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.SUPERADMIN],
  layout: 'superadmin'
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

const logsHeaders = [
  { title: 'Fecha', key: 'fechaCreacion' },
  { title: 'Tipo Evento', key: 'tipoEvento' },
  { title: 'Descripción', key: 'descripcion' },
  { title: 'Severidad', key: 'nivelSeveridad' },
  { title: 'Origen', key: 'origen' },
]

const resumenHeaders = [
  { title: 'Módulo', key: 'modulo' },
  { title: 'Total', key: 'total' },
  { title: 'Estado', key: 'estado' },
]

const resumenItems = [
  { modulo: 'Impersonaciones activas', total: impersonacionesActivas.value.length, estado: 'Operativo' },
  { modulo: 'Logs cargados', total: logsActivos.value.length, estado: 'Operativo' },
]

// Cargar hoteles reales desde el backend
const { hoteles, obtenerHoteles } = useSuperAdminHoteles()
const hotelesDisponibles = hoteles

onMounted(async () => {
  await Promise.all([
    obtenerHoteles(),
    obtenerImpersonacionesActivas(),
    obtenerLogs(),
  ])
})
</script>

