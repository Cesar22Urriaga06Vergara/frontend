<template>
  <div class="d-flex align-center justify-center" style="min-height: 100vh; padding: 24px 0">
    <v-container class="d-flex justify-center">
      <v-col cols="12" sm="8" md="6" lg="5" xl="4">
        <!-- Logo -->
        <div class="text-center mb-8">
          <v-avatar color="secondary" size="56" rounded="xl" class="mb-4">
            <v-icon icon="mdi-handshake" size="28" />
          </v-avatar>
          <h1 class="text-h5 font-weight-bold mb-1">Registro de Sponsor</h1>
          <p class="text-body-2 text-medium-emphasis">
            Completa la información para registrarte como patrocinador
          </p>
        </div>

        <!-- Card de registro -->
        <v-card class="card-glow pa-6 pa-sm-8">
          <v-form ref="formRef" @submit.prevent="handleRegister" lazy-validation>
            <p class="text-overline text-medium-emphasis mb-3">Datos de usuario</p>

            <v-text-field
              v-model="form.name"
              label="Nombre completo"
              prepend-inner-icon="mdi-account-outline"
              :rules="nameRules"
              :disabled="loading"
              class="mb-1"
            />

            <v-text-field
              v-model="form.correo"
              label="Correo electrónico"
              prepend-inner-icon="mdi-email-outline"
              type="email"
              :rules="emailRules"
              :disabled="loading"
              class="mb-1"
            />

            <v-text-field
              v-model="form.password"
              label="Contraseña"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              :type="showPassword ? 'text' : 'password'"
              :rules="passwordRules"
              :disabled="loading"
              class="mb-4"
              @click:append-inner="showPassword = !showPassword"
            />

            <!-- Aquí puedes agregar campos adicionales del sponsor según tu RegisterSponsorDto -->
            <!-- Ejemplo: -->
            <!--
            <v-divider class="mb-4" />
            <p class="text-overline text-medium-emphasis mb-3">Datos del sponsor</p>
            <v-text-field v-model="form.empresa" label="Empresa" />
            <v-text-field v-model="form.telefono" label="Teléfono" />
            -->

            <v-btn
              type="submit"
              block
              size="large"
              color="secondary"
              :loading="loading"
              :disabled="loading"
            >
              <v-icon icon="mdi-handshake" class="mr-2" size="20" />
              Registrar Sponsor
            </v-btn>
          </v-form>
        </v-card>

        <!-- Links -->
        <div class="text-center mt-6">
          <p class="text-body-2 text-medium-emphasis">
            ¿Ya tienes cuenta?
            <NuxtLink to="/login" class="text-primary text-decoration-none font-weight-medium">
              Iniciar sesión
            </NuxtLink>
          </p>
          <p class="text-body-2 text-medium-emphasis mt-2">
            ¿Eres jugador?
            <NuxtLink to="/register" class="text-primary text-decoration-none font-weight-medium">
              Registro de Jugador
            </NuxtLink>
          </p>
        </div>
      </v-col>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useNotification } from '~/composables/useNotification'
import { emailRules, passwordRules, nameRules } from '~/utils/validators'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const authStore = useAuthStore()
const notification = useNotification()

const formRef = ref()
const showPassword = ref(false)
const loading = ref(false)

const form = reactive({
  name: '',
  correo: '',
  password: '',
  // Agrega aquí campos adicionales según tu RegisterSponsorDto
})

const handleRegister = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    await authStore.registerSponsor({
      name: form.name,
      correo: form.correo,
      password: form.password,
    })
    notification.success('¡Sponsor registrado exitosamente!')
    await navigateTo(authStore.defaultRoute, { replace: true })
  } catch (error: any) {
    const message = error?.data?.message || error?.message || 'Error al registrar sponsor'
    notification.error(Array.isArray(message) ? message[0] : message)
  } finally {
    loading.value = false
  }
}
</script>
