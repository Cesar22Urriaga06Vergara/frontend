export const useCliente = () => {
  const api = useApi()
  const { success, error } = useNotification()

  /**
   * Actualizar datos del cliente
   */
  const actualizarCliente = async (idCliente: number, datos: any): Promise<boolean> => {
    try {
      await api.patch(`/clientes/${idCliente}`, datos)
      success('Datos actualizados correctamente')
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
