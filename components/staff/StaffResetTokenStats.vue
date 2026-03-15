<template>
  <div>
    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col
        v-for="stat in statsCards"
        :key="stat.label"
        cols="6"
        sm="3"
      >
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">{{ stat.label }}</div>
              <div class="text-h5 font-weight-bold">
                <template v-if="loading">
                  <v-skeleton-loader type="text" width="40" />
                </template>
                <template v-else>
                  {{ stat.value }}
                </template>
              </div>
            </div>
            <v-avatar :color="stat.color" size="40" variant="tonal" rounded="lg">
              <v-icon :icon="stat.icon" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Acciones -->
    <v-card class="card-glow">
      <v-card-title class="text-subtitle-1 font-weight-bold pa-5 pb-3">
        <v-icon icon="mdi-wrench-outline" class="mr-2" size="20" />
        Herramientas de mantenimiento
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-5">
        <v-row>
          <!-- Limpiar tokens expirados -->
          <v-col cols="12" sm="6">
            <v-card variant="outlined" rounded="xl" class="pa-4">
              <div class="d-flex align-center mb-3">
                <v-avatar color="warning" size="36" variant="tonal" rounded="lg" class="mr-3">
                  <v-icon icon="mdi-broom" size="18" />
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 font-weight-bold">Limpiar expirados</div>
                  <div class="text-caption text-medium-emphasis">
                    Eliminar tokens que ya expiraron
                  </div>
                </div>
              </div>
              <v-btn
                color="warning"
                variant="tonal"
                block
                :loading="cleaningUp"
                @click="handleCleanup"
              >
                <v-icon icon="mdi-broom" class="mr-1" size="18" />
                Ejecutar limpieza
              </v-btn>
            </v-card>
          </v-col>

          <!-- Refresh stats -->
          <v-col cols="12" sm="6">
            <v-card variant="outlined" rounded="xl" class="pa-4">
              <div class="d-flex align-center mb-3">
                <v-avatar color="info" size="36" variant="tonal" rounded="lg" class="mr-3">
                  <v-icon icon="mdi-refresh" size="18" />
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 font-weight-bold">Actualizar datos</div>
                  <div class="text-caption text-medium-emphasis">
                    Recargar estadísticas en tiempo real
                  </div>
                </div>
              </div>
              <v-btn
                color="info"
                variant="tonal"
                block
                :loading="loading"
                @click="$emit('refresh')"
              >
                <v-icon icon="mdi-refresh" class="mr-1" size="18" />
                Actualizar
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Última actualización -->
      <v-divider />
      <v-card-text class="pa-4">
        <div class="text-caption text-medium-emphasis text-center">
          <v-icon icon="mdi-clock-outline" size="12" class="mr-1" />
          Última actualización:
          {{ stats?.lastCleanup ? formatDate(stats.lastCleanup) : 'No disponible' }}
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUsersStore } from '~/stores/users'
import { useNotification } from '~/composables/useNotification'
import type { PasswordResetStats } from '~/types/auth'

defineProps<{
  stats: PasswordResetStats | null
  loading: boolean
}>()

defineEmits<{
  refresh: []
}>()

const usersStore = useUsersStore()
const notification = useNotification()

const cleaningUp = ref(false)

const statsCards = computed(() => [
  {
    label: 'Total tokens',
    value: usersStore.resetStats?.total ?? 0,
    color: 'primary',
    icon: 'mdi-key-outline',
  },
  {
    label: 'Activos',
    value: usersStore.resetStats?.active ?? 0,
    color: 'success',
    icon: 'mdi-check-circle-outline',
  },
  {
    label: 'Expirados',
    value: usersStore.resetStats?.expired ?? 0,
    color: 'warning',
    icon: 'mdi-clock-alert-outline',
  },
  {
    label: 'Usados',
    value: usersStore.resetStats?.used ?? 0,
    color: 'info',
    icon: 'mdi-check-all',
  },
])

const handleCleanup = async () => {
  cleaningUp.value = true
  try {
    const deleted = await usersStore.cleanupExpiredTokens()
    notification.success(`${deleted} tokens expirados eliminados`)
  } catch (error: any) {
    notification.error(error?.message || 'Error al limpiar tokens')
  } finally {
    cleaningUp.value = false
  }
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
