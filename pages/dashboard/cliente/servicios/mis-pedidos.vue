<template>
  <div class="pa-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Mis Pedidos</h1>
        <p class="text-body-2 text-medium-emphasis">
          Historial de tus solicitudes de servicios
        </p>
      </div>
      <v-btn
        color="primary"
        variant="outlined"
        prepend-icon="mdi-refresh"
        @click="refrescarPedidos"
        :loading="serviciosStore.loading"
      >
        Actualizar
      </v-btn>
    </div>

    <!-- Pedidos vacíos -->
    <v-alert v-if="pedidosFiltrados.length === 0" type="info" class="mb-6">
      <v-alert-title>Sin pedidos</v-alert-title>
      <p>Aún no tienes pedidos. Ve al catálogo para solicitar servicios.</p>
      <v-btn color="primary" variant="text" @click="irAlCatalogo">
        Ir al catálogo
      </v-btn>
    </v-alert>

    <!-- Listado de pedidos -->
    <v-row v-else>
      <v-col v-for="pedido in pedidosFiltrados" :key="pedido.id" cols="12" md="6" lg="4">
        <v-card class="card-glow h-100" :color="getColorPorEstado(pedido.estadoPedido)">
          <!-- Header - Estado -->
          <div :style="{ backgroundColor: getColorPorEstado(pedido.estadoPedido) }" class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-white">Pedido #{{ pedido.id }}</div>
                <div class="text-h6 font-weight-bold text-white">
                  {{ formatearEstado(pedido.estadoPedido) }}
                </div>
              </div>
              <v-chip
                :color="getColorChip(pedido.estadoPedido)"
                text-color="white"
                size="small"
                class="font-weight-bold"
              >
                {{ getIconoPorEstado(pedido.estadoPedido) }}
                {{ formatearEstado(pedido.estadoPedido) }}
              </v-chip>
            </div>
          </div>

          <!-- Contenido -->
          <v-card-text class="pt-4">
            <!-- Fecha -->
            <div class="mb-4">
              <span class="text-caption text-medium-emphasis">Fecha:</span>
              <div class="font-weight-medium">{{ formatearFecha(pedido.fechaPedido) }}</div>
            </div>

            <!-- Categoría y tipo de entrega -->
            <div class="d-flex gap-2 mb-4">
              <v-chip size="small" variant="outlined">
                {{ formatearCategoria(pedido.categoria) }}
              </v-chip>
              <v-chip size="small" variant="outlined" :prepend-icon="pedido.tipoEntrega === 'delivery' ? 'mdi-bike' : 'mdi-walk'">
                {{ pedido.tipoEntrega === 'delivery' ? 'Delivery' : 'Recogida' }}
              </v-chip>
            </div>

            <!-- Items -->
            <div class="mb-4">
              <div class="text-caption font-weight-bold mb-2">Items:</div>
              <v-list dense>
                <v-list-item v-for="item in pedido.items" :key="item.id">
                  <template #prepend>
                    <v-icon small>mdi-dot-large</v-icon>
                  </template>
                  <div class="d-flex justify-space-between align-center w-100">
                    <span class="text-caption">
                      {{ item.cantidad }}x {{ item.nombreServicioSnapshot }}
                    </span>
                    <span class="text-caption font-weight-bold">
                      ${{ formatearPrecio(item.subtotal) }}
                    </span>
                  </div>
                </v-list-item>
              </v-list>
            </div>

            <!-- Notas -->
            <v-expand-transition>
              <div v-if="pedido.notaCliente || pedido.notaEmpleado" class="mb-4">
                <div v-if="pedido.notaCliente" class="mb-2">
                  <div class="text-caption text-medium-emphasis">Tu nota:</div>
                  <div class="text-caption bg-blue-lighten-5 pa-2 rounded">
                    {{ pedido.notaCliente }}
                  </div>
                </div>
                <div v-if="pedido.notaEmpleado">
                  <div class="text-caption text-medium-emphasis">Nota del personal:</div>
                  <div class="text-caption bg-green-lighten-5 pa-2 rounded">
                    {{ pedido.notaEmpleado }}
                  </div>
                </div>
              </div>
            </v-expand-transition>

            <!-- Total -->
            <v-divider class="my-3" />
            <div class="d-flex justify-space-between align-center">
              <span class="font-weight-bold">Total:</span>
              <span class="text-h6 font-weight-bold text-success">
                ${{ formatearPrecio(pedido.totalPedido) }}
              </span>
            </div>
          </v-card-text>

          <!-- Acciones -->
          <v-card-actions class="pt-0">
            <v-btn
              v-if="pedido.estadoPedido === 'pendiente'"
              color="error"
              variant="text"
              size="small"
              @click="cancelarPedido(pedido.id)"
            >
              Cancelar
            </v-btn>
            <v-spacer />
            <v-btn
              color="primary"
              variant="text"
              size="small"
              @click="mostrarDetalle(pedido)"
            >
              Ver detalle
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog de detalle -->
    <v-dialog v-model="dialogoDetalle" max-width="500">
      <v-card v-if="pedidoDetalle">
        <v-card-title>Detalle del Pedido #{{ pedidoDetalle.id }}</v-card-title>
        <v-divider />
        <v-card-text class="pt-4">
          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-1">Estado actual:</div>
            <v-chip :color="getColorChip(pedidoDetalle.estadoPedido)" text-color="white">
              {{ formatearEstado(pedidoDetalle.estadoPedido) }}
            </v-chip>
          </div>

          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-1">Fecha de pedido:</div>
            <div>{{ formatearFechYHora(pedidoDetalle.fechaPedido) }}</div>
          </div>

          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-1">Última actualización:</div>
            <div>{{ formatearFechYHora(pedidoDetalle.fechaActualizacion) }}</div>
          </div>

          <v-divider class="my-3" />

          <div class="font-weight-bold mb-2">Items detallados:</div>
          <v-list dense>
            <v-list-item v-for="item in pedidoDetalle.items" :key="item.id">
              <template #prepend>
                <v-icon>mdi-shopping-outline</v-icon>
              </template>
              <div class="w-100">
                <div class="font-weight-medium">{{ item.nombreServicioSnapshot }}</div>
                <div class="text-caption">
                  {{ item.cantidad }} × ${{ formatearPrecio(item.precioUnitarioSnapshot) }} =
                  ${{ formatearPrecio(item.subtotal) }}
                </div>
                <div v-if="item.observacion" class="text-caption text-medium-emphasis">
                  Nota: {{ item.observacion }}
                </div>
              </div>
            </v-list-item>
          </v-list>

          <v-divider class="my-3" />
          <div class="d-flex justify-space-between font-weight-bold">
            <span>Total:</span>
            <span class="text-success">${{ formatearPrecio(pedidoDetalle.totalPedido) }}</span>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="dialogoDetalle = false"> Cerrar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { UserRole } from '~/types/auth';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { useServiciosStore } from '~/stores/servicios';
import { useReservasStore } from '~/stores/reservas';
import { useAuthStore } from '~/stores/auth';
import { useNotification } from '~/composables/useNotification';
import type { Pedido } from '~/types/servicios';

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.CLIENTE],
});

useHead({ title: 'Mis Pedidos' });

const router = useRouter();
const route = useRoute();
const serviciosStore = useServiciosStore();
const reservasStore = useReservasStore();
const authStore = useAuthStore();
const notification = useNotification();

// State
const dialogoDetalle = ref(false);
const pedidoDetalle = ref<Pedido | null>(null);
let refreshInterval: any = null;

// Computed
const pedidosFiltrados = computed(() => {
  // Si hay un parámetro de reserva en la URL, filtrar por ese
  const reservaIdParam = route.query.reservaId;
  if (reservaIdParam) {
    return serviciosStore.pedidosActivos.filter(
      (p) => p.idReserva === Number(reservaIdParam),
    );
  }
  return serviciosStore.pedidosActivos;
});

// Methods
const getColorPorEstado = (estado: string): string => {
  switch (estado) {
    case 'pendiente':
      return '#fff3cd';
    case 'en_preparacion':
      return '#cfe2ff';
    case 'listo':
      return '#d1e7dd';
    case 'entregado':
      return '#d1e7dd';
    case 'cancelado':
      return '#f8d7da';
    default:
      return '#ffffff';
  }
};

const getColorChip = (estado: string): string => {
  switch (estado) {
    case 'pendiente':
      return '#ff9800';
    case 'en_preparacion':
      return '#2196f3';
    case 'listo':
      return '#66bb6a';
    case 'entregado':
      return '#4caf50';
    case 'cancelado':
      return '#f44336';
    default:
      return '#9e9e9e';
  }
};

const getIconoPorEstado = (estado: string): string => {
  switch (estado) {
    case 'pendiente':
      return '⏳';
    case 'en_preparacion':
      return '👨‍🍳';
    case 'listo':
      return '✓';
    case 'entregado':
      return '✓✓';
    case 'cancelado':
      return '✗';
    default:
      return '?';
  }
};

const formatearEstado = (estado: string): string => {
  const map: Record<string, string> = {
    pendiente: 'Pendiente',
    en_preparacion: 'En Preparación',
    listo: 'Listo',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  };
  return map[estado] || estado;
};

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

const formatearFecha = (fecha: string | Date): string => {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-CO');
};

const formatearFechYHora = (fecha: string | Date): string => {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-CO') + ' ' + d.toLocaleTimeString('es-CO');
};

const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio);
};

const cancelarPedido = async (idPedido: number) => {
  if (confirm('¿Deseas cancelar este pedido?')) {
    try {
      await serviciosStore.cancelarPedido(idPedido);
      notification.success('Pedido cancelado');
    } catch (error: any) {
      notification.error(error?.message || 'Error al cancelar');
    }
  }
};

const mostrarDetalle = (pedido: Pedido) => {
  pedidoDetalle.value = pedido;
  dialogoDetalle.value = true;
};

const refrescarPedidos = async () => {
  const reservaActual = reservasStore.reservas.find(
    (r) =>
      r.idCliente === authStore.user?.idCliente &&
      r.estadoReserva?.toLowerCase() !== 'cancelada',
  );

  if (reservaActual) {
    try {
      await serviciosStore.cargarMisPedidos(reservaActual.id);
    } catch (error) {
      console.error('Error refrescando:', error);
    }
  }
};

const irAlCatalogo = () => {
  router.push('/dashboard/cliente/servicios');
};

onMounted(async () => {
  // Cargar pedidos de la reserva actual
  const reservaActual = reservasStore.reservas.find(
    (r) =>
      r.idCliente === authStore.user?.idCliente &&
      r.estadoReserva?.toLowerCase() !== 'cancelada',
  );

  if (reservaActual) {
    try {
      await serviciosStore.cargarMisPedidos(reservaActual.id);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    }

    // Refresh automático cada 30 segundos
    refreshInterval = setInterval(async () => {
      try {
        await serviciosStore.cargarMisPedidos(reservaActual.id);
      } catch (error) {
        console.error('Error en auto-refresh:', error);
      }
    }, 30000);
  }
});

// Limpiar intervalo al desmontar
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
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
</style>
