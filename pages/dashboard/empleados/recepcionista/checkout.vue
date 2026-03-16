<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Gestión de Salida de Clientes</h1>
        <p class="text-body-2 text-medium-emphasis">
          Busca por cédula del cliente y confirma su salida
        </p>
      </div>
    </div>

    <!-- Búsqueda por cédula -->
    <v-card class="card-glow mb-6 pa-6">
      <div class="text-subtitle-2 font-weight-bold mb-4">Buscar por Cédula del Cliente</div>
      <v-row>
        <v-col cols="12" sm="8">
          <v-text-field
            v-model="cedula"
            label="Cédula del Cliente"
            placeholder="Ej: 1234567890"
            prepend-inner-icon="mdi-card-account-details"
            clearable
            @keyup.enter="buscarReserva"
          />
        </v-col>
        <v-col cols="12" sm="4" class="d-flex align-end">
          <v-btn
            @click="buscarReserva"
            :loading="loading"
            color="primary"
            block
            prepend-icon="mdi-magnify"
          >
            Buscar
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Detalles de la Reserva -->
    <v-card class="card-glow mb-6">
      <v-card-title class="text-subtitle-1 font-weight-bold">
        Detalles de la Reserva
      </v-card-title>
      <v-card-text v-if="reservaEncontrada" class="pa-6">
        <!-- Información principal de la reserva -->
        <v-row class="mb-4">
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Cliente</div>
            <div class="text-h6 font-weight-bold mb-4">{{ reservaEncontrada.nombreCliente }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Cédula</div>
            <div class="text-h6 font-weight-bold mb-4">{{ reservaEncontrada.cedulaCliente }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Habitación</div>
            <v-chip color="info" variant="tonal" size="small" class="mb-4">
              Hab. {{ reservaEncontrada.habitacion?.numeroHabitacion }}
            </v-chip>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Tipo</div>
            <div class="text-body-2 mb-4">{{ reservaEncontrada.tipoHabitacion?.nombreTipo }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Entrada</div>
            <div class="text-body-2">{{ new Date(reservaEncontrada.checkinPrevisto).toLocaleDateString('es-CO') }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Salida</div>
            <div class="text-body-2">{{ new Date(reservaEncontrada.checkoutPrevisto).toLocaleDateString('es-CO') }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Email</div>
            <div class="text-body-2">{{ reservaEncontrada.emailCliente }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Check-in Real</div>
            <div class="text-body-2">{{ reservaEncontrada.checkinReal ? new Date(reservaEncontrada.checkinReal).toLocaleString('es-CO') : 'N/A' }}</div>
          </v-col>
        </v-row>

        <!-- Resumen de Consumos -->
        <v-divider class="my-4" />
        
        <div v-if="cuentaSeleccionada" class="mt-4">
          <div class="text-subtitle-2 font-weight-bold mb-3">Resumen de Consumos</div>
          <v-table dense>
            <tbody>
              <tr>
                <td class="text-caption">Hospedaje ({{ cuentaSeleccionada.noches }} noche/s)</td>
                <td class="text-right font-weight-bold">
                  {{ formatearPrecioFactura(cuentaSeleccionada.subtotalHabitacion) }}
                </td>
              </tr>
              <tr v-for="(monto, categoria) in cuentaSeleccionada.resumenPorCategoria" :key="categoria">
                <td class="text-caption">{{ formatearCategoria(categoria) }}</td>
                <td class="text-right font-weight-bold">
                  {{ formatearPrecioFactura(monto) }}
                </td>
              </tr>
              <tr v-if="cuentaSeleccionada.subtotalServicios > 0" style="border-top: 1px solid #ddd;">
                <td class="text-caption font-weight-bold">Subtotal Servicios</td>
                <td class="text-right font-weight-bold">
                  {{ formatearPrecioFactura(cuentaSeleccionada.subtotalServicios) }}
                </td>
              </tr>
              <tr style="background-color: rgba(76, 175, 80, 0.1);">
                <td class="text-caption font-weight-bold">TOTAL A PAGAR</td>
                <td class="text-right text-h6 font-weight-bold" style="color: #2e7d32;">
                  {{ formatearPrecioFactura(cuentaSeleccionada.totalGeneral) }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <!-- Alerta de carga -->
        <v-alert v-if="cuentaCargando" type="warning" class="mt-4 mb-4">
          <v-progress-circular indeterminate size="20" class="mr-2" />
          <span class="text-caption">Cargando información de servicios...</span>
        </v-alert>

        <!-- Divisor y botones de acción -->
        <v-divider class="my-4" />
        <div class="d-flex justify-end gap-2">
          <v-btn variant="text" @click="limpiarBusqueda">
            Limpiar
          </v-btn>
          <v-btn
            color="info"
            @click="abrirConfirmCheckout"
            prepend-icon="mdi-door-closed-outline"
            :disabled="reservaEncontrada.checkoutReal !== null || cuentaCargando"
            :loading="checkoutLoading"
          >
            Confirmar Salida
          </v-btn>
        </div>
      </v-card-text>
      <v-card-text v-else class="text-center py-8 text-medium-emphasis">
        Busca una cédula para ver los detalles de la reserva
      </v-card-text>
    </v-card>

    <!-- Diálogo de confirmación: check-out con flujo multi-paso -->
    <v-dialog
      v-model="confirmCheckoutDialog"
      max-width="750"
      persistent
      scrollable
    >
      <v-card rounded="xl">
        <!-- PASO 1: Resumen de Cobro -->
        <div v-show="pasoCheckout === 'resumen'">
          <v-card-text class="pa-6">
            <div class="text-center mb-4">
              <v-avatar
                color="info"
                size="56"
                variant="tonal"
                class="mb-4"
              >
                <v-icon icon="mdi-door-closed-outline" size="28" />
              </v-avatar>
              <h3 class="text-h6 font-weight-bold mb-2">Confirmar Check-out</h3>
              <p class="text-body-2 text-medium-emphasis">
                Revisa el desglose de cobro antes de generar la factura
              </p>
            </div>

            <!-- Detalles de la reserva -->
            <v-alert
              v-if="selectedReserva"
              type="info"
              variant="tonal"
              class="mb-4"
            >
              <template #title>Reserva {{ selectedReserva.codigoConfirmacion }}</template>
              <p class="text-caption mb-1">
                Habitación: {{ selectedReserva.habitacion?.numeroHabitacion || 'Por asignar' }}
              </p>
              <p class="text-caption">
                Cliente: {{ selectedReserva.nombreCliente }}
              </p>
            </v-alert>

            <!-- Información de servicios -->
            <v-card v-if="cuentaSeleccionada" variant="outlined" class="mb-4">
              <v-card-title class="text-subtitle-2">Desglose de Cobro</v-card-title>
              <v-divider />
              <v-card-text class="pt-3 pb-0">
                <v-table dense>
                  <tbody>
                    <tr>
                      <td class="text-caption">Hospedaje ({{ cuentaSeleccionada.noches }} noche/s)</td>
                      <td class="text-right font-weight-bold">
                        ${{ formatearPrecio(cuentaSeleccionada.subtotalHabitacion) }}
                      </td>
                    </tr>
                    <tr v-for="(monto, categoria) in cuentaSeleccionada.resumenPorCategoria" :key="categoria">
                      <td class="text-caption">{{ formatearCategoria(categoria) }}</td>
                      <td class="text-right font-weight-bold">
                        ${{ formatearPrecio(monto) }}
                      </td>
                    </tr>
                    <tr v-if="cuentaSeleccionada.subtotalServicios > 0" class="border-top">
                      <td class="text-caption font-weight-bold">Subtotal Servicios</td>
                      <td class="text-right font-weight-bold">
                        ${{ formatearPrecio(cuentaSeleccionada.subtotalServicios) }}
                      </td>
                    </tr>
                    <tr class="bg-success-lighten-5">
                      <td class="text-caption font-weight-bold">TOTAL A PAGAR</td>
                      <td class="text-right text-h6 font-weight-bold text-success">
                        ${{ formatearPrecio(cuentaSeleccionada.totalGeneral) }}
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>

            <!-- Alerta de error si falla -->
            <v-alert v-if="errorCheckout" type="error" variant="tonal" class="mb-4">
              {{ errorCheckout }}
            </v-alert>

            <!-- Alerta de carga -->
            <v-alert v-if="cuentaCargando" type="warning" class="mb-4">
              <v-progress-circular indeterminate size="20" class="mr-2" />
              <span class="text-caption">Cargando información de servicios...</span>
            </v-alert>
          </v-card-text>

          <v-card-actions class="px-6 pb-5">
            <v-btn
              variant="text"
              @click="cerrarDialogCheckout"
              :disabled="checkoutLoading || cuentaCargando"
            >
              Cancelar
            </v-btn>
            <v-spacer />
            <v-btn
              color="info"
              :loading="checkoutLoading"
              @click="handleConfirmCheckout"
              :disabled="cuentaCargando"
            >
              Confirmar Salida y Generar Factura
            </v-btn>
          </v-card-actions>
        </div>

        <!-- PASO 2: Generando Factura -->
        <div v-show="pasoCheckout === 'generando'" class="pa-12 text-center">
          <v-progress-circular
            indeterminate
            size="64"
            color="primary"
            class="mx-auto mb-4"
          />
          <h3 class="text-h6 font-weight-bold mb-2">Procesando Check-out</h3>
          <p class="text-body-2 text-medium-emphasis">
            Generando factura electrónica, por favor espere...
          </p>
        </div>

        <!-- PASO 3: Factura Generada -->
        <div v-show="pasoCheckout === 'factura-generada'">
          <v-card-text class="pa-6">
            <!-- Header de éxito -->
            <div class="text-center mb-6">
              <v-avatar
                color="success"
                size="56"
                variant="tonal"
                class="mb-4"
              >
                <v-icon icon="mdi-check-circle" size="28" />
              </v-avatar>
              <h3 class="text-h6 font-weight-bold mb-3">¡Factura Generada Exitosamente!</h3>
              <v-chip
                v-if="facturaGenerada"
                color="primary"
                variant="outlined"
                size="large"
              >
                {{ facturaGenerada.numeroFactura }}
              </v-chip>
            </div>

            <!-- Datos del cliente -->
            <v-card v-if="facturaGenerada" variant="outlined" class="mb-4">
              <v-card-title class="text-subtitle-2">Datos del Cliente</v-card-title>
              <v-divider />
              <v-card-text class="pt-4">
                <v-row>
                  <v-col cols="12" sm="6">
                    <p class="text-caption text-medium-emphasis mb-1">Nombre</p>
                    <p class="font-weight-bold">{{ facturaGenerada.nombreCliente }}</p>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <p class="text-caption text-medium-emphasis mb-1">Cédula</p>
                    <p class="font-weight-bold">{{ facturaGenerada.cedulaCliente }}</p>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <p class="text-caption text-medium-emphasis mb-1">Email</p>
                    <p class="font-weight-bold text-body-2">{{ facturaGenerada.emailCliente }}</p>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Conceptos facturados -->
            <v-card v-if="facturaGenerada" variant="tonal" color="primary" class="mb-4">
              <v-card-title class="text-subtitle-2">Conceptos Facturados</v-card-title>
              <v-divider />
              <v-table dense>
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th class="text-right">Cant.</th>
                    <th class="text-right">P. Unitario</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="detalle in facturaGenerada.detalles" :key="detalle.id">
                    <td>
                      <div class="d-flex align-center ga-2">
                        <v-icon
                          :icon="detalle.tipoConcepto === 'habitacion' ? 'mdi-bed' : 'mdi-room-service'"
                          size="18"
                        />
                        <span class="text-caption">{{ detalle.descripcion }}</span>
                      </div>
                    </td>
                    <td class="text-right text-caption">{{ detalle.cantidad }}</td>
                    <td class="text-right text-caption">{{ formatearPrecioFactura(detalle.precioUnitario) }}</td>
                    <td class="text-right font-weight-bold text-caption">{{ formatearPrecioFactura(detalle.total) }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>

            <!-- Resumen financiero -->
            <v-card v-if="facturaGenerada" variant="outlined" class="mb-4">
              <v-card-title class="text-subtitle-2">Resumen Financiero</v-card-title>
              <v-divider />
              <v-card-text class="pt-4">
                <v-row class="mb-3">
                  <v-col cols="8">
                    <p class="text-caption text-medium-emphasis">Subtotal</p>
                  </v-col>
                  <v-col cols="4" class="text-right">
                    <p class="text-caption font-weight-bold">{{ formatearPrecioFactura(facturaGenerada.subtotal) }}</p>
                  </v-col>
                </v-row>
                <v-row class="mb-3">
                  <v-col cols="8">
                    <p class="text-caption text-medium-emphasis">IVA ({{ facturaGenerada.porcentajeIva }}%)</p>
                  </v-col>
                  <v-col cols="4" class="text-right">
                    <p class="text-caption font-weight-bold">{{ formatearPrecioFactura(facturaGenerada.montoIva) }}</p>
                  </v-col>
                </v-row>
                <v-divider class="mb-3" />
                <v-row>
                  <v-col cols="8">
                    <p class="text-h6 font-weight-bold text-success">TOTAL</p>
                  </v-col>
                  <v-col cols="4" class="text-right">
                    <p class="text-h6 font-weight-bold text-success">{{ formatearPrecioFactura(facturaGenerada.total) }}</p>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- UUID -->
            <v-chip
              v-if="facturaGenerada"
              size="small"
              variant="outlined"
              class="mb-4"
            >
              <v-icon icon="mdi-identifier" size="16" class="mr-2" />
              <span class="text-caption">{{ facturaGenerada.uuid.substring(0, 24) }}...</span>
              <v-tooltip activator="parent" location="bottom">
                {{ facturaGenerada.uuid }}
              </v-tooltip>
            </v-chip>
          </v-card-text>

          <v-card-actions class="px-6 pb-5">
            <v-btn
              variant="text"
              @click="cerrarDialogCheckout"
            >
              Cerrar
            </v-btn>
            <v-spacer />
            <v-btn
              color="success"
              prepend-icon="mdi-xml"
              @click="descargarXml"
            >
              Descargar XML
            </v-btn>
            <v-btn
              color="primary"
              prepend-icon="mdi-printer-outline"
              @click="imprimirFactura"
            >
              Imprimir
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useReservasStore } from '~/stores/reservas'
import { useServiciosStore } from '~/stores/servicios'
import { useNotification } from '~/composables/useNotification'
import { useAuthStore } from '~/stores/auth'
import { UserRole } from '~/types/auth'
import type { Reserva } from '~/types/api'
import type { CuentaReserva } from '~/types/servicios'
import type { Factura } from '~/types/factura'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.RECEPCIONISTA],
})

useHead({ title: 'Gestión de Check-out' })

const reservasStore = useReservasStore()
const serviciosStore = useServiciosStore()
const authStore = useAuthStore()
const notification = useNotification()

// ── State ──
const selectedReserva = ref<Reserva | null>(null)
const cedula = ref('')
const loading = ref(false)
const cuentaCargando = ref(false)

// Confirm checkout dialog - multi-paso
const confirmCheckoutDialog = ref(false)
const checkoutLoading = ref(false)
type PasoCheckout = 'resumen' | 'generando' | 'factura-generada'
const pasoCheckout = ref<PasoCheckout>('resumen')
const facturaGenerada = ref<Factura | null>(null)
const errorCheckout = ref<string | null>(null)

// Cuenta/servicios
const cuentaSeleccionada = ref<CuentaReserva | null>(null)

// ── Alias para reservaEncontrada ──
const reservaEncontrada = computed({
  get: () => selectedReserva.value,
  set: (val) => { selectedReserva.value = val }
})

// ── Carga inicial ──
onMounted(() => {
  cargarReservas()
})

// ── Métodos ──
const cargarReservas = async () => {
  loading.value = true
  try {
    const hotelId = authStore.user?.idHotel
    if (hotelId) {
      await reservasStore.fetchReservasByHotel(hotelId)
    }
  } catch (error: any) {
    notification.error(error?.message || 'Error al cargar reservas')
  } finally {
    loading.value = false
  }
}

const buscarReserva = async () => {
  if (!cedula.value) {
    notification.error('Ingrese la cédula del cliente')
    return
  }

  // Filtrar localmente desde las reservas cargadas
  const reserva = reservasStore.reservas.find(r =>
    r.cedulaCliente === cedula.value &&
    (r.estadoReserva?.toLowerCase() === 'confirmada') &&
    r.checkinReal &&
    !r.checkoutReal
  )

  if (!reserva) {
    notification.error('No hay reserva disponible para esa cédula (debe estar confirmada, con check-in realizado y sin check-out)')
    selectedReserva.value = null
    return
  }

  selectedReserva.value = reserva
  notification.success(`Reserva encontrada: ${reserva.nombreCliente}`)

  // Cargar información de servicios y cuenta
  cuentaCargando.value = true
  cuentaSeleccionada.value = null
  try {
    await serviciosStore.cargarCuenta(reserva.id)
    cuentaSeleccionada.value = serviciosStore.cuentaActual
  } catch (error: any) {
    console.error('Error cargando cuenta:', error)
    notification.warning('No se pudo cargar información de servicios')
  } finally {
    cuentaCargando.value = false
  }
}

const limpiarBusqueda = () => {
  cedula.value = ''
  selectedReserva.value = null
  cuentaSeleccionada.value = null
}

const abrirConfirmCheckout = () => {
  if (!selectedReserva.value) return
  pasoCheckout.value = 'resumen'
  facturaGenerada.value = null
  errorCheckout.value = null
  confirmCheckoutDialog.value = true
}

const handleConfirmCheckout = async () => {
  if (!selectedReserva.value) return

  // Cambiar paso a "generando"
  pasoCheckout.value = 'generando'
  checkoutLoading.value = true
  errorCheckout.value = null

  try {
    // La llamada al store ahora retorna { reserva, factura }
    const resultado = await reservasStore.confirmarCheckout(selectedReserva.value.id)
    
    // Factura es opcional - si no se generó, mostrar warning pero continuar
    if (resultado.factura) {
      facturaGenerada.value = resultado.factura
      pasoCheckout.value = 'factura-generada'
      notification.success(`✅ Factura ${resultado.factura.numeroFactura} generada exitosamente`)
    } else {
      // Factura no se generó, mostrar warning pero permitir continuar
      notification.warning('⚠️ Check-out confirmado, pero hubo un problema al generar la factura. Intenta nuevamente más tarde.')
      pasoCheckout.value = 'resumen' // Volver a resumen para que intente de nuevo si quiere
    }
    
    await cargarReservas()

  } catch (error: any) {
    pasoCheckout.value = 'resumen' // Volver al resumen si falla
    errorCheckout.value = error?.message || 'Error al confirmar check-out'
    notification.error(errorCheckout.value || 'Error desconocido')
  } finally {
    checkoutLoading.value = false
  }
}



// ── Helpers ──
const formatearCategoria = (cat: string): string => {
  const map: Record<string, string> = {
    cafeteria: 'Cafetería ☕',
    lavanderia: 'Lavandería 👔',
    spa: 'Spa 💆',
    room_service: 'Room Service 🛎️',
    minibar: 'Minibar 🍷',
    otros: 'Otros',
  }
  return map[cat] || cat
}

const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio)
}

// ── Nuevas funciones para flujo de facturación ──
const descargarXml = () => {
  if (!facturaGenerada.value?.xmlData) return
  const blob = new Blob([facturaGenerada.value.xmlData], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${facturaGenerada.value.numeroFactura}.xml`
  a.click()
  URL.revokeObjectURL(url)
  notification.success('XML descargado correctamente')
}

const formatearPrecioFactura = (precio: number | string): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(precio))
}

const cerrarDialogCheckout = () => {
  confirmCheckoutDialog.value = false
  pasoCheckout.value = 'resumen'
  facturaGenerada.value = null
  errorCheckout.value = null
  limpiarBusqueda()
}

const imprimirFactura = () => {
  if (process.client) {
    window.print()
  }
}

// ── Helpers antiguos (deprecated - no se usan) ──
const formatDate = (date: Date | string | undefined): string => {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })
}

const getEtapaValue = (reserva: Reserva): string => {
  if (reserva.checkoutReal) return 'completada'
  if (reserva.checkinReal) return 'checkin-realizado'
  return 'confirmada'
}

const getEtapaLabel = (reserva: Reserva): string => {
  const etapa = getEtapaValue(reserva)
  const labels: Record<string, string> = {
    confirmada: 'Confirmada',
    'checkin-realizado': 'Check-in Realizado',
    completada: 'Completada',
  }
  return labels[etapa] || 'N/A'
}

const getEtapaIcon = (reserva: Reserva): string => {
  const etapa = getEtapaValue(reserva)
  const icons: Record<string, string> = {
    confirmada: 'mdi-calendar-check-outline',
    'checkin-realizado': 'mdi-door-open-outline',
    completada: 'mdi-check-circle-outline',
  }
  return icons[etapa] || 'mdi-circle-outline'
}

const getEtapaColor = (reserva: Reserva): string => {
  const etapa = getEtapaValue(reserva)
  const colors: Record<string, string> = {
    confirmada: 'warning',
    'checkin-realizado': 'success',
    completada: 'info',
  }
  return colors[etapa] || 'default'
}
</script>

<style scoped>
.reservas-table {
  --v-border-color: transparent;
}

.invoice-card {
  background-color: #ffffff !important;
}

.invoice-header {
  background-color: #f5f5f5 !important;
  color: #1a1a1a !important;
}

.invoice-content {
  background-color: #ffffff !important;
  color: #1a1a1a !important;
}

.invoice-table :deep(table) {
  background-color: #ffffff !important;
}

.invoice-table :deep(thead tr) {
  background-color: #f5f5f5 !important;
}

.invoice-table :deep(th),
.invoice-table :deep(td) {
  color: #1a1a1a !important;
  padding: 8px !important;
  border: 1px solid #ddd !important;
}

@media print {
  /* Ocultar todo excepto la vista previa de factura */
  body > * {
    display: none !important;
  }

  /* Mostrar solo el card de factura */
  #factura-preview {
    display: block !important;
    position: static !important;
    box-shadow: none !important;
    border: none !important;
    background-color: #ffffff !important;
  }

  /* Estilos de impresión para el card de factura */
  .v-card {
    box-shadow: none !important;
    border: none !important;
    background-color: #ffffff !important;
    color: #1a1a1a !important;
  }

  /* Eliminar márgenes de la página */
  @page {
    margin: 0.5cm;
  }

  /* Asegurar que todo esté impreso */
  .v-card-text,
  .v-card-title,
  .v-card-actions {
    page-break-inside: avoid !important;
  }

  /* Estilos de la tabla */
  table {
    width: 100%;
    border-collapse: collapse;
    background-color: #ffffff !important;
  }

  thead {
    display: table-header-group !important;
    background-color: #f5f5f5 !important;
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }

  thead th {
    background-color: #f5f5f5 !important;
    color: #1a1a1a !important;
    border: 1px solid #ddd !important;
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }

  tbody tr {
    page-break-inside: avoid !important;
    background-color: #ffffff !important;
  }

  tbody td {
    color: #1a1a1a !important;
    border: 1px solid #ddd !important;
    background-color: #ffffff !important;
  }

  /* Colores de fondo en impresión */
  [style*="background-color"] {
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }

  /* Textos de colores explícitos en impresión */
  [style*="color"] {
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }

  /* Ocultar acciones en impresión */
  .v-card-actions {
    display: none !important;
  }

  /* Asegurar que el contenido es legible */
  * {
    color: #1a1a1a !important;
    background-color: #ffffff !important;
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }

  /* Re-mostrar solo el contenido de factura */
  #factura-preview * {
    display: block !important;
    color: #1a1a1a !important;
    background-color: transparent !important;
  }

  #factura-preview .v-card-text,
  #factura-preview .v-card-title {
    background-color: inherit !important;
  }

  #factura-preview .invoice-header {
    background-color: #f5f5f5 !important;
  }
}
</style>
