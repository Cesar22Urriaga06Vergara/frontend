<template>
  <div>
    <PageHeader
      title="Gestión de Habitaciones"
      subtitle="Administra las habitaciones de tu hotel, estados y capacidades"
    >
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-refresh" variant="tonal" @click="recargar">
          Actualizar
        </v-btn>
      </template>
    </PageHeader>

    <SectionCard title="Listado de habitaciones" subtitle="Visualiza y administra ocupación, estado y datos operativos">
      <EmpleadosRoomsTable />
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UserRole } from '~/types/auth'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import EmpleadosRoomsTable from '~/components/empleados/EmpleadosRoomsTable.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN],
})

useHead({ title: 'Gestión de Habitaciones' })

const recargar = () => {
  // Triggering parent component to refresh
  window.location.reload()
}
</script>

