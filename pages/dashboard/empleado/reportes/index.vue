<template>
  <div>
    <PageHeader
      title="Reportes por Área"
      subtitle="Selecciona un módulo operativo para visualizar métricas detalladas"
    />

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Áreas" :value="areas.length" icon="mdi-view-grid" color="primary" />
      </v-col>
    </v-row>

    <SectionCard class="mb-6" title="Accesos directos" subtitle="Ingresa al reporte específico de cada área">
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6">
          <div class="d-flex flex-column gap-2">
            <v-btn
              v-for="area in areas"
              :key="area.to"
              :to="area.to"
              size="large"
              variant="tonal"
              :color="area.color"
              :prepend-icon="area.icon"
              class="text-left"
            >
              <div>
                <div class="font-weight-bold">{{ area.title }}</div>
                <div class="text-caption">{{ area.subtitle }}</div>
              </div>
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </SectionCard>

    <SectionCard title="Navegación" subtitle="Acciones complementarias">
      <v-btn to="/dashboard/empleado" variant="text" prepend-icon="mdi-arrow-left">
        Volver al Dashboard
      </v-btn>
    </SectionCard>

    <StandardDataTable
      class="mt-6"
      title="Módulos disponibles"
      subtitle="Resumen de accesos a reportes por área"
      :headers="resumenHeaders"
      :items="areas"
      :items-per-page="10"
      empty-title="Sin módulos"
      empty-description="No hay módulos configurados."
    >
      <template #item.title="{ item }">
        <span class="font-weight-medium">{{ item.title }}</span>
      </template>
      <template #item.to="{ item }">
        <span class="text-caption text-medium-emphasis">{{ item.to }}</span>
      </template>
    </StandardDataTable>
  </div>
</template>

<script setup lang="ts">
import { UserRole } from '~/types/auth'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'

definePageMeta({
  layout: 'operacion',
  middleware: ['auth', 'role'],
  roles: [UserRole.CAFETERIA, UserRole.LAVANDERIA, UserRole.SPA, UserRole.ROOM_SERVICE],
})

// Esta es una página índice simple que redirige a las áreas específicas
const areas = [
  {
    title: 'Cafetería',
    subtitle: 'Ver reportes de cafetería',
    to: '/dashboard/empleado/reportes/cafeteria',
    color: 'info',
    icon: 'mdi-coffee',
  },
  {
    title: 'Spa',
    subtitle: 'Ver reportes de spa',
    to: '/dashboard/empleado/reportes/spa',
    color: 'success',
    icon: 'mdi-spa',
  },
  {
    title: 'Lavandería',
    subtitle: 'Ver reportes de lavandería',
    to: '/dashboard/empleado/reportes/lavanderia',
    color: 'warning',
    icon: 'mdi-washing-machine',
  },
  {
    title: 'Room Service',
    subtitle: 'Ver reportes de room service',
    to: '/dashboard/empleado/reportes/room_service',
    color: 'primary',
    icon: 'mdi-bell-ring',
  },
]

const resumenHeaders = [
  { title: 'Área', key: 'title' },
  { title: 'Ruta', key: 'to' },
]
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>
