<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="520"
    persistent
  >
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center pa-5 pb-3">
        <v-icon icon="mdi-account-plus-outline" class="mr-2" color="success" />
        <span class="text-h6 font-weight-bold">Crear Usuario</span>
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
        <v-form ref="formRef" @submit.prevent="handleCreate" lazy-validation>
          <!-- Nombre completo -->
          <v-text-field
            v-model="form.nombre"
            label="Nombre completo"
            prepend-inner-icon="mdi-account-outline"
            :rules="[v => !!v || 'El nombre es requerido']"
            :disabled="saving"
            class="mb-2"
            hint="Ingresa el nombre completo del usuario"
            persistent-hint
          />

          <!-- Email -->
          <v-text-field
            v-model="form.email"
            label="Correo electrónico"
            type="email"
            prepend-inner-icon="mdi-email-outline"
            :rules="[
              v => !!v || 'El email es requerido',
              v => /^[^@]+@[^@]+\.[^@]+$/.test(v) || 'El email debe ser válido'
            ]"
            :disabled="saving"
            class="mb-2"
            hint="Debe ser único en el sistema"
            persistent-hint
          />

          <!-- Contraseña -->
          <v-text-field
            v-model="form.password"
            label="Contraseña"
            :type="showPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            :rules="[
              v => !!v || 'La contraseña es requerida',
              v => v.length >= 6 || 'Mínimo 6 caracteres'
            ]"
            :disabled="saving"
            class="mb-2"
            @click:append-inner="showPassword = !showPassword"
          />

          <!-- Rol -->
          <v-select
            v-model="form.role"
            :items="roleOptions"
            label="Rol"
            prepend-inner-icon="mdi-shield-account-outline"
            :rules="[v => !!v || 'El rol es requerido']"
            :disabled="saving"
            class="mb-2"
          />

          <!-- Cédula (opcional) -->
          <v-text-field
            v-model="form.cedula"
            label="Cédula (opcional)"
            prepend-inner-icon="mdi-card-account-details-outline"
            :disabled="saving"
            class="mb-2"
            hint="Número de identificación del usuario"
            persistent-hint
          />

          <!-- Estado activo -->
          <v-checkbox
            v-model="form.isActive"
            label="Crear usuario activo"
            :disabled="saving"
            class="mb-2"
          />
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
          color="success"
          :loading="saving"
          :disabled="saving"
          @click="handleCreate"
        >
          <v-icon icon="mdi-account-plus" class="mr-1" size="18" />
          Crear Usuario
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  created: []
}>()

const formRef = ref()
const saving = ref(false)
const showPassword = ref(false)

const form = reactive({
  nombre: '',
  email: '',
  password: '',
  role: 'recepcionista',
  cedula: '',
  isActive: true,
})

const roleOptions = [
  { title: 'Superadmin', value: 'superadmin' },
  { title: 'Administrador', value: 'admin' },
  { title: 'Recepcionista', value: 'recepcionista' },
  { title: 'Cafetería', value: 'cafeteria' },
  { title: 'Lavandería', value: 'lavanderia' },
  { title: 'Spa', value: 'spa' },
  { title: 'Room Service', value: 'room_service' },
]

const close = () => {
  formRef.value?.reset()
  emit('update:modelValue', false)
}

const handleCreate = async () => {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  saving.value = true
  try {
    const { useUsersStore } = await import('~/stores/users')
    const { useNotification } = await import('~/composables/useNotification')
    const usersStore = useUsersStore()
    const notification = useNotification()

    // Crear usuario
    await usersStore.createUser({
      nombre: form.nombre,
      email: form.email,
      password: form.password,
      role: form.role,
      cedula: form.cedula || undefined,
      isActive: form.isActive,
    })

    notification.success(`Usuario creado correctamente`)
    emit('created')
    close()
  } catch (error: any) {
    const { useNotification } = await import('~/composables/useNotification')
    const notification = useNotification()
    notification.error(error?.message || 'Error al crear el usuario')
  } finally {
    saving.value = false
  }
}
</script>
