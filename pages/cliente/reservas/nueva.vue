<template>
  <div>
    <PageHeader
      title="Nueva Reserva"
      subtitle="Busca disponibilidad y reserva tu habitación en segundos"
    >
      <template #actions>
        <v-btn to="/cliente/reservas/mis-reservas" variant="tonal" prepend-icon="mdi-bookmark">
          Mis Reservas
        </v-btn>
      </template>
    </PageHeader>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="4">
        <StatCard
          label="Tipos disponibles"
          :value="tiposHabitacion.length"
          icon="mdi-door-sliding"
          color="primary"
          :loading="loadingTipos"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <StatCard
          label="Habitaciones"
          :value="totalHabitacionesMostradas"
          icon="mdi-bed-outline"
          color="info"
          :loading="loadingHabitaciones || loadingDisponibilidad"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <StatCard
          label="Reservas activas"
          :value="totalReservasActivas"
          icon="mdi-calendar-check"
          color="success"
          :loading="loadingMisReservas"
        />
      </v-col>
    </v-row>

    <!-- Formulario de búsqueda -->
    <SectionCard class="mb-6" title="Buscar Disponibilidad" subtitle="Completa los datos para ver habitaciones disponibles">
      <FormularioBusqueda
        :tipos-habitacion="tiposHabitacion"
        :loading="loadingDisponibilidad"
        @buscar="handleBuscar"
      />
    </SectionCard>

    <!-- Resultados de búsqueda -->
    <div v-if="disponibilidad">
      <v-alert type="success" variant="tonal" class="mb-6">
        <div class="d-flex align-center justify-space-between">
          <div>
            <strong>{{ disponibilidad.totalDisponibles }}</strong> habitación{{ disponibilidad.totalDisponibles !== 1 ? 'es' : '' }} disponible{{ disponibilidad.totalDisponibles !== 1 ? 's' : '' }} para su búsqueda
          </div>
          <v-btn variant="text" size="small" @click="disponibilidad = null">
            Nueva búsqueda
          </v-btn>
        </div>
      </v-alert>

      <!-- Habitaciones disponibles -->
      <HabitacionesGrid
        :habitaciones="disponibilidad.habitacionesDisponibles"
        :numero-noches="disponibilidad.numeroNoches"
        @reservar="handleReservar"
      />
    </div>

    <!-- Habitaciones iniciales (sin búsqueda de fechas) -->
    <div v-else-if="habitacionesDisponibles.length > 0 && !loadingHabitaciones">
      <v-alert type="info" variant="tonal" class="mb-6">
        <div>
          <strong>{{ habitacionesDisponibles.length }}</strong> habitación{{ habitacionesDisponibles.length !== 1 ? 'es' : '' }} disponible{{ habitacionesDisponibles.length !== 1 ? 's' : '' }} en el hotel
        </div>
        <p class="mb-0 text-body-2">Selecciona tus fechas para ver disponibilidad exacta</p>
      </v-alert>

      <!-- Habitaciones disponibles -->
      <HabitacionesGrid
        :habitaciones="habitacionesDisponibles"
        :numero-noches="0"
        @reservar="handleReservar"
      />
    </div>

    <!-- Sin búsqueda realizada -->
    <SectionCard v-else :padded="false">
      <EmptyState
        icon="mdi-magnify"
        title="Comienza tu búsqueda"
        description="Selecciona tus fechas y tipo de habitación para ver disponibilidad"
      />
    </SectionCard>

    <!-- Dialog de confirmación -->
    <DialogConfirmarReserva
      v-model="showDialogConfirmar"
      :habitacion="habitacionSeleccionada"
      :checkin-fecha="busquedaActuale?.checkin"
      :checkout-fecha="busquedaActuale?.checkout"
      :numero-noches="disponibilidad?.numeroNoches || 0"
      :creando="creandoReserva"
      :id-hotel="idHotel"
      :id-cliente="idCliente"
      @confirmar="handleConfirmarReserva"
    />

    <!-- Modal para completar perfil después de reservar -->
    <DialogCompletarPerfil
      v-model="mostrarDialogoCompletarPerfil"
      :nombre="authStore.user?.fullName.split(' ')[0]"
      :apellido="authStore.user?.fullName.split(' ').slice(1).join(' ')"
      @guardar="guardarDatosCliente"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { TipoHabitacion, HabitacionDisponibleDto } from '~/types/api'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import EmptyState from '~/components/shared/EmptyState.vue'
import FormularioBusqueda from '~/components/shared/reservas/FormularioBusqueda.vue'
import HabitacionesGrid from '~/components/shared/reservas/HabitacionesGrid.vue'
import DialogConfirmarReserva from '~/components/shared/reservas/DialogConfirmarReserva.vue'
import DialogCompletarPerfil from '~/components/auth/DialogCompletarPerfil.vue'
import StatCard from '~/components/shared/StatCard.vue'

import { UserRole } from '~/types/auth'

definePageMeta({
  layout: 'cliente',
  middleware: ['auth', 'role'],
  roles: [UserRole.CLIENTE],
})

useHead({ title: 'Nueva Reserva' })

const router = useRouter()
const authStore = useAuthStore()
const { consultarDisponibilidad, obtenerHabitacionesDisponibles, crearReserva, obtenerMisReservas, loadingDisponibilidad, loadingHabitaciones, creandoReserva, disponibilidad, habitacionesDisponibles, reservas } = useReservas()
const { actualizarCliente } = useCliente()
const notification = useNotification()

// Estado del componente
const tiposHabitacion = ref<TipoHabitacion[]>([])
const showDialogConfirmar = ref(false)
const habitacionSeleccionada = ref<HabitacionDisponibleDto>()
const busquedaActuale = ref<{ checkin: string; checkout: string }>()
const loadingTipos = ref(false)
const mostrarDialogoCompletarPerfil = ref(false)

// De la sesión - El idHotel por defecto es 1, puede ser del usuario si lo tenemos
const idHotel = computed(() => authStore.user?.idHotel || 1)
const idCliente = ref(authStore.user?.idCliente || 0)

// Stat cards computadas
const totalHabitacionesMostradas = computed(() =>
  disponibilidad.value?.totalDisponibles ??
  disponibilidad.value?.habitacionesDisponibles?.length ??
  habitacionesDisponibles.value?.length ??
  0
)
const loadingMisReservas = ref(false)
const totalReservasActivas = computed(() =>
  (reservas.value || []).filter((r: any) =>
    !['cancelada', 'completada', 'rechazada'].includes(String(r.estadoReserva || '').toLowerCase())
  ).length
)

const ultimaReservaCreada = ref<any>(null)

/**
 * Cargar tipos de habitación
 */
const cargarTiposHabitacion = async () => {
  loadingTipos.value = true
  try {
    const api = useApi()
    
    // Intentar cargar con filtro de hotel
    let response = await api.get<TipoHabitacion[]>(
      `/tipos-habitacion?idHotel=${idHotel.value}`,
    )
    tiposHabitacion.value = response || []
    
    // Si no hay resultados, intentar sin filtro para debuggear
    if (tiposHabitacion.value.length === 0) {
      console.warn(`No hay tipos de habitación para el hotel ${idHotel.value}. Intentando obtener todos...`)
      response = await api.get<TipoHabitacion[]>('/tipos-habitacion')
      tiposHabitacion.value = response || []
      
      if (tiposHabitacion.value.length > 0) {
        console.log(`Encontrados ${tiposHabitacion.value.length} tipos de habitación en total. Hotels:`, 
          tiposHabitacion.value.map(t => t.idHotel))
      }
    }
  } catch (error: any) {
    console.error('Error al cargar tipos de habitación:', error)
  } finally {
    loadingTipos.value = false
  }
}

/**
 * Manejar búsqueda
 */
const handleBuscar = async (formData: { checkin: string; checkout: string }) => {
  busquedaActuale.value = {
    checkin: formData.checkin,
    checkout: formData.checkout,
  }

  // Consultar disponibilidad de TODAS las habitaciones (sin filtro de tipo)
  await consultarDisponibilidad(
    idHotel.value,
    formData.checkin,
    formData.checkout,
  )
}

/**
 * Manejar selección de habitación para reservar
 */
const handleReservar = (habitacion: HabitacionDisponibleDto) => {
  habitacionSeleccionada.value = habitacion
  showDialogConfirmar.value = true
}

/**
 * Confirmar la reserva
 */
const handleConfirmarReserva = async (reservaData: any) => {
  const reserva = await crearReserva(reservaData)

  if (reserva) {
    ultimaReservaCreada.value = reserva
    showDialogConfirmar.value = false
    habitacionSeleccionada.value = undefined

    // Mostrar modal para completar perfil (según lo necesites)
    mostrarDialogoCompletarPerfil.value = true
  }
}

/**
 * Guardar datos del cliente
 */
const guardarDatosCliente = async (datos: any) => {
  if (!authStore.user?.idCliente) {
    notification.error('No se encontró el ID del cliente')
    return
  }

  const success = await actualizarCliente(authStore.user.idCliente, datos)
  
  if (success) {
    mostrarDialogoCompletarPerfil.value = false
    
    // Actualizar el usuario en el store
    authStore.user.fullName = `${datos.nombre} ${datos.apellido}`
    
    // Ir a la confirmación
    await router.push({
      path: '/cliente/reservas/confirmacion',
      query: ultimaReservaCreada.value?.id ? { id: String(ultimaReservaCreada.value.id) } : {},
    })
  }
}

onMounted(async () => {
  cargarTiposHabitacion()
  if (idCliente.value) {
    loadingMisReservas.value = true
    try {
      await obtenerMisReservas(idCliente.value)
    } finally {
      loadingMisReservas.value = false
    }
  }
})
</script>

