<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Estadísticas de Password Reset</h1>
        <p class="text-body-2 text-medium-emphasis">
          Monitoreo y mantenimiento de tokens de recuperación de contraseña
        </p>
      </div>

      <!-- Health check badge -->
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
        {{ healthOk ? 'Servicio activo' : 'Servicio inactivo' }}
      </v-chip>
    </div>

    <!-- Stats + herramientas -->
    <EmpleadosResetTokenStats
      :stats="usersStore.resetStats"
      :loading="loading"
      @refresh="loadStats"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUsersStore } from '~/stores/users'
import { useNotification } from '~/composables/useNotification'
import { UserRole } from '~/types/auth'
import EmpleadosResetTokenStats from '~/components/empleados/EmpleadosResetTokenStats.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.SUPERADMIN],
})

useHead({ title: 'Reset Stats — Admin' })

const usersStore = useUsersStore()
const notification = useNotification()
const config = useRuntimeConfig()

const loading = ref(false)
const healthOk = ref(true)

const loadStats = async () => {
  loading.value = true
  try {
    await usersStore.fetchResetStats()
  } catch (error: any) {
    notification.error(error?.message || 'Error al cargar estadísticas')
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


