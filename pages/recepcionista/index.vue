<template>
  <div class="ds-page">
    <PageHeader
      title="Panel de Recepción"
      subtitle="Operación diaria de check-in, check-out, caja e incidencias"
    >
      <template #status>
        <StatusBadge status="success" label="Turno activo" />
      </template>
      <template #actions>
        <v-chip color="primary" variant="tonal" size="small">
          {{ cc.totalPendientes.value }} pendientes por atender
        </v-chip>
        <v-btn
          prepend-icon="mdi-refresh"
          color="primary"
          variant="tonal"
          :loading="loading"
          @click="recargar"
        >
          Actualizar
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
          helper="Reservas listas para ingreso"
          :loading="loading"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Pendientes Check-out"
          :value="cc.cantidadPendientesCheckout.value"
          icon="mdi-logout"
          color="warning"
          helper="Habitaciones listas para salida"
          :loading="loading"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Check-ins realizados"
          :value="cc.flujoDelDia.value?.checkinsRealizados ?? 0"
          icon="mdi-door-open"
          color="success"
          helper="Movimientos completados hoy"
          :loading="loading"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Check-outs realizados"
          :value="cc.flujoDelDia.value?.checkoutsRealizados ?? 0"
          icon="mdi-door-closed"
          color="primary"
          helper="Salidas cerradas hoy"
          :loading="loading"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-card class="card-glow pa-6 h-100">
          <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
            <div>
              <div class="text-subtitle-2 font-weight-bold">Acciones rápidas</div>
              <div class="text-body-2 text-medium-emphasis">
                Accesos directos para la operación diaria de recepción.
              </div>
            </div>
            <v-chip color="info" variant="tonal" size="small">
              Flujo del día
            </v-chip>
          </div>

          <v-row>
            <v-col v-for="action in quickActions" :key="action.to" cols="12" sm="6" md="4">
              <v-card
                class="card-glow pa-4 h-100 cursor-pointer"
                variant="outlined"
                @click="navigateTo(action.to)"
              >
                <v-avatar :color="action.color" size="48" variant="tonal" rounded="lg" class="mb-3">
                  <v-icon :icon="action.icon" size="24" />
                </v-avatar>
                <div class="text-subtitle-2 font-weight-bold mb-1">{{ action.title }}</div>
                <div class="text-body-2 text-medium-emphasis">{{ action.description }}</div>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="card-glow pa-6 h-100">
          <div class="text-subtitle-2 font-weight-bold mb-4">Estado operativo</div>

          <v-list class="bg-transparent" density="comfortable">
            <v-list-item prepend-icon="mdi-clipboard-check-outline" title="Pendientes totales">
              <template #append>
                <v-chip color="primary" variant="tonal" size="small">{{ cc.totalPendientes }}</v-chip>
              </template>
            </v-list-item>

            <v-list-item prepend-icon="mdi-cash-register" title="Folios pendientes de salida">
              <template #append>
                <v-chip color="warning" variant="tonal" size="small">
                  {{ cc.flujoDelDia.value?.foliosPendientes ?? 0 }}
                </v-chip>
              </template>
            </v-list-item>

            <v-list-item prepend-icon="mdi-refresh-circle" title="Última actualización">
              <template #append>
                <span class="text-caption text-medium-emphasis">Reciente</span>
              </template>
            </v-list-item>
          </v-list>

          <v-alert
            v-if="cc.totalPendientes.value === 0"
            type="success"
            variant="tonal"
            class="mt-4"
          >
            No hay pendientes críticos en este momento.
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '~/components/shared/PageHeader.vue'
import StatusBadge from '~/components/shared/StatusBadge.vue'
import StatCard from '~/components/shared/StatCard.vue'
import { UserRole } from '~/types/auth'
import { useCheckinCheckout } from '~/composables/useCheckinCheckout'

definePageMeta({
  layout: 'recepcion',
  middleware: ['auth', 'role'],
  roles: [UserRole.RECEPCIONISTA],
})

useHead({ title: 'Panel de Recepción' })

const cc = useCheckinCheckout()
const loading = ref(false)

const quickActions = [
  {
    to: '/recepcionista/checkin',
    title: 'Check-in',
    description: 'Registrar entrada de huéspedes.',
    icon: 'mdi-login',
    color: 'info',
  },
  {
    to: '/recepcionista/checkout',
    title: 'Check-out',
    description: 'Registrar salida de huéspedes y validar habitaciones.',
    icon: 'mdi-logout',
    color: 'warning',
  },
  {
    to: '/recepcionista/caja',
    title: 'Caja / Folios',
    description: 'Revisar cobros, saldos y cierres del turno.',
    icon: 'mdi-cash-register',
    color: 'success',
  },
  {
    to: '/recepcionista/incidencias',
    title: 'Incidencias',
    description: 'Escalar novedades de habitaciones o atención.',
    icon: 'mdi-alert-circle',
    color: 'error',
  },
]

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
