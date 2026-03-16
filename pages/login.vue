<template>
  <div class="d-flex align-center justify-center" style="min-height: 100vh">
    <v-container class="d-flex justify-center">
      <v-col cols="12" sm="8" md="5" lg="4" xl="3">
        <!-- Logo -->
        <div class="text-center mb-8">
          <v-avatar color="primary" size="56" rounded="xl" class="mb-4">
            <v-icon icon="mdi-hotel" size="28" />
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

          <v-divider class="my-4">
            <span class="text-caption text-medium-emphasis px-2">o continúa con</span>
          </v-divider>

          <v-btn
            variant="outlined"
            color="default"
            block
            size="large"
            :href="`${runtimeConfig.public.apiBase}/auth/google`"
            prepend-icon="mdi-google"
          >
            Continuar con Google
          </v-btn>
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
import AuthLoginForm from '~/components/auth/LoginForm.vue'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const authStore = useAuthStore()
const notification = useNotification()
const runtimeConfig = useRuntimeConfig()

const onLoginSuccess = async () => {
  notification.success(`¡Bienvenido, ${authStore.userName}!`)
  await navigateTo(authStore.defaultRoute, { replace: true })
}

const onLoginError = (message: string) => {
  notification.error(message)
}
</script>
