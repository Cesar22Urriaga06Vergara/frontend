<template>
  <div class="ds-page">
    <PageHeader
      title="Amenidades"
      subtitle="Administra catálogo y disponibilidad de amenidades del hotel"
    />

    <SectionCard
      title="Gestión de amenidades"
      subtitle="Consulta, filtra y actualiza amenidades disponibles"
      :padded="false"
    >
      <EmpleadosAmenitiesTable />
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { UserRole } from '~/types/auth'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import EmpleadosAmenitiesTable from '~/components/empleados/EmpleadosAmenitiesTable.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN],
})
</script>

