<template>
  <v-card title="Reservas pendientes de Check-out">
    <v-card-text>
      <v-empty-state
        v-if="!reservas || reservas.length === 0"
        icon="mdi-card-account-details-outline"
        title="Ingresa la cédula del cliente"
        text="Busca por número de cédula para ver las reservas pendientes de check-out"
      ></v-empty-state>

      <v-table v-else density="compact" hover class="reservas-table">
        <thead>
          <tr>
            <th class="text-left">Habitación</th>
            <th class="text-left">Cliente</th>
            <th class="text-center">Check-out</th>
            <th class="text-center">Folio</th>
            <th class="text-right">Saldo</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="reserva in reservas"
            :key="reserva.id"
            :class="{ 'saldo-pendiente': hasSaldo(reserva) }"
            class="cursor-pointer"
          >
            <td class="font-weight-bold">#{{ reserva.numeroHabitacion }}</td>
            <td>
              <div class="font-weight-medium">{{ reserva.nombreCliente }}</div>
              <div class="text-caption text-medium-emphasis">{{ reserva.cedulaCliente }}</div>
            </td>
            <td class="text-center">{{ formatearFecha(reserva.checkoutFecha) }}</td>
            <td class="text-center">
              <v-chip
                v-if="esFolioPagado(reserva)"
                color="success"
                size="small"
                label
                prepend-icon="mdi-check-circle"
              >
                Pagado
              </v-chip>
              <v-chip
                v-else-if="!hasSaldo(reserva)"
                color="info"
                size="small"
                label
                prepend-icon="mdi-cash-check"
              >
                Sin saldo
              </v-chip>
              <v-chip
                v-else
                color="warning"
                size="small"
                label
                prepend-icon="mdi-alert-circle"
              >
                Pendiente
              </v-chip>
            </td>
            <td class="text-right">
              <div v-if="hasSaldo(reserva)" class="font-weight-bold text-warning">
                ${{ (getSaldo(reserva) || 0).toLocaleString('es-CO') }}
              </div>
              <div v-else class="text-success">Saldado</div>
            </td>
            <td class="text-center">
              <v-btn
                size="small"
                :color="hasSaldo(reserva) ? 'warning' : 'primary'"
                icon
                @click="confirmarCheckout(reserva)"
                :loading="loadingReservaId === reserva.id"
              >
                <v-icon>{{ hasSaldo(reserva) ? 'mdi-cash-sync' : 'mdi-logout' }}</v-icon>
                <v-tooltip activator="parent">
                  {{ hasSaldo(reserva) ? 'Registrar cobro y continuar checkout' : 'Check-out' }}
                </v-tooltip>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ReservaParaCheckin } from '~/types/checkinCheckout'

interface Props {
  reservas?: ReservaParaCheckin[] | null
  loading?: boolean
}

interface Emits {
  (e: 'confirmar-checkout', reserva: ReservaParaCheckin): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loadingReservaId = ref<number | null>(null)

const formatearFecha = (fecha: string) => {
  const date = new Date(fecha)
  return date.toLocaleDateString('es-CO', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const esFolioPagado = (reserva: ReservaParaCheckin): boolean => {
  return Boolean(reserva.folioPagado)
}

const hasSaldo = (reserva: ReservaParaCheckin): boolean => {
  return Number(reserva.folioSaldo || 0) > 0
}

const getSaldo = (reserva: ReservaParaCheckin): number => {
  return Number(reserva.folioSaldo || reserva.folioTotal || 0)
}

const confirmarCheckout = async (reserva: ReservaParaCheckin) => {
  loadingReservaId.value = reserva.id
  try {
    emit('confirmar-checkout', reserva)
  } finally {
    loadingReservaId.value = null
  }
}
</script>

<style scoped>
.reservas-table :deep(tbody tr.saldo-pendiente) {
  background-color: rgba(255, 152, 0, 0.05);
}

.reservas-table :deep(tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.02);
}

.reservas-table :deep(td) {
  padding: 12px !important;
  vertical-align: middle;
}

.reservas-table :deep(th) {
  background-color: rgba(0, 0, 0, 0.04);
  font-weight: 600 !important;
}
</style>
