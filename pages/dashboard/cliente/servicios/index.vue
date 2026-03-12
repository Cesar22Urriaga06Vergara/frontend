<template>
  <div class="pa-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Servicios Disponibles</h1>
        <p class="text-body-2 text-medium-emphasis">
          Solicita los servicios que necesites durante tu estadía
        </p>
      </div>
      <v-chip
        v-if="checked"
        color="success"
        text-color="white"
        prepend-icon="mdi-check-circle"
      >
        Check-in confirmado
      </v-chip>
      <v-chip v-else color="warning" text-color="white" prepend-icon="mdi-clock-outline">
        Disponible tras check-in
      </v-chip>
    </div>

    <!-- Advertencia si no hay check-in -->
    <v-alert v-if="!checked" type="warning" class="mb-6" closable>
      <v-alert-title>No has completado el check-in</v-alert-title>
      Necesitas registrar tu entrada en el hotel antes de solicitar servicios. Contacta al
      recepcionista.
    </v-alert>

    <!-- Tabs por categoría -->
    <v-tabs v-model="tabActiva" class="mb-6" bg-color="transparent">
      <v-tab
        v-for="(_, categoria) in serviciosStore.catalogo"
        :key="categoria"
        :value="categoria"
      >
        {{ formatearCategoria(categoria) }}
      </v-tab>
    </v-tabs>

    <!-- Contenido de servicios por categoría -->
    <v-window v-model="tabActiva">
      <v-window-item
        v-for="(servicios, categoria) in serviciosStore.catalogo"
        :key="categoria"
        :value="categoria"
      >
        <v-row class="mt-2">
          <v-col v-for="servicio in servicios" :key="servicio.id" cols="12" sm="6" md="4" lg="3">
            <v-card class="card-glow h-100 d-flex flex-column">
              <!-- Imagen -->
              <v-img
                v-if="servicio.imagenUrl"
                :src="servicio.imagenUrl"
                height="150"
                cover
                class="mb-4"
              />
              <div v-else class="bg-grey-lighten-3 d-flex align-center justify-center" style="height: 150px">
                <v-icon size="48" color="grey">mdi-image-off</v-icon>
              </div>

              <!-- Contenido -->
              <v-card-text class="flex-grow-1">
                <div class="font-weight-bold mb-2">{{ servicio.nombre }}</div>
                <p class="text-caption text-medium-emphasis mb-3">
                  {{ servicio.descripcion || 'Sin descripción' }}
                </p>

                <!-- Métodos de entrega -->
                <div class="mb-3 d-flex gap-1 flex-wrap">
                  <v-chip
                    v-if="servicio.disponibleDelivery"
                    size="small"
                    variant="outlined"
                    color="blue"
                    prepend-icon="mdi-bike"
                  >
                    Delivery
                  </v-chip>
                  <v-chip
                    v-if="servicio.disponibleRecogida"
                    size="small"
                    variant="outlined"
                    color="orange"
                    prepend-icon="mdi-walk"
                  >
                    Recogida
                  </v-chip>
                </div>

                <!-- Precio -->
                <div class="text-h6 font-weight-bold text-success mb-3">
                  ${{ formatearPrecio(servicio.precioUnitario) }}
                  <span class="text-caption text-medium-emphasis">/ {{ servicio.unidadMedida }}</span>
                </div>
              </v-card-text>

              <!-- Botón agregar -->
              <v-card-actions class="pt-0">
                <v-btn
                  :disabled="!checked"
                  color="primary"
                  size="small"
                  block
                  prepend-icon="mdi-plus"
                  @click="abrirDialogAgregar(servicio)"
                >
                  Agregar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>

    <!-- FAB con carrito -->
    <v-speed-dial
      v-if="checked"
      location="bottom end"
      :open-on-hover="false"
      :open="dialogo || false"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          color="primary"
          icon="mdi-shopping-cart"
          size="x-large"
          class="fab-button"
        >
          <v-badge :content="serviciosStore.carrito.length" color="red" floating>
            <v-icon>mdi-shopping-cart</v-icon>
          </v-badge>
        </v-btn>
      </template>

      <v-btn
        v-if="serviciosStore.carrito.length > 0"
        color="success"
        icon="mdi-check-bold"
        size="large"
        @click="irAlCarrito"
      >
        <v-icon>mdi-arrow-right</v-icon>
      </v-btn>
    </v-speed-dial>

    <!-- Dialog agregar al carrito -->
    <v-dialog v-model="dialogoAgregarActivo" max-width="400">
      <v-card>
        <v-card-title>Agregar {{ servicioSeleccionado?.nombre }}</v-card-title>
        <v-card-text class="pt-4">
          <v-text-field
            v-model.number="cantidadTmp"
            label="Cantidad"
            type="number"
            min="1"
            outlined
            class="mb-4"
          />
          <v-textarea
            v-model="observacionTmp"
            label="Observaciones especiales (opcional)"
            outlined
            rows="3"
            counter
            maxlength="150"
          />
          <div class="mt-4 text-h6 font-weight-bold">
            Subtotal: ${{ formatearPrecio((servicioSeleccionado?.precioUnitario || 0) * cantidadTmp) }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" @click="dialogoAgregarActivo = false"> Cancelar </v-btn>
          <v-btn color="primary" @click="confirmarAgregar"> Agregar al carrito </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useServiciosStore } from '~/stores/servicios';
import { useReservasStore } from '~/stores/reservas';
import { useAuthStore } from '~/stores/auth';
import type { Servicio } from '~/types/servicios';

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['cliente'],
});

useHead({ title: 'Servicios' });

const router = useRouter();
const serviciosStore = useServiciosStore();
const reservasStore = useReservasStore();
const authStore = useAuthStore();

// State
const tabActiva = ref<string>('');
const dialogoAgregarActivo = ref(false);
const servicioSeleccionado = ref<Servicio | null>(null);
const cantidadTmp = ref(1);
const observacionTmp = ref('');
const dialogo = ref(false);

// Computed
const checked = computed(() => {
  const reservaActual = reservasStore.reservas.find(
    (r) =>
      r.idCliente === authStore.user?.idCliente &&
      r.estadoReserva?.toLowerCase() !== 'cancelada',
  );
  return reservaActual?.checkinReal !== null && reservaActual?.checkinReal !== undefined;
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

const abrirDialogAgregar = (servicio: Servicio) => {
  servicioSeleccionado.value = servicio;
  cantidadTmp.value = 1;
  observacionTmp.value = '';
  dialogoAgregarActivo.value = true;
};

const confirmarAgregar = () => {
  if (servicioSeleccionado.value) {
    try {
      serviciosStore.agregarAlCarrito(
        servicioSeleccionado.value,
        cantidadTmp.value,
        observacionTmp.value || undefined,
      );
      dialogoAgregarActivo.value = false;
      servicioSeleccionado.value = null;
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al agregar al carrito');
    }
  }
};

const irAlCarrito = () => {
  router.push('/dashboard/cliente/servicios/carrito');
};

onBeforeMount(() => {
  // Cargar catálogo cuando se monta el componente si no está cargado
});

onMounted(async () => {
  // Cargar catálogo
  const idHotel = authStore.user?.idHotel;
  if (idHotel) {
    try {
      await serviciosStore.cargarCatalogo(idHotel);
      // Establecer la primera categoría disponible
      const categorias = Object.keys(serviciosStore.catalogo);
      if (categorias.length > 0) {
        tabActiva.value = categorias[0];
      }
    } catch (error) {
      console.error('Error cargando catálogo:', error);
    }
  }
});
</script>

<style scoped>
.card-glow {
  transition: all 0.3s ease;
}

.card-glow:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.fab-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
}
</style>
