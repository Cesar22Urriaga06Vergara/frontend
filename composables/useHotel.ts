import { ref } from 'vue'
import type { Hotel, CreateHotelDto, UpdateHotelDto } from '~/types/hotel'
import { useApi } from './useApi'
import { useNotification } from './useNotification'

/**
 * Composable para gestionar hoteles
 */
export const useHotel = () => {
  const api = useApi()
  const { success, error } = useNotification()

  // State
  const hoteles = ref<Hotel[]>([])
  const hotelActual = ref<Hotel | null>(null)
  const loadingHoteles = ref(false)
  const loadingDetalle = ref(false)
  const loadingOperacion = ref(false)
  const errorMessage = ref('')

  /**
   * Obtener todos los hoteles
   */
  const obtenerTodos = async () => {
    loadingHoteles.value = true
    errorMessage.value = ''

    try {
      const response = await api.get<Hotel[]>('/hoteles')
      hoteles.value = response
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al obtener hoteles'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loadingHoteles.value = false
    }
  }

  /**
   * Obtener un hotel por ID
   */
  const obtenerPorId = async (id: number) => {
    loadingDetalle.value = true
    errorMessage.value = ''

    try {
      const response = await api.get<Hotel>(`/hoteles/${id}`)
      hotelActual.value = response
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al obtener hotel'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loadingDetalle.value = false
    }
  }

  /**
   * Crear un nuevo hotel (solo superadmin)
   */
  const crear = async (dto: CreateHotelDto) => {
    loadingOperacion.value = true
    errorMessage.value = ''

    try {
      const response = await api.post<Hotel>('/hoteles', dto)
      hoteles.value.push(response)
      success('Hotel creado exitosamente')
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al crear hotel'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loadingOperacion.value = false
    }
  }

  /**
   * Actualizar un hotel (solo superadmin)
   */
  const actualizar = async (id: number, dto: UpdateHotelDto) => {
    loadingOperacion.value = true
    errorMessage.value = ''

    try {
      const response = await api.patch<Hotel>(`/hoteles/${id}`, dto)
      
      // Actualizar en la lista si existe
      const index = hoteles.value.findIndex(h => h.id === id)
      if (index !== -1) {
        hoteles.value[index] = response
      }
      
      // Actualizar el actual si es el mismo
      if (hotelActual.value?.id === id) {
        hotelActual.value = response
      }
      
      success('Hotel actualizado exitosamente')
      return response
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al actualizar hotel'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loadingOperacion.value = false
    }
  }

  /**
   * Eliminar un hotel (solo superadmin)
   */
  const eliminar = async (id: number) => {
    loadingOperacion.value = true
    errorMessage.value = ''

    try {
      await api.del(`/hoteles/${id}`)
      
      // Remover de la lista
      hoteles.value = hoteles.value.filter(h => h.id !== id)
      
      // Limpiar el actual si es el mismo
      if (hotelActual.value?.id === id) {
        hotelActual.value = null
      }
      
      success('Hotel eliminado exitosamente')
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al eliminar hotel'
      errorMessage.value = errorMsg
      error(errorMsg)
      throw err
    } finally {
      loadingOperacion.value = false
    }
  }

  /**
   * Obtener color de estado para Vuetify
   */
  const getColorEstado = (estado: string): string => {
    switch (estado) {
      case 'activo':
        return 'success'
      case 'suspendido':
        return 'error'
      default:
        return 'default'
    }
  }

  /**
   * Obtener ícono de estado
   */
  const getIconoEstado = (estado: string): string => {
    switch (estado) {
      case 'activo':
        return 'mdi-check-circle'
      case 'suspendido':
        return 'mdi-cancel'
      default:
        return 'mdi-help-circle'
    }
  }

  return {
    // State
    hoteles,
    hotelActual,
    loadingHoteles,
    loadingDetalle,
    loadingOperacion,
    errorMessage,
    
    // Métodos
    obtenerTodos,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
    
    // Helpers
    getColorEstado,
    getIconoEstado,
  }
}
