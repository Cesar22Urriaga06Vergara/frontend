<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">Gestión de Hoteles</h1>
    <v-card class="card-glow pa-6">
      <div class="text-center py-12">
        <v-icon icon="mdi-building-outline" size="64" color="primary" class="mb-4" />
        <h2 class="text-h6 font-weight-bold mb-2">Gestión de Hoteles</h2>
        <p class="text-body-2 text-medium-emphasis mb-6">
          Aquí podrá gestionar todos los hoteles del sistema
        </p>
        <v-btn color="primary" disabled>
          Próximamente
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { UserRole } from '~/types/auth'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.SUPERADMIN],
})

useHead({ title: 'Gestión de Hoteles' })
</script>

<style scoped>
.card-glow {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
