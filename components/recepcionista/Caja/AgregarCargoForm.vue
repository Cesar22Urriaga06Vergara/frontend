<template>
  <v-dialog v-model="isOpen" max-width="600px" @update:model-value="handleClose">
    <template #activator="{ props }">
      <slot name="activator" :props="props">
        <v-btn v-bind="props" color="primary" icon prepend-icon="mdi-plus">
          Agregar cargo
        </v-btn>
      </slot>
    </template>

    <v-card title="Agregar cargo al folio">
      <v-card-text>
        <v-form ref="formRef" @submit.prevent="guardar">
          <!-- Descripción -->
          <v-text-field
            v-model="form.descripcion"
            label="Descripción"
            placeholder="Ej: Room service, Minibar, Servicio de limpieza..."
            variant="outlined"
            density="compact"
            class="mb-4"
            :rules="[
              (v) => !!v || 'Descripción es obligatoria',
              (v) => v?.length <= 200 || 'Máximo 200 caracteres'
            ]"
          ></v-text-field>

          <!-- Tipo de cargo -->
          <v-select
            v-model="form.tipo"
            label="Tipo de cargo"
            :items="tiposCargo"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            class="mb-4"
            :rules="[(v) => !!v || 'Tipo es obligatorio']"
          ></v-select>

          <!-- Monto -->
          <v-text-field
            v-model.number="form.monto"
            label="Monto"
            placeholder="0.00"
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
              (v) => v <= 999999.99 || 'Monto no puede exceder $999.999'
            ]"
          ></v-text-field>

          <!-- Cantidad (opcional) -->
          <v-text-field
            v-model.number="form.cantidad"
            label="Cantidad (opcional)"
            type="number"
            min="1"
            variant="outlined"
            density="compact"
            class="mb-4"
            hint="Ej: 2 unidades si es un consumo múltiple"
          ></v-text-field>

          <!-- Referencia (opcional) -->
          <v-text-field
            v-model="form.referencia"
            label="Referencia (opcional)"
            placeholder="Ej: Orden #123, Código del servicio..."
            variant="outlined"
            density="compact"
            class="mb-4"
            hint="Para seguimiento"
          ></v-text-field>

          <!-- Notas (opcional) -->
          <v-textarea
            v-model="form.notes"
            label="Notas (opcional)"
            placeholder="Observaciones adicionales..."
            variant="outlined"
            density="compact"
            rows="2"
            class="mb-4"
          ></v-textarea>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="handleClose"> Cancelar </v-btn>
        <v-btn
          color="primary"
          variant="tonal"
          @click="guardar"
          :loading="loading"
          :disabled="!form.descripcion || !form.tipo || !form.monto || form.monto <= 0"
        >
          Agregar cargo
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { TipoCargo, AgregarCargoDto } from '~/types/folio'

interface Props {
  loading?: boolean
}

interface Emits {
  (e: 'agregar', cargo: AgregarCargoDto): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = ref(false)
const formRef = ref<any>(null)

const tiposCargo = [
  { label: 'Consumo (Minibar, Room service)', value: 'CONSUMO' },
  { label: 'Servicio (Limpieza, Lavandería)', value: 'SERVICIO' },
  { label: 'Adicional (Parking, WiFi)', value: 'ADICIONAL' },
  { label: 'Descuento', value: 'DESCUENTO' },
  { label: 'Otro', value: 'OTRO' }
]

const form = reactive({
  descripcion: '',
  tipo: '' as TipoCargo,
  monto: 0,
  cantidad: 1,
  referencia: '',
  notes: ''
})

const guardar = async () => {
  const isValid = await formRef.value?.validate()
  if (!isValid) return

  const cargo: AgregarCargoDto = {
    descripcion: form.descripcion,
    tipo: form.tipo,
    monto: form.tipo === 'DESCUENTO' ? -Math.abs(form.monto) : form.monto,
    cantidad: form.cantidad || 1,
    referencia: form.referencia || undefined
  }

  emit('agregar', cargo)

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
  form.descripcion = ''
  form.tipo = '' as TipoCargo
  form.monto = 0
  form.cantidad = 1
  form.referencia = ''
  form.notes = ''
}

const open = () => {
  isOpen.value = true
}

defineExpose({ open })
</script>
