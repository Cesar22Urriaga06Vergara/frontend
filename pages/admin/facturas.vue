<template>
  <div>
    <PageHeader
      title="Gestión de Facturas"
      subtitle="Control y auditoría de facturas electrónicas del hotel"
    >
      <template #status>
        <v-chip color="primary" variant="tonal" size="small">
          {{ facturasFiltradas.length }} registros
        </v-chip>
      </template>
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-refresh" :loading="loading" @click="cargarFacturas">
          Actualizar
        </v-btn>
      </template>
    </PageHeader>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Total facturas"
          :value="facturas.length"
          icon="mdi-receipt"
          color="primary"
          :loading="loading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Emitidas"
          :value="facturas.filter(f => getEstadoCanonico(f) === 'EMITIDA').length"
          icon="mdi-send"
          color="info"
          :loading="loading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Pagadas"
          :value="facturas.filter(f => getEstadoCanonico(f) === 'PAGADA').length"
          icon="mdi-check-circle"
          color="success"
          :loading="loading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Anuladas"
          :value="facturas.filter(f => getEstadoCanonico(f) === 'ANULADA').length"
          icon="mdi-close-circle"
          color="error"
          :loading="loading"
        />
      </v-col>
    </v-row>

    <SectionCard class="mb-6" title="Filtros" subtitle="Busca por estado, número o cliente">
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filtroEstado"
            :items="estadosDisponibles"
            label="Estado"
            clearable
            item-title="label"
            item-value="value"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="busquedaNumero"
            label="Número de factura"
            placeholder="FAC-2026-00001"
            clearable
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="busquedaCliente"
            label="Cliente"
            placeholder="Nombre..."
            clearable
          />
        </v-col>
        <v-col cols="12" sm="6" md="3" class="d-flex align-end">
          <v-btn color="primary" block prepend-icon="mdi-magnify" @click="aplicarFiltros">Buscar</v-btn>
        </v-col>
      </v-row>
    </SectionCard>

    <StandardDataTable
      title="Listado de facturas"
      subtitle="Detalle de todas las facturas emitidas y su estado"
      :headers="headers"
      :items="facturasFiltradas"
      :loading="loading"
      empty-icon="mdi-receipt-off"
      empty-title="No hay facturas para este filtro"
      empty-description="Ajusta los filtros para ver resultados o crea una nueva factura."
    >
      <template #item.numeroFactura="{ item }">
        <span class="font-weight-bold">{{ item.numeroFactura }}</span>
      </template>

      <template #item.total="{ item }">
        <span class="font-weight-bold text-success">${{ formatoPrecio(item.total) }}</span>
      </template>

      <template #item.estadoFactura="{ item }">
        <EstadoFacturaBadge :estado-actual="getEstadoCanonico(item)" :show-transiciones="false" />
      </template>

      <template #item.createdAt="{ item }">
        {{ formatoFecha(item.createdAt) }}
      </template>

      <template #item.actions="{ item }">
        <v-btn
          icon="mdi-eye"
          size="x-small"
          variant="text"
          color="primary"
          title="Ver detalle"
          @click="abrirDetalle(item)"
        />
        <v-btn
          icon="mdi-receipt-text-check"
          size="x-small"
          variant="text"
          color="success"
          title="Vista POS"
          :loading="cargandoTicketPos && facturaSeleccionada?.id === item.id"
          @click="abrirTicketPos(item)"
        />
        <v-menu v-if="puedeMostrarAcciones(item)">
          <template #activator="{ props }">
            <v-btn icon="mdi-dots-vertical" size="x-small" variant="text" v-bind="props" />
          </template>
          <v-list>
            <v-list-item v-if="puedeEmitir(item)" @click="emitirFactura(item.id)">
              <template #prepend>
                <v-icon icon="mdi-send" />
              </template>
              <v-list-item-title>Emitir</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="puedeAnular(item)" @click="abrirDialogoAnular(item)">
              <template #prepend>
                <v-icon icon="mdi-close" color="error" />
              </template>
              <v-list-item-title>Anular</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </StandardDataTable>

    <v-dialog v-model="showDetalle" max-width="800">
      <v-card v-if="facturaSeleccionada">
        <v-card-title>Factura {{ facturaSeleccionada.numeroFactura }}</v-card-title>
        <v-card-text class="pa-6">
          <v-divider class="mb-4" />

          <div class="mb-4">
            <h3 class="text-subtitle-1 font-weight-bold mb-2">Datos de la Factura</h3>
            <v-row>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Cliente</p>
                <p class="font-weight-bold">{{ facturaSeleccionada.nombreCliente }}</p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Cédula</p>
                <p class="font-weight-bold">{{ facturaSeleccionada.cedulaCliente }}</p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Email</p>
                <p>{{ facturaSeleccionada.emailCliente }}</p>
              </v-col>
              <v-col cols="6">
                <p class="text-caption text-medium-emphasis">Estado</p>
                <EstadoFacturaBadge
                  :estado-actual="getEstadoCanonico(facturaSeleccionada)"
                  :show-transiciones="false"
                />
              </v-col>
            </v-row>
          </div>

          <FacturaDesglose
            v-if="tieneDesgloseFactura(facturaSeleccionada)"
            :factura="facturaSeleccionada"
            class="mb-4"
          />

          <v-divider class="my-4" />

          <div class="mb-4">
            <h3 class="text-subtitle-1 font-weight-bold mb-2">Detalles</h3>
            <v-table>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th class="text-right">Cantidad</th>
                  <th class="text-right">Precio Unit.</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="detalle in facturaSeleccionada.detalles" :key="detalle.id">
                  <td>{{ detalle.descripcion }}</td>
                  <td class="text-right">{{ detalle.cantidad }}</td>
                  <td class="text-right">${{ formatoPrecio(detalle.precioUnitario) }}</td>
                  <td class="text-right font-weight-bold">${{ formatoPrecio(detalle.total) }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>

          <v-divider class="my-4" />

          <div class="mb-4">
            <v-row class="text-right">
              <v-col cols="12">
                <p class="mb-2">Subtotal: <span class="font-weight-bold">${{ formatoPrecio(facturaSeleccionada.subtotal) }}</span></p>
                <p class="mb-2">IVA ({{ facturaSeleccionada.porcentajeIva }}%): <span class="font-weight-bold">${{ formatoPrecio(facturaSeleccionada.montoIva) }}</span></p>
                <p class="text-h6 font-weight-bold">Total: ${{ formatoPrecio(facturaSeleccionada.total) }}</p>
              </v-col>
            </v-row>
          </div>

          <div v-if="facturaSeleccionada.pagos?.length">
            <h3 class="text-subtitle-1 font-weight-bold mb-2">Pagos Registrados</h3>
            <v-list>
              <v-list-item v-for="pago in facturaSeleccionada.pagos" :key="pago.id">
                <template #prepend>
                  <v-icon icon="mdi-check-circle" color="success" />
                </template>
                <v-list-item-title>{{ pago.metodoPago }} - ${{ formatoPrecio(pago.monto) }}</v-list-item-title>
                <v-list-item-subtitle>{{ formatoFecha(pago.fechaPago) }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" @click="showDetalle = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showAnular" max-width="400">
      <v-card>
        <v-card-title>Anular Factura</v-card-title>
        <v-card-text class="pa-6">
          <p class="mb-4">¿Estás seguro de que quieres anular esta factura?</p>
          <v-textarea
            v-model="motivoAnulacion"
            label="Motivo de anulación"
            placeholder="Explica por qué se anula..."
            rows="3"
            counter
            maxlength="300"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" @click="showAnular = false">Cancelar</v-btn>
          <v-btn color="error" @click="confirmarAnular" :loading="anulando">Anular Factura</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showTicketPos" max-width="520">
      <v-card>
        <v-card-title class="d-flex align-center ga-2">
          <v-icon icon="mdi-printer-pos" />
          Factura POS
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" @click="showTicketPos = false" />
        </v-card-title>
        <v-card-text class="pa-4">
          <v-skeleton-loader v-if="cargandoTicketPos" type="article" />
          <FacturaPosTicketPreview
            v-else-if="ticketPos"
            :ticket="ticketPos"
            :formato="formatoTicketPos"
            :downloading-pdf="descargandoTicketPdf"
            @update:formato="cambiarFormatoTicket"
            @download-pdf="descargarTicketPdf"
          />
          <v-alert v-else type="info" variant="tonal">
            Selecciona una factura para generar el ticket POS.
          </v-alert>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useFacturas } from '~/composables/useFacturas'
import { useNotification } from '~/composables/useNotification'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import EstadoFacturaBadge from '~/components/facturas/EstadoFacturaBadge.vue'
import FacturaDesglose from '~/components/facturas/FacturaDesglose.vue'
import FacturaPosTicketPreview from '~/components/facturas/FacturaPosTicket.vue'
import type { EstadoFactura, Factura, FacturaPosTicket, FormatoTicketPos } from '~/types/factura'
import { UserRole } from '~/types/auth'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN, UserRole.SUPERADMIN],
})

useHead({ title: 'Gestión de Facturas' })

const api = useApi()
const { success, error } = useNotification()
const { descargarTicketPosPdf, loadingTicket: descargandoTicketPdf } = useFacturas()

const facturas = ref<Factura[]>([])
const loading = ref(false)
const showDetalle = ref(false)
const showAnular = ref(false)
const showTicketPos = ref(false)
const facturaSeleccionada = ref<Factura | null>(null)
const ticketPos = ref<FacturaPosTicket | null>(null)
const formatoTicketPos = ref<FormatoTicketPos>('80mm')
const filtroEstado = ref<EstadoFactura>()
const busquedaNumero = ref('')
const busquedaCliente = ref('')
const motivoAnulacion = ref('')
const anulando = ref(false)
const cargandoTicketPos = ref(false)

const estadosDisponibles = [
  { label: 'Borrador', value: 'BORRADOR' },
  { label: 'Editable', value: 'EDITABLE' },
  { label: 'Emitida', value: 'EMITIDA' },
  { label: 'Pagada', value: 'PAGADA' },
  { label: 'Anulada', value: 'ANULADA' },
]

const headers = [
  { title: 'Número', key: 'numeroFactura' },
  { title: 'Cliente', key: 'nombreCliente' },
  { title: 'Cédula', key: 'cedulaCliente' },
  { title: 'Total', key: 'total', align: 'end' as const },
  { title: 'Estado', key: 'estadoFactura' },
  { title: 'Fecha', key: 'createdAt' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const MAPA_LEGADO_A_CANONICO: Record<string, EstadoFactura> = {
  pendiente: 'BORRADOR',
  borrador: 'BORRADOR',
  editable: 'EDITABLE',
  emitida: 'EMITIDA',
  pagada: 'PAGADA',
  anulada: 'ANULADA',
}

const facturasFiltradas = computed(() => {
  return facturas.value.filter((f) => {
    const estadoCanonico = getEstadoCanonico(f)
    let matches = true
    if (filtroEstado.value) matches = matches && estadoCanonico === filtroEstado.value
    if (busquedaNumero.value) matches = matches && f.numeroFactura.includes(busquedaNumero.value.toUpperCase())
    if (busquedaCliente.value) matches = matches && f.nombreCliente.toLowerCase().includes(busquedaCliente.value.toLowerCase())
    return matches
  })
})

const formatoPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(precio)
}

const formatoFecha = (fecha?: string) => {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-CO')
}

const getEstadoCanonico = (factura: Partial<Factura> | null): EstadoFactura => {
  const estadoFactura = factura?.estadoFactura
  if (estadoFactura) return estadoFactura

  const legacy = String(factura?.estado || '').trim().toLowerCase()
  return MAPA_LEGADO_A_CANONICO[legacy] || 'BORRADOR'
}

const puedeEmitir = (factura: Partial<Factura>) => {
  const estado = getEstadoCanonico(factura)
  return ['BORRADOR', 'EDITABLE'].includes(estado)
}

const puedeAnular = (factura: Partial<Factura>) => {
  const estado = getEstadoCanonico(factura)
  return ['BORRADOR', 'EDITABLE', 'EMITIDA'].includes(estado)
}

const puedeMostrarAcciones = (factura: Partial<Factura>) => {
  return puedeEmitir(factura) || puedeAnular(factura)
}

const tieneDesgloseFactura = (factura: Partial<Factura> | null) => {
  return Boolean(factura?.desgloseMonetario && Object.keys(factura.desgloseMonetario).length > 0)
}

const cargarFacturas = async () => {
  loading.value = true
  try {
    facturas.value = await api.get<Factura[]>('/facturas')
  } catch (err: any) {
    error(err.message || 'Error al cargar facturas')
  } finally {
    loading.value = false
  }
}

const aplicarFiltros = () => {
  // El computed filtra automáticamente
}

const abrirDetalle = (factura: Factura) => {
  facturaSeleccionada.value = factura
  showDetalle.value = true
}

const cargarTicketPos = async (factura: Factura) => {
  cargandoTicketPos.value = true
  try {
    ticketPos.value = await api.get<FacturaPosTicket>(
      `/facturas/${factura.id}/ticket-pos?formato=${formatoTicketPos.value}`,
    )
  } catch (err: any) {
    ticketPos.value = null
    error(err.message || 'Error al generar vista POS')
  } finally {
    cargandoTicketPos.value = false
  }
}

const abrirTicketPos = async (factura: Factura) => {
  facturaSeleccionada.value = factura
  ticketPos.value = null
  showTicketPos.value = true
  await cargarTicketPos(factura)
}

const cambiarFormatoTicket = async (formato: FormatoTicketPos) => {
  formatoTicketPos.value = formato
  if (facturaSeleccionada.value) {
    await cargarTicketPos(facturaSeleccionada.value)
  }
}

const descargarTicketPdf = async () => {
  if (!facturaSeleccionada.value) {
    error('No hay factura seleccionada')
    return
  }

  await descargarTicketPosPdf(
    facturaSeleccionada.value.id,
    formatoTicketPos.value,
    'Descarga desde gestion de facturas',
  )
}

const emitirFactura = async (id: number) => {
  try {
    await api.patch(`/facturas/${id}/emitir`)
    success('Factura emitida exitosamente')
    await cargarFacturas()
  } catch (err: any) {
    error(err.message || 'Error al emitir factura')
  }
}

const abrirDialogoAnular = (factura: Factura) => {
  facturaSeleccionada.value = factura
  motivoAnulacion.value = ''
  showAnular.value = true
}

const confirmarAnular = async () => {
  if (!facturaSeleccionada.value) {
    error('No hay factura seleccionada')
    return
  }

  if (!motivoAnulacion.value.trim()) {
    error('Debes especificar un motivo')
    return
  }

  anulando.value = true
  try {
    await api.patch(`/facturas/${facturaSeleccionada.value.id}/anular`, {
      motivo: motivoAnulacion.value,
    })
    success('Factura anulada exitosamente')
    showAnular.value = false
    await cargarFacturas()
  } catch (err: any) {
    error(err.message || 'Error al anular factura')
  } finally {
    anulando.value = false
  }
}

onMounted(() => {
  cargarFacturas()
})
</script>
