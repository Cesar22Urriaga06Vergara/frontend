import { useApi } from './useApi'
import { useNotification } from './useNotification'

export const useCliente = () => {
  const api = useApi()
  const { success, error } = useNotification()

  /**
   * Actualizar datos del cliente
   */
  const actualizarCliente = async (idCliente: number, datos: any): Promise<boolean> => {
    try {
      // Usar el endpoint de completar perfil
      await api.put(`/auth/me/complete-profile`, {
        cedula: datos.cedula,
        tipoDocumento: datos.tipoDocumento,
        telefono: datos.telefono,
      })
      success('Datos actualizados con éxito')
      return true
    } catch (err: any) {
      error(err?.message || 'Error al actualizar datos')
      return false
    }
  }

  return {
    actualizarCliente,
  }
}
