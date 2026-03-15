<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Gestión de Usuarios</h1>
        <p class="text-body-2 text-medium-emphasis">
          {{ usersStore.totalCount }} usuarios registrados en el sistema
        </p>
      </div>
    </div>

    <!-- Stats bar -->
    <EmpleadosUserStatsBar />

    <!-- Tabla de usuarios -->
    <EmpleadosUsersTable
      @edit="openEditDialog"
      @toggle-status="openToggleStatusDialog"
      @invalidate-tokens="openInvalidateTokensDialog"
      @refresh="loadUsers"
    />

    <!-- Diálogo de edición -->
    <EmpleadosUserEditDialog
      v-model="editDialog"
      :user="selectedUser"
      @saved="onUserSaved"
    />

    <!-- Diálogo de confirmación: activar/desactivar -->
    <EmpleadosConfirmDialog
      v-model="toggleStatusDialog"
      :title="toggleStatusTitle"
      :message="toggleStatusMessage"
      :confirm-text="toggleStatusConfirmText"
      :color="toggleStatusColor"
      :icon="toggleStatusIcon"
      :loading="toggleStatusLoading"
      @confirm="handleToggleStatus"
    />

    <!-- Diálogo de confirmación: invalidar tokens -->
    <EmpleadosConfirmDialog
      v-model="invalidateDialog"
      title="Invalidar tokens de reset"
      :message="`¿Estás seguro de invalidar todos los tokens de recuperación de contraseña de ${selectedUser?.name}? El usuario deberá solicitar un nuevo código si necesita resetear su contraseña.`"
      confirm-text="Invalidar tokens"
      color="error"
      icon="mdi-lock-reset"
      :loading="invalidateLoading"
      @confirm="handleInvalidateTokens"
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
import EmpleadosUserStatsBar from '~/components/empleados/EmpleadosUserStatsBar.vue'
import EmpleadosUsersTable from '~/components/empleados/EmpleadosUsersTable.vue'
import EmpleadosUserEditDialog from '~/components/empleados/EmpleadosUserEditDialog.vue'
import EmpleadosConfirmDialog from '~/components/empleados/EmpleadosConfirmDialog.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN],
})

useHead({ title: 'Gestión de Usuarios' })

const usersStore = useUsersStore()
const notification = useNotification()

// ── State ──
const selectedUser = ref<User | null>(null)

// Edit dialog
const editDialog = ref(false)

// Toggle status dialog
const toggleStatusDialog = ref(false)
const toggleStatusLoading = ref(false)

// Invalidate tokens dialog
const invalidateDialog = ref(false)
const invalidateLoading = ref(false)

// ── Toggle status computed ──
const toggleStatusTitle = computed(() =>
  selectedUser.value?.isActive ? 'Desactivar usuario' : 'Reactivar usuario'
)

const toggleStatusMessage = computed(() =>
  selectedUser.value?.isActive
    ? `¿Estás seguro de desactivar a ${selectedUser.value?.name}? El usuario no podrá iniciar sesión hasta que sea reactivado.`
    : `¿Deseas reactivar a ${selectedUser.value?.name}? El usuario podrá iniciar sesión nuevamente.`
)

const toggleStatusConfirmText = computed(() =>
  selectedUser.value?.isActive ? 'Desactivar' : 'Reactivar'
)

const toggleStatusColor = computed(() =>
  selectedUser.value?.isActive ? 'warning' : 'success'
)

const toggleStatusIcon = computed(() =>
  selectedUser.value?.isActive ? 'mdi-account-off-outline' : 'mdi-account-check-outline'
)

// ── Carga inicial ──
const loadUsers = async () => {
  try {
    await usersStore.fetchAllUsers()
  } catch (error: any) {
    notification.error(error?.message || 'Error al cargar usuarios')
  }
}

onMounted(() => {
  loadUsers()
})

// ── Handlers ──
const openEditDialog = (user: User) => {
  selectedUser.value = { ...user }
  editDialog.value = true
}

const openToggleStatusDialog = (user: User) => {
  selectedUser.value = user
  toggleStatusDialog.value = true
}

const openInvalidateTokensDialog = (user: User) => {
  selectedUser.value = user
  invalidateDialog.value = true
}

const onUserSaved = () => {
  loadUsers()
}

const handleToggleStatus = async () => {
  if (!selectedUser.value || !selectedUser.value._id) return

  toggleStatusLoading.value = true
  try {
    if (selectedUser.value.isActive) {
      await usersStore.deactivateUser(selectedUser.value._id)
      notification.success(`${selectedUser.value.name} ha sido desactivado`)
    } else {
      await usersStore.reactivateUser(selectedUser.value._id)
      notification.success(`${selectedUser.value.name} ha sido reactivado`)
    }
    toggleStatusDialog.value = false
    await loadUsers()
  } catch (error: any) {
    notification.error(error?.message || 'Error al cambiar estado del usuario')
  } finally {
    toggleStatusLoading.value = false
  }
}

const handleInvalidateTokens = async () => {
  if (!selectedUser.value || !selectedUser.value._id) return

  invalidateLoading.value = true
  try {
    await usersStore.invalidateUserResetTokens(selectedUser.value._id as string)
    notification.success(`Tokens de ${selectedUser.value.name} invalidados`)
    invalidateDialog.value = false
  } catch (error: any) {
    notification.error(error?.message || 'Error al invalidar tokens')
  } finally {
    invalidateLoading.value = false
  }
}
</script>

