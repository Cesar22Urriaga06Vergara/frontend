<template>
  <v-card class="card-glow pa-4 mb-6">
    <div class="d-flex gap-4 flex-wrap align-center">
      <!-- Selector de Período Predefinido -->
      <div>
        <label class="text-caption font-weight-bold mb-1 d-block">Período</label>
        <v-select
          v-model="selectedPeriodo"
          :items="periodosDisponibles"
          variant="outlined"
          density="compact"
          @update:model-value="aplicarFiltros"
        />
      </div>

      <!-- Fecha Desde (Solo si es custom) -->
      <div v-if="selectedPeriodo === 'custom'">
        <label class="text-caption font-weight-bold mb-1 d-block">Desde</label>
        <v-text-field
          v-model="fechaDesde"
          type="date"
          variant="outlined"
          density="compact"
          @update:model-value="aplicarFiltros"
        />
      </div>

      <!-- Fecha Hasta (Solo si es custom) -->
      <div v-if="selectedPeriodo === 'custom'">
        <label class="text-caption font-weight-bold mb-1 d-block">Hasta</label>
        <v-text-field
          v-model="fechaHasta"
          type="date"
          variant="outlined"
          density="compact"
          @update:model-value="aplicarFiltros"
        />
      </div>

      <!-- Botones de Acción -->
      <div class="d-flex gap-2 mt-6">
        <v-btn
          icon="mdi-refresh"
          variant="tonal"
          color="primary"
          size="small"
          :loading="loading"
          @click="refresh"
          title="Actualizar"
        />
        <v-btn
          icon="mdi-download"
          variant="tonal"
          color="success"
          size="small"
          @click="exportar"
          :disabled="!tieneReporte"
          title="Exportar CSV"
        />
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  loading?: boolean
  tieneReporte?: boolean
}

interface Emits {
  (e: 'actualizar', desde?: Date, hasta?: Date): void
  (e: 'exportar'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  tieneReporte: false,
})

const emit = defineEmits<Emits>()

const selectedPeriodo = ref('ultimos-30')
const fechaDesde = ref('')
const fechaHasta = ref('')

const periodosDisponibles = [
  { title: 'Últimos 7 días', value: 'ultimos-7' },
  { title: 'Últimos 30 días', value: 'ultimos-30' },
  { title: 'Este mes', value: 'mes-actual' },
  { title: 'Último mes', value: 'mes-anterior' },
  { title: 'Este trimestre', value: 'trimestre-actual' },
  { title: 'Custom', value: 'custom' },
]

const aplicarFiltros = () => {
  let desde: Date | undefined
  let hasta: Date | undefined

  const hoy = new Date()

  switch (selectedPeriodo.value) {
    case 'ultimos-7':
      desde = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000)
      hasta = hoy
      break
    case 'ultimos-30':
      desde = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000)
      hasta = hoy
      break
    case 'mes-actual':
      desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      hasta = hoy
      break
    case 'mes-anterior':
      desde = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
      hasta = new Date(hoy.getFullYear(), hoy.getMonth(), 0)
      break
    case 'trimestre-actual':
      const trimestre = Math.floor(hoy.getMonth() / 3)
      desde = new Date(hoy.getFullYear(), trimestre * 3, 1)
      hasta = hoy
      break
    case 'custom':
      if (fechaDesde.value) desde = new Date(fechaDesde.value)
      if (fechaHasta.value) hasta = new Date(fechaHasta.value)
      break
  }

  emit('actualizar', desde, hasta)
}

const refresh = () => {
  aplicarFiltros()
}

const exportar = () => {
  emit('exportar')
}

// Watch para aplicar filtro predeterminado al montar
watch(
  () => selectedPeriodo.value,
  () => {
    if (selectedPeriodo.value !== 'custom') {
      aplicarFiltros()
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

@media (max-width: 600px) {
  .d-flex {
    flex-direction: column;
  }

  .mt-6 {
    margin-top: 1rem !important;
  }
}
</style>
