<template>
  <div>
    <div v-if="!habitaciones || habitaciones.length === 0" class="text-center py-12">
      <v-icon icon="mdi-information-outline" size="48" class="mb-4 opacity-50" />
      <p class="text-body-1 text-medium-emphasis">
        {{ emptyMessage }}
      </p>
    </div>

    <v-row v-else class="ga-4">
      <v-col
        v-for="habitacion in habitaciones"
        :key="habitacion.id"
        cols="12"
        md="6"
      >
        <v-card class="h-100 card-glow d-flex flex-column">
          <!-- Imagen -->
          <div v-if="getImagenes(habitacion.imagenes).length > 0" class="position-relative">
            <v-img
              :src="getImagenes(habitacion.imagenes)[0]"
              height="300"
              cover
              class="rounded-t"
            />
            <v-chip
              v-if="getImagenes(habitacion.imagenes).length > 1"
              size="small"
              variant="tonal"
              class="position-absolute"
              style="bottom: 10px; right: 10px; background: rgba(0, 0, 0, 0.6); color: white"
            >
              +{{ getImagenes(habitacion.imagenes).length - 1 }} foto{{ getImagenes(habitacion.imagenes).length > 2 ? 's' : '' }}
            </v-chip>
          </div>
          <div v-else class="bg-grey-lighten-3 d-flex align-center justify-center" style="height: 300px">
            <v-icon icon="mdi-image-off" size="48" color="grey-darken-1" />
          </div>

          <!-- Contenido -->
          <v-card-text class="pb-0 flex-grow-1">
            <!-- Número de habitación -->
            <div class="d-flex align-center justify-space-between mb-2">
              <div>
                <h3 class="text-h6 font-weight-bold">
                  {{ habitacion.tipoHabitacionNombre }}
                </h3>
                <p class="text-caption text-medium-emphasis mb-0">
                  <v-icon icon="mdi-door" size="16" />
                  Habitación {{ habitacion.numeroHabitacion }}
                  <span v-if="habitacion.piso">- Piso {{ habitacion.piso }}</span>
                </p>
              </div>
            </div>

            <!-- Información -->
            <v-divider class="my-3" />

            <div class="mb-3">
              <!-- Capacidad -->
              <div class="text-body-2 mb-2">
                <v-icon icon="mdi-account-multiple" size="18" class="mr-1" />
                <strong>Capacidad:</strong> {{ habitacion.capacidadPersonas }} persona{{ habitacion.capacidadPersonas > 1 ? 's' : '' }}
              </div>

              <!-- Precio por noche -->
              <div class="text-body-2 mb-2">
                <v-icon icon="mdi-cash" size="18" class="mr-1" />
                <strong>Precio/Noche:</strong> ${{ Number(habitacion.precioBase).toLocaleString() }}
              </div>

              <!-- Número de noches -->
              <div class="text-body-2">
                <v-icon icon="mdi-calendar" size="18" class="mr-1" />
                <strong>Noches:</strong> {{ numeroNoches }}
              </div>

              <!-- Precio total -->
              <div v-if="numeroNoches > 0" class="text-h6 font-weight-bold mt-2 text-primary">
                Total: ${{ calcularPrecio(habitacion.precioBase) }}
              </div>
            </div>

            <!-- Amenidades -->
            <v-divider class="my-3" />

            <div v-if="habitacion.amenidades && habitacion.amenidades.length > 0" class="mb-3">
              <p class="text-caption font-weight-medium mb-2">Servicios incluidos:</p>
              <div class="d-flex flex-wrap gap-1">
                <v-chip
                  v-for="amenidad in habitacion.amenidades.slice(0, 3)"
                  :key="amenidad.id"
                  size="small"
                  variant="tonal"
                  color="primary"
                >
                  <v-icon v-if="amenidad.icono" :icon="amenidad.icono" size="x-small" start />
                  {{ amenidad.nombre }}
                </v-chip>
                <v-chip
                  v-if="habitacion.amenidades.length > 3"
                  size="small"
                  variant="tonal"
                  color="info"
                >
                  +{{ habitacion.amenidades.length - 3 }}
                </v-chip>
              </div>
            </div>
            <div v-else class="text-caption text-medium-emphasis mb-3">
              Sin servicios adicionales
            </div>
          </v-card-text>

          <!-- Botón de acción -->
          <v-card-actions class="pt-0">
            <v-spacer />
            <v-btn
              color="primary"
              size="large"
              variant="elevated"
              class="w-100"
              @click="emitReservar(habitacion)"
            >
              <v-icon start icon="mdi-check-circle" />
              Reservar ahora
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import type { HabitacionDisponibleDto } from '~/types/api'

interface Props {
  habitaciones?: HabitacionDisponibleDto[]
  numeroNoches: number
  emptyMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  habitaciones: undefined,
  emptyMessage: 'No hay habitaciones disponibles para las fechas seleccionadas',
})

const emit = defineEmits<{
  reservar: [habitacion: HabitacionDisponibleDto]
}>()

const getImagenes = (imagenes?: string): string[] => {
  if (!imagenes || !imagenes.trim()) return []
  return imagenes.split(',').map(img => img.trim()).filter(img => img)
}

const calcularPrecio = (precioBase: number): string => {
  const total = precioBase * props.numeroNoches
  return Number(total).toLocaleString()
}

const emitReservar = (habitacion: HabitacionDisponibleDto) => {
  emit('reservar', habitacion)
}
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card-glow:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
</style>
