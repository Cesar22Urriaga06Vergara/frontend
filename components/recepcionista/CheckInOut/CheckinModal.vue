<template>
  <v-dialog v-model="isOpen" max-width="600px" @update:model-value="handleClose">
    <template #activator="{ props }">
      <slot name="activator" :props="props"></slot>
    </template>

    <v-card :title="`Check-in #${reserva?.numeroHabitacion || ''}`">
      <v-card-text>
        <!-- INFO -->
        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          <strong>Resumen de la reserva</strong>
        </v-alert>

        <v-row class="mb-4">
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Cliente</div>
            <div class="text-subtitle-1 font-weight-bold">{{ reserva?.nombreCliente }}</div>
            <div class="text-caption">{{ reserva?.cedulaCliente }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Habitación</div>
            <div class="text-subtitle-1 font-weight-bold">#{{ reserva?.numeroHabitacion }}</div>
            <div class="text-caption">{{ reserva?.tipoHabitacion }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Check-in programado</div>
            <div class="text-subtitle-1 font-weight-bold">{{ formatearFecha(reserva?.checkinFecha) }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Check-out</div>
            <div class="text-subtitle-1 font-weight-bold">{{ formatearFecha(reserva?.checkoutFecha) }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Huéspedes</div>
            <div class="text-subtitle-1 font-weight-bold">{{ reserva?.cantidadHuespedes }} persona(s)</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Tarifa total</div>
            <div class="text-subtitle-1 font-weight-bold text-success">${{ reserva?.montoTotal.toLocaleString('es-CO') }}</div>
          </v-col>
        </v-row>

        <v-divider class="mb-4"></v-divider>

        <!-- FORM -->
        <v-form ref="formRef" @submit.prevent="confirmar">
          <v-text-field
            v-model="horaCheckin"
            label="Hora de check-in actual"
            type="time"
            variant="outlined"
            density="compact"
            class="mb-4"
          ></v-text-field>

          <v-textarea
            v-model="notasCheckin"
            label="Notas del check-in (opcional)"
            placeholder="Ej: Cliente solicitó habitación más alta, tiene mascota pequeña, etc..."
            variant="outlined"
            density="compact"
            rows="3"
            class="mb-2"
          ></v-textarea>

          <v-checkbox
            v-model="confirmaDocumentos"
            label="Confirmo haber validado identificación del cliente"
            color="primary"
            class="mb-4"
          ></v-checkbox>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="handleClose">Cancelar</v-btn>
        <v-btn
          color="success"
          variant="tonal"
          @click="confirmar"
          :loading="loading"
          :disabled="!confirmaDocumentos"
        >
          Confirmar check-in
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ReservaParaCheckin } from '~/types/checkinCheckout'

interface Props {
  reserva?: ReservaParaCheckin | null
  loading?: boolean
}

interface Emits {
  (e: 'confirmar', datos: { notas?: string; hora?: string }): void
  (e: 'cerrar'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = ref(true)
const formRef = ref<any>(null)

const horaCheckin = ref('')
const notasCheckin = ref('')
const confirmaDocumentos = ref(false)

const formatearFecha = (fecha?: string) => {
  if (!fecha) return '-'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-CO', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const confirmar = async () => {
  const isValid = await formRef.value?.validate()
  if (!isValid) return

  emit('confirmar', {
    notas: notasCheckin.value || undefined,
    hora: horaCheckin.value || undefined
  })

  if (!props.loading) {
    handleClose()
  }
}

const handleClose = () => {
  isOpen.value = false
  horaCheckin.value = ''
  notasCheckin.value = ''
  confirmaDocumentos.value = false
  emit('cerrar')
}
</script>
