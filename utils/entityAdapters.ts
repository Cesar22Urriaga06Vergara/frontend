import type { User } from '~/types/auth'
import type { Reserva } from '~/types/api'
import type { Factura, EstadoFactura, PagoFactura } from '~/types/factura'
import type { Pedido } from '~/types/servicios'

const FACTURA_STATUS_MAP: Record<string, EstadoFactura> = {
  pendiente: 'BORRADOR',
  borrador: 'BORRADOR',
  editable: 'EDITABLE',
  emitida: 'EMITIDA',
  pagada: 'PAGADA',
  anulada: 'ANULADA',
}

export const normalizeUser = (raw: User): User => {
  const candidateId = (raw as any).id ?? (raw as any)._id
  const numericId = Number(candidateId)

  return {
    ...raw,
    id: Number.isFinite(numericId) && numericId > 0 ? numericId : 0,
    _id: String(candidateId ?? ''),
    name: raw.name || raw.fullName,
  }
}

export const normalizeReserva = (reserva: Reserva): Reserva => {
  return {
    ...reserva,
    estadoReserva: String(reserva.estadoReserva || '').toLowerCase(),
    checkinPrevisto: reserva.checkinPrevisto,
    checkoutPrevisto: reserva.checkoutPrevisto,
  }
}

export const getFacturaEstadoCanonico = (factura: Partial<Factura> | null): EstadoFactura => {
  const estadoFactura = factura?.estadoFactura
  if (estadoFactura) return estadoFactura

  const legacy = String(factura?.estado || '').trim().toLowerCase()
  return FACTURA_STATUS_MAP[legacy] || 'BORRADOR'
}

export const normalizeFactura = (factura: Factura): Factura => {
  const pagos = (factura.pagos || []).map((pago) => normalizePagoFactura(pago))
  return {
    ...factura,
    estadoFactura: getFacturaEstadoCanonico(factura),
    pagos,
  }
}

export const normalizePedido = (pedido: Pedido): Pedido => {
  return {
    ...pedido,
    estadoPedido: pedido.estadoPedido,
    totalPedido: Number(pedido.totalPedido || 0),
  }
}

const normalizePagoFactura = (pago: PagoFactura): PagoFactura => {
  return {
    ...pago,
    metodoPago: pago.metodoPago || 'No especificado',
  }
}
