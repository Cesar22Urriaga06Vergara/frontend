<template>
  <div class="checkin-checkout-panel">
    <v-card class="mb-6">
      <v-card-text>
        <v-row align="end" class="ga-2">
          <v-col cols="12" md="8">
            <v-text-field
              v-model="cedulaBusqueda"
              label="Buscar por cédula del cliente"
              placeholder="Ej: 1234567890"
              prepend-inner-icon="mdi-card-account-details-outline"
              variant="outlined"
              density="compact"
              clearable
              :loading="buscandoCedula"
              @keyup.enter="buscarPorCedula"
              @click:clear="limpiarBusquedaCedula"
            />
          </v-col>
          <v-col cols="12" md="4" class="d-flex ga-2">
            <v-btn
              color="primary"
              prepend-icon="mdi-magnify"
              :loading="buscandoCedula"
              @click="buscarPorCedula"
            >
              Buscar
            </v-btn>
            <v-btn
              v-if="busquedaActiva"
              variant="tonal"
              color="secondary"
              @click="limpiarBusquedaCedula"
            >
              Ver todas
            </v-btn>
          </v-col>
        </v-row>

        <v-alert
          v-if="busquedaActiva"
          type="info"
          variant="tonal"
          density="compact"
          class="mt-2"
        >
          Mostrando reservas asociadas a la cédula <strong>{{ cedulaBusqueda }}</strong>.
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Stats bar -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Pendientes Check-in</div>
            <div class="text-h5 font-weight-bold text-info">{{ cc.cantidadPendientesCheckin }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Pendientes Check-out</div>
            <div class="text-h5 font-weight-bold text-warning">{{ cc.cantidadPendientesCheckout }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Check-ins realizados</div>
            <div class="text-h5 font-weight-bold text-success">{{ ccStore.checkinsRealizadosHoy.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Check-outs realizados</div>
            <div class="text-h5 font-weight-bold text-success">{{ ccStore.checkoutsRealizadosHoy.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabs -->
    <v-card>
      <v-tabs v-model="tabActiva" density="compact">
        <v-tab value="checkin">
          <v-badge :content="cc.cantidadPendientesCheckin.value" :hidden="cc.cantidadPendientesCheckin.value === 0" color="error">
            Check-in
          </v-badge>
        </v-tab>
        <v-tab value="checkout">
          <v-badge :content="cc.cantidadPendientesCheckout.value" :hidden="cc.cantidadPendientesCheckout.value === 0" color="warning">
            Check-out
          </v-badge>
        </v-tab>
        <v-tab value="reservas">
          <v-badge :content="cc.cantidadTodasLasReservas.value" :hidden="cc.cantidadTodasLasReservas.value === 0" color="info">
            Todas las reservas
          </v-badge>
        </v-tab>
        <v-tab value="historial">Historial del día</v-tab>
      </v-tabs>

      <v-divider></v-divider>

      <v-window v-model="tabActiva">
        <!-- Tab Check-in -->
        <v-window-item value="checkin">
          <v-card-text class="pa-6">
            <ReservasPendientesCheckin
              :reservas="cc.pendientesCheckin.value"
              :loading="cc.loadingOperacion.value"
              @confirmar-checkin="abrirModalCheckin"
            />
          </v-card-text>
        </v-window-item>

        <!-- Tab Check-out -->
        <v-window-item value="checkout">
          <v-card-text class="pa-6">
            <ReservasPendientesCheckout
              :reservas="cc.pendientesCheckout.value"
              :loading="cc.loadingOperacion.value"
              @confirmar-checkout="abrirModalCheckout"
            />
          </v-card-text>
        </v-window-item>

        <v-window-item value="reservas">
          <v-card-text class="pa-6">
            <v-row class="mb-4">
              <v-col cols="12" md="4">
                <v-select
                  v-model="filtroEstadoReservas"
                  label="Filtrar por estado"
                  :items="estadosFiltroReservas"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="8">
                <v-alert type="info" variant="tonal" density="compact">
                  Esta vista carga reservas reales desde la base de datos, incluyendo pruebas anteriores y estados históricos.
                </v-alert>
              </v-col>
            </v-row>

            <v-empty-state
              v-if="reservasListadoFiltradas.length === 0"
              icon="mdi-calendar-search-outline"
              title="Sin reservas para mostrar"
              text="No hay reservas que coincidan con los filtros actuales"
            />

            <v-table v-else density="compact" hover class="reservas-table">
              <thead>
                <tr>
                  <th class="text-left">Reserva</th>
                  <th class="text-left">Cliente</th>
                  <th class="text-left">Habitación</th>
                  <th class="text-center">Check-in</th>
                  <th class="text-center">Check-out</th>
                  <th class="text-center">Estado</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="reserva in reservasListadoFiltradas" :key="`reserva-${reserva.id}`">
                  <td>
                    <div class="font-weight-bold">{{ reserva.numeroReserva }}</div>
                    <div class="text-caption text-medium-emphasis">{{ reserva.estadoReservaOriginal || reserva.estado }}</div>
                  </td>
                  <td>
                    <div class="font-weight-medium">{{ reserva.nombreCliente }}</div>
                    <div class="text-caption text-medium-emphasis">{{ reserva.cedulaCliente }}</div>
                  </td>
                  <td class="font-weight-bold">#{{ reserva.numeroHabitacion }}</td>
                  <td class="text-center">{{ formatearFechaTabla(reserva.checkinFecha) }}</td>
                  <td class="text-center">{{ formatearFechaTabla(reserva.checkoutFecha) }}</td>
                  <td class="text-center">
                    <v-chip :color="getColorEstadoReserva(reserva)" size="small" variant="tonal">
                      {{ getEtiquetaEstadoReserva(reserva) }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <div class="d-flex justify-center ga-2">
                      <v-btn
                        v-if="puedeRegistrarCheckin(reserva)"
                        size="small"
                        color="success"
                        icon
                        @click="abrirModalCheckin(reserva)"
                      >
                        <v-icon>mdi-login</v-icon>
                        <v-tooltip activator="parent">Check-in</v-tooltip>
                      </v-btn>
                      <v-btn
                        v-if="puedeRegistrarCheckout(reserva)"
                        size="small"
                        color="primary"
                        icon
                        @click="abrirModalCheckout(reserva)"
                      >
                        <v-icon>mdi-logout</v-icon>
                        <v-tooltip activator="parent">Check-out</v-tooltip>
                      </v-btn>
                      <span v-if="!puedeRegistrarCheckin(reserva) && !puedeRegistrarCheckout(reserva)" class="text-caption text-medium-emphasis">
                        Sin acción
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-window-item>

        <!-- Tab Historial -->
        <v-window-item value="historial">
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12" md="6">
                <v-card title="Check-ins realizados">
                  <v-list v-if="ccStore.checkinsRealizadosHoy.length > 0" density="compact">
                    <v-list-item
                      v-for="reserva in ccStore.checkinsRealizadosHoy"
                      :key="`checkin-${reserva.id}`"
                      :title="`HB${reserva.numeroHabitacion}`"
                      :subtitle="reserva.nombreCliente"
                      prepend-icon="mdi-login"
                    >
                      <template #append>
                        <v-chip color="success" size="small">{{ reserva.cantidadHuespedes }} pers.</v-chip>
                      </template>
                    </v-list-item>
                  </v-list>
                  <v-card-text v-else class="text-center text-medium-emphasis">
                    Sin check-ins realizados
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card title="Check-outs realizados">
                  <v-list v-if="ccStore.checkoutsRealizadosHoy.length > 0" density="compact">
                    <v-list-item
                      v-for="reserva in ccStore.checkoutsRealizadosHoy"
                      :key="`checkout-${reserva.id}`"
                      :title="`HB${reserva.numeroHabitacion}`"
                      :subtitle="reserva.nombreCliente"
                      prepend-icon="mdi-logout"
                    >
                      <template #append>
                        <v-icon color="success">mdi-check-circle</v-icon>
                      </template>
                    </v-list-item>
                  </v-list>
                  <v-card-text v-else class="text-center text-medium-emphasis">
                    Sin check-outs realizados
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Modal Check-in -->
    <CheckinModal
      v-if="reservaParaCheckin"
      :reserva="reservaParaCheckin"
      :loading="cc.loadingOperacion.value"
      @confirmar="ejecutarCheckin"
      @cerrar="reservaParaCheckin = null"
    />

    <!-- Modal Check-out -->
    <CheckoutModal
      v-if="reservaParaCheckout"
      :reserva="reservaParaCheckout"
      :loading="cc.loadingOperacion.value"
      :folio-pagado="folioPagado"
      @confirmar="ejecutarCheckout"
      @ir-caja="irACajaDesdeCheckout"
      @cerrar="reservaParaCheckout = null"
    />

    <v-dialog v-model="cobrarFolioDialog" max-width="520px">
      <v-card title="Cobro pendiente de folio">
        <v-card-text>
          <p class="text-body-2 mb-3">
            Debes registrar el cobro para continuar con el check-out de la habitación
            <strong>#{{ reservaPendienteCobro?.numeroHabitacion || '-' }}</strong>.
          </p>

          <v-alert type="info" variant="tonal" density="compact" class="mb-4">
            Total a cobrar: <strong>{{ formatCurrency(totalCobroPendiente) }}</strong>
          </v-alert>

          <v-text-field
            v-model.number="montoRecibidoCobro"
            label="Monto recibido"
            type="number"
            min="0"
            step="0.01"
            prefix="$"
            variant="outlined"
            density="compact"
            class="mb-3"
          />

          <v-select
            v-model="medioPagoCobro"
            label="Método de pago"
            :items="metodosPagoCobro"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            class="mb-3"
          />

          <v-text-field
            v-if="requiereReferenciaCobro"
            v-model="referenciaCobro"
            label="Referencia de pago"
            placeholder="Número de comprobante"
            variant="outlined"
            density="compact"
            class="mb-3"
          />

          <v-alert
            v-if="montoRecibidoCobro > 0 && montoRecibidoCobro < totalCobroPendiente"
            type="error"
            variant="tonal"
            density="compact"
          >
            Monto insuficiente. Falta {{ formatCurrency(totalCobroPendiente - montoRecibidoCobro) }}
          </v-alert>

          <v-alert
            v-else-if="montoRecibidoCobro >= totalCobroPendiente && totalCobroPendiente > 0"
            type="success"
            variant="tonal"
            density="compact"
          >
            Cambio: <strong>{{ formatCurrency(vueltoCobro) }}</strong>
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="cerrarCobroPendiente">Cancelar</v-btn>
          <v-btn
            color="success"
            variant="tonal"
            :loading="folios.loadingOperacion.value"
            :disabled="cobroInvalido"
            @click="ejecutarCobroPendiente"
          >
            Registrar cobro y continuar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="facturaGeneradaDialog" max-width="560px">
      <v-card title="Factura generada">
        <v-card-text>
          <v-alert type="success" variant="tonal" density="compact" class="mb-4">
            Check-out completado y factura generada correctamente.
          </v-alert>

          <v-row v-if="facturaGenerada">
            <v-col cols="12" sm="6">
              <div class="text-caption text-medium-emphasis">Número de factura</div>
              <div class="text-subtitle-1 font-weight-bold">{{ facturaGenerada.numeroFactura }}</div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="text-caption text-medium-emphasis">Estado</div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ facturaGenerada.estadoFactura || facturaGenerada.estado || 'N/A' }}
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="text-caption text-medium-emphasis">Total</div>
              <div class="text-h6 font-weight-bold">{{ formatCurrency(facturaGenerada.total) }}</div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="text-caption text-medium-emphasis">Fecha de emisión</div>
              <div class="text-subtitle-2">{{ formatDate(facturaGenerada.fechaEmision) }}</div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="tonal" @click="facturaGeneradaDialog = false">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useCheckinCheckout } from '~/composables/useCheckinCheckout'
import { useCheckinCheckoutStore } from '~/stores/checkinCheckout'
import { useFolios } from '~/composables/useFolios'
import { useNotification } from '~/composables/useNotification'
import type {
  ReservaParaCheckin,
  ConfirmarCheckoutResponse,
  FacturaCheckoutResumen,
} from '~/types/checkinCheckout'
import type { MetodoPago } from '~/types/folio'

import ReservasPendientesCheckin from './ReservasPendientesCheckin.vue'
import ReservasPendientesCheckout from './ReservasPendientesCheckout.vue'
import CheckinModal from './CheckinModal.vue'
import CheckoutModal from './CheckoutModal.vue'

const { success, error } = useNotification()
const api = useApi()
const cc = useCheckinCheckout()
const ccStore = useCheckinCheckoutStore()
const folios = useFolios()
const cedulaBusqueda = cc.searchCedula
const busquedaActiva = cc.searchActivo
const buscandoCedula = cc.searchLoading

// Local state
const tabActiva = ref('checkin')
const reservaParaCheckin = ref<ReservaParaCheckin | null>(null)
const reservaParaCheckout = ref<ReservaParaCheckin | null>(null)
const folioPagado = ref(true)
const cobrarFolioDialog = ref(false)
const reservaPendienteCobro = ref<ReservaParaCheckin | null>(null)
const totalCobroPendiente = ref(0)
const montoRecibidoCobro = ref(0)
const medioPagoCobro = ref<MetodoPago>('EFECTIVO')
const referenciaCobro = ref('')
const facturaGeneradaDialog = ref(false)
const facturaGenerada = ref<FacturaCheckoutResumen | null>(null)
const filtroEstadoReservas = ref('TODOS')

const estadosFiltroReservas = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Reservada', value: 'pendiente' },
  { label: 'Confirmada', value: 'confirmada' },
  { label: 'Check-in realizado', value: 'checkedin' },
  { label: 'Completada', value: 'completada' },
  { label: 'Cancelada', value: 'cancelada' },
  { label: 'Rechazada', value: 'rechazada' },
]

const metodosPagoCobro = [
  { label: 'Efectivo', value: 'EFECTIVO' },
  { label: 'Tarjeta', value: 'TARJETA' },
  { label: 'Transferencia', value: 'TRANSFERENCIA' },
  { label: 'Cheque', value: 'CHEQUE' },
  { label: 'Otro', value: 'OTRO' },
]

const requiereReferenciaCobro = computed(() => medioPagoCobro.value !== 'EFECTIVO')

const vueltoCobro = computed(() => {
  const total = Number(totalCobroPendiente.value || 0)
  const recibido = Number(montoRecibidoCobro.value || 0)
  return Math.max(0, recibido - total)
})

const cobroInvalido = computed(() => {
  const total = Number(totalCobroPendiente.value || 0)
  const recibido = Number(montoRecibidoCobro.value || 0)

  if (total <= 0) return true
  if (recibido < total) return true
  if (requiereReferenciaCobro.value && !referenciaCobro.value.trim()) return true

  return false
})

const formatCurrency = (valor?: number) => {
  return `$${Number(valor || 0).toLocaleString('es-CO')}`
}

const formatDate = (fecha?: string) => {
  if (!fecha) return 'No disponible'
  return new Date(fecha).toLocaleString('es-CO')
}

const formatearFechaTabla = (fecha?: string) => {
  if (!fecha) return 'No disponible'
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

const getEstadoFiltroReserva = (reserva: ReservaParaCheckin) => {
  const estadoOriginal = String(reserva.estadoReservaOriginal || '').toLowerCase()

  if (estadoOriginal === 'rechazada') return 'rechazada'
  if (reserva.estado === 'checkedin') return 'checkedin'
  return reserva.estado
}

const getEtiquetaEstadoReserva = (reserva: ReservaParaCheckin) => {
  const estado = getEstadoFiltroReserva(reserva)

  switch (estado) {
    case 'pendiente':
      return 'Reservada'
    case 'confirmada':
      return 'Confirmada'
    case 'checkedin':
      return 'Check-in realizado'
    case 'completada':
      return 'Completada'
    case 'cancelada':
      return 'Cancelada'
    case 'rechazada':
      return 'Rechazada'
    default:
      return 'Desconocido'
  }
}

const getColorEstadoReserva = (reserva: ReservaParaCheckin) => {
  const estado = getEstadoFiltroReserva(reserva)

  switch (estado) {
    case 'pendiente':
      return 'warning'
    case 'confirmada':
      return 'success'
    case 'checkedin':
      return 'info'
    case 'completada':
      return 'primary'
    case 'cancelada':
    case 'rechazada':
      return 'error'
    default:
      return 'default'
  }
}

const puedeRegistrarCheckin = (reserva: ReservaParaCheckin) => {
  return (
    (reserva.estado === 'pendiente' || reserva.estado === 'confirmada') &&
    reserva.estadoCheckin === 'PENDIENTE_CHECKIN'
  )
}

const puedeRegistrarCheckout = (reserva: ReservaParaCheckin) => {
  return reserva.estado === 'checkedin' && reserva.estadoCheckin === 'CHECKOUT_PENDIENTE'
}

const reservasListadoFiltradas = computed(() => {
  const reservas = [...cc.todasLasReservas.value].sort((reservaA, reservaB) => {
    return new Date(reservaB.checkinFecha).getTime() - new Date(reservaA.checkinFecha).getTime()
  })

  if (filtroEstadoReservas.value === 'TODOS') {
    return reservas
  }

  return reservas.filter(
    (reserva) => getEstadoFiltroReserva(reserva) === filtroEstadoReservas.value
  )
})

const mapFacturaResumen = (raw: any): FacturaCheckoutResumen | null => {
  if (!raw?.numeroFactura) return null

  return {
    id: Number(raw.id || 0),
    numeroFactura: String(raw.numeroFactura),
    total: Number(raw.total || 0),
    subtotal: raw.subtotal !== undefined ? Number(raw.subtotal) : undefined,
    montoIva: raw.montoIva !== undefined ? Number(raw.montoIva) : undefined,
    montoInc: raw.montoInc !== undefined ? Number(raw.montoInc) : undefined,
    estadoFactura: raw.estadoFactura,
    estado: raw.estado,
    fechaEmision: raw.fechaEmision,
  }
}

const obtenerFacturaCheckout = async (
  idReserva: number,
  respuesta: ConfirmarCheckoutResponse,
) => {
  const facturaDesdeRespuesta = mapFacturaResumen(respuesta?.factura)
  if (facturaDesdeRespuesta) return facturaDesdeRespuesta

  try {
    const factura = await api.get<any>(`/facturas/reserva/${idReserva}`)
    return mapFacturaResumen(factura)
  } catch {
    return null
  }
}

const abrirCobroPendiente = (reserva: ReservaParaCheckin, total: number) => {
  reservaPendienteCobro.value = reserva
  totalCobroPendiente.value = total
  montoRecibidoCobro.value = total
  medioPagoCobro.value = 'EFECTIVO'
  referenciaCobro.value = ''
  cobrarFolioDialog.value = true
}

const cerrarCobroPendiente = () => {
  cobrarFolioDialog.value = false
  reservaPendienteCobro.value = null
  totalCobroPendiente.value = 0
  montoRecibidoCobro.value = 0
  referenciaCobro.value = ''
  medioPagoCobro.value = 'EFECTIVO'
}

const ejecutarCobroPendiente = async () => {
  if (!reservaPendienteCobro.value?.idHabitacion) return

  const reserva = reservaPendienteCobro.value

  try {
    // CAMBIO: Cerrar folio en lugar de cobrar
    // El cobro se realizará en CAJA, no en checkout
    await folios.cerrarFolio(reserva.idHabitacion)

    cerrarCobroPendiente()
    success('Folio cerrado. El pago se registrará en Caja.')

    await abrirModalCheckout(reserva)
  } catch (err: any) {
    error(err?.message || 'Error al cerrar folio')
  }
}

const abrirModalCheckin = async (reserva: ReservaParaCheckin) => {
  // Validar antes de abrir modal
  const validacion = await cc.validarCheckin(reserva.id)
  if (!validacion.esValido) {
    error(validacion.errores.join(', '))
    return
  }

  if (validacion.advertencias.length > 0) {
    console.warn('Advertencias:', validacion.advertencias)
  }

  reservaParaCheckin.value = reserva
}

const abrirModalCheckout = async (reserva: ReservaParaCheckin) => {
  // Validar antes de abrir modal
  const validacion = await cc.validarCheckout(reserva.id)
  if (!validacion.esValido) {
    if (validacion.tipoBloqueo === 'REQUIERE_COBRO' && reserva.idHabitacion) {
      // CAMBIO: Si folio aún está ACTIVO, ciérralo automáticamente
      // No pidas cobro aquí, el cobro se hace en CAJA
      try {
        const folio = await folios.obtenerFolio(reserva.idHabitacion)
        if (folio && folio.estado === 'ABIERTO') {
          // Cerrar folio automáticamente
          await folios.cerrarFolio(reserva.idHabitacion)
          success('Folio cerrado automáticamente. El pago se registrará en Caja.')
          // Re-validar después de cerrar
          validacion.esValido = true
        } else {
          // Si estado es otro, re-validar
          const nuevaValidacion = await cc.validarCheckout(reserva.id)
          if (!nuevaValidacion.esValido) {
            error('No se puede proceder con el check-out. Por favor ve a Caja para resolver.')
            return
          }
          validacion.esValido = true
        }
      } catch (err: any) {
        error(err?.message || 'Error al cerrar folio. Por favor ve a Caja.')
        return
      }
    }

    if (validacion.tipoBloqueo === 'SIN_FOLIO' && reserva.idHabitacion) {
      error('No existe un folio activo para esta habitación. Te llevaré a Caja para validarlo.')
      await navigateTo(`/recepcionista/caja?habitacion=${reserva.idHabitacion}`)
      return
    }

    const mensaje = validacion.errores.join(', ') || 'No se puede realizar check-out para esta reserva'
    error(mensaje)
    return
  }

  folioPagado.value = validacion.folioPagado

  if (validacion.advertencias.length > 0) {
    console.warn('Advertencias:', validacion.advertencias)
  }

  reservaParaCheckout.value = reserva
}

const ejecutarCheckin = async (datos: any) => {
  if (!reservaParaCheckin.value) return

  try {
    const respuesta = await cc.confirmarCheckin(
      reservaParaCheckin.value.id,
      reservaParaCheckin.value.idHabitacion,
      reservaParaCheckin.value.idCliente,
      datos.notas,
      datos.hora,
      datos.documento
    )

    if (respuesta) {
      ccStore.agregarCheckInRealizado(reservaParaCheckin.value)
      reservaParaCheckin.value = null
      tabActiva.value = 'checkout' // Cambiar a tab checkout después del checkin
    }
  } catch (err) {
    // Error ya mostrado en composable
  }
}

const ejecutarCheckout = async (datos: any) => {
  if (!reservaParaCheckout.value) return

  const reservaProcesada = reservaParaCheckout.value

  try {
    // Checkout es una acción LIMPIA: solo registra la salida
    // NO genera factura - la factura se genera SOLO en caja cuando se cobra
    await cc.confirmarCheckout(
      reservaProcesada.id,
      reservaProcesada.idHabitacion,
      datos.notas,
      datos.estado,
      datos.hora
    )

    // Registrar check-out completado
    ccStore.agregarCheckOutRealizado(reservaProcesada)
    reservaParaCheckout.value = null

    success(`Check-out completado para ${reservaProcesada.nombreCliente}`)
  } catch (err: any) {
    error(err?.message || 'Error al realizar check-out')
  }
}

const irACajaDesdeCheckout = async () => {
  if (!reservaParaCheckout.value?.idHabitacion) return
  await navigateTo(`/recepcionista/caja?habitacion=${reservaParaCheckout.value.idHabitacion}`)
}

const buscarPorCedula = async () => {
  const cedula = cedulaBusqueda.value.trim()

  if (!cedula) {
    error('Ingresa la cédula del cliente para realizar la búsqueda')
    return
  }

  await cc.obtenerPendientesPorCedula(cedula)
}

const limpiarBusquedaCedula = async () => {
  if (!busquedaActiva.value && !cedulaBusqueda.value.trim()) return
  await cc.limpiarBusqueda()
}

onMounted(async () => {
  // Cargar pendientes
  await cc.obtenerPendientes()
  ccStore.setPendientesCheckin(cc.pendientesCheckin.value)
  ccStore.setPendientesCheckout(cc.pendientesCheckout.value)

  // Cargar flujo del día
  await cc.obtenerFlujoDelDia()
  if (cc.flujoDelDia.value) {
    ccStore.setFlujoDelDia(cc.flujoDelDia.value)
  }
})
</script>

<style scoped>
.checkin-checkout-panel {
  width: 100%;
}
</style>
