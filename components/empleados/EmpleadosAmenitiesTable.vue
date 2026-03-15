<template>
  <v-card class="card-glow">
    <v-card-title class="d-flex align-center justify-space-between">
      <span>Gestión de Amenidades</span>
      <v-btn color="primary" @click="openCreateDialog">
        <v-icon left>mdi-plus</v-icon>
        Nueva Amenidad
      </v-btn>
    </v-card-title>

    <v-card-text class="pb-0">
      <v-row align="center" class="ga-2">
        <v-col cols="6" sm="3" md="2">
          <v-select
            v-model="filterCategoria"
            :items="categoriaOptions"
            label="Categoría"
            clearable
            hide-details
            density="compact"
          />
        </v-col>

        <v-col cols="6" sm="4" md="3">
          <v-select
            v-model="filterNombre"
            :items="amenidadesOptions"
            label="Buscar amenidad"
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
            @click="loadAmenidades"
          >
            <v-icon icon="mdi-refresh" />
            <v-tooltip activator="parent" location="bottom">Actualizar</v-tooltip>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>

    <v-data-table
      :headers="headers"
      :items="filteredAmenidades"
      :loading="loading"
      :items-per-page="10"
      hover
      class="amenities-table"
    >
      <template #item.nombre="{ item }">
        <div class="d-flex align-center py-2">
          <v-icon v-if="item.icono" :icon="item.icono" class="mr-2" />
          <div>
            <div class="text-body-2 font-weight-medium">{{ item.nombre }}</div>
            <div v-if="item.descripcion" class="text-caption text-medium-emphasis">
              {{ item.descripcion }}
            </div>
          </div>
        </div>
      </template>

      <template #item.categoria="{ item }">
        <v-chip v-if="item.categoria" size="small" variant="tonal">
          {{ item.categoria }}
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
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>
          {{ editingItem ? 'Editar Amenidad' : 'Nueva Amenidad' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="formData.nombre"
              label="Nombre"
              :rules="[v => !!v || 'El nombre es requerido']"
              required
            />
            <v-text-field
              v-model="formData.icono"
              label="Icono (mdi-*)"
              placeholder="mdi-wifi"
            />
            <v-select
              v-model="formData.categoria"
              :items="categoriaOptions"
              label="Categoría"
            />
            <v-textarea
              v-model="formData.descripcion"
              label="Descripción"
              rows="3"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialog = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="!valid"
            @click="saveAmenidad"
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
          ¿Está seguro de eliminar la amenidad <strong>{{ itemToDelete?.nombre }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn
            color="error"
            :loading="deleting"
            @click="deleteAmenidad"
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
import type { Amenidad, CreateAmenidadDto, UpdateAmenidadDto } from '~/types/api'

const api = useApi()
const { success, error } = useNotification()

const amenidades = ref<Amenidad[]>([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const filterCategoria = ref('')
const filterNombre = ref('')

const dialog = ref(false)
const deleteDialog = ref(false)
const valid = ref(false)
const editingItem = ref<Amenidad | null>(null)
const itemToDelete = ref<Amenidad | null>(null)

const formData = ref<CreateAmenidadDto>({
  nombre: '',
  icono: '',
  categoria: '',
  descripcion: ''
})

const headers = [
  { title: 'Amenidad', key: 'nombre', sortable: true },
  { title: 'Categoría', key: 'categoria', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const }
]

const categoriaOptions = [
  'Servicios básicos',
  'Entretenimiento',
  'Comodidad',
  'Higiene',
  'Tecnología',
  'Otros'
]

const amenidadesOptions = computed(() => {
  return amenidades.value.map(a => a.nombre)
})

const filteredAmenidades = computed(() => {
  let filtered = amenidades.value
  
  if (filterCategoria.value) {
    filtered = filtered.filter(a => a.categoria === filterCategoria.value)
  }
  
  if (filterNombre.value) {
    filtered = filtered.filter(a => a.nombre === filterNombre.value)
  }
  
  return filtered
})

const loadAmenidades = async () => {
  try {
    loading.value = true
    const response = await api.get<Amenidad[]>('/amenidades')
    amenidades.value = response
  } catch (err: any) {
    error(err?.message || 'Error al cargar amenidades')
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editingItem.value = null
  formData.value = {
    nombre: '',
    icono: '',
    categoria: '',
    descripcion: ''
  }
  dialog.value = true
}

const openEditDialog = (item: Amenidad) => {
  editingItem.value = item
  formData.value = {
    nombre: item.nombre,
    icono: item.icono || '',
    categoria: item.categoria || '',
    descripcion: item.descripcion || ''
  }
  dialog.value = true
}

const openDeleteDialog = (item: Amenidad) => {
  itemToDelete.value = item
  deleteDialog.value = true
}

const saveAmenidad = async () => {
  try {
    saving.value = true
    if (editingItem.value) {
      await api.patch<Amenidad>(`/amenidades/${editingItem.value.id}`, formData.value as UpdateAmenidadDto)
      success('Amenidad actualizada correctamente')
    } else {
      await api.post<Amenidad>('/amenidades', formData.value)
      success('Amenidad creada correctamente')
    }
    dialog.value = false
    await loadAmenidades()
  } catch (err: any) {
    error(err?.message || 'Error al guardar amenidad')
  } finally {
    saving.value = false
  }
}

const deleteAmenidad = async () => {
  if (!itemToDelete.value) return
  try {
    deleting.value = true
    await api.del(`/amenidades/${itemToDelete.value.id}`)
    success('Amenidad eliminada correctamente')
    deleteDialog.value = false
    await loadAmenidades()
  } catch (err: any) {
    error(err?.message || 'Error al eliminar amenidad')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadAmenidades()
})
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
