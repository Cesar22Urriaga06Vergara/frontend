<template>
  <v-app>
    <v-main class="auth-background">
      <slot />
    </v-main>

    <!-- Snackbar global — Componente compartido -->
    <SharedGlobalSnackbar />
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()

const syncDocumentThemeClass = (isDark: boolean) => {
  if (!import.meta.client) {
    return
  }

  document.documentElement.classList.toggle('dark', isDark)
}

watch(
  () => theme.global.current.value.dark,
  (isDark) => {
    syncDocumentThemeClass(isDark)
  },
  { immediate: true },
)

onMounted(() => {
  syncDocumentThemeClass(theme.global.current.value.dark)
})
</script>
