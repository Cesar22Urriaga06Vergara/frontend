<template>
  <v-dialog v-model="isOpen" max-width="760px" @update:model-value="handleClose">
    <template #activator="{ props }">
      <slot name="activator" :props="props"></slot>
    </template>

    <v-card>
      <v-card-title class="d-flex align-center justify-space-between ga-3">
        <div>
          <div class="text-h6">Check-in habitación #{{ reserva?.numeroHabitacion || '-' }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ reserva?.numeroReserva || 'Reserva sin código' }}
          </div>
        </div>
        <v-chip color="success" variant="tonal" prepend-icon="mdi-login">
          Entrada
        </v-chip>
      </v-card-title>

      <v-card-text>
        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          Al confirmar se marca la habitación como ocupada y se abre el folio operativo en Caja.
        </v-alert>

        <div class="summary-grid mb-5">
          <div class="summary-item">
            <span>Huésped principal</span>
            <strong>{{ reserva?.nombreCliente || '-' }}</strong>
            <small>{{ reserva?.cedulaCliente || 'Documento no disponible' }}</small>
          </div>
          <div class="summary-item">
            <span>Habitación</span>
            <strong>#{{ reserva?.numeroHabitacion || '-' }}</strong>
            <small>{{ reserva?.tipoHabitacion || 'Tipo no disponible' }}</small>
          </div>
          <div class="summary-item">
            <span>Fechas</span>
            <strong>{{ formatearFechaCorta(reserva?.checkinFecha) }} - {{ formatearFechaCorta(reserva?.checkoutFecha) }}</strong>
            <small>{{ nochesEstadia }} noche(s)</small>
          </div>
          <div class="summary-item">
            <span>Personas</span>
            <strong>{{ reserva?.cantidadHuespedes || 0 }} huésped(es)</strong>
            <small>Validar acompañantes en recepción</small>
          </div>
          <div class="summary-item">
            <span>Tarifa total</span>
            <strong class="text-success">{{ formatCurrency(reserva?.montoTotal) }}</strong>
            <small>Precio final registrado</small>
          </div>
          <div class="summary-item">
            <span>Hora operativa</span>
            <strong>{{ horaCheckin || '-' }}</strong>
            <small>{{ formatearFechaCompleta(new Date().toISOString()) }}</small>
          </div>
        </div>

        <v-form ref="formRef" @submit.prevent="confirmar">
          <v-row>
            <v-col cols="12" md="5">
              <v-text-field
                v-model="horaCheckin"
                label="Hora de check-in"
                type="time"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="7">
              <v-text-field
                v-model="documentoValidado"
                label="Documento validado"
                :placeholder="reserva?.cedulaCliente || 'Número de documento'"
                variant="outlined"
                density="compact"
              />
            </v-col>
          </v-row>

          <v-list density="compact" class="checklist mb-4">
            <v-list-item>
              <template #prepend>
                <v-checkbox-btn v-model="confirmaDocumentos" color="primary" />
              </template>
              <v-list-item-title>Identificación del huésped validada</v-list-item-title>
              <v-list-item-subtitle>Documento físico o digital revisado antes de entregar la habitación.</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-checkbox-btn v-model="confirmaAcompanantes" color="primary" />
              </template>
              <v-list-item-title>Huéspedes y acompañantes confirmados</v-list-item-title>
              <v-list-item-subtitle>La cantidad coincide con la reserva y queda lista para control operativo.</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-checkbox-btn v-model="confirmaEntrega" color="primary" />
              </template>
              <v-list-item-title>Llave, tarjeta o acceso entregado</v-list-item-title>
              <v-list-item-subtitle>El huésped recibe indicaciones básicas de la estadía.</v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <v-textarea
            v-model="notasCheckin"
            label="Observaciones del check-in"
            placeholder="Ej: solicitud de piso alto, llegada tardía, acompañante pendiente por registrar..."
            variant="outlined"
            density="compact"
            rows="3"
            counter="500"
            maxlength="500"
          />
        </v-form>

        <v-alert
          v-if="!puedeConfirmar"
          type="warning"
          variant="tonal"
          density="compact"
          class="mt-4"
        >
          Completa las validaciones operativas obligatorias para confirmar el check-in.
        </v-alert>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="handleClose">Cancelar</v-btn>
        <v-btn
          color="success"
          variant="tonal"
          prepend-icon="mdi-check"
          :loading="loading"
          :disabled="!puedeConfirmar"
          @click="confirmar"
        >
          Confirmar check-in
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ReservaParaCheckin } from '~/types/checkinCheckout'

interface Props {
  reserva?: ReservaParaCheckin | null
  loading?: boolean
}

interface Emits {
  (e: 'confirmar', datos: { notas?: string; hora?: string; documento?: string }): void
  (e: 'cerrar'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = ref(true)
const formRef = ref<any>(null)

const horaCheckin = ref(new Date().toTimeString().slice(0, 5))
const documentoValidado = ref(props.reserva?.cedulaCliente || '')
const notasCheckin = ref('')
const confirmaDocumentos = ref(false)
const confirmaAcompanantes = ref(false)
const confirmaEntrega = ref(false)

const puedeConfirmar = computed(() => {
  return confirmaDocumentos.value && confirmaAcompanantes.value && confirmaEntrega.value
})

const nochesEstadia = computed(() => {
  if (!props.reserva?.checkinFecha || !props.reserva?.checkoutFecha) return 0

  const checkin = new Date(props.reserva.checkinFecha)
  const checkout = new Date(props.reserva.checkoutFecha)
  const diff = checkout.getTime() - checkin.getTime()

  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

const formatCurrency = (valor?: number) => {
  return `$${Number(valor || 0).toLocaleString('es-CO')}`
}

const formatearFechaCorta = (fecha?: string) => {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-CO', {
    month: 'short',
    day: '2-digit',
  })
}

const formatearFechaCompleta = (fecha?: string) => {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-CO', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const confirmar = async () => {
  const result = await formRef.value?.validate()
  if (result && result.valid === false) return
  if (!puedeConfirmar.value) return

  emit('confirmar', {
    notas: notasCheckin.value || undefined,
    hora: horaCheckin.value || undefined,
    documento: documentoValidado.value || undefined,
  })

  if (!props.loading) {
    handleClose()
  }
}

const handleClose = () => {
  isOpen.value = false
  horaCheckin.value = new Date().toTimeString().slice(0, 5)
  documentoValidado.value = props.reserva?.cedulaCliente || ''
  notasCheckin.value = ''
  confirmaDocumentos.value = false
  confirmaAcompanantes.value = false
  confirmaEntrega.value = false
  emit('cerrar')
}
</script>

<style scoped>
.summary-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.summary-item {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  padding: 12px;
}

.summary-item span,
.summary-item small {
  display: block;
  color: rgba(var(--v-theme-on-surface), 0.62);
}

.summary-item strong {
  display: block;
  margin: 3px 0;
}

.checklist {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
}
</style>
