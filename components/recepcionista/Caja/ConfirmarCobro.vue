<template>
  <v-dialog v-model="isOpen" max-width="500px" @update:model-value="handleClose">
    <template #activator="{ props }">
      <slot name="activator" :props="props">
        <v-btn v-bind="props" color="success" prepend-icon="mdi-cash-multiple">
          Cobrar
        </v-btn>
      </slot>
    </template>

    <v-card title="Confirmar cobro">
      <v-card-text>
        <!-- Resumen de valores -->
        <v-table density="compact" class="mb-4">
          <tbody>
            <tr>
              <td class="text-subtitle-2">Total a cobrar</td>
              <td class="text-right text-h6 font-weight-bold">
                ${{ totalACobrar.toLocaleString('es-CO') }}
              </td>
            </tr>
            <tr v-if="montoRecibido > 0" class="bg-info-lighten">
              <td class="text-subtitle-2">Monto recibido</td>
              <td class="text-right text-h6 font-weight-bold text-info">
                ${{ montoRecibido.toLocaleString('es-CO') }}
              </td>
            </tr>
            <tr v-if="montoRecibido > 0" class="bg-success-lighten">
              <td class="text-subtitle-2 font-weight-bold">Cambio</td>
              <td class="text-right text-h6 font-weight-bold text-success">
                ${{ vuelto.toLocaleString('es-CO') }}
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Advertencia si no hay cambio exacto -->
        <v-alert
          v-if="montoRecibido > 0 && montoRecibido < totalACobrar"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          Monto insuficiente. Falta ${{ (totalACobrar - montoRecibido).toLocaleString('es-CO') }}
        </v-alert>

        <v-form ref="formRef" @submit.prevent="confirmar">
          <!-- Monto recibido -->
          <v-text-field
            v-model.number="montoRecibido"
            label="Monto recibido del cliente"
            type="number"
            step="0.01"
            min="0"
            variant="outlined"
            density="compact"
            class="mb-4"
            prefix="$"
            :rules="[
              (v) => v !== null && v !== undefined || 'Monto es obligatorio',
              (v) => v > 0 || 'Monto debe ser mayor a 0',
              (v) => v >= totalACobrar || `Monto debe ser al menos $${totalACobrar.toLocaleString('es-CO')}`
            ]"
            @update:model-value="calcularVuelto"
          ></v-text-field>

          <!-- Método de pago -->
          <v-select
            v-model="metodoPago"
            label="Método de pago"
            :items="metodosPago"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            class="mb-4"
            :rules="[(v) => !!v || 'Método de pago es obligatorio']"
          ></v-select>

          <!-- Transacción efectivo / Referencia de pago -->
          <v-text-field
            v-if="metodoPago && metodoPago !== 'EFECTIVO'"
            v-model="referencia"
            :label="`Referencia de ${metodoPago.toLowerCase()}`"
            placeholder="Ej: Número de comprobante, SWIFT, etc..."
            variant="outlined"
            density="compact"
            class="mb-4"
            :rules="[(v) => !!v || 'Referencia es obligatoria para este método']"
          ></v-text-field>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="handleClose"> Cancelar </v-btn>
        <v-btn
          color="success"
          variant="tonal"
          @click="confirmar"
          :loading="loading"
          :disabled="montoRecibido < totalACobrar || !metodoPago || (metodoPago !== 'EFECTIVO' && !referencia)"
        >
          Confirmar cobro
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MetodoPago } from '~/types/folio'

interface Props {
  totalACobrar: number
  loading?: boolean
}

interface Emits {
  (e: 'confirmar-cobro', datos: { montoRecibido: number; medioPago: MetodoPago; referencia?: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = ref(false)
const formRef = ref<any>(null)

const montoRecibido = ref(0)
const metodoPago = ref<MetodoPago | ''>('')
const referencia = ref('')

const metodosPago = [
  { label: 'Efectivo', value: 'EFECTIVO' },
  { label: 'Tarjeta de crédito', value: 'TARJETA' },
  { label: 'Transferencia bancaria', value: 'TRANSFERENCIA' },
  { label: 'Cheque', value: 'CHEQUE' },
  { label: 'Otro', value: 'OTRO' }
]

const vuelto = computed(() => {
  return Math.max(0, montoRecibido.value - props.totalACobrar)
})

const calcularVuelto = () => {
  // Auto-complete si el monto es exacto
  if (montoRecibido.value === props.totalACobrar) {
    // Ya está exacto
  }
}

const confirmar = async () => {
  const isValid = await formRef.value?.validate()
  if (!isValid) return

  emit('confirmar-cobro', {
    montoRecibido: montoRecibido.value,
    medioPago: metodoPago.value as MetodoPago,
    referencia: referencia.value || undefined
  })

  // Limpiar si guardó exitosamente
  if (!props.loading) {
    limpiarForm()
    isOpen.value = false
  }
}

const handleClose = () => {
  if (!props.loading) {
    limpiarForm()
    isOpen.value = false
  }
}

const limpiarForm = () => {
  formRef.value?.reset()
  montoRecibido.value = 0
  metodoPago.value = ''
  referencia.value = ''
}
</script>
