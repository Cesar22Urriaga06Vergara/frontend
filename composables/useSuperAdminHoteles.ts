import { ref, computed } from 'vue'
import { useApi } from './useApi'
import type { Hotel, CreateHotelDto, UpdateHotelDto, MetricasPlataforma } from '~/types/superadmin'

export const useSuperAdminHoteles = () => {
  const { get, post, patch, del } = useApi()
  
  // State
  const hoteles = ref<Hotel[]>([])
  const hotelSeleccionado = ref<Hotel | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const dialogo = ref(false)
  const modoEdicion = ref(false)

  // Computed
  const hotelesActivos = computed(() => hoteles.value.filter(h => h.estado === 'activo'))
  const hotelesSuspendidos = computed(() => hoteles.value.filter(h => h.estado === 'suspendido'))
  const hotelesActuales = computed(() => {
    if (!hotelSeleccionado.value) return hoteles.value
    return hoteles.value.filter(h => h.id === hotelSeleccionado.value?.id)
  })

  // Métodos
  const obtenerHoteles = async () => {
    isLoading.value = true
    error.value = null
    try {
      hoteles.value = await get<Hotel[]>('/superadmin/hoteles')
    } catch (err: any) {
      error.value = err.message || 'Error al obtener hoteles'
    } finally {
      isLoading.value = false
    }
  }

  const crearHotel = async (datos: CreateHotelDto) => {
    isLoading.value = true
    error.value = null
    try {
      const nuevoHotel = await post<Hotel>('/superadmin/hoteles', datos)
      hoteles.value.push(nuevoHotel)
      dialogo.value = false
      return nuevoHotel
    } catch (err: any) {
      error.value = err.message || 'Error al crear hotel'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const actualizarHotel = async (id: number, datos: UpdateHotelDto) => {
    isLoading.value = true
    error.value = null
    try {
      const hotelActualizado = await patch<Hotel>(`/superadmin/hoteles/${id}`, datos)
      const indice = hoteles.value.findIndex(h => h.id === id)
      if (indice !== -1) {
        hoteles.value[indice] = hotelActualizado
      }
      hotelSeleccionado.value = hotelActualizado
      dialogo.value = false
      return hotelActualizado
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar hotel'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const suspenderHotel = async (id: number, razon: string) => {
    isLoading.value = true
    error.value = null
    try {
      const hotel = await post<Hotel>(`/superadmin/hoteles/${id}/suspender`, { razon })
      const indice = hoteles.value.findIndex(h => h.id === id)
      if (indice !== -1) {
        hoteles.value[indice] = hotel
      }
      return hotel
    } catch (err: any) {
      error.value = err.message || 'Error al suspender hotel'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const bloquearHotel = async (id: number, razon: string) => {
    isLoading.value = true
    error.value = null
    try {
      const hotel = await post<Hotel>(`/superadmin/hoteles/${id}/bloquear`, { razon })
      const indice = hoteles.value.findIndex(h => h.id === id)
      if (indice !== -1) {
        hoteles.value[indice] = hotel
      }
      return hotel
    } catch (err: any) {
      error.value = err.message || 'Error al bloquear hotel'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const reactivarHotel = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      const hotel = await post<Hotel>(`/superadmin/hoteles/${id}/reactivar`, {})
      const indice = hoteles.value.findIndex(h => h.id === id)
      if (indice !== -1) {
        hoteles.value[indice] = hotel
      }
      return hotel
    } catch (err: any) {
      error.value = err.message || 'Error al reactivar hotel'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const abrirDialogoCrear = () => {
    modoEdicion.value = false
    hotelSeleccionado.value = null
    dialogo.value = true
  }

  const abrirDialogoEditar = (hotel: Hotel) => {
    modoEdicion.value = true
    hotelSeleccionado.value = hotel
    dialogo.value = true
  }

  const cerrarDialogo = () => {
    dialogo.value = false
    hotelSeleccionado.value = null
  }

  return {
    hoteles,
    hotelSeleccionado,
    isLoading,
    error,
    dialogo,
    modoEdicion,
    hotelesActivos,
    hotelesSuspendidos,
    hotelesActuales,
    obtenerHoteles,
    crearHotel,
    actualizarHotel,
    suspenderHotel,
    bloquearHotel,
    reactivarHotel,
    abrirDialogoCrear,
    abrirDialogoEditar,
    cerrarDialogo
  }
}
