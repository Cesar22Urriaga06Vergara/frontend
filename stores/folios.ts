import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Folio, Cargo, EstadoFolio } from '~/types/folio'

export const useFoliosStore = defineStore('folios', () => {
  // State
  const folioActual = ref<Folio | null>(null)
  const historialDelDia = ref<Folio[]>([])
  const foliosRecientes = ref<Folio[]>([])
  const filtroEstado = ref<EstadoFolio | 'TODOS'>('TODOS')
  const filtroFecha = ref<string>('')

  // Calculados útiles
  const totalCargosActual = computed(() => {
    return folioActual.value?.cargos.length || 0
  })

  const totalIngresos = computed(() => {
    return historialDelDia.value
      .filter((f) => f.pagado)
      .reduce((sum, f) => sum + f.total, 0)
  })

  const foliosCerrados = computed(() => {
    return historialDelDia.value.filter((f) => f.estado === 'CERRADO').length
  })

  const foliosPagados = computed(() => {
    return historialDelDia.value.filter((f) => f.pagado).length
  })

  const foliosConSaldo = computed(() => {
    return historialDelDia.value.filter((f) => (f.saldo || 0) > 0)
  })

  const totalSaldoPendiente = computed(() => {
    return foliosConSaldo.value.reduce((sum, f) => sum + (f.saldo || 0), 0)
  })

  // Filtrados
  const historialFiltrado = computed(() => {
    let resultado = historialDelDia.value

    if (filtroEstado.value !== 'TODOS') {
      resultado = resultado.filter((f) => f.estado === filtroEstado.value)
    }

    if (filtroFecha.value) {
      resultado = resultado.filter((f) => f.fechaApertura?.startsWith(filtroFecha.value))
    }

    return resultado
  })

  /**
   * Establecer el folio actual
   */
  const setFolioActual = (folio: Folio | null) => {
    folioActual.value = folio
  }

  /**
   * Agregar folio al historial del día
   */
  const agregarAlHistorial = (folio: Folio) => {
    const existe = historialDelDia.value.find((f) => f.id === folio.id)
    if (existe) {
      // Actualizar si ya existe
      const indice = historialDelDia.value.findIndex((f) => f.id === folio.id)
      historialDelDia.value[indice] = folio
    } else {
      // Agregar nuevo
      historialDelDia.value.unshift(folio)
    }

    // Mantener recientes (últimos 10)
    foliosRecientes.value = historialDelDia.value.slice(0, 10)
  }

  /**
   * Limpiar historial (cuando cambia el día o se cierra sesión)
   */
  const limpiarHistorial = () => {
    historialDelDia.value = []
    foliosRecientes.value = []
    folioActual.value = null
  }

  /**
   * Cambiar filtro de estado
   */
  const cambiarFiltroEstado = (estado: EstadoFolio | 'TODOS') => {
    filtroEstado.value = estado
  }

  /**
   * Cambiar filtro de fecha
   */
  const cambiarFiltroFecha = (fecha: string) => {
    filtroFecha.value = fecha
  }

  /**
   * Limpiar todos los filtros
   */
  const limpiarFiltros = () => {
    filtroEstado.value = 'TODOS'
    filtroFecha.value = ''
  }

  /**
   * Buscar folio en historial por ID habitación
   */
  const buscarFolioPorHabitacion = (idHabitacion: number) => {
    return historialDelDia.value.find(
      (f) => f.idHabitacion === idHabitacion && f.estado !== 'PAGADO'
    )
  }

  /**
   * Actualizar folio existente en historial
   */
  const actualizarFolioEnHistorial = (folio: Folio) => {
    const indice = historialDelDia.value.findIndex((f) => f.id === folio.id)
    if (indice !== -1) {
      historialDelDia.value[indice] = folio
    }
  }

  return {
    // State
    folioActual,
    historialDelDia,
    foliosRecientes,
    filtroEstado,
    filtroFecha,

    // Computed
    totalCargosActual,
    totalIngresos,
    foliosCerrados,
    foliosPagados,
    foliosConSaldo,
    totalSaldoPendiente,
    historialFiltrado,

    // Methods
    setFolioActual,
    agregarAlHistorial,
    limpiarHistorial,
    cambiarFiltroEstado,
    cambiarFiltroFecha,
    limpiarFiltros,
    buscarFolioPorHabitacion,
    actualizarFolioEnHistorial
  }
})
