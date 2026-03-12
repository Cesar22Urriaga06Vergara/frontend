import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Pedido } from '~/types/servicios';
import { useApi } from '~/composables/useApi';

export const usePedidosAreaStore = defineStore('pedidosArea', () => {
  const api = useApi();

  // State
  const pedidos = ref<Pedido[]>([]);
  const loading = ref(false);
  const categoria = ref<string>('');
  const idHotel = ref<number>(0);
  const filtroEstado = ref<string | null>(null);

  // Actions
  const cargarPedidos = async (hotelId: number, categor: string, estado?: string) => {
    loading.value = true;
    try {
      idHotel.value = hotelId;
      categoria.value = categor;
      filtroEstado.value = estado || null;

      let url = `/servicios/pedidos/area/${hotelId}/${categor}`;
      if (estado) {
        url += `?estado=${estado}`;
      }

      const data = await api.get(url);
      pedidos.value = data;
    } catch (error) {
      console.error('Error cargando pedidos del área:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const actualizarEstadoPedido = async (
    idPedido: number,
    estadoNuevo: string,
    nota?: string,
  ): Promise<Pedido> => {
    loading.value = true;
    try {
      const payload: any = { estadoPedido: estadoNuevo };
      if (nota) {
        payload.notaEmpleado = nota;
      }

      const data = await api.patch(`/servicios/pedidos/${idPedido}/estado`, payload);

      // Actualizar en la lista local
      const index = pedidos.value.findIndex((p) => p.id === idPedido);
      if (index > -1) {
        pedidos.value[index] = data;
      }

      return data;
    } catch (error) {
      console.error('Error actualizando estado:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const obtenerPedido = async (idPedido: number): Promise<Pedido> => {
    try {
      return await api.get(`/servicios/pedidos/${idPedido}`);
    } catch (error) {
      console.error('Error obteniendo pedido:', error);
      throw error;
    }
  };

  const refrescarPedidos = async () => {
    if (idHotel.value > 0 && categoria.value) {
      await cargarPedidos(idHotel.value, categoria.value, filtroEstado.value || undefined);
    }
  };

  return {
    // State
    pedidos,
    loading,
    categoria,
    idHotel,
    filtroEstado,

    // Actions
    cargarPedidos,
    actualizarEstadoPedido,
    obtenerPedido,
    refrescarPedidos,
  };
});
