<template>
  <div class="pa-6">
    <PageHeader title="Mis Facturas" subtitle="Consulta el historial de tus facturas">
      <template #status>
        <StatusBadge :status="viewState.status.value" />
      </template>
      <template #actions>
        <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="cargando" @click="cargarFacturas">
          Actualizar
        </v-btn>
      </template>
    </PageHeader>

    <SectionCard v-if="viewState.isError.value" :padded="false" class="mb-6">
      <EmptyState
        icon="mdi-alert-circle-outline"
        title="No fue posible cargar facturas"
        :description="errorMessage || 'Error inesperado consultando facturas'"
        action-label="Reintentar"
        @action="cargarFacturas"
      />
    </SectionCard>

    <!-- Lista de Facturas -->
    <v-row v-if="!viewState.isError.value" class="ga-4">
      <v-col v-for="factura in facturas" :key="factura.id" cols="12" md="6" lg="4">
        <v-card class="card-glow h-100 d-flex flex-column" :class="{ 'border-error': getEstadoCanonico(factura) === 'ANULADA' }">
          <!-- Header -->
          <div class="pa-4 pb-0">
            <div class="d-flex justify-space-between align-center mb-2">
              <p class="text-caption font-weight-bold">{{ factura.numeroFactura }}</p>
              <v-chip :color="getEstadoColor(getEstadoCanonico(factura))" variant="tonal" size="x-small">
                {{ getEstadoCanonico(factura) }}
              </v-chip>
            </div>
            <h3 class="text-subtitle-2 font-weight-bold">{{ formatoFecha(factura.createdAt) }}</h3>
          </div>

          <!-- Contenido -->
          <v-card-text class="flex-grow-1 py-3">
            <div class="mb-3">
              <p class="text-caption text-medium-emphasis">Total</p>
              <p class="text-h6 font-weight-bold text-success">${{ formatoPrecio(factura.total) }}</p>
            </div>

            <v-divider class="my-3" />

            <div class="mb-3">
              <p class="text-caption text-medium-emphasis mb-1">Detalles ({{ factura.detalles?.length || 0 }})</p>
              <div class="text-caption">
                <div v-for="det in (factura.detalles || []).slice(0, 2)" :key="det.id" class="mb-1">
                  • {{ det.tipoConcepto }}
                </div>
                <div v-if="(factura.detalles?.length || 0) > 2" class="text-primary">
                  +{{ (factura.detalles?.length || 0) - 2 }} más
                </div>
              </div>
            </div>

            <!-- Estado de Pago -->
            <v-divider class="my-3" />
            <div>
              <p class="text-caption text-medium-emphasis mb-1">Estado de Pago</p>
              <v-linear-progress
                :value="(totalPagado(factura) / Number(factura.total)) * 100"
                :color="totalPagado(factura) >= Number(factura.total) ? 'success' : 'info'"
                class="mb-2"
              />
              <p class="text-caption">
                Pagado: ${{ formatoPrecio(totalPagado(factura)) }} / ${{ formatoPrecio(factura.total) }}
              </p>
            </div>
          </v-card-text>

          <!-- Acciones -->
          <v-card-actions class="pa-3 pt-0">
            <v-btn size="small" variant="text" @click="abrirDetalle(factura)">
              <v-icon start icon="mdi-eye" />
              Ver Detalle
            </v-btn>
            <v-spacer />
            <v-btn size="small" icon="mdi-download" variant="text" @click="descargarFactura(factura)" />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Sin Facturas -->
    <SectionCard v-if="viewState.isEmpty.value" :padded="false" class="mb-6">
      <EmptyState
        icon="mdi-file-document-outline"
        title="No tienes facturas disponibles"
        description="Cuando el hotel emita facturas de tus consumos, aparecerán aquí."
      />
    </SectionCard>

    <!-- Dialog Detalle -->
    <v-dialog v-model="showDetalle" max-width="700">
      <v-card v-if="facturaSeleccionada">
        <v-card-title>{{ facturaSeleccionada.numeroFactura }}</v-card-title>
        <v-card-text class="pa-6">
          <!-- Encabezado -->
          <v-row class="mb-4">
            <v-col cols="6">
              <p class="text-caption text-medium-emphasis">Fecha</p>
              <p class="font-weight-bold">{{ formatoFecha(facturaSeleccionada.createdAt) }}</p>
            </v-col>
            <v-col cols="6">
              <p class="text-caption text-medium-emphasis">Estado</p>
              <v-chip :color="getEstadoColor(getEstadoCanonico(facturaSeleccionada))" variant="tonal" size="small">
                {{ getEstadoCanonico(facturaSeleccionada) }}
              </v-chip>
            </v-col>
          </v-row>

          <!-- Detalles de Factura -->
          <div class="mb-4">
            <h3 class="text-subtitle-2 font-weight-bold mb-3">Detalles</h3>
            <v-table>
              <thead>
                <tr>
                  <th class="text-left">Concepto</th>
                  <th class="text-right">Cantidad</th>
                  <th class="text-right">Precio</th>
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

          <!-- Totales -->
          <div class="text-right mb-4">
            <p class="mb-2">Subtotal: <span class="font-weight-bold">${{ formatoPrecio(facturaSeleccionada.subtotal) }}</span></p>
            <p class="mb-2">IVA: <span class="font-weight-bold">${{ formatoPrecio(facturaSeleccionada.montoIva) }}</span></p>
            <p class="text-h6 font-weight-bold text-success">Total: ${{ formatoPrecio(facturaSeleccionada.total) }}</p>
          </div>

          <!-- Pagos -->
          <v-divider class="my-4" />
          <div>
            <h3 class="text-subtitle-2 font-weight-bold mb-3">Pagos Registrados</h3>
            <div v-if="facturaSeleccionada.pagos?.length">
              <v-list>
                <v-list-item v-for="pago in facturaSeleccionada.pagos" :key="pago.id">
                  <template #prepend>
                    <v-icon icon="mdi-check-circle" color="success" />
                  </template>
                  <v-list-item-title>{{ pago.metodoPago || 'Medio de pago' }}</v-list-item-title>
                  <v-list-item-subtitle>${{ formatoPrecio(pago.monto) }} - {{ formatoFecha(pago.fechaPago) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>
            <p v-else class="text-caption text-medium-emphasis">No hay pagos registrados</p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" @click="showDetalle = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'
import { useNotification } from '~/composables/useNotification'
import { useViewState } from '~/composables/useViewState'
import { getFacturaEstadoCanonico, normalizeFactura } from '~/utils/entityAdapters'
import { getErrorMessage } from '~/utils/http'
import { UserRole } from '~/types/auth'
import type { Factura } from '~/types/factura'
import PageHeader from '~/components/shared/PageHeader.vue'
import StatusBadge from '~/components/shared/StatusBadge.vue'
import EmptyState from '~/components/shared/EmptyState.vue'
import SectionCard from '~/components/shared/SectionCard.vue'

definePageMeta({
  layout: 'cliente',
  middleware: ['auth', 'role'],
  roles: [UserRole.CLIENTE],
})

useHead({ title: 'Mis Facturas' })

const api = useApi()
const authStore = useAuthStore()
const notification = useNotification()

// State
const facturas = ref<Factura[]>([])
const cargando = ref(true)
const showDetalle = ref(false)
const facturaSeleccionada = ref<Factura | null>(null)
const errorMessage = ref<string | null>(null)
const hasData = computed(() => facturas.value.length > 0)
const viewState = useViewState(cargando, hasData, errorMessage)

// Methods
const formatoPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio)
}

const formatoFecha = (fecha?: string) => {
  if (!fecha) return 'Sin fecha'
  return new Date(fecha).toLocaleDateString('es-CO')
}

const getEstadoColor = (estado: string): string => {
  const colores: Record<string, string> = {
    BORRADOR: 'warning',
    EDITABLE: 'warning',
    EMITIDA: 'info',
    PAGADA: 'success',
    ANULADA: 'error',
  }
  return colores[estado] || 'grey'
}

const getEstadoCanonico = (factura: Factura | null) => getFacturaEstadoCanonico(factura)

const totalPagado = (factura: any): number => {
  return factura.pagos?.reduce((sum: number, p: any) => sum + Number(p.monto), 0) || 0
}

const cargarFacturas = async (): Promise<void> => {
  cargando.value = true
  errorMessage.value = null
  try {
    if (authStore.user?.idCliente) {
      const data = await api.get<Factura[]>(`/facturas/cliente/${authStore.user.idCliente}`)
      facturas.value = (data || []).map((factura) => normalizeFactura(factura))
    } else {
      facturas.value = []
    }
  } catch (err: any) {
    errorMessage.value = getErrorMessage(err, 'Error al cargar facturas')
    notification.error(errorMessage.value)
  } finally {
    cargando.value = false
  }
}

const abrirDetalle = (factura: Factura) => {
  facturaSeleccionada.value = factura
  showDetalle.value = true
}

const descargarFactura = (factura: Factura) => {
  notification.info(`Descarga de ${factura.numeroFactura} pendiente de implementación`)
}

onMounted(() => {
  cargarFacturas()
})
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card-glow:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.border-error {
  border-left: 4px solid #d32f2f;
}
</style>
