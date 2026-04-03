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
          <!-- Imagen principal (click → galería) -->
          <div
            v-if="parseImagenes(habitacion.imagenes).length > 0"
            class="position-relative img-trigger"
            @click="abrirGaleria(habitacion.imagenes)"
          >
            <v-img
              :src="parseImagenes(habitacion.imagenes)[0]"
              height="300"
              cover
              class="rounded-t"
            >
              <template #placeholder>
                <div class="d-flex align-center justify-center h-100">
                  <v-progress-circular indeterminate color="grey" />
                </div>
              </template>
            </v-img>

            <!-- Badge fotos (hace lo mismo que click en la imagen) -->
            <v-chip
              v-if="parseImagenes(habitacion.imagenes).length > 1"
              size="small"
              variant="tonal"
              prepend-icon="mdi-image-multiple"
              class="position-absolute"
              style="bottom: 10px; right: 10px; background: rgba(0,0,0,0.65); color: white"
              @click.stop="abrirGaleria(habitacion.imagenes)"
            >
              +{{ parseImagenes(habitacion.imagenes).length - 1 }}&nbsp;foto{{ parseImagenes(habitacion.imagenes).length > 2 ? 's' : '' }}
            </v-chip>

            <!-- Icono lupa visible en hover -->
            <div class="img-overlay d-flex align-center justify-center">
              <v-icon icon="mdi-magnify-plus-outline" size="36" color="white" />
            </div>
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
    <!-- Galería lightbox (compartida para todas las tarjetas) -->
    <HabitacionGaleria
      v-model="galeriaOpen"
      :imagenes="galeriaImagenes"
      titulo="Fotos de la habitación"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { HabitacionDisponibleDto } from '~/types/api'
import { parseImagenes } from '~/utils/imagenes'
import HabitacionGaleria from '~/components/shared/HabitacionGaleria.vue'

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

// Galería
const galeriaOpen = ref(false)
const galeriaImagenes = ref('')

const abrirGaleria = (imagenes?: string) => {
  if (!imagenes || !parseImagenes(imagenes).length) return
  galeriaImagenes.value = imagenes
  galeriaOpen.value = true
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

.img-trigger {
  cursor: pointer;
  overflow: hidden;
}

.img-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  transition: background 0.2s;
  pointer-events: none;
}

.img-trigger:hover .img-overlay {
  background: rgba(0, 0, 0, 0.28);
}
</style>
