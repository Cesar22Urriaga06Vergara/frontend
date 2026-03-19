<template>
  <div>
    <!-- KPIs Principal -->
    <v-row class="mb-6">
      <!-- Total Ingresos -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4 h-100">
          <div class="d-flex flex-column justify-space-between h-100">
            <div>
              <div class="text-caption text-medium-emphasis mb-2">Total Ingresos</div>
              <div class="text-h5 font-weight-bold text-success">
                ${{ formatearMoneda(ingresoTotal) }}
              </div>
            </div>
            <v-avatar color="success" size="48" variant="tonal" rounded="lg" class="mt-2">
              <v-icon icon="mdi-currency-usd" size="24" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <!-- Total Pedidos -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4 h-100">
          <div class="d-flex flex-column justify-space-between h-100">
            <div>
              <div class="text-caption text-medium-emphasis mb-2">Total Pedidos</div>
              <div class="text-h5 font-weight-bold text-primary">{{ totalPedidos }}</div>
            </div>
            <v-avatar color="primary" size="48" variant="tonal" rounded="lg" class="mt-2">
              <v-icon icon="mdi-file-multiple-outline" size="24" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <!-- Ticket Promedio -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4 h-100">
          <div class="d-flex flex-column justify-space-between h-100">
            <div>
              <div class="text-caption text-medium-emphasis mb-2">Ticket Promedio</div>
              <div class="text-h5 font-weight-bold text-info">
                ${{ formatearMoneda(ticketPromedio) }}
              </div>
            </div>
            <v-avatar color="info" size="48" variant="tonal" rounded="lg" class="mt-2">
              <v-icon icon="mdi-trending-up" size="24" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <!-- Tasa Entrega -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4 h-100">
          <div class="d-flex flex-column justify-space-between h-100">
            <div>
              <div class="text-caption text-medium-emphasis mb-2">Tasa Entrega</div>
              <div class="text-h5 font-weight-bold" :style="{ color: getTasaColor(tasaEntrega) }">
                {{ tasaEntrega.toFixed(1) }}%
              </div>
            </div>
            <v-avatar :color="getTasaColor(tasaEntrega)" size="48" variant="tonal" rounded="lg" class="mt-2">
              <v-icon icon="mdi-check-circle-outline" size="24" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Desglose Hoy -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6">
        <v-card class="card-glow pa-4">
          <div class="text-caption font-weight-bold text-medium-emphasis mb-3">HOY</div>
          <div class="d-flex align-center mb-2">
            <v-icon icon="mdi-file-multiple-outline" size="20" class="mr-2" />
            <span class="text-body-2">Pedidos Hoy: <strong>{{ pedidosHoy }}</strong></span>
          </div>
          <div class="d-flex align-center">
            <v-icon icon="mdi-currency-usd" size="20" class="mr-2" />
            <span class="text-body-2">Ingresos: <strong>${{ formatearMoneda(ingresosHoy) }}</strong></span>
          </div>
        </v-card>
      </v-col>

      <!-- Área con Más Ingresos -->
      <v-col cols="12" sm="6">
        <v-card class="card-glow pa-4">
          <div class="text-caption font-weight-bold text-medium-emphasis mb-3">TOP ÁREA</div>
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-body-2 text-medium-emphasis mb-1">{{ areaConMasIngresos }}</div>
              <div class="text-h6 font-weight-bold text-success">
                ${{ formatearMoneda(topAreaIngresos) }}
              </div>
            </div>
            <v-avatar color="success" size="48" variant="tonal" rounded="lg">
              <v-icon icon="mdi-star-outline" size="24" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { HotelKpis } from '~/types/servicios'

interface Props {
  kpis: HotelKpis | null
  topAreaIngresos?: number
}

const props = withDefaults(defineProps<Props>(), {
  topAreaIngresos: 0,
})

// Computed
const ingresoTotal = computed(() => props.kpis?.totalIngresos || 0)
const totalPedidos = computed(() => props.kpis?.totalPedidos || 0)
const ticketPromedio = computed(() => props.kpis?.ticketPromedio || 0)
const tasaEntrega = computed(() => props.kpis?.tasaEntregaGlobal || 0)
const pedidosHoy = computed(() => props.kpis?.pedidosHoy || 0)
const ingresosHoy = computed(() => props.kpis?.ingresosHoy || 0)
const areaConMasIngresos = computed(() => props.kpis?.areaConMasIngresos?.categoria || 'N/A')

// Utils
const formatearMoneda = (valor: number): string => {
  return valor.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const getTasaColor = (tasa: number): string => {
  if (tasa >= 90) return 'success'
  if (tasa >= 75) return 'warning'
  return 'error'
}
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card-glow:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.h-100 {
  height: 100%;
}
</style>
