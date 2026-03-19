<template>
  <v-container>
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" />
      <p class="mt-4 text-body-2">Cargando confirmación...</p>
    </div>

    <div v-else-if="reserva" class="py-8">
      <!-- Éxito -->
      <div class="text-center mb-8">
        <v-icon icon="mdi-check-circle" size="80" color="success" class="mb-4" />
        <h1 class="text-h4 font-weight-bold mb-2">¡Reserva Confirmada!</h1>
        <p class="text-body-1 text-medium-emphasis">
          Tu reserva ha sido procesada exitosamente
        </p>
      </div>

      <!-- Información de confirmación -->
      <v-row class="mb-8">
        <v-col cols="12" md="8" offset-md="2">
          <v-card class="card-glow">
            <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-information" start />
              Datos de la Reserva
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-6">
              <!-- Código de confirmación -->
              <div class="mb-4 pa-4 rounded bg-info-lighten-5">
                <p class="text-caption text-medium-emphasis mb-1">Código de confirmación</p>
                <p class="text-h6 font-weight-bold font-mono">{{ reserva.codigoConfirmacion }}</p>
                <p class="text-caption text-medium-emphasis mt-2">
                  Guarda este código para tu registro
                </p>
              </div>

              <!-- Información de la habitación -->
              <div class="mb-4">
                <h3 class="text-subtitle-1 font-weight-bold mb-3">Habitación</h3>
                <v-row>
                  <v-col cols="6">
                    <p class="text-caption text-medium-emphasis mb-1">Tipo</p>
                    <p class="text-body-2 font-weight-bold">
                      {{ reserva.tipoHabitacion?.nombreTipo }}
                    </p>
                  </v-col>
                  <v-col cols="6">
                    <p class="text-caption text-medium-emphasis mb-1">Número</p>
                    <p class="text-body-2 font-weight-bold">
                      {{ reserva.habitacion?.numeroHabitacion }}
                    </p>
                  </v-col>
                </v-row>
              </div>

              <v-divider class="my-4" />

              <!-- Fechas -->
              <div class="mb-4">
                <h3 class="text-subtitle-1 font-weight-bold mb-3">Fechas</h3>
                <v-row>
                  <v-col cols="6">
                    <p class="text-caption text-medium-emphasis mb-1">Check-in</p>
                    <p class="text-body-2 font-weight-bold">
                      {{ formatDate(reserva.checkinPrevisto) }}
                    </p>
                  </v-col>
                  <v-col cols="6">
                    <p class="text-caption text-medium-emphasis mb-1">Check-out</p>
                    <p class="text-body-2 font-weight-bold">
                      {{ formatDate(reserva.checkoutPrevisto) }}
                    </p>
                  </v-col>
                </v-row>
              </div>

              <v-divider class="my-4" />

              <!-- Detalles -->
              <div class="mb-4">
                <h3 class="text-subtitle-1 font-weight-bold mb-3">Detalles</h3>
                <v-row>
                  <v-col cols="6">
                    <p class="text-caption text-medium-emphasis mb-1">Huéspedes</p>
                    <p class="text-body-2 font-weight-bold">{{ reserva.numeroHuespedes }}</p>
                  </v-col>
                  <v-col cols="6">
                    <p class="text-caption text-medium-emphasis mb-1">Precio/Noche</p>
                    <p class="text-body-2 font-weight-bold">
                      ${{ Number(reserva.precioNocheSnapshot).toLocaleString() }}
                    </p>
                  </v-col>
                </v-row>
              </div>

              <div v-if="numeroNoches > 0" class="mb-4">
                <v-row>
                  <v-col cols="6">
                    <p class="text-caption text-medium-emphasis mb-1">Noches</p>
                    <p class="text-body-2 font-weight-bold">{{ numeroNoches }}</p>
                  </v-col>
                  <v-col cols="6">
                    <p class="text-caption text-medium-emphasis mb-1">Total</p>
                    <p class="text-h6 font-weight-bold text-primary">
                      ${{ calcularTotal().toLocaleString() }}
                    </p>
                  </v-col>
                </v-row>
              </div>

              <v-divider class="my-4" />

              <!-- Estado -->
              <div class="mb-4">
                <p class="text-caption text-medium-emphasis mb-2">Estado de la reserva</p>
                <v-chip
                  :color="getEstadoColor(reserva.estadoReserva)"
                  variant="tonal"
                  label
                >
                  {{ reserva.estadoReserva }}
                </v-chip>
              </div>

              <!-- Observaciones -->
              <div v-if="reserva.observaciones" class="mb-4">
                <p class="text-caption text-medium-emphasis mb-1">Observaciones</p>
                <p class="text-body-2">{{ reserva.observaciones }}</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Acciones -->
      <div class="text-center">
        <v-btn
          to="/cliente"
          color="primary"
          size="large"
          class="mr-3"
        >
          <v-icon start icon="mdi-home" />
          Ir al Dashboard
        </v-btn>
        <v-btn
          to="/cliente/reservas/nueva"
          variant="outlined"
          color="primary"
          size="large"
        >
          <v-icon start icon="mdi-plus" />
          Crear otra Reserva
        </v-btn>
      </div>

      <!-- Información adicional -->
      <v-row class="mt-8">
        <v-col cols="12" md="6">
          <v-card variant="tonal" color="info">
            <v-card-text>
              <p class="text-subtitle-2 font-weight-bold mb-2">
                <v-icon icon="mdi-email" start size="18" />
                Confirmación por Email
              </p>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Se ha enviado una confirmación a {{ userEmail }}. Verifica tu bandeja de entrada.
              </p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card variant="tonal" color="warning">
            <v-card-text>
              <p class="text-subtitle-2 font-weight-bold mb-2">
                <v-icon icon="mdi-clock" start size="18" />
                Próximos Pasos
              </p>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Dirígete al hotel en la fecha de check-in con tu código de confirmación.
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div v-else class="text-center py-12">
      <v-icon icon="mdi-alert-circle" size="80" color="grey-darken-1" class="mb-4 opacity-50" />
      <h2 class="text-h6 font-weight-medium mb-2">Reserva no encontrada</h2>
      <p class="text-body-2 text-medium-emphasis mb-4">
        No encontramos información de esta reserva
      </p>
      <v-btn to="/cliente/reservas/nueva" color="primary">
        <v-icon start icon="mdi-arrow-left" />
        Volver a Reservas
      </v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { Reserva } from '~/types/api'

definePageMeta({
  middleware: ['auth'],
})

useHead({ title: 'Confirmación de Reserva' })

const route = useRoute()
const authStore = useAuthStore()
const { obtenerReserva, obtenerReservaPorCodigo } = useReservas()

const loading = ref(true)
const reserva = ref<Reserva | null>(null)
const userEmail = computed(() => authStore.userEmail)

const numeroNoches = computed(() => {
  if (!reserva.value) return 0
  const checkin = new Date(reserva.value.checkinPrevisto)
  const checkout = new Date(reserva.value.checkoutPrevisto)
  return Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24))
})

const formatDate = (fecha?: Date | string): string => {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const calcularTotal = (): number => {
  if (!reserva.value) return 0
  return (reserva.value.precioNocheSnapshot || 0) * numeroNoches.value
}

const getEstadoColor = (estado?: string): string => {
  const colores: Record<string, string> = {
    confirmada: 'success',
    pendiente: 'warning',
    cancelada: 'error',
    completada: 'info',
  }
  return colores[estado || 'pendiente'] || 'grey'
}

onMounted(async () => {
  try {
    loading.value = true
    
    // Primero intenta con el código de confirmación
    const codigo = route.query.codigo as string
    if (codigo) {
      reserva.value = await obtenerReservaPorCodigo(codigo)
    }
    
    // Si no lo encontró por código, intenta por ID
    if (!reserva.value) {
      const idReserva = route.query.id as string
      if (idReserva) {
        reserva.value = await obtenerReserva(Number(idReserva))
      }
    }
  } catch (error) {
    console.error('Error al cargar reserva:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.font-mono {
  font-family: 'Courier New', monospace;
  letter-spacing: 0.05em;
}
</style>
