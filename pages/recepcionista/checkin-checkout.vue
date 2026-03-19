<template>
  <div class="checkin-checkout-page">
    <!-- Breadcrumb + titulo -->
    <v-breadcrumbs :items="breadcrumbs" class="mb-4"></v-breadcrumbs>

    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Check-in / Check-out</h1>
        <p class="text-body-2 text-medium-emphasis">
          Gestión de entrada y salida de huéspedes
        </p>
      </div>
      <div class="d-flex gap-2">
        <v-btn
          prepend-icon="mdi-refresh"
          variant="tonal"
          @click="recargar"
          :loading="loading"
        >
          Recargar
        </v-btn>
      </div>
    </div>

    <!-- Panel principal -->
    <CheckinCheckoutPanel />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCheckinCheckout } from '~/composables/useCheckinCheckout'
import { usePermissions } from '~/composables/usePermissions'
import CheckinCheckoutPanel from '~/components/recepcionista/CheckInOut/CheckinCheckoutPanel.vue'

const { can } = usePermissions()
const cc = useCheckinCheckout()

// Local state
const loading = ref(false)

// Guards
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

// Breadcrumbs
const breadcrumbs = computed(() => [
  {
    title: 'Dashboard',
    href: '/dashboard'
  },
  {
    title: 'Recepción',
    href: '/recepcionista'
  },
  {
    title: 'Check-in / Check-out',
    disabled: true
  }
])

const recargar = async () => {
  loading.value = true
  try {
    await cc.obtenerPendientes()
    await cc.obtenerFlujoDelDia()
  } finally {
    loading.value = false
  }
}

// Permiso check
if (!can('reserva:checkin') && !can('reserva:checkout')) {
  throw createError({
    statusCode: 403,
    statusMessage: 'No tienes acceso a esta página'
  })
}
</script>

<style scoped>
.checkin-checkout-page {
  width: 100%;
}
</style>
