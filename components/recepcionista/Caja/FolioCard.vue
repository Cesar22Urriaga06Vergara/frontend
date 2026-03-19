<template>
  <v-card class="folio-card" :class="{ 'folio-pagado': folio?.pagado }">
    <v-card-title class="d-flex align-center justify-space-between">
      <div>
        <div class="text-h6">Folio #HB{{ folio?.numeroHabitacion }}</div>
        <div class="text-caption text-medium-emphasis">
          {{ folio?.nombreCliente || 'Sin cliente' }}
        </div>
      </div>
      <v-chip :color="estadoColor" text-color="white" size="small">
        {{ estadoLabel }}
      </v-chip>
    </v-card-title>

    <v-divider class="my-2"></v-divider>

    <v-card-text>
      <!-- Cargos count -->
      <div class="mb-4">
        <div class="text-caption text-medium-emphasis mb-1">Cargos registrados</div>
        <div class="text-h5 font-weight-bold">{{ totalCargos }}</div>
      </div>

      <!-- Desglose monetario -->
      <v-table density="compact" class="desglose-table mb-4">
        <tbody>
          <tr>
            <td class="text-caption">Subtotal</td>
            <td class="text-right font-weight-bold">
              ${{ (folio?.subtotal || 0).toLocaleString('es-CO') }}
            </td>
          </tr>
          <tr v-if="folio?.montoIva && folio.montoIva > 0">
            <td class="text-caption">IVA 19%</td>
            <td class="text-right font-weight-bold text-warning">
              ${{ (folio.montoIva).toLocaleString('es-CO') }}
            </td>
          </tr>
          <tr v-if="folio?.montoInc && folio.montoInc > 0">
            <td class="text-caption">INC</td>
            <td class="text-right font-weight-bold text-error">
              ${{ (folio.montoInc).toLocaleString('es-CO') }}
            </td>
          </tr>
          <tr class="divider-top">
            <td class="text-subtitle-2 font-weight-bold">Total a cobrar</td>
            <td class="text-right text-h6 font-weight-bold">
              ${{ (folio?.total || 0).toLocaleString('es-CO') }}
            </td>
          </tr>
          <tr v-if="folio?.pagado" class="bg-success-lighten">
            <td class="text-subtitle-2 font-weight-bold text-success">Pagado</td>
            <td class="text-right text-h6 font-weight-bold text-success">
              ${{ (folio.montoRecibido || 0).toLocaleString('es-CO') }}
            </td>
          </tr>
          <tr v-else-if="saldoPendiente > 0" class="bg-warning-lighten">
            <td class="text-subtitle-2 font-weight-bold text-warning">Saldo pendiente</td>
            <td class="text-right text-h6 font-weight-bold text-warning">
              ${{ saldoPendiente.toLocaleString('es-CO') }}
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Estado más detallado -->
      <v-alert v-if="folio?.pagado" type="success" variant="tonal" density="compact" class="mb-2">
        Folio pagado el {{ formatearFecha(folio.fechaPago) }}
      </v-alert>
      <v-alert v-else-if="saldoPendiente > 0" type="warning" variant="tonal" density="compact" class="mb-2">
        Pendiente de cobra: ${{ saldoPendiente.toLocaleString('es-CO') }}
      </v-alert>
    </v-card-text>

    <v-card-actions class="pt-0">
      <v-spacer></v-spacer>
      <slot name="actions"></slot>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Folio } from '~/types/folio'

interface Props {
  folio?: Folio | null
}

const props = defineProps<Props>()

const totalCargos = computed(() => {
  return props.folio?.cargos.length || 0
})

const saldoPendiente = computed(() => {
  if (!props.folio) return 0
  const pagado = props.folio.montoRecibido || 0
  return Math.max(0, props.folio.total - pagado)
})

const estadoColor = computed(() => {
  switch (props.folio?.estado) {
    case 'ABIERTO':
      return 'info'
    case 'CERRADO':
      return 'warning'
    case 'PAGADO':
      return 'success'
    case 'CANCELADO':
      return 'error'
    default:
      return 'default'
  }
})

const estadoLabel = computed(() => {
  switch (props.folio?.estado) {
    case 'ABIERTO':
      return 'Abierto'
    case 'CERRADO':
      return 'Cerrado'
    case 'PAGADO':
      return 'Pagado'
    case 'CANCELADO':
      return 'Cancelado'
    default:
      return 'Desconocido'
  }
})

const formatearFecha = (fecha?: string) => {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.folio-card {
  border-left: 4px solid var(--v-theme-info);
  transition: all 0.3s ease;
}

.folio-card.folio-pagado {
  border-left-color: var(--v-theme-success);
  background: linear-gradient(to right, rgba(76, 175, 80, 0.05), transparent);
}

.desglose-table {
  background: rgba(0, 0, 0, 0.02);
}

.desglose-table tr.divider-top {
  border-top: 2px solid rgba(0, 0, 0, 0.12);
  background: rgba(0, 0, 0, 0.04);
}

.desglose-table :deep(td) {
  padding: 8px 12px !important;
  height: auto !important;
}
</style>
