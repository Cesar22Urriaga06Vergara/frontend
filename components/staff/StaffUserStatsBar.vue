<template>
  <v-row class="mb-6">
    <v-col
      v-for="stat in stats"
      :key="stat.label"
      cols="6"
      sm="3"
      md
    >
      <v-card class="card-glow pa-4">
        <div class="d-flex align-center justify-space-between">
          <div>
            <div class="text-caption text-medium-emphasis mb-1">{{ stat.label }}</div>
            <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
          </div>
          <v-avatar :color="stat.color" size="40" variant="tonal" rounded="lg">
            <v-icon :icon="stat.icon" size="20" />
          </v-avatar>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUsersStore } from '~/stores/users'

const usersStore = useUsersStore()

const stats = computed(() => [
  {
    label: 'Total usuarios',
    value: usersStore.users.length,
    color: 'primary',
    icon: 'mdi-account-group-outline',
  },
  {
    label: 'Activos',
    value: usersStore.activeUsers.length,
    color: 'success',
    icon: 'mdi-account-check-outline',
  },
  {
    label: 'Inactivos',
    value: usersStore.inactiveUsers.length,
    color: 'error',
    icon: 'mdi-account-off-outline',
  },
  {
    label: 'Jugadores',
    value: usersStore.countByRole['player'] || 0,
    color: 'info',
    icon: 'mdi-gamepad-variant-outline',
  },
  {
    label: 'Sponsors',
    value: usersStore.countByRole['sponsor'] || 0,
    color: 'secondary',
    icon: 'mdi-handshake-outline',
  },
])
</script>
