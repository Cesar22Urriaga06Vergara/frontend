<template>
  <div>
    <PageHeader
      title="Mis Reservas"
      subtitle="Administra tus reservas actuales, futuras y finalizadas"
    >
      <template #actions>
        <v-btn to="/cliente/reservas/nueva" color="primary" prepend-icon="mdi-plus">
          Nueva Reserva
        </v-btn>
      </template>
    </PageHeader>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Total"
          :value="reservas.length"
          icon="mdi-calendar-multiple"
          color="primary"
          :loading="loading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Confirmadas"
          :value="countByEstado.confirmada"
          icon="mdi-check-circle"
          color="success"
          :loading="loading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Reservadas"
          :value="countByEstado.reservada"
          icon="mdi-bookmark"
          color="warning"
          :loading="loading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Completadas"
          :value="countByEstado.completada"
          icon="mdi-history"
          color="info"
          :loading="loading"
        />
      </v-col>
    </v-row>

    <SectionCard
      :padded="false"
      class="mb-0"
      title="Estados de reserva"
      subtitle="Filtra y revisa el estado actual de cada reserva"
    >
      <v-tabs v-model="tabActiva" class="px-6">
        <v-tab value="confirmadas">
          <v-icon start icon="mdi-check-circle" />
          Confirmadas
        </v-tab>
        <v-tab value="reservadas">
          <v-icon start icon="mdi-bookmark-outline" />
          Reservadas
        </v-tab>
        <v-tab value="completadas">
          <v-icon start icon="mdi-history" />
          Completadas
        </v-tab>
        <v-tab value="canceladas">
          <v-icon start icon="mdi-close-circle" />
          Canceladas
        </v-tab>
      </v-tabs>
    </SectionCard>

    <StandardDataTable
      title="Resumen de reservas"
      subtitle="Listado completo de tu historial de reservas"
      :headers="[
        { title: 'Estado', key: 'estadoReserva' },
        { title: 'Hotel', key: 'hotelNombre' },
        { title: 'Check-in', key: 'fechaCheckin' },
        { title: 'Check-out', key: 'fechaCheckout' }
      ]"
      :items="reservas"
      :loading="loading"
      empty-icon="mdi-calendar-heart"
      empty-title="Sin reservas"
      empty-description="Aún no tienes reservas. ¡Crea una nueva!"
    />

    <v-window v-model="tabActiva" class="mt-0">
      <v-window-item value="confirmadas" class="pa-0">
        <ReservasGrid
          :reservas="filteredReservas('confirmada')"
          :loading="loading"
          empty-message="No tienes reservas confirmadas"
          @ver-detalle="verDetalle"
          @cancelar="mostrarDialogoCancelar"
        />
      </v-window-item>

      <v-window-item value="reservadas" class="pa-0">
        <ReservasGrid
          :reservas="filteredReservas('reservada')"
          :loading="loading"
          empty-message="No tienes reservas pendientes"
          @ver-detalle="verDetalle"
          @cancelar="mostrarDialogoCancelar"
        />
      </v-window-item>

      <v-window-item value="completadas" class="pa-0">
        <ReservasGrid
          :reservas="filteredReservas('completada')"
          :loading="loading"
          empty-message="No tienes reservas completadas"
          @ver-detalle="verDetalle"
        />
      </v-window-item>

      <v-window-item value="canceladas" class="pa-0">
        <ReservasGrid
          :reservas="filteredReservas('cancelada')"
          :loading="loading"
          empty-message="No tienes reservas canceladas"
          @ver-detalle="verDetalle"
        />
      </v-window-item>
    </v-window>

    <DialogCancelarReserva
      v-model="showDialogoCancelar"
      :reserva="reservaSeleccionada"
      :cancelando="cancelando"
      @confirmar="confirmarCancelar"
    />

    <DialogDetalleReserva
      v-model="showDialogoDetalle"
      :reserva="reservaSeleccionada"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { Reserva } from '~/types/api'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import DialogCancelarReserva from '~/components/shared/reservas/DialogCancelarReserva.vue'
import DialogDetalleReserva from '~/components/shared/reservas/DialogDetalleReserva.vue'
import ReservasGrid from '~/components/shared/reservas/ReservasGrid.vue'

import { UserRole } from '~/types/auth'

definePageMeta({
  layout: 'cliente',
  middleware: ['auth', 'role'],
  roles: [UserRole.CLIENTE],
})

useHead({ title: 'Mis Reservas' })

const authStore = useAuthStore()
const { obtenerMisReservas, cancelarReserva, reservas } = useReservas()

const loading = ref(true)
const tabActiva = ref('confirmadas')
const showDialogoCancelar = ref(false)
const showDialogoDetalle = ref(false)
const reservaSeleccionada = ref<Reserva>()
const cancelando = ref(false)

const countByEstado = computed(() => {
  return {
    confirmada: reservas.value.filter((r) => r.estadoReserva === 'confirmada').length,
    reservada: reservas.value.filter((r) => r.estadoReserva === 'reservada').length,
    completada: reservas.value.filter((r) => r.estadoReserva === 'completada').length,
    cancelada: reservas.value.filter((r) => r.estadoReserva === 'cancelada').length,
  }
})

const cargarReservas = async () => {
  loading.value = true
  try {
    if (authStore.user?.idCliente) {
      await obtenerMisReservas(authStore.user.idCliente)
    }
  } catch (error) {
    console.error('Error al cargar reservas:', error)
  } finally {
    loading.value = false
  }
}

const filteredReservas = (estado: string): Reserva[] => {
  return reservas.value.filter((r) => r.estadoReserva === estado)
}

const verDetalle = (reserva: Reserva) => {
  reservaSeleccionada.value = reserva
  showDialogoDetalle.value = true
}

const mostrarDialogoCancelar = (reserva: Reserva) => {
  reservaSeleccionada.value = reserva
  showDialogoCancelar.value = true
}

const confirmarCancelar = async (motivo: string) => {
  if (!reservaSeleccionada.value) {
    console.error('No hay reserva seleccionada')
    return
  }

  cancelando.value = true
  try {
    const ok = await cancelarReserva(reservaSeleccionada.value.id, motivo)
    if (ok) {
      showDialogoCancelar.value = false
      await cargarReservas()
    }
  } catch (error) {
    console.error('Error al cancelar la reserva:', error)
  } finally {
    cancelando.value = false
  }
}

onMounted(() => {
  cargarReservas()
})
</script>
