<template>
  <div>
    <PageHeader
      title="Gestión de Usuarios"
      :subtitle="`${usersStore.totalCount} usuarios registrados en el sistema`"
    >
      <template #status>
        <StatusBadge :status="viewState.status.value" />
      </template>
      <template #actions>
        <v-btn
          color="success"
          prepend-icon="mdi-account-plus"
          @click="openCreateDialog"
        >
          Crear Usuario
        </v-btn>
      </template>
    </PageHeader>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Usuarios" :value="usersStore.totalCount" icon="mdi-account-group" color="primary" :loading="usersStore.loading" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Activos" :value="usersStore.users.filter(u => u.isActive).length" icon="mdi-account-check" color="success" :loading="usersStore.loading" />
      </v-col>
    </v-row>

    <SectionCard v-if="viewState.isError.value" :padded="false" class="mb-4">
      <EmptyState
        icon="mdi-alert-circle-outline"
        title="No fue posible cargar usuarios"
        :description="usersStore.error || 'Error inesperado en la carga de usuarios'"
        action-label="Reintentar"
        @action="loadUsers"
      />
    </SectionCard>

    <!-- Stats bar -->
    <EmpleadosUserStatsBar v-if="!viewState.isError.value" />

    <!-- Tabla de usuarios -->
    <EmpleadosUsersTable
      v-if="!viewState.isError.value"
      @edit="openEditDialog"
      @toggle-status="openToggleStatusDialog"
      @invalidate-tokens="openInvalidateTokensDialog"
      @refresh="loadUsers"
    />

    <StandardDataTable
      v-if="!viewState.isError.value"
      class="mt-6"
      title="Resumen de usuarios"
      subtitle="Indicadores generales del módulo"
      :headers="resumenHeaders"
      :items="resumenItems"
      :items-per-page="5"
    />

    <!-- Diálogo de edición -->
    <EmpleadosUserEditDialog
      v-model="editDialog"
      :user="selectedUser"
      @saved="onUserSaved"
    />

    <!-- Diálogo de creación -->
    <EmpleadosUserCreateDialog
      v-model="createDialog"
      @created="onUserCreated"
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
import { useViewState } from '~/composables/useViewState'
import { UserRole } from '~/types/auth'
import type { User } from '~/types/auth'
import PageHeader from '~/components/shared/PageHeader.vue'
import StatusBadge from '~/components/shared/StatusBadge.vue'
import EmptyState from '~/components/shared/EmptyState.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import EmpleadosUserStatsBar from '~/components/empleados/EmpleadosUserStatsBar.vue'
import EmpleadosUsersTable from '~/components/empleados/EmpleadosUsersTable.vue'
import EmpleadosUserEditDialog from '~/components/empleados/EmpleadosUserEditDialog.vue'
import EmpleadosUserCreateDialog from '~/components/empleados/EmpleadosUserCreateDialog.vue'
import EmpleadosConfirmDialog from '~/components/empleados/EmpleadosConfirmDialog.vue'

definePageMeta({
  layout: 'admin',
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

// Create dialog
const createDialog = ref(false)

// Toggle status dialog
const toggleStatusDialog = ref(false)
const toggleStatusLoading = ref(false)

// Invalidate tokens dialog
const invalidateDialog = ref(false)
const invalidateLoading = ref(false)
const hasData = computed(() => usersStore.users.length > 0)
const viewState = useViewState(computed(() => usersStore.loading), hasData, computed(() => usersStore.error), computed(() => false))

const resumenHeaders = [
  { title: 'Métrica', key: 'metrica' },
  { title: 'Valor', key: 'valor' },
]

const resumenItems = computed(() => [
  { metrica: 'Usuarios totales', valor: usersStore.totalCount },
  { metrica: 'Usuarios activos', valor: usersStore.users.filter(u => u.isActive).length },
])

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

const openCreateDialog = () => {
  createDialog.value = true
}

const onUserCreated = () => {
  loadUsers()
}

const handleToggleStatus = async () => {
  if (!selectedUser.value || !selectedUser.value.id) return

  toggleStatusLoading.value = true
  try {
    if (selectedUser.value.isActive) {
      await usersStore.deactivateUser(selectedUser.value.id)
      notification.success(`${selectedUser.value.name} ha sido desactivado`)
    } else {
      await usersStore.reactivateUser(selectedUser.value.id)
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
  if (!selectedUser.value || !selectedUser.value.id) return

  invalidateLoading.value = true
  try {
    await usersStore.invalidateUserResetTokens(String(selectedUser.value.id))
    notification.success(`Tokens de ${selectedUser.value.name} invalidados`)
    invalidateDialog.value = false
  } catch (error: any) {
    notification.error(error?.message || 'Error al invalidar tokens')
  } finally {
    invalidateLoading.value = false
  }
}
</script>

