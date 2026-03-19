<template>
  <v-card class="card-glow">
    <v-card-title class="text-subtitle-1 font-weight-bold">
      <v-icon icon="mdi-chart-line" class="mr-2" />
      Tendencias (Últimos 30 días)
    </v-card-title>

    <v-card-text class="pa-6">
      <div v-if="tendencias.length > 0" class="text-center">
        <!-- Gráfico simple usando SVG (sin dependencia externa) -->
        <div class="grafico-container">
          <svg :viewBox="`0 0 ${ancho} ${alto}`" class="grafico" preserveAspectRatio="xMidYMid meet">
            <!-- Grid -->
            <line
              v-for="i in 5"
              :key="`grid-h-${i}`"
              :x1="margin"
              :y1="margin + (i * (alto - 2 * margin)) / 5"
              :x2="ancho - margin"
              :y2="margin + (i * (alto - 2 * margin)) / 5"
              stroke="#e0e0e0"
              stroke-width="1"
              stroke-dasharray="2,2"
            />

            <!-- Línea de ingresos -->
            <polyline
              :points="puntosIngresos"
              fill="none"
              stroke="#4CAF50"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- Puntos en la línea -->
            <circle
              v-for="(punto, i) in puntosIngresosParsed"
              :key="`punto-${i}`"
              :cx="punto.x"
              :cy="punto.y"
              r="4"
              fill="#4CAF50"
            />

            <!-- Eje X (fechas) -->
            <line :x1="margin" :y1="alto - margin" :x2="ancho - margin" :y2="alto - margin" stroke="#666" stroke-width="2" />

            <!-- Eje Y -->
            <line :x1="margin" :y1="margin" :x2="margin" :y2="alto - margin" stroke="#666" stroke-width="2" />

            <!-- Labels eje Y -->
            <text v-for="i in 5" :key="`y-label-${i}`" :x="margin - 10" :y="margin + (i * (alto - 2 * margin)) / 5 + 4" text-anchor="end" font-size="12" fill="#666">
              ${{ formatearMoneda((maxIngresos * (5 - i)) / 5) }}
            </text>

            <!-- Labels eje X (cada 5 días) -->
            <text
              v-for="(punto, i) in puntosIngresosParsed"
              :key="`x-label-${i}`"
              :x="punto.x"
              :y="alto - margin + 20"
              text-anchor="middle"
              font-size="10"
              fill="#666"
            >
              {{ formatearFecha(tendencias[i].fecha) }}
            </text>
          </svg>
        </div>

        <!-- Leyenda -->
        <div class="d-flex justify-center gap-4 mt-6">
          <div class="d-flex align-center">
            <div class="w-4 h-4 rounded" style="background-color: #4CAF50; width: 12px; height: 12px"></div>
            <span class="text-body-2 ml-2">Total Ingresos Diarios</span>
          </div>
        </div>
      </div>

      <div v-else class="text-center text-medium-emphasis py-6">
        No hay datos de tendencia para mostrar
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TendenciasDiarias } from '~/types/servicios'

interface Props {
  tendencias: TendenciasDiarias[]
}

const props = defineProps<Props>()

// Dimensiones del gráfico
const ancho = 800
const alto = 400
const margin = 40

// Calcs
const maxIngresos = computed(() => {
  if (props.tendencias.length === 0) return 1
  return Math.max(...props.tendencias.map((t) => t.ingresos)) * 1.1
})

const escalaX = computed(() => (ancho - 2 * margin) / (props.tendencias.length - 1 || 1))
const escalaY = computed(() => (alto - 2 * margin) / maxIngresos.value)

const puntosIngreso = computed(() =>
  props.tendencias.map((t, i) => ({
    x: margin + i * escalaX.value,
    y: alto - margin - (t.ingresos * escalaY.value),
  })),
)

const puntosIngresosParsed = computed(() => puntosIngreso.value)

const puntosIngresos = computed(() =>
  puntosIngresosParsed.value.map((p) => `${p.x},${p.y}`).join(' '),
)

// Utils
const formatearMoneda = (valor: number): string => {
  return valor.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const formatearFecha = (fecha: string | Date): string => {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha
  return `${d.getDate()}/${d.getMonth() + 1}`
}
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.grafico-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.grafico {
  width: 100%;
  height: auto;
  max-height: 400px;
}

.gap-4 {
  gap: 1rem;
}

.w-4 {
  width: 1rem;
}

.h-4 {
  height: 1rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.mt-6 {
  margin-top: 1.5rem;
}
</style>
