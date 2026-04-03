<template>
  <StandardDataTable
      title="Usuarios"
      subtitle="Gestión centralizada de cuentas y permisos"
      :headers="headers"
      :items="filteredUsers"
      :loading="usersStore.loading"
      :items-per-page="10"
      empty-icon="mdi-account-search-outline"
      empty-title="No se encontraron usuarios"
      empty-description="Ajusta filtros o recarga para consultar nuevamente."
      @empty-action="$emit('refresh')"
    >
      <template #filters>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Buscar usuario"
          clearable
          hide-details
          density="compact"
          style="min-width: 240px"
        />

        <v-select
          v-model="filterRole"
          :items="roleOptions"
          label="Rol"
          clearable
          hide-details
          density="compact"
          style="min-width: 180px"
        />

        <v-select
          v-model="filterStatus"
          :items="statusOptions"
          label="Estado"
          clearable
          hide-details
          density="compact"
          style="min-width: 180px"
        />
      </template>

      <template #actions>
        <v-btn
          icon
          variant="text"
          size="small"
          :loading="usersStore.loading"
          :disabled="usersStore.loading"
          @click="$emit('refresh')"
        >
          <v-icon icon="mdi-refresh" />
          <v-tooltip activator="parent" location="bottom">Actualizar</v-tooltip>
        </v-btn>
      </template>

      <!-- Nombre + Email -->
      <template #item.name="{ item }">
        <NuxtLink
          :to="item.id ? `/admin/usuarios/${item.id}` : '/admin/usuarios'"
          class="d-flex align-center py-2 text-decoration-none"
          style="color: inherit"
        >
          <v-avatar
            :color="getRoleColor(item.role)"
            size="36"
            class="mr-3"
          >
            <span class="text-caption font-weight-bold">
              {{ getInitials(item.name || item.fullName || '?') }}
            </span>
          </v-avatar>
          <div>
            <div class="text-body-2 font-weight-medium user-name-link">{{ item.name || item.fullName || 'Sin nombre' }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
          </div>
        </NuxtLink>
      </template>

      <!-- Rol -->
      <template #item.role="{ item }">
        <v-chip
          :color="getRoleColor(item.role)"
          size="small"
          variant="tonal"
        >
          <v-icon :icon="getRoleIcon(item.role)" size="12" class="mr-1" />
          {{ getRoleLabel(item.role) }}
        </v-chip>
      </template>

      <!-- Estado -->
      <template #item.isActive="{ item }">
        <v-chip
          :color="item.isActive ? 'success' : 'error'"
          size="small"
          variant="tonal"
        >
          <v-icon
            :icon="item.isActive ? 'mdi-check-circle' : 'mdi-close-circle'"
            size="12"
            class="mr-1"
          />
          {{ item.isActive ? 'Activo' : 'Inactivo' }}
        </v-chip>
      </template>

      <!-- Score -->
      <template #item.totalScore="{ item }">
        <span class="font-weight-medium">{{ item.totalScore || 0 }}</span>
      </template>

      <!-- Último login -->
      <template #item.lastLogin="{ item }">
        <span class="text-caption">
          {{ formatDate(item.lastLogin) }}
        </span>
      </template>

      <!-- Acciones -->
      <template #item.actions="{ item }">
        <div class="d-flex ga-1">
          <!-- Editar -->
          <v-btn
            icon
            variant="text"
            size="x-small"
            color="primary"
            :disabled="usersStore.loading"
            @click="$emit('edit', item)"
          >
            <v-icon icon="mdi-pencil-outline" size="18" />
            <v-tooltip activator="parent" location="top">Editar</v-tooltip>
          </v-btn>

          <!-- Activar / Desactivar -->
          <v-btn
            icon
            variant="text"
            size="x-small"
            :color="item.isActive ? 'warning' : 'success'"
            :disabled="usersStore.loading"
            @click="$emit('toggle-status', item)"
          >
            <v-icon
              :icon="item.isActive ? 'mdi-account-off-outline' : 'mdi-account-check-outline'"
              size="18"
            />
            <v-tooltip activator="parent" location="top">
              {{ item.isActive ? 'Desactivar' : 'Reactivar' }}
            </v-tooltip>
          </v-btn>

          <!-- Invalidar tokens -->
          <v-btn
            icon
            variant="text"
            size="x-small"
            color="error"
            :disabled="usersStore.loading"
            @click="$emit('invalidate-tokens', item)"
          >
            <v-icon icon="mdi-lock-reset" size="18" />
            <v-tooltip activator="parent" location="top">Invalidar tokens</v-tooltip>
          </v-btn>
        </div>
      </template>

    </StandardDataTable>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUsersStore } from '~/stores/users'
import { ROLE_LABELS, ROLE_COLORS, ROLE_ICONS } from '~/utils/constants'
import type { User, UserRole } from '~/types/auth'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'

defineEmits<{
  edit: [user: User]
  'toggle-status': [user: User]
  'invalidate-tokens': [user: User]
  refresh: []
}>()

const usersStore = useUsersStore()

// ── State ──
const search = ref('')
const filterRole = ref<string | null>(null)
const filterStatus = ref<string | null>(null)

// ── Opciones de filtro ──
const roleOptions = [
  { title: 'Superadmin', value: 'superadmin' },
  { title: 'Administrador', value: 'admin' },
  { title: 'Recepcionista', value: 'recepcionista' },
  { title: 'Cliente', value: 'cliente' },
]

const statusOptions = [
  { title: 'Activo', value: 'active' },
  { title: 'Inactivo', value: 'inactive' },
]

// ── Headers de la tabla ──
const headers = [
  { title: 'Usuario', key: 'name', sortable: true, minWidth: '220px' },
  { title: 'Rol', key: 'role', sortable: true, width: '140px' },
  { title: 'Estado', key: 'isActive', sortable: true, width: '120px' },
  { title: 'Score', key: 'totalScore', sortable: true, width: '90px' },
  { title: 'Último acceso', key: 'lastLogin', sortable: true, width: '160px' },
  { title: 'Acciones', key: 'actions', sortable: false, width: '140px', align: 'center' as const },
]

// ── Usuarios filtrados ──
const filteredUsers = computed(() => {
  let result = usersStore.users

  if (search.value.trim()) {
    const term = search.value.trim().toLowerCase()
    result = result.filter((u) =>
      [u.name, u.fullName, u.email, String(u.id)]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(term)),
    )
  }

  if (filterRole.value) {
    result = result.filter((u) => u.role === filterRole.value)
  }

  if (filterStatus.value) {
    const isActive = filterStatus.value === 'active'
    result = result.filter((u) => u.isActive === isActive)
  }

  return result
})

// ── Helpers ──
const getRoleLabel = (role: UserRole) => ROLE_LABELS[role] || role
const getRoleColor = (role: UserRole) => ROLE_COLORS[role] || 'primary'
const getRoleIcon = (role: UserRole) => ROLE_ICONS[role] || 'mdi-account'

const getInitials = (name: string): string => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase()
}

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'Nunca'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Justo ahora'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)}h`
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<style scoped lang="scss">
.user-name-link {
  transition: color 0.15s ease;

  &:hover {
    color: rgb(var(--v-theme-primary)) !important;
  }
}
</style>
