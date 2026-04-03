<template>
  <div class="d-flex align-center justify-center" style="min-height: 100vh">
    <v-container class="d-flex justify-center">
      <v-col cols="12" sm="8" md="5" lg="4" xl="3">
        <!-- Logo -->
        <div class="text-center mb-8">
          <v-avatar color="primary" size="56" rounded="xl" class="mb-4">
            <v-icon icon="mdi-account-plus" size="28" />
          </v-avatar>
          <h1 class="text-h5 font-weight-bold mb-1">Crear cuenta</h1>
          <p class="text-body-2 text-medium-emphasis">
            Crea tu cuenta para acceder al sistema
          </p>
        </div>

        <!-- Card de registro -->
        <SectionCard>
          <AuthRegisterForm
            @success="onRegisterSuccess"
            @error="onRegisterError"
          />
        </SectionCard>

        <!-- Links -->
        <div class="text-center mt-6">
          <p class="text-body-2 text-medium-emphasis">
            ¿Ya tienes cuenta?
            <NuxtLink to="/login" class="text-primary text-decoration-none font-weight-medium">
              Iniciar sesión
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
