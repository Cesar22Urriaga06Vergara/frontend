<template>
  <div>
    <PageHeader
      title="Gestion de hoteles"
      subtitle="Administra hoteles, estados operativos y datos comerciales"
    >
      <template #status>
        <v-chip color="primary" variant="tonal" size="small">
          {{ hotelesActuales.length }} visibles
        </v-chip>
      </template>
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="abrirCrearHotel">
          Crear hotel
        </v-btn>
      </template>
    </PageHeader>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Total hoteles"
          :value="hoteles.length"
          icon="mdi-domain"
          color="primary"
          :loading="isLoading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Activos"
          :value="hotelesActivos.length"
          icon="mdi-check-circle-outline"
          color="success"
          :loading="isLoading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Suspendidos"
          :value="hotelesSuspendidos.length"
          icon="mdi-pause-circle-outline"
          color="warning"
          :loading="isLoading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Habitaciones"
          :value="habitacionesTotales"
          icon="mdi-door"
          color="info"
          helper="Capacidad total consolidada"
          :loading="isLoading"
        />
      </v-col>
    </v-row>

    <SectionCard class="mb-6" title="Filtros" subtitle="Visualiza hoteles por estado operativo">
      <v-chip-group v-model="tabActiva" selected-class="text-primary" mandatory>
        <v-chip value="todos" filter variant="tonal">Todos ({{ hoteles.length }})</v-chip>
        <v-chip value="activos" filter variant="tonal" color="success">Activos ({{ hotelesActivos.length }})</v-chip>
        <v-chip value="suspendidos" filter variant="tonal" color="warning">Suspendidos ({{ hotelesSuspendidos.length }})</v-chip>
      </v-chip-group>
    </SectionCard>

    <SectionCard v-if="error" :padded="false" class="mb-6">
      <EmptyState
        icon="mdi-alert-circle-outline"
        title="No fue posible cargar hoteles"
        :description="error"
        action-label="Reintentar"
        @action="obtenerHoteles"
      />
    </SectionCard>

    <StandardDataTable
      v-else
      title="Listado de hoteles"
      subtitle="Gestiona informacion general y estado de cada hotel"
      :headers="headers"
      :items="hotelesActuales"
      :loading="isLoading"
      :items-per-page="10"
      empty-icon="mdi-domain-off"
      empty-title="No hay hoteles para este filtro"
      empty-description="Ajusta el filtro o crea un nuevo hotel para comenzar."
      empty-action-label="Crear hotel"
      @empty-action="abrirCrearHotel"
    >
      <template #item.nombre="{ item }">
        <div>
          <div class="font-weight-medium">{{ item.nombre }}</div>
          <div class="text-caption text-medium-emphasis">{{ item.ciudad || 'Sin ciudad' }}, {{ item.pais || 'Sin pais' }}</div>
        </div>
      </template>

      <template #item.email="{ item }">
        <span>{{ item.email || 'Sin email' }}</span>
      </template>

      <template #item.nit="{ item }">
        <span>{{ item.nit || 'Sin NIT' }}</span>
      </template>

      <template #item.habitacionesTotal="{ item }">
        <v-chip color="info" variant="tonal" size="small">{{ item.habitacionesTotal }}</v-chip>
      </template>

      <template #item.estado="{ item }">
        <v-chip
          :color="item.estado === 'activo' ? 'success' : 'warning'"
          size="small"
          variant="tonal"
        >
          {{ item.estado }}
        </v-chip>
      </template>

      <template #item.acciones="{ item }">
        <v-menu>
          <template #activator="{ props }">
            <v-btn icon="mdi-dots-vertical" size="small" variant="text" v-bind="props" />
          </template>

          <v-list>
            <v-list-item @click="abrirEditarHotel(item)">
              <template #prepend><v-icon>mdi-pencil</v-icon></template>
              <v-list-item-title>Editar</v-list-item-title>
            </v-list-item>

            <v-list-item v-if="item.estado === 'activo'" @click="confirmarSuspender(item)">
              <template #prepend><v-icon color="warning">mdi-pause</v-icon></template>
              <v-list-item-title>Suspender</v-list-item-title>
            </v-list-item>

            <v-list-item v-else @click="reactivarHotel(item.id)">
              <template #prepend><v-icon color="success">mdi-play</v-icon></template>
              <v-list-item-title>Reactivar</v-list-item-title>
            </v-list-item>

            <v-list-item @click="confirmarBloquear(item)">
              <template #prepend><v-icon color="error">mdi-lock</v-icon></template>
              <v-list-item-title>Bloquear</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </StandardDataTable>

    <v-dialog v-model="dialogo" max-width="720">
      <SectionCard :title="modoEdicion ? 'Editar hotel' : 'Crear hotel'" subtitle="Completa los datos principales de operacion y contacto">
        <v-form @submit.prevent="guardarHotel" ref="form">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="formulario.nombre" label="Nombre del hotel" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formulario.nit" label="NIT" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formulario.email" label="Email" type="email" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formulario.telefono" label="Telefono" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formulario.ciudad" label="Ciudad" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formulario.pais" label="Pais" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="formulario.direccion" label="Direccion" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="formulario.descripcion" label="Descripcion" rows="3" />
            </v-col>
          </v-row>

          <div class="d-flex justify-end ga-2 mt-2">
            <v-btn variant="text" @click="cerrarDialogo">Cancelar</v-btn>
            <v-btn color="primary" :loading="isLoading" @click="guardarHotel">
              {{ modoEdicion ? 'Actualizar' : 'Crear' }}
            </v-btn>
          </div>
        </v-form>
      </SectionCard>
    </v-dialog>

    <v-dialog v-model="dialogoSuspender" max-width="500">
      <SectionCard title="Suspender hotel" subtitle="Registra una razon para la suspension temporal">
        <p class="mb-4">Se suspendera <strong>{{ hotelSeleccionado?.nombre }}</strong>.</p>
        <v-textarea v-model="razonSuspension" label="Razon de suspension" rows="3" />
        <div class="d-flex justify-end ga-2 mt-2">
          <v-btn variant="text" @click="dialogoSuspender = false">Cancelar</v-btn>
          <v-btn color="warning" :loading="isLoading" @click="ejecutarSuspension">Suspender</v-btn>
        </div>
      </SectionCard>
    </v-dialog>

    <v-dialog v-model="dialogoBloquear" max-width="500">
      <SectionCard title="Bloquear hotel" subtitle="Accion de bloqueo operativo total">
        <v-alert type="error" variant="tonal" class="mb-4">
          Esta accion restringe completamente el acceso al hotel.
        </v-alert>
        <p class="mb-4">Se bloqueara <strong>{{ hotelSeleccionado?.nombre }}</strong>.</p>
        <v-textarea v-model="razonBloqueo" label="Razon del bloqueo" rows="3" />
        <div class="d-flex justify-end ga-2 mt-2">
          <v-btn variant="text" @click="dialogoBloquear = false">Cancelar</v-btn>
          <v-btn color="error" :loading="isLoading" @click="ejecutarBloqueo">Bloquear</v-btn>
        </div>
      </SectionCard>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSuperAdminHoteles } from '~/composables/useSuperAdminHoteles'
import type { Hotel, CreateHotelDto, UpdateHotelDto } from '~/types/superadmin'
import { UserRole } from '~/types/auth'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import EmptyState from '~/components/shared/EmptyState.vue'
import StatCard from '~/components/shared/StatCard.vue'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.SUPERADMIN],
  layout: 'superadmin'
})

const {
  hoteles,
  hotelSeleccionado,
  isLoading,
  error,
  dialogo,
  modoEdicion,
  hotelesActivos,
  hotelesSuspendidos,
  obtenerHoteles,
  crearHotel,
  actualizarHotel,
  suspenderHotel,
  bloquearHotel,
  reactivarHotel,
  abrirDialogoCrear,
  abrirDialogoEditar,
  cerrarDialogo
} = useSuperAdminHoteles()

const tabActiva = ref('todos')
const form = ref()
const dialogoSuspender = ref(false)
const dialogoBloquear = ref(false)
const razonSuspension = ref('')
const razonBloqueo = ref('')

const headers = [
  { title: 'Hotel', key: 'nombre' },
  { title: 'Email', key: 'email' },
  { title: 'NIT', key: 'nit', width: '140px' },
  { title: 'Habitaciones', key: 'habitacionesTotal', width: '130px' },
  { title: 'Estado', key: 'estado', width: '120px' },
  { title: 'Acciones', key: 'acciones', align: 'end', sortable: false, width: '110px' },
]

const formulario = ref<CreateHotelDto>({
  nombre: '',
  nit: '',
  email: '',
  telefono: '',
  direccion: '',
  ciudad: '',
  pais: '',
  descripcion: '',
})

const hotelesActuales = computed(() => {
  if (tabActiva.value === 'activos') return hotelesActivos.value
  if (tabActiva.value === 'suspendidos') return hotelesSuspendidos.value
  return hoteles.value
})

const habitacionesTotales = computed(() =>
  hoteles.value.reduce((acc, hotel) => acc + Number(hotel.habitacionesTotal || 0), 0)
)

const guardarHotel = async () => {
  if (modoEdicion.value && hotelSeleccionado.value) {
    const datos: UpdateHotelDto = {
      nombre: formulario.value.nombre,
      nit: formulario.value.nit,
      email: formulario.value.email,
      telefono: formulario.value.telefono,
      direccion: formulario.value.direccion,
      ciudad: formulario.value.ciudad,
      pais: formulario.value.pais,
      descripcion: formulario.value.descripcion,
    }
    await actualizarHotel(hotelSeleccionado.value.id, datos)
  } else {
    await crearHotel(formulario.value)
  }
  resetearFormulario()
}

const confirmarSuspender = (hotel: Hotel) => {
  hotelSeleccionado.value = hotel
  razonSuspension.value = ''
  dialogoSuspender.value = true
}

const ejecutarSuspension = async () => {
  if (hotelSeleccionado.value && razonSuspension.value) {
    await suspenderHotel(hotelSeleccionado.value.id, razonSuspension.value)
    dialogoSuspender.value = false
  }
}

const confirmarBloquear = (hotel: Hotel) => {
  hotelSeleccionado.value = hotel
  razonBloqueo.value = ''
  dialogoBloquear.value = true
}

const ejecutarBloqueo = async () => {
  if (hotelSeleccionado.value && razonBloqueo.value) {
    await bloquearHotel(hotelSeleccionado.value.id, razonBloqueo.value)
    dialogoBloquear.value = false
  }
}

const resetearFormulario = () => {
  formulario.value = {
    nombre: '',
    nit: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    pais: '',
    descripcion: '',
  }
}

const abrirCrearHotel = () => {
  resetearFormulario()
  abrirDialogoCrear()
}

const abrirEditarHotel = (hotel: Hotel) => {
  abrirDialogoEditar(hotel)
  formulario.value = {
    nombre: hotel.nombre,
    nit: hotel.nit,
    email: hotel.email,
    telefono: hotel.telefono,
    direccion: hotel.direccion,
    ciudad: hotel.ciudad,
    pais: hotel.pais,
    descripcion: hotel.descripcion,
  }
}

onMounted(() => {
  obtenerHoteles()
})
</script>
