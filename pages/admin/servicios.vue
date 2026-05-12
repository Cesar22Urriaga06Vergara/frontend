<template>
  <div>
    <PageHeader
      title="Catálogo de Servicios"
      subtitle="Administra servicios disponibles y sus condiciones de operación"
    >
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="abrirDialogoNuevoServicio">
          Nuevo Servicio
        </v-btn>
      </template>
    </PageHeader>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Servicios" :value="servicios.length" icon="mdi-room-service" color="primary" :loading="loading" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Activos" :value="servicios.filter(s => s.activo).length" icon="mdi-check-circle" color="success" :loading="loading" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Con delivery" :value="servicios.filter(s => s.disponibleDelivery).length" icon="mdi-bike" color="info" :loading="loading" />
      </v-col>
    </v-row>

    <SectionCard class="mb-6" title="Filtros" subtitle="Filtra por categoría y actualiza resultados">
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filtroCategoria"
            label="Filtrar por categoría"
            :items="categoriasDisponibles"
            clearable
            @update:model-value="cargarServicios"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3" class="d-flex align-end">
          <v-btn color="primary" variant="outlined" block prepend-icon="mdi-refresh" @click="cargarServicios">
            Actualizar
          </v-btn>
        </v-col>
      </v-row>
    </SectionCard>

    <StandardDataTable
      title="Servicios"
      subtitle="Listado general por categoría y disponibilidad"
      :headers="headers"
      :items="serviciosFiltrados"
      :loading="loading"
      empty-icon="mdi-folder-open-outline"
      empty-title="No hay servicios que mostrar"
      empty-description="Ajusta filtros o crea un nuevo servicio."
    >
      <template #item.nombre="{ item }">
        <div>
          <div class="font-weight-medium">{{ item.nombre }}</div>
          <div class="text-caption text-medium-emphasis">{{ item.descripcion }}</div>
        </div>
      </template>
      <template #item.categoria="{ item }">
        <v-chip size="small" variant="outlined">{{ formatearCategoria(item.categoria) }}</v-chip>
      </template>
      <template #item.precioUnitario="{ item }">
        <span class="font-weight-bold">${{ formatearPrecio(item.precioUnitario) }}</span>
      </template>
      <template #item.disponibleDelivery="{ item }">
        <v-icon :color="item.disponibleDelivery ? 'success' : 'error'" size="small">
          {{ item.disponibleDelivery ? 'mdi-check' : 'mdi-close' }}
        </v-icon>
      </template>
      <template #item.disponibleRecogida="{ item }">
        <v-icon :color="item.disponibleRecogida ? 'success' : 'error'" size="small">
          {{ item.disponibleRecogida ? 'mdi-check' : 'mdi-close' }}
        </v-icon>
      </template>
      <template #item.activo="{ item }">
        <v-chip :color="item.activo ? 'success' : 'error'" text-color="white" size="small">
          {{ item.activo ? 'Activo' : 'Inactivo' }}
        </v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon="mdi-pencil" size="x-small" variant="text" color="primary" @click="abrirDialogoEditar(item)" />
        <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" @click="confirmarDesactivar(item.id)" />
      </template>
    </StandardDataTable>

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
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import type { Servicio } from '~/types/servicios';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN],
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
  { title: 'Cafetería', value: 'cafeteria' },
  { title: 'Lavandería', value: 'lavanderia' },
  { title: 'Spa', value: 'spa' },
  { title: 'Room Service', value: 'room_service' },
  { title: 'Minibar', value: 'minibar' },
  { title: 'Otros', value: 'otros' },
]);

const serviciosFiltrados = computed(() => {
  if (!filtroCategoria.value) {
    return servicios.value;
  }
  return servicios.value.filter((s) => s.categoria === filtroCategoria.value);
});

const headers = [
  { title: 'Nombre', key: 'nombre' },
  { title: 'Categoría', key: 'categoria' },
  { title: 'Precio Unit.', key: 'precioUnitario' },
  { title: 'Unidad', key: 'unidadMedida' },
  { title: 'Delivery', key: 'disponibleDelivery' },
  { title: 'Recogida', key: 'disponibleRecogida' },
  { title: 'Estado', key: 'activo' },
  { title: 'Acciones', key: 'actions', sortable: false },
];

// Methods
const formatearCategoria = (cat: string): string => {
  const map: Record<string, string> = {
    cafeteria: 'Cafetería',
    lavanderia: 'Lavandería',
    spa: 'Spa',
    room_service: 'Room Service',
    minibar: 'Minibar',
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

