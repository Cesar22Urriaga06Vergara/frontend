<template>
  <div class="pa-4">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold mb-1">Gestión de Incidencias</h1>
      <p class="text-body-2 text-medium-emphasis">Crear y gestionar incidencias de habitaciones</p>
    </div>

    <!-- Botón crear incidencia -->
    <div class="mb-6">
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="abrirDialogoCrear"
      >
        Crear Incidencia
      </v-btn>
    </div>

    <!-- Filtros -->
    <v-card class="mb-6" variant="outlined">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filtros.estado"
              label="Estado"
              :items="estadosIncidencia"
              item-title="label"
              item-value="value"
              clearable
              @update:model-value="cargarIncidencias"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filtros.areaAsignada"
              label="Área"
              :items="areas"
              item-title="label"
              item-value="value"
              clearable
              @update:model-value="cargarIncidencias"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filtros.prioridad"
              label="Prioridad"
              :items="prioridades"
              item-title="label"
              item-value="value"
              clearable
              @update:model-value="cargarIncidencias"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-btn
              color="secondary"
              variant="text"
              @click="limpiarFiltros"
            >
              Limpiar Filtros
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Loading -->
    <div v-if="composable.loading.value" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" :size="60" />
      <p class="text-center mt-4 text-medium-emphasis">Cargando incidencias...</p>
    </div>

    <!-- Table -->
    <div v-else>
      <v-data-table
        :headers="headers"
        :items="composable.incidencias.value"
        :loading="composable.loading.value"
        class="elevation-1"
        no-data-text="No hay incidencias registradas"
      >
        <template #item.estado="{ item }">
          <v-chip
            :color="colorEstado(item.estado)"
            text-color="white"
            size="small"
          >
            {{ labelEstado(item.estado) }}
          </v-chip>
        </template>

        <template #item.prioridad="{ item }">
          <v-chip
            :color="colorPrioridad(item.prioridad)"
            text-color="white"
            size="small"
          >
            {{ item.prioridad }}
          </v-chip>
        </template>

        <template #item.acciones="{ item }">
          <v-btn
            icon
            size="small"
            variant="text"
            @click="abrirDetalle(item)"
          >
            <v-icon>mdi-eye</v-icon>
            <v-tooltip activator="parent">Ver Detalles</v-tooltip>
          </v-btn>
          <v-btn
            icon
            size="small"
            variant="text"
            @click="abrirEditar(item)"
          >
            <v-icon>mdi-pencil</v-icon>
            <v-tooltip activator="parent">Editar</v-tooltip>
          </v-btn>
        </template>
      </v-data-table>
    </div>

    <!-- Dialog crear/editar -->
    <v-dialog v-model="dialogCrear" max-width="600">
      <v-card>
        <v-card-title>{{ modoEdicion ? 'Editar Incidencia' : 'Crear Incidencia' }}</v-card-title>
        <v-divider />
        <v-card-text class="mt-4">
          <v-form ref="formCrear" @submit.prevent="guardarIncidencia">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model.number="formulario.idHabitacion"
                  label="Nº Habitación"
                  type="number"
                  required
                />
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="formulario.areaAsignada"
                  label="Área Asignada *"
                  :items="areas"
                  item-title="label"
                  item-value="value"
                  required
                />
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="formulario.tipo"
                  label="Tipo de Incidencia *"
                  :items="tiposIncidencia"
                  item-title="label"
                  item-value="value"
                  required
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="formulario.descripcion"
                  label="Descripción *"
                  rows="3"
                  required
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-select
                  v-model="formulario.prioridad"
                  label="Prioridad"
                  :items="prioridades"
                  item-title="label"
                  item-value="value"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-checkbox
                  v-model="formulario.esResponsabilidadCliente"
                  label="Responsabilidad del Cliente"
                />
              </v-col>

              <v-col v-if="formulario.esResponsabilidadCliente" cols="12" sm="6">
                <v-text-field
                  v-model.number="formulario.cargoAdicional"
                  label="Cargo Adicional"
                  type="number"
                  prefix="$"
                  step="0.01"
                />
              </v-col>

              <v-col v-if="formulario.esResponsabilidadCliente" cols="12" sm="6">
                <v-text-field
                  v-model="formulario.descripcionCargo"
                  label="Descripción del Cargo"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogCrear = false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" @click="guardarIncidencia">
            {{ modoEdicion ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Detalle -->
    <v-dialog v-model="dialogDetalle" max-width="600">
      <v-card v-if="incidenciaSeleccionada">
        <v-card-title>Detalles de Incidencia #{{ incidenciaSeleccionada.id }}</v-card-title>
        <v-divider />
        <v-card-text class="mt-4">
          <v-row>
            <v-col cols="12" sm="6">
              <p class="text-caption text-medium-emphasis">Habitación</p>
              <p class="text-body-2 font-weight-bold">{{ incidenciaSeleccionada.idHabitacion }}</p>
            </v-col>
            <v-col cols="12" sm="6">
              <p class="text-caption text-medium-emphasis">Estado</p>
              <v-chip
                :color="colorEstado(incidenciaSeleccionada.estado)"
                text-color="white"
                size="small"
              >
                {{ labelEstado(incidenciaSeleccionada.estado) }}
              </v-chip>
            </v-col>

            <v-col cols="12" sm="6">
              <p class="text-caption text-medium-emphasis">Área Asignada</p>
              <p class="text-body-2 font-weight-bold">{{ incidenciaSeleccionada.areaAsignada }}</p>
            </v-col>
            <v-col cols="12" sm="6">
              <p class="text-caption text-medium-emphasis">Prioridad</p>
              <v-chip
                :color="colorPrioridad(incidenciaSeleccionada.prioridad)"
                text-color="white"
                size="small"
              >
                {{ incidenciaSeleccionada.prioridad }}
              </v-chip>
            </v-col>

            <v-col cols="12">
              <p class="text-caption text-medium-emphasis">Descripción</p>
              <p class="text-body-2">{{ incidenciaSeleccionada.descripcion }}</p>
            </v-col>

            <v-col cols="12">
              <p class="text-caption text-medium-emphasis">Reportado por</p>
              <p class="text-body-2">{{ incidenciaSeleccionada.nombreEmpleadoReporta }}</p>
            </v-col>

            <v-col v-if="incidenciaSeleccionada.cargoAdicional" cols="12">
              <p class="text-caption text-medium-emphasis">Cargo Adicional</p>
              <p class="text-body-2 font-weight-bold text-error">${{ incidenciaSeleccionada.cargoAdicional }}</p>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogDetalle = false">Cerrar</v-btn>
          <v-btn color="primary" variant="flat" @click="abrirEditar(incidenciaSeleccionada)">
            Editar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useNotification } from '~/composables/useNotification'
import { useIncidencias } from '~/composables/useIncidencias'
import type { CreateIncidenciaDto, RoomIncident } from '~/types/incidencias'

definePageMeta({
  middleware: 'auth',
})

const composable = useIncidencias()
const { mostrarNotification } = useNotification()

// State
const dialogCrear = ref(false)
const dialogDetalle = ref(false)
const modoEdicion = ref(false)
const formCrear = ref<any>(null)
const incidenciaSeleccionada = ref<RoomIncident | null>(null)

const filtros = reactive({
  estado: undefined,
  areaAsignada: undefined,
  prioridad: undefined,
})

const formulario = reactive<Partial<CreateIncidenciaDto & { id?: number }>>({
  idHabitacion: undefined,
  areaAsignada: undefined,
  tipo: undefined,
  descripcion: undefined,
  prioridad: 'media',
  esResponsabilidadCliente: false,
})

// Opciones select
const estadosIncidencia = [
  { label: 'Reportado', value: 'reported' },
  { label: 'En Progreso', value: 'in_progress' },
  { label: 'Resuelto', value: 'resolved' },
  { label: 'Cancelado', value: 'cancelled' },
]

const tiposIncidencia = [
  { label: 'Daño', value: 'daño' },
  { label: 'Mantenimiento', value: 'mantenimiento' },
  { label: 'Limpieza', value: 'limpieza' },
  { label: 'Queja del Cliente', value: 'cliente_complaint' },
  { label: 'Otro', value: 'otros' },
]

const areas = [
  { label: 'Mantenimiento', value: 'mantenimiento' },
  { label: 'Plomería', value: 'plomeria' },
  { label: 'Limpieza', value: 'limpieza' },
  { label: 'Electricidad', value: 'electricidad' },
  { label: 'Seguridad', value: 'seguridad' },
  { label: 'Otro', value: 'otro' },
]

const prioridades = [
  { label: 'Baja', value: 'baja' },
  { label: 'Media', value: 'media' },
  { label: 'Alta', value: 'alta' },
  { label: 'Urgente', value: 'urgente' },
]

// Headers tabla
const headers = [
  { title: 'Habitación', key: 'idHabitacion', width: '100px' },
  { title: 'Tipo', key: 'tipo' },
  { title: 'Área', key: 'areaAsignada' },
  { title: 'Estado', key: 'estado' },
  { title: 'Prioridad', key: 'prioridad' },
  { title: 'Reportado por', key: 'nombreEmpleadoReporta' },
  { title: 'Acciones', key: 'acciones', sortable: false, width: '120px' },
]

// Métodos
const cargarIncidencias = async () => {
  await composable.obtenerTodas({
    estado: filtros.estado,
    areaAsignada: filtros.areaAsignada,
    prioridad: filtros.prioridad,
  })
}

const limpiarFiltros = () => {
  filtros.estado = undefined
  filtros.areaAsignada = undefined
  filtros.prioridad = undefined
  cargarIncidencias()
}

const abrirDialogoCrear = () => {
  modoEdicion.value = false
  formulario.idHabitacion = undefined
  formulario.areaAsignada = undefined
  formulario.tipo = undefined
  formulario.descripcion = undefined
  formulario.prioridad = 'media'
  formulario.esResponsabilidadCliente = false
  formulario.cargoAdicional = undefined
  formulario.descripcionCargo = undefined
  dialogCrear.value = true
}

const abrirEditar = (incidencia: RoomIncident) => {
  modoEdicion.value = true
  formulario.id = incidencia.id
  formulario.idHabitacion = incidencia.idHabitacion
  formulario.areaAsignada = incidencia.areaAsignada as any
  formulario.tipo = incidencia.tipo
  formulario.descripcion = incidencia.descripcion
  formulario.prioridad = incidencia.prioridad as any
  formulario.esResponsabilidadCliente = incidencia.esResponsabilidadCliente
  formulario.cargoAdicional = incidencia.cargoAdicional
  formulario.descripcionCargo = incidencia.descripcionCargo
  dialogDetalle.value = false
  dialogCrear.value = true
}

const abrirDetalle = (incidencia: RoomIncident) => {
  incidenciaSeleccionada.value = incidencia
  dialogDetalle.value = true
}

const guardarIncidencia = async () => {
  if (!formCrear.value) return

  const isValid = await formCrear.value.validate()
  if (!isValid.valid) return

  if (modoEdicion.value && formulario.id) {
    const result = await composable.actualizar(formulario.id, {
      areaAsignada: formulario.areaAsignada,
      tipo: formulario.tipo,
      descripcion: formulario.descripcion,
      prioridad: formulario.prioridad,
      esResponsabilidadCliente: formulario.esResponsabilidadCliente,
      cargoAdicional: formulario.cargoAdicional,
      descripcionCargo: formulario.descripcionCargo,
    })
    if (result) {
      mostrarNotification('Incidencia actualizada exitosamente', 'success')
      dialogCrear.value = false
    } else {
      mostrarNotification(composable.error.value || 'Error al actualizar', 'error')
    }
  } else {
    const result = await composable.crearIncidencia(formulario)
    if (result) {
      mostrarNotification('Incidencia creada exitosamente', 'success')
      dialogCrear.value = false
      cargarIncidencias()
    } else {
      mostrarNotification(composable.error.value || 'Error al crear', 'error')
    }
  }
}

const colorEstado = (estado: string): string => {
  const colores: Record<string, string> = {
    reported: 'error',
    in_progress: 'warning',
    resolved: 'success',
    cancelled: 'surface',
  }
  return colores[estado] || 'surface'
}

const labelEstado = (estado: string): string => {
  const labels: Record<string, string> = {
    reported: 'Reportado',
    in_progress: 'En Progreso',
    resolved: 'Resuelto',
    cancelled: 'Cancelado',
  }
  return labels[estado] || estado
}

const colorPrioridad = (prioridad: string): string => {
  const colores: Record<string, string> = {
    baja: 'info',
    media: 'warning',
    alta: 'error',
    urgente: 'error',
  }
  return colores[prioridad] || 'surface'
}

// Lifecycle
onMounted(async () => {
  await cargarIncidencias()
})
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>
