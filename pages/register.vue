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
        to="/login"
        variant="tonal"
        color="secondary"
        rounded="lg"
        prepend-icon="mdi-login"
      >
        Iniciar sesión
      </v-btn>
    </div>

    <v-container class="auth-container">
      <section class="auth-panel">
        <aside class="auth-brand-side" aria-label="Marca ADUS">
          <div class="auth-brand-card">
            <img src="/favicon.png" alt="Logo ADUS">
            <span>ADUS Hospitality OS</span>
            <p>Una base ordenada para gestionar reservas, servicios, pagos y operación hotelera.</p>
          </div>
        </aside>

        <div class="auth-form-side">
          <div class="text-center mb-8">
          <h1 class="text-h5 font-weight-bold mb-1">Crear cuenta</h1>
          <p class="text-body-2 text-medium-emphasis">
            Crea tu cuenta para acceder al sistema
          </p>
        </div>

        <SectionCard>
          <AuthRegisterForm
            @success="onRegisterSuccess"
            @error="onRegisterError"
          />
        </SectionCard>

        <div class="text-center mt-6">
          <p class="text-body-2 text-medium-emphasis">
            ¿Ya tienes cuenta?
            <NuxtLink to="/login" class="text-primary text-decoration-none font-weight-medium">
              Iniciar sesión
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
import SectionCard from '~/components/shared/SectionCard.vue'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const authStore = useAuthStore()
const notification = useNotification()

const onRegisterSuccess = async () => {
  notification.success('¡Cuenta creada exitosamente!')
  await navigateTo(authStore.defaultRoute, { replace: true })
}

const onRegisterError = (message: string) => {
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
  grid-template-columns: minmax(280px, 0.92fr) minmax(380px, 1fr);
  align-items: stretch;
  width: min(100%, 980px);
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
  max-height: 310px;
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
