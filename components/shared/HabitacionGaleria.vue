<template>
  <!-- MODO COMPACTO INLINE: carrusel embebido, sin dialog -->
  <div
    v-if="inline"
    class="galeria-inline position-relative overflow-hidden rounded"
    :style="{ height: height + 'px' }"
  >
    <v-img
      :src="urls[indice]"
      :height="height"
      cover
      class="w-100"
    >
      <template #error>
        <div class="d-flex align-center justify-center h-100 bg-grey-lighten-3">
          <v-icon icon="mdi-image-broken-variant" size="40" color="grey-darken-1" />
        </div>
      </template>
      <template #placeholder>
        <div class="d-flex align-center justify-center h-100">
          <v-progress-circular indeterminate color="grey" />
        </div>
      </template>
    </v-img>

    <template v-if="urls.length > 1">
      <v-btn
        icon="mdi-chevron-left"
        size="small"
        variant="tonal"
        color="white"
        class="position-absolute nav-btn"
        style="left: 6px; top: 50%; transform: translateY(-50%)"
        @click.stop="prev"
      />
      <v-btn
        icon="mdi-chevron-right"
        size="small"
        variant="tonal"
        color="white"
        class="position-absolute nav-btn"
        style="right: 6px; top: 50%; transform: translateY(-50%)"
        @click.stop="next"
      />
      <v-chip
        size="x-small"
        variant="flat"
        class="position-absolute"
        style="bottom:6px;right:8px;background:rgba(0,0,0,.65);color:white;pointer-events:none"
      >
        {{ indice + 1 }}&thinsp;/&thinsp;{{ urls.length }}
      </v-chip>
    </template>
  </div>

  <!-- MODO COMPLETO LIGHTBOX -->
  <v-dialog v-else v-model="isOpen" max-width="920" :scrim-opacity="0.92">
    <v-card class="overflow-hidden rounded-lg" color="grey-darken-4">
      <!-- Toolbar -->
      <v-toolbar color="grey-darken-4" density="compact" class="px-2 flex-shrink-0">
        <v-toolbar-title class="text-body-2 text-white">
          {{ titulo || 'Fotos de la habitación' }}
        </v-toolbar-title>
        <template #append>
          <span class="text-caption text-medium-emphasis mr-3">
            {{ indice + 1 }} / {{ urls.length }}
          </span>
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            density="compact"
            @click="isOpen = false"
          />
        </template>
      </v-toolbar>

      <!-- Imagen principal -->
      <div class="position-relative bg-black" style="height: 480px">
        <v-img
          :src="urls[indice]"
          height="480"
          cover
          class="w-100 h-100"
        >
          <template #error>
            <div class="d-flex align-center justify-center h-100">
              <div class="text-center">
                <v-icon icon="mdi-image-broken-variant" size="56" color="grey-darken-1" />
                <p class="text-caption text-grey mt-2">No se pudo cargar la imagen</p>
              </div>
            </div>
          </template>
          <template #placeholder>
            <div class="d-flex align-center justify-center h-100">
              <v-progress-circular indeterminate color="grey" />
            </div>
          </template>
        </v-img>

        <!-- Botón anterior -->
        <v-btn
          v-if="urls.length > 1"
          icon="mdi-chevron-left"
          size="large"
          variant="tonal"
          color="white"
          class="position-absolute nav-btn"
          style="left: 12px; top: 50%; transform: translateY(-50%)"
          @click="prev"
        />

        <!-- Botón siguiente -->
        <v-btn
          v-if="urls.length > 1"
          icon="mdi-chevron-right"
          size="large"
          variant="tonal"
          color="white"
          class="position-absolute nav-btn"
          style="right: 12px; top: 50%; transform: translateY(-50%)"
          @click="next"
        />
      </div>

      <!-- Tira de miniaturas -->
      <div
        v-if="urls.length > 1"
        class="d-flex ga-2 pa-3 overflow-x-auto"
        style="background: #1a1a1a"
      >
        <div
          v-for="(url, i) in urls"
          :key="i"
          class="flex-shrink-0 rounded cursor-pointer thumb-wrap"
          :class="i === indice ? 'thumb-active' : 'thumb-idle'"
          @click="indice = i"
        >
          <v-img
            :src="url"
            width="80"
            height="56"
            cover
            class="rounded"
          />
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { parseImagenes } from '~/utils/imagenes'

const props = withDefaults(defineProps<{
  /** String CSV o array de URL ya parseado */
  imagenes: string | string[]
  /** Título visible en la barra superior (solo modo completo) */
  titulo?: string
  /** v-model: controla si el dialog está abierto. Solo aplica en modo completo */
  modelValue?: boolean
  /** Índice con el que empezar al abrir (default 0) */
  indiceInicial?: number
  /** true → carrusel embebido sin dialog; false (default) → lightbox completo */
  inline?: boolean
  /** Altura en px del carrusel inline (default 200) */
  height?: number
}>(), {
  modelValue: false,
  inline: false,
  height: 200,
})

const emit = defineEmits<{ 'update:modelValue': [val: boolean] }>()

const isOpen = computed({
  get: () => props.modelValue ?? false,
  set: (v) => emit('update:modelValue', v),
})

const urls = computed(() => parseImagenes(props.imagenes as string))
const indice = ref(props.indiceInicial ?? 0)

// Resetear índice al abrir
watch(
  () => props.modelValue,
  (v) => { if (v) indice.value = props.indiceInicial ?? 0 },
)

const prev = () => { indice.value = (indice.value - 1 + urls.value.length) % urls.value.length }
const next = () => { indice.value = (indice.value + 1) % urls.value.length }
</script>

<style scoped>
.nav-btn {
  opacity: 0.75;
  transition: opacity 0.15s;
}
.nav-btn:hover {
  opacity: 1;
}
.thumb-wrap {
  transition: transform 0.15s, box-shadow 0.15s;
}
.thumb-active {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
.thumb-idle {
  opacity: 0.55;
}
.thumb-idle:hover {
  opacity: 1;
}
</style>
