<template>
  <div class="pa-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Resumen del Pedido</h1>
        <p class="text-body-2 text-medium-emphasis">
          Revisa tu pedido antes de confirmar
        </p>
      </div>
      <v-btn
        color="grey"
        variant="outlined"
        prepend-icon="mdi-arrow-left"
        @click="volverAlCatalogo"
      >
        Volver al catálogo
      </v-btn>
    </div>

    <!-- Carrito vacío -->
    <v-alert v-if="serviciosStore.carrito.length === 0" type="info" class="mb-6">
      <v-alert-title>Carrito vacío</v-alert-title>
      <v-btn color="primary" variant="text" @click="volverAlCatalogo">
        Ir al catálogo de servicios
      </v-btn>
    </v-alert>

    <v-row v-else>
      <!-- Tabla de items -->
      <v-col cols="12" md="8">
        <v-card class="card-glow">
          <v-card-title> Items del pedido </v-card-title>
          <v-divider />
          <v-table>
            <thead>
              <tr>
                <th>Servicio</th>
                <th text-align="center">Cant.</th>
                <th text-align="center">P. Unit.</th>
                <th text-align="center">Subtotal</th>
                <th text-align="center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in serviciosStore.carrito" :key="item.servicio.id">
                <td>
                  <div class="font-weight-medium">{{ item.servicio.nombre }}</div>
                  <div v-if="item.observacion" class="text-caption text-medium-emphasis">
                    Nota: {{ item.observacion }}
                  </div>
                </td>
                <td text-align="center">
                  <v-text-field
                    v-model.number="item.cantidad"
                    type="number"
                    min="1"
                    max="100"
                    @update:model-value="serviciosStore.actualizarCantidad(item.servicio.id, item.cantidad)"
                    style="width: 60px"
                  />
                </td>
                <td text-align="center">
                  ${{ formatearPrecio(item.servicio.precioUnitario) }}
                </td>
                <td text-align="center" class="font-weight-bold">
                  ${{ formatearPrecio(item.servicio.precioUnitario * item.cantidad) }}
                </td>
                <td text-align="center">
                  <v-icon-btn
                    icon="mdi-delete"
                    size="small"
                    color="error"
                    @click="serviciosStore.eliminarDelCarrito(item.servicio.id)"
                  />
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>

        <!-- Observaciones -->
        <v-card class="card-glow mt-4">
          <v-card-title>Observaciones (Opcional)</v-card-title>
          <v-card-text>
            <v-textarea
              v-model="serviciosStore.notaPedido"
              label="Nota especial para el personal"
              outlined
              rows="3"
              counter
              maxlength="300"
              placeholder="Ej. Llevar a las 3 PM, sin azúcar, etc."
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Resumen y confirmación -->
      <v-col cols="12" md="4">
        <v-card class="card-glow sticky-card">
          <v-card-title>Resumen</v-card-title>
          <v-divider />
          <v-card-text>
            <!-- Categoría -->
            <div class="mb-3">
              <span class="text-caption text-medium-emphasis">Categoría:</span>
              <div class="font-weight-bold">{{ formatearCategoria(serviciosStore.categoriaDelCarrito || '') }}</div>
            </div>

            <!-- Tipo de entrega -->
            <div class="mb-6">
              <v-radio-group
                v-model="serviciosStore.tipoEntregaSeleccionado"
                label="Tipo de entrega:"
              >
                <v-radio label="Delivery (a tu habitación)" value="delivery" />
                <v-radio label="Recogida (paso a buscar)" value="recogida" />
              </v-radio-group>
            </div>

            <!-- Total -->
            <v-divider class="my-4" />
            <div class="d-flex justify-space-between align-center mb-6">
              <span class="text-h6 font-weight-bold">Total:</span>
              <span class="text-h5 font-weight-bold text-success">
                ${{ formatearPrecio(serviciosStore.totalCarrito) }}
              </span>
            </div>

            <!-- Botón confirmar -->
            <v-btn
              color="success"
              size="large"
              block
              :loading="serviciosStore.loading"
              prepend-icon="mdi-check-circle"
              @click="confirmarPedido"
            >
              Confirmar Pedido
            </v-btn>

            <!-- Botón limpiar carrito -->
            <v-btn
              color="grey"
              variant="outlined"
              size="small"
              block
              class="mt-2"
              @click="serviciosStore.limpiarCarrito"
            >
              Limpiar carrito
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Info adicional -->
        <v-card class="card-glow mt-4" variant="outlined">
          <v-card-text class="text-caption">
            <p class="mb-2">
              <v-icon size="small" color="info">mdi-information</v-icon>
              Los precios pueden cambiar según cambios en el catálogo
            </p>
            <p>
              <v-icon size="small" color="info">mdi-information</v-icon>
              Estado del pedido: Puedes rastrear tu pedido en "Mis pedidos"
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { UserRole } from '~/types/auth';
import { useRouter } from 'vue-router';
import { useServiciosStore } from '~/stores/servicios';
import { useReservasStore } from '~/stores/reservas';
import { useAuthStore } from '~/stores/auth';
import { useNotification } from '~/composables/useNotification';

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.CLIENTE],
});

useHead({ title: 'Carrito de Servicios' });

const router = useRouter();
const serviciosStore = useServiciosStore();
const reservasStore = useReservasStore();
const authStore = useAuthStore();
const notification = useNotification();

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

const volverAlCatalogo = () => {
  router.push('/dashboard/cliente/servicios');
};

const confirmarPedido = async () => {
  // Obtener la reserva actual (debe estar en estado 'confirmada' para pedir servicios)
  const reservaActual = reservasStore.reservas.find(
    (r) =>
      r.idCliente === authStore.user?.idCliente &&
      r.estadoReserva?.toLowerCase() === 'confirmada' &&
      r.checkinReal, // Además, debe haber hecho check-in
  );

  if (!reservaActual) {
    notification.error(
      'No tienes una reserva activa en el hotel. ' +
      'Solo puedes pedir servicios si tienes una reserva confirmada y has hecho check-in.'
    );
    return;
  }

  // Construir payload
  const payload = {
    idReserva: reservaActual.id,
    tipoEntrega: serviciosStore.tipoEntregaSeleccionado,
    items: serviciosStore.carrito.map((item) => ({
      idServicio: item.servicio.id,
      cantidad: item.cantidad,
      observacion: item.observacion,
    })),
    notaCliente: serviciosStore.notaPedido || undefined,
  };

  try {
    await serviciosStore.crearPedido(payload);
    notification.success('Pedido confirmado exitosamente');
    serviciosStore.limpiarCarrito();
    router.push(`/dashboard/cliente/servicios/mis-pedidos?reservaId=${reservaActual.id}`);
  } catch (error: any) {
    notification.error(error?.message || 'Error al confirmar el pedido');
  }
};

onMounted(() => {
  // Si el carrito está vacío, redirigir al catálogo
  if (serviciosStore.carrito.length === 0) {
    // No redirigir automáticamente, dejar que el usuario lo haga
  }
});
</script>

<style scoped>
.card-glow {
  transition: all 0.3s ease;
}

.card-glow:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.sticky-card {
  position: sticky;
  top: 20px;
}
</style>
