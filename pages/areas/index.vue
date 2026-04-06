<template>
  <div class="d-flex align-center justify-center py-12">
    <v-progress-circular indeterminate color="primary" size="36" class="mr-3" />
    <span class="text-body-2 text-medium-emphasis">Redirigiendo a tu área...</span>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { UserRole } from '~/types/auth'

definePageMeta({
  layout: 'operacion',
  middleware: ['auth', 'role'],
  roles: [
    UserRole.CAFETERIA, 
    UserRole.LAVANDERIA, 
    UserRole.SPA, 
    UserRole.ROOM_SERVICE,
    UserRole.MINIBAR,
    UserRole.TRANSPORTE,
    UserRole.TOURS,
    UserRole.EVENTOS,
    UserRole.MANTENIMIENTO,
  ],
})

const authStore = useAuthStore()

onMounted(async () => {
  // Redirigir a la ruta default del rol del usuario
  const defaultRoute = authStore.defaultRoute
  if (defaultRoute) {
    await navigateTo(defaultRoute, { replace: true })
  } else {
    await navigateTo('/dashboard', { replace: true })
  }
})
</script>
