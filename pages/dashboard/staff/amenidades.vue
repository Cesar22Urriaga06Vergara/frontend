<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-6">Amenidades</h1>
    <StaffAmenitiesTable />
  </div>
</template>

<script setup lang="ts">
import { UserRole } from '~/types/auth'
import StaffAmenitiesTable from '~/components/staff/StaffAmenitiesTable.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN, UserRole.SUPERADMIN],
})
</script>
