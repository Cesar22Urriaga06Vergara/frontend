<template>
  <v-app>
    <!-- Navigation Drawer -->
    <NavigationDrawer
      v-model="drawer"
      :rail="rail"
      @toggle-rail="rail = !rail"
    />

    <!-- App Bar -->
    <AppBar @toggle-drawer="handleDrawerToggle" />

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-4 pa-md-6">
        <!-- Page transition -->
        <transition name="slide-up" mode="out-in">
          <div :key="$route.path">
            <slot />
          </div>
        </transition>
      </v-container>
    </v-main>

    <!-- Snackbar global — Componente compartido -->
    <GlobalSnackbar />
  </v-app>
</template>

<script setup lang="ts">
import { useDisplay, useTheme } from 'vuetify'

const { mobile } = useDisplay()
const theme = useTheme()

const drawer = ref(true)
const rail = ref(false)

// ── Responsive: cerrar drawer en mobile por defecto ──
watch(mobile, (isMobile) => {
  if (isMobile) {
    drawer.value = false
    rail.value = false
  } else {
    drawer.value = true
  }
}, { immediate: true })

// ── Toggle drawer según contexto ──
const handleDrawerToggle = () => {
  if (mobile.value) {
    drawer.value = !drawer.value
  } else {
    // En desktop, si el drawer está en rail, salir de rail
    // si no, entrar en rail
    rail.value = !rail.value
  }
}

// ── Restaurar preferencia de tema ──
onMounted(() => {
  if (!import.meta.server) {
    const saved = localStorage.getItem('theme_preference')
    if (saved && (saved === 'light' || saved === 'dark')) {
      theme.global.name.value = saved
    }
  }
})

const snackbarIcon = computed(() => {
  const icons: Record<string, string> = {
    success: 'mdi-check-circle',
    error: 'mdi-alert-circle',
    warning: 'mdi-alert',
    info: 'mdi-information',
  }
  return icons
})
</script>
