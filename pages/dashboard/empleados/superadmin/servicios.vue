<template>
  <div class="pa-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Catálogo de Servicios</h1>
        <p class="text-body-2 text-medium-emphasis">
          Administra los servicios disponibles en el hotel
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="abrirDialogoNuevoServicio"
      >
        Nuevo Servicio
      </v-btn>
    </div>

    <!-- Filtro por categoría -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-select
          v-model="filtroCategoria"
          label="Filtrar por categoría"
          :items="categoriasDisponibles"
          clearable
          outlined
          @update:model-value="cargarServicios"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-btn
          color="primary"
          variant="outlined"
          block
          prepend-icon="mdi-refresh"
          @click="cargarServicios"
        >
          Actualizar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabla de servicios -->
    <v-card class="card-glow">
      <v-table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio Unit.</th>
            <th>Unidad</th>
            <th>Delivery</th>
            <th>Recogida</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="servicio in serviciosFiltrados" :key="servicio.id">
            <td>
              <div class="font-weight-medium">{{ servicio.nombre }}</div>
              <div class="text-caption text-medium-emphasis">{{ servicio.descripcion }}</div>
            </td>
            <td>
              <v-chip size="small" variant="outlined">
                {{ formatearCategoria(servicio.categoria) }}
              </v-chip>
            </td>
            <td class="font-weight-bold">
              ${{ formatearPrecio(servicio.precioUnitario) }}
            </td>
            <td class="text-caption">{{ servicio.unidadMedida }}</td>
            <td>
              <v-icon
                :color="servicio.disponibleDelivery ? 'success' : 'error'"
                size="small"
              >
                {{ servicio.disponibleDelivery ? 'mdi-check' : 'mdi-close' }}
              </v-icon>
            </td>
            <td>
              <v-icon
                :color="servicio.disponibleRecogida ? 'success' : 'error'"
                size="small"
              >
                {{ servicio.disponibleRecogida ? 'mdi-check' : 'mdi-close' }}
              </v-icon>
            </td>
            <td>
              <v-chip
                :color="servicio.activo ? 'success' : 'error'"
                text-color="white"
                size="small"
              >
                {{ servicio.activo ? 'Activo' : 'Inactivo' }}
              </v-chip>
            </td>
            <td>
              <v-icon-btn
                icon="mdi-pencil"
                size="small"
                color="primary"
                @click="abrirDialogoEditar(servicio)"
              />
              <v-icon-btn
                icon="mdi-delete"
                size="small"
                color="error"
                @click="confirmarDesactivar(servicio.id)"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
      <div v-if="serviciosFiltrados.length === 0" class="pa-6 text-center">
        <v-icon size="48" color="grey-lighten-1" class="d-block mb-2">
          mdi-folder-open-outline
        </v-icon>
        <p class="text-medium-emphasis">No hay servicios que mostrar</p>
      </div>
    </v-card>

    <!-- Dialog nuevo/editar servicio -->
    <v-dialog v-model="dialogoServicio" max-width="600" persistent>
      <v-card>
        <v-card-title>
          {{ servicioEditando ? 'Editar Servicio' : 'Nuevo Servicio' }}
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-4">
          <v-form ref="formServicio" @submit.prevent="guardarServicio">
            <v-text-field
              v-model="formulario.nombre"
              label="Nombre del servicio"
              outlined
              required
              class="mb-4"
            />

            <v-textarea
              v-model="formulario.descripcion"
              label="Descripción"
              outlined
              rows="2"
              class="mb-4"
            />

            <v-select
              v-model="formulario.categoria"
              label="Categoría"
              :items="['cafeteria', 'lavanderia', 'spa', 'room_service', 'minibar', 'otros']"
              :item-title="(item) => formatearCategoria(item)"
              outlined
              required
              class="mb-4"
            />

            <v-text-field
              v-model.number="formulario.precioUnitario"
              label="Precio unitario"
              type="number"
              outlined
              required
              step="0.01"
              min="0"
              class="mb-4"
            >
              <template #prepend>
                $
              </template>
            </v-text-field>

            <v-text-field
              v-model="formulario.unidadMedida"
              label="Unidad de medida"
              outlined
              placeholder="ej: taza, kg, porción"
              class="mb-4"
            />

            <v-text-field
              v-model="formulario.imagenUrl"
              label="URL de imagen"
              outlined
              class="mb-4"
            />

            <v-row>
              <v-col cols="12" sm="6">
                <v-checkbox
                  v-model="formulario.disponibleDelivery"
                  label="Disponible para delivery"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-checkbox
                  v-model="formulario.disponibleRecogida"
                  label="Disponible para recogida"
                />
              </v-col>
            </v-row>

            <v-checkbox
              v-model="formulario.activo"
              label="Servicio activo"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" @click="dialogoServicio = false">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="guardarServicio"
            :loading="loading"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { UserRole } from '~/types/auth';
import { useAuthStore } from '~/stores/auth';
import { useApi } from '~/composables/useApi';
import { useNotification } from '~/composables/useNotification';
import type { Servicio } from '~/types/servicios';

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.SUPERADMIN],
});

useHead({ title: 'Catálogo de Servicios' });

const authStore = useAuthStore();
const api = useApi()
const notification = useNotification();

// State
const servicios = ref<Servicio[]>([]);
const filtroCategoria = ref<string | null>(null);
const dialogoServicio = ref(false);
const servicioEditando = ref<Servicio | null>(null);
const loading = ref(false);
const formServicio = ref<any>(null);

const formulario = ref({
  nombre: '',
  descripcion: '',
  categoria: 'cafeteria',
  precioUnitario: 0,
  unidadMedida: 'unidad',
  imagenUrl: '',
  disponibleDelivery: true,
  disponibleRecogida: true,
  activo: true,
});

// Computed
const categoriasDisponibles = computed(() => [
  { title: 'Cafetería ☕', value: 'cafeteria' },
  { title: 'Lavandería 👔', value: 'lavanderia' },
  { title: 'Spa 💆', value: 'spa' },
  { title: 'Room Service 🛎️', value: 'room_service' },
  { title: 'Minibar 🍷', value: 'minibar' },
  { title: 'Otros', value: 'otros' },
]);

const serviciosFiltrados = computed(() => {
  if (!filtroCategoria.value) {
    return servicios.value;
  }
  return servicios.value.filter((s) => s.categoria === filtroCategoria.value);
});

// Methods
const formatearCategoria = (cat: string): string => {
  const map: Record<string, string> = {
    cafeteria: 'Cafetería ☕',
    lavanderia: 'Lavandería 👔',
    spa: 'Spa 💆',
    room_service: 'Room Service 🛎️',
    minibar: 'Minibar 🍷',
    otros: 'Otros',
  };
  return map[cat] || cat;
};

const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio);
};

const cargarServicios = async () => {
  loading.value = true;
  try {
    const idHotel = authStore.user?.idHotel;
    if (idHotel) {
      let url = `/servicios/catalogo/${idHotel}`;
      if (filtroCategoria.value) {
        url += `?categoria=${filtroCategoria.value}`;
      }
      const data = await api.get(url);
      servicios.value = data;
    }
  } catch (error) {
    notification.error('Error cargando servicios');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const abrirDialogoNuevoServicio = () => {
  servicioEditando.value = null;
  formulario.value = {
    nombre: '',
    descripcion: '',
    categoria: 'cafeteria',
    precioUnitario: 0,
    unidadMedida: 'unidad',
    imagenUrl: '',
    disponibleDelivery: true,
    disponibleRecogida: true,
    activo: true,
  };
  dialogoServicio.value = true;
};

const abrirDialogoEditar = (servicio: Servicio) => {
  servicioEditando.value = servicio;
  formulario.value = {
    nombre: servicio.nombre,
    descripcion: servicio.descripcion || '',
    categoria: servicio.categoria,
    precioUnitario: servicio.precioUnitario,
    unidadMedida: servicio.unidadMedida,
    imagenUrl: servicio.imagenUrl || '',
    disponibleDelivery: servicio.disponibleDelivery,
    disponibleRecogida: servicio.disponibleRecogida,
    activo: servicio.activo,
  };
  dialogoServicio.value = true;
};

const guardarServicio = async () => {
  loading.value = true;
  try {
    const idHotel = authStore.user?.idHotel;
    const payload = {
      ...formulario.value,
      idHotel,
    };

    if (servicioEditando.value) {
      // Editar
      await api.patch(`/servicios/catalogo/${servicioEditando.value.id}`, payload);
      notification.success('Servicio actualizado');
    } else {
      // Crear
      await api.post('/servicios/catalogo', payload);
      notification.success('Servicio creado');
    }

    dialogoServicio.value = false;
    await cargarServicios();
  } catch (error: any) {
    notification.error(error?.message || 'Error guardando servicio');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const confirmarDesactivar = async (id: number) => {
  if (confirm('¿Desactivar este servicio? (Seguirá siendo visible en el historial)')) {
    loading.value = true;
    try {
      await api.request(`/servicios/catalogo/${id}`, { method: 'DELETE' });
      notification.success('Servicio desactivado');
      await cargarServicios();
    } catch (error: any) {
      notification.error(error?.message || 'Error desactivando servicio');
    } finally {
      loading.value = false;
    }
  }
};

onMounted(() => {
  cargarServicios();
});
</script>

<style scoped>
.card-glow {
  transition: all 0.3s ease;
}

.card-glow:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
</style>


