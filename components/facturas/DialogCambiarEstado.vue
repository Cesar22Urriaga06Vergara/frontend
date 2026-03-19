<template>
  <v-dialog v-model="isOpen" persistent max-width="500">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <v-icon icon="mdi-state-machine" class="mr-2" />
          Cambiar Estado de Factura
        </div>
        <v-btn icon="mdi-close" variant="text" @click="cerrar" :disabled="loading" />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <!-- Resumen del cambio -->
        <v-alert type="info" variant="tonal" class="mb-4" density="compact">
          <p class="text-caption mb-1">
            <strong>Cambios:</strong>
          </p>
          <p class="text-body-2 ma-0">
            {{ currentFactura?.numeroFactura }} 
            <v-icon icon="mdi-arrow-right" size="small" />
            {{ estadoAnterior }} → {{ estadoNuevo }}
          </p>
        </v-alert>

        <!-- Campo de motivo para anulación -->
        <v-text-field
          v-if="estadoNuevo === 'ANULADA'"
          v-model="motivo"
          label="Motivo de anulación *"
          placeholder="Ej: Error en cálculo de impuestos según cliente"
          variant="outlined"
          counter="500"
          maxlength="500"
          :rules="motivoRules"
          density="comfortable"
          persistent-hint
          hint="Requerido para auditoría"
          @input="validarForm"
        />

        <!-- Campo de fecha para marcar pagada -->
        <v-text-field
          v-if="estadoNuevo === 'PAGADA'"
          v-model="fechaPago"
          label="Fecha de pago (opcional)"
          type="datetime-local"
          variant="outlined"
          density="comfortable"
          persistent-hint
          hint="Si no especificas, se usa la fecha actual"
        />

        <!-- Validaciones específicas según cambio -->
        <v-alert
          v-if="muestraAdvertencia"
          type="warning"
          variant="tonal"
          class="mt-4 mb-0"
          density="compact"
        >
          <template #prepend>
            <v-icon icon="mdi-alert-circle" />
          </template>
          {{ advertencia }}
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="text"
          @click="cerrar"
          :disabled="loading"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="confirmar"
          :loading="loading"
          :disabled="!puedeConfirmar"
        >
          {{ bottonText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { EstadoFactura, Factura } from '~/types/factura'
import { useFacturas } from '~/composables/useFacturas'

interface Props {
  modelValue: boolean
  facturaId: number
  factura?: Factura
  estadoActual?: EstadoFactura
  estadoNuevo: EstadoFactura
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirmar': [data: ConfirmarData]
}>()

interface ConfirmarData {
  idFactura: number
  estadoNuevo: EstadoFactura
  motivo?: string
  fechaPago?: Date
}

const facturas = useFacturas()
const loading = ref(false)
const motivo = ref('')
const fechaPago = ref('')
const currentFactura = ref<Factura | null>(null)

/**
 * Estado abierto/cerrado del dialog
 */
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

/**
 * Estado anterior
 */
const estadoAnterior = computed(() => {
  return currentFactura.value?.estadoFactura || props.estadoActual || 'DESCONOCIDO'
})

/**
 * Reglas de validación para motivo
 */
const motivoRules = ref([
  (v: string) => {
    if (props.estadoNuevo !== 'ANULADA') return true
    return !!v || 'El motivo es obligatorio'
  },
  (v: string) => {
    if (props.estadoNuevo !== 'ANULADA') return true
    return (v && v.length >= 10) || 'Mínimo 10 caracteres'
  },
  (v: string) => (v && v.length <= 500) || 'Máximo 500 caracteres'
])

/**
 * Si puede confirmar (validaciones)
 */
const puedeConfirmar = computed(() => {
  if (props.estadoNuevo === 'ANULADA') {
    return motivo.value && motivo.value.length >= 10
  }
  return true
})

/**
 * Texto del botón
 */
const bottonText = computed(() => {
  switch (props.estadoNuevo) {
    case 'EMITIDA':
      return 'Emitir'
    case 'PAGADA':
      return 'Marcar como Pagada'
    case 'ANULADA':
      return 'Anular Factura'
    default:
      return 'Cambiar Estado'
  }
})

/**
 * Advertencia según tipo de cambio
 */
const advertencia = computed(() => {
  switch (props.estadoNuevo) {
    case 'EMITIDA':
      return 'Una factura emitida se considera oficial. Esto genera fecha de vencimiento (30 días).'
    case 'PAGADA':
      return 'Marcar como pagada es definitivo. Asegúrate que el pago fue confirmado.'
    case 'ANULADA':
      return 'Una factura anulada no se puede restaurar. El motivo quedará registrado en auditoría.'
    default:
      return ''
  }
})

/**
 * Si muestra advertencia
 */
const muestraAdvertencia = computed(() => {
  return props.estadoNuevo !== 'EDITABLE' && props.estadoNuevo !== 'BORRADOR'
})

/**
 * Validar formulario
 */
const validarForm = () => {
  // El v-text-field ya valida por sí solo
}

/**
 * Cerrar dialog
 */
const cerrar = () => {
  motivo.value = ''
  fechaPago.value = ''
  isOpen.value = false
}

/**
 * Confirmar el cambio
 */
const confirmar = async () => {
  if (!puedeConfirmar.value) {
    return
  }

  loading.value = true

  try {
    const data: ConfirmarData = {
      idFactura: props.facturaId,
      estadoNuevo: props.estadoNuevo
    }

    if (props.estadoNuevo === 'ANULADA') {
      data.motivo = motivo.value
    }

    if (props.estadoNuevo === 'PAGADA' && fechaPago.value) {
      data.fechaPago = new Date(fechaPago.value)
    }

    emit('confirmar', data)

    // Si no hay error, cerrar
    setTimeout(() => {
      cerrar()
    }, 500)
  } finally {
    loading.value = false
  }
}

/**
 * Actualizar factura actual cuando cambia prop
 */
watch(() => props.factura, (newVal) => {
  if (newVal) {
    currentFactura.value = newVal
  }
}, { immediate: true })

/**
 * Limpiar cuando se abre
 */
watch(() => isOpen.value, (newVal) => {
  if (newVal) {
    motivo.value = ''
    fechaPago.value = ''
  }
})
</script>

<style scoped>
/* Sin estilos adicionales necesarios */
</style>
