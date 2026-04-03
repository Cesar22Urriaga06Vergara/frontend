<template>
  <div>
    <PageHeader
      title="Configuración del Sistema"
      subtitle="Gestiona feature flags y parámetros globales de operación"
    />

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Feature Flags" :value="featuresFlags.length" icon="mdi-toggle-switch" color="primary" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Parámetros" :value="parametrosGlobales.length" icon="mdi-cog" color="info" />
      </v-col>
    </v-row>

    <v-alert
      type="warning"
      variant="tonal"
      class="mb-6"
      prepend-icon="mdi-clock-alert-outline"
    >
      <strong>Módulo en despliegue.</strong> Los features flags y parámetros globales están en modo solo lectura. Los cambios no se guardarán hasta que el backend de configuración esté activo.
    </v-alert>


    <SectionCard class="mb-6" title="Módulos de configuración" subtitle="Selecciona la sección a administrar">
      <v-tabs v-model="tabActiva">
        <v-tab value="features" prepend-icon="mdi-toggle-switch">
          Features Flags ({{ featuresFlags.length }})
        </v-tab>
        <v-tab value="parametros" prepend-icon="mdi-cog">
          Parámetros Globales ({{ parametrosGlobales.length }})
        </v-tab>
      </v-tabs>
    </SectionCard>

    <!-- Tab Features Flags -->
    <div v-if="tabActiva === 'features'" class="space-y-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Controlar Features</h2>
        <v-btn color="primary" @click="dialogoFeatureFlags = true" prepend-icon="mdi-plus">
          Nuevo Flag
        </v-btn>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div v-for="flag in featuresFlags" :key="flag.id" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ flag.nombre }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ flag.descripcion }}</p>
              <p class="text-xs text-gray-500 font-mono mt-2">{{ flag.clave }}</p>
            </div>
            <v-switch
              :model-value="flag.esActivo"
              :disabled="true"
              :color="flag.esActivo ? 'green' : 'red'"
            ></v-switch>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-600 dark:text-gray-400">Progreso Deploy</p>
              <v-progress-linear
                :model-value="flag.porcentajeDeploy"
                :color="flag.porcentajeDeploy === 100 ? 'green' : 'orange'"
                class="mt-2"
              ></v-progress-linear>
              <p class="text-xs text-gray-500 mt-1">{{ flag.porcentajeDeploy }}%</p>
            </div>
            <div>
              <p class="text-gray-600 dark:text-gray-400">Próximo vencimiento</p>
              <p class="text-xs font-mono mt-2">
                {{ flag.fechaVencimiento ? new Date(flag.fechaVencimiento).toLocaleDateString('es-CO') : 'Sin vencimiento' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Parámetros Globales -->
    <div v-if="tabActiva === 'parametros'" class="space-y-6">
      <div class="mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Variables Globales</h2>
        <p class="text-gray-600 dark:text-gray-400 mt-1">Ajusta parámetros de configuración del sistema</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="param in parametrosGlobales" :key="param.id" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ param.clave }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ param.descripcion }}</p>
            </div>
            <v-chip size="small" variant="outlined">{{ param.categoria }}</v-chip>
          </div>

          <div v-if="param.tipo === 'boolean'" class="mb-4">
            <v-switch
              :model-value="param.valor === 'true'"
              :disabled="true"
              density="compact"
            ></v-switch>
          </div>

          <div v-else-if="param.tipo === 'number'">
            <v-text-field
              :model-value="param.valor"
              type="number"
              label="Valor"
              density="compact"
              @blur="actualizarParametroGlobal(param.clave, $event)"
            ></v-text-field>
          </div>

          <div v-else>
            <v-text-field
              :model-value="param.valor"
              label="Valor"
              density="compact"
              :disabled="!param.esModificable"
              @blur="actualizarParametroGlobal(param.clave, $event)"
            ></v-text-field>
          </div>

          <p v-if="!param.esModificable" class="text-xs text-gray-500 mt-2">
            ⚠ Este parámetro es de solo lectura
          </p>
        </div>
      </div>
    </div>

    <!-- Diálogo Features Flag -->
    <v-dialog v-model="dialogoFeatureFlags" max-width="500">
      <v-card>
        <v-card-title>Nuevo Features Flag</v-card-title>
        <v-card-text>
          <v-text-field label="Nombre" class="mb-4"></v-text-field>
          <v-text-field label="Clave (slug)" class="mb-4"></v-text-field>
          <v-textarea label="Descripción" class="mb-4"></v-textarea>
          <v-text-field label="Porcentaje Deploy" type="number" min="0" max="100" class="mb-4"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialogoFeatureFlags = false">Cancelar</v-btn>
          <v-btn color="primary" @click="dialogoFeatureFlags = false">Crear</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <StandardDataTable
      class="mt-6"
      title="Resumen de configuración"
      subtitle="Estado actual de módulos disponibles"
      :headers="resumenHeaders"
      :items="resumenItems"
      :items-per-page="5"
      empty-title="Sin datos"
      empty-description="No hay información de resumen disponible."
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import { useSuperAdminConfiguracion } from '~/composables/useSuperAdminConfiguracion'

import { UserRole } from '~/types/auth'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.SUPERADMIN],
  layout: 'superadmin'
})

const {
  featuresFlags,
  parametrosGlobales,
  dialogoFeatureFlags,
  obtenerFeaturesFlags,
  actualizarFeaturesFlag,
  obtenerParametrosGlobales,
  actualizarParametroGlobal
} = useSuperAdminConfiguracion()

const tabActiva = ref('features')

const resumenHeaders = [
  { title: 'Módulo', key: 'modulo' },
  { title: 'Total', key: 'total' },
  { title: 'Estado', key: 'estado' },
]

const resumenItems = computed(() => [
  { modulo: 'Feature Flags', total: featuresFlags.value.length, estado: 'Operativo' },
  { modulo: 'Parámetros Globales', total: parametrosGlobales.value.length, estado: 'Operativo' },
])

onMounted(async () => {
  await obtenerFeaturesFlags()
  await obtenerParametrosGlobales()
})
</script>

