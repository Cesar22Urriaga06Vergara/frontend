<template>
  <v-form ref="formRef" @submit.prevent="handleRegister" lazy-validation>
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.nombre"
          label="Nombre"
          placeholder="Tu nombre"
          prepend-inner-icon="mdi-account-outline"
          :rules="nameRules"
          :disabled="loading"
          autocomplete="given-name"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.apellido"
          label="Apellido"
          placeholder="Tu apellido"
          prepend-inner-icon="mdi-account-outline"
          :rules="nameRules"
          :disabled="loading"
          autocomplete="family-name"
        />
      </v-col>
    </v-row>

    <v-text-field
      v-model="form.email"
      label="Correo electrónico"
      placeholder="tu@email.com"
      prepend-inner-icon="mdi-email-outline"
      type="email"
      :rules="emailRules"
      :disabled="loading"
      autocomplete="email"
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
      autocomplete="new-password"
      class="mb-1"
      @click:append-inner="showPassword = !showPassword"
    />

    <v-text-field
      v-model="form.confirmPassword"
      label="Confirmar contraseña"
      prepend-inner-icon="mdi-lock-check-outline"
      :type="showPassword ? 'text' : 'password'"
      :rules="confirmPasswordRules"
      :disabled="loading"
      autocomplete="new-password"
      class="mb-4"
    />

    <p class="text-caption text-medium-emphasis mb-4">
      Nota: Los datos adicionales (cédula, teléfono, etc.) se pueden completar después al hacer tu primera reserva.
    </p>

    <v-btn
      type="submit"
      block
      size="large"
      color="primary"
      :loading="loading"
      :disabled="loading"
    >
      <v-icon icon="mdi-account-plus" class="mr-2" size="20" />
      Crear cuenta
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { emailRules, passwordRules, nameRules, passwordMatch } from '~/utils/validators'

const emit = defineEmits<{
  success: []
  error: [message: string]
}>()

const authStore = useAuthStore()

const formRef = ref()
const showPassword = ref(false)
const loading = ref(false)

const form = reactive({
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const confirmPasswordRules = [
  (v: string) => !!v || 'Confirmar contraseña es requerido',
  passwordMatch(() => form.password),
]

const handleRegister = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    await authStore.register({
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      password: form.password,
    })
    emit('success')
  } catch (error: any) {
    const message = error?.data?.message || error?.message || 'Error al registrarse'
    emit('error', Array.isArray(message) ? message[0] : message)
  } finally {
    loading.value = false
  }
}
</script>
