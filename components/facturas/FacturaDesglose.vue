<template>
  <v-card class="desglose-card">
    <v-card-title class="d-flex align-center gap-2">
      <v-icon icon="mdi-calculator-variant" />
      Desglose de Impuestos
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-6">
      <!-- Si hay desglose -->
      <div v-if="tieneDesglose">
        <!-- Tabla de desglose por categoría -->
        <v-table dense class="mb-6">
          <thead>
            <tr>
              <th class="text-left">Categoría</th>
              <th class="text-right">Subtotal</th>
              <th class="text-right">IVA (19%)</th>
              <th class="text-right">INC (8%)</th>
              <th class="text-right font-weight-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, categoria) in rowsDesglose" :key="categoria">
              <td class="text-left">{{ categoria }}</td>
              <td class="text-right">{{ formatCurrency(item.subtotal) }}</td>
              <td class="text-right">{{ formatCurrency(item.iva) }}</td>
              <td class="text-right">{{ formatCurrency(item.inc) }}</td>
              <td class="text-right font-weight-bold">{{ formatCurrency(item.total) }}</td>
            </tr>
          </tbody>
        </v-table>

        <!-- Resumen totales -->
        <v-row class="pa-4 rounded bg-primary-lighten-5">
          <v-col cols="12" md="3" class="text-center">
            <p class="text-caption text-medium-emphasis">Subtotal</p>
            <p class="text-h6 font-weight-bold">{{ formatCurrency(totalSubtotal) }}</p>
          </v-col>
          <v-col cols="12" md="3" class="text-center">
            <p class="text-caption text-medium-emphasis">IVA Total (19%)</p>
            <p class="text-h6 font-weight-bold text-info">{{ formatCurrency(totalIva) }}</p>
          </v-col>
          <v-col cols="12" md="3" class="text-center">
            <p class="text-caption text-medium-emphasis">INC Total (8%)</p>
            <p class="text-h6 font-weight-bold text-warning">{{ formatCurrency(totalInc) }}</p>
          </v-col>
          <v-col cols="12" md="3" class="text-center">
            <p class="text-caption text-medium-emphasis">Total a Pagar</p>
            <p class="text-h5 font-weight-bold text-success">{{ formatCurrency(totalFinal) }}</p>
          </v-col>
        </v-row>

        <!-- Notas de impuestos -->
        <v-alert
          type="info"
          variant="tonal"
          class="mt-4"
          density="compact"
        >
          <template #prepend>
            <v-icon icon="mdi-information" />
          </template>
          <p class="text-caption mb-1">
            <strong>Impuestos aplicados según Decreto 297/2016:</strong>
          </p>
          <ul class="text-caption" style="margin: 8px 0; padding-left: 20px;">
            <li>
              <strong>IVA (19%):</strong> Aplica en servicios de alojamiento y otros según categoría
            </li>
            <li>
              <strong>INC (8%):</strong> Impuesto Nacional al Consumo - Aplica solo en alimentos y bebidas (alcohólicas)
            </li>
            <li>
              <strong>Tarifa 0%:</strong> Aplica para clientes extranjeros en alojamiento
            </li>
          </ul>
        </v-alert>
      </div>

      <!-- Si no hay desglose (modo fallback) -->
      <div v-else class="text-center pa-8">
        <v-icon icon="mdi-calculator-variant-outline" size="x-large" class="text-medium-emphasis mb-2" />
        <p class="text-medium-emphasis">Sin desglose de impuestos disponible</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Factura, DesgloseMonetario } from '~/types/factura'

interface Props {
  factura: Factura
}

const props = defineProps<Props>()

/**
 * Si hay desglose disponible
 */
const tieneDesglose = computed(() => {
  return props.factura.desgloseMonetario && 
    Object.keys(props.factura.desgloseMonetario).length > 0
})

/**
 * Filas para mostrar en tabla (con formato legible)
 */
const rowsDesglose = computed(() => {
  if (!tieneDesglose.value) return {}

  const desglose = props.factura.desgloseMonetario || {}

  return Object.entries(desglose).reduce((acc, [categoria, datos]) => {
    acc[getNombreCategoria(categoria)] = {
      subtotal: datos.subtotal || 0,
      iva: datos.iva || 0,
      inc: datos.inc || 0,
      total: datos.total || 0
    }
    return acc
  }, {} as Record<string, any>)
})

/**
 * Total de subtotal
 */
const totalSubtotal = computed(() => {
  if (!tieneDesglose.value) return 0

  const desglose = props.factura.desgloseMonetario || {}
  return Object.values(desglose).reduce((sum, item) => sum + (item.subtotal || 0), 0)
})

/**
 * Total de IVA
 */
const totalIva = computed(() => {
  if (!tieneDesglose.value) return 0

  const desglose = props.factura.desgloseMonetario || {}
  return Object.values(desglose).reduce((sum, item) => sum + (item.iva || 0), 0)
})

/**
 * Total de INC
 */
const totalInc = computed(() => {
  if (!tieneDesglose.value) return 0

  const desglose = props.factura.desgloseMonetario || {}
  return Object.values(desglose).reduce((sum, item) => sum + (item.inc || 0), 0)
})

/**
 * Gran total (subtotal + impuestos)
 */
const totalFinal = computed(() => {
  return totalSubtotal.value + totalIva.value + totalInc.value
})

/**
 * Formatear número a moneda COP
 */
const formatCurrency = (value: number | undefined): string => {
  if (!value) return '$0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

/**
 * Obtener nombre amigable de categoría
 */
const getNombreCategoria = (cod: string): string => {
  const nombres: Record<string, string> = {
    'Alojamiento': 'Alojamiento',
    'Restaurante': 'Alimentos & Bebidas',
    'Minibar': 'Minibar',
    'Lavandería': 'Lavandería',
    'Spa': 'Spa & Bienestar',
    'Room Service': 'Room Service',
    'Transporte': 'Transporte',
    'Tours': 'Tour y Actividades',
    'Eventos': 'Eventos & Salones',
    'Mantenimiento': 'Otros Servicios'
  }
  return nombres[cod] || cod
}
</script>

<style scoped>
.desglose-card {
  /* Estilos personalizados */
}

:deep(.v-table__wrapper tbody tr:hover) {
  background-color: rgba(33, 150, 243, 0.05);
}
</style>
