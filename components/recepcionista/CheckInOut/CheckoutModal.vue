<template>
  <v-dialog v-model="isOpen" max-width="760px" @update:model-value="handleClose">
    <template #activator="{ props }">
      <slot name="activator" :props="props"></slot>
    </template>

    <v-card>
      <v-card-title class="d-flex align-center justify-space-between ga-3">
        <div>
          <div class="text-h6">Check-out habitación #{{ reserva?.numeroHabitacion || '-' }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ reserva?.numeroReserva || 'Reserva sin código' }}
          </div>
        </div>
        <v-chip :color="folioPagado ? 'success' : 'warning'" variant="tonal" prepend-icon="mdi-logout">
          {{ folioPagado ? 'Listo para salida' : 'Requiere Caja' }}
        </v-chip>
      </v-card-title>

      <v-card-text>
        <v-alert
          v-if="mostrarAlertaPago"
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-4"
          icon="mdi-alert-circle-outline"
        >
          <div class="d-flex flex-column flex-md-row align-md-center justify-space-between ga-3">
            <div>
              <strong>Folio pendiente de pago</strong>
              <div class="text-caption mt-1">
                Registra el pago en Caja antes de confirmar la salida.
              </div>
            </div>
            <v-btn size="small" color="warning" variant="tonal" @click="emit('ir-caja')">
              Ir a Caja
            </v-btn>
          </div>
        </v-alert>

        <div class="summary-grid mb-5">
          <div class="summary-item">
            <span>Huésped</span>
            <strong>{{ reserva?.nombreCliente || '-' }}</strong>
            <small>{{ reserva?.cedulaCliente || 'Documento no disponible' }}</small>
          </div>
          <div class="summary-item">
            <span>Estadía</span>
            <strong>{{ formatearFechaCorta(reserva?.checkinFecha) }} - {{ formatearFechaCorta(reserva?.checkoutFecha) }}</strong>
            <small>{{ nochesEstadia }} noche(s)</small>
          </div>
          <div class="summary-item">
            <span>Folio</span>
            <strong>{{ etiquetaFolio }}</strong>
            <small>Saldo: {{ formatCurrency(reserva?.folioSaldo || 0) }}</small>
          </div>
          <div class="summary-item">
            <span>Total reserva</span>
            <strong>{{ formatCurrency(reserva?.montoTotal) }}</strong>
            <small>Precio final registrado</small>
          </div>
        </div>

        <v-form ref="formRef" @submit.prevent="confirmar">
          <v-row>
            <v-col cols="12" md="5">
              <v-text-field
                v-model="horaCheckout"
                label="Hora de check-out"
                type="time"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="7">
              <v-select
                v-model="estadoLimpieza"
                label="Estado operativo de la habitación"
                :items="estadosLimpieza"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="compact"
                :rules="[(v) => !!v || 'El estado es obligatorio']"
              />
            </v-col>
          </v-row>

          <v-list density="compact" class="checklist mb-4">
            <v-list-item>
              <template #prepend>
                <v-checkbox-btn v-model="confirmaHabitacion" color="primary" />
              </template>
              <v-list-item-title>Habitación revisada</v-list-item-title>
              <v-list-item-subtitle>Llaves, controles, minibar y novedades verificadas.</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-checkbox-btn v-model="confirmaObjetos" color="primary" />
              </template>
              <v-list-item-title>Objetos y novedades registradas</v-list-item-title>
              <v-list-item-subtitle>Daños, objetos olvidados o incidencias quedan en observaciones.</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-checkbox-btn :model-value="folioPagado" color="primary" disabled />
              </template>
              <v-list-item-title>Folio validado en Caja</v-list-item-title>
              <v-list-item-subtitle>El sistema bloquea la salida si aún hay saldo pendiente.</v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <v-textarea
            v-model="notasCheckout"
            label="Observaciones del check-out"
            placeholder="Ej: sin novedades, daño menor reportado, objeto olvidado en recepción..."
            variant="outlined"
            density="compact"
            rows="3"
            counter="500"
            maxlength="500"
          />
        </v-form>

        <v-alert
          v-if="!puedeConfirmar && !mostrarAlertaPago"
          type="warning"
          variant="tonal"
          density="compact"
          class="mt-4"
        >
          Completa la revisión operativa y el estado final de la habitación.
        </v-alert>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="handleClose">Cancelar</v-btn>
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-check"
          :loading="loading"
          :disabled="!puedeConfirmar"
          @click="confirmar"
        >
          Confirmar check-out
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ReservaParaCheckin, EstadoLimpieza } from '~/types/checkinCheckout'

interface Props {
  reserva?: ReservaParaCheckin | null
  loading?: boolean
  folioPagado?: boolean
}

interface Emits {
  (e: 'confirmar', datos: { estado: EstadoLimpieza; notas?: string; hora?: string }): void
  (e: 'cerrar'): void
  (e: 'ir-caja'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = ref(true)
const formRef = ref<any>(null)

const horaCheckout = ref(new Date().toTimeString().slice(0, 5))
const notasCheckout = ref('')
const estadoLimpieza = ref<EstadoLimpieza | ''>('PENDIENTE_LIMPIEZA')
const confirmaHabitacion = ref(false)
const confirmaObjetos = ref(false)

const estadosLimpieza = [
  { label: 'Enviar a limpieza', value: 'PENDIENTE_LIMPIEZA' },
  { label: 'Limpieza en curso', value: 'EN_LIMPIEZA' },
  { label: 'Revisada y disponible', value: 'LIMPIO' },
  { label: 'Novedad o suciedad reportada', value: 'SUCIO' },
]

const mostrarAlertaPago = computed(() => !props.folioPagado)

const puedeConfirmar = computed(() => {
  return Boolean(props.folioPagado && estadoLimpieza.value && confirmaHabitacion.value && confirmaObjetos.value)
})

const etiquetaFolio = computed(() => {
  if (props.reserva?.folioEstado === 'NO_FOLIO') return 'Sin folio'
  if (props.folioPagado) return 'Pagado o sin saldo'
  return props.reserva?.folioEstado || 'Pendiente'
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

const confirmar = async () => {
  const result = await formRef.value?.validate()
  if (result && result.valid === false) return
  if (!puedeConfirmar.value) return

  emit('confirmar', {
    estado: estadoLimpieza.value as EstadoLimpieza,
    notas: notasCheckout.value || undefined,
    hora: horaCheckout.value || undefined,
  })

  if (!props.loading) {
    handleClose()
  }
}

const handleClose = () => {
  isOpen.value = false
  horaCheckout.value = new Date().toTimeString().slice(0, 5)
  notasCheckout.value = ''
  estadoLimpieza.value = 'PENDIENTE_LIMPIEZA'
  confirmaHabitacion.value = false
  confirmaObjetos.value = false
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
