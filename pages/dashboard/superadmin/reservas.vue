<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Gestión de Reservas (Sistema)</h1>
        <p class="text-body-2 text-medium-emphasis">
          {{ reservasStore.totalCount }} reservas registradas en el sistema
        </p>
      </div>
      <v-btn
        @click="loadAllReservas"
        :loading="reservasStore.loading"
        color="primary"
        prepend-icon="mdi-refresh"
      >
        Actualizar
      </v-btn>
    </div>

    <!-- Tarjetas de conteos por estado -->
    <v-row class="mb-6">
      <v-col v-for="(count, estado) in countByEstado" :key="estado" cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4 text-center cursor-pointer" @click="filterByEstado(estado)">
          <div class="text-h6 font-weight-bold">{{ count }}</div>
          <div class="text-body-2 text-capitalize">{{ estado }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabla de reservas -->
    <v-card class="card-glow">
      <v-table fixed-header class="text-no-wrap">
        <thead>
          <tr>
            <th>Código</th>
            <th>Cliente</th>
            <th>Hotel</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredReservas.length === 0">
            <td colspan="7" class="text-center py-8">
              <div class="text-body-2 text-medium-emphasis">
                No hay reservas para mostrar
              </div>
            </td>
          </tr>
          <tr v-for="reserva in filteredReservas" :key="reserva.id">
            <td>
              <div class="font-weight-bold text-primary">
                {{ reserva.codigoConfirmacion }}
              </div>
            </td>
            <td>
              <div class="text-body-2">{{ reserva.nombreCliente }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ reserva.cedulaCliente }}
              </div>
            </td>
            <td>
              <div class="text-body-2">Hotel #{{ reserva.idHotel }}</div>
            </td>
            <td>
              <div class="text-body-2">
                {{  new Date(reserva.checkinPrevisto).toLocaleDateString('es-CO') }}
              </div>
            </td>
            <td>
              <div class="text-body-2">
                {{ new Date(reserva.checkoutPrevisto).toLocaleDateString('es-CO') }}
              </div>
            </td>
            <td>
              <v-chip
                :color="getEstadoColor(reserva.estadoReserva)"
                text-color="white"
                size="small"
                class="text-capitalize"
              >
                {{ reserva.estadoReserva }}
              </v-chip>
            </td>
            <td>
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    variant="text"
                    size="small"
                    v-bind="props"
                  />
                </template>
                <v-list density="compact">
                  <v-list-item
                    v-if="['reservada', 'confirmada'].includes(reserva.estadoReserva as string) && !reserva.checkinReal"
                    @click="openConfirmCheckinDialog(reserva)"
                  >
                    <template #prepend>
                      <v-icon icon="mdi-door-open-outline" />
                    </template>
                    <v-list-item-title>Check-in</v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    v-if="reserva.checkinReal && !reserva.checkoutReal"
                    @click="openConfirmCheckoutDialog(reserva)"
                  >
                    <template #prepend>
                      <v-icon icon="mdi-door-closed-outline" />
                    </template>
                    <v-list-item-title>Check-out</v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    v-if="reserva.estadoReserva !== 'cancelada' && reserva.estadoReserva !== 'completada'"
                    @click="openCancelDialog(reserva)"
                  >
                    <template #prepend>
                      <v-icon icon="mdi-close-circle-outline" color="error" />
                    </template>
                    <v-list-item-title class="text-error">Cancelar</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Diálogo de confirmación: check-in -->
    <v-dialog v-model="confirmCheckinDialog" max-width="500">
      <v-card rounded="xl">
        <v-card-text class="pa-6">
          <div class="text-center mb-4">
            <v-avatar color="success" size="56" variant="tonal" class="mb-4">
              <v-icon icon="mdi-door-open-outline" size="28" />
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mb-2">Confirmar Check-in</h3>
            <p class="text-body-2 text-medium-emphasis">
              ¿Confirmar el check-in para la reserva {{ selectedReserva?.codigoConfirmacion }}?
            </p>
          </div>
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
          <v-btn color="success" :loading="checkinLoading" @click="handleConfirmCheckin">
            Confirmar Check-in
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmación: check-out -->
    <v-dialog v-model="confirmCheckoutDialog" max-width="500">
      <v-card rounded="xl">
        <v-card-text class="pa-6">
          <div class="text-center mb-4">
            <v-avatar color="info" size="56" variant="tonal" class="mb-4">
              <v-icon icon="mdi-door-closed-outline" size="28" />
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mb-2">Confirmar Check-out</h3>
            <p class="text-body-2 text-medium-emphasis">
              ¿Confirmar el check-out para la reserva {{ selectedReserva?.codigoConfirmacion }}?
            </p>
          </div>
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
          <v-btn color="info" :loading="checkoutLoading" @click="handleConfirmCheckout">
            Confirmar Check-out
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de cancelación -->
    <v-dialog v-model="cancelDialog" max-width="500">
      <v-card rounded="xl">
        <v-card-text class="pa-6">
          <div class="text-center mb-4">
            <v-avatar color="error" size="56" variant="tonal" class="mb-4">
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
          <v-btn color="error" :loading="cancelLoading" @click="handleCancelReserva">
            Sí, cancelar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useReservasStore } from '~/stores/reservas'
import { useNotification } from '~/composables/useNotification'
import { UserRole } from '~/types/auth'
import type { Reserva } from '~/types/api'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.SUPERADMIN],
})

useHead({ title: 'Gestión de Reservas' })

const reservasStore = useReservasStore()
const notification = useNotification()

// ── State ──
const selectedReserva = ref<Reserva | null>(null)
const estadoFilter = ref<string | undefined>(undefined)

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

// ── Computed ──
const filteredReservas = computed(() => {
  if (!estadoFilter.value) {
    return reservasStore.reservas
  }
  return reservasStore.reservas.filter((r) => r.estadoReserva === estadoFilter.value)
})

const countByEstado = computed(() => {
  const counts: Record<string, number> = {}
  reservasStore.reservas.forEach((r) => {
    const estado = r.estadoReserva
    counts[estado] = (counts[estado] || 0) + 1
  })
  return counts
})

// ── Métodos ──
const getEstadoColor = (estado: string) => {
  const colors: Record<string, string> = {
    reservada: 'warning',
    confirmada: 'success',
    completada: 'info',
    cancelada: 'error',
  }
  return colors[estado] || 'default'
}

// Cargar todas las reservas (podría ser de un hotel específico o todas)
const loadAllReservas = async () => {
  try {
    // Temporal: cargar del hotel 1, en el futuro debería ser todas
    // await reservasStore.fetchReservasByHotel(1)
    notification.info('Funcionalidad temporalmente en desarrollo')
  } catch (error: any) {
    notification.error(error?.message || 'Error al cargar reservas')
  }
}

const filterByEstado = (estado: string) => {
  estadoFilter.value = estadoFilter.value === estado ? undefined : estado
}

const openConfirmCheckinDialog = (reserva: Reserva) => {
  selectedReserva.value = reserva
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

const handleConfirmCheckin = async () => {
  if (!selectedReserva.value) return

  checkinLoading.value = true
  try {
    await reservasStore.confirmarCheckin(selectedReserva.value.id)
    notification.success(
      `Check-in confirmado para ${selectedReserva.value.codigoConfirmacion}`
    )
    confirmCheckinDialog.value = false
    await loadAllReservas()
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
    notification.success(
      `Check-out confirmado para ${selectedReserva.value.codigoConfirmacion}`
    )
    confirmCheckoutDialog.value = false
    await loadAllReservas()
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
    await reservasStore.cancelarReserva(selectedReserva.value.id, cancelReason.value || undefined)
    notification.success(`Reserva ${selectedReserva.value.codigoConfirmacion} cancelada`)
    cancelDialog.value = false
    await loadAllReservas()
  } catch (error: any) {
    notification.error(error?.message || 'Error al cancelar reserva')
  } finally {
    cancelLoading.value = false
  }
}

// ── Ciclo de vida ──
onMounted(() => {
  // Los datos se cargarán desde el dashboard principal del superadmin
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: all 0.3s ease;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-glow {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
