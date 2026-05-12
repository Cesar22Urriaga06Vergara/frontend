<template>
  <div>
    <PageHeader
      title="Caja / Folios"
      subtitle="Gestión de cargos, cobros y control diario de folios"
    >
      <template #actions>
        <v-btn prepend-icon="mdi-history" variant="tonal" @click="showHistorial = true">
          Ver historial
        </v-btn>
        <v-btn prepend-icon="mdi-refresh" variant="tonal" @click="recargar" :loading="loading">
          Recargar
        </v-btn>
      </template>
    </PageHeader>

    <!-- Stats bar -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Folios abiertos"
          :value="statsStore.foliosDelDia.filter(f => f.estado === 'ABIERTO').length"
          icon="mdi-folder-open"
          color="info"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Folios cerrados" :value="foliosStore.foliosCerrados" icon="mdi-folder-check" color="warning" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Folios pagados" :value="foliosStore.foliosPagados" icon="mdi-cash-check" color="success" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Total cobrado"
          :value="`$${foliosStore.totalIngresos.toLocaleString('es-CO')}`"
          icon="mdi-currency-usd"
          color="primary"
        />
      </v-col>
    </v-row>

    <SectionCard class="mb-6" title="Turno de caja" subtitle="Apertura, movimientos y arqueo del efectivo operativo">
      <v-alert
        v-if="!turnoActual && !loadingCaja"
        type="warning"
        variant="tonal"
        class="mb-4"
      >
        No hay una caja abierta. Debes abrir turno antes de registrar cobros o movimientos.
      </v-alert>

      <v-row v-if="turnoActual" class="mb-2">
        <v-col cols="12" sm="6" md="3">
          <StatCard label="Base inicial" :value="formatMoney(turnoActual.montoInicial)" icon="mdi-safe" color="info" />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatCard label="Ingresos caja" :value="formatMoney(turnoActual.totalIngresos)" icon="mdi-arrow-down-bold-circle" color="success" />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatCard label="Egresos caja" :value="formatMoney(turnoActual.totalEgresos)" icon="mdi-arrow-up-bold-circle" color="error" />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <StatCard label="Esperado" :value="formatMoney(turnoActual.totalEsperado)" icon="mdi-calculator" color="primary" />
        </v-col>
      </v-row>

      <div class="d-flex flex-wrap ga-2 align-center">
        <v-chip
          v-if="turnoActual"
          color="success"
          variant="tonal"
          prepend-icon="mdi-cash-register"
        >
          Caja abierta desde {{ formatDateTime(turnoActual.fechaApertura) }}
        </v-chip>

        <v-btn
          v-if="!turnoActual"
          color="primary"
          prepend-icon="mdi-cash-register"
          :loading="loadingCaja"
          @click="abrirDialog = true"
        >
          Abrir caja
        </v-btn>
        <v-btn
          v-if="turnoActual"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-plus"
          :loading="loadingCaja"
          @click="movimientoDialog = true"
        >
          Movimiento
        </v-btn>
        <v-btn
          v-if="turnoActual"
          color="warning"
          variant="tonal"
          prepend-icon="mdi-lock-check"
          :loading="loadingCaja"
          @click="cerrarDialog = true"
        >
          Cerrar caja
        </v-btn>
      </div>

      <v-table v-if="turnoActual?.movimientos?.length" density="compact" class="mt-4">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Tipo</th>
            <th>Origen</th>
            <th>Concepto</th>
            <th class="text-right">Monto</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movimiento in turnoActual.movimientos.slice(0, 6)" :key="movimiento.id">
            <td>{{ formatDateTime(movimiento.fechaMovimiento) }}</td>
            <td>
              <v-chip size="small" :color="movimiento.tipo === 'INGRESO' ? 'success' : 'error'" variant="tonal">
                {{ movimiento.tipo === 'INGRESO' ? 'Ingreso' : 'Egreso' }}
              </v-chip>
            </td>
            <td>{{ movimiento.origen }}</td>
            <td>{{ movimiento.concepto }}</td>
            <td class="text-right font-weight-bold">{{ formatMoney(movimiento.monto) }}</td>
          </tr>
        </tbody>
      </v-table>
    </SectionCard>

    <SectionCard class="mb-6" title="Panel principal" subtitle="Operación de cargos y cobros en habitaciones">
      <CajaPanel />
    </SectionCard>

    <StandardDataTable
      title="Historial del día"
      subtitle="Folios procesados en caja"
      :headers="historialHeaders"
      :items="foliosStore.historialDelDia"
      :items-per-page="8"
      empty-title="Sin folios registrados"
      empty-description="Cuando existan movimientos aparecerán en este listado."
    >
      <template #item.numeroHabitacion="{ item }">
        #{{ item.numeroHabitacion }}
      </template>
      <template #item.estado="{ item }">
        <v-chip size="small" :color="estadoColor(item.estado)">
          {{ estadoLabel(item.estado) }}
        </v-chip>
      </template>
      <template #item.total="{ item }">
        <span class="font-weight-bold">${{ item.total.toLocaleString('es-CO') }}</span>
      </template>
      <template #item.actions="{ item }">
        <v-btn
          v-if="item.idFactura"
          icon="mdi-printer-pos"
          size="small"
          variant="text"
          color="primary"
          @click="abrirTicketPosDesdeFolio(item)"
        >
          <v-tooltip activator="parent">Abrir POS</v-tooltip>
        </v-btn>
        <span v-else class="text-medium-emphasis">-</span>
      </template>
    </StandardDataTable>

    <v-dialog v-model="ticketDialog" max-width="520">
      <v-card>
        <v-card-title class="d-flex align-center ga-2 no-print">
          <v-icon icon="mdi-printer-pos" />
          Factura POS
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" @click="ticketDialog = false" />
        </v-card-title>
        <v-card-text class="pa-4">
          <v-skeleton-loader v-if="loadingTicket" type="article" />
          <FacturaPosTicketPreview
            v-else-if="ticketPos"
            :ticket="ticketPos"
            :formato="formatoTicketPos"
            :downloading-pdf="loadingTicket"
            @update:formato="cambiarFormatoTicket"
            @download-pdf="descargarTicketPdf"
          />
          <v-alert v-else type="info" variant="tonal">
            No se pudo generar la vista POS de esta factura.
          </v-alert>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog historial -->
    <v-dialog v-model="showHistorial" max-width="900px">
      <v-card title="Historial de folios del día">
        <v-card-text>
          <v-table>
            <thead>
              <tr>
                <th>Habitación</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th class="text-right">Total</th>
                <th class="text-right">Cobrado</th>
                <th>Método pago</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="folio in foliosStore.historialDelDia" :key="folio.id">
                <td>#{{ folio.numeroHabitacion }}</td>
                <td>{{ folio.nombreCliente || '-' }}</td>
                <td>
                  <v-chip size="small" :color="estadoColor(folio.estado)">
                    {{ estadoLabel(folio.estado) }}
                  </v-chip>
                </td>
                <td class="text-right font-weight-bold">${{ folio.total.toLocaleString('es-CO') }}</td>
                <td class="text-right">
                  <span v-if="folio.montoRecibido" class="text-success font-weight-bold">
                    ${{ folio.montoRecibido.toLocaleString('es-CO') }}
                  </span>
                  <span v-else class="text-medium-emphasis">-</span>
                </td>
                <td>
                  <v-chip v-if="folio.medioPago" size="small" variant="outlined">
                    {{ folio.medioPago }}
                  </v-chip>
                  <span v-else class="text-medium-emphasis">-</span>
                </td>
                <td class="text-right">
                  <v-btn
                    v-if="folio.idFactura"
                    icon="mdi-printer-pos"
                    size="small"
                    variant="text"
                    color="primary"
                    @click="abrirTicketPosDesdeFolio(folio)"
                  >
                    <v-tooltip activator="parent">Abrir POS</v-tooltip>
                  </v-btn>
                  <span v-else class="text-medium-emphasis">-</span>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="abrirDialog" max-width="420">
      <v-card title="Abrir caja">
        <v-card-text>
          <v-text-field
            v-model.number="aperturaForm.montoInicial"
            type="number"
            label="Base inicial"
            prefix="$"
            variant="outlined"
            density="compact"
          />
          <v-textarea
            v-model="aperturaForm.observaciones"
            label="Observaciones"
            variant="outlined"
            density="compact"
            rows="2"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="abrirDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="loadingCaja" @click="abrirCaja">Abrir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="movimientoDialog" max-width="520">
      <v-card title="Registrar movimiento">
        <v-card-text>
          <v-select
            v-model="movimientoForm.tipo"
            :items="tipoMovimientoItems"
            label="Tipo"
            variant="outlined"
            density="compact"
          />
          <v-text-field
            v-model.number="movimientoForm.monto"
            type="number"
            label="Monto"
            prefix="$"
            variant="outlined"
            density="compact"
          />
          <v-text-field
            v-model="movimientoForm.concepto"
            label="Concepto"
            variant="outlined"
            density="compact"
          />
          <v-text-field
            v-model="movimientoForm.referencia"
            label="Referencia"
            variant="outlined"
            density="compact"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="movimientoDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="loadingCaja" @click="registrarMovimiento">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="cerrarDialog" max-width="460">
      <v-card title="Cerrar caja">
        <v-card-text>
          <v-alert v-if="turnoActual" type="info" variant="tonal" class="mb-4">
            Total esperado: <strong>{{ formatMoney(turnoActual.totalEsperado) }}</strong>
          </v-alert>
          <v-text-field
            v-model.number="cierreForm.montoContado"
            type="number"
            label="Monto contado"
            prefix="$"
            variant="outlined"
            density="compact"
          />
          <v-alert v-if="turnoActual" :type="diferenciaCierre === 0 ? 'success' : 'warning'" variant="tonal" class="mb-4">
            Diferencia: <strong>{{ formatMoney(diferenciaCierre) }}</strong>
          </v-alert>
          <v-textarea
            v-model="cierreForm.observaciones"
            label="Observaciones"
            variant="outlined"
            density="compact"
            rows="2"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cerrarDialog = false">Cancelar</v-btn>
          <v-btn color="warning" :loading="loadingCaja" @click="cerrarCaja">Cerrar caja</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFolios } from '~/composables/useFolios'
import { useFoliosStore } from '~/stores/folios'
import { usePermissions } from '~/composables/usePermissions'
import { useCaja } from '~/composables/useCaja'
import { useFacturas } from '~/composables/useFacturas'
import { useNotification } from '~/composables/useNotification'
import type { CajaMovimientoTipo } from '~/types/caja'
import type { FacturaPosTicket, FormatoTicketPos } from '~/types/factura'
import type { Folio } from '~/types/folio'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import CajaPanel from '~/components/recepcionista/Caja/CajaPanel.vue'
import FacturaPosTicketPreview from '~/components/facturas/FacturaPosTicket.vue'

const { can } = usePermissions()
const { error } = useNotification()
const folios = useFolios()
const foliosStore = useFoliosStore()
const caja = useCaja()
const { obtenerTicketPos, descargarTicketPosPdf, loadingTicket } = useFacturas()
const turnoActual = caja.turnoActual
const loadingCaja = caja.loadingCaja

// Local state
const showHistorial = ref(false)
const loading = ref(false)
const abrirDialog = ref(false)
const movimientoDialog = ref(false)
const cerrarDialog = ref(false)
const ticketDialog = ref(false)
const ticketPos = ref<FacturaPosTicket | null>(null)
const facturaTicketId = ref<number | null>(null)
const formatoTicketPos = ref<FormatoTicketPos>('80mm')
const aperturaForm = ref({ montoInicial: 0, observaciones: '' })
const movimientoForm = ref<{
  tipo: CajaMovimientoTipo
  monto: number
  concepto: string
  referencia: string
}>({
  tipo: 'INGRESO',
  monto: 0,
  concepto: '',
  referencia: ''
})
const cierreForm = ref({ montoContado: 0, observaciones: '' })
const tipoMovimientoItems = [
  { title: 'Ingreso', value: 'INGRESO' },
  { title: 'Egreso', value: 'EGRESO' },
]

// Guards
import { UserRole } from '~/types/auth'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.RECEPCIONISTA, UserRole.CAJERO, UserRole.ADMIN, UserRole.SUPERADMIN],
  layout: 'recepcion'
})

const historialHeaders = [
  { title: 'Habitación', key: 'numeroHabitacion' },
  { title: 'Cliente', key: 'nombreCliente' },
  { title: 'Estado', key: 'estado' },
  { title: 'Total', key: 'total' },
  { title: 'Medio Pago', key: 'medioPago' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]

// Stats (mock - en real vendría de un composable)
const statsStore = computed(() => ({
  foliosDelDia: foliosStore.historialDelDia
}))

const recargar = async () => {
  loading.value = true
  try {
    const [historial] = await Promise.all([
      folios.obtenerHistorial(),
      caja.obtenerTurnoActual(),
    ])
    foliosStore.setHistorialDelDia(historial)
  } finally {
    loading.value = false
  }
}

const formatMoney = (value: number | null | undefined) =>
  `$${Number(value || 0).toLocaleString('es-CO')}`

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '-'

const diferenciaCierre = computed(() =>
  Number(cierreForm.value.montoContado || 0) - Number(turnoActual.value?.totalEsperado || 0)
)

const abrirCaja = async () => {
  await caja.abrirTurno(aperturaForm.value)
  abrirDialog.value = false
  aperturaForm.value = { montoInicial: 0, observaciones: '' }
}

const registrarMovimiento = async () => {
  await caja.registrarMovimiento({
    tipo: movimientoForm.value.tipo,
    monto: movimientoForm.value.monto,
    concepto: movimientoForm.value.concepto,
    referencia: movimientoForm.value.referencia || undefined,
  })
  movimientoDialog.value = false
  movimientoForm.value = { tipo: 'INGRESO', monto: 0, concepto: '', referencia: '' }
}

const cerrarCaja = async () => {
  if (!turnoActual.value) return
  await caja.cerrarTurno(turnoActual.value.id, cierreForm.value)
  cerrarDialog.value = false
}

const cargarTicketPosHistorial = async () => {
  if (!facturaTicketId.value) return
  ticketPos.value = await obtenerTicketPos(facturaTicketId.value, formatoTicketPos.value)
}

const abrirTicketPosDesdeFolio = async (folio: Folio) => {
  if (!folio.idFactura) {
    error('Este folio no tiene factura asociada para imprimir')
    return
  }

  facturaTicketId.value = folio.idFactura
  ticketPos.value = null
  ticketDialog.value = true

  try {
    await cargarTicketPosHistorial()
  } catch (err: any) {
    ticketPos.value = null
    error(err?.message || 'Error al abrir el ticket POS')
  }
}

const cambiarFormatoTicket = async (formato: FormatoTicketPos) => {
  formatoTicketPos.value = formato

  try {
    await cargarTicketPosHistorial()
  } catch (err: any) {
    ticketPos.value = null
    error(err?.message || 'Error al cambiar formato POS')
  }
}

const descargarTicketPdf = async () => {
  if (!facturaTicketId.value) {
    error('No hay factura seleccionada')
    return
  }

  try {
    await descargarTicketPosPdf(
      facturaTicketId.value,
      formatoTicketPos.value,
      'Descarga/reimpresion ticket POS desde historial de caja',
    )
  } catch (err: any) {
    error(err?.message || 'Error al descargar el ticket POS')
  }
}

const estadoColor = (estado: string) => {
  switch (estado) {
    case 'ABIERTO':
      return 'info'
    case 'CERRADO':
      return 'warning'
    case 'PAGADO':
      return 'success'
    case 'CANCELADO':
      return 'error'
    default:
      return 'default'
  }
}

const estadoLabel = (estado: string) => {
  switch (estado) {
    case 'ABIERTO':
      return 'Abierto'
    case 'CERRADO':
      return 'Cerrado'
    case 'PAGADO':
      return 'Pagado'
    case 'CANCELADO':
      return 'Cancelado'
    default:
      return estado
  }
}

onMounted(async () => {
  await recargar()
})

// Permiso check
if (!can('caja:ver')) {
  throw createError({
    statusCode: 403,
    statusMessage: 'No tienes acceso a esta página'
  })
}
</script>

