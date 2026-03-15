<template>
  <v-form ref="formRef" @submit.prevent="handleRequest" lazy-validation>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Ingresa tu correo electrónico y te enviaremos un código de verificación para restablecer tu contraseña.
    </p>

    <v-text-field
      v-model="email"
      label="Correo electrónico"
      placeholder="tu@email.com"
      prepend-inner-icon="mdi-email-outline"
      type="email"
      :rules="emailRules"
      :disabled="loading"
      autocomplete="email"
      class="mb-4"
    />

    <v-btn
      type="submit"
      block
      size="large"
      color="primary"
      :loading="loading"
      :disabled="loading"
    >
      <v-icon icon="mdi-send" class="mr-2" size="20" />
      Enviar código
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { emailRules } from '~/utils/validators'
import type { PasswordResetRequestResponse } from '~/types/auth'

const emit = defineEmits<{
  success: [email: string]
  error: [message: string]
}>()

const config = useRuntimeConfig()
const formRef = ref()
const email = ref('')
const loading = ref(false)

const handleRequest = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    await $fetch<PasswordResetRequestResponse>(
      `${config.public.apiBase}/auth/password-reset/request`,
      {
        method: 'POST',
        body: { email: email.value },
      }
    )
    emit('success', email.value)
  } catch (error: any) {
    // El backend siempre devuelve 200 por seguridad, pero por si acaso
    const message = error?.data?.message || 'Error al enviar el código'
    emit('error', Array.isArray(message) ? message[0] : message)
  } finally {
    loading.value = false
  }
}
</script>
