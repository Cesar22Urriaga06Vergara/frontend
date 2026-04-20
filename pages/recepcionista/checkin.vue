<template>
  <div>
    <PageHeader
      title="Check-in de Clientes"
      subtitle="Registro de entrada de huéspedes"
    >
      <template #status>
        <v-chip color="info" variant="tonal" size="small">
          {{ cc.cantidadPendientesCheckin.value }} pendientes
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
          prepend-icon="mdi-logout"
          variant="tonal"
          color="secondary"
          to="/recepcionista/checkout"
        >
          Ir a Check-out
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
          label="Pendientes Check-in"
          :value="cc.cantidadPendientesCheckin.value"
          icon="mdi-login"
          color="info"
          helper="Reservas esperando entrada"
          :loading="loading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <StatCard
          label="Check-ins realizados hoy"
          :value="cc.flujoDelDia.value?.checkinsRealizados ?? 0"
          icon="mdi-door-open"
          color="success"
          helper="Entradas completadas"
          :loading="loading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <StatCard
          label="Pendientes Check-out"
          :value="cc.cantidadPendientesCheckout.value"
          icon="mdi-logout"
          color="warning"
          helper="Clientes por salir"
          :loading="loading"
        />
      </v-col>
    </v-row>

    <!-- Panel principal -->
    <SectionCard
      title="Panel de Check-in"
      subtitle="Busca clientes y registra su entrada"
      :padded="false"
    >
      <CheckinPanel />
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
import CheckinPanel from '~/components/recepcionista/CheckInOut/CheckinPanel.vue'
import { UserRole } from '~/types/auth'

const { can } = usePermissions()
const cc = useCheckinCheckout()
const loading = ref(false)

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.RECEPCIONISTA],
  layout: 'recepcion'
})

if (!can('reserva:checkin')) {
  throw createError({
    statusCode: 403,
    statusMessage: 'No tienes permiso para realizar check-in'
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



onMounted(async () => {
  await recargar()
})
</script>
