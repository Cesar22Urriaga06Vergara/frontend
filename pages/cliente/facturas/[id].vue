<template>
  <div>
    <PageHeader
      title="Detalle de Factura"
      :subtitle="factura ? `Factura ${factura.numeroFactura}` : 'Consultando información de la factura'"
    >
      <template #status>
        <EstadoFacturaBadge
          v-if="factura"
          :estado-actual="factura.estadoFactura"
          :show-transiciones="puedoModificar"
          @cambiar-estado="abrirDialogCambio"
        />
      </template>
    </PageHeader>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Estado" :value="factura?.estadoFactura || 'N/A'" icon="mdi-file-document" color="primary" :loading="loading" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Total" :value="formatCurrency(factura?.total)" icon="mdi-cash" color="success" :loading="loading" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Cliente" :value="factura?.nombreCliente || 'N/A'" icon="mdi-account" color="info" :loading="loading" />
      </v-col>
    </v-row>

    <SectionCard v-if="loading" :padded="false" class="mb-6">
      <EmptyState icon="mdi-loading" title="Cargando factura" description="Espera un momento mientras traemos los datos." />
    </SectionCard>

    <template v-else-if="factura">
      <SectionCard class="mb-6" title="Información general">
        <v-row>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Cliente</div>
            <div class="font-weight-medium">{{ factura.nombreCliente }}</div>
            <div class="text-caption">{{ factura.cedulaCliente }} | {{ factura.emailCliente }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Fechas</div>
            <div>Emisión: {{ formatFecha(factura.fechaEmision) }}</div>
            <div>Vencimiento: {{ formatFecha(factura.fechaVencimiento) }}</div>
          </v-col>
        </v-row>
      </SectionCard>

      <SectionCard class="mb-6" title="Desglose tributario">
        <FacturaDesglose :factura="factura" />
      </SectionCard>

      <StandardDataTable
        title="Detalle de servicios"
        subtitle="Conceptos facturados y valores"
        :headers="detallesHeaders"
        :items="factura.detalles || []"
        :items-per-page="10"
        empty-title="Sin detalles"
        empty-description="Esta factura no tiene líneas de detalle registradas."
      >
        <template #item.precioUnitario="{ item }">{{ formatCurrency(item.precioUnitario) }}</template>
        <template #item.subtotal="{ item }">{{ formatCurrency(item.subtotal) }}</template>
        <template #item.montoInc="{ item }">{{ formatCurrency(item.montoInc) }}</template>
        <template #item.total="{ item }"><span class="font-weight-bold">{{ formatCurrency(item.total) }}</span></template>
      </StandardDataTable>

      <SectionCard class="mt-6" title="Acciones rápidas">
        <v-row>
          <v-col cols="12" sm="6" md="3" v-if="puedeEmitir">
            <v-btn color="success" block prepend-icon="mdi-check-circle" @click="() => abrirDialogCambio('EMITIDA')">Emitir</v-btn>
          </v-col>
          <v-col cols="12" sm="6" md="3" v-if="puedePagar">
            <v-btn color="info" block prepend-icon="mdi-cash-check" @click="() => abrirDialogCambio('PAGADA')">Marcar pagada</v-btn>
          </v-col>
          <v-col cols="12" sm="6" md="3" v-if="puedeAnular">
            <v-btn color="error" block prepend-icon="mdi-cancel" @click="() => abrirDialogCambio('ANULADA')">Anular</v-btn>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-btn color="primary" variant="outlined" block prepend-icon="mdi-download" @click="descargarPDF">Descargar</v-btn>
          </v-col>
        </v-row>
      </SectionCard>
    </template>

    <SectionCard v-else :padded="false" class="mb-6">
      <EmptyState icon="mdi-file-document-remove" title="Factura no encontrada" description="No se encontró información asociada a esta factura." />
    </SectionCard>

    <DialogCambiarEstado
      v-model="dialogAbierto"
      :factura-id="facturaId"
      :factura="factura"
      :estado-actual="factura?.estadoFactura || 'BORRADOR'"
      :estado-nuevo="estadoAmbicioso"
      @confirmar="confirmarCambioEstado"
    />

    <v-snackbar v-model="mostrarSnackbar" :timeout="3000" :color="tipoSnackbar">
      {{ mensajeSnackbar }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { UserRole } from '~/types/auth'
import type { EstadoFactura, Factura } from '~/types/factura'
import { useFacturas } from '~/composables/useFacturas'
import { useAuthStore } from '~/stores/auth'
import { usePermissions } from '~/composables/usePermissions'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import EmptyState from '~/components/shared/EmptyState.vue'
import EstadoFacturaBadge from '~/components/facturas/EstadoFacturaBadge.vue'
import FacturaDesglose from '~/components/facturas/FacturaDesglose.vue'
import DialogCambiarEstado from '~/components/facturas/DialogCambiarEstado.vue'

definePageMeta({
  layout: 'cliente',
  middleware: ['auth', 'role'],
  roles: [UserRole.CLIENTE, UserRole.ADMIN, UserRole.SUPERADMIN],
})

useHead({ title: 'Detalle de Factura' })

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
const tipoSnackbar = ref('info')

const detallesHeaders = [
  { title: 'Concepto', key: 'descripcion' },
  { title: 'Cantidad', key: 'cantidad' },
  { title: 'P.U.', key: 'precioUnitario' },
  { title: 'Subtotal', key: 'subtotal' },
  { title: 'INC', key: 'montoInc' },
  { title: 'Total', key: 'total' },
]

const puedoModificar = computed(() => {
  const rol = authStore.userRole
  return rol === 'admin' || rol === 'superadmin'
})

const puedeEmitir = computed(() => (factura.value ? permissions.puedeEmitirFactura(factura.value.estadoFactura) : false))
const puedePagar = computed(() => (factura.value ? permissions.puedePagarFactura(factura.value.estadoFactura) : false))
const puedeAnular = computed(() => (factura.value ? permissions.puedeAnularFactura(factura.value.estadoFactura) : false))

const formatFecha = (fecha: string | undefined): string => {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatCurrency = (value: number | undefined): string => {
  if (!value) return '$0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const abrirDialogCambio = (nuevoEstado: EstadoFactura) => {
  estadoAmbicioso.value = nuevoEstado
  dialogAbierto.value = true
}

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
        resultado = await facturas.marcarComoPagada(data.idFactura, data.fechaPago)
        break
      default:
        throw new Error('Acción no permitida')
    }

    if (resultado) {
      factura.value = resultado
      mostrarNotificacion('Cambio realizado correctamente', 'success')
    }
  } catch (err: any) {
    mostrarNotificacion(err.message || 'Error al cambiar estado', 'error')
  }
}

const mostrarNotificacion = (mensaje: string, tipo: string = 'info') => {
  mensajeSnackbar.value = mensaje
  tipoSnackbar.value = tipo
  mostrarSnackbar.value = true
}

const descargarPDF = () => {
  mostrarNotificacion('Descarga en desarrollo...', 'info')
}

onMounted(async () => {
  loading.value = true
  try {
    await facturas.obtenerPorId(facturaId.value)
    factura.value = facturas.facturaActual.value
  } catch (_error) {
    factura.value = null
    mostrarNotificacion('No fue posible cargar el detalle de la factura', 'warning')
  } finally {
    loading.value = false
  }
})
</script>