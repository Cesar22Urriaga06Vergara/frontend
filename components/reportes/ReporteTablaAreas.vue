<template>
  <v-card class="card-glow">
    <v-card-title class="text-subtitle-1 font-weight-bold">
      <v-icon icon="mdi-table" class="mr-2" />
      {{ titulo }}
    </v-card-title>

    <v-table>
      <thead>
        <tr>
          <th class="text-left font-weight-bold">Área</th>
          <th class="text-right font-weight-bold">Pedidos</th>
          <th class="text-right font-weight-bold">Ingresos</th>
          <th class="text-right font-weight-bold">Ticket Prom.</th>
          <th class="text-right font-weight-bold">Entregado</th>
          <th class="text-right font-weight-bold">Tasa %</th>
          <th class="text-center font-weight-bold">Entrega Pref.</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="area in areas" :key="area.categoria">
          <td class="text-left font-weight-bold">{{ formatearCategoria(area.categoria) }}</td>
          <td class="text-right">{{ area.totalPedidos }}</td>
          <td class="text-right">
            <span class="font-weight-bold text-success">
              ${{ formatearMoneda(area.ingresoTotal) }}
            </span>
          </td>
          <td class="text-right">${{ formatearMoneda(area.ticketPromedio) }}</td>
          <td class="text-right">
            <v-chip size="small" variant="flat" color="success">
              {{ area.contadores.entregado }}
            </v-chip>
          </td>
          <td class="text-right">
            <v-chip
              size="small"
              variant="tonal"
              :color="getTasaColor(area.tasaEntrega)"
            >
              {{ area.tasaEntrega.toFixed(1) }}%
            </v-chip>
          </td>
          <td class="text-center">
            <v-icon :icon="getIconoEntrega(area.tipoPrefijo)" :color="getColorEntrega(area.tipoPrefijo)" />
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Pie con resumen -->
    <v-divider class="my-4" />
    <v-card-text class="pa-4">
      <div class="d-flex justify-space-around flex-wrap gap-4">
        <div class="text-center">
          <div class="text-caption text-medium-emphasis mb-1">Total Pedidos</div>
          <div class="text-h6 font-weight-bold">{{ totalPedidos }}</div>
        </div>
        <div class="text-center">
          <div class="text-caption text-medium-emphasis mb-1">Total Ingresos</div>
          <div class="text-h6 font-weight-bold text-success">
            ${{ formatearMoneda(totalIngresos) }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-caption text-medium-emphasis mb-1">Entregados</div>
          <div class="text-h6 font-weight-bold text-success">{{ totalEntregados }}</div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AreaResumen } from '~/types/servicios'

interface Props {
  areas: AreaResumen[]
  titulo?: string
}

const props = withDefaults(defineProps<Props>(), {
  titulo: 'Desglose por Área',
})

// Computed
const totalPedidos = computed(() => props.areas.reduce((sum, a) => sum + a.totalPedidos, 0))
const totalIngresos = computed(() => props.areas.reduce((sum, a) => sum + a.ingresoTotal, 0))
const totalEntregados = computed(() =>
  props.areas.reduce((sum, a) => sum + a.contadores.entregado, 0),
)

// Utils
const formatearMoneda = (valor: number): string => {
  return valor.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const formatearCategoria = (categoria: string): string => {
  return categoria.charAt(0).toUpperCase() + categoria.slice(1).replace('_', ' ')
}

const getTasaColor = (tasa: number): string => {
  if (tasa >= 90) return 'success'
  if (tasa >= 75) return 'warning'
  return 'error'
}

const getIconoEntrega = (tipo: 'delivery' | 'recogida'): string => {
  return tipo === 'delivery' ? 'mdi-truck-fast' : 'mdi-hand-pickup'
}

const getColorEntrega = (tipo: 'delivery' | 'recogida'): string => {
  return tipo === 'delivery' ? 'info' : 'warning'
}
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.gap-4 {
  gap: 1rem;
}
</style>
