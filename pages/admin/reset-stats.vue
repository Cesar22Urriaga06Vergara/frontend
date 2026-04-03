<template>
  <div>
    <PageHeader
      title="Estadísticas de Password Reset"
      subtitle="Monitoreo y mantenimiento de tokens de recuperación de contraseña"
    >
      <template #status>
        <StatusBadge :status="viewState.status.value" :label="statusLabel" />
      </template>
      <template #actions>
        <v-chip
          :color="healthOk ? 'success' : 'error'"
          variant="tonal"
          size="small"
        >
          <v-icon
            :icon="healthOk ? 'mdi-check-circle' : 'mdi-alert-circle'"
            size="14"
            class="mr-1"
          />
          {{ healthOk ? 'API Auth activa' : 'API Auth inactiva' }}
        </v-chip>
      </template>
    </PageHeader>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Estado API" :value="healthOk ? 'Activa' : 'Inactiva'" icon="mdi-api" :color="healthOk ? 'success' : 'error'" :loading="loading" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Módulo" :value="statusLabel" icon="mdi-shield-check" color="primary" :loading="loading" />
      </v-col>
    </v-row>

    <!-- Stats + herramientas -->
    <SectionCard v-if="viewState.isUnavailable.value || viewState.isError.value" :padded="false" class="mb-4">
      <EmptyState
        v-if="viewState.isUnavailable.value"
        icon="mdi-cloud-off-outline"
        title="Modulo no disponible por ahora"
        description="El backend de estadísticas de password reset aun no esta desplegado."
      />
      <EmptyState
        v-else
        icon="mdi-alert-circle-outline"
        title="No fue posible cargar estadísticas"
        :description="usersStore.error || 'Error al consultar estadísticas de reset'"
        action-label="Reintentar"
        @action="loadStats"
      />
    </SectionCard>

    <EmpleadosResetTokenStats
      v-if="!viewState.isError.value"
      :stats="usersStore.resetStats"
      :loading="loading"
      :disabled="usersStore.resetStatsUnavailable"
      @refresh="loadStats"
    />

    <StandardDataTable
      v-if="!viewState.isError.value"
      class="mt-6"
      title="Resumen"
      subtitle="Estado general del módulo de recuperación"
      :headers="resumenHeaders"
      :items="resumenItems"
      :items-per-page="5"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useUsersStore } from '~/stores/users'
import { useNotification } from '~/composables/useNotification'
import { useViewState } from '~/composables/useViewState'
import { UserRole } from '~/types/auth'
import EmpleadosResetTokenStats from '~/components/empleados/EmpleadosResetTokenStats.vue'
import PageHeader from '~/components/shared/PageHeader.vue'
import StatusBadge from '~/components/shared/StatusBadge.vue'
import EmptyState from '~/components/shared/EmptyState.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN],
})

useHead({ title: 'Reset Stats — Admin' })

const usersStore = useUsersStore()
const notification = useNotification()
const config = useRuntimeConfig()

const loading = ref(false)
const healthOk = ref(true)
const hasData = computed(() => Boolean(usersStore.resetStats))
const viewState = useViewState(loading, hasData, computed(() => usersStore.error), computed(() => usersStore.resetStatsUnavailable))
const statusLabel = computed(() => {
  if (viewState.isUnavailable.value) return 'No disponible'
  if (viewState.isError.value) return 'Con incidencias'
  if (viewState.isLoading.value) return 'Cargando'
  return 'Operativo'
})

const resumenHeaders = [
  { title: 'Métrica', key: 'metrica' },
  { title: 'Valor', key: 'valor' },
]

const resumenItems = computed(() => [
  { metrica: 'API Auth', valor: healthOk.value ? 'Activa' : 'Inactiva' },
  { metrica: 'Estado del módulo', valor: statusLabel.value },
])

const loadStats = async () => {
  loading.value = true
  try {
    await usersStore.fetchResetStats()
  } catch (error: any) {
    if (error?.statusCode !== 404) {
      notification.error(error?.message || 'Error al cargar estadísticas')
    }
  } finally {
    loading.value = false
  }
}

const checkHealth = async () => {
  try {
    const response = await $fetch<{ message: string }>(
      `${config.public.apiBase}/auth/password-reset/health`
    )
    healthOk.value = !!response?.message
  } catch {
    healthOk.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadStats(), checkHealth()])
})
</script>

