import { UserRole } from '~/types/auth'
import type { AreaPedidosConfig } from '~/types/servicios'

export const AREA_PANEL_CONFIGS: Record<string, AreaPedidosConfig> = {
  cafeteria: {
    categoria: 'cafeteria',
    titulo: 'Panel Cafetería',
    subtitulo: 'Resumen operativo del área y pedidos del día',
    iconoArea: 'mdi-coffee',
    colorArea: 'orange',
    labelMedio: 'En preparación',
    iconoMedio: 'mdi-coffee-maker',
    estadoMedio: 'en_preparacion',
    estadoCompletado: 'entregado',
    labelCompleto: 'Entregados hoy',
    iconoVacio: 'mdi-coffee-off',
    mensajeVacio: 'Sin pedidos activos en este momento',
    etiquetaItem: 'pedido',
    etiquetaItems: 'pedidos',
  },
  lavanderia: {
    categoria: 'lavanderia',
    titulo: 'Panel Lavandería',
    subtitulo: 'Resumen operativo del área y lotes del día',
    iconoArea: 'mdi-washing-machine',
    colorArea: 'indigo',
    labelMedio: 'En proceso',
    iconoMedio: 'mdi-progress-clock',
    estadoMedio: 'en_preparacion',
    estadoCompletado: 'entregado',
    labelCompleto: 'Lotes cerrados',
    iconoVacio: 'mdi-washing-machine-alert',
    mensajeVacio: 'Sin lotes activos en este momento',
    etiquetaItem: 'lote',
    etiquetaItems: 'lotes',
  },
  spa: {
    categoria: 'spa',
    titulo: 'Panel Spa',
    subtitulo: 'Resumen operativo del área y servicios del día',
    iconoArea: 'mdi-spa',
    colorArea: 'pink',
    labelMedio: 'En curso',
    iconoMedio: 'mdi-progress-clock',
    estadoMedio: 'en_preparacion',
    estadoCompletado: 'entregado',
    labelCompleto: 'Servicios cerrados',
    iconoVacio: 'mdi-calendar-blank',
    mensajeVacio: 'Sin servicios activos en este momento',
    etiquetaItem: 'servicio',
    etiquetaItems: 'servicios',
  },
  room_service: {
    categoria: 'room_service',
    titulo: 'Panel Room Service',
    subtitulo: 'Resumen operativo del área y entregas del día',
    iconoArea: 'mdi-bell-service-outline',
    colorArea: 'teal',
    labelMedio: 'En ruta',
    iconoMedio: 'mdi-route',
    estadoMedio: 'en_preparacion',
    estadoCompletado: 'entregado',
    labelCompleto: 'Entregas cerradas',
    iconoVacio: 'mdi-bell-off',
    mensajeVacio: 'Sin entregas activas en este momento',
    etiquetaItem: 'entrega',
    etiquetaItems: 'entregas',
  },
}

export const getAreaConfigByRole = (role: UserRole | null | undefined): AreaPedidosConfig => {
  if (!role) {
    return AREA_PANEL_CONFIGS.cafeteria
  }

  if (role in AREA_PANEL_CONFIGS) {
    return AREA_PANEL_CONFIGS[role]
  }

  return AREA_PANEL_CONFIGS.cafeteria
}

export const getAreaConfigByCategoria = (categoria: keyof typeof AREA_PANEL_CONFIGS): AreaPedidosConfig => {
  return AREA_PANEL_CONFIGS[categoria] || AREA_PANEL_CONFIGS.cafeteria
}
