<template>
  <div class="d-flex align-center justify-center" style="min-height: 100vh">
    <v-container class="d-flex justify-center">
      <v-col cols="12" sm="8" md="5" lg="4" xl="3">
        <!-- Logo -->
        <div class="text-center mb-8">
          <v-avatar color="warning" size="56" rounded="xl" class="mb-4">
            <v-icon :icon="stepIcon" size="28" />
          </v-avatar>
          <h1 class="text-h5 font-weight-bold mb-1">{{ stepTitle }}</h1>
          <p class="text-body-2 text-medium-emphasis">
            Paso {{ currentStep }} de 3
          </p>
        </div>

        <!-- Progress -->
        <v-progress-linear
          :model-value="(currentStep / 3) * 100"
          color="primary"
          rounded
          height="4"
          class="mb-6"
        />

        <!-- Card -->
        <SectionCard>
          <!-- Step 1: Request -->
          <AuthPasswordResetRequest
            v-if="currentStep === 1"
            @success="onRequestSuccess"
            @error="onError"
          />

          <!-- Step 2: Verify -->
          <AuthPasswordResetVerify
            v-else-if="currentStep === 2"
            :email="resetEmail"
            @success="onVerifySuccess"
            @error="onError"
            @resend="onResend"
          />

          <!-- Step 3: Confirm -->
          <AuthPasswordResetConfirm
            v-else-if="currentStep === 3"
            :email="resetEmail"
            :token="resetToken"
            @success="onResetSuccess"
            @error="onError"
          />

          <!-- Success state -->
          <div v-else class="text-center py-4">
            <v-icon icon="mdi-check-circle" color="success" size="64" class="mb-4" />
            <h3 class="text-h6 font-weight-bold mb-2">¡Contraseña actualizada!</h3>
            <p class="text-body-2 text-medium-emphasis mb-6">
              Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <v-btn
              color="primary"
              size="large"
              block
              to="/login"
            >
              Ir a iniciar sesión
            </v-btn>
          </div>
        </SectionCard>

        <!-- Back to login -->
        <div class="text-center mt-6">
          <NuxtLink to="/login" class="text-body-2 text-primary text-decoration-none">
            <v-icon icon="mdi-arrow-left" size="16" class="mr-1" />
            Volver a iniciar sesión
          </NuxtLink>
        </div>
      </v-col>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotification } from '~/composables/useNotification'
import SectionCard from '~/components/shared/SectionCard.vue'

definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
})

const notification = useNotification()

const currentStep = ref(1)
const resetEmail = ref('')
const resetToken = ref('')

const stepTitle = computed(() => {
  const titles: Record<number, string> = {
    1: 'Recuperar contraseña',
    2: 'Verificar código',
    3: 'Nueva contraseña',
    4: '¡Listo!',
  }
  return titles[currentStep.value] || ''
})

const stepIcon = computed(() => {
  const icons: Record<number, string> = {
    1: 'mdi-email-outline',
    2: 'mdi-numeric',
    3: 'mdi-lock-reset',
    4: 'mdi-check-circle',
  }
  return icons[currentStep.value] || 'mdi-help'
})

const onRequestSuccess = (email: string) => {
  resetEmail.value = email
  currentStep.value = 2
  notification.success('Código enviado a tu correo')
}

const onVerifySuccess = (token: string) => {
  resetToken.value = token
  currentStep.value = 3
  notification.success('Código verificado correctamente')
}

const onResetSuccess = () => {
  currentStep.value = 4
  notification.success('¡Contraseña actualizada exitosamente!')
}

const onError = (message: string) => {
  notification.error(message)
}

const onResend = async () => {
  try {
    const config = useRuntimeConfig()
    await $fetch(`${config.public.apiBase}/auth/password-reset/request`, {
      method: 'POST',
      body: { email: resetEmail.value },
    })
    notification.success('Nuevo código enviado')
  } catch {
    notification.error('Error al reenviar el código')
  }
}
</script>
