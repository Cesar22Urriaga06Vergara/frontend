<template>
  <div>
    <!-- Header con Estadísticas -->
    <div class="mb-6">
      <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
        <div>
          <h1 class="text-h5 font-weight-bold mb-1">Gestión de Reservas</h1>
          <p class="text-body-2 text-medium-emphasis">
            Total: {{ reservasStore.totalCount }} reservas | Actualizado hace poco
          </p>
        </div>
        <v-btn
          @click="loadReservas"
          :loading="reservasStore.loading"
          color="primary"
          prepend-icon="mdi-refresh"
        >
          Actualizar
        </v-btn>
      </div>

      <!-- Cards de Resumen por Estado -->
      <v-row class="ga-2">
        <v-col cols="12" sm="6" md="3">
          <v-card class="card-glow">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-medium-emphasis">Reservadas</p>
                  <p class="text-h6 font-weight-bold">{{ countByEstado.reservada || 0 }}</p>
                </div>
                <v-avatar color="warning" variant="tonal" size="40">
                  <v-icon icon="mdi-calendar" />
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="card-glow">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-medium-emphasis">Confirmadas</p>
                  <p class="text-h6 font-weight-bold">{{ countByEstado.confirmada || 0 }}</p>
                </div>
                <v-avatar color="success" variant="tonal" size="40">
                  <v-icon icon="mdi-check-circle" />
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="card-glow">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-medium-emphasis">En Ocupancia</p>
                  <p class="text-h6 font-weight-bold">{{ countByEstado.ocupada || 0 }}</p>
                </div>
                <v-avatar color="info" variant="tonal" size="40">
                  <v-icon icon="mdi-door-open" />
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="card-glow">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-medium-emphasis">Canceladas</p>
                  <p class="text-h6 font-weight-bold">{{ countByEstado.cancelada || 0 }}</p>
                </div>
                <v-avatar color="error" variant="tonal" size="40">
                  <v-icon icon="mdi-cancel" />
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Búsqueda y Filtros Avanzados -->
    <v-card class="card-glow mb-6 pa-6">
      <div class="text-subtitle-2 font-weight-bold mb-4">Buscar y Filtrar Reservas</div>
      <v-row>
        <v-col cols="12" sm="8">
          <v-text-field
            v-model="cedulaBusqueda"
            label="Buscar por cédula, nombre o código de confirmación"
            placeholder="Ej: 1234567890 o Juan Pérez"
            prepend-inner-icon="mdi-magnify"
            clearable
            @keyup.enter="buscarPorCedula"
          />
        </v-col>
        <v-col cols="12" sm="4" class="d-flex align-end">
          <v-btn
            @click="buscarPorCedula"
            :loading="reservasStore.loading"
            color="primary"
            block
            prepend-icon="mdi-search-web"
          >
            Buscar
          </v-btn>
        </v-col>
        <v-col cols="12">
          <div class="d-flex gap-2 flex-wrap">
            <v-btn
              v-for="estado in filtroEstadoOpcionesRapidas"
              :key="estado.value"
              size="small"
              :variant="filtroEstadoSeleccionado === estado.value ? 'elevated' : 'tonal'"
              :color="estado.color"
              @click="filtrarPorEstado(estado.value)"
            >
              {{ estado.label }}
            </v-btn>
            <v-btn
              size="small"
              variant="text"
              @click="limpiarFiltros"
            >
              Limpiar filtros
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- Tabla de reservas -->
    <RecepcionistaReservasTable
      @confirm-reserva="openConfirmReservaDialog"
      @confirm-checkin="openConfirmCheckinDialog"
      @confirm-checkout="openConfirmCheckoutDialog"
      @cancel="openCancelDialog"
      @refresh="reloadCurrentSearch"
      @filter-changed="onFilterChanged"
    />

    <!-- Diálogo de confirmación: confirmar reserva -->
    <v-dialog
      v-model="confirmReservaDialog"
      max-width="500"
    >
      <v-card rounded="xl">
        <v-card-text class="pa-6">
          <div class="text-center mb-4">
            <v-avatar
              color="warning"
              size="56"
              variant="tonal"
              class="mb-4"
            >
              <v-icon icon="mdi-calendar-check-outline" size="28" />
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mb-2">Confirmar Reserva</h3>
            <p class="text-body-2 text-medium-emphasis">
              ¿Deseas confirmar esta reserva y cambiar su estado a confirmada?
            </p>
          </div>

          <!-- Detalles de la reserva -->
          <v-alert
            v-if="selectedReserva"
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            <template #title>Reserva {{ selectedReserva.codigoConfirmacion }}</template>
            <p class="text-caption mb-1">
              Habitación: {{ selectedReserva.habitacion?.numeroHabitacion || 'Por asignar' }}
            </p>
            <p class="text-caption mb-1">
              Check-in: {{ new Date(selectedReserva.checkinPrevisto).toLocaleDateString('es-CO') }}
            </p>
            <p class="text-caption">
              Cliente: {{ selectedReserva.nombreCliente || 'No especificado' }}
            </p>
          </v-alert>
        </v-card-text>

        <v-card-actions class="px-6 pb-5">
          <v-btn
            variant="text"
            @click="confirmReservaDialog = false"
            :disabled="confirmReservaLoading"
          >
            Cancelar
          </v-btn>
          <v-spacer />
          <v-btn
            color="warning"
            :loading="confirmReservaLoading"
            @click="handleConfirmReserva"
          >
            Confirmar Reserva
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmación: check-in -->
    <v-dialog
      v-model="confirmCheckinDialog"
      max-width="500"
    >
      <v-card rounded="xl">
        <v-card-text class="pa-6">
          <div class="text-center mb-4">
            <v-avatar
              color="success"
              size="56"
              variant="tonal"
              class="mb-4"
            >
              <v-icon icon="mdi-door-open-outline" size="28" />
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mb-2">Confirmar Check-in</h3>
            <p class="text-body-2 text-medium-emphasis">
              Ingrese la cédula del cliente para confirmar la entrada
            </p>
          </div>

          <!-- Detalles de la reserva -->
          <v-alert
            v-if="selectedReserva"
            type="info"
            variant="tonal"
            class="mb-4"
          >
            <template #title>Reserva {{ selectedReserva.codigoConfirmacion }}</template>
            <p class="text-caption mb-1">
              Habitación: {{ selectedReserva.habitacion?.numeroHabitacion || 'Por asignar' }}
            </p>
            <p class="text-caption">
              Cliente: {{ selectedReserva.nombreCliente }}
            </p>
          </v-alert>

          <!-- Cédula del cliente -->
          <v-text-field
            v-model="cedulaConfirm"
            label="Cédula del cliente"
            placeholder="Ej: 1003001750"
            prepend-inner-icon="mdi-card-account-details-outline"
            outlined
            dense
            :disabled="checkinLoading"
            @keyup.enter="handleConfirmCheckin"
          />

          <p class="text-caption text-medium-emphasis text-center mt-3">
            Verifica que la cédula coincida con el documento de identidad del cliente
          </p>
        </v-card-text>

        <v-card-actions class="px-6 pb-5">
          <v-btn
            variant="text"
            @click="confirmCheckinDialog = false"
            :disabled="checkinLoading"
          >
            Cancelar
          </v-btn>
          <v-spacer />
          <v-btn
            color="success"
            :loading="checkinLoading"
            @click="handleConfirmCheckin"
            :disabled="!cedulaConfirm.trim()"
          >
            Confirmar Entrada
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmación: check-out -->
    <v-dialog
      v-model="confirmCheckoutDialog"
      max-width="500"
    >
      <v-card rounded="xl">
        <v-card-text class="pa-6">
          <div class="text-center mb-4">
            <v-avatar
              color="info"
              size="56"
              variant="tonal"
              class="mb-4"
            >
              <v-icon icon="mdi-door-closed-outline" size="28" />
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mb-2">Confirmar Check-out</h3>
            <p class="text-body-2 text-medium-emphasis">
              ¿El cliente desocupará la habitación ahora?
            </p>
          </div>

          <!-- Detalles de la reserva -->
          <v-alert
            v-if="selectedReserva"
            type="info"
            variant="tonal"
            class="mb-4"
          >
            <template #title>Reserva {{ selectedReserva.codigoConfirmacion }}</template>
            <p class="text-caption mb-1">
              Habitación: {{ selectedReserva.habitacion?.numeroHabitacion || 'Por asignar' }}
            </p>
            <p class="text-caption">
              Cliente: {{ selectedReserva.nombreCliente }}
            </p>
          </v-alert>
        </v-card-text>

        <v-card-actions class="px-6 pb-5">
          <v-btn
            variant="text"
            @click="confirmCheckoutDialog = false"
            :disabled="checkoutLoading"
          >
            Cancelar
          </v-btn>
          <v-spacer />
          <v-btn
            color="info"
            :loading="checkoutLoading"
            @click="handleConfirmCheckout"
          >
            Confirmar Salida
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de cancelación -->
    <v-dialog
      v-model="cancelDialog"
      max-width="500"
    >
      <v-card rounded="xl">
        <v-card-text class="pa-6">
          <div class="text-center mb-4">
            <v-avatar
              color="error"
              size="56"
              variant="tonal"
              class="mb-4"
            >
              <v-icon icon="mdi-alert-circle-outline" size="28" />
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mb-2">Cancelar Reserva</h3>
            <p class="text-body-2 text-medium-emphasis">
              ¿Está seguro de que desea cancelar la reserva {{ selectedReserva?.codigoConfirmacion }}?
            </p>
          </div>

          <!-- Motivo de cancelación -->
          <v-text-field
            v-model="cancelReason"
            label="Motivo de cancelación (opcional)"
            placeholder="Ej: Cancelación por solicitud del cliente"
            outlined
            dense
            class="mb-4"
          />
        </v-card-text>

        <v-card-actions class="px-6 pb-5">
          <v-btn
            variant="text"
            @click="cancelDialog = false"
            :disabled="cancelLoading"
          >
            No, mantener
          </v-btn>
          <v-spacer />
          <v-btn
            color="error"
            :loading="cancelLoading"
            @click="handleCancelReserva"
          >
            Sí, cancelar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useReservasStore } from '~/stores/reservas'
import { useNotification } from '~/composables/useNotification'
import { useAuthStore } from '~/stores/auth'
import { UserRole } from '~/types/auth'
import type { Reserva } from '~/types/api'
import RecepcionistaReservasTable from '~/components/shared/RecepcionistaReservasTable.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.SUPERADMIN],
})

useHead({ title: 'Gestión de Reservas' })

const reservasStore = useReservasStore()
const authStore = useAuthStore()
const notification = useNotification()

// ── State ──
const selectedReserva = ref<Reserva | null>(null)
const cedulaBusqueda = ref('')
const cedulaConfirm = ref('')
const filtroEstadoSeleccionado = ref<string | null>(null)

// Confirm reserva dialog
const confirmReservaDialog = ref(false)
const confirmReservaLoading = ref(false)

// Confirm checkin dialog
const confirmCheckinDialog = ref(false)
const checkinLoading = ref(false)

// Confirm checkout dialog
const confirmCheckoutDialog = ref(false)
const checkoutLoading = ref(false)

// Cancel dialog
const cancelDialog = ref(false)
const cancelLoading = ref(false)
const cancelReason = ref('')

// ── Opciones de filtro rápido ──
const filtroEstadoOpcionesRapidas = [
  { label: 'Reservadas', value: 'reservada', color: 'warning' },
  { label: 'Confirmadas', value: 'confirmada', color: 'success' },
  { label: 'En Ocupancia', value: 'ocupada', color: 'info' },
  { label: 'Canceladas', value: 'cancelada', color: 'error' },
]

// ── Computadas ──
const countByEstado = computed(() => {
  const counts: Record<string, number> = {
    reservada: 0,
    confirmada: 0,
    ocupada: 0,
    cancelada: 0,
  }

  reservasStore.reservas.forEach((r) => {
    const estado = r.estadoReserva?.toLowerCase() || 'reservada'
    if (estado in counts) {
      counts[estado]++
    }
  })

  return counts
})

// ── Carga inicial ──
const loadReservas = async () => {
  try {
    const hotelId = authStore.user?.idHotel
    if (hotelId) {
      await reservasStore.fetchReservasByHotel(hotelId)
    } else if (authStore.user?.role === UserRole.SUPERADMIN) {
      // Superadmin sin hotel asignado - cargar todas las reservas
      await reservasStore.fetchAllReservas()
    }
  } catch (error: any) {
    notification.error(error?.message || 'Error al cargar reservas')
  }
}

onMounted(() => {
  loadReservas()
})

// ── Handlers ──
const reloadCurrentSearch = async () => {
  try {
    const hotelId = authStore.user?.idHotel
    if (cedulaBusqueda.value.trim() && hotelId) {
      // Si hay cédula buscada, recargar esa búsqueda
      await reservasStore.fetchReservasByCedula(cedulaBusqueda.value, hotelId)
    } else if (hotelId) {
      // Si no hay cédula, recargar todas del hotel
      await reservasStore.fetchReservasByHotel(hotelId)
    } else if (authStore.user?.role === UserRole.SUPERADMIN) {
      await reservasStore.fetchAllReservas()
    }
  } catch (error: any) {
    notification.error('Error al recargar reservas')
  }
}

const buscarPorCedula = async () => {
  if (!cedulaBusqueda.value.trim()) {
    notification.warning('Ingrese cédula, nombre o código de confirmación para buscar')
    return
  }

  try {
    const hotelId = authStore.user?.idHotel
    if (hotelId) {
      await reservasStore.fetchReservasByCedula(cedulaBusqueda.value, hotelId)
    }
    filtroEstadoSeleccionado.value = null
  } catch (error: any) {
    notification.error(error?.message || 'Error al buscar reservas')
  }
}

const filtrarPorEstado = async (estado: string) => {
  filtroEstadoSeleccionado.value = filtroEstadoSeleccionado.value === estado ? null : estado
  cedulaBusqueda.value = ''
}

const limpiarFiltros = async () => {
  cedulaBusqueda.value = ''
  filtroEstadoSeleccionado.value = null
  await loadReservas()
}

const openConfirmReservaDialog = (reserva: Reserva) => {
  selectedReserva.value = reserva
  confirmReservaDialog.value = true
}

const openConfirmCheckinDialog = (reserva: Reserva) => {
  selectedReserva.value = reserva
  cedulaConfirm.value = ''
  confirmCheckinDialog.value = true
}

const openConfirmCheckoutDialog = (reserva: Reserva) => {
  selectedReserva.value = reserva
  confirmCheckoutDialog.value = true
}

const openCancelDialog = (reserva: Reserva) => {
  selectedReserva.value = reserva
  cancelReason.value = ''
  cancelDialog.value = true
}

const handleConfirmReserva = async () => {
  if (!selectedReserva.value) return

  confirmReservaLoading.value = true
  try {
    await reservasStore.confirmarReservaEstado(selectedReserva.value.id)
    notification.success(
      `Reserva confirmada para ${selectedReserva.value.codigoConfirmacion}`
    )
    confirmReservaDialog.value = false
    await reloadCurrentSearch()
  } catch (error: any) {
    notification.error(
      error?.message || 'Error al confirmar reserva'
    )
  } finally {
    confirmReservaLoading.value = false
  }
}

const handleConfirmCheckin = async () => {
  if (!selectedReserva.value || !cedulaConfirm.value.trim()) return

  // Validar que la cédula coincida
  if (selectedReserva.value.cedulaCliente !== cedulaConfirm.value.trim()) {
    notification.error('La cédula ingresada no coincide con el cliente de la reserva')
    return
  }

  checkinLoading.value = true
  try {
    await reservasStore.confirmarCheckin(selectedReserva.value.id)
    notification.success(`Check-in confirmado para ${selectedReserva.value.nombreCliente}`)
    confirmCheckinDialog.value = false
    await reloadCurrentSearch()
  } catch (error: any) {
    notification.error(error?.message || 'Error al confirmar check-in')
  } finally {
    checkinLoading.value = false
  }
}

const handleConfirmCheckout = async () => {
  if (!selectedReserva.value) return

  checkoutLoading.value = true
  try {
    await reservasStore.confirmarCheckout(selectedReserva.value.id)
    notification.success(`Check-out confirmado para ${selectedReserva.value.nombreCliente}`)
    confirmCheckoutDialog.value = false
    await reloadCurrentSearch()
  } catch (error: any) {
    notification.error(error?.message || 'Error al confirmar check-out')
  } finally {
    checkoutLoading.value = false
  }
}

const handleCancelReserva = async () => {
  if (!selectedReserva.value) return

  cancelLoading.value = true
  try {
    await reservasStore.cancelarReserva(selectedReserva.value.id, cancelReason.value)
    notification.success(`Reserva ${selectedReserva.value.codigoConfirmacion} cancelada`)
    cancelDialog.value = false
    await reloadCurrentSearch()
  } catch (error: any) {
    notification.error(error?.message || 'Error al cancelar reserva')
  } finally {
    cancelLoading.value = false
  }
}

const onFilterChanged = () => {
  // Aquí se pueden manejar cambios en filtros de la tabla si es necesario
}
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>


