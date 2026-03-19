import { ref } from 'vue'
import { useApi } from './useApi'
import type { FeaturesFlag, ParametroGlobal } from '~/types/superadmin'

export const useSuperAdminConfiguracion = () => {
  const { get, post, patch } = useApi()
  
  // State
  const featuresFlags = ref<FeaturesFlag[]>([])
  const parametrosGlobales = ref<ParametroGlobal[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const dialogoFeatureFlags = ref(false)
  const dialogoParametros = ref(false)

  // Métodos Features Flags
  const obtenerFeaturesFlags = async () => {
    isLoading.value = true
    error.value = null
    try {
      featuresFlags.value = await get<FeaturesFlag[]>('/superadmin/config/features-flags')
    } catch (err: any) {
      error.value = err.message || 'Error al obtener features flags'
    } finally {
      isLoading.value = false
    }
  }

  const crearFeaturesFlag = async (datos: Omit<FeaturesFlag, 'id'>) => {
    isLoading.value = true
    error.value = null
    try {
      const nuevoFlag = await post<FeaturesFlag>('/superadmin/config/features-flags', datos)
      featuresFlags.value.push(nuevoFlag)
      dialogoFeatureFlags.value = false
      return nuevoFlag
    } catch (err: any) {
      error.value = err.message || 'Error al crear features flag'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const actualizarFeaturesFlag = async (id: number, datos: Partial<FeaturesFlag>) => {
    isLoading.value = true
    error.value = null
    try {
      const flagActualizado = await patch<FeaturesFlag>(`/superadmin/config/features-flags/${id}`, datos)
      const indice = featuresFlags.value.findIndex(f => f.id === id)
      if (indice !== -1) {
        featuresFlags.value[indice] = flagActualizado
      }
      return flagActualizado
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar features flag'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const activarFeaturesFlag = async (id: number) => {
    return await actualizarFeaturesFlag(id, { esActivo: true })
  }

  const desactivarFeaturesFlag = async (id: number) => {
    return await actualizarFeaturesFlag(id, { esActivo: false })
  }

  // Métodos Parámetros Globales
  const obtenerParametrosGlobales = async () => {
    isLoading.value = true
    error.value = null
    try {
      parametrosGlobales.value = await get<ParametroGlobal[]>('/superadmin/config/parametros-globales')
    } catch (err: any) {
      error.value = err.message || 'Error al obtener parámetros globales'
    } finally {
      isLoading.value = false
    }
  }

  const actualizarParametroGlobal = async (clave: string, valor: string) => {
    isLoading.value = true
    error.value = null
    try {
      const parametroActualizado = await patch<ParametroGlobal>(`/superadmin/config/parametros-globales/${clave}`, { valor })
      const indice = parametrosGlobales.value.findIndex(p => p.clave === clave)
      if (indice !== -1) {
        parametrosGlobales.value[indice] = parametroActualizado
      }
      return parametroActualizado
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar parámetro'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const obtenerParametroPorClave = (clave: string) => {
    return parametrosGlobales.value.find(p => p.clave === clave)
  }

  const obtenerParametrosPorCategoria = (categoria: string) => {
    return parametrosGlobales.value.filter(p => p.categoria === categoria)
  }

  return {
    featuresFlags,
    parametrosGlobales,
    isLoading,
    error,
    dialogoFeatureFlags,
    dialogoParametros,
    obtenerFeaturesFlags,
    crearFeaturesFlag,
    actualizarFeaturesFlag,
    activarFeaturesFlag,
    desactivarFeaturesFlag,
    obtenerParametrosGlobales,
    actualizarParametroGlobal,
    obtenerParametroPorClave,
    obtenerParametrosPorCategoria
  }
}
