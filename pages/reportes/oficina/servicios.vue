<template>
  <NuxtPage />
</template>

<script setup lang="ts">
import { UserRole } from '~/types/auth'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN, UserRole.SUPERADMIN],
})

// Wrapper para las vistas de reportes de servicios
</script>
