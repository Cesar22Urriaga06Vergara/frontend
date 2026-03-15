<template>
  <v-app-bar
    flat
    density="comfortable"
    color="surface"
    border="b"
    class="px-2"
  >
    <!-- Toggle drawer -->
    <v-app-bar-nav-icon
      variant="text"
      @click="$emit('toggle-drawer')"
    />

    <!-- Breadcrumbs dinámicos -->
    <v-app-bar-title>
      <v-breadcrumbs
        :items="nav.breadcrumbs.value"
        density="compact"
        class="pa-0 text-body-2"
      >
        <template #divider>
          <v-icon icon="mdi-chevron-right" size="14" />
        </template>
        <template #item="{ item }">
          <v-breadcrumbs-item
            :to="item.to"
            :disabled="item.disabled"
            class="text-body-2"
            :class="{
              'font-weight-bold': item.disabled,
              'text-medium-emphasis': !item.disabled
            }"
          >
            {{ item.title }}
          </v-breadcrumbs-item>
        </template>
      </v-breadcrumbs>
    </v-app-bar-title>

    <template #append>
      <!-- Theme toggle -->
      <v-btn
        icon
        variant="text"
        size="small"
        class="mr-1"
        @click="toggleTheme"
      >
        <v-icon
          :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          size="20"
        />
        <v-tooltip activator="parent" location="bottom">
          {{ isDark ? 'Modo claro' : 'Modo oscuro' }}
        </v-tooltip>
      </v-btn>

      <!-- Notifications placeholder -->
      <v-btn
        icon
        variant="text"
        size="small"
        class="mr-1"
      >
        <v-badge color="error" dot>
          <v-icon icon="mdi-bell-outline" size="20" />
        </v-badge>
        <v-tooltip activator="parent" location="bottom">
          Notificaciones
        </v-tooltip>
      </v-btn>

      <!-- User menu -->
      <v-menu
        location="bottom end"
        :close-on-content-click="false"
        transition="slide-y-transition"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text"
            rounded="xl"
            class="text-none px-2 ml-1"
          >
            <v-avatar
              :color="nav.roleColor.value"
              size="34"
              class="mr-2"
            >
              <span class="text-caption font-weight-bold">
                {{ userInitials }}
              </span>
            </v-avatar>
            <div class="d-none d-sm-block text-left">
              <div class="text-body-2 font-weight-medium" style="line-height: 1.2">
                {{ authStore.userName }}
              </div>
              <div class="text-caption text-medium-emphasis" style="line-height: 1.1">
                {{ nav.roleLabel.value }}
              </div>
            </div>
            <v-icon icon="mdi-chevron-down" size="18" class="ml-1 d-none d-sm-block" />
          </v-btn>
        </template>

        <v-card min-width="260" rounded="xl" class="mt-1 user-menu-card">
          <!-- Header del menú -->
          <div class="pa-4 pb-3">
            <div class="d-flex align-center">
              <v-avatar :color="nav.roleColor.value" size="44" class="mr-3">
                <span class="text-body-1 font-weight-bold">{{ userInitials }}</span>
              </v-avatar>
              <div>
                <div class="text-subtitle-2 font-weight-bold">
                  {{ authStore.userName }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ authStore.userEmail }}
                </div>
                <v-chip
                  :color="nav.roleColor.value"
                  size="x-small"
                  variant="tonal"
                  class="mt-1"
                >
                  <v-icon :icon="nav.roleIcon.value" size="10" class="mr-1" />
                  {{ nav.roleLabel.value }}
                </v-chip>
              </div>
            </div>
          </div>

          <v-divider />

          <!-- Menu items -->
          <v-list density="compact" nav class="py-1">
            <v-list-item
              prepend-icon="mdi-account-circle-outline"
              title="Mi Perfil"
              subtitle="Ver y editar mi información"
              to="/dashboard/profile"
              rounded="lg"
            />
            <v-list-item
              prepend-icon="mdi-palette-outline"
              :title="isDark ? 'Modo claro' : 'Modo oscuro'"
              subtitle="Cambiar apariencia"
              rounded="lg"
              @click="toggleTheme"
            >
              <template #append>
                <v-switch
                  :model-value="isDark"
                  hide-details
                  density="compact"
                  color="primary"
                  readonly
                />
              </template>
            </v-list-item>
          </v-list>

          <v-divider />

          <!-- Logout -->
          <div class="pa-2">
            <v-btn
              block
              variant="tonal"
              color="error"
              prepend-icon="mdi-logout"
              rounded="lg"
              size="small"
              :loading="loggingOut"
              @click="handleLogout"
            >
              Cerrar sesión
            </v-btn>
          </div>
        </v-card>
      </v-menu>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTheme } from 'vuetify'
import { useAuthStore } from '~/stores/auth'
import { useNotification } from '~/composables/useNotification'
import { useRoleNavigation } from '~/composables/useRoleNavigation'

defineEmits<{
  'toggle-drawer': []
}>()

const authStore = useAuthStore()
const theme = useTheme()
const notification = useNotification()
const nav = useRoleNavigation()

const loggingOut = ref(false)

const isDark = computed(() => theme.global.current.value.dark)

const userInitials = computed(() => {
  const name = authStore.userName
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase()
})

const toggleTheme = () => {
  const newTheme = isDark.value ? 'light' : 'dark'
  theme.global.name.value = newTheme
  // Persistir preferencia
  if (!import.meta.server) {
    localStorage.setItem('theme_preference', newTheme)
  }
}

const handleLogout = async () => {
  loggingOut.value = true
  try {
    await authStore.logout()
    notification.success('Sesión cerrada correctamente')
    navigateTo('/login')
  } catch {
    notification.error('Error al cerrar sesión')
  } finally {
    loggingOut.value = false
  }
}
</script>

<style scoped lang="scss">
.user-menu-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
</style>
