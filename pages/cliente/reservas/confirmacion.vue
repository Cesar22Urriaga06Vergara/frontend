<template>
  <div>
    <PageHeader
      title="Confirmación de Reserva"
      subtitle="Resumen final y datos clave de tu reserva"
    />

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Estado" :value="reserva?.estadoReserva || 'N/A'" icon="mdi-calendar-check" color="success" :loading="loading" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Noches" :value="numeroNoches" icon="mdi-weather-night" color="info" :loading="loading" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Total" :value="`$${calcularTotal().toLocaleString()}`" icon="mdi-cash" color="primary" :loading="loading" />
      </v-col>
    </v-row>

    <SectionCard v-if="loading" :padded="false" class="mb-6">
      <EmptyState icon="mdi-loading" title="Cargando confirmación" description="Estamos consultando los datos de tu reserva." />
    </SectionCard>

    <template v-else-if="reserva">
      <SectionCard class="mb-6" title="Datos de la reserva">
        <v-row>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Código de confirmación</div>
            <div class="text-h6 font-weight-bold">{{ reserva.codigoConfirmacion }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Habitación</div>
            <div class="font-weight-medium">{{ reserva.habitacion?.numeroHabitacion }} - {{ reserva.tipoHabitacion?.nombreTipo }}</div>
          </v-col>
        </v-row>
      </SectionCard>

      <StandardDataTable
        title="Detalle de estadía"
        subtitle="Fechas y valores de la reserva"
        :headers="detalleHeaders"
        :items="detalleItems"
        :items-per-page="5"
      />

      <SectionCard class="mt-6" title="Siguientes pasos">
        <v-btn to="/cliente" color="primary" prepend-icon="mdi-home" class="mr-2">Ir al Dashboard</v-btn>
        <v-btn to="/cliente/reservas/nueva" variant="outlined" color="primary" prepend-icon="mdi-plus">Crear otra reserva</v-btn>
      </SectionCard>
    </template>

    <SectionCard v-else :padded="false">
      <EmptyState icon="mdi-alert-circle" title="Reserva no encontrada" description="No encontramos información de esta reserva." />
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { Reserva } from '~/types/api'
import { UserRole } from '~/types/auth'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import EmptyState from '~/components/shared/EmptyState.vue'

definePageMeta({
  layout: 'cliente',
  middleware: ['auth', 'role'],
  roles: [UserRole.CLIENTE],
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

const calcularTotal = (): number => {
  if (!reserva.value) return 0
  return (reserva.value.precioNocheSnapshot || 0) * numeroNoches.value
}

const detalleHeaders = [
  { title: 'Campo', key: 'campo' },
  { title: 'Valor', key: 'valor' },
]

const detalleItems = computed(() => {
  if (!reserva.value) return []
  return [
    { campo: 'Check-in', valor: new Date(reserva.value.checkinPrevisto).toLocaleDateString('es-CO') },
    { campo: 'Check-out', valor: new Date(reserva.value.checkoutPrevisto).toLocaleDateString('es-CO') },
    { campo: 'Huéspedes', valor: reserva.value.numeroHuespedes },
    { campo: 'Email de confirmación', valor: userEmail.value || 'N/A' },
  ]
})

onMounted(async () => {
  try {
    loading.value = true
    const codigo = route.query.codigo as string
    if (codigo) {
      reserva.value = await obtenerReservaPorCodigo(codigo)
    }
    if (!reserva.value) {
      const id = Number(route.query.id || route.params.id)
      if (id) reserva.value = await obtenerReserva(id)
    }
  } finally {
    loading.value = false
  }
})
</script>