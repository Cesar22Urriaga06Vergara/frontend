<template>
  <div v-if="loading || !factura" class="pa-6">
    <v-progress-circular indeterminate color="primary" class="mx-auto" />
    <p class="text-center text-medium-emphasis mt-4">Cargando factura...</p>
  </div>

  <v-container fluid v-else class="py-6">
    <!-- Header con número y estado -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="card-header">
          <v-card-title class="d-flex align-center justify-space-between">
            <div>
              <p class="text-caption text-medium-emphasis mb-1">Número de Factura</p>
              <p class="text-h5 font-mono">{{ factura.numeroFactura }}</p>
            </div>
            <EstadoFacturaBadge
              :estado-actual="factura.estadoFactura"
              :show-transiciones="puedoModificar"
              @cambiar-estado="abrirDialogCambio"
            />
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-6">
            <v-row>
              <!-- Datos del cliente -->
              <v-col cols="12" md="6">
                <p class="text-caption font-weight-bold text-medium-emphasis mb-1">Cliente</p>
                <p class="text-body-1">{{ factura.nombreCliente }}</p>
                <p class="text-caption text-medium-emphasis">
                  {{ factura.cedulaCliente }} | {{ factura.emailCliente }}
                </p>
              </v-col>

              <!-- Fechas importantes -->
              <v-col cols="12" md="6">
                <div class="mb-4">
                  <p class="text-caption font-weight-bold text-medium-emphasis mb-1">Emisión</p>
                  <p class="text-body-2">
                    {{ formatFecha(factura.fechaEmision) }}
                  </p>
                </div>
                <div>
                  <p class="text-caption font-weight-bold text-medium-emphasis mb-1">Vencimiento</p>
                  <p class="text-body-2">
                    {{ formatFecha(factura.fechaVencimiento) }}
                  </p>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Desglose de impuestos -->
    <v-row class="mb-6">
      <v-col cols="12">
        <FacturaDesglose :factura="factura" />
      </v-col>
    </v-row>

    <!-- Detalles de productos/servicios -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center gap-2">
            <v-icon icon="mdi-table-box" />
            Detalle de Servicios
          </v-card-title>

          <v-divider />

          <div v-if="factura.detalles && factura.detalles.length > 0">
            <v-table>
              <thead>
                <tr>
                  <th class="text-left">Concepto</th>
                  <th class="text-center">Cantidad</th>
                  <th class="text-right">P.U.</th>
                  <th class="text-right">Subtotal</th>
                  <th class="text-right">INC</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="detalle in factura.detalles" :key="detalle.id">
                  <td>
                    <div>
                      <p class="font-weight-bold text-body-2">{{ detalle.descripcion }}</p>
                      <p class="text-caption text-medium-emphasis">
                        {{ detalle.tipoConcepto }}
                      </p>
                    </div>
                  </td>
                  <td class="text-center">{{ detalle.cantidad }}</td>
                  <td class="text-right">{{ formatCurrency(detalle.precioUnitario) }}</td>
                  <td class="text-right">{{ formatCurrency(detalle.subtotal) }}</td>
                  <td class="text-right">{{ formatCurrency(detalle.montoInc) }}</td>
                  <td class="text-right font-weight-bold">{{ formatCurrency(detalle.total) }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>

          <v-card-text v-else class="text-center py-12">
            <v-icon icon="mdi-table-off" size="large" class="text-medium-emphasis" />
            <p class="text-medium-emphasis mt-2">Sin detalles que mostrar</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Historial de cambios -->
    <v-row class="mb-6">
      <v-col cols="12">
        <HistorialCambios :id-factura="facturaId" />
      </v-col>
    </v-row>

    <!-- Acciones -->
    <v-row v-if="puedeEmitir || puedePagar || puedeAnular" class="mb-6">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center gap-2">
            <v-icon icon="mdi-lightning-bolt" />
            Acciones Rápidas
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-6">
            <v-row>
              <!-- Emitir -->
              <v-col v-if="puedeEmitir" cols="12" sm="6" md="3">
                <v-btn
                  color="success"
                  variant="flat"
                  block
                  prepend-icon="mdi-check-circle"
                  @click="() => abrirDialogCambio('EMITIDA')"
                >
                  Emitir
                </v-btn>
              </v-col>

              <!-- Marcar pagada -->
              <v-col v-if="puedePagar" cols="12" sm="6" md="3">
                <v-btn
                  color="info"
                  variant="flat"
                  block
                  prepend-icon="mdi-cash-check"
                  @click="() => abrirDialogCambio('PAGADA')"
                >
                  Marcar Pagada
                </v-btn>
              </v-col>

              <!-- Anular -->
              <v-col v-if="puedeAnular" cols="12" sm="6" md="3">
                <v-btn
                  color="error"
                  variant="flat"
                  block
                  prepend-icon="mdi-cancel"
                  @click="() => abrirDialogCambio('ANULADA')"
                >
                  Anular
                </v-btn>
              </v-col>

              <!-- Descargar -->
              <v-col cols="12" sm="6" md="3">
                <v-btn
                  color="primary"
                  variant="outlined"
                  block
                  prepend-icon="mdi-download"
                  @click="descargarPDF"
                >
                  Descargar
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog para cambiar estado -->
    <DialogCambiarEstado
      v-model="dialogAbierto"
      :factura-id="facturaId"
      :factura="factura"
      :estado-actual="factura.estadoFactura"
      :estado-nuevo="estadoAmbicioso"
      @confirmar="confirmarCambioEstado"
    />

    <!-- Snackbar para notificaciones -->
    <v-snackbar
      v-model="mostrarSnackbar"
      :timeout="3000"
      :color="tipoSnackbar"
    >
      {{ mensajeSnackbar }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { EstadoFactura, Factura } from '~/types/factura'
import { useRoute } from 'vue-router'
import { useFacturas } from '~/composables/useFacturas'
import { useAuthStore } from '~/stores/auth'
import { usePermissions } from '~/composables/usePermissions'
import EstadoFacturaBadge from '~/components/facturas/EstadoFacturaBadge.vue'
import FacturaDesglose from '~/components/facturas/FacturaDesglose.vue'
import HistorialCambios from '~/components/facturas/HistorialCambios.vue'
import DialogCambiarEstado from '~/components/facturas/DialogCambiarEstado.vue'

const route = useRoute()
const facturas = useFacturas()
const authStore = useAuthStore()
const permissions = usePermissions()

const facturaId = computed(() => parseInt(route.params.id as string) || 0)
const loading = ref(true)
const factura = ref<Factura | null>(null)
const dialogAbierto = ref(false)
const estadoAmbicioso = ref<EstadoFactura>('BORRADOR')
const mostrarSnackbar = ref(false)
const mensajeSnackbar = ref('')
const tipoSnackbar = ref('')

/**
 * Si puede modificar la factura (es admin/superadmin)
 */
const puedoModificar = computed(() => {
  const rol = authStore.userRole
  return rol === 'admin' || rol === 'superadmin'
})

/**
 * Si puede emitir desde estado actual
 * FASE 7: Usa validación de permisos + transición de estado
 */
const puedeEmitir = computed(() => {
  if (!factura.value) return false
  return permissions.puedeEmitirFactura(factura.value.estadoFactura)
})

/**
 * Si puede pagarse desde estado actual
 * FASE 7: Usa validación de permisos + transición de estado
 */
const puedePagar = computed(() => {
  if (!factura.value) return false
  return permissions.puedePagarFactura(factura.value.estadoFactura)
})

/**
 * Si puede anuler desde estado actual
 * FASE 7: Usa validación de permisos + transición de estado más restrictiva
 */
const puedeAnular = computed(() => {
  if (!factura.value) return false
  return permissions.puedeAnularFactura(factura.value.estadoFactura)
})

/**
 * Formatear fecha
 */
const formatFecha = (fecha: string | undefined): string => {
  if (!fecha) return 'N/A'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Formatear moneda
 */
const formatCurrency = (value: number | undefined): string => {
  if (!value) return '$0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

/**
 * Abrir dialog para cambiar estado
 */
const abrirDialogCambio = (nuevoEstado: EstadoFactura) => {
  estadoAmbicioso.value = nuevoEstado
  dialogAbierto.value = true
}

/**
 * Confirmar cambio de estado desde dialog
 */
const confirmarCambioEstado = async (data: any) => {
  try {
    let resultado

    switch (data.estadoNuevo) {
      case 'EMITIDA':
        resultado = await facturas.emitir(data.idFactura)
        break
      case 'ANULADA':
        resultado = await facturas.anular(data.idFactura, data.motivo)
        break
      case 'PAGADA':
        resultado = await facturas.marcarComoPagada(
          data.idFactura,
          data.fechaPago
        )
        break
      default:
        throw new Error('Acción no permitida')
    }

    if (resultado) {
      factura.value = resultado
      mostrarNotificacion('Cambio realizado correctamente', 'success')
    }
  } catch (err: any) {
    mostrarNotificacion(
      err.message || 'Error al cambiar estado',
      'error'
    )
  }
}

/**
 * Mostrar snackbar
 */
const mostrarNotificacion = (mensaje: string, tipo: string = 'info') => {
  mensajeSnackbar.value = mensaje
  tipoSnackbar.value = tipo
  mostrarSnackbar.value = true
}

/**
 * Descargar PDF (placeholder)
 */
const descargarPDF = () => {
  mostrarNotificacion('Descarga en desarrollo...', 'info')
  // TODO: Implementar descarga de PDF
}

/**
 * Cargar factura al montar
 */
onMounted(async () => {
  loading.value = true
  try {
    await facturas.obtenerPorId(facturaId.value)
    factura.value = facturas.facturaActual.value
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

:deep(.card-header .v-card__title) {
  color: white;
}

:deep(.card-header .v-card__title .text-caption) {
  color: rgba(255, 255, 255, 0.7);
}

.text-mono {
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

:deep(.v-table__wrapper tbody tr:hover) {
  background-color: rgba(33, 150, 243, 0.05);
}
</style>
