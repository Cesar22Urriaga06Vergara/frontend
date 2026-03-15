<template>
  <v-form ref="formRef" @submit.prevent="handleReset" lazy-validation>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Ingresa tu nueva contraseña. Debe tener al menos 6 caracteres.
    </p>

    <v-text-field
      v-model="form.newPassword"
      label="Nueva contraseña"
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
      label="Confirmar nueva contraseña"
      prepend-inner-icon="mdi-lock-check-outline"
      :type="showPassword ? 'text' : 'password'"
      :rules="confirmRules"
      :disabled="loading"
      autocomplete="new-password"
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
      <v-icon icon="mdi-lock-reset" class="mr-2" size="20" />
      Cambiar contraseña
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { passwordRules, passwordMatch } from '~/utils/validators'
import type { PasswordResetConfirmResponse } from '~/types/auth'

const props = defineProps<{
  email: string
  token: string
}>()

const emit = defineEmits<{
  success: []
  error: [message: string]
}>()

const config = useRuntimeConfig()
const formRef = ref()
const showPassword = ref(false)
const loading = ref(false)

const form = reactive({
  newPassword: '',
  confirmPassword: '',
})

const confirmRules = [
  (v: string) => !!v || 'Confirmar contraseña es requerido',
  passwordMatch(() => form.newPassword),
]

const handleReset = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    const response = await $fetch<PasswordResetConfirmResponse>(
      `${config.public.apiBase}/auth/password-reset/confirm`,
      {
        method: 'POST',
        body: {
          email: props.email,
          token: props.token,
          newPassword: form.newPassword,
        },
      }
    )

    if (response.success) {
      emit('success')
    } else {
      emit('error', response.message || 'Error al cambiar la contraseña')
    }
  } catch (error: any) {
    const message = error?.data?.message || 'Error al cambiar la contraseña'
    emit('error', Array.isArray(message) ? message[0] : message)
  } finally {
    loading.value = false
  }
}
</script>
