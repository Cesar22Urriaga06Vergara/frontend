export interface Servicio {
  id: number;
  idHotel: number;
  nombre: string;
  descripcion?: string;
  categoria: 'cafeteria' | 'lavanderia' | 'spa' | 'room_service' | 'minibar' | 'otros';
  precioUnitario: number;
  unidadMedida: string;
  imagenUrl?: string;
  activo: boolean;
  disponibleDelivery: boolean;
  disponibleRecogida: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PedidoItem {
  id: number;
  idServicio: number;
  cantidad: number;
  precioUnitarioSnapshot: number;
  subtotal: number;
  nombreServicioSnapshot: string;
  observacion?: string;
  servicio?: Servicio;
  createdAt?: string;
}

export interface Pedido {
  id: number;
  idReserva: number;
  idCliente: number;
  idHotel: number;
  tipoEntrega: 'delivery' | 'recogida';
  estadoPedido: 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';
  categoria: string;
  notaCliente?: string;
  notaEmpleado?: string;
  idEmpleadoAtiende?: number;
  totalPedido: number;
  fechaPedido: string;
  fechaActualizacion: string;
  items: PedidoItem[];
}

export interface CuentaReserva {
  reserva: {
    id: number;
    codigoConfirmacion: string;
    checkin: string | Date;
    checkout: string | Date;
    noches: number;
    habitacion: string;
  };
  subtotalHabitacion: number;
  noches: number;
  precioNoche: number;
  pedidos: Pedido[];
  subtotalServicios: number;
  totalGeneral: number;
  resumenPorCategoria: Record<string, number>;
}

export interface ItemCarrito {
  servicio: Servicio;
  cantidad: number;
  observacion?: string;
}

export interface CreatePedidoPayload {
  idReserva: number;
  tipoEntrega: 'delivery' | 'recogida';
  items: Array<{
    idServicio: number;
    cantidad: number;
    observacion?: string;
  }>;
  notaCliente?: string;
}
