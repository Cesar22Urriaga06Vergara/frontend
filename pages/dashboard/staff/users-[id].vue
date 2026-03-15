<template>
  <div>
    <!-- Back button -->
    <v-btn
      variant="text"
      color="primary"
      size="small"
      class="mb-4"
      prepend-icon="mdi-arrow-left"
      to="/dashboard/staff/users"
    >
      Volver a usuarios
    </v-btn>

    <!-- Loading -->
    <template v-if="loading">
      <v-row>
        <v-col cols="12" md="6">
          <v-skeleton-loader type="card" />
        </v-col>
        <v-col cols="12" md="6">
          <v-skeleton-loader type="card" />
        </v-col>
      </v-row>
    </template>

    <!-- User detail -->
    <template v-else-if="user">
      <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
        <div class="d-flex align-center">
          <v-avatar :color="getRoleColor(user.role)" size="48" class="mr-4">
            <span class="text-h6 font-weight-bold">{{ getInitials(user.name || '') }}</span>
          </v-avatar>
          <div>
            <h1 class="text-h5 font-weight-bold">{{ user.name }}</h1>
            <p class="text-body-2 text-medium-emphasis">{{ user.email }}</p>
          </div>
        </div>

        <div class="d-flex ga-2">
          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="mdi-pencil-outline"
            @click="editDialog = true"
          >
            Editar
          </v-btn>

          <v-btn
            variant="tonal"
            :color="user.isActive ? 'warning' : 'success'"
            :prepend-icon="user.isActive ? 'mdi-account-off-outline' : 'mdi-account-check-outline'"
            @click="toggleStatusDialog = true"
          >
            {{ user.isActive ? 'Desactivar' : 'Reactivar' }}
          </v-btn>
        </div>
      </div>

      <v-row>
        <!-- Info principal -->
        <v-col cols="12" md="6">
          <v-card class="card-glow pa-5">
            <h3 class="text-subtitle-1 font-weight-bold mb-4">Información del usuario</h3>

            <v-list density="compact" class="bg-transparent">
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-shield-account" size="20" class="mr-3" :color="getRoleColor(user.role)" />
                </template>
                <v-list-item-title class="text-body-2">Rol</v-list-item-title>
                <template #append>
                  <v-chip :color="getRoleColor(user.role)" size="small" variant="tonal">
                    {{ getRoleLabel(user.role) }}
                  </v-chip>
                </template>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-circle" size="12" class="mr-3" :color="user.isActive ? 'success' : 'error'" />
                </template>
                <v-list-item-title class="text-body-2">Estado</v-list-item-title>
                <template #append>
                  <span class="text-body-2 font-weight-medium">
                    {{ user.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </template>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-star-outline" size="20" class="mr-3" color="warning" />
                </template>
                <v-list-item-title class="text-body-2">Puntuación</v-list-item-title>
                <template #append>
                  <span class="text-body-2 font-weight-bold">{{ user.totalScore || 0 }}</span>
                </template>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-magnify" size="20" class="mr-3" color="primary" />
                </template>
                <v-list-item-title class="text-body-2">Pistas descubiertas</v-list-item-title>
                <template #append>
                  <span class="text-body-2 font-weight-bold">{{ user.discoveredClues?.length || 0 }}</span>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Fechas y actividad -->
        <v-col cols="12" md="6">
          <v-card class="card-glow pa-5">
            <h3 class="text-subtitle-1 font-weight-bold mb-4">Actividad</h3>

            <v-list density="compact" class="bg-transparent">
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-clock-outline" size="20" class="mr-3" color="info" />
                </template>
                <v-list-item-title class="text-body-2">Último acceso</v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ formatDate(user.lastLogin) }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-calendar-plus" size="20" class="mr-3" color="success" />
                </template>
                <v-list-item-title class="text-body-2">Cuenta creada</v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ formatDate(user.createdAt) }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-calendar-edit" size="20" class="mr-3" color="warning" />
                </template>
                <v-list-item-title class="text-body-2">Última actualización</v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ formatDate(user.updatedAt) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>

            <v-divider class="my-3" />

            <!-- Acciones de seguridad -->
            <v-btn
              variant="tonal"
              color="error"
              block
              size="small"
              prepend-icon="mdi-lock-reset"
              @click="handleInvalidateTokens"
              :loading="invalidatingTokens"
            >
              Invalidar tokens de reset
            </v-btn>
          </v-card>
        </v-col>
      </v-row>

      <!-- Pistas descubiertas -->
      <v-card v-if="user.discoveredClues?.length" class="card-glow pa-5 mt-6">
        <h3 class="text-subtitle-1 font-weight-bold mb-3">Pistas descubiertas</h3>
        <div class="d-flex flex-wrap ga-2">
          <v-chip
            v-for="clue in user.discoveredClues"
            :key="clue"
            variant="tonal"
            color="primary"
            size="small"
          >
            <v-icon icon="mdi-puzzle-outline" size="14" class="mr-1" />
            {{ clue }}
          </v-chip>
        </div>
      </v-card>
    </template>

    <!-- Not found -->
    <template v-else>
      <v-card class="card-glow pa-8 text-center">
        <v-icon icon="mdi-account-question-outline" size="64" color="error" class="mb-4" />
        <h3 class="text-h6 font-weight-medium mb-2">Usuario no encontrado</h3>
        <v-btn color="primary" to="/dashboard/staff/users" class="mt-2">
          Volver a la lista
        </v-btn>
      </v-card>
    </template>

    <!-- Edit dialog -->
    <StaffUserEditDialog
      v-model="editDialog"
      :user="user"
      @saved="onUserSaved"
    />

    <!-- Toggle status dialog -->
    <StaffConfirmDialog
      v-if="user"
      v-model="toggleStatusDialog"
      :title="user.isActive ? 'Desactivar usuario' : 'Reactivar usuario'"
      :message="user.isActive
        ? `¿Estás seguro de desactivar a ${user.name}?`
        : `¿Deseas reactivar a ${user.name}?`"
      :confirm-text="user.isActive ? 'Desactivar' : 'Reactivar'"
      :color="user.isActive ? 'warning' : 'success'"
      :icon="user.isActive ? 'mdi-account-off-outline' : 'mdi-account-check-outline'"
      :loading="togglingStatus"
      @confirm="handleToggleStatus"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useUsersStore } from '~/stores/users'
import { useNotification } from '~/composables/useNotification'
import { UserRole } from '~/types/auth'
import type { User } from '~/types/auth'
import { ROLE_LABELS, ROLE_COLORS } from '~/utils/constants'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN],
})

const route = useRoute()
const usersStore = useUsersStore()
const notification = useNotification()

const loading = ref(true)
const user = ref<User | null>(null)
const editDialog = ref(false)
const toggleStatusDialog = ref(false)
const togglingStatus = ref(false)
const invalidatingTokens = ref(false)

useHead({
  title: computed(() => user.value ? `${user.value.name} — Admin` : 'Detalle de Usuario'),
})

// ── Cargar usuario ──
const loadUser = async () => {
  loading.value = true
  try {
    const id = route.params.id
    if (!id || (Array.isArray(id) && !id[0])) {
      throw new Error('ID de usuario inválido')
    }
    const userId = Array.isArray(id) ? id[0] : (id as string)
    user.value = await usersStore.fetchUserById(userId)
  } catch (error: any) {
    notification.error(error?.message || 'Error al cargar el usuario')
  } finally {
    loading.value = false
  }
}

onMounted(loadUser)

// ── Helpers ──
const getRoleLabel = (role: UserRole) => ROLE_LABELS[role] || role
const getRoleColor = (role: UserRole) => ROLE_COLORS[role] || 'primary'

const getInitials = (name: string): string => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase()
}

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'No disponible'
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── Handlers ──
const onUserSaved = () => {
  loadUser()
}

const handleToggleStatus = async () => {
  if (!user.value || !user.value._id) return
  togglingStatus.value = true
  try {
    if (user.value.isActive) {
      await usersStore.deactivateUser(user.value._id as string)
      notification.success(`${user.value.name} ha sido desactivado`)
    } else {
      await usersStore.reactivateUser(user.value._id as string)
      notification.success(`${user.value.name} ha sido reactivado`)
    }
    toggleStatusDialog.value = false
    await loadUser()
  } catch (error: any) {
    notification.error(error?.message || 'Error al cambiar estado')
  } finally {
    togglingStatus.value = false
  }
}

const handleInvalidateTokens = async () => {
  if (!user.value || !user.value._id) return
  invalidatingTokens.value = true
  try {
    await usersStore.invalidateUserResetTokens(user.value._id as string)
    notification.success('Tokens invalidados correctamente')
  } catch (error: any) {
    notification.error(error?.message || 'Error al invalidar tokens')
  } finally {
    invalidatingTokens.value = false
  }
}
</script>
