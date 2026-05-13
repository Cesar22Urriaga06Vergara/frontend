<template>
  <div class="auth-entry-page">
    <img src="/favicon.jpeg" alt="" class="auth-watermark">

    <div class="auth-page-actions">
      <v-btn
        to="/"
        variant="text"
        color="primary"
        prepend-icon="mdi-arrow-left"
      >
        Volver al inicio
      </v-btn>

      <v-btn
        to="/register"
        variant="tonal"
        color="secondary"
        rounded="lg"
        prepend-icon="mdi-account-plus-outline"
      >
        Crear cuenta
      </v-btn>
    </div>

    <v-container class="auth-container">
      <v-col cols="12" sm="8" md="5" lg="4" xl="3">
        <div class="text-center mb-8">
          <div class="auth-logo-mark">
            <img src="/favicon.jpeg" alt="Logo ADUS">
          </div>
          <h1 class="text-h5 font-weight-bold mb-1">Bienvenido</h1>
          <p class="text-body-2 text-medium-emphasis">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <SectionCard class="auth-form-card">
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
        </SectionCard>

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
import SectionCard from '~/components/shared/SectionCard.vue'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const authStore = useAuthStore()
const notification = useNotification()
const runtimeConfig = useRuntimeConfig()

const onLoginSuccess = async () => {
  notification.success(`¡Bienvenido, ${authStore.userName}!`)

  try {
    await new Promise(resolve => setTimeout(resolve, 300))

    const route = authStore.defaultRoute
    console.log('Redirigiendo a:', route, 'Usuario:', authStore.user?.email, 'Rol:', authStore.userRole)

    await navigateTo(route, { replace: true })
  } catch (error) {
    console.error('Error en redirección post-login:', error)
    notification.error('Error al redirigir. Por favor intenta nuevamente.')
  }
}

const onLoginError = (message: string) => {
  notification.error(message)
}
</script>

<style scoped>
.auth-entry-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(7, 20, 38, 0.98), rgba(10, 45, 48, 0.96)),
    #071426;
}

.auth-watermark {
  position: absolute;
  right: -90px;
  bottom: -120px;
  width: 520px;
  height: 520px;
  object-fit: contain;
  border-radius: 48px;
  opacity: 0.08;
  pointer-events: none;
}

.auth-page-actions {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: min(100% - 32px, 1180px);
  margin: 0 auto;
  padding-top: 28px;
}

.auth-container {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  padding-top: 32px;
  padding-bottom: 56px;
}

.auth-logo-mark {
  display: grid;
  width: 88px;
  height: 88px;
  margin: 0 auto 22px;
  place-items: center;
  border-radius: 8px;
  background: rgba(25, 188, 172, 0.18);
  box-shadow: 0 22px 60px rgba(25, 188, 172, 0.16);
}

.auth-logo-mark img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: 8px;
}

@media (max-width: 640px) {
  .auth-page-actions {
    align-items: stretch;
    flex-direction: column;
    padding-top: 18px;
  }

  .auth-watermark {
    right: -120px;
    bottom: -90px;
    width: 360px;
    height: 360px;
  }
}
</style>
