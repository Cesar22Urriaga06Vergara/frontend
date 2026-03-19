import { ref } from 'vue'
import { useApi } from './useApi'
import type { Plan, CreatePlanDto, UpdatePlanDto, LimiteSistema, UpdateLimiteDto } from '~/types/superadmin'

export const useSuperAdminPlanes = () => {
  const { get, post, patch, del } = useApi()
  
  // State
  const planes = ref<Plan[]>([])
  const planSeleccionado = ref<Plan | null>(null)
  const limites = ref<LimiteSistema[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const dialogo = ref(false)
  const modoEdicion = ref(false)

  // Métodos Planes
  const obtenerPlanes = async () => {
    isLoading.value = true
    error.value = null
    try {
      planes.value = await get<Plan[]>('/superadmin/planes')
    } catch (err: any) {
      error.value = err.message || 'Error al obtener planes'
    } finally {
      isLoading.value = false
    }
  }

  const crearPlan = async (datos: CreatePlanDto) => {
    isLoading.value = true
    error.value = null
    try {
      const nuevoPlan = await post<Plan>('/superadmin/planes', datos)
      planes.value.push(nuevoPlan)
      dialogo.value = false
      return nuevoPlan
    } catch (err: any) {
      error.value = err.message || 'Error al crear plan'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const actualizarPlan = async (id: number, datos: UpdatePlanDto) => {
    isLoading.value = true
    error.value = null
    try {
      const planActualizado = await patch<Plan>(`/superadmin/planes/${id}`, datos)
      const indice = planes.value.findIndex(p => p.id === id)
      if (indice !== -1) {
        planes.value[indice] = planActualizado
      }
      planSeleccionado.value = planActualizado
      dialogo.value = false
      return planActualizado
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar plan'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const desactivarPlan = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      const plan = await patch<Plan>(`/superadmin/planes/${id}`, { esActivo: false })
      const indice = planes.value.findIndex(p => p.id === id)
      if (indice !== -1) {
        planes.value[indice] = plan
      }
      return plan
    } catch (err: any) {
      error.value = err.message || 'Error al desactivar plan'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const abrirDialogoCrearPlan = () => {
    modoEdicion.value = false
    planSeleccionado.value = null
    dialogo.value = true
  }

  const abrirDialogoEditarPlan = (plan: Plan) => {
    modoEdicion.value = true
    planSeleccionado.value = plan
    dialogo.value = true
  }

  // Métodos Límites Sistema
  const obtenerLimites = async () => {
    isLoading.value = true
    error.value = null
    try {
      limites.value = await get<LimiteSistema[]>('/superadmin/limites-sistema')
    } catch (err: any) {
      error.value = err.message || 'Error al obtener límites'
    } finally {
      isLoading.value = false
    }
  }

  const actualizarLimite = async (clave: string, datos: UpdateLimiteDto) => {
    isLoading.value = true
    error.value = null
    try {
      const limiteActualizado = await patch<LimiteSistema>(`/superadmin/limites-sistema/${clave}`, datos)
      const indice = limites.value.findIndex(l => l.clave === clave)
      if (indice !== -1) {
        limites.value[indice] = limiteActualizado
      }
      return limiteActualizado
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar límite'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const cerrarDialogo = () => {
    dialogo.value = false
    planSeleccionado.value = null
  }

  return {
    planes,
    planSeleccionado,
    limites,
    isLoading,
    error,
    dialogo,
    modoEdicion,
    obtenerPlanes,
    crearPlan,
    actualizarPlan,
    desactivarPlan,
    abrirDialogoCrearPlan,
    abrirDialogoEditarPlan,
    cerrarDialogo,
    obtenerLimites,
    actualizarLimite
  }
}
