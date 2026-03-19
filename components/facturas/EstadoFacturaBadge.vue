<template>
  <div class="estado-badge-container">
    <!-- Badge con estado actual -->
    <v-chip
      :color="colorEstado"
      :prepend-icon="iconoEstado"
      variant="tonal"
      class="font-weight-bold"
    >
      {{ etiquetaEstado }}
    </v-chip>

    <!-- Transiciones permitidas como chips pequeños (si showTransiciones) -->
    <div v-if="showTransiciones && transicionesPermitidas.length > 0" class="mt-3">
      <p class="text-caption text-medium-emphasis mb-2">Puedes cambiar a:</p>
      <div class="d-flex flex-wrap gap-1">
        <v-chip
          v-for="estado in transicionesPermitidas"
          :key="estado"
          size="small"
          variant="outlined"
          :color="useFacturas().getColorEstado(estado)"
          class="cursor-pointer"
          @click="$emit('cambiar-estado', estado)"
        >
          {{ useFacturas().getEtiquetaEstado(estado) }}
        </v-chip>
      </div>
    </div>

    <!-- Estado final si es PAGADA o ANULADA -->
    <div v-if="estadoFinal" class="mt-3 pa-3 rounded bg-warning-lighten-5">
      <p class="text-caption font-weight-bold text-warning">
        <v-icon icon="mdi-lock" size="small" /> Estado final - No se puede cambiar
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EstadoFactura } from '~/types/factura'
import { useFacturas } from '~/composables/useFacturas'

interface Props {
  estadoActual: EstadoFactura
  showTransiciones?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showTransiciones: true
})

const emit = defineEmits<{
  'cambiar-estado': [estado: EstadoFactura]
}>()

const facturas = useFacturas()

/**
 * Color del estado
 */
const colorEstado = computed(() => facturas.getColorEstado(props.estadoActual))

/**
 * Ícono del estado
 */
const iconoEstado = computed(() => facturas.getIconoEstado(props.estadoActual))

/**
 * Etiqueta en español
 */
const etiquetaEstado = computed(() => facturas.getEtiquetaEstado(props.estadoActual))

/**
 * Estados permitidos a los que se puede transicionar
 */
const transicionesPermitidas = computed<EstadoFactura[]>(() => {
  const transiciones: Record<EstadoFactura, EstadoFactura[]> = {
    BORRADOR: ['EDITABLE', 'EMITIDA', 'ANULADA'],
    EDITABLE: ['EMITIDA', 'BORRADOR', 'ANULADA'],
    EMITIDA: ['PAGADA', 'ANULADA'],
    PAGADA: [],
    ANULADA: []
  }
  return transiciones[props.estadoActual] || []
})

/**
 * Si es estado final (no se puede cambiar)
 */
const estadoFinal = computed(() => {
  return props.estadoActual === 'PAGADA' || props.estadoActual === 'ANULADA'
})
</script>

<style scoped>
.estado-badge-container {
  /* Estilos del contenedor */
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  opacity: 0.8;
}
</style>
