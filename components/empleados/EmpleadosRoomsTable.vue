<template>
  <v-card class="card-glow">
    <v-card-title class="d-flex align-center justify-space-between">
      <span>Gestión de Habitaciones</span>
      <v-btn color="primary" @click="openCreateDialog">
        <v-icon left>mdi-plus</v-icon>
        Nueva Habitación
      </v-btn>
    </v-card-title>

    <v-card-text class="pb-0">
      <v-row align="center" class="ga-2">
        <v-col cols="6" sm="3" md="2">
          <v-select
            v-model="filterEstado"
            :items="estadoOptions"
            label="Estado"
            clearable
            hide-details
            density="compact"
          />
        </v-col>

        <v-col cols="6" sm="3" md="2">
          <v-select
            v-model="filterTipo"
            :items="tiposHabitacion"
            item-title="nombreTipo"
            item-value="id"
            label="Tipo de Habitación"
            clearable
            hide-details
            density="compact"
          />
        </v-col>

        <v-col cols="6" sm="3" md="2">
          <v-select
            v-model="filterNumero"
            :items="habitacionesOptions"
            label="Buscar habitación"
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
            @click="loadHabitaciones"
          >
            <v-icon icon="mdi-refresh" />
            <v-tooltip activator="parent" location="bottom">Actualizar</v-tooltip>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>

    <v-data-table
      :headers="headers"
      :items="filteredHabitaciones"
      :loading="loading"
      :items-per-page="10"
      hover
      class="rooms-table"
    >
      <template #item.numeroHabitacion="{ item }">
        <div class="py-2">
          <div class="text-body-2 font-weight-medium">
            <v-icon left size="small">mdi-door</v-icon>
            Habitación {{ item.numeroHabitacion }}
          </div>
          <div v-if="item.piso" class="text-caption text-medium-emphasis">
            Piso {{ item.piso }}
          </div>
        </div>
      </template>

      <template #item.imagenes="{ item }">
        <div v-if="item.imagenes && item.imagenes.trim()" class="py-2">
          <div class="d-flex gap-2">
            <v-img
              v-for="(img, idx) in getImagenesArray(item.imagenes).slice(0, 2)"
              :key="idx"
              :src="img"
              width="50"
              height="50"
              class="cursor-pointer rounded"
              @click="openImageGallery(item)"
            />
            <v-chip
              v-if="getImagenesArray(item.imagenes).length > 2"
              size="small"
              variant="tonal"
              class="cursor-pointer"
              @click="openImageGallery(item)"
            >
              +{{ getImagenesArray(item.imagenes).length - 2 }}
            </v-chip>
          </div>
        </div>
        <span v-else class="text-caption text-medium-emphasis">Sin imágenes</span>
      </template>

      <template #item.tipoHabitacion="{ item }">
        <div v-if="item.tipoHabitacion" class="py-2">
          <div class="text-body-2 font-weight-medium">
            {{ item.tipoHabitacion.nombreTipo }}
          </div>
          <div class="text-caption text-medium-emphasis">
            <v-icon size="x-small">mdi-account-multiple</v-icon>
            {{ item.tipoHabitacion.capacidadPersonas }} personas
            <span v-if="item.tipoHabitacion.precioBase" class="ml-2">
              | ${{ Number(item.tipoHabitacion.precioBase).toLocaleString() }}
            </span>
          </div>
        </div>
      </template>

      <template #item.amenidades="{ item }">
        <div v-if="item.tipoHabitacion?.amenidades && item.tipoHabitacion.amenidades.length > 0">
          <v-chip
            v-for="amenidad in item.tipoHabitacion.amenidades.slice(0, 3)"
            :key="amenidad.id"
            size="x-small"
            class="mr-1 mb-1"
            variant="tonal"
          >
            <v-icon v-if="amenidad.icono" :icon="amenidad.icono" size="x-small" start />
            {{ amenidad.nombre }}
          </v-chip>
          <v-tooltip v-if="item.tipoHabitacion.amenidades.length > 3" location="bottom">
            <template #activator="{ props }">
              <v-chip v-bind="props" size="x-small" variant="tonal">
                +{{ item.tipoHabitacion.amenidades.length - 3 }}
              </v-chip>
            </template>
            <div>
              <div v-for="amenidad in item.tipoHabitacion.amenidades.slice(3)" :key="amenidad.id">
                {{ amenidad.nombre }}
              </div>
            </div>
          </v-tooltip>
        </div>
        <span v-else class="text-caption text-medium-emphasis">Sin amenidades</span>
      </template>

      <template #item.estado="{ item }">
        <v-chip
          :color="getEstadoColor(item.estado)"
          size="small"
          variant="tonal"
        >
          {{ item.estado || 'disponible' }}
        </v-chip>
      </template>

      <template #item.actions="{ item }">
        <v-btn
          icon="mdi-image-plus"
          variant="text"
          size="small"
          @click="openUploadImagesDialog(item)"
        >
          <v-icon>mdi-image-plus</v-icon>
          <v-tooltip activator="parent" location="bottom">Subir imágenes</v-tooltip>
        </v-btn>
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
          {{ editingItem ? 'Editar Habitación' : 'Nueva Habitación' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.numeroHabitacion"
                  label="Número de Habitación"
                  :rules="[v => !!v || 'El número es requerido']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.piso"
                  label="Piso"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="formData.idTipoHabitacion"
                  :items="tiposHabitacion"
                  item-title="nombreTipo"
                  item-value="id"
                  label="Tipo de Habitación"
                  :rules="[v => !!v || 'El tipo es requerido']"
                  required
                >
                  <template #item="{ item, props }">
                    <v-list-item v-bind="props">
                      <template #subtitle>
                        <div class="text-caption">
                          Capacidad: {{ item.raw.capacidadPersonas }} personas
                          <span v-if="item.raw.precioBase">
                            | ${{ Number(item.raw.precioBase).toLocaleString() }}
                          </span>
                        </div>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="formData.estado"
                  :items="estadoOptions"
                  label="Estado"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.imagenes"
                  label="URLs de imágenes"
                  hint="Ingresa las URLs separadas por comas"
                  placeholder="https://url1.jpg,https://url2.jpg"
                  persistent-hint
                  rows="3"
                  auto-grow
                  type="textarea"
                />
                <div v-if="getImagenesArray(formData.imagenes).length > 0" class="mt-3">
                  <div class="text-caption font-weight-medium mb-2">Vista previa:</div>
                  <div class="d-flex gap-2 flex-wrap">
                    <div v-for="(img, idx) in getImagenesArray(formData.imagenes)" :key="idx" class="position-relative">
                      <v-img
                        :src="img"
                        width="80"
                        height="80"
                        class="rounded"
                      />
                      <v-btn
                        icon="mdi-close"
                        size="x-small"
                        variant="flat"
                        color="error"
                        class="position-absolute"
                        style="top: -8px; right: -8px;"
                        @click="removeImage(idx)"
                      />
                    </div>
                  </div>
                </div>
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
            @click="saveHabitacion"
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
          ¿Está seguro de eliminar la habitación <strong>{{ itemToDelete?.numeroHabitacion }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn
            color="error"
            :loading="deleting"
            @click="deleteHabitacion"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para galería de imágenes -->
    <v-dialog v-model="galleryDialog" max-width="800">
      <v-card>
        <v-card-title>{{ galleryTitle }}</v-card-title>
        <v-card-text>
          <v-carousel
            v-if="galleryImages.length > 0"
            height="500"
            hide-delimiters
            show-arrows="always"
            class="rounded"
          >
            <v-carousel-item v-for="(img, idx) in galleryImages" :key="idx">
              <v-img :src="img" height="100%" cover />
            </v-carousel-item>
          </v-carousel>
          <div v-else class="text-center py-16">
            <v-icon size="48" class="mb-4">mdi-image-off</v-icon>
            <p class="text-medium-emphasis">No hay imágenes disponibles</p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="galleryDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para subir imágenes -->
    <v-dialog v-model="uploadDialog" max-width="600" persistent>
      <v-card>
        <v-card-title>
          Subir Imágenes - Habitación {{ uploadingHabitacion?.numeroHabitacion }}
        </v-card-title>
        <v-card-text class="pt-6">
          <v-file-input
            v-model="uploadFiles"
            multiple
            accept="image/*"
            show-size
            counter
            label="Seleccionar imágenes"
            prepend-icon="mdi-camera"
            hint="Máximo 5 imágenes. Formatos: JPG, PNG, WebP, GIF"
            persistent-hint
            @update:model-value="onFilesSelected"
          />
          
          <!-- Vista previa de imágenes seleccionadas -->
          <div v-if="uploadFilesPreviews.length > 0" class="mt-6">
            <div class="text-subtitle-2 font-weight-medium mb-3">Vista previa:</div>
            <div class="d-flex gap-3 flex-wrap">
              <div v-for="(preview, idx) in uploadFilesPreviews" :key="idx" class="position-relative">
                <v-img
                  :src="preview"
                  width="100"
                  height="100"
                  class="rounded border"
                />
                <v-btn
                  icon="mdi-close"
                  size="x-small"
                  variant="flat"
                  color="error"
                  class="position-absolute"
                  style="top: -8px; right: -8px;"
                  @click="removeUploadFile(idx)"
                />
              </div>
            </div>
          </div>

          <!-- Imágenes existentes -->
          <div v-if="uploadingHabitacion?.imagenes && getImagenesArray(uploadingHabitacion.imagenes).length > 0" class="mt-6">
            <div class="text-subtitle-2 font-weight-medium mb-3">Imágenes actuales:</div>
            <div class="d-flex gap-2 flex-wrap">
              <div v-for="(img, idx) in getImagenesArray(uploadingHabitacion.imagenes)" :key="idx" class="position-relative">
                <v-img
                  :src="img"
                  width="100"
                  height="100"
                  class="rounded border"
                />
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="cancelUpload" :disabled="uploading">Cancelar</v-btn>
          <v-btn
            color="primary"
            :loading="uploading"
            :disabled="uploadFiles.length === 0"
            @click="uploadImages"
          >
            <v-icon start>mdi-cloud-upload</v-icon>
            Subir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Habitacion, TipoHabitacion, CreateHabitacionDto, UpdateHabitacionDto } from '~/types/api'

const api = useApi()
const { success, error } = useNotification()

const habitaciones = ref<Habitacion[]>([])
const tiposHabitacion = ref<TipoHabitacion[]>([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const filterEstado = ref('')
const filterTipo = ref<number | null>(null)
const filterNumero = ref('')

const dialog = ref(false)
const deleteDialog = ref(false)
const galleryDialog = ref(false)
const uploadDialog = ref(false)
const galleryImages = ref<string[]>([])
const galleryTitle = ref('')
const valid = ref(false)
const editingItem = ref<Habitacion | null>(null)
const itemToDelete = ref<Habitacion | null>(null)
const uploadingHabitacion = ref<Habitacion | null>(null)
const uploadFiles = ref<File[]>([])
const uploadFilesPreviews = ref<string[]>([])
const uploading = ref(false)

const formData = ref<CreateHabitacionDto>({
  idHotel: 1,
  numeroHabitacion: '',
  piso: '',
  estado: 'disponible',
  idTipoHabitacion: 0,
  imagenes: ''
})

const headers = [
  { title: 'Habitación', key: 'numeroHabitacion', sortable: true },
  { title: 'Tipo', key: 'tipoHabitacion', sortable: false },
  { title: 'Imágenes', key: 'imagenes', sortable: false },
  { title: 'Amenidades', key: 'amenidades', sortable: false },
  { title: 'Estado', key: 'estado', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const }
]

const estadoOptions = [
  'disponible',
  'ocupada',
  'mantenimiento',
  'limpieza',
  'reservada'
]

const habitacionesOptions = computed(() => {
  return habitaciones.value.map(h => h.numeroHabitacion)
})

const filteredHabitaciones = computed(() => {
  let filtered = habitaciones.value
  
  if (filterEstado.value) {
    filtered = filtered.filter(h => h.estado === filterEstado.value)
  }
  
  if (filterTipo.value) {
    filtered = filtered.filter(h => h.idTipoHabitacion === filterTipo.value)
  }
  
  if (filterNumero.value) {
    filtered = filtered.filter(h => h.numeroHabitacion === filterNumero.value)
  }
  
  return filtered
})

const getEstadoColor = (estado?: string) => {
  const estados: Record<string, string> = {
    'disponible': 'success',
    'ocupada': 'error',
    'mantenimiento': 'warning',
    'limpieza': 'info',
    'reservada': 'primary'
  }
  return estados[estado || 'disponible'] || 'grey'
}

const loadHabitaciones = async () => {
  try {
    loading.value = true
    const response = await api.get<Habitacion[]>('/habitaciones')
    habitaciones.value = response
  } catch (err: any) {
    error(err?.message || 'Error al cargar habitaciones')
  } finally {
    loading.value = false
  }
}

const loadTiposHabitacion = async () => {
  try {
    const response = await api.get<TipoHabitacion[]>('/tipos-habitacion')
    tiposHabitacion.value = response
  } catch (err: any) {
    error(err?.message || 'Error al cargar tipos de habitación')
  }
}

const openCreateDialog = () => {
  editingItem.value = null
  formData.value = {
    idHotel: 1,
    numeroHabitacion: '',
    piso: '',
    estado: 'disponible',
    idTipoHabitacion: 0,
    imagenes: ''
  }
  dialog.value = true
}

const openEditDialog = (item: Habitacion) => {
  editingItem.value = item
  formData.value = {
    idHotel: item.idHotel,
    numeroHabitacion: item.numeroHabitacion,
    piso: item.piso || '',
    estado: item.estado || 'disponible',
    idTipoHabitacion: item.idTipoHabitacion,
    imagenes: item.imagenes || ''
  }
  dialog.value = true
}

const openDeleteDialog = (item: Habitacion) => {
  itemToDelete.value = item
  deleteDialog.value = true
}

const getImagenesArray = (imagenes?: string): string[] => {
  if (!imagenes || !imagenes.trim()) return []
  return imagenes.split(',').map(img => img.trim()).filter(img => img)
}

const openImageGallery = (item: Habitacion) => {
  galleryImages.value = getImagenesArray(item.imagenes)
  galleryTitle.value = `Habitación ${item.numeroHabitacion}`
  galleryDialog.value = true
}

const removeImage = (idx: number) => {
  const images = getImagenesArray(formData.value.imagenes)
  images.splice(idx, 1)
  formData.value.imagenes = images.join(',')
}

const saveHabitacion = async () => {
  try {
    saving.value = true
    
    // Asegurar que los IDs sean números
    const dataToSend = {
      ...formData.value,
      idHotel: Number(formData.value.idHotel),
      idTipoHabitacion: Number(formData.value.idTipoHabitacion)
    }
    
    if (editingItem.value) {
      await api.patch<Habitacion>(`/habitaciones/${editingItem.value.id}`, dataToSend as UpdateHabitacionDto)
      success('Habitación actualizada correctamente')
    } else {
      await api.post<Habitacion>('/habitaciones', dataToSend)
      success('Habitación creada correctamente')
    }
    dialog.value = false
    await loadHabitaciones()
  } catch (err: any) {
    error(err?.message || 'Error al guardar habitación')
  } finally {
    saving.value = false
  }
}

const deleteHabitacion = async () => {
  if (!itemToDelete.value) return
  try {
    deleting.value = true
    await api.del(`/habitaciones/${itemToDelete.value.id}`)
    success('Habitación eliminada correctamente')
    deleteDialog.value = false
    await loadHabitaciones()
  } catch (err: any) {
    error(err?.message || 'Error al eliminar habitación')
  } finally {
    deleting.value = false
  }
}

const openUploadImagesDialog = (item: Habitacion) => {
  uploadingHabitacion.value = item
  uploadFiles.value = []
  uploadFilesPreviews.value = []
  uploadDialog.value = true
}

const onFilesSelected = async () => {
  uploadFilesPreviews.value = []
  for (const file of uploadFiles.value) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        uploadFilesPreviews.value.push(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }
}

const removeUploadFile = (idx: number) => {
  uploadFiles.value.splice(idx, 1)
  uploadFilesPreviews.value.splice(idx, 1)
}

const uploadImages = async () => {
  if (!uploadingHabitacion.value || uploadFiles.value.length === 0) return
  
  try {
    uploading.value = true
    
    // Crear FormData para multipart
    const formData = new FormData()
    uploadFiles.value.forEach(file => {
      formData.append('imagenes', file)
    })
    
    // Llamar al endpoint de upload
    await api.patch<Habitacion>(
      `/habitaciones/${uploadingHabitacion.value.id}/imagenes`,
      formData
    )
    
    success(`${uploadFiles.value.length} imagen(es) subida(s) correctamente`)
    uploadDialog.value = false
    await loadHabitaciones()
  } catch (err: any) {
    error(err?.message || 'Error al subir imágenes')
  } finally {
    uploading.value = false
  }
}

const cancelUpload = () => {
  uploadDialog.value = false
  uploadFiles.value = []
  uploadFilesPreviews.value = []
  uploadingHabitacion.value = null
}

onMounted(() => {
  loadHabitaciones()
  loadTiposHabitacion()
})
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
