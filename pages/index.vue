<template>
  <div />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false,
})

const authStore = useAuthStore()

onMounted(() => {
  authStore.initSession()

  if (authStore.isAuthenticated) {
    navigateTo(authStore.defaultRoute, { replace: true })
  } else {
    navigateTo('/login', { replace: true })
  }
})
</script>
