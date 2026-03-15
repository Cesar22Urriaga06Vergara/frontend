<template>
  <v-form ref="formRef" @submit.prevent="handleLogin" lazy-validation>
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
      autocomplete="current-password"
      class="mb-1"
      @click:append-inner="showPassword = !showPassword"
    />

    <div class="d-flex justify-end mb-4">
      <NuxtLink
        to="/password-reset"
        class="text-caption text-primary text-decoration-none"
      >
        ¿Olvidaste tu contraseña?
      </NuxtLink>
    </div>

    <v-btn
      type="submit"
      block
      size="large"
      color="primary"
      :loading="loading"
      :disabled="loading"
    >
      <v-icon icon="mdi-login" class="mr-2" size="20" />
      Iniciar sesión
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { emailRules, passwordRules } from '~/utils/validators'

const emit = defineEmits<{
  success: []
  error: [message: string]
}>()

const authStore = useAuthStore()

const formRef = ref()
const showPassword = ref(false)
const loading = ref(false)

const form = reactive({
  email: '',
  password: '',
})

const handleLogin = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    await authStore.login({
      email: form.email,
      password: form.password,
    })
    emit('success')
  } catch (error: any) {
    const message = error?.data?.message || error?.message || 'Error al iniciar sesión'
    emit('error', Array.isArray(message) ? message[0] : message)
  } finally {
    loading.value = false
  }
}
</script>
