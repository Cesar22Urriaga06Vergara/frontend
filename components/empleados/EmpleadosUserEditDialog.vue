<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="520"
    persistent
  >
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center pa-5 pb-3">
        <v-icon icon="mdi-account-edit-outline" class="mr-2" color="primary" />
        <span class="text-h6 font-weight-bold">Editar Usuario</span>
        <v-spacer />
        <v-btn
          icon
          variant="text"
          size="small"
          @click="close"
        >
          <v-icon icon="mdi-close" />
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-5">
        <v-form ref="formRef" @submit.prevent="handleSave" lazy-validation>
          <!-- Nombre -->
          <v-text-field
            v-model="form.name"
            label="Nombre completo"
            prepend-inner-icon="mdi-account-outline"
            :rules="[v => !!v || 'El nombre es requerido']"
            :disabled="saving"
            class="mb-2"
          />

          <!-- Email (solo lectura) -->
          <v-text-field
            :model-value="user?.email"
            label="Correo electrónico"
            prepend-inner-icon="mdi-email-outline"
            disabled
            hint="El correo no puede ser modificado"
            persistent-hint
            class="mb-2"
          />

          <!-- Rol -->
          <v-select
            v-model="form.role"
            :items="roleOptions"
            label="Rol"
            prepend-inner-icon="mdi-shield-account-outline"
            :disabled="saving"
            class="mb-2"
          />

          <!-- Info adicional (solo lectura) -->
          <v-card variant="tonal" color="surface-variant" rounded="lg" class="pa-3 mt-2">
            <div class="text-caption text-medium-emphasis mb-2 font-weight-bold">Información</div>
            <v-row dense>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">Estado</div>
                <v-chip
                  :color="user?.isActive ? 'success' : 'error'"
                  size="x-small"
                  variant="tonal"
                  class="mt-1"
                >
                  {{ user?.isActive ? 'Activo' : 'Inactivo' }}
                </v-chip>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">Puntuación</div>
                <div class="text-body-2 font-weight-bold mt-1">
                  {{ user?.totalScore || 0 }}
                </div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">Pistas</div>
                <div class="text-body-2 font-weight-bold mt-1">
                  {{ user?.discoveredClues?.length || 0 }}
                </div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">Creado</div>
                <div class="text-caption mt-1">
                  {{ formatDate(user?.createdAt) }}
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-btn
          variant="text"
          @click="close"
          :disabled="saving"
        >
          Cancelar
        </v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          :loading="saving"
          :disabled="!hasChanges || saving"
          @click="handleSave"
        >
          <v-icon icon="mdi-content-save" class="mr-1" size="18" />
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { User, UserRole } from '~/types/auth'

const props = defineProps<{
  modelValue: boolean
  user: User | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: [user: User]
}>()

const formRef = ref()
const saving = ref(false)

const form = reactive({
  name: '',
  role: '' as UserRole | string,
})

const roleOptions = [
  { title: 'Superadmin', value: 'superadmin' },
  { title: 'Administrador', value: 'admin' },
  { title: 'Recepcionista', value: 'recepcionista' },
  { title: 'Cliente', value: 'cliente' },
]

// Sincronizar form cuando cambia el usuario
watch(
  () => props.user,
  (u) => {
    if (u) {
      form.name = u.name || ''
      form.role = u.role
    }
  },
  { immediate: true }
)

const hasChanges = computed(() => {
  if (!props.user) return false
  return form.name !== props.user.name || form.role !== props.user.role
})

const close = () => {
  emit('update:modelValue', false)
}

const handleSave = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid || !props.user) return

  saving.value = true
  try {
    const { useUsersStore } = await import('~/stores/users')
    const usersStore = useUsersStore()
    const { useNotification } = await import('~/composables/useNotification')
    const notification = useNotification()

    const updatedUser = await usersStore.updateUser(props.user.id, {
      fullName: form.name,
      role: form.role as UserRole,
    })

    notification.success('Usuario actualizado correctamente')
    emit('saved', updatedUser)
    close()
  } catch (error: any) {
    const { useNotification } = await import('~/composables/useNotification')
    const notification = useNotification()
    notification.error(error?.message || 'Error al actualizar el usuario')
  } finally {
    saving.value = false
  }
}

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>
