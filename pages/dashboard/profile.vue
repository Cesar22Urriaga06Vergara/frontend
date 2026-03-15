<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">Mi Perfil</h1>

    <v-row>
      <!-- Info del usuario -->
      <v-col cols="12" md="6">
        <v-card class="card-glow pa-6">
          <div class="d-flex align-center mb-6">
            <v-avatar color="primary" size="64" rounded="xl" class="mr-4">
              <span class="text-h5 font-weight-bold">{{ userInitials }}</span>
            </v-avatar>
            <div>
              <h2 class="text-h6 font-weight-bold">{{ authStore.userName }}</h2>
              <p class="text-body-2 text-medium-emphasis">{{ authStore.userEmail }}</p>
              <v-chip
                :color="roleColor"
                size="small"
                variant="tonal"
                class="mt-1"
              >
                <v-icon :icon="roleIcon" size="14" class="mr-1" />
                {{ roleLabel }}
              </v-chip>
            </div>
          </div>

          <v-divider class="mb-4" />

          <!-- Editar perfil -->
          <v-form ref="formRef" @submit.prevent="handleUpdate" lazy-validation>
            <v-text-field
              v-model="form.name"
              label="Nombre"
              prepend-inner-icon="mdi-account-outline"
              :disabled="loading"
              class="mb-1"
            />

            <v-text-field
              v-model="form.email"
              label="Correo electrónico"
              prepend-inner-icon="mdi-email-outline"
              :disabled="true"
              hint="El correo no puede ser modificado"
              persistent-hint
              class="mb-4"
            />

            <v-btn
              type="submit"
              color="primary"
              :loading="loading"
              :disabled="loading || !hasChanges"
            >
              <v-icon icon="mdi-content-save" class="mr-2" size="18" />
              Guardar cambios
            </v-btn>
          </v-form>
        </v-card>
      </v-col>

      <!-- Info adicional -->
      <v-col cols="12" md="6">
        <v-card class="card-glow pa-6">
          <h3 class="text-subtitle-1 font-weight-bold mb-4">Información de la cuenta</h3>

          <v-list density="compact" class="bg-transparent">
            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-clock-outline" color="primary" size="20" class="mr-3" />
              </template>
              <v-list-item-title class="text-body-2">Último acceso</v-list-item-title>
              <v-list-item-subtitle class="text-caption">
                {{ formatDate(authStore.user?.lastLogin) }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-calendar-outline" color="primary" size="20" class="mr-3" />
              </template>
              <v-list-item-title class="text-body-2">Cuenta creada</v-list-item-title>
              <v-list-item-subtitle class="text-caption">
                {{ formatDate(authStore.user?.createdAt) }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-check-circle-outline" color="success" size="20" class="mr-3" />
              </template>
              <v-list-item-title class="text-body-2">Estado</v-list-item-title>
              <v-list-item-subtitle class="text-caption">
                {{ authStore.user?.isActive ? 'Activo' : 'Inactivo' }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="authStore.user?.totalScore !== undefined">
              <template #prepend>
                <v-icon icon="mdi-star-outline" color="warning" size="20" class="mr-3" />
              </template>
              <v-list-item-title class="text-body-2">Puntuación total</v-list-item-title>
              <v-list-item-subtitle class="text-caption font-weight-bold">
                {{ authStore.user?.totalScore || 0 }} puntos
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'
import { useNotification } from '~/composables/useNotification'
import { ROLE_LABELS, ROLE_COLORS, ROLE_ICONS } from '~/utils/constants'

definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
const api = useApi()
const notification = useNotification()

const formRef = ref()
const loading = ref(false)

const form = reactive({
  name: authStore.userName,
  email: authStore.userEmail,
})

const userInitials = computed(() => {
  const name = authStore.userName
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase()
})

const roleLabel = computed(() =>
  authStore.userRole ? ROLE_LABELS[authStore.userRole] : ''
)

const roleColor = computed(() =>
  authStore.userRole ? ROLE_COLORS[authStore.userRole] : 'primary'
)

const roleIcon = computed(() =>
  authStore.userRole ? ROLE_ICONS[authStore.userRole] : 'mdi-account'
)

const hasChanges = computed(() => form.name !== authStore.userName)

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'No disponible'
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleUpdate = async () => {
  loading.value = true
  try {
    await api.put('/auth/me', { name: form.name })
    await authStore.fetchProfile()
    notification.success('Perfil actualizado correctamente')
  } catch (error: any) {
    notification.error(error?.message || 'Error al actualizar el perfil')
  } finally {
    loading.value = false
  }
}
</script>
