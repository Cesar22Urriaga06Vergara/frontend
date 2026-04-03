<template>
  <div class="d-flex align-center justify-center" style="min-height: 100vh">
    <v-container class="d-flex justify-center">
      <v-col cols="12" sm="8" md="6" lg="5" xl="4">
        <SectionCard>
          <div class="text-center py-6">
            <v-avatar color="primary" size="56" rounded="xl" class="mb-4">
              <v-icon icon="mdi-hotel" size="28" />
            </v-avatar>
            <h1 class="text-h5 font-weight-bold mb-2">Hotel Sena</h1>
            <p class="text-body-2 text-medium-emphasis mb-6">Inicializando sesión y preparando tu panel.</p>
            <v-progress-circular indeterminate color="primary" />
          </div>
        </SectionCard>
      </v-col>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import SectionCard from '~/components/shared/SectionCard.vue'

definePageMeta({
  layout: 'auth',
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
