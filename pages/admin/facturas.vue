<template>
  <div class="pa-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Gestión de Facturas</h1>
        <p class="text-body-2 text-medium-emphasis">Control de facturas electrónicas del hotel</p>
      </div>
      <v-btn color="primary" :loading="loading" prepend-icon="mdi-refresh" @click="cargarFacturas">
        Actualizar
      </v-btn>
    </div>

    <!-- Filtros -->
    <v-card class="card-glow mb-6 pa-6">
      <div class="text-subtitle-2 font-weight-bold mb-4">Filtros</div>
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filtroEstado"
            :items="estadosDisponibles"
            label="Estado"
            clearable
            item-title="text"
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
        <v-col cols="12" sm="6" md="3">
          <v-btn color="primary" block @click="aplicarFiltros">Buscar</v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Tabla de Facturas -->
    <v-card class="card-glow">
      <v-table>
        <thead>
          <tr>
            <th class="text-left">Número</th>
            <th class="text-left">Cliente</th>
            <th class="text-left">Cédula</th>
            <th class="text-right">Total</th>
            <th class="text-left">Estado</th>
            <th class="text-left">Fecha</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="factura in facturasFiltrradas" :key="factura.id">
            <td class="font-weight-bold">{{ factura.numeroFactura }}</td>
            <td>{{ factura.nombreCliente }}</td>
            <td>{{ factura.cedulaCliente }}</td>
            <td class="text-right">
              <span class="font-weight-bold">${{ formatoPrecio(factura.total) }}</span>
            </td>
            <td>
              <v-chip
                :color="getEstadoColor(factura.estado)"
                variant="tonal"
                size="small"
              >
                {{ factura.estado }}
              </v-chip>
            </td>
            <td>{{ formatoFecha(factura.createdAt) }}</td>
            <td class="text-center">
              <v-btn icon="mdi-eye" size="x-small" variant="text" @click="abrirDetalle(factura)" />
              <v-menu v-if="['pendiente', 'pagada'].includes(factura.estado)">
                <template #activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" size="x-small" variant="text" v-bind="props" />
                </template>
                <v-list>
                  <v-list-item @click="emitirFactura(factura.id)">
                    <template #prepend>
                      <v-icon icon="mdi-send" />
                    </template>
                    <v-list-item-title>Emitir</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="abrirDialogoAnular(factura)">
                    <template #prepend>
                      <v-icon icon="mdi-close" color="error" />
                    </template>
                    <v-list-item-title>Anular</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Dialog Detalle -->
    <v-dialog v-model="showDetalle" max-width="800">
      <v-card v-if="facturaSeleccionada">
        <v-card-title>Factura {{ facturaSeleccionada.numeroFactura }}</v-card-title>
        <v-card-text class="pa-6">
          <v-divider class="mb-4" />
          
          <!-- Datos Generales -->
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
                <v-chip :color="getEstadoColor(facturaSeleccionada.estado)" variant="tonal" size="small">
                  {{ facturaSeleccionada.estado }}
                </v-chip>
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-4" />

          <!-- Detalles de Factura -->
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

          <!-- Totales -->
          <div class="mb-4">
            <v-row class="text-right">
              <v-col cols="12">
                <p class="mb-2">Subtotal: <span class="font-weight-bold">${{ formatoPrecio(facturaSeleccionada.subtotal) }}</span></p>
                <p class="mb-2">IVA ({{ facturaSeleccionada.porcentajeIva }}%): <span class="font-weight-bold">${{ formatoPrecio(facturaSeleccionada.montoIva) }}</span></p>
                <p class="text-h6 font-weight-bold">Total: ${{ formatoPrecio(facturaSeleccionada.total) }}</p>
              </v-col>
            </v-row>
          </div>

          <!-- Pagos -->
          <div v-if="facturaSeleccionada.pagos?.length">
            <h3 class="text-subtitle-1 font-weight-bold mb-2">Pagos Registrados</h3>
            <v-list>
              <v-list-item v-for="pago in facturaSeleccionada.pagos" :key="pago.id">
                <template #prepend>
                  <v-icon icon="mdi-check-circle" color="success" />
                </template>
                <v-list-item-title>{{ pago.medioPago.nombre }} - ${{ formatoPrecio(pago.monto) }}</v-list-item-title>
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

    <!-- Dialog Anular -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: ['admin', 'superadmin'],
})

useHead({ title: 'Gestión de Facturas' })

const api = useApi()
const { success, error } = useNotification()

// State
const facturas = ref<any[]>([])
const loading = ref(false)
const showDetalle = ref(false)
const showAnular = ref(false)
const facturaSeleccionada = ref<any>(null)
const filtroEstado = ref<string>()
const busquedaNumero = ref('')
const busquedaCliente = ref('')
const motivoAnulacion = ref('')
const anulando = ref(false)

const estadosDisponibles = [
  { text: 'Pendiente', value: 'pendiente' },
  { text: 'Emitida', value: 'emitida' },
  { text: 'Pagada', value: 'pagada' },
  { text: 'Anulada', value: 'anulada' },
]

// Computed
const facturasFiltrradas = computed(() => {
  return facturas.value.filter(f => {
    let matches = true
    if (filtroEstado.value) matches = matches && f.estado === filtroEstado.value
    if (busquedaNumero.value) matches = matches && f.numeroFactura.includes(busquedaNumero.value.toUpperCase())
    if (busquedaCliente.value) matches = matches && f.nombreCliente.toLowerCase().includes(busquedaCliente.value.toLowerCase())
    return matches
  })
})

// Methods
const formatoPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(precio)
}

const formatoFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-CO')
}

const getEstadoColor = (estado: string): string => {
  const colores: Record<string, string> = {
    pendiente: 'warning',
    emitida: 'info',
    pagada: 'success',
    anulada: 'error',
  }
  return colores[estado] || 'grey'
}

const cargarFacturas = async () => {
  loading.value = true
  try {
    facturas.value = await api.get(`/facturas`)
  } catch (err: any) {
    error(err.message || 'Error al cargar facturas')
  } finally {
    loading.value = false
  }
}

const aplicarFiltros = () => {
  // El computed ya filtra automáticamente
}

const abrirDetalle = (factura: any) => {
  facturaSeleccionada.value = factura
  showDetalle.value = true
}

const emitirFactura = async (id: number) => {
  try {
    await api.patch(`/facturas/${id}/emitir`)
    success('Factura emitida exitosamente')
    cargarFacturas()
  } catch (err: any) {
    error(err.message || 'Error al emitir factura')
  }
}

const abrirDialogoAnular = (factura: any) => {
  facturaSeleccionada.value = factura
  motivoAnulacion.value = ''
  showAnular.value = true
}

const confirmarAnular = async () => {
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
    cargarFacturas()
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

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card-glow:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
