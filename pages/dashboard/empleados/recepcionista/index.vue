<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Bienvenido, {{ authStore.userName }}</h1>
        <p class="text-body-2 text-medium-emphasis">
          {{ currentHour }}
        </p>
      </div>
    </div>

    <!-- Stats bar -->
    <RecepcionistaReservasStatsBar />

    <!-- Quick actions -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="4">
        <v-card class="card-glow pa-5 text-center cursor-pointer" @click="navigateTo('/dashboard/empleados/recepcionista/checkin')">
          <v-icon icon="mdi-login-variant" size="32" color="info" class="mb-3" />
          <h3 class="text-h6 font-weight-bold mb-2">Registrar Entrada</h3>
          <p class="text-body-2 text-medium-emphasis">
            Registrar llegada de huéspedes
          </p>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="card-glow pa-5 text-center cursor-pointer" @click="navigateTo('/dashboard/empleados/recepcionista/checkout')">
          <v-icon icon="mdi-logout-variant" size="32" color="success" class="mb-3" />
          <h3 class="text-h6 font-weight-bold mb-2">Registrar Salida</h3>
          <p class="text-body-2 text-medium-emphasis">
            Administrar salidas de huéspedes
          </p>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="card-glow pa-5 text-center cursor-pointer" @click="goToProfile">
          <v-icon icon="mdi-account-edit-outline" size="32" color="warning" class="mb-3" />
          <h3 class="text-h6 font-weight-bold mb-2">Mi Perfil</h3>
          <p class="text-body-2 text-medium-emphasis">
            Actualizar mis datos personales
          </p>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="card-glow pa-5 text-center cursor-pointer" @click="handleLogout">
          <v-icon icon="mdi-logout-variant" size="32" color="error" class="mb-3" />
          <h3 class="text-h6 font-weight-bold mb-2">Cerrar Sesión</h3>
          <p class="text-body-2 text-medium-emphasis">
            Salir de la aplicación
          </p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Información adicional -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="card-glow pa-6">
          <h3 class="text-h6 font-weight-bold mb-4">Información del Sistema</h3>
          <v-row>
            <v-col cols="12" sm="6">
              <div class="d-flex justify-space-between mb-3 pb-3 border-bottom">
                <span class="text-body-2 text-medium-emphasis">Hotel:</span>
                <span class="font-weight-medium">{{ authStore.user?.idHotel || 'N/A' }}</span>
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="d-flex justify-space-between mb-3 pb-3 border-bottom">
                <span class="text-body-2 text-medium-emphasis">Rol:</span>
                <v-chip
                  color="warning"
                  size="small"
                  variant="tonal"
                >
                  Recepcionista
                </v-chip>
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="d-flex justify-space-between">
                <span class="text-body-2 text-medium-emphasis">Último acceso:</span>
                <span class="font-weight-medium">{{ lastLoginTime }}</span>
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="d-flex justify-space-between">
                <span class="text-body-2 text-medium-emphasis">Email:</span>
                <span class="font-weight-medium">{{ authStore.user?.email }}</span>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useHead } from '#app'
import { useAuthStore } from '~/stores/auth'
import { useReservasStore } from '~/stores/reservas'
import { useNotification } from '~/composables/useNotification'
import { UserRole } from '~/types/auth'
import RecepcionistaReservasStatsBar from '~/components/shared/RecepcionistaReservasStatsBar.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.RECEPCIONISTA],
})

useHead({ title: 'Dashboard - Recepcionista' })

const router = useRouter()
const authStore = useAuthStore()
const reservasStore = useReservasStore()
const notification = useNotification()

// ── Computed ──
const currentHour = computed((): string => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días. Que tengas un excelente día.'
  if (hour < 18) return 'Buenas tardes. Sigue adelante con tu trabajo.'
  return 'Buenas noches. Que descanses bien pronto.'
})

const lastLoginTime = computed((): string => {
  if (!authStore.user?.lastLogin) return 'Primera vez'
  const date = new Date(authStore.user.lastLogin)
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

// ── Carga inicial ──
const loadReservas = async () => {
  try {
    const hotelId = authStore.user?.idHotel
    if (hotelId) {
      await reservasStore.fetchReservasByHotel(hotelId)
    }
  } catch (error: any) {
    notification.error(error?.message || 'Error al cargar reservas')
  }
}

onMounted(() => {
  loadReservas()
})

// ── Handlers ──
const goToProfile = () => {
  router.push('/dashboard/profile')
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    notification.success('Sesión cerrada correctamente')
    router.push('/login')
  } catch (error: any) {
    notification.error(error?.message || 'Error al cerrar sesión')
  }
}
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
  }
}
</style>
