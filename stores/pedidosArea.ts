import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Pedido } from '~/types/servicios';
import { useApi } from '~/composables/useApi';
import { normalizePedido } from '~/utils/entityAdapters';
import { getErrorMessage, isUnavailableError } from '~/utils/http';

export const usePedidosAreaStore = defineStore('pedidosArea', () => {
  const api = useApi();

  // State
  const pedidos = ref<Pedido[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const unavailable = ref(false);
  const categoria = ref<string>('');
  const idHotel = ref<number>(0);
  const filtroEstado = ref<string | null>(null);

  // Actions
  const cargarPedidos = async (hotelId: number, categor: string, estado?: string) => {
    loading.value = true;
    error.value = null;
    unavailable.value = false;
    try {
      idHotel.value = hotelId;
      categoria.value = categor;
      filtroEstado.value = estado || null;

      let url = `/servicios/pedidos/area/${hotelId}/${categor}`;
      if (estado) {
        url += `?estado=${estado}`;
      }

      const data = await api.get(url);
      pedidos.value = (data || []).map((pedido: Pedido) => normalizePedido(pedido));
    } catch (err: any) {
      unavailable.value = isUnavailableError(err);
      error.value = getErrorMessage(err, 'No fue posible cargar pedidos del area');
      throw err;
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
    error.value = null;
    try {
      const payload: any = { estadoPedido: estadoNuevo };
      if (nota) {
        payload.notaEmpleado = nota;
      }

      const data = normalizePedido(await api.patch(`/servicios/pedidos/${idPedido}/estado`, payload));

      // Actualizar en la lista local
      const index = pedidos.value.findIndex((p) => p.id === idPedido);
      if (index > -1) {
        pedidos.value[index] = data;
      }

      return data;
    } catch (err: any) {
      error.value = getErrorMessage(err, 'No fue posible actualizar el estado del pedido');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const obtenerPedido = async (idPedido: number): Promise<Pedido> => {
    error.value = null;
    try {
      return normalizePedido(await api.get(`/servicios/pedidos/${idPedido}`));
    } catch (err: any) {
      error.value = getErrorMessage(err, 'No fue posible consultar el pedido');
      throw err;
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
    error,
    unavailable,
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
