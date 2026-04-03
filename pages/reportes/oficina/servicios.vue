<template>
  <div class="d-flex align-center justify-center py-12">
    <v-progress-circular indeterminate color="primary" size="36" class="mr-3" />
    <span class="text-body-2 text-medium-emphasis">Redirigiendo a reportes de administración...</span>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { UserRole } from '~/types/auth'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN, UserRole.SUPERADMIN],
})

onMounted(async () => {
  await navigateTo('/admin/reportes', { replace: true })
})
</script>
