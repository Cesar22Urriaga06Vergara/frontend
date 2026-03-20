<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Panel de Recepción</h1>
        <p class="text-body-2 text-medium-emphasis">
          Operación diaria de check-in, check-out, caja e incidencias
        </p>
      </div>
      <v-btn
        prepend-icon="mdi-refresh"
        color="primary"
        variant="tonal"
        :loading="loading"
        @click="recargar"
      >
        Actualizar
      </v-btn>
    </div>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="4">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Pendientes Check-in</div>
              <div class="text-h6 font-weight-bold text-info">{{ cc.cantidadPendientesCheckin }}</div>
            </div>
            <v-avatar color="info" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-login" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Pendientes Check-out</div>
              <div class="text-h6 font-weight-bold text-warning">{{ cc.cantidadPendientesCheckout }}</div>
            </div>
            <v-avatar color="warning" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-logout" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Total Pendientes</div>
              <div class="text-h6 font-weight-bold">{{ cc.totalPendientes }}</div>
            </div>
            <v-avatar color="primary" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-clipboard-list-outline" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="card-glow pa-6">
      <div class="text-subtitle-2 font-weight-bold mb-4">Acciones Rápidas</div>
      <div class="d-flex flex-wrap ga-2">
        <v-btn
          to="/recepcionista/checkin-checkout"
          color="primary"
          prepend-icon="mdi-door-open"
          variant="tonal"
        >
          Check-in / Check-out
        </v-btn>

        <v-btn
          to="/recepcionista/caja"
          color="success"
          prepend-icon="mdi-cash-register"
          variant="tonal"
        >
          Caja / Folios
        </v-btn>

        <v-btn
          to="/recepcionista/incidencias"
          color="warning"
          prepend-icon="mdi-alert-circle"
          variant="tonal"
        >
          Incidencias
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UserRole } from '~/types/auth'
import { useCheckinCheckout } from '~/composables/useCheckinCheckout'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.RECEPCIONISTA],
})

useHead({ title: 'Panel de Recepción' })

const cc = useCheckinCheckout()
const loading = ref(false)

const recargar = async () => {
  loading.value = true
  try {
    await cc.obtenerPendientes()
    await cc.obtenerFlujoDelDia()
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await recargar()
})
</script>
