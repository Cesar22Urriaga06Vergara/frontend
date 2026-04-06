<template>
  <div class="checkin-panel">
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

    <!-- Reservas pendientes de check-in -->
    <v-card title="Reservas Pendientes Check-in">
      <v-card-text>
        <ReservasPendientesCheckin
          :reservas="reservasFiltradasCheckin"
          :loading="cc.loadingOperacion.value"
          @confirmar-checkin="abrirModalCheckin"
        />
      </v-card-text>
    </v-card>

    <!-- Modal Check-in -->
    <CheckinModal
      v-if="reservaParaCheckin"
      :reserva="reservaParaCheckin"
      :loading="cc.loadingOperacion.value"
      @confirmar="ejecutarCheckin"
      @cerrar="reservaParaCheckin = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCheckinCheckout } from '~/composables/useCheckinCheckout'
import ReservasPendientesCheckin from './ReservasPendientesCheckin.vue'
import CheckinModal from './CheckinModal.vue'
import type { ReservaParaCheckin } from '~/types/checkinCheckout'

const cc = useCheckinCheckout()
const cedulaBusqueda = ref('')
const buscandoCedula = ref(false)
const busquedaActiva = ref(false)
const reservaParaCheckin = ref<ReservaParaCheckin | null>(null)

const reservasFiltradasCheckin = computed(() => {
  if (!busquedaActiva.value) {
    return cc.pendientesCheckin.value || []
  }
  return cc.pendientesCheckin.value?.filter(r =>
    r.cedulaCliente.includes(cedulaBusqueda.value)
  ) || []
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
    // Si necesita ser en backend, agregar un método en useCheckinCheckout
  } finally {
    buscandoCedula.value = false
  }
}

const limpiarBusquedaCedula = () => {
  cedulaBusqueda.value = ''
  busquedaActiva.value = false
}

const abrirModalCheckin = (reserva: ReservaParaCheckin) => {
  reservaParaCheckin.value = reserva
}

const ejecutarCheckin = async (datos: any) => {
  try {
    const reserva = reservaParaCheckin.value!
    await cc.confirmarCheckin(
      reserva.id,
      reserva.idHabitacion,
      reserva.idCliente,
      datos.notas
    )
    reservaParaCheckin.value = null
    // Recargar lista
    await cc.obtenerPendientes()
  } catch (error) {
    console.error('Error en check-in:', error)
  }
}
</script>
