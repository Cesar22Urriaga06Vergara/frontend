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

/**
 * DTO para vista operacional en área (SIN datos financieros)
 * Usado en: GET /servicios/pedidos/area/:idHotel/:categoria
 */
export interface PedidoAreaResponse {
  id: number;
  idReserva: number;
  tipoEntrega: 'delivery' | 'recogida';
  estadoPedido: 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';
  categoria: string;
  notaCliente?: string;
  notaEmpleado?: string;
  fechaPedido: string | Date;
  items: {
    id: number;
    idServicio: number;
    nombreServicioSnapshot: string;
    cantidad: number;
    observacion?: string;
  }[];
  // ❌ NO incluye: totalPedido, idCliente, precios
}

/**
 * Item para reporte (CON datos financieros)
 */
export interface PedidoReporteItem {
  id: number;
  idServicio: number;
  nombreServicioSnapshot: string;
  cantidad: number;
  precioUnitarioSnapshot: number;
  subtotal: number;
  observacion?: string;
}

/**
 * DTO para vista de reporte financiero (CON datos auditados)
 * Usado en: GET /servicios/reportes/area/:idHotel/:categoria
 */
export interface PedidoAreaReporte {
  id: number;
  idReserva: number;
  tipoEntrega: 'delivery' | 'recogida';
  estadoPedido: 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';
  categoria: string;
  notaCliente?: string;
  notaEmpleado?: string;
  fechaPedido: string | Date;
  totalPedido: number; // ✅ Incluido en reportes
  items: PedidoReporteItem[]; // ✅ Con precios
}

/**
 * Resumen agregado de reportes de área
 */
export interface AreaReportsResumen {
  categoria: string;
  periodo: {
    desde: string | Date;
    hasta: string | Date;
  };
  contadores: {
    total: number;
    pendiente: number;
    en_preparacion: number;
    listo: number;
    entregado: number;
    cancelado: number;
  };
  financiero: {
    ingresoTotal: number;
    ingresoPendiente: number;
    ingresoEntregado: number;
    promedioPorPedido: number;
    ticketPromedio: number;
  };
  topProductos: Array<{
    idServicio: number;
    nombre: string;
    cantidadVendida: number;
    ingresoGenerado: number;
  }>;
  estadisticasEntrega: {
    delivery: { cantidad: number; ingresos: number };
    recogida: { cantidad: number; ingresos: number };
  };
  consultadoEn: string | Date;
  consultadoPor: {
    idEmpleado?: number;
    rol: string;
  };
}

/**
 * Respuesta del endpoint de reportes
 */
export interface AreaReportResponse {
  detalle: PedidoAreaReporte[];
  resumen: AreaReportsResumen;
}

/**
 * ────────────────────────────────────────────────────────────────
 * TIPOS PARA REPORTES CONSOLIDADOS (ADMIN)
 * ────────────────────────────────────────────────────────────────
 */

export interface HotelKpis {
  totalPedidos: number;
  totalIngresos: number;
  ingresoEntregado: number;
  ingresoPendiente: number;
  ticketPromedio: number;
  pedidosPorDia: number;
  tasaEntregaGlobal: number;
  areaConMasIngresos: {
    categoria: string;
    ingresos: number;
  };
  pedidosHoy: number;
  ingresosHoy: number;
  periodo: {
    desde: string | Date;
    hasta: string | Date;
  };
}

export interface AreaResumen {
  categoria: string;
  totalPedidos: number;
  ingresoTotal: number;
  ingresoEntregado: number;
  ingresoPendiente: number;
  ticketPromedio: number;
  tasaEntrega: number;
  tipoPrefijo: 'delivery' | 'recogida';
  contadores: {
    pendiente: number;
    en_preparacion: number;
    listo: number;
    entregado: number;
    cancelado: number;
  };
}

export interface TopArea {
  ranking: number;
  categoria: string;
  ingresos: number;
  pedidos: number;
  ticketPromedio: number;
  porcentajeDelTotal: number;
}

/**
 * Configuración de un área facturable por pedido.
 * Se pasa como prop a AreaPedidosPanel para que el mismo componente
 * sirva a cafetería, lavandería, room service, spa, etc.
 */
export interface AreaPedidosConfig {
  /** Slug que coincide con el campo `categoria` del backend */
  categoria: Servicio['categoria'];
  /** Título visible en el encabezado del panel */
  titulo: string;
  /** Subtítulo descriptivo bajo el título */
  subtitulo: string;
  /** Icono MDI para la tarjeta "Total del día" */
  iconoArea: string;
  /** Color Vuetify principal del área (p.ej. 'orange', 'indigo') */
  colorArea: string;
  /** Etiqueta de la tarjeta de estado intermedio ("En preparación", "En proceso", "En ruta"…) */
  labelMedio: string;
  /** Icono MDI para la tarjeta de estado intermedio */
  iconoMedio: string;
  /** Estado de la máquina de estados que representa "en progreso" */
  estadoMedio: Pedido['estadoPedido'];
  /** Estado que se cuenta como completado para este área */
  estadoCompletado: Pedido['estadoPedido'];
  /** Etiqueta de la tarjeta de completados ("Entregados hoy", "Listos hoy"…) */
  labelCompleto: string;
  /** Icono MDI para el estado vacío de la lista */
  iconoVacio: string;
  /** Mensaje cuando no hay ítems en la lista */
  mensajeVacio: string;
  /** Término en singular para un ítem ("pedido", "lote", "entrega", "cita") */
  etiquetaItem: string;
  /** Término en plural para varios ítems */
  etiquetaItems: string;
}

export interface EstadisticasEntregaConsolidado {
  delivery: {
    cantidad: number;
    ingresos: number;
    porcentaje: number;
  };
  recogida: {
    cantidad: number;
    ingresos: number;
    porcentaje: number;
  };
}

export interface TendenciasDiarias {
  fecha: string | Date;
  pedidos: number;
  ingresos: number;
}

export interface HotelReportConsolidado {
  idHotel: number;
  kpis: HotelKpis;
  topAreas: TopArea[];
  areasDetalle: AreaResumen[];
  estadisticasEntrega: EstadisticasEntregaConsolidado;
  tendencias: TendenciasDiarias[];
  consultadoEn: string | Date;
  consultadoPor: {
    idEmpleado?: number;
    idAdmin?: number;
    rol: string;
  };
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

