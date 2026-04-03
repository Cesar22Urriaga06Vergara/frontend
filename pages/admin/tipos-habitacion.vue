<template>
  <div>
    <PageHeader
      title="Tipos de Habitación"
      subtitle="Administra categorías de habitaciones y su configuración operativa"
    />

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Módulo"
          value="Tipos"
          icon="mdi-door"
          color="primary"
          helper="Gestión activa"
        />
      </v-col>
    </v-row>

    <SectionCard class="mb-6" title="Administración" subtitle="Gestiona tipos, capacidades y tarifas por categoría">
      <EmpleadosRoomTypesTable />
    </SectionCard>

    <StandardDataTable
      title="Resumen del módulo"
      subtitle="Estado operativo de la administración de tipos"
      :headers="resumenHeaders"
      :items="resumenItems"
      :items-per-page="5"
      empty-icon="mdi-door-closed"
      empty-title="Sin registros"
      empty-description="No hay información adicional por mostrar."
    />
  </div>
</template>

<script setup lang="ts">
import { UserRole } from '~/types/auth'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import EmpleadosRoomTypesTable from '~/components/empleados/EmpleadosRoomTypesTable.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN],
})

const resumenHeaders = [
  { title: 'Área', key: 'area' },
  { title: 'Estado', key: 'estado' },
  { title: 'Detalle', key: 'detalle' },
]

const resumenItems = [
  {
    area: 'Tipos de habitación',
    estado: 'Operativo',
    detalle: 'Gestión disponible desde la tabla principal',
  },
]
</script>

