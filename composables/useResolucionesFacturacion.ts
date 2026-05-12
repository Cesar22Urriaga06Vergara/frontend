import { computed, ref } from 'vue'
import { useApi } from './useApi'
import { useNotification } from './useNotification'
import type {
  CreateResolucionFacturacionDto,
  EstadoResolucionFacturacion,
  ResolucionFacturacion,
  UpdateResolucionFacturacionDto,
} from '~/types/resolucionFacturacion'

export const useResolucionesFacturacion = () => {
  const api = useApi()
  const { success, error } = useNotification()

  const resoluciones = ref<ResolucionFacturacion[]>([])
  const resolucionActiva = ref<ResolucionFacturacion | null>(null)
  const loading = ref(false)
  const guardando = ref(false)
  const errorMessage = ref('')

  const resolucionesOrdenadas = computed(() =>
    [...resoluciones.value].sort((a, b) => {
      if (a.estado === 'activa' && b.estado !== 'activa') return -1
      if (b.estado === 'activa' && a.estado !== 'activa') return 1
      return Number(b.id || 0) - Number(a.id || 0)
    }),
  )

  const listar = async (idHotel?: number) => {
    loading.value = true
    errorMessage.value = ''

    try {
      resoluciones.value = await api.get<ResolucionFacturacion[]>('/facturacion/resoluciones', {
        idHotel,
      })
      resolucionActiva.value =
        resoluciones.value.find((resolucion) => resolucion.estado === 'activa') || null
      return resoluciones.value
    } catch (err: any) {
      const message = err?.message || 'Error al cargar resoluciones'
      errorMessage.value = message
      error(message)
      throw err
    } finally {
      loading.value = false
    }
  }

  const obtenerActiva = async (idHotel?: number) => {
    loading.value = true
    errorMessage.value = ''

    try {
      resolucionActiva.value = await api.get<ResolucionFacturacion | null>(
        '/facturacion/resoluciones/activa',
        { idHotel },
      )
      return resolucionActiva.value
    } catch (err: any) {
      const message = err?.message || 'Error al cargar resolución activa'
      errorMessage.value = message
      error(message)
      throw err
    } finally {
      loading.value = false
    }
  }

  const crear = async (dto: CreateResolucionFacturacionDto) => {
    guardando.value = true
    errorMessage.value = ''

    try {
      const creada = await api.post<ResolucionFacturacion>('/facturacion/resoluciones', dto)
      success('Resolución de facturación creada')
      await listar(dto.idHotel)
      return creada
    } catch (err: any) {
      const message = err?.message || 'Error al crear resolución'
      errorMessage.value = message
      error(message)
      throw err
    } finally {
      guardando.value = false
    }
  }

  const actualizar = async (
    id: number,
    dto: UpdateResolucionFacturacionDto,
    idHotel?: number,
  ) => {
    guardando.value = true
    errorMessage.value = ''

    try {
      const endpoint = idHotel
        ? `/facturacion/resoluciones/${id}?idHotel=${idHotel}`
        : `/facturacion/resoluciones/${id}`
      const actualizada = await api.patch<ResolucionFacturacion>(
        endpoint,
        dto,
      )
      success(dto.estado ? `Resolución ${etiquetaEstado(dto.estado)}` : 'Resolución actualizada')
      await listar(idHotel)
      return actualizada
    } catch (err: any) {
      const message = err?.message || 'Error al actualizar resolución'
      errorMessage.value = message
      error(message)
      throw err
    } finally {
      guardando.value = false
    }
  }

  const etiquetaEstado = (estado: EstadoResolucionFacturacion) => {
    const labels: Record<EstadoResolucionFacturacion, string> = {
      activa: 'activa',
      inactiva: 'inactiva',
      vencida: 'vencida',
      agotada: 'agotada',
    }
    return labels[estado] || estado
  }

  const colorEstado = (estado: EstadoResolucionFacturacion) => {
    const colors: Record<EstadoResolucionFacturacion, string> = {
      activa: 'success',
      inactiva: 'grey',
      vencida: 'warning',
      agotada: 'error',
    }
    return colors[estado] || 'default'
  }

  return {
    resoluciones,
    resolucionesOrdenadas,
    resolucionActiva,
    loading,
    guardando,
    errorMessage,
    listar,
    obtenerActiva,
    crear,
    actualizar,
    etiquetaEstado,
    colorEstado,
  }
}
