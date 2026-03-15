<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Registrar Entrada de Huéspedes</h1>
        <p class="text-body-2 text-medium-emphasis">
          Busca por cédula del cliente y confirma su entrada
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

    <!-- Reservas próximas a check-in -->
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
            <v-chip color="info" variant="tonal" size="small">
              Hab. {{ reservaEncontrada.habitacion?.numeroHabitacion }}
            </v-chip>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Tipo</div>
            <div class="text-body-2">{{ reservaEncontrada.tipoHabitacion?.nombreTipo }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Entrada</div>
            <div class="text-body-2">{{ new Date(reservaEncontrada.checkinPrevisto).toLocaleDateString('es-CO') }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Salida</div>
            <div class="text-body-2">{{ new Date(reservaEncontrada.checkoutPrevisto).toLocaleDateString('es-CO') }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Email</div>
            <div class="text-body-2">{{ reservaEncontrada.emailCliente }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Estado</div>
            <v-chip :color="estadoColor" size="small" variant="tonal">
              {{ reservaEncontrada.estadoReserva }}
            </v-chip>
          </v-col>
        </v-row>
        <v-divider class="my-4" />
        <div class="d-flex justify-end gap-2">
          <v-btn variant="text" @click="limpiarBusqueda">
            Limpiar
          </v-btn>
          <v-btn
            color="success"
            @click="abrirCheckin"
            prepend-icon="mdi-login-variant"
            :disabled="reservaEncontrada.checkinReal !== null"
          >
            Confirmar Entrada
          </v-btn>
        </div>
      </v-card-text>
      <v-card-text v-else class="text-center py-8 text-medium-emphasis">
        Busca una cédula para ver los detalles de la reserva
      </v-card-text>
    </v-card>

    <!-- Diálogo de Registrar Entrada -->
    <v-dialog v-model="checkinDialog" max-width="500px">
      <v-card v-if="reservaEncontrada">
        <v-card-title>Registrar Entrada — {{ reservaEncontrada.nombreCliente }}</v-card-title>
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-2 font-weight-bold mb-2">Información de la Reserva</div>
              <div class="text-body-2 mb-1">
                <strong>Habitación:</strong> {{ reservaEncontrada.habitacion?.numeroHabitacion }}
              </div>
              <div class="text-body-2 mb-4">
                <strong>Tipo:</strong> {{ reservaEncontrada.tipoHabitacion?.nombreTipo }}
              </div>
            </v-col>

            <!-- Verificación de documento -->
            <v-col cols="12">
              <v-checkbox
                v-model="documentoVerificado"
                label="Documento de identidad verificado"
                color="success"
              />
            </v-col>

            <!-- Notas opcionales -->
            <v-col cols="12">
              <v-text-field
                v-model="notasCheckin"
                label="Notas de entrada (opcional)"
                placeholder="Ej: Cliente requiere cuna, etc."
                variant="outlined"
              />
            </v-col>

            <!-- Información sobre validación de pago -->
            <v-col cols="12">
              <v-alert type="info" variant="tonal">
                El método de pago será validado al momento de la salida del cliente.
              </v-alert>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn variant="text" @click="checkinDialog = false">
            Cancelar
          </v-btn>
          <v-btn
            color="success"
            @click="confirmarCheckin"
            :disabled="!documentoVerificado"
            :loading="confirmandoCheckin"
            prepend-icon="mdi-check"
          >
            Confirmar Entrada
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
import { useNotification } from '~/composables/useNotification'
import type { Reserva } from '~/types/api'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.RECEPCIONISTA],
})

useHead({ title: 'Registrar Entrada de Huéspedes' })

const authStore = useAuthStore()
const reservasStore = useReservasStore()
const { success, error } = useNotification()

const loading = ref(false)
const confirmandoCheckin = ref(false)
const cedula = ref('')
const checkinDialog = ref(false)
const reservaEncontrada = ref<Reserva | null>(null)
const documentoVerificado = ref(false)
const notasCheckin = ref('')

// Al montar, cargar reservas del hotel actual
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

// Computada para color del estado
const estadoColor = computed<string>(() => {
  if (!reservaEncontrada.value) return 'grey'
  const estado = reservaEncontrada.value.estadoReserva?.toLowerCase()
  switch (estado) {
    case 'reservada':
      return 'warning'
    case 'confirmada':
      return 'success'
    case 'cancelada':
      return 'error'
    default:
      return 'grey'
  }
})

const buscarReserva = async () => {
  if (!cedula.value) {
    error('Ingrese la cédula del cliente')
    return
  }

  // Filtrar localmente desde las reservas cargadas
  const reserva = reservasStore.reservas.find(r =>
    r.cedulaCliente === cedula.value &&
    (r.estadoReserva?.toLowerCase() === 'confirmada' ||
      r.estadoReserva?.toLowerCase() === 'reservada') &&
    !r.checkinReal
  )

  if (!reserva) {
    error('No hay reserva disponible para esa cédula')
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

const abrirCheckin = () => {
  if (!reservaEncontrada.value) return
  documentoVerificado.value = false
  notasCheckin.value = ''
  checkinDialog.value = true
}

const confirmarCheckin = async () => {
  if (!reservaEncontrada.value) return
  if (!documentoVerificado.value) {
    error('Debe verificar el documento del cliente')
    return
  }

  confirmandoCheckin.value = true
  try {
    // Paso 1: Confirmar estado de la reserva (cambiar de 'reservada' a 'confirmada')
    await reservasStore.confirmarReservaEstado(reservaEncontrada.value.id)
    
    // Paso 2: Registrar el check-in
    await reservasStore.confirmarCheckin(reservaEncontrada.value.id)
    
    success('Check-in registrado exitosamente')
    checkinDialog.value = false
    limpiarBusqueda()
    // Recargar reservas
    await cargarReservas()
  } catch (err: any) {
    error(err?.message || 'Error al registrar check-in')
  } finally {
    confirmandoCheckin.value = false
  }
}
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
