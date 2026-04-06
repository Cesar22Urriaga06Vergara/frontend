<template>
  <div>
    <PageHeader
      title="Check-out de Clientes"
      subtitle="Registro de salida de huéspedes"
    >
      <template #status>
        <v-chip color="warning" variant="tonal" size="small">
          {{ cc.cantidadPendientesCheckout.value }} pendientes
        </v-chip>
      </template>
      <template #actions>
        <v-btn
          prepend-icon="mdi-refresh"
          variant="tonal"
          :loading="loading"
          @click="recargar"
        >
          Recargar
        </v-btn>
        <v-btn
          prepend-icon="mdi-login"
          variant="tonal"
          color="secondary"
          to="/recepcionista/checkin"
        >
          Ir a Check-in
        </v-btn>
      </template>
    </PageHeader>

    <v-alert
      v-if="cc.errorMessage.value"
      type="warning"
      variant="tonal"
      class="mb-6"
    >
      {{ cc.errorMessage.value }}
    </v-alert>

    <!-- Stats -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="4">
        <StatCard
          label="Pendientes Check-out"
          :value="cc.cantidadPendientesCheckout.value"
          icon="mdi-logout"
          color="warning"
          helper="Habitaciones por liberar"
          :loading="loading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <StatCard
          label="Check-outs realizados hoy"
          :value="cc.flujoDelDia.value?.checkoutsRealizados ?? 0"
          icon="mdi-door-closed"
          color="success"
          helper="Salidas completadas"
          :loading="loading"
        />
      </v-col>

    </v-row>

    <!-- Alerta de pagos pendientes -->
    <v-alert
      v-if="checkoutsPendientePago && checkoutsPendientePago.length > 0"
      type="error"
      variant="tonal"
      class="mb-6"
      icon="mdi-alert-circle-outline"
      title="⚠️ Folios Sin Pagar"
    >
      <div class="text-caption">
        {{ checkoutsPendientePago.length }} huesped(es) no pueden retirarse sin completar el pago.
        Prioriza la cobranza en caja.
      </div>
    </v-alert>

    <!-- Panel principal -->
    <SectionCard
      title="Panel de Check-out"
      subtitle="Verifica estado de habitación y registra salidas"
      :padded="false"
    >
      <CheckoutPanel />
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCheckinCheckout } from '~/composables/useCheckinCheckout'
import { usePermissions } from '~/composables/usePermissions'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'
import CheckoutPanel from '~/components/recepcionista/CheckInOut/CheckoutPanel.vue'
import { UserRole } from '~/types/auth'

const { can } = usePermissions()
const cc = useCheckinCheckout()
const loading = ref(false)

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.RECEPCIONISTA],
  layout: 'recepcion'
})

if (!can('reserva:checkout')) {
  throw createError({
    statusCode: 403,
    statusMessage: 'No tienes permiso para realizar check-out'
  })
}

const recargar = async () => {
  loading.value = true
  try {
    await cc.obtenerPendientes()
    await cc.obtenerFlujoDelDia()
  } finally {
    loading.value = false
  }
}

const checkoutsPendientePago = computed(() => {
  return cc.pendientesCheckout.value?.filter(r => !r.folioPagado) || []
})



onMounted(async () => {
  await recargar()
})
</script>
