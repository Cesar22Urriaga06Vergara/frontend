<template>
  <div class="d-flex align-center justify-center py-12">
    <v-progress-circular indeterminate color="primary" size="36" class="mr-3" />
    <span class="text-body-2 text-medium-emphasis">Redirigiendo al panel de reportes...</span>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { UserRole } from '~/types/auth'

definePageMeta({
  layout: 'operacion',
  middleware: ['auth', 'role'],
  roles: [UserRole.CAFETERIA, UserRole.LAVANDERIA, UserRole.SPA, UserRole.ROOM_SERVICE],
})

onMounted(async () => {
  await navigateTo('/dashboard/empleado/reportes', { replace: true })
})
</script>
