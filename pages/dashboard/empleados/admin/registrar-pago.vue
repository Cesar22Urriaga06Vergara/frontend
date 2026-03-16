<template>
  <div class="pa-6">
    <h1 class="text-h5 font-weight-bold mb-6">Registrar Pago de Factura</h1>

    <!-- Búsqueda de Factura -->
    <v-card class="card-glow mb-6 pa-6">
      <div class="text-subtitle-2 font-weight-bold mb-4">Buscar Factura</div>
      <v-row>
        <v-col cols="12" sm="8">
          <v-text-field
            v-model="busquedaFactura"
            label="Número de factura o ID de reserva"
            placeholder="FAC-2026-00001"
            prepend-inner-icon="mdi-magnify"
            clearable
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-btn color="primary" block @click="buscarFactura" :loading="buscando">
            Buscar
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Resumen de Factura -->
    <v-card v-if="factura" class="card-glow mb-6 pa-6 bg-primary-light">
      <v-row class="mb-4">
        <v-col cols="12" sm="6">
          <p class="text-caption text-medium-emphasis">Número</p>
          <p class="text-h6 font-weight-bold">{{ factura.numeroFactura }}</p>
        </v-col>
        <v-col cols="12" sm="6">
          <p class="text-caption text-medium-emphasis">Cliente</p>
          <p class="text-h6 font-weight-bold">{{ factura.nombreCliente }}</p>
        </v-col>
        <v-col cols="12" sm="6">
          <p class="text-caption text-medium-emphasis">Total Factura</p>
          <p class="text-h6 font-weight-bold" style="color: #2e7d32">${{ formatoPrecio(factura.total) }}</p>
        </v-col>
        <v-col cols="12" sm="6">
          <p class="text-caption text-medium-emphasis">Total Pagado</p>
          <p class="text-h6 font-weight-bold">{{ formatoPrecio(totalPagado) }}</p>
        </v-col>
        <v-col cols="12">
          <v-divider class="my-2" />
          <p class="text-h5 font-weight-bold">Saldo Pendiente: <span style="color: #d32f2f">${{ formatoPrecio(saldoPendiente) }}</span></p>
        </v-col>
      </v-row>
    </v-card>

    <!-- Formulario de Pago -->
    <v-card v-if="factura" class="card-glow mb-6 pa-6">
      <div class="text-subtitle-2 font-weight-bold mb-4">Registrar Pago</div>
      <v-row>
        <v-col cols="12" sm="6">
          <v-select
            v-model="medioPagoSeleccionado"
            :items="mediosPago"
            label="Medio de Pago *"
            item-title="nombre"
            item-value="id"
            @update:modelValue="onMedioPagoChange"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="montoPago"
            label="Monto *"
            type="number"
            placeholder="0"
            @input="validarMonto"
          />
        </v-col>
        <v-col v-if="medioPagoActual?.requiereReferencia" cols="12" sm="6">
          <v-text-field
            v-model="referenciaPago"
            label="Referencia de Pago (Obligatorio) *"
            placeholder="Número de aprobación, transacción, etc."
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-textarea
            v-model="observacionesPago"
            label="Observaciones (opcional)"
            rows="2"
            maxlength="300"
            counter
          />
        </v-col>
        <v-col cols="12">
          <v-btn
            color="success"
            block
            size="large"
            :disabled="!puedoRegistrarPago"
            :loading="registrando"
            @click="registrarPago"
          >
            Registrar Pago
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Historial de Pagos -->
    <v-card v-if="factura && pagos.length" class="card-glow pa-6">
      <div class="text-subtitle-2 font-weight-bold mb-4">Pagos Registrados</div>
      <v-timeline>
        <v-timeline-item
          v-for="pago in pagos"
          :key="pago.id"
          :dot-color="pago.estado === 'completado' ? 'success' : 'error'"
          size="small"
        >
          <div class="mb-2">
            <strong>{{ pago.medioPago.nombre }}</strong> - ${{ formatoPrecio(pago.monto) }}
            <v-chip
              :color="pago.estado === 'completado' ? 'success' : 'error'"
              variant="tonal"
              size="x-small"
              class="ml-2"
            >
              {{ pago.estado }}
            </v-chip>
          </div>
          <p class="text-caption text-medium-emphasis mb-1">
            {{ formatoFecha(pago.fechaPago) }}
          </p>
          <p v-if="pago.referenciaPago" class="text-caption">
            Ref: {{ pago.referenciaPago }}
          </p>
        </v-timeline-item>
      </v-timeline>
    </v-card>
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

useHead({ title: 'Registrar Pago' })

const api = useApi()
const { success, error } = useNotification()

// State
const busquedaFactura = ref('')
const factura = ref<any>(null)
const pagos = ref<any[]>([])
const buscando = ref(false)
const registrando = ref(false)
const medioPagoSeleccionado = ref<number>()
const montoPago = ref<number>(0)
const referenciaPago = ref('')
const observacionesPago = ref('')
const mediosPago = ref<any[]>([])

// Computed
const totalPagado = computed(() => {
  return pagos.value
    .filter(p => p.estado === 'completado')
    .reduce((sum, p) => sum + Number(p.monto), 0)
})

const saldoPendiente = computed(() => {
  return factura.value ? Number(factura.value.total) - totalPagado.value : 0
})

const medioPagoActual = computed(() => {
  return mediosPago.value.find(m => m.id === medioPagoSeleccionado.value)
})

const puedoRegistrarPago = computed(() => {
  const validaciones = [
    factura.value,
    medioPagoSeleccionado.value,
    montoPago.value > 0,
    saldoPendiente.value > 0,
  ]

  if (medioPagoActual.value?.requiereReferencia) {
    validaciones.push(referenciaPago.value.trim().length > 0)
  }

  return validaciones.every(v => v)
})

// Methods
const formatoPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-CO', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  }).format(precio)
}

const formatoFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-CO')
}

const buscarFactura = async () => {
  if (!busquedaFactura.value.trim()) {
    error('Ingresa un número de factura o ID de reserva')
    return
  }

  buscando.value = true
  try {
    // Buscar por número o por reserva
    let respuesta
    if (busquedaFactura.value.startsWith('FAC')) {
      respuesta = await api(`/facturas`)
      factura.value = respuesta.find((f: any) => f.numeroFactura === busquedaFactura.value)
    } else {
      respuesta = await api(`/facturas/reserva/${busquedaFactura.value}`)
      factura.value = respuesta
    }

    if (!factura.value) {
      error('Factura no encontrada')
      return
    }

    // Cargar pagos existentes
    pagos.value = await api(`/pagos/factura/${factura.value.id}`)
    success('Factura cargada exitosamente')
  } catch (err: any) {
    error(err.message || 'Error al buscar factura')
    factura.value = null
  } finally {
    buscando.value = false
  }
}

const onMedioPagoChange = () => {
  referenciaPago.value = ''
}

const validarMonto = () => {
  if (montoPago.value > saldoPendiente.value) {
    error(`El monto no puede exceder el saldo pendiente: $${formatoPrecio(saldoPendiente.value)}`)
    montoPago.value = saldoPendiente.value
  }
}

const registrarPago = async () => {
  if (!puedoRegistrarPago.value) {
    error('Por favor completa todos los campos requeridos')
    return
  }

  registrando.value = true
  try {
    const dto = {
      idFactura: factura.value.id,
      idMedioPago: medioPagoSeleccionado.value,
      monto: montoPago.value,
      referenciaPago: referenciaPago.value || undefined,
      observaciones: observacionesPago.value || undefined,
    }

    await api('/pagos', { method: 'POST', body: dto })

    success('Pago registrado exitosamente')

    // Recargar pagos
    pagos.value = await api(`/pagos/factura/${factura.value.id}`)

    // Limpiar formulario
    montoPago.value = 0
    referenciaPago.value = ''
    observacionesPago.value = ''
    medioPagoSeleccionado.value = undefined
  } catch (err: any) {
    error(err.message || 'Error al registrar pago')
  } finally {
    registrando.value = false
  }
}

onMounted(async () => {
  try {
    mediosPago.value = await api('/medios-pago')
  } catch (err: any) {
    error('Error al cargar medios de pago')
  }
})
</script>

<style scoped>
.bg-primary-light {
  background-color: rgba(63, 81, 181, 0.05);
}

.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
</style>
