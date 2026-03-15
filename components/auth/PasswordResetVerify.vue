<template>
  <v-form ref="formRef" @submit.prevent="handleVerify" lazy-validation>
    <p class="text-body-2 text-medium-emphasis mb-2">
      Ingresa el código de 6 dígitos que enviamos a:
    </p>
    <p class="text-body-2 font-weight-bold text-primary mb-6">
      {{ email }}
    </p>

    <v-text-field
      v-model="token"
      label="Código de verificación"
      placeholder="123456"
      prepend-inner-icon="mdi-numeric"
      :rules="tokenRules"
      :disabled="loading"
      maxlength="6"
      class="mb-4 font-mono"
      style="letter-spacing: 0.3em"
    />

    <v-btn
      type="submit"
      block
      size="large"
      color="primary"
      :loading="loading"
      :disabled="loading"
      class="mb-3"
    >
      <v-icon icon="mdi-check-circle" class="mr-2" size="20" />
      Verificar código
    </v-btn>

    <v-btn
      block
      variant="text"
      color="primary"
      size="small"
      :disabled="resendCooldown > 0"
      @click="$emit('resend')"
    >
      {{ resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar código' }}
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { PasswordResetVerifyResponse } from '~/types/auth'

const props = defineProps<{
  email: string
}>()

const emit = defineEmits<{
  success: [token: string]
  error: [message: string]
  resend: []
}>()

const config = useRuntimeConfig()
const formRef = ref()
const token = ref('')
const loading = ref(false)
const resendCooldown = ref(60)

const tokenRules = [
  (v: string) => !!v || 'El código es requerido',
  (v: string) => (v && v.length >= 4) || 'Código inválido',
]

// Countdown para reenvío
let cooldownInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  cooldownInterval = setInterval(() => {
    if (resendCooldown.value > 0) {
      resendCooldown.value--
    } else if (cooldownInterval) {
      clearInterval(cooldownInterval)
    }
  }, 1000)
})

onUnmounted(() => {
  if (cooldownInterval) clearInterval(cooldownInterval)
})

const handleVerify = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    const response = await $fetch<PasswordResetVerifyResponse>(
      `${config.public.apiBase}/auth/password-reset/verify`,
      {
        method: 'POST',
        body: {
          email: props.email,
          token: token.value,
        },
      }
    )

    if (response.isValid && response.canProceed) {
      emit('success', token.value)
    } else {
      emit('error', response.message || 'Código inválido')
    }
  } catch (error: any) {
    const message = error?.data?.message || 'Código inválido o expirado'
    emit('error', Array.isArray(message) ? message[0] : message)
  } finally {
    loading.value = false
  }
}
</script>
