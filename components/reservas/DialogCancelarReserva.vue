<template>
  <teleport v-if="modelValue" to="body">
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="text-lg font-bold">Cancelar Reserva</h2>
          <button 
            class="text-gray-500 hover:text-gray-700"
            @click="$emit('update:modelValue', false)"
          >
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="p-6">
          <div class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p class="font-bold text-yellow-900">¿Seguro que deseas cancelar esta reserva?</p>
            <p class="text-sm text-yellow-800">Esta acción no se puede deshacer.</p>
          </div>

          <div v-if="reserva" class="p-3 bg-gray-50 rounded mb-4">
            <p class="font-semibold">{{ reserva.tipoHabitacion?.nombreTipo }}</p>
            <p class="text-sm text-gray-600">Hab. {{ reserva.habitacion?.numeroHabitacion }}</p>
            <p class="text-sm text-gray-600">{{ formatDate(reserva.checkinPrevisto) }} - {{ formatDate(reserva.checkoutPrevisto) }}</p>
          </div>
          <div v-else class="p-3 bg-gray-50 rounded mb-4 text-center text-gray-500">
            Cargando información...
          </div>
        </div>

        <!-- Footer -->
        <div class="flex gap-3 justify-end p-6 border-t">
          <button 
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
            @click="$emit('update:modelValue', false)"
          >
            No, mantener
          </button>
          <button 
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            :disabled="cancelando"
            @click="confirmar"
          >
            {{ cancelando ? 'Cancelando...' : 'Sí, cancelar' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import type { Reserva } from '~/types/api'

interface Props {
  modelValue: boolean
  reserva?: Reserva
  cancelando?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  cancelando: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirmar': []
}>()

const formatDate = (fecha?: Date | string): string => {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const confirmar = () => {
  console.log('✅ DialogCancelarReserva: Botón confirmar clickeado')
  console.log('✅ DialogCancelarReserva: Emitiendo evento "confirmar"')
  emit('confirmar')
}

watch(
  () => props.modelValue,
  (newVal) => {
    console.log('✅ DialogCancelarReserva modelValue cambió a:', newVal)
    console.log('✅ props.reserva:', props.reserva)
  },
)
</script>

<style scoped>
/* Los estilos ya están en el template usando Tailwind */
</style>
