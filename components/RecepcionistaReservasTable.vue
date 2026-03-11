<template>
  <v-card class="card-glow">
    <!-- Toolbar: búsqueda + filtros -->
    <v-card-text class="pb-0">
      <v-row align="center" class="ga-2">
        <!-- Búsqueda -->
        <v-col cols="12" sm="5" md="4">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Buscar por código o huésped..."
            clearable
            hide-details
            density="compact"
          />
        </v-col>

        <!-- Filtro de estado -->
        <v-col cols="6" sm="3" md="2">
          <v-select
            v-model="filterEstado"
            :items="estadoOptions"
            label="Estado"
            clearable
            hide-details
            density="compact"
            @update:model-value="$emit('filter-changed')"
          />
        </v-col>

        <v-spacer class="d-none d-md-block" />

        <!-- Botón refresh -->
        <v-col cols="auto">
          <v-btn
            icon
            variant="text"
            size="small"
            :loading="reservasStore.loading"
            @click="$emit('refresh')"
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
      :items="filteredReservas"
      :search="search"
      :loading="reservasStore.loading"
      :items-per-page="10"
      :sort-by="[{ key: 'createdAt', order: 'desc' }]"
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
              {{ item.cedulaCliente || 'Sin cédula' }}
            </div>
          </div>
        </div>
      </template>

      <!-- Fechas -->
      <template #item.checkinPrevisto="{ item }">
        <div class="text-caption">
          <div class="font-weight-medium">{{ formatDate(item.checkinPrevisto) }}</div>
          <div class="text-xs text-medium-emphasis">
            {{ formatTime(item.checkinPrevisto) }}
          </div>
        </div>
      </template>

      <!-- Checkout previsto -->
      <template #item.checkoutPrevisto="{ item }">
        <div class="text-caption">
          <div class="font-weight-medium">{{ formatDate(item.checkoutPrevisto) }}</div>
          <div class="text-xs text-medium-emphasis">
            {{ formatTime(item.checkoutPrevisto) }}
          </div>
        </div>
      </template>

      <!-- Tipo de Habitación -->
      <template #item.tipoHabitacion="{ item }">
        <span class="text-caption">
          {{ item.tipoHabitacion?.nombreTipo || 'N/A' }}
        </span>
      </template>

      <!-- Estado -->
      <template #item.estadoReserva="{ item }">
        <v-chip
          :color="getEstadoColor(item.estadoReserva as string)"
          size="small"
          variant="tonal"
        >
          <v-icon :icon="getEstadoIcon(item.estadoReserva as string)" size="12" class="mr-1" />
          {{ getEstadoLabel(item.estadoReserva as string) }}
        </v-chip>
      </template>

      <!-- Acciones -->
      <template #item.actions="{ item }">
        <div class="d-flex ga-1">
          <!-- Confirmar checkin -->
          <v-btn
            v-if="item.estadoReserva === 'confirmada' && !item.checkinReal"
            icon
            variant="text"
            size="x-small"
            color="success"
            @click="$emit('confirm-checkin', item)"
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
            @click="$emit('confirm-checkout', item)"
          >
            <v-icon icon="mdi-door-closed-outline" size="18" />
            <v-tooltip activator="parent" location="top">Confirmar check-out</v-tooltip>
          </v-btn>

          <!-- Cancelar -->
          <v-btn
            v-if="['confirmada', 'pendiente'].includes(item.estadoReserva as string)"
            icon
            variant="text"
            size="x-small"
            color="error"
            @click="$emit('cancel', item)"
          >
            <v-icon icon="mdi-close-circle-outline" size="18" />
            <v-tooltip activator="parent" location="top">Cancelar</v-tooltip>
          </v-btn>
        </div>
      </template>

      <!-- Empty state -->
      <template #no-data>
        <div class="text-center py-8">
          <v-icon icon="mdi-calendar-search-outline" size="48" color="medium-emphasis" class="mb-3" />
          <div class="text-body-2 text-medium-emphasis">No se encontraron reservas</div>
        </div>
      </template>

      <!-- Loading -->
      <template #loading>
        <v-skeleton-loader type="table-row@5" />
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { useReservasStore } from '~/stores/reservas'
import type { Reserva } from '~/types/api'
import { EstadoReserva } from '~/types/api'

defineProps<{
  reservas?: Reserva[]
}>()

defineEmits<{
  'confirm-checkin': [reserva: Reserva]
  'confirm-checkout': [reserva: Reserva]
  cancel: [reserva: Reserva]
  'filter-changed': []
  refresh: []
}>()

const reservasStore = useReservasStore()

// ── State ──
const search = ref('')
const filterEstado = ref<string | null>(null)

// ── Opciones de filtro ──
const estadoOptions = [
  { title: 'Confirmada', value: EstadoReserva.CONFIRMADA },
  { title: 'Completada', value: EstadoReserva.COMPLETADA },
  { title: 'Cancelada', value: EstadoReserva.CANCELADA },
  { title: 'Pendiente', value: EstadoReserva.PENDIENTE },
]

// ── Headers de la tabla ──
const headers = [
  { title: 'Código', key: 'codigoConfirmacion', sortable: true, minWidth: '180px' },
  { title: 'Check-in', key: 'checkinPrevisto', sortable: true, width: '140px' },
  { title: 'Check-out', key: 'checkoutPrevisto', sortable: true, width: '140px' },
  { title: 'Tipo', key: 'tipoHabitacion', sortable: false, width: '130px' },
  { title: 'Estado', key: 'estadoReserva', sortable: true, width: '130px' },
  { title: 'Acciones', key: 'actions', sortable: false, width: '140px', align: 'center' as const },
]

// ── Reservas filtradas ──
const filteredReservas = computed(() => {
  let result = reservasStore.reservas

  if (filterEstado.value) {
    result = result.filter((r) => r.estadoReserva === filterEstado.value)
  }

  return result
})

// ── Helpers ──
const getEstadoLabel = (estado: string): string => {
  const labels: Record<string, string> = {
    [EstadoReserva.CONFIRMADA]: 'Confirmada',
    [EstadoReserva.COMPLETADA]: 'Completada',
    [EstadoReserva.CANCELADA]: 'Cancelada',
    [EstadoReserva.PENDIENTE]: 'Pendiente',
    [EstadoReserva.RECHAZADA]: 'Rechazada',
  }
  return labels[estado] || estado
}

const getEstadoColor = (estado: string): string => {
  const colors: Record<string, string> = {
    [EstadoReserva.CONFIRMADA]: 'info',
    [EstadoReserva.COMPLETADA]: 'success',
    [EstadoReserva.CANCELADA]: 'error',
    [EstadoReserva.PENDIENTE]: 'warning',
    [EstadoReserva.RECHAZADA]: 'error',
  }
  return colors[estado] || 'default'
}

const getEstadoIcon = (estado: string): string => {
  const icons: Record<string, string> = {
    [EstadoReserva.CONFIRMADA]: 'mdi-check-outline',
    [EstadoReserva.COMPLETADA]: 'mdi-check-circle-outline',
    [EstadoReserva.CANCELADA]: 'mdi-close-circle-outline',
    [EstadoReserva.PENDIENTE]: 'mdi-clock-outline',
    [EstadoReserva.RECHAZADA]: 'mdi-alert-circle-outline',
  }
  return icons[estado] || 'mdi-calendar-outline'
}

const formatDate = (dateStr: string | Date): string => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatTime = (dateStr: string | Date): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped lang="scss">
.reservas-table {
  :deep(.v-data-table__tr:hover) {
    background: rgba(var(--v-theme-primary), 0.04) !important;
  }

  .text-xs {
    font-size: 0.65rem;
  }
}
</style>
