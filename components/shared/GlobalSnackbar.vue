<template>
  <v-snackbar
    v-model="notification.state.show"
    :color="notification.state.color"
    :timeout="notification.state.timeout"
    location="top right"
    rounded="lg"
  >
    <div class="d-flex align-center">
      <v-icon
        :icon="snackbarIcon"
        class="mr-2"
        size="20"
      />
      {{ notification.state.message }}
    </div>
    <template #actions>
      <v-btn
        variant="text"
        size="small"
        icon="mdi-close"
        @click="notification.state.show = false"
      />
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNotification } from '~/composables/useNotification'

const notification = useNotification()

const snackbarIcon = computed(() => {
  const icons: Record<string, string> = {
    success: 'mdi-check-circle',
    error: 'mdi-alert-circle',
    warning: 'mdi-alert',
    info: 'mdi-information',
  }
  return icons[notification.state.color] || 'mdi-information'
})
</script>
