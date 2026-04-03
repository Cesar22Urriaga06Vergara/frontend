<template>
  <v-row class="mb-6">
    <v-col
      v-for="stat in stats"
      :key="stat.label"
      cols="6"
      sm="3"
      md
    >
      <StatCard
        :label="stat.label"
        :value="stat.value"
        :color="stat.color"
        :icon="stat.icon"
        :loading="usersStore.loading"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUsersStore } from '~/stores/users'
import StatCard from '~/components/shared/StatCard.vue'

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
])
</script>
