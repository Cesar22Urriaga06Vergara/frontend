// plugins/auth-init.client.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()

  // Inicializar la sesión desde localStorage en el client
  if (process.client) {
    authStore.initSession()
  }
})
