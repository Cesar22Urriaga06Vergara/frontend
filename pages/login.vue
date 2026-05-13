<template>
  <div class="auth-entry-page">
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
      <section class="auth-panel">
        <aside class="auth-brand-side" aria-label="Marca ADUS">
          <div class="auth-brand-card">
            <img src="/favicon.png" alt="Logo ADUS">
            <span>ADUS Hospitality OS</span>
            <p>Gestión hotelera conectada para equipos de recepción, administración y servicios.</p>
          </div>
        </aside>

        <div class="auth-form-side">
          <div class="text-center mb-8">
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
        </div>
      </section>
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
  overflow-x: hidden;
  background:
    linear-gradient(135deg, rgba(7, 20, 38, 0.98), rgba(10, 45, 48, 0.96)),
    #071426;
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
  padding-top: 54px;
  padding-bottom: 56px;
}

.auth-panel {
  display: grid;
  grid-template-columns: minmax(280px, 0.92fr) minmax(360px, 1fr);
  align-items: stretch;
  width: min(100%, 920px);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.58);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.24);
  overflow: hidden;
}

.auth-brand-side {
  display: grid;
  min-height: 100%;
  padding: 32px;
  place-items: center;
  background:
    linear-gradient(145deg, rgba(25, 188, 172, 0.18), rgba(7, 20, 38, 0.4)),
    rgba(3, 32, 43, 0.82);
}

.auth-brand-card {
  display: grid;
  justify-items: center;
  max-width: 300px;
  text-align: center;
}

.auth-brand-card img {
  width: min(100%, 250px);
  max-height: 280px;
  aspect-ratio: 1;
  object-fit: contain;
  border-radius: 18px;
  filter: drop-shadow(0 24px 55px rgba(0, 0, 0, 0.25));
}

.auth-brand-card span {
  margin-top: 22px;
  color: #f8fafc;
  font-size: 1.15rem;
  font-weight: 800;
}

.auth-brand-card p {
  margin-top: 10px;
  color: rgba(226, 232, 240, 0.74);
  line-height: 1.65;
}

.auth-form-side {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 34px;
}

@media (max-width: 640px) {
  .auth-page-actions {
    align-items: stretch;
    flex-direction: column;
    padding-top: 18px;
  }

  .auth-container {
    padding-top: 26px;
  }

  .auth-panel {
    grid-template-columns: 1fr;
  }

  .auth-brand-side {
    min-height: 240px;
    padding: 24px;
  }

  .auth-brand-card img {
    width: 150px;
    max-height: 150px;
  }

  .auth-form-side {
    padding: 24px;
  }
}
</style>
