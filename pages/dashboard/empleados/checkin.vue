<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Check-in de Huéspedes</h1>
        <p class="text-body-2 text-medium-emphasis">
          Registrar llegada de clientes al hotel
        </p>
      </div>
      <v-btn
        prepend-icon="mdi-refresh"
        color="primary"
        variant="tonal"
        @click="refrescarReservas"
        :loading="loading"
      >
        Actualizar
      </v-btn>
    </div>

    <!-- Búsqueda por reserva -->
    <v-card class="card-glow mb-6 pa-6">
      <div class="text-subtitle-2 font-weight-bold mb-4">Buscar Reserva</div>
      <v-row>
        <v-col cols="12" sm="8">
          <v-text-field
            v-model="numeroReserva"
            label="Número de Reserva"
            placeholder="Ej: RES-2026-001"
            prepend-inner-icon="mdi-calendar-check"
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
        Próximas a Check-in (Hoy)
      </v-card-title>
      <v-card-text v-if="proximasReservas.length > 0" class="pa-0">
        <v-data-table
          :headers="headers"
          :items="proximasReservas"
          :loading="loading"
          class="elevation-0"
        >
          <template #item.cliente="{ item }">
            <div>
              <div class="font-weight-bold">{{ item.nombreCliente }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.emailCliente }}</div>
            </div>
          </template>

          <template #item.habitacion="{ item }">
            <v-chip color="info" variant="tonal" size="small">
              Hab. {{ item.habitacion?.numeroHabitacion }}
            </v-chip>
          </template>

          <template #item.acciones="{ item }">
            <v-btn
              icon="mdi-login-variant"
              size="small"
              variant="text"
              color="success"
              @click="abrirCheckin(item)"
              title="Registrar Check-in"
            />
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-text v-else class="text-center py-8 text-medium-emphasis">
        No hay reservas próximas a check-in en este momento
      </v-card-text>
    </v-card>

    <!-- Diálogo de Check-in -->
    <v-dialog v-model="checkinDialog" max-width="600px">
      <v-card v-if="reservaSeleccionada">
        <v-card-title>Check-in — {{ reservaSeleccionada.nombreCliente }}</v-card-title>
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" sm="6">
              <div class="text-caption text-medium-emphasis">Habitación</div>
              <div class="text-h6 font-weight-bold">
                {{ reservaSeleccionada.habitacion?.numeroHabitacion }}
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="text-caption text-medium-emphasis">Tipo</div>
              <div class="text-h6 font-weight-bold">
                {{ reservaSeleccionada.tipoHabitacion?.nombreTipo }}
              </div>
            </v-col>
            <v-col cols="12">
              <v-checkbox
                v-model="documentoVerificado"
                label="Documento de identidad verificado"
                color="success"
              />
            </v-col>
            <v-col cols="12">
              <v-checkbox
                v-model="metodoPagoConfirmado"
                label="Método de pago confirmado"
                color="success"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="notasCheckin"
                label="Notas adicionales (opcional)"
                placeholder="Ej: Cliente requiere cuna, etc."
                variant="outlined"
              />
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
            :disabled="!documentoVerificado || !metodoPagoConfirmado"
            :loading="confirmandoCheckin"
          >
            Confirmar Check-in
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
  roles: [UserRole.RECEPCIONISTA, UserRole.ADMIN, UserRole.SUPERADMIN],
})

useHead({ title: 'Check-in de Huéspedes' })

const authStore = useAuthStore()
const reservasStore = useReservasStore()
const { success, error } = useNotification()

const loading = ref(false)
const confirmandoCheckin = ref(false)
const numeroReserva = ref('')
const checkinDialog = ref(false)
const reservaSeleccionada = ref<Reserva | null>(null)
const documentoVerificado = ref(false)
const metodoPagoConfirmado = ref(false)
const notasCheckin = ref('')

const headers = [
  { title: 'Cliente', key: 'cliente', width: '250px' },
  { title: 'Habitación', key: 'habitacion', width: '150px' },
  { title: 'Entrada', key: 'fechaEntrada' },
  { title: 'Acciones', key: 'acciones', width: '80px' },
]

// Cargar reservas confirmadas sin checkin realizado
const proximasReservas = computed(() =>
  reservasStore.reservas.filter(r =>
    r.estadoReserva?.toLowerCase() === 'confirmada' && !r.checkinReal
  )
)

// Al montar, cargar reservas del hotel
onMounted(async () => {
  if (authStore.user?.idHotel) {
    await refrescarReservas()
  }
})

const refrescarReservas = async () => {
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
  if (!numeroReserva.value) {
    error('Ingrese número de reserva o cédula')
    return
  }
  loading.value = true
  try {
    // Buscar reserva por cédula del cliente
    await reservasStore.fetchReservasByCedula(numeroReserva.value)
  } catch (err: any) {
    error(err?.message || 'Error al buscar reserva')
  } finally {
    loading.value = false
  }
}

const abrirCheckin = (reserva: Reserva) => {
  reservaSeleccionada.value = reserva
  documentoVerificado.value = false
  metodoPagoConfirmado.value = false
  notasCheckin.value = ''
  checkinDialog.value = true
}

const confirmarCheckin = async () => {
  if (!reservaSeleccionada.value) return
  if (!documentoVerificado.value || !metodoPagoConfirmado.value) {
    error('Complete los requisitos de check-in')
    return
  }

  confirmandoCheckin.value = true
  try {
    // Llamar API para registrar check-in
    await reservasStore.confirmarCheckin(reservaSeleccionada.value.id)
    success('Check-in registrado exitosamente')
    checkinDialog.value = false
    // Recargar lista
    await refrescarReservas()
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
