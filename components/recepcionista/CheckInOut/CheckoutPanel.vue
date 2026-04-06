<template>
  <div class="checkout-panel">
    <!-- Header con búsqueda -->
    <v-card class="mb-6">
      <v-card-text>
        <v-row align="end" class="ga-2">
          <v-col cols="12" md="8">
            <v-text-field
              v-model="cedulaBusqueda"
              label="Buscar cliente por cédula"
              placeholder="Ej: 1234567890"
              prepend-inner-icon="mdi-card-account-details-outline"
              variant="outlined"
              density="compact"
              clearable
              :loading="buscandoCedula"
              @keyup.enter="buscarPorCedula"
              @click:clear="limpiarBusquedaCedula"
            />
          </v-col>
          <v-col cols="12" md="4" class="d-flex ga-2">
            <v-btn
              color="primary"
              prepend-icon="mdi-magnify"
              :loading="buscandoCedula"
              @click="buscarPorCedula"
            >
              Buscar
            </v-btn>
            <v-btn
              v-if="busquedaActiva"
              variant="tonal"
              color="secondary"
              @click="limpiarBusquedaCedula"
            >
              Ver todas
            </v-btn>
          </v-col>
        </v-row>

        <v-alert
          v-if="busquedaActiva"
          type="info"
          variant="tonal"
          density="compact"
          class="mt-2"
        >
          Mostrando reservas asociadas a la cédula <strong>{{ cedulaBusqueda }}</strong>.
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Alerta de pagos pendientes -->
    <v-alert
      v-if="tieneCheckoutsPendientePago"
      type="warning"
      variant="tonal"
      class="mb-6"
      icon="mdi-alert-circle-outline"
    >
      <strong>⚠️ {{ checkoutsPendientePago.length }} Check-outs con folio sin pagar</strong>
      <div class="text-caption">Estos clientes no pueden retirarse hasta completar el pago.</div>
    </v-alert>

    <!-- Reservas pendientes de check-out -->
    <v-card title="Reservas Pendientes Check-out">
      <v-card-text>
        <ReservasPendientesCheckout
          :reservas="reservasFiltradasCheckout"
          :loading="cc.loadingOperacion.value"
          @confirmar-checkout="abrirModalCheckout"
        />
      </v-card-text>
    </v-card>

    <!-- Modal Check-out -->
    <CheckoutModal
      v-if="reservaParaCheckout"
      :reserva="reservaParaCheckout"
      :loading="cc.loadingOperacion.value"
      :folio-pagado="folioPagado(reservaParaCheckout)"
      @confirmar="ejecutarCheckout"
      @cerrar="reservaParaCheckout = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCheckinCheckout } from '~/composables/useCheckinCheckout'
import ReservasPendientesCheckout from './ReservasPendientesCheckout.vue'
import CheckoutModal from './CheckoutModal.vue'
import type { ReservaParaCheckin } from '~/types/checkinCheckout'

const cc = useCheckinCheckout()
const cedulaBusqueda = ref('')
const buscandoCedula = ref(false)
const busquedaActiva = ref(false)
const reservaParaCheckout = ref<ReservaParaCheckin | null>(null)

const reservasFiltradasCheckout = computed(() => {
  if (!busquedaActiva.value) {
    return cc.pendientesCheckout.value || []
  }
  return cc.pendientesCheckout.value?.filter(r =>
    r.cedulaCliente.includes(cedulaBusqueda.value)
  ) || []
})

const checkoutsPendientePago = computed(() => {
  return cc.pendientesCheckout.value?.filter(r => !folioPagado(r)) || []
})

const tieneCheckoutsPendientePago = computed(() => {
  return checkoutsPendientePago.value.length > 0
})

const buscarPorCedula = async () => {
  if (!cedulaBusqueda.value.trim()) {
    limpiarBusquedaCedula()
    return
  }
  buscandoCedula.value = true
  try {
    busquedaActiva.value = true
    // La búsqueda se filtra en frontend por ahora
  } finally {
    buscandoCedula.value = false
  }
}

const limpiarBusquedaCedula = () => {
  cedulaBusqueda.value = ''
  busquedaActiva.value = false
}

const abrirModalCheckout = (reserva: ReservaParaCheckin) => {
  reservaParaCheckout.value = reserva
}

const folioPagado = (reserva: ReservaParaCheckin | null): boolean => {
  if (!reserva) return false
  // Aquí iría la lógica para verificar si el folio está pagado
  // Por ahora retorna true (asumiendo pagado)
  return true
}

const ejecutarCheckout = async (datos: any) => {
  try {
    const reserva = reservaParaCheckout.value!
    await cc.confirmarCheckout(
      reserva.id,
      reserva.idHabitacion,
      datos.notas,
      datos.estado
    )
    reservaParaCheckout.value = null
    // Recargar lista
    await cc.obtenerPendientes()
  } catch (error) {
    console.error('Error en check-out:', error)
  }
}
</script>
