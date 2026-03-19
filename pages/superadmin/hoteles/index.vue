<template>
  <div class="hoteles-page">
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">Gestión de Hoteles</h1>
        <p class="text-gray-600 dark:text-gray-400">
          Total: {{ hotelesActuales.length }} hoteles
        </p>
      </div>
      <v-btn color="primary" @click="abrirDialogoCrear" prepend-icon="mdi-plus">
        Crear Hotel
      </v-btn>
    </div>

    <!-- Tabs -->
    <v-tabs v-model="tabActiva" class="mb-6">
      <v-tab value="todos" prepend-icon="mdi-view-list">
        Todos ({{ hoteles.length }})
      </v-tab>
      <v-tab value="activos" prepend-icon="mdi-check-circle" class="text-green-600">
        Activos ({{ hotelesActivos.length }})
      </v-tab>
      <v-tab value="suspendidos" prepend-icon="mdi-pause-circle" class="text-orange-600">
        Suspendidos ({{ hotelesSuspendidos.length }})
      </v-tab>
    </v-tabs>

    <!-- Tabla de Hoteles -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div v-if="isLoading" class="flex items-center justify-center py-16">
        <v-progress-circular indeterminate></v-progress-circular>
      </div>

      <v-table v-else>
        <thead>
          <tr>
            <th>Hotel</th>
            <th>Email</th>
            <th>Usuarios</th>
            <th>Habitaciones</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="hotel in hotelesActuales" :key="hotel.id">
            <td class="font-semibold">{{ hotel.nombre }}</td>
            <td>{{ hotel.email }}</td>
            <td>{{ hotel.usuariosActivos }}</td>
            <td>{{ hotel.habitacionesTotal }}</td>
            <td>
              <v-chip
                :color="hotel.estado === 'activo' ? 'green' : hotel.estado === 'suspendido' ? 'orange' : 'red'"
                size="small"
                text-color="white"
              >
                {{ hotel.estado }}
              </v-chip>
            </td>
            <td>
              <v-menu>
                <template #activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" size="small" variant="text" v-bind="props"></v-btn>
                </template>

                <v-list>
                  <v-list-item @click="abrirDialogoEditar(hotel)">
                    <template #prepend>
                      <v-icon>mdi-pencil</v-icon>
                    </template>
                    <v-list-item-title>Editar</v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    v-if="hotel.estado === 'activo'"
                    @click="confirmarSuspender(hotel)"
                  >
                    <template #prepend>
                      <v-icon color="orange">mdi-pause</v-icon>
                    </template>
                    <v-list-item-title>Suspender</v-list-item-title>
                  </v-list-item>

                  <v-list-item v-else @click="reactivarHotel(hotel.id)">
                    <template #prepend>
                      <v-icon color="green">mdi-play</v-icon>
                    </template>
                    <v-list-item-title>Reactivar</v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    v-if="hotel.estado !== 'bloqueado'"
                    @click="confirmarBloquear(hotel)"
                    class="text-red-600"
                  >
                    <template #prepend>
                      <v-icon color="red">mdi-lock</v-icon>
                    </template>
                    <v-list-item-title>Bloquear</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </td>
          </tr>
        </tbody>
      </v-table>

      <div v-if="hotelesActuales.length === 0" class="text-center py-8 text-gray-500">
        No hay hoteles en esta categoría
      </div>
    </div>

    <!-- Diálogo Crear/Editar Hotel -->
    <v-dialog v-model="dialogo" max-width="600">
      <v-card>
        <v-card-title>{{ modoEdicion ? 'Editar Hotel' : 'Crear Nuevo Hotel' }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="guardarHotel" ref="form">
            <v-text-field
              v-model="formulario.nombre"
              label="Nombre del Hotel"
              required
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="formulario.email"
              label="Email"
              type="email"
              required
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="formulario.telefono"
              label="Teléfono"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="formulario.direccion"
              label="Dirección"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="formulario.ciudad"
              label="Ciudad"
              class="mb-4"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="cerrarDialogo">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarHotel" :loading="isLoading">
            {{ modoEdicion ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo Suspender -->
    <v-dialog v-model="dialogoSuspender" max-width="400">
      <v-card>
        <v-card-title>Suspender Hotel</v-card-title>
        <v-card-text>
          <p class="mb-4">¿Está seguro de suspender <strong>{{ hotelSeleccionado?.nombre }}</strong>?</p>
          <v-textarea
            v-model="razonSuspension"
            label="Razón de suspensión"
            required
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialogoSuspender = false">Cancelar</v-btn>
          <v-btn color="orange" @click="ejecutarSuspension" :loading="isLoading">
            Suspender
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo Bloquear -->
    <v-dialog v-model="dialogoBloquear" max-width="400">
      <v-card>
        <v-card-title>Bloquear Hotel</v-card-title>
        <v-card-text>
          <p class="mb-4 text-red-600">⚠ Esta acción bloqueará completamente el acceso al hotel</p>
          <p class="mb-4">¿Está seguro de bloquear <strong>{{ hotelSeleccionado?.nombre }}</strong>?</p>
          <v-textarea
            v-model="razonBloqueo"
            label="Razón del bloqueo"
            required
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialogoBloquear = false">Cancelar</v-btn>
          <v-btn color="red" @click="ejecutarBloqueo" :loading="isLoading">
            Bloquear
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSuperAdminHoteles } from '~/composables/useSuperAdminHoteles'
import type { Hotel, CreateHotelDto, UpdateHotelDto } from '~/types/superadmin'

definePageMeta({
  middleware: ['auth'],
  layout: 'default'
})

const {
  hoteles,
  hotelSeleccionado,
  isLoading,
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

const formulario = ref<CreateHotelDto>({
  nombre: '',
  email: '',
  telefono: '',
  direccion: '',
  ciudad: '',
  paisId: 1,
  planId: 1
})

const hotelesActuales = computed(() => {
  if (tabActiva.value === 'activos') return hotelesActivos.value
  if (tabActiva.value === 'suspendidos') return hotelesSuspendidos.value
  return hoteles.value
})

const guardarHotel = async () => {
  if (modoEdicion.value && hotelSeleccionado.value) {
    const datos: UpdateHotelDto = {
      nombre: formulario.value.nombre,
      email: formulario.value.email,
      telefono: formulario.value.telefono,
      direccion: formulario.value.direccion,
      ciudad: formulario.value.ciudad
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
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    paisId: 1,
    planId: 1
  }
}

onMounted(() => {
  obtenerHoteles()
})
</script>

<style scoped>
.hoteles-page {
  padding: 2rem;
}
</style>
