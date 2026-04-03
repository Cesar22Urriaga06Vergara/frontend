<template>
  <div class="ds-page">
    <PageHeader
      :title="nav.greeting.value"
      subtitle="Aquí tienes un resumen de tu actividad"
    />

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Rol actual"
          :value="nav.roleLabel.value"
          :icon="nav.roleIcon.value"
          :color="nav.roleColor.value"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatCard label="Estado" value="Activo" icon="mdi-check-circle-outline" color="success" />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatCard label="Último acceso" :value="lastLoginFormatted" icon="mdi-clock-outline" color="info" />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatCard label="Puntuación" :value="authStore.user?.totalScore || 0" icon="mdi-star-outline" color="warning" />
      </v-col>
    </v-row>

    <SectionCard title="Accesos rápidos" subtitle="Navegación recomendada según tu rol" :padded="false">
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
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRoleNavigation } from '~/composables/useRoleNavigation'
import { UserRole } from '~/types/auth'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.CLIENTE, UserRole.CAFETERIA, UserRole.LAVANDERIA, UserRole.SPA, UserRole.ROOM_SERVICE, UserRole.SUPERADMIN],
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
          to: '/admin/usuarios',
          color: 'error',
        },
        {
          title: 'Reset Stats',
          description: 'Estadísticas de recuperación',
          icon: 'mdi-chart-bar',
          to: '/admin/reset-stats',
          color: 'warning',
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
