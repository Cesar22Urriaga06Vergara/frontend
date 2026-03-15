<template>
  <div class="d-flex align-center justify-center" style="min-height: 100vh">
    <v-container class="d-flex justify-center">
      <v-col cols="12" sm="8" md="5" lg="4" xl="3">
        <!-- Logo -->
        <div class="text-center mb-8">
          <v-avatar color="primary" size="56" rounded="xl" class="mb-4">
            <v-icon icon="mdi-puzzle" size="28" />
          </v-avatar>
          <h1 class="text-h5 font-weight-bold mb-1">Bienvenido</h1>
          <p class="text-body-2 text-medium-emphasis">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <!-- Card de login -->
        <v-card class="card-glow pa-6 pa-sm-8">
          <AuthLoginForm
            @success="onLoginSuccess"
            @error="onLoginError"
          />
        </v-card>

        <!-- Links -->
        <div class="text-center mt-6">
          <p class="text-body-2 text-medium-emphasis">
            ¿No tienes cuenta?
            <NuxtLink to="/register" class="text-primary text-decoration-none font-weight-medium">
              Regístrate
            </NuxtLink>
          </p>
        </div>
      </v-col>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const authStore = useAuthStore()
const notification = useNotification()

const onLoginSuccess = async () => {
  notification.success(`¡Bienvenido, ${authStore.userName}!`)
  await navigateTo(authStore.defaultRoute, { replace: true })
}

const onLoginError = (message: string) => {
  notification.error(message)
}
</script>
