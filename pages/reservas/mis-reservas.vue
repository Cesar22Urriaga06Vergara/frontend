<template>
  <v-container>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold mb-2">
        <v-icon icon="mdi-calendar-check" start />
        Mis Reservas
      </h1>
      <p class="text-body-1 text-medium-emphasis">
        Gestiona tus reservas actuales y anteriores
      </p>
    </div>

    <!-- Acciones -->
    <div class="mb-6">
      <v-btn
        to="/reservas/nueva"
        color="primary"
        size="large"
      >
        <v-icon start icon="mdi-plus" />
        Nueva Reserva
      </v-btn>
    </div>

    <!-- Pestañas de filtro -->
    <v-tabs v-model="tabActiva" class="mb-6">
      <v-tab value="confirmadas">
        <v-icon start icon="mdi-check-circle" />
        Confirmadas
      </v-tab>
      <v-tab value="pendientes">
        <v-icon start icon="mdi-clock" />
        Pendientes
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

    <!-- Contenido de pestañas -->
    <v-window v-model="tabActiva">
      <!-- Confirmadas -->
      <v-window-item value="confirmadas">
        <ReservasGrid
          :reservas="filteredReservas('confirmada')"
          :loading="loading"
          empty-message="No tienes reservas confirmadas"
          @ver-detalle="verDetalle"
          @cancelar="mostrarDialogoCancelar"
        />
      </v-window-item>

      <!-- Pendientes -->
      <v-window-item value="pendientes">
        <ReservasGrid
          :reservas="filteredReservas('pendiente')"
          :loading="loading"
          empty-message="No tienes reservas pendientes"
          @ver-detalle="verDetalle"
          @cancelar="mostrarDialogoCancelar"
        />
      </v-window-item>

      <!-- Completadas -->
      <v-window-item value="completadas">
        <ReservasGrid
          :reservas="filteredReservas('completada')"
          :loading="loading"
          empty-message="No tienes reservas completadas"
          @ver-detalle="verDetalle"
        />
      </v-window-item>

      <!-- Canceladas -->
      <v-window-item value="canceladas">
        <ReservasGrid
          :reservas="filteredReservas('cancelada')"
          :loading="loading"
          empty-message="No tienes reservas canceladas"
          @ver-detalle="verDetalle"
        />
      </v-window-item>
    </v-window>

    <!-- Dialog de cancelación -->
    <DialogCancelarReserva
      v-model="showDialogoCancelar"
      :reserva="reservaSeleccionada"
      :cancelando="cancelando"
      @confirmar="confirmarCancelar"
    />

    <!-- Dialog de detalle -->
    <DialogDetalleReserva
      v-model="showDialogoDetalle"
      :reserva="reservaSeleccionada"
    />
  </v-container>
</template>

<script setup lang="ts">
import type { Reserva } from '~/types/api'

definePageMeta({
  middleware: ['auth'],
})

useHead({ title: 'Mis Reservas' })

const authStore = useAuthStore()
const { obtenerMisReservas, cancelarReserva, reservas } = useReservas()

// Estado
const loading = ref(true)
const tabActiva = ref('confirmadas')
const showDialogoCancelar = ref(false)
const showDialogoDetalle = ref(false)
const reservaSeleccionada = ref<Reserva>()
const cancelando = ref(false)

/**
 * Cargar reservas del cliente
 */
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

/**
 * Filtrar reservas por estado
 */
const filteredReservas = (estado: string): Reserva[] => {
  return reservas.value.filter(r => r.estadoReserva === estado)
}

/**
 * Ver detalle de una reserva
 */
const verDetalle = (reserva: Reserva) => {
  reservaSeleccionada.value = reserva
  showDialogoDetalle.value = true
}

/**
 * Mostrar diálogo de cancelación
 */
const mostrarDialogoCancelar = async (reserva: Reserva) => {
  console.log('📌 mostrarDialogoCancelar llamado con:', reserva)
  
  // Confirmación simple del navegador
  const confirmado = confirm(`¿Seguro que deseas cancelar la reserva de ${reserva.tipoHabitacion?.nombreTipo}?`)
  
  if (confirmado) {
    console.log('✅ Usuario confirmó la cancelación')
    reservaSeleccionada.value = reserva
    await confirmarCancelar()
  } else {
    console.log('❌ Usuario canceló la operación')
  }
}

/**
 * Confirmar cancelación
 */
const confirmarCancelar = async () => {
  console.log('🗑️ confirmarCancelar llamado')
  console.log('🗑️ reservaSeleccionada.value:', reservaSeleccionada.value)
  if (!reservaSeleccionada.value) {
    console.error('ERROR: No hay reserva seleccionada')
    return
  }

  cancelando.value = true
  try {
    console.log(`🗑️ Llamando a cancelarReserva con ID: ${reservaSeleccionada.value.id}`)
    const success = await cancelarReserva(reservaSeleccionada.value.id)
    console.log('🗑️ Respuesta de cancelarReserva:', success)
    if (success) {
      showDialogoCancelar.value = false
      await cargarReservas()
    }
  } finally {
    cancelando.value = false
  }
}

onMounted(() => {
  cargarReservas()
})
</script>

<style scoped>
</style>
