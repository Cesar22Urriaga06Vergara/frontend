<template>
  <v-card class="historial-card">
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center gap-2">
        <v-icon icon="mdi-history" />
        Historial de Cambios
      </div>
      <v-btn
        icon="mdi-refresh"
        variant="text"
        :loading="loading"
        size="small"
        @click="refrescar"
      />
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-6">
      <!-- Cargando -->
      <div v-if="loading" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" />
        <p class="text-caption text-medium-emphasis mt-4">Cargando historial...</p>
      </div>

      <!-- Si hay cambios -->
      <div v-else-if="cambios.length > 0">
        <!-- Timeline vertical -->
        <v-timeline align="start" truncate-line="both">
          <v-timeline-item
            v-for="(cambio, idx) in cambios"
            :key="cambio.id"
            :dot-color="colorPorTipo(cambio.tipoCambio)"
            :icon="iconoPorTipo(cambio.tipoCambio)"
            size="small"
          >
            <!-- Fecha en lado opuesto -->
            <template #opposite>
              <div class="text-caption text-medium-emphasis">
                <div class="font-weight-bold">{{ formatFecha(cambio.fecha) }}</div>
                <div>{{ formatHora(cambio.fecha) }}</div>
              </div>
            </template>

            <!-- Contenido del cambio -->
            <v-card variant="outlined" class="mb-3">
              <v-card-title class="text-subtitle-2">
                {{ cambio.descripcion }}
              </v-card-title>

              <v-card-text class="pt-2">
                <!-- Usuario que hizo el cambio -->
                <p v-if="cambio.usuarioId" class="text-caption text-medium-emphasis mb-2">
                  <v-icon icon="mdi-account" size="x-small" />
                  Usuario ID: {{ cambio.usuarioId }}
                </p>

                <!-- Valores anterior/nuevo si existen -->
                <div v-if="cambio.valorAnterior || cambio.valorNuevo" class="mt-3">
                  <v-row dense>
                    <!-- Valor anterior -->
                    <v-col v-if="cambio.valorAnterior" cols="12" md="6">
                      <p class="text-caption font-weight-bold text-warning mb-1">Antes:</p>
                      <pre class="bg-warning-lighten-5 pa-2 rounded text-caption" style="overflow: auto;">{{ formatJSON(cambio.valorAnterior) }}</pre>
                    </v-col>

                    <!-- Valor nuevo -->
                    <v-col v-if="cambio.valorNuevo" cols="12" md="6">
                      <p class="text-caption font-weight-bold text-success mb-1">Después:</p>
                      <pre class="bg-success-lighten-5 pa-2 rounded text-caption" style="overflow: auto;">{{ formatJSON(cambio.valorNuevo) }}</pre>
                    </v-col>
                  </v-row>
                </div>
              </v-card-text>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </div>

      <!-- Sin cambios -->
      <div v-else class="text-center pa-8">
        <v-icon icon="mdi-history-off" size="x-large" class="text-medium-emphasis mb-2" />
        <p class="text-medium-emphasis">Sin cambios registrados aún</p>
      </div>

      <!-- Info adicional -->
      <v-alert
        v-if="resumen"
        type="info"
        variant="tonal"
        class="mt-6"
        density="compact"
      >
        <template #prepend>
          <v-icon icon="mdi-information" />
        </template>
        <p class="text-caption mb-1">
          <strong>Estado actual:</strong> {{ resumen.estadoActual }}
        </p>
        <p v-if="resumen.ultimoCambioFecha" class="text-caption mb-0">
          <strong>Último cambio:</strong> {{ formatFecha(resumen.ultimaCambioFecha) }}
        </p>
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { FacturaCambio } from '~/types/factura'
import { useFacturas } from '~/composables/useFacturas'

interface Props {
  idFactura: number
  autoRefresh?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoRefresh: false
})

const facturas = useFacturas()
const loading = ref(false)
const cambios = ref<FacturaCambio[]>([])
const resumen = ref<any>(null)

/**
 * Cargar historial de cambios
 */
const cargarHistorial = async () => {
  loading.value = true
  try {
    const response = await facturas.obtenerHistorial(props.idFactura)
    cambios.value = response.cambios || []
    resumen.value = response.resumen || null
  } finally {
    loading.value = false
  }
}

/**
 * Refrescar historial
 */
const refrescar = async () => {
  await cargarHistorial()
}

/**
 * Color según tipo de cambio
 */
const colorPorTipo = (tipo: string): string => {
  switch (tipo) {
    case 'CREACIÓN':
      return 'success'
    case 'CAMBIO_ESTADO':
      return 'info'
    case 'ACTUALIZACIÓN':
      return 'warning'
    default:
      return 'default'
  }
}

/**
 * Ícono según tipo de cambio
 */
const iconoPorTipo = (tipo: string): string => {
  switch (tipo) {
    case 'CREACIÓN':
      return 'mdi-file-plus'
    case 'CAMBIO_ESTADO':
      return 'mdi-state-machine'
    case 'ACTUALIZACIÓN':
      return 'mdi-pencil'
    default:
      return 'mdi-history'
  }
}

/**
 * Formatear fecha a dd/mm/yyyy
 */
const formatFecha = (fecha: string | undefined): string => {
  if (!fecha) return 'N/A'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-CO')
}

/**
 * Formatear hora a HH:MM:SS
 */
const formatHora = (fecha: string | undefined): string => {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleTimeString('es-CO')
}

/**
 * Formatear JSON para mostrar
 */
const formatJSON = (obj: any): string => {
  if (!obj) return 'N/A'
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}

// Cargar historial al montar
onMounted(() => {
  cargarHistorial()
})

// Auto-refresh si está habilitado
if (props.autoRefresh) {
  setInterval(() => {
    cargarHistorial()
  }, 30000) // Cada 30 segundos
}
</script>

<style scoped>
.historial-card {
  /* Estilos */
}

pre {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  line-height: 1.4;
  max-height: 200px;
}

:deep(.v-timeline__item) {
  padding-bottom: 24px;
}
</style>
