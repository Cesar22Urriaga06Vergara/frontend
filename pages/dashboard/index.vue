<template>
  <div>
    <!-- Saludo -->
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold mb-1">{{ nav.greeting.value }}</h1>
      <p class="text-body-2 text-medium-emphasis">
        Aquí tienes un resumen de tu actividad
      </p>
    </div>

    <!-- Quick stats -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Rol actual</div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ nav.roleLabel.value }}
              </div>
            </div>
            <v-avatar :color="nav.roleColor.value" size="40" variant="tonal" rounded="lg">
              <v-icon :icon="nav.roleIcon.value" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Estado</div>
              <div class="text-subtitle-1 font-weight-bold">
                <v-icon icon="mdi-circle" size="8" color="success" class="mr-1" />
                Activo
              </div>
            </div>
            <v-avatar color="success" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-check-circle-outline" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Último acceso</div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ lastLoginFormatted }}
              </div>
            </div>
            <v-avatar color="info" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-clock-outline" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Puntuación</div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ authStore.user?.totalScore || 0 }}
              </div>
            </div>
            <v-avatar color="warning" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-star-outline" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick navigation -->
    <h2 class="text-subtitle-1 font-weight-bold mb-3">Accesos rápidos</h2>
    <v-row>
      <v-col
        v-for="item in quickActions"
        :key="item.to"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          :to="item.to"
          class="card-glow pa-5 quick-action-card"
          :ripple="true"
        >
          <div class="d-flex align-center">
            <v-avatar :color="item.color" size="44" variant="tonal" rounded="lg" class="mr-4">
              <v-icon :icon="item.icon" size="22" />
            </v-avatar>
            <div>
              <div class="text-subtitle-2 font-weight-bold">{{ item.title }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.description }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRoleNavigation } from '~/composables/useRoleNavigation'
import { UserRole } from '~/types/auth'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const authStore = useAuthStore()
const nav = useRoleNavigation()

const lastLoginFormatted = computed(() => {
  const d = authStore.user?.lastLogin
  if (!d) return 'N/A'
  const date = new Date(d)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Justo ahora'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} h`
  return date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })
})

interface QuickAction {
  title: string
  description: string
  icon: string
  to: string
  color: string
}

const quickActions = computed((): QuickAction[] => {
  const role = authStore.userRole

  const base: QuickAction[] = [
    {
      title: 'Mi Perfil',
      description: 'Ver y editar tu información',
      icon: 'mdi-account-circle-outline',
      to: '/dashboard/profile',
      color: 'primary',
    },
  ]

  switch (role) {
    case UserRole.ADMIN:
      return [
        {
          title: 'Gestionar Usuarios',
          description: 'Administrar cuentas del sistema',
          icon: 'mdi-account-group-outline',
          to: '/dashboard/staff/users',
          color: 'error',
        },
        {
          title: 'Reset Stats',
          description: 'Estadísticas de recuperación',
          icon: 'mdi-chart-bar',
          to: '/dashboard/staff/reset-stats',
          color: 'warning',
        },
        ...base,
      ]

    case UserRole.MODERATOR:
      return [
        {
          title: 'Usuarios por Rol',
          description: 'Filtrar y consultar usuarios',
          icon: 'mdi-filter-variant',
          to: '/dashboard/staff/users',
          color: 'warning',
        },
        ...base,
      ]

    case UserRole.PLAYER:
      return [
        {
          title: 'Mi Panel de Juego',
          description: 'Ver tu progreso y puntuación',
          icon: 'mdi-gamepad-variant-outline',
          to: '/dashboard/player',
          color: 'primary',
        },
        {
          title: 'Mis Pistas',
          description: 'Pistas que has descubierto',
          icon: 'mdi-magnify',
          to: '/dashboard/player/clues',
          color: 'secondary',
        },
        ...base,
      ]

    case UserRole.SPONSOR:
      return [
        {
          title: 'Panel de Sponsor',
          description: 'Información de patrocinio',
          icon: 'mdi-handshake-outline',
          to: '/dashboard/sponsor',
          color: 'secondary',
        },
        ...base,
      ]

    default:
      return base
  }
})
</script>

<style scoped lang="scss">
.quick-action-card {
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(108, 92, 231, 0.3) !important;
    box-shadow: 0 4px 20px rgba(108, 92, 231, 0.1) !important;
  }
}
</style>
