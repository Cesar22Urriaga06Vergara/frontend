<template>
  <v-app :class="[`role-shell`, `role-shell--${role}`, dense ? 'role-shell--dense' : '']">
    <SharedNavigationDrawer
      v-model="drawer"
      :rail="rail"
      @toggle-rail="rail = !rail"
    />

    <SharedAppBar @toggle-drawer="handleDrawerToggle" />

    <v-main>
      <v-container fluid :class="containerClasses">
        <transition name="slide-up" mode="out-in">
          <div :key="$route.path" class="ds-page">
            <slot />
          </div>
        </transition>
      </v-container>
    </v-main>

    <SharedGlobalSnackbar />
  </v-app>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useDisplay, useTheme } from 'vuetify'

const props = withDefaults(defineProps<{
  role: 'cliente' | 'recepcion' | 'admin' | 'superadmin' | 'operacion' | 'default'
  dense?: boolean
}>(), {
  role: 'default',
  dense: false,
})

const { mobile } = useDisplay()
const theme = useTheme()

const drawer = ref(true)
const rail = ref(false)

const syncDocumentThemeClass = (isDark: boolean) => {
  if (!import.meta.client) return
  document.documentElement.classList.toggle('dark', isDark)
}

watch(mobile, (isMobile) => {
  if (isMobile) {
    drawer.value = false
    rail.value = false
  } else {
    drawer.value = true
  }
}, { immediate: true })

watch(
  () => theme.global.current.value.dark,
  (isDark) => syncDocumentThemeClass(isDark),
  { immediate: true },
)

const handleDrawerToggle = () => {
  if (mobile.value) {
    drawer.value = !drawer.value
  } else {
    rail.value = !rail.value
  }
}

onMounted(() => {
  if (!import.meta.server) {
    const saved = localStorage.getItem('theme_preference')
    if (saved && (saved === 'light' || saved === 'dark')) {
      theme.global.name.value = saved
    }
    syncDocumentThemeClass(theme.global.current.value.dark)
  }
})

const containerClasses = computed(() => {
  const base = ['pa-4', 'pa-md-6', 'role-shell__container']
  if (props.role === 'superadmin') base.push('role-shell__container--wide')
  if (props.dense) base.push('role-shell__container--dense')
  return base
})
</script>

<style scoped>
.role-shell__container {
  max-width: 1680px;
}

.role-shell__container--wide {
  max-width: 1920px;
}

.role-shell__container--dense {
  padding-top: 16px !important;
  padding-bottom: 16px !important;
}

.role-shell--cliente :deep(.v-main) {
  background: linear-gradient(180deg, rgba(24, 119, 242, 0.04) 0%, transparent 36%);
}

.role-shell--admin :deep(.v-main),
.role-shell--superadmin :deep(.v-main) {
  background: linear-gradient(180deg, rgba(35, 81, 255, 0.03) 0%, transparent 42%);
}

.role-shell--recepcion :deep(.v-main),
.role-shell--operacion :deep(.v-main) {
  background: linear-gradient(180deg, rgba(0, 151, 120, 0.03) 0%, transparent 42%);
}
</style>
