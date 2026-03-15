<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-6">Tipos de Habitación</h1>
    <StaffRoomTypesTable />
  </div>
</template>

<script setup lang="ts">
import StaffRoomTypesTable from '~/components/staff/StaffRoomTypesTable.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  requiredRole: 'admin'
})
</script>
