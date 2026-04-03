<template>
  <div>
    <PageHeader
      title="Check-in / Check-out"
      subtitle="Gestion operativa de entradas y salidas de huespedes"
    >
      <template #status>
        <v-chip color="primary" variant="tonal" size="small">
          {{ cc.totalPendientes.value }} pendientes
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

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Pendientes Check-in"
          :value="cc.cantidadPendientesCheckin.value"
          icon="mdi-login"
          color="info"
          helper="Reservas confirmadas sin ingreso"
          :loading="loading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Pendientes Check-out"
          :value="cc.cantidadPendientesCheckout.value"
          icon="mdi-logout"
          color="warning"
          helper="Habitaciones por liberar"
          :loading="loading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Check-ins hoy"
          :value="cc.flujoDelDia.value?.checkinsRealizados ?? 0"
          icon="mdi-door-open"
          color="success"
          helper="Movimientos cerrados hoy"
          :loading="loading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Check-outs hoy"
          :value="cc.flujoDelDia.value?.checkoutsRealizados ?? 0"
          icon="mdi-door-closed"
          color="primary"
          helper="Salidas confirmadas hoy"
          :loading="loading"
        />
      </v-col>
    </v-row>

    <SectionCard
      title="Panel de operacion"
      subtitle="Consulta pendientes, valida reglas y confirma operaciones"
      :padded="false"
    >
      <CheckinCheckoutPanel />
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
import CheckinCheckoutPanel from '~/components/recepcionista/CheckInOut/CheckinCheckoutPanel.vue'
import { UserRole } from '~/types/auth'

const { can } = usePermissions()
const cc = useCheckinCheckout()
const loading = ref(false)

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.RECEPCIONISTA],
  layout: 'recepcion'
})

const recargar = async () => {
  loading.value = true
  try {
    await cc.obtenerPendientes()
    await cc.obtenerFlujoDelDia()
  } finally {
    loading.value = false
  }
}

if (!can('reserva:checkin') && !can('reserva:checkout')) {
  throw createError({
    statusCode: 403,
    statusMessage: 'No tienes acceso a esta pagina'
  })
}

onMounted(async () => {
  await recargar()
})
</script>
