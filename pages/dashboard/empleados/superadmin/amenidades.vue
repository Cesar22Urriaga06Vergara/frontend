<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-6">Amenidades</h1>
    <EmpleadosAmenitiesTable />
  </div>
</template>

<script setup lang="ts">
import { UserRole } from '~/types/auth'
import EmpleadosAmenitiesTable from '~/components/empleados/EmpleadosAmenitiesTable.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.SUPERADMIN],
})
</script>


