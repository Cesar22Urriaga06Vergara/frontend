<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Panel Administrador</h1>
        <p class="text-body-2 text-medium-emphasis">
          Bienvenido, {{ authStore.userName }}
        </p>
      </div>
    </div>

    <v-row class="mb-6">
      <v-col v-for="card in adminCards" :key="card.to" cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4 h-100 cursor-pointer" @click="navigateTo(card.to)">
          <div class="d-flex flex-column align-center text-center">
            <v-avatar :color="card.color" size="60" variant="tonal" class="mb-3" rounded="lg">
              <v-icon :icon="card.icon" size="30" />
            </v-avatar>
            <h3 class="text-subtitle-2 font-weight-bold mb-1">{{ card.title }}</h3>
            <p class="text-caption text-medium-emphasis">{{ card.description }}</p>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { UserRole } from '~/types/auth'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN],
})

useHead({ title: 'Panel Admin' })

const authStore = useAuthStore()

const adminCards = [
  { to: '/admin/usuarios',         icon: 'mdi-account-group',       color: 'primary', title: 'Usuarios',         description: 'Gestionar usuarios del sistema' },
  { to: '/admin/reservas',         icon: 'mdi-calendar-check',      color: 'warning', title: 'Reservas',         description: 'Gestionar reservas del hotel' },
  { to: '/admin/habitaciones',     icon: 'mdi-door',                color: 'info',     title: 'Habitaciones',     description: 'Gestionar habitaciones' },
  { to: '/admin/tipos-habitacion', icon: 'mdi-bed-outline',         color: 'teal',     title: 'Tipos Habitación', description: 'Gestionar tipos de habitación' },
  { to: '/admin/amenidades',       icon: 'mdi-star-outline',        color: 'pink',     title: 'Amenidades',       description: 'Gestionar amenidades' },
  { to: '/admin/servicios',        icon: 'mdi-room-service',        color: 'orange',   title: 'Servicios',        description: 'Catálogo de servicios' },
  { to: '/reportes/oficina',       icon: 'mdi-chart-bar',           color: 'indigo',   title: 'Reportes',         description: 'Estadísticas y análisis' },
  { to: '/admin/reset-stats',      icon: 'mdi-lock-reset',          color: 'grey',     title: 'Reset Stats',      description: 'Estadísticas de tokens' },
]
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
.card-glow:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>

