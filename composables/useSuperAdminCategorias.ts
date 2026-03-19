import { ref } from 'vue'
import { useApi } from './useApi'
import type { CategoriaServicio, ModuloSistema } from '~/types/superadmin'

export const useSuperAdminCategorias = () => {
  const { get, post, patch, del } = useApi()
  
  // State
  const categorias = ref<CategoriaServicio[]>([])
  const modulos = ref<ModuloSistema[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const dialogoCategorias = ref(false)
  const dialogoModulos = ref(false)

  // Métodos Categorías
  const obtenerCategorias = async () => {
    isLoading.value = true
    error.value = null
    try {
      categorias.value = await get<CategoriaServicio[]>('/superadmin/categorias-servicios')
    } catch (err: any) {
      error.value = err.message || 'Error al obtener categorías'
    } finally {
      isLoading.value = false
    }
  }

  const crearCategoria = async (nombre: string, descripcion: string, icono?: string) => {
    isLoading.value = true
    error.value = null
    try {
      const nuevaCategoria = await post<CategoriaServicio>('/superadmin/categorias-servicios', { nombre, descripcion, icono })
      categorias.value.push(nuevaCategoria)
      return nuevaCategoria
    } catch (err: any) {
      error.value = err.message || 'Error al crear categoría'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const actualizarCategoria = async (id: number, nombre: string, descripcion: string, icono?: string) => {
    isLoading.value = true
    error.value = null
    try {
      const categoriaActualizada = await patch<CategoriaServicio>(`/superadmin/categorias-servicios/${id}`, { nombre, descripcion, icono })
      const indice = categorias.value.findIndex(c => c.id === id)
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

  const desactivarCategoria = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      const categoria = await patch<CategoriaServicio>(`/superadmin/categorias-servicios/${id}`, { esActiva: false })
      const indice = categorias.value.findIndex(c => c.id === id)
      if (indice !== -1) {
        categorias.value[indice] = categoria
      }
      return categoria
    } catch (err: any) {
      error.value = err.message || 'Error al desactivar categoría'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Métodos Módulos
  const obtenerModulos = async () => {
    isLoading.value = true
    error.value = null
    try {
      modulos.value = await get<ModuloSistema[]>('/superadmin/modulos-sistema')
    } catch (err: any) {
      error.value = err.message || 'Error al obtener módulos'
    } finally {
      isLoading.value = false
    }
  }

  const crearModulo = async (nombre: string, descripcion: string, clave: string, requeridos?: string[]) => {
    isLoading.value = true
    error.value = null
    try {
      const nuevoModulo = await post<ModuloSistema>('/superadmin/modulos-sistema', { nombre, descripcion, clave, requeridos })
      modulos.value.push(nuevoModulo)
      return nuevoModulo
    } catch (err: any) {
      error.value = err.message || 'Error al crear módulo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const actualizarModulo = async (id: number, nombre: string, descripcion: string, requeridos?: string[]) => {
    isLoading.value = true
    error.value = null
    try {
      const moduloActualizado = await patch<ModuloSistema>(`/superadmin/modulos-sistema/${id}`, { nombre, descripcion, requeridos })
      const indice = modulos.value.findIndex(m => m.id === id)
      if (indice !== -1) {
        modulos.value[indice] = moduloActualizado
      }
      return moduloActualizado
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar módulo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const desactivarModulo = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      const modulo = await patch<ModuloSistema>(`/superadmin/modulos-sistema/${id}`, { esActivo: false })
      const indice = modulos.value.findIndex(m => m.id === id)
      if (indice !== -1) {
        modulos.value[indice] = modulo
      }
      return modulo
    } catch (err: any) {
      error.value = err.message || 'Error al desactivar módulo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    categorias,
    modulos,
    isLoading,
    error,
    dialogoCategorias,
    dialogoModulos,
    obtenerCategorias,
    crearCategoria,
    actualizarCategoria,
    desactivarCategoria,
    obtenerModulos,
    crearModulo,
    actualizarModulo,
    desactivarModulo
  }
}
