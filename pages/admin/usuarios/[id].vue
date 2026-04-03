<template>
  <div class="ds-page">
    <PageHeader
      title="Detalle de Usuario"
      subtitle="Información consolidada del usuario seleccionado"
    >
      <template #actions>
        <v-btn variant="tonal" prepend-icon="mdi-arrow-left" to="/admin/usuarios">
          Volver
        </v-btn>
      </template>
    </PageHeader>

    <SectionCard v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
      <p class="text-body-2 text-medium-emphasis mt-3">Cargando usuario...</p>
    </SectionCard>

    <SectionCard
      v-else-if="errorMessage"
      title="No se pudo cargar el usuario"
      subtitle="Revisa el identificador y vuelve a intentar"
    >
      <EmptyState
        icon="mdi-alert-circle-outline"
        title="Error al consultar usuario"
        :description="errorMessage"
      />
    </SectionCard>

    <SectionCard v-else-if="user" title="Perfil de usuario" subtitle="Estado y metadatos de la cuenta">
      <div class="d-flex align-start ga-4 mb-4">
        <v-avatar :color="roleColor" size="56" rounded="lg">
          <span class="text-subtitle-1 font-weight-bold">{{ initials }}</span>
        </v-avatar>
        <div>
          <h2 class="text-h6 font-weight-bold">{{ user.name || user.fullName }}</h2>
          <p class="text-body-2 text-medium-emphasis">{{ user.email }}</p>
          <v-chip :color="roleColor" size="small" variant="tonal" class="mt-2">
            <v-icon :icon="roleIcon" size="14" class="mr-1" />
            {{ roleLabel }}
          </v-chip>
        </div>
      </div>

      <v-divider class="my-4" />

      <v-row>
        <v-col cols="12" md="4">
          <div class="text-caption text-medium-emphasis">ID</div>
          <div class="text-body-2 font-weight-medium">{{ user.id }}</div>
        </v-col>
        <v-col cols="12" md="4">
          <div class="text-caption text-medium-emphasis">Estado</div>
          <v-chip :color="user.isActive ? 'success' : 'error'" size="small" variant="tonal" class="mt-1">
            {{ user.isActive ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </v-col>
        <v-col cols="12" md="4">
          <div class="text-caption text-medium-emphasis">Último acceso</div>
          <div class="text-body-2 font-weight-medium">{{ formatDate(user.lastLogin) }}</div>
        </v-col>
      </v-row>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useUsersStore } from '~/stores/users'
import { useNotification } from '~/composables/useNotification'
import { ROLE_COLORS, ROLE_ICONS, ROLE_LABELS } from '~/utils/constants'
import { UserRole } from '~/types/auth'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import EmptyState from '~/components/shared/EmptyState.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN],
})

useHead({ title: 'Detalle de Usuario' })

const route = useRoute()
const usersStore = useUsersStore()
const notification = useNotification()

const loading = ref(true)
const errorMessage = ref('')
const user = computed(() => usersStore.currentUser)

const roleLabel = computed(() => {
  const role = user.value?.role
  return role ? ROLE_LABELS[role] : 'Sin rol'
})

const roleColor = computed(() => {
  const role = user.value?.role
  return role ? ROLE_COLORS[role] : 'primary'
})

const roleIcon = computed(() => {
  const role = user.value?.role
  return role ? ROLE_ICONS[role] : 'mdi-account'
})

const initials = computed(() => {
  const full = (user.value?.name || user.value?.fullName || '').trim()
  if (!full) return '?'
  const parts = full.split(' ')
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return full.slice(0, 2).toUpperCase()
})

const formatDate = (value?: string) => {
  if (!value) return 'No disponible'
  return new Date(value).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(async () => {
  const id = Number(route.params.id)
  if (!Number.isFinite(id) || id <= 0) {
    errorMessage.value = 'Identificador de usuario inválido'
    loading.value = false
    return
  }

  try {
    await usersStore.fetchUserById(id)
  } catch (error: any) {
    errorMessage.value = error?.message || 'No se pudo cargar el usuario'
    notification.error(errorMessage.value)
  } finally {
    loading.value = false
  }
})
</script>
