<template>
  <div>
    <div v-if="!habitaciones || habitaciones.length === 0" class="text-center py-12">
      <v-icon icon="mdi-information-outline" size="48" class="mb-4 opacity-50" />
      <p class="text-body-1 text-medium-emphasis">
        {{ emptyMessage }}
      </p>
    </div>

    <v-row v-else>
      <v-col
        v-for="habitacion in habitaciones"
        :key="habitacion.id"
        cols="12"
        sm="6"
        md="4"
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
              height="180"
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
          <div v-else class="bg-grey-lighten-3 d-flex align-center justify-center" style="height: 180px">
            <v-icon icon="mdi-image-off" size="48" color="grey-darken-1" />
          </div>

          <!-- Contenido -->
          <v-card-text class="pb-0 flex-grow-1 pa-3">
            <!-- Número de habitación -->
            <div class="d-flex align-center justify-space-between mb-1">
              <div>
                <h3 class="text-subtitle-1 font-weight-bold">
                  {{ habitacion.tipoHabitacionNombre }}
                </h3>
                <p class="text-caption text-medium-emphasis mb-0">
                  <v-icon icon="mdi-door" size="14" />
                  Hab. {{ habitacion.numeroHabitacion }}
                  <span v-if="habitacion.piso">· Piso {{ habitacion.piso }}</span>
                </p>
              </div>
            </div>

            <v-divider class="my-2" />

            <div class="mb-2">
              <div class="text-caption mb-1">
                <v-icon icon="mdi-account-multiple" size="14" class="mr-1" />
                <strong>Capacidad:</strong> {{ habitacion.capacidadPersonas }} persona{{ habitacion.capacidadPersonas > 1 ? 's' : '' }}
              </div>
              <div class="text-caption mb-1">
                <v-icon icon="mdi-cash" size="14" class="mr-1" />
                <strong>Precio/Noche:</strong> ${{ Number(habitacion.precioBase).toLocaleString() }}
              </div>
              <div class="text-caption">
                <v-icon icon="mdi-calendar" size="14" class="mr-1" />
                <strong>Noches:</strong> {{ numeroNoches }}
              </div>
              <div v-if="numeroNoches > 0" class="text-subtitle-2 font-weight-bold mt-1 text-primary">
                Total: ${{ calcularPrecio(habitacion.precioBase) }}
              </div>
            </div>

            <v-divider class="my-2" />

            <div v-if="habitacion.amenidades && habitacion.amenidades.length > 0" class="mb-2">
              <p class="text-caption font-weight-medium mb-1">Servicios incluidos:</p>
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
                  style="cursor: pointer"
                  @click="abrirDetalle(habitacion)"
                >
                  <v-icon size="x-small" start>mdi-plus</v-icon>
                  {{ habitacion.amenidades.length - 3 }} más
                </v-chip>
              </div>
            </div>
            <div v-else class="text-caption text-medium-emphasis mb-2">
              Sin servicios adicionales
            </div>
          </v-card-text>

          <!-- Botón de acción -->
          <v-card-actions class="pt-0 pa-3">
            <v-btn
              variant="text"
              size="small"
              color="secondary"
              @click="abrirDetalle(habitacion)"
            >
              <v-icon start size="small">mdi-information-outline</v-icon>
              Ver detalles
            </v-btn>
            <v-spacer />
            <v-btn
              color="primary"
              size="small"
              variant="elevated"
              @click="emitReservar(habitacion)"
            >
              <v-icon start icon="mdi-check-circle" />
              Reservar
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

    <!-- Diálogo de detalles completos -->
    <v-dialog v-model="detalleOpen" max-width="600" scrollable>
      <v-card v-if="detalleHabitacion">
        <!-- Imagen cabecera -->
        <v-img
          v-if="parseImagenes(detalleHabitacion.imagenes).length > 0"
          :src="parseImagenes(detalleHabitacion.imagenes)[0]"
          height="240"
          cover
        >
          <div class="d-flex justify-end pa-2">
            <v-btn icon="mdi-close" variant="tonal" size="small" @click="detalleOpen = false" />
          </div>
          <template #placeholder>
            <div class="d-flex align-center justify-center h-100">
              <v-progress-circular indeterminate color="grey" />
            </div>
          </template>
        </v-img>
        <div v-else class="d-flex justify-end pa-2">
          <v-btn icon="mdi-close" variant="tonal" size="small" @click="detalleOpen = false" />
        </div>

        <v-card-title class="pb-1">
          {{ detalleHabitacion.tipoHabitacionNombre }}
          <span class="text-caption text-medium-emphasis ml-2">
            Hab. {{ detalleHabitacion.numeroHabitacion }}
            <span v-if="detalleHabitacion.piso"> · Piso {{ detalleHabitacion.piso }}</span>
          </span>
        </v-card-title>

        <v-card-text>
          <!-- Precios -->
          <v-list density="compact" class="mb-2 pa-0">
            <v-list-item prepend-icon="mdi-account-multiple" density="compact">
              <strong>Capacidad:</strong> {{ detalleHabitacion.capacidadPersonas }} persona{{ detalleHabitacion.capacidadPersonas > 1 ? 's' : '' }}
            </v-list-item>
            <v-list-item prepend-icon="mdi-cash" density="compact">
              <strong>Precio/Noche:</strong> ${{ Number(detalleHabitacion.precioBase).toLocaleString() }}
            </v-list-item>
            <v-list-item v-if="numeroNoches > 0" prepend-icon="mdi-calendar" density="compact">
              <strong>Noches:</strong> {{ numeroNoches }}
            </v-list-item>
          </v-list>

          <div v-if="numeroNoches > 0" class="text-h6 font-weight-bold text-primary mb-4">
            Total: ${{ calcularPrecio(detalleHabitacion.precioBase) }}
          </div>

          <!-- Todas las amenidades -->
          <v-divider class="mb-3" />
          <p class="text-subtitle-2 font-weight-bold mb-2">Servicios y amenidades incluidas</p>

          <div v-if="detalleHabitacion.amenidades && detalleHabitacion.amenidades.length > 0" class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="amenidad in detalleHabitacion.amenidades"
              :key="amenidad.id"
              variant="tonal"
              color="primary"
            >
              <v-icon v-if="amenidad.icono" :icon="amenidad.icono" size="small" start />
              {{ amenidad.nombre }}
            </v-chip>
          </div>
          <p v-else class="text-body-2 text-medium-emphasis">Sin servicios adicionales</p>

          <!-- Fotos adicionales -->
          <template v-if="parseImagenes(detalleHabitacion.imagenes).length > 1">
            <v-divider class="my-3" />
            <p class="text-subtitle-2 font-weight-bold mb-2">Fotos</p>
            <v-row dense>
              <v-col
                v-for="(img, i) in parseImagenes(detalleHabitacion.imagenes).slice(1)"
                :key="i"
                cols="4"
              >
                <v-img
                  :src="img"
                  height="80"
                  cover
                  class="rounded cursor-pointer"
                  @click="abrirGaleria(detalleHabitacion!.imagenes)"
                />
              </v-col>
            </v-row>
          </template>
        </v-card-text>

        <v-card-actions>
          <v-btn variant="text" @click="detalleOpen = false">Cerrar</v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-check-circle"
            @click="emitReservar(detalleHabitacion); detalleOpen = false"
          >
            Reservar ahora
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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

// Diálogo de detalles
const detalleOpen = ref(false)
const detalleHabitacion = ref<HabitacionDisponibleDto | null>(null)

const abrirDetalle = (habitacion: HabitacionDisponibleDto) => {
  detalleHabitacion.value = habitacion
  detalleOpen.value = true
}

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
