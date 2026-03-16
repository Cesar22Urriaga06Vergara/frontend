<template>
  <div class="pa-6">
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Gestión de Medios de Pago</h1>
        <p class="text-body-2 text-medium-emphasis">Configura los métodos de pago disponibles</p>
      </div>
      <v-btn color="success" prepend-icon="mdi-plus" @click="abrirNuevo">
        Nuevo Medio
      </v-btn>
    </div>

    <!-- Tabla de Medios de Pago -->
    <v-card class="card-glow">
      <v-table>
        <thead>
          <tr>
            <th class="text-left">Nombre</th>
            <th class="text-left">Descripción</th>
            <th class="text-center">Requiere Referencia</th>
            <th class="text-center">Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="medio in todosMedios" :key="medio.id">
            <td class="font-weight-bold">{{ medio.nombre }}</td>
            <td>{{ medio.descripcion || '-' }}</td>
            <td class="text-center">
              <v-icon v-if="medio.requiereReferencia" icon="mdi-check" color="success" />
              <v-icon v-else icon="mdi-close" color="error" />
            </td>
            <td class="text-center">
              <v-chip
                :color="medio.activo ? 'success' : 'error'"
                variant="tonal"
                size="small"
              >
                {{ medio.activo ? 'Activo' : 'Inactivo' }}
              </v-chip>
            </td>
            <td class="text-center">
              <v-btn
                :icon="medio.activo ? 'mdi-pause' : 'mdi-play'"
                size="x-small"
                variant="text"
                @click="toggleEstado(medio)"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Dialog Nuevo Medio -->
    <v-dialog v-model="showDialogo" max-width="500">
      <v-card>
        <v-card-title>{{ modo === 'new' ? 'Nuevo Medio de Pago' : 'Editar Medio' }}</v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="formulario">
            <v-text-field
              v-model="formData.nombre"
              label="Nombre*"
              placeholder="efectivo, tarjeta_credito, etc."
              required
              class="mb-4"
            />
            <v-text-field
              v-model="formData.descripcion"
              label="Descripción"
              placeholder="Opcional..."
              class="mb-4"
            />
            <v-checkbox
              v-model="formData.requiereReferencia"
              label="Requiere número de referencia (aprobación, transacción, etc.)"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" @click="showDialogo = false">Cancelar</v-btn>
          <v-btn color="primary" @click="guardar" :loading="guardando">
            {{ modo === 'new' ? 'Crear' : 'Actualizar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: ['superadmin'],
})

useHead({ title: 'Medios de Pago' })

const api = useApi()
const { success, error } = useNotification()

// State
const todosMedios = ref<any[]>([])
const showDialogo = ref(false)
const modo = ref<'new' | 'edit'>('new')
const guardando = ref(false)
const formulario = ref()

const formData = ref({
  nombre: '',
  descripcion: '',
  requiereReferencia: false,
})

// Methods
const cargarMedios = async () => {
  try {
    // Cargar todos, incluyendo inactivos
    const activos = await api.get('/medios-pago')
    todosMedios.value = activos
  } catch (err: any) {
    error('Error al cargar medios de pago')
  }
}

const abrirNuevo = () => {
  modo.value = 'new'
  formData.value = { nombre: '', descripcion: '', requiereReferencia: false }
  showDialogo.value = true
}

const guardar = async () => {
  if (!formData.value.nombre.trim()) {
    error('El nombre es requerido')
    return
  }

  guardando.value = true
  try {
    if (modo.value === 'new') {
      await api.post('/medios-pago', {
        nombre: formData.value.nombre.toLowerCase(),
        descripcion: formData.value.descripcion,
        requiereReferencia: formData.value.requiereReferencia,
      })
      success('Medio de pago creado exitosamente')
    }
    showDialogo.value = false
    cargarMedios()
  } catch (err: any) {
    error(err.message || 'Error al guardar')
  } finally {
    guardando.value = false
  }
}

const toggleEstado = async (medio: any) => {
  try {
    await api.patch(`/medios-pago/${medio.id}/toggle`)
    success(`Medio de pago ${medio.activo ? 'desactivado' : 'activado'}`)
    cargarMedios()
  } catch (err: any) {
    error('Error al cambiar estado')
  }
}

onMounted(() => {
  cargarMedios()
})
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
</style>
