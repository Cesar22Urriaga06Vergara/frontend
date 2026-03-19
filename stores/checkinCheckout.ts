import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ReservaParaCheckin, FlujoDelDia } from '~/types/checkinCheckout'

export const useCheckinCheckoutStore = defineStore('checkinCheckout', () => {
  // State
  const pendientesCheckin = ref<ReservaParaCheckin[]>([])
  const pendientesCheckout = ref<ReservaParaCheckin[]>([])
  const checkinsRealizadosHoy = ref<ReservaParaCheckin[]>([])
  const checkoutsRealizadosHoy = ref<ReservaParaCheckin[]>([])
  const flujoDelDia = ref<FlujoDelDia | null>(null)
  const filtroHabitacion = ref('')
  const filtroCliente = ref('')

  // Computed
  const totalPendientesCheckin = computed(() => pendientesCheckin.value.length)
  const totalPendientesCheckout = computed(() => pendientesCheckout.value.length)
  const totalPendientes = computed(() => totalPendientesCheckin.value + totalPendientesCheckout.value)

  const pendientesCheckFiltrados = computed(() => {
    let resultado = pendientesCheckin.value

    if (filtroHabitacion.value) {
      resultado = resultado.filter((r) =>
        r.numeroHabitacion.includes(filtroHabitacion.value)
      )
    }

    if (filtroCliente.value) {
      resultado = resultado.filter((r) =>
        r.nombreCliente?.toLowerCase().includes(filtroCliente.value.toLowerCase())
      )
    }

    return resultado
  })

  const pendientesCheckoutFiltrados = computed(() => {
    let resultado = pendientesCheckout.value

    if (filtroHabitacion.value) {
      resultado = resultado.filter((r) =>
        r.numeroHabitacion.includes(filtroHabitacion.value)
      )
    }

    if (filtroCliente.value) {
      resultado = resultado.filter((r) =>
        r.nombreCliente?.toLowerCase().includes(filtroCliente.value.toLowerCase())
      )
    }

    return resultado
  })

  /**
   * Establecer lista de pendientes de check-in
   */
  const setPendientesCheckin = (reservas: ReservaParaCheckin[]) => {
    pendientesCheckin.value = reservas
  }

  /**
   * Establecer lista de pendientes de checkout
   */
  const setPendientesCheckout = (reservas: ReservaParaCheckin[]) => {
    pendientesCheckout.value = reservas
  }

  /**
   * Agregar a completados check-in
   */
  const agregarCheckInRealizado = (reserva: ReservaParaCheckin) => {
    checkinsRealizadosHoy.value.unshift(reserva)
    // Remover de pendientes
    pendientesCheckin.value = pendientesCheckin.value.filter((r) => r.id !== reserva.id)
  }

  /**
   * Agregar a completados check-out
   */
  const agregarCheckOutRealizado = (reserva: ReservaParaCheckin) => {
    checkoutsRealizadosHoy.value.unshift(reserva)
    // Remover de pendientes
    pendientesCheckout.value = pendientesCheckout.value.filter((r) => r.id !== reserva.id)
  }

  /**
   * Establecer flujo del día
   */
  const setFlujoDelDia = (flujo: FlujoDelDia) => {
    flujoDelDia.value = flujo
  }

  /**
   * Cambiar filtro de habitación
   */
  const cambiarFiltroHabitacion = (numero: string) => {
    filtroHabitacion.value = numero
  }

  /**
   * Cambiar filtro de cliente
   */
  const cambiarFiltroCliente = (cliente: string) => {
    filtroCliente.value = cliente
  }

  /**
   * Limpiar filtros
   */
  const limpiarFiltros = () => {
    filtroHabitacion.value = ''
    filtroCliente.value = ''
  }

  /**
   * Limpiar historial del día
   */
  const limpiarHistorial = () => {
    checkinsRealizadosHoy.value = []
    checkoutsRealizadosHoy.value = []
  }

  return {
    // State
    pendientesCheckin,
    pendientesCheckout,
    checkinsRealizadosHoy,
    checkoutsRealizadosHoy,
    flujoDelDia,
    filtroHabitacion,
    filtroCliente,

    // Computed
    totalPendientesCheckin,
    totalPendientesCheckout,
    totalPendientes,
    pendientesCheckFiltrados,
    pendientesCheckoutFiltrados,

    // Methods
    setPendientesCheckin,
    setPendientesCheckout,
    agregarCheckInRealizado,
    agregarCheckOutRealizado,
    setFlujoDelDia,
    cambiarFiltroHabitacion,
    cambiarFiltroCliente,
    limpiarFiltros,
    limpiarHistorial
  }
})
