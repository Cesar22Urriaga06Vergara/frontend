<template>
  <v-card class="card-glow">
    <v-card-title class="d-flex align-center justify-space-between">
      <span>Gestión de Tipos de Habitación</span>
      <v-btn color="primary" @click="openCreateDialog">
        <v-icon left>mdi-plus</v-icon>
        Nuevo Tipo
      </v-btn>
    </v-card-title>

    <v-card-text class="pb-0">
      <v-row align="center" class="ga-2">
        <v-col cols="6" sm="3" md="2">
          <v-select
            v-model="filterActivo"
            :items="estadoOptions"
            label="Estado"
            clearable
            hide-details
            density="compact"
          />
        </v-col>

        <v-col cols="6" sm="4" md="3">
          <v-select
            v-model="filterNombreTipo"
            :items="tiposHabitacionOptions"
            label="Buscar tipo"
            clearable
            hide-details
            density="compact"
          />
        </v-col>

        <v-spacer class="d-none d-md-block" />

        <v-col cols="auto">
          <v-btn
            icon
            variant="text"
            size="small"
            :loading="loading"
            @click="loadTiposHabitacion"
          >
            <v-icon icon="mdi-refresh" />
            <v-tooltip activator="parent" location="bottom">Actualizar</v-tooltip>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>

    <v-data-table
      :headers="headers"
      :items="filteredTipos"
      :loading="loading"
      :items-per-page="10"
      hover
      class="room-types-table"
    >
      <template #item.nombreTipo="{ item }">
        <div class="py-2">
          <div class="text-body-2 font-weight-medium">{{ item.nombreTipo }}</div>
          <div v-if="item.descripcion" class="text-caption text-medium-emphasis">
            {{ item.descripcion }}
          </div>
        </div>
      </template>

      <template #item.capacidadPersonas="{ item }">
        <v-chip size="small" variant="tonal">
          <v-icon left size="small">mdi-account-multiple</v-icon>
          {{ item.capacidadPersonas }} personas
        </v-chip>
      </template>

      <template #item.precioBase="{ item }">
        <span class="text-body-2 font-weight-medium">
          {{ item.precioBase ? `$${Number(item.precioBase).toLocaleString()}` : 'N/A' }}
        </span>
      </template>

      <template #item.amenidades="{ item }">
        <div v-if="item.amenidades && item.amenidades.length > 0" class="py-2">
          <v-list density="compact" class="pa-0 bg-transparent">
            <v-list-item
              v-for="amenidad in item.amenidades"
              :key="amenidad.id"
              class="px-0 py-1"
              density="compact"
            >
              <template #prepend>
                <v-icon
                  v-if="amenidad.icono"
                  :icon="amenidad.icono"
                  size="small"
                  class="mr-2"
                />
                <v-icon v-else icon="mdi-check-circle" size="small" class="mr-2" />
              </template>
              <v-list-item-title class="text-caption">
                {{ amenidad.nombre }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
        <span v-else class="text-caption text-medium-emphasis">Sin amenidades</span>
      </template>

      <template #item.activo="{ item }">
        <v-chip
          :color="item.activo ? 'success' : 'error'"
          size="small"
          variant="tonal"
        >
          {{ item.activo ? 'Activo' : 'Inactivo' }}
        </v-chip>
      </template>

      <template #item.actions="{ item }">
        <v-btn
          icon="mdi-pencil"
          variant="text"
          size="small"
          @click="openEditDialog(item)"
        >
          <v-icon>mdi-pencil</v-icon>
          <v-tooltip activator="parent" location="bottom">Editar</v-tooltip>
        </v-btn>
        <v-btn
          icon="mdi-delete"
          variant="text"
          size="small"
          color="error"
          @click="openDeleteDialog(item)"
        >
          <v-icon>mdi-delete</v-icon>
          <v-tooltip activator="parent" location="bottom">Eliminar</v-tooltip>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Dialog para crear/editar -->
    <v-dialog v-model="dialog" max-width="700">
      <v-card>
        <v-card-title>
          {{ editingItem ? 'Editar Tipo de Habitación' : 'Nuevo Tipo de Habitación' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="formData.nombreTipo"
                  label="Nombre del Tipo"
                  :rules="[v => !!v || 'El nombre es requerido']"
                  required
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="formData.capacidadPersonas"
                  label="Capacidad"
                  type="number"
                  :rules="[v => !!v || 'La capacidad es requerida', v => v > 0 || 'Debe ser mayor a 0']"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.descripcion"
                  label="Descripción"
                  rows="2"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="formData.precioBase"
                  label="Precio Base"
                  type="number"
                  prefix="$"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="formData.activo"
                  label="Activo"
                  color="success"
                />
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  v-model="formData.amenidadesIds"
                  :items="amenidades"
                  item-title="nombre"
                  item-value="id"
                  label="Amenidades"
                  multiple
                  chips
                  closable-chips
                >
                  <template #chip="{ item, props }">
                    <v-chip v-bind="props">
                      <v-icon
                        v-if="item.raw.icono"
                        :icon="item.raw.icono"
                        start
                        size="small"
                      />
                      {{ item.raw.nombre }}
                    </v-chip>
                  </template>
                  <template #item="{ item, props }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-icon v-if="item.raw.icono" :icon="item.raw.icono" />
                      </template>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialog = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="!valid"
            @click="saveTipoHabitacion"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para confirmar eliminación -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Está seguro de eliminar el tipo de habitación <strong>{{ itemToDelete?.nombreTipo }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn
            color="error"
            :loading="deleting"
            @click="deleteTipoHabitacion"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TipoHabitacion, Amenidad, CreateTipoHabitacionDto, UpdateTipoHabitacionDto } from '~/types/api'

const api = useApi()
const { success, error } = useNotification()

const tiposHabitacion = ref<TipoHabitacion[]>([])
const amenidades = ref<Amenidad[]>([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const filterActivo = ref<boolean | null>(null)
const filterNombreTipo = ref('')

const dialog = ref(false)
const deleteDialog = ref(false)
const valid = ref(false)
const editingItem = ref<TipoHabitacion | null>(null)
const itemToDelete = ref<TipoHabitacion | null>(null)

const formData = ref<CreateTipoHabitacionDto>({
  idHotel: 1,
  nombreTipo: '',
  descripcion: '',
  capacidadPersonas: 1,
  precioBase: 0,
  activo: true,
  amenidadesIds: []
})

const headers = [
  { title: 'Tipo de Habitación', key: 'nombreTipo', sortable: true },
  { title: 'Capacidad', key: 'capacidadPersonas', sortable: true },
  { title: 'Precio Base', key: 'precioBase', sortable: true },
  { title: 'Amenidades', key: 'amenidades', sortable: false },
  { title: 'Estado', key: 'activo', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const }
]

const estadoOptions = [
  { title: 'Activo', value: true },
  { title: 'Inactivo', value: false }
]

const tiposHabitacionOptions = computed(() => {
  return tiposHabitacion.value.map(t => t.nombreTipo)
})

const filteredTipos = computed(() => {
  let filtered = tiposHabitacion.value
  
  if (filterActivo.value !== null) {
    filtered = filtered.filter(t => t.activo === filterActivo.value)
  }
  
  if (filterNombreTipo.value) {
    filtered = filtered.filter(t => t.nombreTipo === filterNombreTipo.value)
  }
  
  return filtered
})

const loadTiposHabitacion = async () => {
  try {
    loading.value = true
    const response = await api.get<TipoHabitacion[]>('/tipos-habitacion')
    tiposHabitacion.value = response
  } catch (err: any) {
    error(err?.message || 'Error al cargar tipos de habitación')
  } finally {
    loading.value = false
  }
}

const loadAmenidades = async () => {
  try {
    const response = await api.get<Amenidad[]>('/amenidades')
    amenidades.value = response
  } catch (err: any) {
    error(err?.message || 'Error al cargar amenidades')
  }
}

const openCreateDialog = () => {
  editingItem.value = null
  formData.value = {
    idHotel: 1,
    nombreTipo: '',
    descripcion: '',
    capacidadPersonas: 1,
    precioBase: 0,
    activo: true,
    amenidadesIds: []
  }
  dialog.value = true
}

const openEditDialog = (item: TipoHabitacion) => {
  editingItem.value = item
  formData.value = {
    idHotel: item.idHotel,
    nombreTipo: item.nombreTipo,
    descripcion: item.descripcion || '',
    capacidadPersonas: item.capacidadPersonas,
    precioBase: item.precioBase || 0,
    activo: item.activo,
    amenidadesIds: item.amenidades?.map(a => a.id) || []
  }
  dialog.value = true
}

const openDeleteDialog = (item: TipoHabitacion) => {
  itemToDelete.value = item
  deleteDialog.value = true
}

const saveTipoHabitacion = async () => {
  try {
    saving.value = true
    
    // Asegurar que los valores numéricos sean números
    const dataToSend = {
      ...formData.value,
      capacidadPersonas: Number(formData.value.capacidadPersonas),
      precioBase: formData.value.precioBase ? Number(formData.value.precioBase) : undefined
    }
    
    if (editingItem.value) {
      await api.patch<TipoHabitacion>(`/tipos-habitacion/${editingItem.value.id}`, dataToSend as UpdateTipoHabitacionDto)
      success('Tipo de habitación actualizado correctamente')
    } else {
      await api.post<TipoHabitacion>('/tipos-habitacion', dataToSend)
      success('Tipo de habitación creado correctamente')
    }
    dialog.value = false
    await loadTiposHabitacion()
  } catch (err: any) {
    error(err?.message || 'Error al guardar tipo de habitación')
  } finally {
    saving.value = false
  }
}

const deleteTipoHabitacion = async () => {
  if (!itemToDelete.value) return
  try {
    deleting.value = true
    await api.del(`/tipos-habitacion/${itemToDelete.value.id}`)
    success('Tipo de habitación eliminado correctamente')
    deleteDialog.value = false
    await loadTiposHabitacion()
  } catch (err: any) {
    error(err?.message || 'Error al eliminar tipo de habitación')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadTiposHabitacion()
  loadAmenidades()
})
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
