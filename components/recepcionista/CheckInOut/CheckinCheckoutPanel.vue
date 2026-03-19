<template>
  <div class="checkin-checkout-panel">
    <!-- Stats bar -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Pendientes Check-in</div>
            <div class="text-h5 font-weight-bold text-info">{{ cc.cantidadPendientesCheckin }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Pendientes Check-out</div>
            <div class="text-h5 font-weight-bold text-warning">{{ cc.cantidadPendientesCheckout }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Check-ins realizados</div>
            <div class="text-h5 font-weight-bold text-success">{{ ccStore.checkinsRealizadosHoy.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Check-outs realizados</div>
            <div class="text-h5 font-weight-bold text-success">{{ ccStore.checkoutsRealizadosHoy.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabs -->
    <v-card>
      <v-tabs v-model="tabActiva" density="compact">
        <v-tab value="checkin">
          <v-badge :content="cc.cantidadPendientesCheckin.value" :hidden="cc.cantidadPendientesCheckin.value === 0" color="error">
            Check-in
          </v-badge>
        </v-tab>
        <v-tab value="checkout">
          <v-badge :content="cc.cantidadPendientesCheckout.value" :hidden="cc.cantidadPendientesCheckout.value === 0" color="warning">
            Check-out
          </v-badge>
        </v-tab>
        <v-tab value="historial">Historial del día</v-tab>
      </v-tabs>

      <v-divider></v-divider>

      <v-window v-model="tabActiva">
        <!-- Tab Check-in -->
        <v-window-item value="checkin">
          <v-card-text class="pa-6">
            <ReservasPendientesCheckin
              :reservas="cc.pendientesCheckin.value"
              :loading="cc.loadingOperacion.value"
              @confirmar-checkin="abrirModalCheckin"
            />
          </v-card-text>
        </v-window-item>

        <!-- Tab Check-out -->
        <v-window-item value="checkout">
          <v-card-text class="pa-6">
            <ReservasPendientesCheckout
              :reservas="cc.pendientesCheckout.value"
              :loading="cc.loadingOperacion.value"
              @confirmar-checkout="abrirModalCheckout"
            />
          </v-card-text>
        </v-window-item>

        <!-- Tab Historial -->
        <v-window-item value="historial">
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12" md="6">
                <v-card title="Check-ins realizados">
                  <v-list v-if="ccStore.checkinsRealizadosHoy.length > 0" density="compact">
                    <v-list-item
                      v-for="reserva in ccStore.checkinsRealizadosHoy"
                      :key="`checkin-${reserva.id}`"
                      :title="`HB${reserva.numeroHabitacion}`"
                      :subtitle="reserva.nombreCliente"
                      prepend-icon="mdi-login"
                    >
                      <template #append>
                        <v-chip color="success" size="small">{{ reserva.cantidadHuespedes }} pers.</v-chip>
                      </template>
                    </v-list-item>
                  </v-list>
                  <v-card-text v-else class="text-center text-medium-emphasis">
                    Sin check-ins realizados
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card title="Check-outs realizados">
                  <v-list v-if="ccStore.checkoutsRealizadosHoy.length > 0" density="compact">
                    <v-list-item
                      v-for="reserva in ccStore.checkoutsRealizadosHoy"
                      :key="`checkout-${reserva.id}`"
                      :title="`HB${reserva.numeroHabitacion}`"
                      :subtitle="reserva.nombreCliente"
                      prepend-icon="mdi-logout"
                    >
                      <template #append>
                        <v-icon color="success">mdi-check-circle</v-icon>
                      </template>
                    </v-list-item>
                  </v-list>
                  <v-card-text v-else class="text-center text-medium-emphasis">
                    Sin check-outs realizados
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Modal Check-in -->
    <CheckinModal
      v-if="reservaParaCheckin"
      :data-reserva="reservaParaCheckin"
      :loading="cc.loadingOperacion.value"
      @confirmar="ejecutarCheckin"
    />

    <!-- Modal Check-out -->
    <CheckoutModal
      v-if="reservaParaCheckout"
      :reserva="reservaParaCheckout"
      :loading="cc.loadingOperacion.value"
      :folio-pagado="folioPagado"
      @confirmar="ejecutarCheckout"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCheckinCheckout } from '~/composables/useCheckinCheckout'
import { useCheckinCheckoutStore } from '~/stores/checkinCheckout'
import { useNotification } from '~/composables/useNotification'
import type { ReservaParaCheckin } from '~/types/checkinCheckout'

import ReservasPendientesCheckin from './ReservasPendientesCheckin.vue'
import ReservasPendientesCheckout from './ReservasPendientesCheckout.vue'
import CheckinModal from './CheckinModal.vue'
import CheckoutModal from './CheckoutModal.vue'

const { success, error } = useNotification()
const cc = useCheckinCheckout()
const ccStore = useCheckinCheckoutStore()

// Local state
const tabActiva = ref('checkin')
const reservaParaCheckin = ref<ReservaParaCheckin | null>(null)
const reservaParaCheckout = ref<ReservaParaCheckin | null>(null)
const folioPagado = ref(true)

const abrirModalCheckin = async (reserva: ReservaParaCheckin) => {
  // Validar antes de abrir modal
  const validacion = await cc.validarCheckin(reserva.id)
  if (!validacion.esValido) {
    error(validacion.errores.join(', '))
    return
  }

  if (validacion.advertencias.length > 0) {
    console.warn('Advertencias:', validacion.advertencias)
  }

  reservaParaCheckin.value = reserva
}

const abrirModalCheckout = async (reserva: ReservaParaCheckin) => {
  // Validar antes de abrir modal
  const validacion = await cc.validarCheckout(reserva.id)
  if (!validacion.esValido) {
    error(validacion.errores.join(', '))
    return
  }

  folioPagado.value = validacion.folioPagado

  if (validacion.advertencias.length > 0) {
    console.warn('Advertencias:', validacion.advertencias)
  }

  reservaParaCheckout.value = reserva
}

const ejecutarCheckin = async (datos: any) => {
  if (!reservaParaCheckin.value) return

  try {
    const respuesta = await cc.confirmarCheckin(
      reservaParaCheckin.value.id,
      reservaParaCheckin.value.idHabitacion,
      reservaParaCheckin.value.idCliente,
      datos.notas
    )

    if (respuesta) {
      ccStore.agregarCheckInRealizado(reservaParaCheckin.value)
      reservaParaCheckin.value = null
      tabActiva.value = 'checkout' // Cambiar a tab checkout después del checkin
    }
  } catch (err) {
    // Error ya mostrado en composable
  }
}

const ejecutarCheckout = async (datos: any) => {
  if (!reservaParaCheckout.value) return

  try {
    const respuesta = await cc.confirmarCheckout(
      reservaParaCheckout.value.id,
      reservaParaCheckout.value.idHabitacion,
      datos.notas,
      datos.estado
    )

    if (respuesta) {
      ccStore.agregarCheckOutRealizado(reservaParaCheckout.value)
      reservaParaCheckout.value = null
    }
  } catch (err) {
    // Error ya mostrado
  }
}

onMounted(async () => {
  // Cargar pendientes
  await cc.obtenerPendientes()
  ccStore.setPendientesCheckin(cc.pendientesCheckin.value)
  ccStore.setPendientesCheckout(cc.pendientesCheckout.value)

  // Cargar flujo del día
  await cc.obtenerFlujoDelDia()
  if (cc.flujoDelDia.value) {
    ccStore.setFlujoDelDia(cc.flujoDelDia.value)
  }
})
</script>

<style scoped>
.checkin-checkout-panel {
  width: 100%;
}
</style>
