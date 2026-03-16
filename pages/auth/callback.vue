<template>
  <div class="d-flex align-center justify-center" style="min-height: 100vh">
    <div class="text-center">
      <v-progress-circular indeterminate color="primary" size="48" class="mb-4" />
      <p class="text-body-2 text-medium-emphasis">Iniciando sesión...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: false,
  middleware: [],
})

const authStore = useAuthStore()
const notification = useNotification()
const route = useRoute()

onMounted(async () => {
  const token = route.query.token as string | undefined

  if (!token) {
    notification.error('No se recibió el token de autenticación')
    await navigateTo('/login', { replace: true })
    return
  }

  try {
    // Decodificar el payload del JWT para obtener los datos del usuario
    // sin hacer una petición extra al backend
    const payloadBase64 = token.split('.')[1]
    const payload = JSON.parse(atob(payloadBase64))

    // Construir el objeto user a partir del payload JWT
    const user = {
      id: payload.sub,
      fullName: payload.fullName || payload.email,
      email: payload.email,
      role: payload.rol,
      isActive: true,
      idCliente: payload.idCliente,
      idHotel: payload.idHotel,
    }

    // Guardar sesión en el store (igual que el login normal)
    authStore.setSession(user, token)

    notification.success(`¡Bienvenido, ${user.fullName.split(' ')[0]}!`)
    await navigateTo(authStore.defaultRoute, { replace: true })
  } catch (error) {
    console.error('Error procesando callback de Google:', error)
    notification.error('Error al procesar el inicio de sesión con Google')
    await navigateTo('/login', { replace: true })
  }
})
</script>
