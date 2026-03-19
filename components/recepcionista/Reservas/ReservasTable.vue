<template>
  <v-card class="reservas-table-card" title="Reservas del hotel">
    <v-card-text>
      <!-- Filtros -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filtroEstado"
            label="Estado"
            :items="estadosDisponibles"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            clearable
            @update:model-value="(val) => emit('cambiar-filtro-estado', val)"
          ></v-select>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="filtroNumero"
            label="Habitación #"
            placeholder="101, 205..."
            variant="outlined"
            density="compact"
            @update:model-value="(val) => emit('cambiar-filtro-numero', val)"
          ></v-text-field>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="filtroCliente"
            label="Cliente"
            placeholder="Nombre..."
            variant="outlined"
            density="compact"
          ></v-text-field>
        </v-col>

        <v-col cols="12" sm="6" md="3" class="d-flex align-end gap-2">
          <v-btn
            color="primary"
            size="small"
            prepend-icon="mdi-plus"
            @click="emit('crear-nueva')"
          >
            Nueva
          </v-btn>
          <v-btn
            icon
            size="small"
            @click="emit('recargar')"
            :loading="loading"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <v-divider class="mb-4"></v-divider>

      <!-- Tabla -->
      <v-empty-state
        v-if="!reservas || reservas.length === 0"
        icon="mdi-folder-open-outline"
        title="Sin reservas"
        text="No hay reservas que coincidan con los filtros"
      ></v-empty-state>

      <v-table v-else density="compact" hover class="reservas-table">
        <thead>
          <tr>
            <th class="text-left">Habitación</th>
            <th class="text-left">Cliente</th>
            <th class="text-center">Check-in</th>
            <th class="text-center">Check-out</th>
            <th class="text-center">Huéspedes</th>
            <th class="text-center">Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reserva in reservasFiltradas" :key="reserva.id" class="hover-row">
            <td class="font-weight-bold">#{{ reserva.numeroHabitacion || 'N/A' }}</td>
            <td>
              <div class="font-weight-medium">{{ reserva.nombreCliente }}</div>
              <div class="text-caption text-medium-emphasis">{{ reserva.cedulaCliente }}</div>
            </td>
            <td class="text-center">{{ formatearFecha(reserva.checkinPrevisto) }}</td>
            <td class="text-center">{{ formatearFecha(reserva.checkoutPrevisto) }}</td>
            <td class="text-center">
              <v-icon size="small" color="info">mdi-people</v-icon>
              {{ reserva.numeroHuespedes }}
            </td>
            <td class="text-center">
              <v-chip size="small" :color="colorEstado(reserva.estadoReserva)">
                {{ labelEstado(reserva.estadoReserva) }}
              </v-chip>
            </td>
            <td class="text-center">
              <v-btn
                icon
                size="x-small"
                variant="text"
                color="primary"
                @click="emit('ver-detadera', reserva)"
              >
                <v-icon>mdi-eye-outline</v-icon>
                <v-tooltip activator="parent">Ver detalles</v-tooltip>
              </v-btn>
              <v-btn
                v-if="puedeEditar(reserva)"
                icon
                size="x-small"
                variant="text"
                color="info"
                @click="emit('editar', reserva)"
              >
                <v-icon>mdi-pencil-outline</v-icon>
                <v-tooltip activator="parent">Editar</v-tooltip>
              </v-btn>
              <v-btn
                v-if="puedeCancelar(reserva)"
                icon
                size="x-small"
                variant="text"
                color="error"
                @click="emit('cancelar', reserva)"
              >
                <v-icon>mdi-cancel</v-icon>
                <v-tooltip activator="parent">Cancelar</v-tooltip>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Reserva, EstadoReserva } from '~/types/reserva'

interface Props {
  reservas?: Reserva[] | null
  loading?: boolean
}

interface Emits {
  (e: 'cambiar-filtro-estado', estado: EstadoReserva | undefined): void
  (e: 'cambiar-filtro-numero', numero: string): void
  (e: 'crear-nueva'): void
  (e: 'recargar'): void
  (e: 'ver-detadera', reserva: Reserva): void
  (e: 'editar', reserva: Reserva): void
  (e: 'cancelar', reserva: Reserva): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const filtroEstado = ref<EstadoReserva | undefined>()
const filtroNumero = ref('')
const filtroCliente = ref('')

const estadosDisponibles = [
  { label: 'Reservada', value: 'reservada' },
  { label: 'Confirmada', value: 'confirmada' },
  { label: 'Check-in', value: 'checkedin' },
  { label: 'Completada', value: 'completada' },
  { label: 'Cancelada', value: 'cancelada' },
  { label: 'Rechazada', value: 'rechazada' }
]

const reservasFiltradas = computed(() => {
  let resultado = props.reservas || []

  if (filtroCliente.value) {
    resultado = resultado.filter((r) =>
      r.nombreCliente?.toLowerCase().includes(filtroCliente.value.toLowerCase())
    )
  }

  if (filtroNumero.value) {
    resultado = resultado.filter((r) =>
      r.numeroHabitacion?.includes(filtroNumero.value)
    )
  }

  return resultado
})

const colorEstado = (estado: EstadoReserva) => {
  switch (estado) {
    case 'reservada':
      return 'info'
    case 'confirmada':
      return 'success'
    case 'checkedin':
      return 'primary'
    case 'completada':
      return 'success'
    case 'cancelada':
      return 'error'
    case 'rechazada':
      return 'error'
    default:
      return 'default'
  }
}

const labelEstado = (estado: EstadoReserva) => {
  switch (estado) {
    case 'reservada':
      return 'Reservada'
    case 'confirmada':
      return 'Confirmada'
    case 'checkedin':
      return 'Check-in'
    case 'completada':
      return 'Completada'
    case 'cancelada':
      return 'Cancelada'
    case 'rechazada':
      return 'Rechazada'
    default:
      return estado
  }
}

const puedeEditar = (reserva: Reserva) => {
  return ['reservada', 'confirmada'].includes(reserva.estadoReserva)
}

const puedeCancelar = (reserva: Reserva) => {
  return ['reservada', 'confirmada', 'checkedin'].includes(reserva.estadoReserva)
}

const formatearFecha = (fecha?: string) => {
  if (!fecha) return '-'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-CO', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.reservas-table-card :deep(.reservas-table tbody tr.hover-row:hover) {
  background-color: rgba(0, 0, 0, 0.02);
}

.reservas-table-card :deep(.reservas-table td) {
  padding: 12px !important;
  vertical-align: middle;
}

.reservas-table-card :deep(.reservas-table th) {
  background-color: rgba(0, 0, 0, 0.04);
  font-weight: 600 !important;
}
</style>
