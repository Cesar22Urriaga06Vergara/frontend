<template>
  <div class="ticket-preview">
    <div class="ticket-toolbar no-print">
      <v-btn-toggle
        :model-value="formato"
        density="compact"
        mandatory
        divided
        @update:model-value="emit('update:formato', $event as FormatoTicketPos)"
      >
        <v-btn value="58mm" size="small">58 mm</v-btn>
        <v-btn value="80mm" size="small">80 mm</v-btn>
      </v-btn-toggle>
      <v-spacer />
      <v-btn size="small" variant="tonal" prepend-icon="mdi-printer" @click="imprimir">
        Imprimir
      </v-btn>
      <v-btn
        size="small"
        variant="tonal"
        prepend-icon="mdi-file-pdf-box"
        :loading="downloadingPdf"
        @click="emit('download-pdf')"
      >
        Descargar PDF
      </v-btn>
    </div>

    <section
      class="ticket-pos"
      :class="`ticket-pos--${ticket.formato}`"
      :style="{ '--ticket-width': `${ticket.widthMm}mm` }"
    >
      <header class="ticket-center ticket-header">
        <img v-if="ticket.hotel.logoUrl" :src="ticket.hotel.logoUrl" alt="" class="ticket-logo">
        <h2>{{ ticket.hotel.nombre }}</h2>
        <p v-if="ticket.hotel.nit">NIT {{ ticket.hotel.nit }}</p>
        <p v-if="ticket.hotel.direccion">{{ ticket.hotel.direccion }}</p>
        <p v-if="ticket.hotel.ciudad">{{ ticket.hotel.ciudad }}</p>
        <p v-if="ticket.hotel.telefono">Tel. {{ ticket.hotel.telefono }}</p>
        <p v-if="ticket.hotel.resolucionDian" class="ticket-small">{{ ticket.hotel.resolucionDian }}</p>
      </header>

      <div class="ticket-separator" />

      <div class="ticket-meta">
        <div><span>Factura</span><strong>{{ ticket.factura.numeroFactura }}</strong></div>
        <div><span>Fecha</span><strong>{{ formatDateTime(ticket.factura.fechaEmision || ticket.factura.fechaCreacion) }}</strong></div>
        <div v-if="ticket.recepcionista?.nombre"><span>Recibe</span><strong>{{ ticket.recepcionista.nombre }}</strong></div>
        <div><span>Habitacion</span><strong>{{ ticket.estancia.habitacion || 'N/A' }}</strong></div>
        <div><span>Huesped</span><strong>{{ ticket.estancia.huesped }}</strong></div>
        <div v-if="ticket.estancia.documento"><span>Documento</span><strong>{{ ticket.estancia.documento }}</strong></div>
      </div>

      <div class="ticket-separator" />

      <table class="ticket-table">
        <thead>
          <tr>
            <th>Detalle</th>
            <th class="num">Cant.</th>
            <th class="num">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in ticket.detalles" :key="`${item.descripcion}-${index}`">
            <td>
              <strong>{{ item.descripcion }}</strong>
              <span>{{ formatMoney(item.precioUnitario) }} c/u</span>
            </td>
            <td class="num">{{ item.cantidad }}</td>
            <td class="num">{{ formatMoney(item.total) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="ticket-separator" />

      <div class="ticket-totals">
        <div><span>Subtotal</span><strong>{{ formatMoney(ticket.totales.subtotal) }}</strong></div>
        <div v-if="ticket.totales.descuento > 0"><span>Descuento</span><strong>-{{ formatMoney(ticket.totales.descuento) }}</strong></div>
        <div><span>IVA</span><strong>{{ formatMoney(ticket.totales.iva) }}</strong></div>
        <div v-if="ticket.totales.inc > 0"><span>INC</span><strong>{{ formatMoney(ticket.totales.inc) }}</strong></div>
        <div class="ticket-total"><span>Total</span><strong>{{ formatMoney(ticket.totales.total) }}</strong></div>
        <div><span>Pagado</span><strong>{{ formatMoney(ticket.totales.pagado) }}</strong></div>
        <div><span>Saldo</span><strong>{{ formatMoney(ticket.totales.saldo) }}</strong></div>
      </div>

      <template v-if="ticket.pagos.length">
        <div class="ticket-separator" />
        <div class="ticket-payments">
          <h3>Pagos</h3>
          <div v-for="(pago, index) in ticket.pagos" :key="index">
            <span>{{ pago.metodo }}</span>
            <strong>{{ formatMoney(pago.monto) }}</strong>
          </div>
        </div>
      </template>

      <div class="ticket-separator" />

      <footer class="ticket-center">
        <div v-if="ticket.qrData" class="ticket-qr">
          <span>QR</span>
          <small>{{ ticket.qrData }}</small>
        </div>
        <p class="ticket-small">{{ ticket.hotel.pieFactura || 'Gracias por su visita' }}</p>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { FacturaPosTicket, FormatoTicketPos } from '~/types/factura'

const props = defineProps<{
  ticket: FacturaPosTicket
  formato: FormatoTicketPos
  downloadingPdf?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:formato', value: FormatoTicketPos): void
  (event: 'download-pdf'): void
}>()

const formatMoney = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const formatDateTime = (value?: string) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

const imprimir = () => {
  window.print()
}
</script>

<style scoped>
.ticket-preview {
  display: grid;
  gap: 16px;
}

.ticket-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ticket-pos {
  width: var(--ticket-width);
  max-width: 100%;
  margin: 0 auto;
  padding: 10px;
  background: #fff;
  color: #111;
  border: 1px solid rgba(0, 0, 0, 0.14);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 11px;
  line-height: 1.35;
}

.ticket-pos--58mm {
  font-size: 10px;
}

.ticket-center {
  text-align: center;
}

.ticket-header h2 {
  margin: 0 0 4px;
  font-size: 15px;
  letter-spacing: 0;
}

.ticket-header p,
.ticket-center p {
  margin: 2px 0;
}

.ticket-logo {
  max-width: 42mm;
  max-height: 18mm;
  object-fit: contain;
  margin-bottom: 6px;
}

.ticket-separator {
  border-top: 1px dashed #222;
  margin: 8px 0;
}

.ticket-meta,
.ticket-totals,
.ticket-payments {
  display: grid;
  gap: 3px;
}

.ticket-meta div,
.ticket-totals div,
.ticket-payments div {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.ticket-meta span,
.ticket-totals span,
.ticket-payments span {
  color: #333;
}

.ticket-table {
  width: 100%;
  border-collapse: collapse;
}

.ticket-table th,
.ticket-table td {
  padding: 3px 0;
  vertical-align: top;
}

.ticket-table th {
  border-bottom: 1px solid #222;
  font-weight: 700;
}

.ticket-table td span {
  display: block;
  color: #444;
  font-size: 0.9em;
}

.num {
  text-align: right;
  white-space: nowrap;
}

.ticket-total {
  border-top: 1px solid #222;
  padding-top: 4px;
  font-size: 1.15em;
}

.ticket-payments h3 {
  margin: 0 0 2px;
  font-size: 1em;
}

.ticket-small {
  font-size: 0.88em;
}

.ticket-qr {
  display: grid;
  place-items: center;
  gap: 4px;
  width: 34mm;
  min-height: 22mm;
  margin: 0 auto 8px;
  padding: 6px;
  border: 1px solid #222;
  word-break: break-all;
}

.ticket-qr span {
  font-weight: 700;
}

@media print {
  body * {
    visibility: hidden;
  }

  .ticket-pos,
  .ticket-pos * {
    visibility: visible;
  }

  .ticket-pos {
    position: absolute;
    left: 0;
    top: 0;
    margin: 0;
    max-width: none;
    border: 0;
  }

  .no-print {
    display: none !important;
  }
}
</style>
