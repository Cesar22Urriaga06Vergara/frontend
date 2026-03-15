<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Registrar Salida de Huéspedes</h1>
        <p class="text-body-2 text-medium-emphasis">
          Busca por cédula del cliente, verifica la habitación y procesa el pago
        </p>
      </div>
    </div>

    <!-- Búsqueda por cédula -->
    <v-card class="card-glow mb-6 pa-6">
      <div class="text-subtitle-2 font-weight-bold mb-4">Buscar por Cédula del Cliente</div>
      <v-row>
        <v-col cols="12" sm="8">
          <v-text-field
            v-model="cedula"
            label="Cédula del Cliente"
            placeholder="Ej: 1234567890"
            prepend-inner-icon="mdi-card-account-details"
            clearable
            @keyup.enter="buscarReserva"
          />
        </v-col>
        <v-col cols="12" sm="4" class="d-flex align-end">
          <v-btn
            @click="buscarReserva"
            :loading="loading"
            color="primary"
            block
            prepend-icon="mdi-magnify"
          >
            Buscar
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Detalles de la Reserva -->
    <v-card class="card-glow mb-6">
      <v-card-title class="text-subtitle-1 font-weight-bold">
        Detalles de la Reserva
      </v-card-title>
      <v-card-text v-if="reservaEncontrada" class="pa-6">
        <v-row>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Cliente</div>
            <div class="text-h6 font-weight-bold mb-4">{{ reservaEncontrada.nombreCliente }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Cédula</div>
            <div class="text-h6 font-weight-bold mb-4">{{ reservaEncontrada.cedulaCliente }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Habitación</div>
            <v-chip color="warning" variant="tonal" size="small">
              Hab. {{ reservaEncontrada.habitacion?.numeroHabitacion }}
            </v-chip>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Noches</div>
            <div class="text-body-2">{{ diasEstancia }} noche(s)</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Entrada Real</div>
            <div class="text-body-2">{{ new Date(reservaEncontrada.checkinReal || '').toLocaleDateString('es-CO') }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Salida Prevista</div>
            <div class="text-body-2">{{ new Date(reservaEncontrada.checkoutPrevisto).toLocaleDateString('es-CO') }}</div>
          </v-col>
          <v-col cols="12">
            <div class="text-caption text-medium-emphasis">Email</div>
            <div class="text-body-2">{{ reservaEncontrada.emailCliente }}</div>
          </v-col>
        </v-row>
        <v-divider class="my-4" />
        <div class="d-flex justify-end gap-2">
          <v-btn variant="text" @click="limpiarBusqueda">
            Limpiar
          </v-btn>
          <v-btn
            color="error"
            @click="abrirCheckout"
            prepend-icon="mdi-logout-variant"
            :disabled="reservaEncontrada.checkoutReal !== null"
          >
            Confirmar Salida
          </v-btn>
        </div>
      </v-card-text>
      <v-card-text v-else class="text-center py-8 text-medium-emphasis">
        Busca una cédula para ver los detalles de la reserva
      </v-card-text>
    </v-card>

    <!-- Diálogo de Registrar Salida -->
    <v-dialog v-model="checkoutDialog" max-width="500px">
      <v-card v-if="reservaEncontrada">
        <v-card-title>Registrar Salida — {{ reservaEncontrada.nombreCliente }}</v-card-title>
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-2 font-weight-bold mb-2">Información de la Reserva</div>
              <div class="text-body-2 mb-1">
                <strong>Habitación:</strong> {{ reservaEncontrada.habitacion?.numeroHabitacion }}
              </div>
              <div class="text-body-2 mb-4">
                <strong>Estancia:</strong> {{ diasEstancia }} noche(s)
              </div>
            </v-col>

            <!-- Estado de habitación -->
            <v-col cols="12">
              <v-select
                v-model="estadoHabitacion"
                :items="estadoOptions"
                label="Estado de la Habitación"
                variant="outlined"
                color="primary"
              />
            </v-col>

            <!-- Inspección realizada -->
            <v-col cols="12">
              <v-checkbox
                v-model="inspeccionRealizada"
                label="Inspección de habitación realizada"
                color="success"
              />
            </v-col>

            <!-- Método de pago -->
            <v-col cols="12">
              <v-select
                v-model="metodoPago"
                :items="metodoPagoOptions"
                label="Método de Pago"
                variant="outlined"
                required
              />
            </v-col>

            <!-- Notas de salida -->
            <v-col cols="12">
              <v-text-field
                v-model="notasCheckout"
                label="Notas de salida (opcional)"
                placeholder="Ej: Daños detectados, etc."
                variant="outlined"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn variant="text" @click="checkoutDialog = false">
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            @click="confirmarCheckout"
            :disabled="!inspeccionRealizada || !metodoPago"
            :loading="confirmandoCheckout"
            prepend-icon="mdi-logout-variant"
          >
            Confirmar Salida
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { UserRole } from '~/types/auth'
import { useAuthStore } from '~/stores/auth'
import { useReservasStore } from '~/stores/reservas'
import { useServiciosStore } from '~/stores/servicios'
import { useNotification } from '~/composables/useNotification'
import type { Reserva } from '~/types/api'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.SUPERADMIN],
})

useHead({ title: 'Registrar Salida de Huéspedes' })

const authStore = useAuthStore()
const reservasStore = useReservasStore()
const serviciosStore = useServiciosStore()
const { success, error } = useNotification()

const loading = ref(false)
const confirmandoCheckout = ref(false)
const cedula = ref('')
const checkoutDialog = ref(false)
const reservaEncontrada = ref<Reserva | null>(null)
const estadoHabitacion = ref('')
const inspeccionRealizada = ref(false)
const metodoPago = ref('')
const notasCheckout = ref('')

const estadoOptions = [
  { title: 'Limpia', value: 'limpia' },
  { title: 'Requiere limpieza', value: 'requiere_limpieza' },
  { title: 'Con daños', value: 'dañada' },
]

const metodoPagoOptions = [
  { title: 'Efectivo', value: 'efectivo' },
  { title: 'Tarjeta Crédito', value: 'tarjeta_credito' },
  { title: 'Tarjeta Débito', value: 'tarjeta_debito' },
  { title: 'Transferencia Bancaria', value: 'transferencia' },
  { title: 'Cheque', value: 'cheque' },
]

const diasEstancia = computed(() => {
  if (!reservaEncontrada.value) return 0
  const entrada = new Date(reservaEncontrada.value.checkinReal || reservaEncontrada.value.checkinPrevisto || new Date())
  const salida = new Date(new Date()) // Salida actual
  const diff = Math.ceil((salida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(1, diff)
})

onMounted(async () => {
  if (authStore.user?.idHotel) {
    await cargarReservas()
  }
})

const cargarReservas = async () => {
  loading.value = true
  try {
    if (authStore.user?.idHotel) {
      await reservasStore.fetchReservasByHotel(authStore.user.idHotel)
    }
  } catch (err: any) {
    error(err?.message || 'Error al cargar reservas')
  } finally {
    loading.value = false
  }
}

const buscarReserva = async () => {
  if (!cedula.value) {
    error('Ingrese la cédula del cliente')
    return
  }

  // Filtrar localmente desde las reservas cargadas (solo las que han hecho check-in)
  const reserva = reservasStore.reservas.find(r =>
    r.cedulaCliente === cedula.value &&
    r.checkinReal &&
    !r.checkoutReal
  )

  if (!reserva) {
    error('No hay reserva disponible para esa cédula o no ha realizado check-in')
    reservaEncontrada.value = null
    return
  }

  reservaEncontrada.value = reserva
  success(`Reserva encontrada: ${reserva.nombreCliente}`)
}

const limpiarBusqueda = () => {
  cedula.value = ''
  reservaEncontrada.value = null
}

const abrirCheckout = async () => {
  if (!reservaEncontrada.value) return
  estadoHabitacion.value = ''
  inspeccionRealizada.value = false
  metodoPago.value = ''
  notasCheckout.value = ''

  // Cargar cuenta del cliente (servicios + habitación)
  try {
    await serviciosStore.cargarCuenta(reservaEncontrada.value.id)
  } catch (err: any) {
    error('Error al cargar la cuenta del cliente')
  }

  checkoutDialog.value = true
}

const confirmarCheckout = async () => {
  if (!reservaEncontrada.value) return
  if (!inspeccionRealizada.value) {
    error('Debe realizar la inspección de la habitación')
    return
  }
  if (!metodoPago.value) {
    error('Debe seleccionar el método de pago')
    return
  }

  confirmandoCheckout.value = true
  try {
    // Registrar check-out en el store
    await reservasStore.confirmarCheckout(reservaEncontrada.value.id)
    success('Check-out registrado exitosamente')
    checkoutDialog.value = false
    limpiarBusqueda()
    // Recargar reservas
    await cargarReservas()
  } catch (err: any) {
    error(err?.message || 'Error al registrar check-out')
  } finally {
    confirmandoCheckout.value = false
  }
}
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>


