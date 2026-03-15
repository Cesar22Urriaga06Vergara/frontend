<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-6">Habitaciones</h1>
    <EmpleadosRoomsTable />
  </div>
</template>

<script setup lang="ts">
import { UserRole } from '~/types/auth'
import EmpleadosRoomsTable from '~/components/empleados/EmpleadosRoomsTable.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN, UserRole.SUPERADMIN],
})
</script>
