<template>
  <div class="ds-page">
    <PageHeader title="Panel Administrador" :subtitle="`Bienvenido, ${authStore.userName}`">
      <template #status>
        <StatusBadge status="success" label="Operación estable" />
      </template>
    </PageHeader>

    <SectionCard title="Módulos Administrativos" subtitle="Gestión operativa de hotel, configuración y control">
      <v-row class="ds-grid-kpi">
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
    </SectionCard>

    <SectionCard title="Flujo recomendado" subtitle="Orden sugerido para operación diaria">
      <div class="ds-actions">
        <v-chip color="primary" variant="tonal">1. Revisar Reservas</v-chip>
        <v-chip color="warning" variant="tonal">2. Validar Usuarios</v-chip>
        <v-chip color="success" variant="tonal">3. Ver Reportes</v-chip>
      </div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { UserRole } from '~/types/auth'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatusBadge from '~/components/shared/StatusBadge.vue'

definePageMeta({
  layout: 'admin',
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
  { to: '/admin/reportes',         icon: 'mdi-chart-bar',           color: 'indigo',   title: 'Reportes',         description: 'Estadísticas y análisis' },
  { to: '/admin/reset-stats',      icon: 'mdi-lock-reset',          color: 'grey',     title: 'Reset Stats',      description: 'Estadísticas de tokens' },
]
</script>

