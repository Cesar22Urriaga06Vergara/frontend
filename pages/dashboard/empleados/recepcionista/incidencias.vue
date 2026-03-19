<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Gestión de Incidencias</h1>
        <p class="text-body-2 text-medium-emphasis">
          Registra y gestiona los problemas reportados en las habitaciones
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="abrirDialogNuevaIncidencia"
      >
        Nueva Incidencia
      </v-btn>
    </div>

    <!-- Filtros -->
    <v-card class="card-glow mb-6 pa-4">
      <v-row>
        <v-col cols="12" sm="6">
          <v-select
            v-model="filtros.estado"
            label="Estado"
            :items="estados"
            item-title="label"
            item-value="value"
            clearable
            multiple
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-select
            v-model="filtros.categoria"
            label="Categoría"
            :items="categorias"
            item-title="label"
            item-value="value"
            clearable
            multiple
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Tabla de incidencias -->
    <v-card class="card-glow">
      <v-card-title class="text-subtitle-1 font-weight-bold">
        Incidencias Registradas
        <v-spacer />
        <v-chip size="small">{{ incidenciasFiltradasCount }}</v-chip>
      </v-card-title>
      <v-divider />

      <v-data-table
        :headers="headers"
        :items="incidenciasFiltradasCount > 0 ? incidenciasFiltradas : []"
        :loading="loading"
        class="elevation-0"
        no-data-text="No hay incidencias para mostrar"
        items-per-page="10"
      >
        <!-- ID -->
        <template #item.id="{ item }">
          <v-chip size="small" variant="outlined">
            #{{ item.id }}
          </v-chip>
        </template>

        <!-- Habitación -->
        <template #item.numeroHabitacion="{ item }">
          <div class="d-flex align-center ga-2">
            <v-icon icon="mdi-door" size="18" color="primary" />
            <span class="font-weight-bold">{{ item.numeroHabitacion }}</span>
          </div>
        </template>

        <!-- Categoría -->
        <template #item.categoria="{ item }">
          <v-chip
            :color="getCategoriaColor(item.categoria)"
            variant="tonal"
            size="small"
          >
            {{ formatearCategoria(item.categoria) }}
          </v-chip>
        </template>

        <!-- Descripción -->
        <template #item.descripcion="{ item }">
          <div class="text-truncate" style="max-width: 300px">
            <v-tooltip location="bottom">
              <template #default>
                {{ item.descripcion }}
              </template>
              <template #activator="{ props }">
                <span v-bind="props">{{ item.descripcion }}</span>
              </template>
            </v-tooltip>
          </div>
        </template>

        <!-- Estado -->
        <template #item.estado="{ item }">
          <v-chip
            :color="getEstadoColor(item.estado)"
            variant="tonal"
            size="small"
          >
            {{ formatearEstado(item.estado) }}
          </v-chip>
        </template>

        <!-- Prioridad -->
        <template #item.prioridad="{ item }">
          <v-icon
            :icon="getPrioridadIcon(item.prioridad)"
            :color="getPrioridadColor(item.prioridad)"
          />
          <span class="ml-2 text-caption">{{ formatearPrioridad(item.prioridad) }}</span>
        </template>

        <!-- Fecha -->
        <template #item.fechaReporte="{ item }">
          <span class="text-caption">
            {{ new Date(item.fechaReporte).toLocaleString('es-CO') }}
          </span>
        </template>

        <!-- Asignado a -->
        <template #item.empleadoAsignado="{ item }">
          <v-chip
            v-if="item.empleadoAsignado"
            size="small"
            variant="outlined"
          >
            {{ item.empleadoAsignado.nombre }}
          </v-chip>
          <span v-else class="text-caption text-medium-emphasis">Sin asignar</span>
        </template>

        <!-- Acciones -->
        <template #item.acciones="{ item }">
          <div class="d-flex gap-2">
            <v-btn
              icon="mdi-eye-outline"
              size="small"
              variant="text"
              @click="abrirDialogDetalles(item)"
            />
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              @click="abrirDialogEditar(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="eliminarIncidencia(item.id)"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog: Nueva/Editar Incidencia -->
    <v-dialog v-model="dialogIncidencia" max-width="600" persistent>
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold">
          {{ modoEdicion ? 'Editar Incidencia' : 'Nueva Incidencia' }}
        </v-card-title>
        <v-divider />

        <v-card-text class="pa-6">
          <!-- Habitación -->
          <v-select
            v-model="formulario.numeroHabitacion"
            label="Habitación"
            :items="habitacionesDisponibles"
            item-title="text"
            item-value="value"
            :disabled="modoEdicion"
            class="mb-4"
            :rules="[v => !!v || 'Selecciona una habitación']"
          />

          <!-- Categoría -->
          <v-select
            v-model="formulario.categoria"
            label="Categoría"
            :items="categorias"
            item-title="label"
            item-value="value"
            class="mb-4"
            :rules="[v => !!v || 'Selecciona una categoría']"
          />

          <!-- Prioridad -->
          <v-select
            v-model="formulario.prioridad"
            label="Prioridad"
            :items="prioridades"
            item-title="label"
            item-value="value"
            class="mb-4"
            :rules="[v => !!v || 'Selecciona una prioridad']"
          />

          <!-- Descripción -->
          <v-textarea
            v-model="formulario.descripcion"
            label="Descripción del Problema"
            placeholder="Describe el problema en detalle..."
            rows="4"
            counter="500"
            class="mb-4"
            :rules="[
              v => !!v || 'La descripción es requerida',
              v => v?.length <= 500 || 'Máximo 500 caracteres'
            ]"
          />

          <!-- Empleado Asignado -->
          <v-select
            v-model="formulario.idEmpleadoAsignado"
            label="Asignar a (Opcional)"
            :items="empleadosDisponibles"
            item-title="nombre"
            item-value="id"
            clearable
            class="mb-4"
          />

          <!-- Estado (solo en edición) -->
          <v-select
            v-if="modoEdicion"
            v-model="formulario.estado"
            label="Estado"
            :items="estados"
            item-title="label"
            item-value="value"
            class="mb-4"
          />

          <!-- Notas del Técnico -->
          <v-textarea
            v-if="modoEdicion"
            v-model="formulario.notasTecnico"
            label="Notas del Técnico"
            placeholder="Agrega notas sobre la reparación/revisión..."
            rows="3"
            counter="300"
            :rules="[v => !v || v.length <= 300 || 'Máximo 300 caracteres']"
          />
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-4">
          <v-btn variant="text" @click="dialogIncidencia = false">
            Cancelar
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            :loading="cargandoFormulario"
            @click="guardarIncidencia"
          >
            {{ modoEdicion ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: Ver Detalles -->
    <v-dialog v-model="dialogDetalles" max-width="600">
      <v-card v-if="incidenciaSeleccionada" rounded="xl">
        <v-card-title class="text-h6 font-weight-bold">
          Detalles de la Incidencia #{{ incidenciaSeleccionada.id }}
        </v-card-title>
        <v-divider />

        <v-card-text class="pa-6">
          <!-- Habitación -->
          <v-row class="mb-4">
            <v-col cols="6">
              <p class="text-caption text-medium-emphasis mb-1">Habitación</p>
              <v-chip color="primary" variant="tonal" size="small">
                {{ incidenciaSeleccionada.numeroHabitacion }}
              </v-chip>
            </v-col>
            <v-col cols="6">
              <p class="text-caption text-medium-emphasis mb-1">Categoría</p>
              <v-chip
                :color="getCategoriaColor(incidenciaSeleccionada.categoria)"
                variant="tonal"
                size="small"
              >
                {{ formatearCategoria(incidenciaSeleccionada.categoria) }}
              </v-chip>
            </v-col>
          </v-row>

          <!-- Estado y Prioridad -->
          <v-row class="mb-4">
            <v-col cols="6">
              <p class="text-caption text-medium-emphasis mb-1">Estado</p>
              <v-chip
                :color="getEstadoColor(incidenciaSeleccionada.estado)"
                variant="tonal"
                size="small"
              >
                {{ formatearEstado(incidenciaSeleccionada.estado) }}
              </v-chip>
            </v-col>
            <v-col cols="6">
              <p class="text-caption text-medium-emphasis mb-1">Prioridad</p>
              <v-chip
                :color="getPrioridadColor(incidenciaSeleccionada.prioridad)"
                variant="tonal"
                size="small"
              >
                {{ formatearPrioridad(incidenciaSeleccionada.prioridad) }}
              </v-chip>
            </v-col>
          </v-row>

          <!-- Fechas -->
          <v-row class="mb-4">
            <v-col cols="6">
              <p class="text-caption text-medium-emphasis mb-1">Fecha Reporte</p>
              <p class="text-body-2 font-weight-bold">
                {{ new Date(incidenciaSeleccionada.fechaReporte).toLocaleString('es-CO') }}
              </p>
            </v-col>
            <v-col v-if="incidenciaSeleccionada.fechaResolucion" cols="6">
              <p class="text-caption text-medium-emphasis mb-1">Fecha Resolución</p>
              <p class="text-body-2 font-weight-bold">
                {{ new Date(incidenciaSeleccionada.fechaResolucion).toLocaleString('es-CO') }}
              </p>
            </v-col>
          </v-row>

          <!-- Descripción -->
          <div class="mb-4">
            <p class="text-caption text-medium-emphasis mb-2">Descripción</p>
            <v-card variant="outlined">
              <v-card-text class="pa-3 text-body-2">
                {{ incidenciaSeleccionada.descripcion }}
              </v-card-text>
            </v-card>
          </div>

          <!-- Notas del Técnico -->
          <div v-if="incidenciaSeleccionada.notasTecnico" class="mb-4">
            <p class="text-caption text-medium-emphasis mb-2">Notas del Técnico</p>
            <v-card variant="outlined" color="info">
              <v-card-text class="pa-3 text-body-2">
                {{ incidenciaSeleccionada.notasTecnico }}
              </v-card-text>
            </v-card>
          </div>

          <!-- Empleado Asignado -->
          <div v-if="incidenciaSeleccionada.empleadoAsignado">
            <p class="text-caption text-medium-emphasis mb-2">Asignado a</p>
            <v-chip size="small" variant="outlined">
              {{ incidenciaSeleccionada.empleadoAsignado.nombre }}
            </v-chip>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn color="primary" variant="text" @click="dialogDetalles = false">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useNotification } from '~/composables/useNotification'
import { useAuthStore } from '~/stores/auth'
import { UserRole } from '~/types/auth'

// ── Types ──
interface Incidencia {
  id: number
  numeroHabitacion: string
  categoria: string
  prioridad: string
  descripcion: string
  estado: string
  fechaReporte: Date | string
  idEmpleadoAsignado: number | null
  empleadoAsignado?: { nombre: string }
  notasTecnico?: string
  fechaResolucion?: Date | string
}

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.RECEPCIONISTA, UserRole.ADMIN],
})

useHead({ title: 'Gestión de Incidencias' })

const authStore = useAuthStore()
const notification = useNotification()

// ── State ──
const loading = ref(false)
const cargandoFormulario = ref(false)
const incidencias = ref<Incidencia[]>([])
const dialogIncidencia = ref(false)
const dialogDetalles = ref(false)
const modoEdicion = ref(false)
const incidenciaSeleccionada = ref<Incidencia | null>(null)

const filtros = ref({
  estado: [] as string[],
  categoria: [] as string[],
})

const formulario = ref({
  id: 0 as number,
  numeroHabitacion: '',
  categoria: '',
  prioridad: 'media',
  descripcion: '',
  idEmpleadoAsignado: null as number | null,
  estado: 'abierta',
  notasTecnico: '',
})

// ── Opciones estáticas ──
const estados = [
  { label: 'Abierta', value: 'abierta' },
  { label: 'En Progreso', value: 'en_progreso' },
  { label: 'Resuelta', value: 'resuelta' },
  { label: 'Cerrada', value: 'cerrada' },
  { label: 'Cancelada', value: 'cancelada' },
]

const categorias = [
  { label: 'Limpieza', value: 'limpieza' },
  { label: 'Mantenimiento', value: 'mantenimiento' },
  { label: 'Electricidad', value: 'electricidad' },
  { label: 'Plomería', value: 'plomeria' },
  { label: 'Aire Acondicionado', value: 'aire_acondicionado' },
  { label: 'Muebles', value: 'muebles' },
  { label: 'Ruido', value: 'ruido' },
  { label: 'Seguridad', value: 'seguridad' },
  { label: 'Otro', value: 'otro' },
]

const prioridades = [
  { label: 'Baja', value: 'baja' },
  { label: 'Media', value: 'media' },
  { label: 'Alta', value: 'alta' },
  { label: 'Urgente', value: 'urgente' },
]

// ── Datos simulados ──
const habitacionesDisponibles = [
  { value: '101', text: 'Habitación 101' },
  { value: '102', text: 'Habitación 102' },
  { value: '103', text: 'Habitación 103' },
  { value: '201', text: 'Habitación 201' },
  { value: '202', text: 'Habitación 202' },
]

const empleadosDisponibles = [
  { id: 1, nombre: 'Carlos Mantenimiento' },
  { id: 2, nombre: 'Ana Limpieza' },
  { id: 3, nombre: 'Roberto Plomería' },
]

// ── Computed ──
const headers = [
  { title: 'ID', key: 'id', width: 60 },
  { title: 'Habitación', key: 'numeroHabitacion', width: 100 },
  { title: 'Categoría', key: 'categoria', width: 130 },
  { title: 'Descripción', key: 'descripcion', width: 250 },
  { title: 'Estado', key: 'estado', width: 100 },
  { title: 'Prioridad', key: 'prioridad', width: 90 },
  { title: 'Fecha Reporte', key: 'fechaReporte', width: 160 },
  { title: 'Asignado a', key: 'empleadoAsignado', width: 150 },
  { title: 'Acciones', key: 'acciones', width: 100 },
]

const incidenciasFiltradas = computed(() => {
  return incidencias.value.filter(inc => {
    const estadoMatch = filtros.value.estado.length === 0 || filtros.value.estado.includes(inc.estado)
    const categoriaMatch = filtros.value.categoria.length === 0 || filtros.value.categoria.includes(inc.categoria)
    return estadoMatch && categoriaMatch
  })
})

const incidenciasFiltradasCount = computed(() => incidenciasFiltradas.value.length)

// ── Lifecycle ──
onMounted(() => {
  cargarIncidencias()
})

// ── Métodos ──
const cargarIncidencias = async () => {
  loading.value = true
  try {
    // TODO: Traer datos del backend
    // const res = await fetch(`/api/incidencias?idHotel=${authStore.user?.idHotel}`)
    // incidencias.value = await res.json()

    // Datos simulados para demostración
    incidencias.value = [
      {
        id: 1,
        numeroHabitacion: '101',
        categoria: 'limpieza',
        descripcion: 'Baño sucio en la ducha',
        estado: 'abierta',
        prioridad: 'media',
        fechaReporte: new Date(),
        idEmpleadoAsignado: 2,
        empleadoAsignado: { nombre: 'Ana Limpieza' },
        notasTecnico: '',
      },
      {
        id: 2,
        numeroHabitacion: '202',
        categoria: 'electricidad',
        descripcion: 'Lámpara no enciende',
        estado: 'en_progreso',
        prioridad: 'alta',
        fechaReporte: new Date(Date.now() - 86400000),
        idEmpleadoAsignado: 1,
        empleadoAsignado: { nombre: 'Carlos Mantenimiento' },
        notasTecnico: 'Revisando instalación',
      },
      {
        id: 3,
        numeroHabitacion: '103',
        categoria: 'plomeria',
        descripcion: 'Grifo gotea constantemente',
        estado: 'resuelta',
        prioridad: 'media',
        fechaReporte: new Date(Date.now() - 172800000),
        fechaResolucion: new Date(Date.now() - 86400000),
        idEmpleadoAsignado: 3,
        empleadoAsignado: { nombre: 'Roberto Plomería' },
        notasTecnico: 'Cambio de empaque del grifo',
      },
    ]
    notification.success(`${incidencias.value.length} incidencias cargadas`)
  } catch (error: any) {
    notification.error('Error al cargar incidencias')
  } finally {
    loading.value = false
  }
}

const abrirDialogNuevaIncidencia = () => {
  modoEdicion.value = false
  formulario.value = {
    id: 0,
    numeroHabitacion: '',
    categoria: '',
    prioridad: 'media',
    descripcion: '',
    idEmpleadoAsignado: null,
    estado: 'abierta',
    notasTecnico: '',
  }
  dialogIncidencia.value = true
}

const abrirDialogEditar = (incidencia: Incidencia) => {
  modoEdicion.value = true
  formulario.value = { ...incidencia }
  dialogIncidencia.value = true
}

const abrirDialogDetalles = (incidencia: Incidencia) => {
  incidenciaSeleccionada.value = incidencia
  dialogDetalles.value = true
}

const guardarIncidencia = async () => {
  cargandoFormulario.value = true
  try {
    // TODO: Llamar al backend para guardar
    if (modoEdicion.value) {
      // Actualizar
      const idx = incidencias.value.findIndex(i => i.id === formulario.value.id)
      if (idx !== -1) {
        const nuevaIncidencia: Incidencia = {
          ...formulario.value,
          id: formulario.value.id,
        }
        incidencias.value[idx] = nuevaIncidencia
      }
      notification.success('Incidencia actualizada exitosamente')
    } else {
      // Crear nueva
      const nuevaIncidencia: Incidencia = {
        id: Math.max(...incidencias.value.map(i => i.id), 0) + 1,
        numeroHabitacion: formulario.value.numeroHabitacion,
        categoria: formulario.value.categoria,
        prioridad: formulario.value.prioridad,
        descripcion: formulario.value.descripcion,
        idEmpleadoAsignado: formulario.value.idEmpleadoAsignado,
        estado: formulario.value.estado,
        notasTecnico: formulario.value.notasTecnico,
        fechaReporte: new Date(),
      }
      incidencias.value.push(nuevaIncidencia)
      notification.success('Incidencia creada exitosamente')
    }
    dialogIncidencia.value = false
  } catch (error: any) {
    notification.error('Error al guardar incidencia')
  } finally {
    cargandoFormulario.value = false
  }
}

const eliminarIncidencia = async (id: number) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta incidencia?')) return

  try {
    // TODO: Llamar al backend para eliminar
    incidencias.value = incidencias.value.filter(i => i.id !== id)
    notification.success('Incidencia eliminada')
  } catch (error: any) {
    notification.error('Error al eliminar incidencia')
  }
}

// ── Helpers ──
const formatearCategoria = (cat: string): string => {
  const map: Record<string, string> = {
    limpieza: '🧹 Limpieza',
    mantenimiento: '🔧 Mantenimiento',
    electricidad: '⚡ Electricidad',
    plomeria: '🔧 Plomería',
    aire_acondicionado: '❄️ Aire Acondicionado',
    muebles: '🪑 Muebles',
    ruido: '🔊 Ruido',
    seguridad: '🔒 Seguridad',
    otro: '📋 Otro',
  }
  return map[cat] || cat
}

const formatearEstado = (estado: string): string => {
  const map: Record<string, string> = {
    abierta: 'Abierta',
    en_progreso: 'En Progreso',
    resuelta: 'Resuelta',
    cerrada: 'Cerrada',
    cancelada: 'Cancelada',
  }
  return map[estado] || estado
}

const formatearPrioridad = (prioridad: string): string => {
  return prioridad.charAt(0).toUpperCase() + prioridad.slice(1)
}

const getCategoriaColor = (cat: string): string => {
  const colors: Record<string, string> = {
    limpieza: 'info',
    mantenimiento: 'warning',
    electricidad: 'error',
    plomeria: 'info',
    aire_acondicionado: 'success',
    muebles: 'secondary',
    ruido: 'warning',
    seguridad: 'error',
    otro: 'grey',
  }
  return colors[cat] || 'grey'
}

const getEstadoColor = (estado: string): string => {
  const colors: Record<string, string> = {
    abierta: 'error',
    en_progreso: 'warning',
    resuelta: 'success',
    cerrada: 'info',
    cancelada: 'grey',
  }
  return colors[estado] || 'grey'
}

const getPrioridadColor = (prioridad: string): string => {
  const colors: Record<string, string> = {
    baja: 'success',
    media: 'warning',
    alta: 'warning',
    urgente: 'error',
  }
  return colors[prioridad] || 'grey'
}

const getPrioridadIcon = (prioridad: string): string => {
  const icons: Record<string, string> = {
    baja: 'mdi-arrow-down',
    media: 'mdi-minus',
    alta: 'mdi-arrow-up',
    urgente: 'mdi-alert-circle',
  }
  return icons[prioridad] || 'mdi-help'
}
</script>
