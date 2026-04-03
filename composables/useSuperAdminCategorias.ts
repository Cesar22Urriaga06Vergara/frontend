import { ref } from 'vue'
import { useApi } from './useApi'
import type { CategoriaServicio } from '~/types/superadmin'

export const useSuperAdminCategorias = () => {
  const { get, post, patch, del } = useApi()

  // State
  const categorias = ref<CategoriaServicio[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const dialogoCategorias = ref(false)

  // Métodos Categorías
  const obtenerCategorias = async (idHotel?: number) => {
    isLoading.value = true
    error.value = null
    try {
      const query = idHotel ? `?idHotel=${idHotel}` : ''
      categorias.value = await get<CategoriaServicio[]>(`/superadmin/categorias-servicios${query}`)
    } catch (err: any) {
      error.value = err.message || 'Error al obtener categorías'
    } finally {
      isLoading.value = false
    }
  }

  const crearCategoria = async (data: {
    idHotel: number
    nombre: string
    descripcion?: string
    codigo: string
    activa?: boolean
  }) => {
    isLoading.value = true
    error.value = null
    try {
      const nuevaCategoria = await post<CategoriaServicio>('/superadmin/categorias-servicios', data)
      categorias.value.push(nuevaCategoria)
      return nuevaCategoria
    } catch (err: any) {
      error.value = err.message || 'Error al crear categoría'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const actualizarCategoria = async (
    id: number,
    data: { nombre?: string; descripcion?: string; activa?: boolean },
  ) => {
    isLoading.value = true
    error.value = null
    try {
      const categoriaActualizada = await patch<CategoriaServicio>(
        `/superadmin/categorias-servicios/${id}`,
        data,
      )
      const indice = categorias.value.findIndex((c) => c.id === id)
      if (indice !== -1) {
        categorias.value[indice] = categoriaActualizada
      }
      return categoriaActualizada
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar categoría'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const toggleCategoria = async (id: number, activa: boolean) => {
    return actualizarCategoria(id, { activa })
  }

  const eliminarCategoria = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      await del(`/superadmin/categorias-servicios/${id}`)
      categorias.value = categorias.value.filter((c) => c.id !== id)
    } catch (err: any) {
      error.value = err.message || 'Error al eliminar categoría'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    categorias,
    isLoading,
    error,
    dialogoCategorias,
    obtenerCategorias,
    crearCategoria,
    actualizarCategoria,
    toggleCategoria,
    eliminarCategoria,
  }
}

