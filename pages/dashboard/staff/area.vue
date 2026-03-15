<template>
  <div class="pa-6">
    <!-- Header dinámico según el rol -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">{{ getTituloPanel() }}</h1>
        <p class="text-body-2 text-medium-emphasis">
          Gestiona los pedidos de tu área
        </p>
      </div>
      <v-btn
        color="primary"
        variant="outlined"
        prepend-icon="mdi-refresh"
        @click="refrescarPedidos"
        :loading="pedidosAreaStore.loading"
      >
        Actualizar
      </v-btn>
    </div>

    <!-- Información de rol -->
    <v-alert type="info" class="mb-6" closable>
      <v-alert-title>Tu rol: {{ getRolLabel() }}</v-alert-title>
      Visualizando pedidos de <strong>{{ getCategoria() }}</strong>
    </v-alert>

    <!-- Columnas Kanban -->
    <v-row class="ga-4">
      <!-- PENDIENTES -->
      <v-col cols="12" sm="6" md="3">
        <div class="state-header bg-warning">
          <v-icon>mdi-clock-outline</v-icon>
          <span>PENDIENTES</span>
          <v-chip size="small" variant="flat">
            {{ pedidosPorEstado('pendiente').length }}
          </v-chip>
        </div>
        <v-card v-if="pedidosPorEstado('pendiente').length === 0" variant="outlined" class="py-6 text-center">
          <p class="text-caption text-medium-emphasis">Sin pedidos</p>
        </v-card>
        <div v-else class="state-cards">
          <v-card
            v-for="pedido in pedidosPorEstado('pendiente')"
            :key="pedido.id"
            class="pedido-card mb-3 cursor-pointer"
            @click="mostrarDetalle(pedido)"
            hover
          >
            <v-card-text>
              <div class="d-flex justify-space-between align-start mb-2">
                <div class="font-weight-bold">Hab. {{ getNumeroHabitacion(pedido) }}</div>
                <v-chip size="x-small" color="warning" text-color="white">
                  Pendiente
                </v-chip>
              </div>
              <div class="text-caption mb-2">
                {{ pedido.items.length }} ítem(s)
              </div>
              <v-btn
                size="small"
                color="success"
                block
                @click.stop="cambiarEstado(pedido.id, 'en_preparacion')"
              >
                Iniciar preparación
              </v-btn>
            </v-card-text>
          </v-card>
        </div>
      </v-col>

      <!-- EN PREPARACIÓN -->
      <v-col cols="12" sm="6" md="3">
        <div class="state-header bg-info">
          <v-icon>mdi-chef-hat</v-icon>
          <span>EN PREPARACIÓN</span>
          <v-chip size="small" variant="flat">
            {{ pedidosPorEstado('en_preparacion').length }}
          </v-chip>
        </div>
        <v-card v-if="pedidosPorEstado('en_preparacion').length === 0" variant="outlined" class="py-6 text-center">
          <p class="text-caption text-medium-emphasis">Sin pedidos</p>
        </v-card>
        <div v-else class="state-cards">
          <v-card
            v-for="pedido in pedidosPorEstado('en_preparacion')"
            :key="pedido.id"
            class="pedido-card mb-3 cursor-pointer"
            @click="mostrarDetalle(pedido)"
            hover
          >
            <v-card-text>
              <div class="d-flex justify-space-between align-start mb-2">
                <div class="font-weight-bold">Hab. {{ getNumeroHabitacion(pedido) }}</div>
                <v-chip size="x-small" color="info" text-color="white">
                  En preparación
                </v-chip>
              </div>
              <div class="text-caption mb-3">
                {{ pedido.items.length }} ítem(s)
              </div>
              <div class="d-grid ga-2">
                <v-btn
                  size="small"
                  color="primary"
                  density="compact"
                  @click.stop="cambiarEstado(pedido.id, 'listo')"
                  v-if="pedido.tipoEntrega === 'recogida'"
                >
                  Marcar listo (recogida)
                </v-btn>
                <v-btn
                  size="small"
                  color="success"
                  density="compact"
                  @click.stop="cambiarEstado(pedido.id, 'entregado')"
                  v-if="pedido.tipoEntrega === 'delivery'"
                >
                  Marcar entregado
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-col>

      <!-- LISTOS -->
      <v-col cols="12" sm="6" md="3">
        <div class="state-header bg-primary">
          <v-icon>mdi-check-circle</v-icon>
          <span>LISTOS</span>
          <v-chip size="small" variant="flat">
            {{ pedidosPorEstado('listo').length }}
          </v-chip>
        </div>
        <v-card v-if="pedidosPorEstado('listo').length === 0" variant="outlined" class="py-6 text-center">
          <p class="text-caption text-medium-emphasis">Sin pedidos</p>
        </v-card>
        <div v-else class="state-cards">
          <v-card
            v-for="pedido in pedidosPorEstado('listo')"
            :key="pedido.id"
            class="pedido-card mb-3 cursor-pointer"
            @click="mostrarDetalle(pedido)"
            hover
          >
            <v-card-text>
              <div class="d-flex justify-space-between align-start mb-2">
                <div class="font-weight-bold">Hab. {{ getNumeroHabitacion(pedido) }}</div>
                <v-chip size="x-small" color="primary" text-color="white">
                  Listo
                </v-chip>
              </div>
              <div class="text-caption mb-3">
                {{ pedido.items.length }} ítem(s)
              </div>
              <v-btn
                size="small"
                color="success"
                block
                @click.stop="cambiarEstado(pedido.id, 'entregado')"
              >
                Confirmar recogida
              </v-btn>
            </v-card-text>
          </v-card>
        </div>
      </v-col>

      <!-- ENTREGADOS HOY -->
      <v-col cols="12" sm="6" md="3">
        <div class="state-header bg-success">
          <v-icon>mdi-check-all</v-icon>
          <span>ENTREGADOS HOY</span>
          <v-chip size="small" variant="flat">
            {{ conteoEntregadosHoy() }}
          </v-chip>
        </div>
        <v-card v-if="pedidosEntregados().length === 0" variant="outlined" class="py-6 text-center">
          <p class="text-caption text-medium-emphasis">Sin entregas</p>
        </v-card>
        <div v-else class="state-cards">
          <v-card
            v-for="pedido in pedidosEntregados()"
            :key="pedido.id"
            class="pedido-card mb-3 cursor-pointer bg-success-lighten-5"
            @click="mostrarDetalle(pedido)"
            hover
          >
            <v-card-text>
              <div class="d-flex justify-space-between align-start mb-2">
                <div class="font-weight-bold">Hab. {{ getNumeroHabitacion(pedido) }}</div>
                <v-chip size="x-small" color="success" text-color="white">
                  Entregado
                </v-chip>
              </div>
              <div class="text-caption">
                {{ pedido.items.length }} ítem(s) • ${{ formatearPrecio(pedido.totalPedido) }}
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <!-- Dialog detalle -->
    <v-dialog v-model="dialogoDetalle" max-width="600">
      <v-card v-if="pedidoSeleccionado">
        <v-card-title>Detalle del Pedido #{{ pedidoSeleccionado.id }}</v-card-title>
        <v-divider />
        <v-card-text class="pt-4">
          <!-- Información general -->
          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-1">Habitación:</div>
            <div class="text-h6 font-weight-bold">{{ getNumeroHabitacion(pedidoSeleccionado) }}</div>
          </div>

          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-1">Estado:</div>
            <v-chip :color="getColorEstado(pedidoSeleccionado.estadoPedido)" text-color="white">
              {{ formatearEstado(pedidoSeleccionado.estadoPedido) }}
            </v-chip>
          </div>

          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-1">Tipo de entrega:</div>
            <div class="font-weight-medium">
              {{ pedidoSeleccionado.tipoEntrega === 'delivery' ? '🚴 Delivery a habitación' : '🚶 Recogida' }}
            </div>
          </div>

          <!-- Items -->
          <v-divider class="my-3" />
          <div class="font-weight-bold mb-2">Items del pedido:</div>
          <v-list dense>
            <v-list-item v-for="item in pedidoSeleccionado.items" :key="item.id">
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
                  📝 {{ item.observacion }}
                </div>
              </div>
            </v-list-item>
          </v-list>

          <!-- Notas -->
          <v-divider class="my-3" />
          <div v-if="pedidoSeleccionado.notaCliente || pedidoSeleccionado.notaEmpleado">
            <div v-if="pedidoSeleccionado.notaCliente" class="mb-2">
              <div class="text-caption font-weight-bold mb-1">Nota del cliente:</div>
              <v-card variant="outlined" class="pa-2">
                <div class="text-caption">{{ pedidoSeleccionado.notaCliente }}</div>
              </v-card>
            </div>
            <div v-if="pedidoSeleccionado.notaEmpleado">
              <div class="text-caption font-weight-bold mb-1">Tu nota:</div>
              <v-card variant="outlined" class="pa-2" color="blue-lighten-5">
                <div class="text-caption">{{ pedidoSeleccionado.notaEmpleado }}</div>
              </v-card>
            </div>
          </div>

          <!-- Campo para agregar nota -->
          <v-divider class="my-3" />
          <v-textarea
            v-model="notaTmp"
            label="Agregar nota al cambiar estado"
            outlined
            rows="2"
            counter
            maxlength="200"
          />

          <!-- Total -->
          <div class="mt-4 pt-3 border-top">
            <div class="d-flex justify-space-between">
              <span class="font-weight-bold">Total:</span>
              <span class="text-h6 font-weight-bold text-success">
                ${{ formatearPrecio(pedidoSeleccionado.totalPedido) }}
              </span>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" @click="dialogoDetalle = false">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePedidosAreaStore } from '~/stores/pedidosArea';
import { useAuthStore } from '~/stores/auth';
import { useNotification } from '~/composables/useNotification';
import { UserRole } from '~/types/auth';
import type { Pedido } from '~/types/servicios';

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.CAFETERIA, UserRole.LAVANDERIA, UserRole.SPA, UserRole.ROOM_SERVICE, UserRole.ADMIN, UserRole.SUPERADMIN],
});

useHead({ title: 'Mi Panel' });

const pedidosAreaStore = usePedidosAreaStore();
const authStore = useAuthStore();
const notification = useNotification();

// State
const dialogoDetalle = ref(false);
const pedidoSeleccionado = ref<Pedido | null>(null);
const notaTmp = ref('');
let refreshInterval: any = null;

// Methods
const getTituloPanel = (): string => {
  const rol = authStore.user?.role || '';
  const titles: Record<string, string> = {
    cafeteria: 'Panel Cafetería ☕',
    lavanderia: 'Panel Lavandería 👔',
    spa: 'Panel Spa 💆',
    room_service: 'Panel Room Service 🛎️',
  };
  return titles[rol] || 'Mi Panel';
};

const getRolLabel = (): string => {
  const rol = authStore.user?.role || '';
  const labels: Record<string, string> = {
    cafeteria: 'Cafetería',
    lavanderia: 'Lavandería',
    spa: 'Spa',
    room_service: 'Room Service',
  };
  return labels[rol] || rol;
};

const getCategoria = (): string => {
  const rol = authStore.user?.role || '';
  const mapa: Record<string, string> = {
    cafeteria: 'cafeteria',
    lavanderia: 'lavanderia',
    spa: 'spa',
    room_service: 'room_service',
  };
  return mapa[rol] || rol;
};

const getNumeroHabitacion = (pedido: Pedido): string => {
  // Extraer número de habitación del código de confirmación o mostrar "-"
  return 'Habitación'; // Placeholder, se podría mejorar si hay datos de habitación
};

const pedidosPorEstado = (estado: string): Pedido[] => {
  return pedidosAreaStore.pedidos.filter((p) => p.estadoPedido === estado);
};

const pedidosEntregados = (): Pedido[] => {
  return pedidosAreaStore.pedidos
    .filter((p) => p.estadoPedido === 'entregado')
    .sort((a, b) => new Date(b.fechaActualizacion).getTime() - new Date(a.fechaActualizacion).getTime())
    .slice(0, 10);
};

const conteoEntregadosHoy = (): number => {
  const hoy = new Date();
  return pedidosAreaStore.pedidos.filter((p) => {
    const fecha = new Date(p.fechaActualizacion);
    return (
      p.estadoPedido === 'entregado' &&
      fecha.getDate() === hoy.getDate() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getFullYear() === hoy.getFullYear()
    );
  }).length;
};

const getColorEstado = (estado: string): string => {
  switch (estado) {
    case 'pendiente':
      return '#ff9800';
    case 'en_preparacion':
      return '#2196f3';
    case 'listo':
      return '#1976d2';
    case 'entregado':
      return '#4caf50';
    default:
      return '#9e9e9e';
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

const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio);
};

const mostrarDetalle = (pedido: Pedido) => {
  pedidoSeleccionado.value = pedido;
  notaTmp.value = '';
  dialogoDetalle.value = true;
};

const cambiarEstado = async (idPedido: number, estadoNuevo: string) => {
  try {
    await pedidosAreaStore.actualizarEstadoPedido(idPedido, estadoNuevo, notaTmp.value || undefined);
    notification.success('Estado actualizado');
    dialogoDetalle.value = false;
    notaTmp.value = '';
  } catch (error: any) {
    notification.error(error?.message || 'Error actualizando estado');
  }
};

const refrescarPedidos = async () => {
  const idHotel = authStore.user?.idHotel;
  const categoria = getCategoria();

  if (idHotel && categoria) {
    try {
      await pedidosAreaStore.cargarPedidos(idHotel, categoria);
      notification.success('Pedidos actualizados');
    } catch (error) {
      console.error('Error refrescando:', error);
    }
  }
};

onMounted(async () => {
  const idHotel = authStore.user?.idHotel;
  const categoria = getCategoria();

  if (idHotel && categoria) {
    try {
      await pedidosAreaStore.cargarPedidos(idHotel, categoria);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    }

    // Refresh automático cada 20 segundos
    refreshInterval = setInterval(async () => {
      try {
        await pedidosAreaStore.cargarPedidos(idHotel, categoria);
      } catch (error) {
        console.error('Error en auto-refresh:', error);
      }
    }, 20000);
  }
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
.state-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 12px;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  margin-bottom: 1rem;
}

.state-header i {
  font-size: 20px;
}

.state-cards {
  min-height: 400px;
}

.pedido-card {
  transition: all 0.2s ease;
  border-left: 4px solid;
}

.pedido-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cursor-pointer {
  cursor: pointer;
}

.bg-warning {
  background-color: #ff9800 !important;
}

.bg-info {
  background-color: #2196f3 !important;
}

.bg-primary {
  background-color: #1976d2 !important;
}

.bg-success {
  background-color: #4caf50 !important;
}
</style>
