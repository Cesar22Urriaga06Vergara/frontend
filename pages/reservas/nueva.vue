<template>
  <div>
    <v-container>
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-h4 font-weight-bold mb-2">
          <v-icon icon="mdi-calendar-check" start />
          Nueva Reserva
        </h1>
        <p class="text-body-1 text-medium-emphasis">
          Busca disponibilidad y realiza tu reserva en segundos
        </p>
      </div>

      <!-- Formulario de búsqueda -->
      <FormularioBusqueda
        :tipos-habitacion="tiposHabitacion"
        :loading="loadingDisponibilidad"
        @buscar="handleBuscar"
      />

      <!-- Error si no hay tipos de habitación -->
      <v-alert
        v-if="!loadingTipos && tiposHabitacion.length === 0"
        type="warning"
        variant="tonal"
        class="mb-4"
      >
        <p class="mb-0">
          No hay tipos de habitación disponibles en este momento. Por favor, intenta más tarde.
        </p>
      </v-alert>

      <!-- Resultado de la búsqueda -->
      <div v-if="disponibilidad">
        <!-- Información de la búsqueda -->
        <v-alert type="success" variant="tonal" class="mb-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <strong>{{ disponibilidad.totalDisponibles }}</strong> habitación{{ disponibilidad.totalDisponibles !== 1 ? 'es' : '' }} disponible{{ disponibilidad.totalDisponibles !== 1 ? 's' : '' }} para su búsqueda
            </div>
            <v-btn
              variant="text"
              size="small"
              @click="disponibilidad = null"
            >
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
        <v-alert type="info" variant="tonal" class="mb-4">
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
      <div v-else class="text-center py-12">
        <v-icon icon="mdi-magnify" size="80" color="grey-darken-1" class="mb-4 opacity-50" />
        <h2 class="text-h6 font-weight-medium mb-2">Comienza tu búsqueda</h2>
        <p class="text-body-2 text-medium-emphasis">
          Selecciona tus fechas y tipo de habitación para ver disponibilidad
        </p>
      </div>
    </v-container>

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
import type { TipoHabitacion, HabitacionDisponibleDto } from '~/types/api'
import FormularioBusqueda from '~/components/reservas/FormularioBusqueda.vue'
import HabitacionesGrid from '~/components/reservas/HabitacionesGrid.vue'
import DialogConfirmarReserva from '~/components/reservas/DialogConfirmarReserva.vue'
import DialogCompletarPerfil from '~/components/auth/DialogCompletarPerfil.vue'

definePageMeta({
  middleware: ['auth'],
})

useHead({ title: 'Nueva Reserva' })

const router = useRouter()
const authStore = useAuthStore()
const { consultarDisponibilidad, obtenerHabitacionesDisponibles, crearReserva, loadingDisponibilidad, loadingHabitaciones, creandoReserva, disponibilidad, habitacionesDisponibles } = useReservas()
const { actualizarCliente } = useCliente()

// Estado del componente
const tiposHabitacion = ref<TipoHabitacion[]>([])
const showDialogConfirmar = ref(false)
const habitacionSeleccionada = ref<HabitacionDisponibleDto>()
const busquedaActuale = ref<{ checkin: string; checkout: string }>()
const loadingTipos = ref(false)
const mostrarDialogoCompletarPerfil = ref(false)

// De la sesión - El idHotel por defecto es 1, puede ser del usuario si lo tenemos
const idHotel = ref(1)
const idCliente = ref(authStore.user?.idCliente || 0)

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
  if (!authStore.user?.idCliente) return

  const success = await actualizarCliente(authStore.user.idCliente, datos)
  
  if (success) {
    mostrarDialogoCompletarPerfil.value = false
    
    // Actualizar el usuario en el store
    authStore.user.fullName = `${datos.nombre} ${datos.apellido}`
    
    // Ir a la confirmación
    await router.push({
      path: '/reservas/confirmacion',
      query: { id: 'last' }, // Esto debería obtener la última reserva creada
    })
  }
}

onMounted(() => {
  cargarTiposHabitacion()
})
</script>

<style scoped>
</style>
