<template>
  <div class="pa-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold mb-1">Mi Cuenta</h1>
      <p class="text-body-2 text-medium-emphasis">
        Resumen de tu consumo durante la estadía
      </p>
    </div>

    <!-- Cargando -->
    <v-progress-circular
      v-if="serviciosStore.loading"
      indeterminate
      color="primary"
      class="mx-auto"
    />

    <!-- Sin datos -->
    <v-alert
      v-else-if="!serviciosStore.cuentaActual"
      type="warning"
    >
      <v-alert-title>Sin información</v-alert-title>
      No há información disponible de tu reserva
    </v-alert>

    <!-- Información de la reserva -->
    <v-row v-else>
      <!-- Información de la reserva -->
      <v-col cols="12" md="8">
        <v-card class="card-glow mb-6">
          <v-card-title>Información de la Reserva</v-card-title>
          <v-divider />
          <v-card-text class="pt-4">
            <v-row>
              <v-col cols="12" sm="6">
                <div class="mb-4">
                  <span class="text-caption text-medium-emphasis">Código de Confirmación:</span>
                  <div class="text-h6 font-weight-bold">
                    {{ serviciosStore.cuentaActual.reserva.codigoConfirmacion }}
                  </div>
                </div>
                <div class="mb-4">
                  <span class="text-caption text-medium-emphasis">Habitación:</span>
                  <div class="text-h6 font-weight-bold">
                    Nro. {{ serviciosStore.cuentaActual.reserva.habitacion }}
                  </div>
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="mb-4">
                  <span class="text-caption text-medium-emphasis">Check-in:</span>
                  <div class="font-weight-medium">
                    {{ formatearFecha(serviciosStore.cuentaActual.reserva.checkin) }}
                  </div>
                </div>
                <div class="mb-4">
                  <span class="text-caption text-medium-emphasis">Check-out:</span>
                  <div class="font-weight-medium">
                    {{ formatearFecha(serviciosStore.cuentaActual.reserva.checkout) }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Desglose de costos -->
        <v-card class="card-glow">
          <v-card-title>Desglose de Costos</v-card-title>
          <v-divider />
          <v-table>
            <thead>
              <tr>
                <th>Concepto</th>
                <th text-align="right">Detalle</th>
                <th text-align="right">Valor</th>
              </tr>
            </thead>
            <tbody>
              <!-- Habitación -->
              <tr>
                <td>
                  <div class="font-weight-bold">Hospedaje</div>
                </td>
                <td text-align="right" class="text-caption">
                  {{ serviciosStore.cuentaActual.noches }} noche(s) ×
                  ${{ formatearPrecio(serviciosStore.cuentaActual.precioNoche) }}
                </td>
                <td text-align="right" class="font-weight-bold">
                  ${{ formatearPrecio(serviciosStore.cuentaActual.subtotalHabitacion) }}
                </td>
              </tr>

              <!-- Servicios por categoría -->
              <tr v-for="(monto, categoria) in serviciosStore.cuentaActual.resumenPorCategoria" :key="categoria">
                <td>
                  <div class="font-weight-bold">{{ formatearCategoria(categoria) }}</div>
                </td>
                <td text-align="right" class="text-caption">
                  (Entregados)
                </td>
                <td text-align="right" class="font-weight-bold">
                  ${{ formatearPrecio(monto) }}
                </td>
              </tr>

              <!-- Subtotal de servicios si hay -->
              <tr v-if="serviciosStore.cuentaActual.subtotalServicios > 0">
                <td colspan="2" class="text-right font-weight-bold">Subtotal Servicios:</td>
                <td text-align="right" class="font-weight-bold">
                  ${{ formatearPrecio(serviciosStore.cuentaActual.subtotalServicios) }}
                </td>
              </tr>

              <!-- Total general -->
              <tr class="bg-success-lighten-5">
                <td colspan="2" class="text-right font-weight-bold text-h6">TOTAL A PAGAR:</td>
                <td text-align="right" class="font-weight-bold text-h6 text-success">
                  ${{ formatearPrecio(serviciosStore.cuentaActual.totalGeneral) }}
                </td>
              </tr>
            </tbody>
          </v-table>

          <v-divider />
          <v-card-text class="pt-4">
            <v-alert type="info" class="mb-0">
              <v-alert-title>Información importante</v-alert-title>
              <p class="mb-0">
                Este es un resumen de tu consumo. Al realizar el check-out, el recepcionista
                te mostrará el total a pagar. Solo se incluyen servicios que han sido
                <strong>entregados</strong>.
              </p>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Panel lateral - Resumen rápido -->
      <v-col cols="12" md="4">
        <!-- Resumen total -->
        <v-card class="card-glow bg-success-lighten-5 mb-6">
          <v-card-text class="text-center py-8">
            <div class="text-caption text-medium-emphasis mb-2">TOTAL A PAGAR</div>
            <div class="text-h3 font-weight-bold text-success">
              ${{ formatearPrecio(serviciosStore.cuentaActual.totalGeneral) }}
            </div>
            <v-divider class="my-4" />
            <div class="text-caption">
              <p class="mb-1">
                <strong>{{ serviciosStore.cuentaActual.noches }}</strong> noche(s) de hospedaje
              </p>
              <p class="mb-1">
                <strong>{{ serviciosStore.cuentaActual.pedidos.length }}</strong> servicio(s) entregado(s)
              </p>
            </div>
          </v-card-text>
        </v-card>

        <!-- Servicios entregados -->
        <v-card class="card-glow" v-if="serviciosStore.cuentaActual.pedidos.length > 0">
          <v-card-title class="text-subtitle-1">Servicios Entregados</v-card-title>
          <v-divider />
          <v-list dense>
            <v-list-item v-for="pedido in serviciosStore.cuentaActual.pedidos" :key="pedido.id">
              <template #prepend>
                <v-icon size="small">mdi-check-circle</v-icon>
              </template>
              <div class="w-100">
                <div class="text-caption font-weight-medium">{{ formatearCategoria(pedido.categoria) }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ pedido.items.length }} ítem(s) - ${{ formatearPrecio(pedido.totalPedido) }}
                </div>
              </div>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- Sin servicios -->
        <v-card class="card-glow" v-else variant="outlined">
          <v-card-text class="text-center py-6">
            <v-icon size="48" color="grey-lighten-1" class="d-block mb-2">
              mdi-shopping-outline
            </v-icon>
            <p class="text-caption text-medium-emphasis">No hay servicios entregados</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onMounted } from 'vue';
import { useServiciosStore } from '~/stores/servicios';
import { useReservasStore } from '~/stores/reservas';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['cliente'],
});

useHead({ title: 'Mi Cuenta' });

const serviciosStore = useServiciosStore();
const reservasStore = useReservasStore();
const authStore = useAuthStore();

const formatearFecha = (fecha: string | Date): string => {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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

const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio);
};

onMounted(async () => {
  // Obtener la reserva actual del cliente
  const reservaActual = reservasStore.reservas.find(
    (r) =>
      r.idCliente === authStore.user?.idCliente &&
      r.estadoReserva?.toLowerCase() !== 'cancelada',
  );

  if (reservaActual) {
    try {
      await serviciosStore.cargarCuenta(reservaActual.id);
    } catch (error) {
      console.error('Error cargando cuenta:', error);
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
}
</style>
