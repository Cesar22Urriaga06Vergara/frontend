<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Gestión de Check-out</h1>
        <p class="text-body-2 text-medium-emphasis">
          Administra el checkout de reservas confirmadas
        </p>
      </div>
      <v-btn
        @click="cargarReservasConfirmadas"
        :loading="reservasStore.loading"
        color="primary"
        prepend-icon="mdi-refresh"
      >
        Actualizar
      </v-btn>
    </div>

    <!-- Estadísticas -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="4">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Confirmadas</div>
              <div class="text-h6 font-weight-bold">
                {{ conteoConfirmadas }}
              </div>
            </div>
            <v-avatar color="warning" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-calendar-check-outline" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Check-in realizado</div>
              <div class="text-h6 font-weight-bold">
                {{ conteoCheckinRealizado }}
              </div>
            </div>
            <v-avatar color="success" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-door-open-outline" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Pendiente checkout</div>
              <div class="text-h6 font-weight-bold">
                {{ conteoPendienteCheckout }}
              </div>
            </div>
            <v-avatar color="info" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-door-closed-outline" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabla de reservas confirmadas -->
    <v-card class="card-glow mb-6">
      <v-card-text class="pb-0">
        <v-row align="center" class="ga-2">
          <!-- Búsqueda -->
          <v-col cols="12" sm="8">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Buscar por código, cliente o habitación..."
              clearable
              hide-details
              density="compact"
            />
          </v-col>

          <!-- Filtro de etapa -->
          <v-col cols="12" sm="4">
            <v-select
              v-model="filterEtapa"
              :items="etapaOptions"
              label="Etapa"
              clearable
              hide-details
              density="compact"
            />
          </v-col>

          <v-spacer />

          <!-- Botón refresh -->
          <v-col cols="auto">
            <v-btn
              icon
              variant="text"
              size="small"
              :loading="reservasStore.loading"
              @click="cargarReservasConfirmadas"
            >
              <v-icon icon="mdi-refresh" />
              <v-tooltip activator="parent" location="bottom">Actualizar</v-tooltip>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Tabla de datos -->
      <v-data-table
        :headers="headers"
        :items="reservasFiltradasCheckout"
        :search="search"
        :loading="reservasStore.loading"
        :items-per-page="15"
        :sort-by="[{ key: 'checkinReal', order: 'asc' }]"
        hover
        class="reservas-table"
      >
        <!-- Código de confirmación -->
        <template #item.codigoConfirmacion="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar
              color="primary"
              size="36"
              class="mr-3"
              variant="tonal"
            >
              <span class="text-caption font-weight-bold">
                {{ item.codigoConfirmacion.substring(0, 2) }}
              </span>
            </v-avatar>
            <div>
              <div class="text-body-2 font-weight-medium">{{ item.codigoConfirmacion }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ item.nombreCliente || 'Sin nombre' }}
              </div>
            </div>
          </div>
        </template>

        <!-- Habitación -->
        <template #item.habitacion="{ item }">
          <div class="text-caption">
            <div class="font-weight-medium">
              Hab. {{ item.habitacion?.numeroHabitacion || 'N/A' }}
            </div>
            <div class="text-xs text-medium-emphasis">
              {{ item.tipoHabitacion?.nombreTipo || 'N/A' }}
            </div>
          </div>
        </template>

        <!-- Check-in previsto -->
        <template #item.checkinPrevisto="{ item }">
          <div class="text-caption">
            <div class="font-weight-medium">{{ formatDate(item.checkinPrevisto) }}</div>
            <div class="text-xs text-medium-emphasis">Previsto</div>
          </div>
        </template>

        <!-- Check-in real -->
        <template #item.checkinReal="{ item }">
          <div v-if="item.checkinReal" class="text-caption">
            <div class="font-weight-medium">{{ formatDate(item.checkinReal) }}</div>
            <div class="text-xs text-success">✓ Realizado</div>
          </div>
          <v-chip v-else size="small" variant="tonal" color="warning">
            Pendiente
          </v-chip>
        </template>

        <!-- Check-out previsto -->
        <template #item.checkoutPrevisto="{ item }">
          <div class="text-caption">
            <div class="font-weight-medium">{{ formatDate(item.checkoutPrevisto) }}</div>
            <div class="text-xs text-medium-emphasis">Previsto</div>
          </div>
        </template>

        <!-- Check-out real -->
        <template #item.checkoutReal="{ item }">
          <div v-if="item.checkoutReal" class="text-caption">
            <div class="font-weight-medium">{{ formatDate(item.checkoutReal) }}</div>
            <div class="text-xs text-success">✓ Realizado</div>
          </div>
          <v-chip v-else size="small" variant="tonal" color="info">
            Pendiente
          </v-chip>
        </template>

        <!-- Etapa -->
        <template #item.etapa="{ item }">
          <v-chip
            :color="getEtapaColor(item)"
            size="small"
            variant="tonal"
          >
            <v-icon :icon="getEtapaIcon(item)" size="12" class="mr-1" />
            {{ getEtapaLabel(item) }}
          </v-chip>
        </template>

        <!-- Acciones -->
        <template #item.actions="{ item }">
          <div class="d-flex ga-1">
            <!-- Confirmar check-in -->
            <v-btn
              v-if="item.estadoReserva?.toLowerCase() === 'confirmada' && !item.checkinReal"
              icon
              variant="text"
              size="x-small"
              color="success"
              @click="openConfirmCheckinDialog(item)"
            >
              <v-icon icon="mdi-door-open-outline" size="18" />
              <v-tooltip activator="parent" location="top">Confirmar check-in</v-tooltip>
            </v-btn>

            <!-- Confirmar checkout -->
            <v-btn
              v-if="item.checkinReal && !item.checkoutReal"
              icon
              variant="text"
              size="x-small"
              color="info"
              @click="openConfirmCheckoutDialog(item)"
            >
              <v-icon icon="mdi-door-closed-outline" size="18" />
              <v-tooltip activator="parent" location="top">Confirmar check-out</v-tooltip>
            </v-btn>

            <!-- Ver detalles -->
            <v-btn
              icon
              variant="text"
              size="x-small"
              color="primary"
              :to="`/dashboard/recepcionista/reservas?cedula=${item.cedulaCliente}`"
            >
              <v-icon icon="mdi-eye-outline" size="18" />
              <v-tooltip activator="parent" location="top">Ver detalles</v-tooltip>
            </v-btn>
          </div>
        </template>

        <!-- Empty state -->
        <template #no-data>
          <div class="text-center py-8">
            <v-icon icon="mdi-calendar-search-outline" size="48" color="medium-emphasis" class="mb-3" />
            <div class="text-body-2 text-medium-emphasis">No hay reservas para mostrar</div>
          </div>
        </template>

        <!-- Loading -->
        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>
      </v-data-table>
    </v-card>

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
            <p class="text-caption mb-1">
              Check-in: {{ formatDate(selectedReserva.checkinReal) }}
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
  </div>
</template>

<script setup lang="ts">
import { useReservasStore } from '~/stores/reservas'
import { useNotification } from '~/composables/useNotification'
import { useAuthStore } from '~/stores/auth'
import { UserRole } from '~/types/auth'
import type { Reserva } from '~/types/api'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.RECEPCIONISTA],
})

useHead({ title: 'Gestión de Check-out' })

const reservasStore = useReservasStore()
const authStore = useAuthStore()
const notification = useNotification()

// ── State ──
const selectedReserva = ref<Reserva | null>(null)
const cedulaConfirm = ref('')
const search = ref('')
const filterEtapa = ref<string | null>(null)

// Confirm checkin dialog
const confirmCheckinDialog = ref(false)
const checkinLoading = ref(false)

// Confirm checkout dialog
const confirmCheckoutDialog = ref(false)
const checkoutLoading = ref(false)

// ── Headers de la tabla ──
const headers = [
  { title: 'Código', key: 'codigoConfirmacion', sortable: true, minWidth: '180px' },
  { title: 'Habitación', key: 'habitacion', sortable: false, width: '120px' },
  { title: 'Check-in Previsto', key: 'checkinPrevisto', sortable: true, width: '140px' },
  { title: 'Check-in Real', key: 'checkinReal', sortable: true, width: '140px' },
  { title: 'Check-out Previsto', key: 'checkoutPrevisto', sortable: true, width: '140px' },
  { title: 'Check-out Real', key: 'checkoutReal', sortable: true, width: '140px' },
  { title: 'Etapa', key: 'etapa', sortable: false, width: '130px' },
  { title: 'Acciones', key: 'actions', sortable: false, width: '120px', align: 'center' as const },
]

// ── Opciones de filtro ──
const etapaOptions = [
  { title: 'Confirmada', value: 'confirmada' },
  { title: 'Check-in Realizado', value: 'checkin-realizado' },
  { title: 'Completada', value: 'completada' },
]

// ── Carga inicial ──
onMounted(() => {
  cargarReservasConfirmadas()
})

// ── Computed ──
const reservasConfirmadas = computed(() => {
  return reservasStore.reservas.filter(
    r => r.estadoReserva?.toLowerCase() === 'confirmada'
  )
})

const reservasFiltradasCheckout = computed(() => {
  let result = reservasConfirmadas.value

  if (filterEtapa.value) {
    result = result.filter(r => {
      const etapa = getEtapaValue(r)
      return etapa === filterEtapa.value
    })
  }

  return result
})

const conteoConfirmadas = computed(() => {
  return reservasStore.reservas.filter(
    r => r.estadoReserva?.toLowerCase() === 'confirmada'
  ).length
})

const conteoCheckinRealizado = computed(() => {
  return reservasConfirmadas.value.filter(r => r.checkinReal && !r.checkoutReal).length
})

const conteoPendienteCheckout = computed(() => {
  return reservasConfirmadas.value.filter(r => r.checkinReal && !r.checkoutReal).length
})

// ── Métodos ──
const cargarReservasConfirmadas = async () => {
  try {
    const hotelId = authStore.user?.idHotel
    if (hotelId) {
      await reservasStore.fetchReservasByHotel(hotelId)
      notification.success('Reservas actualizadas')
    }
  } catch (error: any) {
    notification.error(error?.message || 'Error al cargar reservas')
  }
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

const handleConfirmCheckin = async () => {
  if (!selectedReserva.value) return

  checkinLoading.value = true
  try {
    await reservasStore.confirmarCheckin(selectedReserva.value.id)
    notification.success('Check-in confirmado exitosamente')
    confirmCheckinDialog.value = false
    cedulaConfirm.value = ''
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
    notification.success('Check-out confirmado exitosamente')
    confirmCheckoutDialog.value = false
  } catch (error: any) {
    notification.error(error?.message || 'Error al confirmar check-out')
  } finally {
    checkoutLoading.value = false
  }
}

// ── Helpers ──
const formatDate = (date: Date | string | undefined): string => {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })
}

const getEtapaValue = (reserva: Reserva): string => {
  if (reserva.checkoutReal) return 'completada'
  if (reserva.checkinReal) return 'checkin-realizado'
  return 'confirmada'
}

const getEtapaLabel = (reserva: Reserva): string => {
  const etapa = getEtapaValue(reserva)
  const labels: Record<string, string> = {
    confirmada: 'Confirmada',
    'checkin-realizado': 'Check-in Realizado',
    completada: 'Completada',
  }
  return labels[etapa] || 'N/A'
}

const getEtapaIcon = (reserva: Reserva): string => {
  const etapa = getEtapaValue(reserva)
  const icons: Record<string, string> = {
    confirmada: 'mdi-calendar-check-outline',
    'checkin-realizado': 'mdi-door-open-outline',
    completada: 'mdi-check-circle-outline',
  }
  return icons[etapa] || 'mdi-circle-outline'
}

const getEtapaColor = (reserva: Reserva): string => {
  const etapa = getEtapaValue(reserva)
  const colors: Record<string, string> = {
    confirmada: 'warning',
    'checkin-realizado': 'success',
    completada: 'info',
  }
  return colors[etapa] || 'default'
}
</script>

<style scoped>
.reservas-table {
  --v-border-color: transparent;
}
</style>
