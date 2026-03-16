export interface DetalleFactura {
  id: number
  tipoConcepto: 'habitacion' | 'servicio' | 'descuento' | string
  descripcion: string
  cantidad: number
  precioUnitario: number
  subtotal: number
  descuento: number
  total: number
}

export interface Factura {
  id: number
  numeroFactura: string
  uuid: string
  idReserva: number
  nombreCliente: string
  cedulaCliente: string
  emailCliente: string
  idHotel: number
  subtotal: number
  porcentajeIva: number
  montoIva: number
  total: number
  estado: string
  fechaEmision: string
  jsonData: string
  xmlData: string
  detalles: DetalleFactura[]
  createdAt: string
}

export interface CheckoutResponse {
  reserva: any
  factura: Factura
}
