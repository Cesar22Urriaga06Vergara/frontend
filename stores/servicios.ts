import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Servicio, CuentaReserva, Pedido, CreatePedidoPayload, ItemCarrito } from '~/types/servicios';
import { useApi } from '~/composables/useApi';

export const useServiciosStore = defineStore('servicios', () => {
  const api = useApi();

  // State
  const catalogo = ref<Record<string, Servicio[]>>({});
  const pedidosActivos = ref<Pedido[]>([]);
  const cuentaActual = ref<CuentaReserva | null>(null);
  const loading = ref(false);
  const carrito = ref<ItemCarrito[]>([]);
  const tipoEntregaSeleccionado = ref<'delivery' | 'recogida'>('delivery');
  const notaPedido = ref('');

  // Computed
  const totalCarrito = computed(() => {
    return carrito.value.reduce((sum, item) => {
      return sum + item.servicio.precioUnitario * item.cantidad;
    }, 0);
  });

  const serviciosFlatten = computed(() => {
    return Object.values(catalogo.value).flat();
  });

  const categoriaDelCarrito = computed(() => {
    if (carrito.value.length === 0) return null;
    return carrito.value[0].servicio.categoria;
  });

  // Actions
  const cargarCatalogo = async (idHotel: number) => {
    loading.value = true;
    try {
      const data = await api.get(`/servicios/catalogo-agrupado/${idHotel}`);
      catalogo.value = data;
    } catch (error) {
      console.error('Error cargando catálogo:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const cargarMisPedidos = async (idReserva: number) => {
    loading.value = true;
    try {
      const data = await api.get(`/servicios/pedidos/mis-pedidos/${idReserva}`);
      pedidosActivos.value = data;
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const cargarCuenta = async (idReserva: number) => {
    loading.value = true;
    try {
      const data = await api.get(`/servicios/cuenta/${idReserva}`);
      cuentaActual.value = data;
    } catch (error) {
      console.error('Error cargando cuenta:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const crearPedido = async (payload: CreatePedidoPayload): Promise<Pedido> => {
    loading.value = true;
    try {
      const data = await api.post('/servicios/pedidos', payload);
      return data;
    } catch (error) {
      console.error('Error creando pedido:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const cancelarPedido = async (idPedido: number) => {
    loading.value = true;
    try {
      const data = await api.request(`/servicios/pedidos/${idPedido}/cancelar`, { method: 'DELETE' });
      // Actualizar el pedido en la lista local
      const index = pedidosActivos.value.findIndex((p) => p.id === idPedido);
      if (index > -1) {
        pedidosActivos.value[index] = data;
      }
      return data;
    } catch (error) {
      console.error('Error cancelando pedido:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Métodos del carrito
  const agregarAlCarrito = (servicio: Servicio, cantidad: number = 1, observacion?: string) => {
    // Validar que no se mezclen categorías
    if (categoriaDelCarrito.value && categoriaDelCarrito.value !== servicio.categoria) {
      throw new Error(`No puedes mezclar servicios de diferentes categorías. Ya tienes items de ${categoriaDelCarrito.value}`);
    }

    const itemExistente = carrito.value.find((item) => item.servicio.id === servicio.id);
    if (itemExistente) {
      itemExistente.cantidad += cantidad;
      if (observacion) {
        itemExistente.observacion = observacion;
      }
    } else {
      carrito.value.push({ servicio, cantidad, observacion });
    }
  };

  const eliminarDelCarrito = (idServicio: number) => {
    const index = carrito.value.findIndex((item) => item.servicio.id === idServicio);
    if (index > -1) {
      carrito.value.splice(index, 1);
    }
  };

  const actualizarCantidad = (idServicio: number, cantidad: number) => {
    const item = carrito.value.find((i) => i.servicio.id === idServicio);
    if (item) {
      if (cantidad <= 0) {
        eliminarDelCarrito(idServicio);
      } else {
        item.cantidad = cantidad;
      }
    }
  };

  const limpiarCarrito = () => {
    carrito.value = [];
    tipoEntregaSeleccionado.value = 'delivery';
    notaPedido.value = '';
  };

  return {
    // State
    catalogo,
    pedidosActivos,
    cuentaActual,
    loading,
    carrito,
    tipoEntregaSeleccionado,
    notaPedido,

    // Computed
    totalCarrito,
    serviciosFlatten,
    categoriaDelCarrito,

    // Actions
    cargarCatalogo,
    cargarMisPedidos,
    cargarCuenta,
    crearPedido,
    cancelarPedido,
    agregarAlCarrito,
    eliminarDelCarrito,
    actualizarCantidad,
    limpiarCarrito,
  };
});
