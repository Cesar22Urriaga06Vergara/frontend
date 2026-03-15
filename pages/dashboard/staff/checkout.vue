<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Check-out de Huéspedes</h1>
        <p class="text-body-2 text-medium-emphasis">
          Registrar salida y procesar pagos finales
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

    <!-- Búsqueda por habitación -->
    <v-card class="card-glow mb-6 pa-6">
      <div class="text-subtitle-2 font-weight-bold mb-4">Buscar por Habitación</div>
      <v-row>
        <v-col cols="12" sm="8">
          <v-text-field
            v-model="numeroHabitacion"
            label="Número de Habitación"
            placeholder="Ej: 101"
            prepend-inner-icon="mdi-door"
            clearable
            @keyup.enter="buscarHabitacion"
          />
        </v-col>
        <v-col cols="12" sm="4" class="d-flex align-end">
          <v-btn
            @click="buscarHabitacion"
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

    <!-- Huéspedes para check-out -->
    <v-card class="card-glow mb-6">
      <v-card-title class="text-subtitle-1 font-weight-bold">
        Pendientes de Check-out
      </v-card-title>
      <v-card-text v-if="reservasCheckin.length > 0" class="pa-0">
        <v-data-table
          :headers="headers"
          :items="reservasCheckin"
          :loading="loading"
          class="elevation-0"
        >
          <template #item.cliente="{ item }">
            <div>
              <div class="font-weight-bold">{{ item.cliente?.fullName }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.cliente?.email }}</div>
            </div>
          </template>

          <template #item.habitacion="{ item }">
            <v-chip color="warning" variant="tonal" size="small">
              Hab. {{ item.reserva?.habitacion?.numeroHabitacion }}
            </v-chip>
          </template>

          <template #item.acciones="{ item }">
            <v-btn
              icon="mdi-logout-variant"
              size="small"
              variant="text"
              color="error"
              @click="abrirCheckout(item)"
              title="Registrar Check-out"
            />
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-text v-else class="text-center py-8 text-medium-emphasis">
        No hay huéspedes pendientes de check-out
      </v-card-text>
    </v-card>

    <!-- Diálogo de Check-out -->
    <v-dialog v-model="checkoutDialog" max-width="600px">
      <v-card v-if="reservaSeleccionada">
        <v-card-title>Check-out — {{ reservaSeleccionada.cliente?.fullName }}</v-card-title>
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" sm="6">
              <div class="text-caption text-medium-emphasis">Habitación</div>
              <div class="text-h6 font-weight-bold">
                {{ reservaSeleccionada.reserva?.habitacion?.numeroHabitacion }}
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="text-caption text-medium-emphasis">Estancia</div>
              <div class="text-body-2">
                {{ diasEstancia }} noche(s)
              </div>
            </v-col>
            <v-col cols="12">
              <v-divider class="my-2" />
            </v-col>
            <v-col cols="12" sm="6">
              <div class="text-caption text-medium-emphasis">Estado de Habitación</div>
              <v-select
                v-model="estadoHabitacion"
                :items="estadoOptions"
                label="Seleccionar estado"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <div class="text-caption text-medium-emphasis">Inspección</div>
              <v-checkbox
                v-model="inspeccionRealizada"
                label="Inspección realizada"
                color="success"
              />
            </v-col>
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
            :disabled="!inspeccionRealizada"
            :loading="confirmandoCheckout"
          >
            Confirmar Check-out
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['recepcionista', 'admin', 'superadmin'],
})

useHead({ title: 'Check-out de Huéspedes' })

const authStore = useAuthStore()
const { success, error } = useNotification()

const loading = ref(false)
const confirmandoCheckout = ref(false)
const numeroHabitacion = ref('')
const checkoutDialog = ref(false)
const reservaSeleccionada = ref<any>(null)
const estadoHabitacion = ref('')
const inspeccionRealizada = ref(false)
const notasCheckout = ref('')

const estadoOptions = [
  { title: 'Limpia', value: 'limpia' },
  { title: 'Requiere limpieza', value: 'requiere_limpieza' },
  { title: 'Con daños', value: 'dañada' },
]

const headers = [
  { title: 'Cliente', key: 'cliente', width: '250px' },
  { title: 'Habitación', key: 'habitacion', width: '150px' },
  { title: 'Salida', key: 'fechaSalida' },
  { title: 'Acciones', key: 'acciones', width: '80px' },
]

// Reservas que ya han hecho check-in
const reservasCheckin = computed<any[]>(() => [])

const diasEstancia = computed(() => {
  if (!reservaSeleccionada.value) return 0
  // Calcular días
  return 1
})

const refrescarReservas = async () => {
  loading.value = true
  try {
    // Cargar reservas con check-in
  } finally {
    loading.value = false
  }
}

const buscarHabitacion = async () => {
  if (!numeroHabitacion.value) {
    error('Ingrese número de habitación')
    return
  }
  // Buscar la habitación ocupada
}

const abrirCheckout = (reserva: any) => {
  reservaSeleccionada.value = reserva
  estadoHabitacion.value = ''
  inspeccionRealizada.value = false
  notasCheckout.value = ''
  checkoutDialog.value = true
}

const confirmarCheckout = async () => {
  if (!inspeccionRealizada.value) {
    error('Debe realizar la inspección de la habitación')
    return
  }

  confirmandoCheckout.value = true
  try {
    // Llamar API para registrar check-out
    success('Check-out registrado exitosamente')
    checkoutDialog.value = false
    await refrescarReservas()
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
