<template>
  <div class="pa-6">
    <h1 class="text-h5 font-weight-bold mb-2">Factura de Check-out</h1>
    <p class="text-body-2 text-medium-emphasis mb-6">Resumen de la factura generada al completar la reserva</p>

    <v-row>
      <!-- Factura Summary -->
      <v-col cols="12" md="8">
        <v-card class="card-glow mb-4">
          <v-card-title v-if="factura">{{ factura.numeroFactura }}</v-card-title>
          <v-card-text class="pa-6">
            <!-- Cliente Info -->
            <div class="mb-6">
              <h3 class="text-subtitle-1 font-weight-bold mb-3">Datos del Cliente</h3>
              <v-row>
                <v-col cols="6">
                  <p class="text-caption text-medium-emphasis">Nombre</p>
                  <p class="font-weight-bold">{{ factura?.nombreCliente }}</p>
                </v-col>
                <v-col cols="6">
                  <p class="text-caption text-medium-emphasis">Cédula</p>
                  <p class="font-weight-bold">{{ factura?.cedulaCliente }}</p>
                </v-col>
              </v-row>
            </div>

            <!-- Detalles -->
            <div class="mb-6">
              <h3 class="text-subtitle-1 font-weight-bold mb-3">Detalles</h3>
              <v-table class="transparent-table">
                <thead>
                  <tr>
                    <th class="text-left">Concepto</th>
                    <th class="text-right">Cantidad</th>
                    <th class="text-right">Precio Unit.</th>
                    <th class="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="detalle in factura?.detalles" :key="detalle.id">
                    <td>{{ detalle.descripcion }}</td>
                    <td class="text-right">{{ detalle.cantidad }}</td>
                    <td class="text-right">${{ formatoPrecio(detalle.precioUnitario) }}</td>
                    <td class="text-right font-weight-bold">${{ formatoPrecio(detalle.total) }}</td>
                  </tr>
                </tbody>
              </v-table>
            </div>

            <!-- Totales -->
            <v-divider class="my-4" />
            <div class="text-right mb-4">
              <p class="mb-2">Subtotal: <span class="font-weight-bold">${{ formatoPrecio(factura?.subtotal || 0) }}</span></p>
              <p class="mb-2">IVA ({{ factura?.porcentajeIva }}%): <span class="font-weight-bold">${{ formatoPrecio(factura?.montoIva || 0) }}</span></p>
              <p class="text-h5 font-weight-bold text-success">Total: ${{ formatoPrecio(factura?.total || 0) }}</p>
            </div>
          </v-card-text>
          <v-card-actions class="pa-6">
            <v-btn color="primary" block prepend-icon="mdi-printer" @click="imprimirFactura">
              Imprimir Factura
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Registro de Pagos -->
      <v-col cols="12" md="4">
        <v-card class="card-glow">
          <v-card-title>Registrar Pago</v-card-title>
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12">
                <p class="text-caption text-medium-emphasis mb-2">Saldo Pendiente</p>
                <p class="text-h6 font-weight-bold text-error">${{ formatoPrecio(saldoPendiente) }}</p>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <v-form>
              <v-select
                v-model="medioPagoId"
                :items="mediosPago"
                label="Medio de Pago"
                item-title="nombre"
                item-value="id"
                class="mb-4"
              />
              <v-text-field
                v-model.number="montoPago"
                label="Monto"
                type="number"
                placeholder="0"
                prepend-icon="mdi-currency-usd"
                class="mb-4"
              />
              <v-text-field
                v-if="medioPagoReqRef"
                v-model="referenciaPago"
                label="Referencia (obligatorio)"
                placeholder="Número de aprobación..."
                class="mb-4"
              />
              <v-btn
                color="success"
                block
                :disabled="!puedoRegistrar"
                :loading="registrando"
                @click="registrarPago"
              >
                Registrar Pago
              </v-btn>
            </v-form>

            <v-divider class="my-4" />

            <h4 class="font-weight-bold mb-2">Pagos Existentes:</h4>
            <div v-if="factura?.pagos?.length">
              <v-list dense>
                <v-list-item v-for="pago in factura.pagos" :key="pago.id">
                  <template #prepend>
                    <v-icon icon="mdi-check-circle" color="success" />
                  </template>
                  <v-list-item-title>{{ pago.medioPago.nombre }}</v-list-item-title>
                  <v-list-item-subtitle>${{ formatoPrecio(pago.monto) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>
            <p v-else class="text-caption text-medium-emphasis">No hay pagos registrados</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: ['recepcionista', 'admin', 'superadmin'],
})

useHead({ title: 'Factura Check-out' })

const route = useRoute()
const api = useApi()
const { success, error } = useNotification()

// State
const factura = ref<any>(null)
const mediosPago = ref<any[]>([])
const medioPagoId = ref<number>()
const montoPago = ref<number>(0)
const referenciaPago = ref('')
const registrando = ref(false)

// Computed
const medioPagoActual = computed(() => {
  return mediosPago.value.find(m => m.id === medioPagoId.value)
})

const medioPagoReqRef = computed(() => {
  return medioPagoActual.value?.requiereReferencia || false
})

const totalPagado = computed(() => {
  return factura.value?.pagos?.reduce((sum: number, p: any) => sum + Number(p.monto), 0) || 0
})

const saldoPendiente = computed(() => {
  return (factura.value?.total || 0) - totalPagado.value
})

const puedoRegistrar = computed(() => {
  return (
    medioPagoId.value &&
    montoPago.value > 0 &&
    (!medioPagoReqRef.value || referenciaPago.value.trim())
  )
})

// Methods
const formatoPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio)
}

const cargarFactura = async () => {
  try {
    const idReserva = route.query.idReserva || route.params.idReserva
    factura.value = await api.get(`/facturas/reserva/${idReserva}`)
  } catch (err: any) {
    error('No se encontró la factura')
  }
}

const cargarMediosPago = async () => {
  try {
    mediosPago.value = await api.get('/medios-pago')
  } catch (err: any) {
    error('Error al cargar medios de pago')
  }
}

const registrarPago = async () => {
  if (!puedoRegistrar.value) return

  registrando.value = true
  try {
    await api.post('/pagos', {
      idFactura: factura.value.id,
      idMedioPago: medioPagoId.value,
      monto: montoPago.value,
      referenciaPago: referenciaPago.value || undefined,
    })

    success('Pago registrado exitosamente')
    montoPago.value = 0
    referenciaPago.value = ''
    medioPagoId.value = undefined

    // Recargar factura
    cargarFactura()
  } catch (err: any) {
    error(err.message || 'Error al registrar pago')
  } finally {
    registrando.value = false
  }
}

const imprimirFactura = () => {
  window.print()
}

onMounted(() => {
  cargarFactura()
  cargarMediosPago()
})
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.transparent-table :deep(tbody) {
  background-color: transparent;
}
</style>
