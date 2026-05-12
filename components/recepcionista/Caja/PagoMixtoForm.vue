<template>
  <div class="pago-mixto-form">
    <v-alert type="info" variant="tonal" density="compact" class="mb-4">
      Total a cobrar: <strong>{{ formatMoney(totalACobrar) }}</strong>
    </v-alert>

    <v-table density="compact" class="mb-3">
      <tbody>
        <tr>
          <td>Aplicado</td>
          <td class="text-right font-weight-bold">{{ formatMoney(totalAplicado) }}</td>
        </tr>
        <tr>
          <td>Saldo</td>
          <td class="text-right font-weight-bold" :class="saldoRestante === 0 ? 'text-success' : 'text-warning'">
            {{ formatMoney(saldoRestante) }}
          </td>
        </tr>
        <tr v-if="cambioTotal > 0">
          <td>Cambio total</td>
          <td class="text-right font-weight-bold text-success">{{ formatMoney(cambioTotal) }}</td>
        </tr>
      </tbody>
    </v-table>

    <v-alert
      v-if="errorLineas"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-3"
    >
      {{ errorLineas }}
    </v-alert>

    <div class="payment-lines">
      <div
        v-for="(linea, index) in lineas"
        :key="linea.uid"
        class="payment-line"
      >
        <div class="payment-line__header">
          <span class="text-subtitle-2">Linea {{ index + 1 }}</span>
          <v-btn
            icon="mdi-delete-outline"
            size="x-small"
            variant="text"
            color="error"
            :disabled="lineas.length <= 2"
            @click="eliminarLinea(index)"
          />
        </div>

        <v-row dense>
          <v-col cols="12" sm="5">
            <v-select
              v-model.number="linea.idMedioPago"
              :items="mediosPago"
              item-title="label"
              item-value="id"
              label="Medio"
              variant="outlined"
              density="compact"
              :loading="loadingMedios"
              @update:model-value="normalizarLinea(linea)"
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-text-field
              v-model.number="linea.montoCobrar"
              type="number"
              min="0"
              step="0.01"
              label="Aplicar"
              prefix="$"
              variant="outlined"
              density="compact"
              @update:model-value="normalizarLinea(linea)"
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-if="esEfectivo(linea.idMedioPago)"
              v-model.number="linea.montoRecibido"
              type="number"
              min="0"
              step="0.01"
              label="Recibido"
              prefix="$"
              variant="outlined"
              density="compact"
            />
            <v-text-field
              v-else
              v-model="linea.referenciaPago"
              label="Referencia"
              variant="outlined"
              density="compact"
              :placeholder="medioRequiereReferencia(linea.idMedioPago) ? 'Obligatoria' : 'Opcional'"
            />
          </v-col>
        </v-row>
      </div>
    </div>

    <div class="d-flex flex-wrap ga-2 mt-4">
      <v-btn
        variant="tonal"
        size="small"
        prepend-icon="mdi-plus"
        @click="agregarLinea"
      >
        Agregar linea
      </v-btn>
      <v-btn
        variant="tonal"
        size="small"
        prepend-icon="mdi-auto-fix"
        @click="ajustarSaldo"
      >
        Ajustar saldo
      </v-btn>
      <v-spacer />
      <v-btn
        color="success"
        variant="tonal"
        :loading="loading"
        :disabled="!puedeConfirmar"
        @click="confirmar"
      >
        Confirmar pago mixto
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useApi } from '~/composables/useApi'
import type { CobrarFolioMixtoDto, MedioPagoCatalogo } from '~/types/folio'

interface LineaPago {
  uid: string
  idMedioPago: number | null
  montoCobrar: number
  montoRecibido?: number
  referenciaPago?: string
}

const props = defineProps<{
  totalACobrar: number
  idHabitacion: number
  loading?: boolean
}>()

const emit = defineEmits<{
  (event: 'confirmar', payload: CobrarFolioMixtoDto): void
}>()

const api = useApi()
const loadingMedios = ref(false)
const medios = ref<MedioPagoCatalogo[]>([])
const lineas = ref<LineaPago[]>([])

const mediosPago = computed(() =>
  medios.value.map((medio) => ({
    ...medio,
    label: formatMedioPago(medio.nombre),
  })),
)

const totalAplicado = computed(() =>
  roundMoney(lineas.value.reduce((sum, linea) => sum + Number(linea.montoCobrar || 0), 0)),
)

const saldoRestante = computed(() =>
  roundMoney(Math.max(0, Number(props.totalACobrar || 0) - totalAplicado.value)),
)

const cambioTotal = computed(() =>
  roundMoney(
    lineas.value.reduce((sum, linea) => {
      if (!esEfectivo(linea.idMedioPago)) return sum
      return sum + Math.max(0, Number(linea.montoRecibido || 0) - Number(linea.montoCobrar || 0))
    }, 0),
  ),
)

const errorLineas = computed(() => {
  if (lineas.value.length < 2) return 'Agrega al menos dos lineas de pago.'
  if (totalAplicado.value !== roundMoney(props.totalACobrar)) return 'La suma aplicada debe ser igual al total a cobrar.'

  for (const linea of lineas.value) {
    if (!linea.idMedioPago) return 'Todas las lineas deben tener medio de pago.'
    if (Number(linea.montoCobrar || 0) <= 0) return 'Todas las lineas deben tener monto mayor a cero.'
    if (esEfectivo(linea.idMedioPago) && Number(linea.montoRecibido || 0) < Number(linea.montoCobrar || 0)) {
      return 'En efectivo, el monto recibido debe cubrir la linea.'
    }
    if (medioRequiereReferencia(linea.idMedioPago) && !String(linea.referenciaPago || '').trim()) {
      return 'Los medios electronicos configurados con referencia requieren comprobante.'
    }
  }

  return ''
})

const puedeConfirmar = computed(() => !errorLineas.value && !loadingMedios.value)

const roundMoney = (value: number) => Number(Number(value || 0).toFixed(2))

const formatMoney = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const formatMedioPago = (nombre: string) =>
  String(nombre || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

const getMedio = (id?: number | null) => medios.value.find((medio) => medio.id === Number(id))

const esEfectivo = (id?: number | null) => getMedio(id)?.nombre?.toLowerCase() === 'efectivo'

const medioRequiereReferencia = (id?: number | null) => Boolean(getMedio(id)?.requiereReferencia)

const crearLinea = (monto = 0): LineaPago => ({
  uid: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
  idMedioPago: medios.value[0]?.id || null,
  montoCobrar: roundMoney(monto),
  montoRecibido: roundMoney(monto),
  referenciaPago: '',
})

const normalizarLinea = (linea: LineaPago) => {
  linea.montoCobrar = roundMoney(Number(linea.montoCobrar || 0))
  if (esEfectivo(linea.idMedioPago)) {
    linea.montoRecibido = Math.max(Number(linea.montoRecibido || 0), linea.montoCobrar)
    linea.referenciaPago = ''
  } else {
    linea.montoRecibido = undefined
  }
}

const agregarLinea = () => {
  lineas.value.push(crearLinea(saldoRestante.value))
}

const eliminarLinea = (index: number) => {
  if (lineas.value.length <= 2) return
  lineas.value.splice(index, 1)
}

const ajustarSaldo = () => {
  if (!lineas.value.length) return
  const totalSinUltima = lineas.value.slice(0, -1).reduce((sum, linea) => sum + Number(linea.montoCobrar || 0), 0)
  const ultima = lineas.value[lineas.value.length - 1]
  ultima.montoCobrar = roundMoney(Math.max(0, Number(props.totalACobrar || 0) - totalSinUltima))
  normalizarLinea(ultima)
}

const cargarMedios = async () => {
  loadingMedios.value = true
  try {
    const response = await api.get<MedioPagoCatalogo[]>('/medios-pago')
    medios.value = Array.isArray(response) ? response : []
  } finally {
    loadingMedios.value = false
  }
}

const inicializarLineas = () => {
  const mitad = roundMoney(Number(props.totalACobrar || 0) / 2)
  lineas.value = [crearLinea(mitad), crearLinea(roundMoney(Number(props.totalACobrar || 0) - mitad))]
}

const confirmar = () => {
  if (!puedeConfirmar.value) return

  emit('confirmar', {
    idHabitacion: props.idHabitacion,
    pagos: lineas.value.map((linea) => ({
      idMedioPago: Number(linea.idMedioPago),
      montoCobrar: roundMoney(linea.montoCobrar),
      montoRecibido: esEfectivo(linea.idMedioPago) ? roundMoney(Number(linea.montoRecibido || linea.montoCobrar)) : undefined,
      referenciaPago: linea.referenciaPago || undefined,
    })),
  })
}

onMounted(async () => {
  await cargarMedios()
  inicializarLineas()
})
</script>

<style scoped>
.pago-mixto-form {
  display: grid;
  gap: 8px;
}

.payment-lines {
  display: grid;
  gap: 10px;
}

.payment-line {
  padding: 10px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
}

.payment-line__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
</style>
