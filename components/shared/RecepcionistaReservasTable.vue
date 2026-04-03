<template>
  <ReservasTable
    :reservas="reservas"
    @confirm-reserva="emit('confirm-reserva', $event)"
    @confirm-checkin="emit('confirm-checkin', $event)"
    @confirm-checkout="emit('confirm-checkout', $event)"
    @cancel="emit('cancel', $event)"
    @filter-changed="emit('filter-changed')"
    @refresh="emit('refresh')"
  />
</template>

<script setup lang="ts">
import ReservasTable from '~/components/shared/ReservasTable.vue'
import type { Reserva } from '~/types/api'

defineProps<{
  reservas?: Reserva[]
}>()

const emit = defineEmits<{
  'confirm-reserva': [reserva: Reserva]
  'confirm-checkin': [reserva: Reserva]
  'confirm-checkout': [reserva: Reserva]
  cancel: [reserva: Reserva]
  'filter-changed': []
  refresh: []
}>()
</script>
