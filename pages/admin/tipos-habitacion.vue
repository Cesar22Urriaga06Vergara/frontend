<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-6">Tipos de Habitación</h1>
    <EmpleadosRoomTypesTable />
  </div>
</template>

<script setup lang="ts">
import { UserRole } from '~/types/auth'
import EmpleadosRoomTypesTable from '~/components/empleados/EmpleadosRoomTypesTable.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN],
})
</script>

