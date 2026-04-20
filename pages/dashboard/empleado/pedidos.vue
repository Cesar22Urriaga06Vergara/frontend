<template>
  <div>
    <PageHeader
      :title="tituloGestion"
      :subtitle="`Área: ${getAreaLabel(authStore.userRole)}`"
    >
      <template #actions>
        <v-btn
          prepend-icon="mdi-refresh"
          color="primary"
          variant="tonal"
          :loading="loading"
          @click="refrescarPedidos"
        >
          Actualizar
        </v-btn>
      </template>
    </PageHeader>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Pendientes"
          :value="pendienteCount"
          icon="mdi-clock-outline"
          color="warning"
          :loading="loading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="En preparacion"
          :value="enPreparacionCount"
          icon="mdi-progress-clock"
          color="info"
          :loading="loading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Listos"
          :value="listosCount"
          icon="mdi-check-circle-outline"
          color="success"
          :loading="loading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Total"
          :value="totalCount"
          icon="mdi-file-multiple-outline"
          color="primary"
          :loading="loading"
        />
      </v-col>
    </v-row>

    <SectionCard title="Filtros" subtitle="Refina por estado y tipo de entrega" class="mb-6">
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="estadoFiltro"
            label="Estado"
            :items="estadoOptions"
            item-title="label"
            item-value="value"
            clearable
            @update:model-value="filtrarPedidos"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="tipoEntregaFiltro"
            label="Tipo de entrega"
            :items="tipoEntregaOptions"
            item-title="label"
            item-value="value"
            clearable
            @update:model-value="filtrarPedidos"
          />
        </v-col>
      </v-row>
    </SectionCard>

    <StandardDataTable
      :title="tituloGestion"
      subtitle="Atiende pedidos segun prioridad y estado"
      :headers="headers"
      :items="pedidosFiltrados"
      :loading="loading"
      :items-per-page="12"
      empty-icon="mdi-food-off"
      empty-title="No hay pedidos para los filtros actuales"
      empty-description="Prueba con otro estado o recarga la informacion."
      empty-action-label="Recargar"
      @empty-action="refrescarPedidos"
    >
      <template #item.id="{ item }">
        <v-btn variant="text" color="primary" class="px-0" @click="abrirDetalle(item)">
          #{{ item.id }}
        </v-btn>
      </template>

      <template #item.items="{ item }">
        <v-chip size="small" variant="tonal" color="primary">{{ item.items?.length || 0 }}</v-chip>
      </template>

      <template #item.estadoPedido="{ item }">
        <v-chip
          :color="getColorEstado(item.estadoPedido)"
          :text="formatearEstado(item.estadoPedido)"
          size="small"
          variant="tonal"
        />
      </template>

      <template #item.tipoEntrega="{ item }">
        <v-chip
          :icon="item.tipoEntrega === 'delivery' ? 'mdi-truck-fast' : 'mdi-store'"
          :text="item.tipoEntrega === 'delivery' ? 'Delivery' : 'Recogida'"
          size="small"
          variant="tonal"
        />
      </template>

      <template #item.fechaPedido="{ item }">
        <div class="text-caption">
          <div>{{ formatearFecha(item.fechaPedido) }}</div>
          <div class="text-medium-emphasis">{{ formatearHora(item.fechaPedido) }}</div>
        </div>
      </template>

      <template #item.cliente="{ item }">
        <div class="text-caption">
          <div class="font-weight-medium">Cliente #{{ item.idCliente }}</div>
          <div class="text-medium-emphasis">Reserva #{{ item.idReserva }}</div>
        </div>
      </template>

      <template #item.acciones="{ item }">
        <v-btn icon="mdi-eye" size="small" variant="text" color="primary" @click="abrirDetalle(item)" />
      </template>
    </StandardDataTable>

    <!-- Dialog detalle -->
    <v-dialog v-model="dialogAbierto" max-width="520" scrollable>
      <v-card v-if="pedidoDetalle" rounded="lg">
        <v-card-title class="d-flex align-center pa-4 pb-2">
          <v-icon :icon="areaConfig.iconoArea" :color="areaConfig.colorArea" class="mr-2" />
          {{ capitalizar(areaConfig.etiquetaItem) }} #{{ pedidoDetalle.id }}
          <v-spacer />
          <v-chip :color="getColorEstado(pedidoDetalle.estadoPedido)" size="small" variant="tonal">
            {{ formatearEstado(pedidoDetalle.estadoPedido) }}
          </v-chip>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-row class="mb-3" dense>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Cliente</div>
              <div class="text-body-2 font-weight-medium">#{{ pedidoDetalle.idCliente }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Reserva</div>
              <div class="text-body-2 font-weight-medium">#{{ pedidoDetalle.idReserva }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Fecha</div>
              <div class="text-body-2">{{ formatearFecha(pedidoDetalle.fechaPedido) }} {{ formatearHora(pedidoDetalle.fechaPedido) }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Entrega</div>
              <v-chip :icon="pedidoDetalle.tipoEntrega === 'delivery' ? 'mdi-truck-fast' : 'mdi-store'" size="x-small" variant="tonal">
                {{ pedidoDetalle.tipoEntrega === 'delivery' ? 'Delivery' : 'Recogida' }}
              </v-chip>
            </v-col>
          </v-row>

          <v-alert v-if="pedidoDetalle.notaCliente" type="info" variant="tonal" density="compact" icon="mdi-comment-text-outline" class="mb-3">
            {{ pedidoDetalle.notaCliente }}
          </v-alert>

          <div class="text-subtitle-2 font-weight-bold mb-2">Ítems</div>
          <v-list density="compact" class="bg-transparent pa-0">
            <v-list-item v-for="item in pedidoDetalle.items" :key="item.id" class="px-0">
              <template #prepend>
                <v-avatar size="28" color="surface-variant" rounded="sm" class="mr-2">
                  <span class="text-caption font-weight-bold">{{ item.cantidad }}</span>
                </v-avatar>
              </template>
              <v-list-item-title class="text-body-2">{{ item.nombreServicioSnapshot }}</v-list-item-title>
              <v-list-item-subtitle v-if="item.observacion" class="text-caption">Nota: {{ item.observacion }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <div v-if="pedidoDetalle.notaEmpleado" class="mt-3">
            <div class="text-caption text-medium-emphasis mb-1">Nota interna</div>
            <div class="text-body-2">{{ pedidoDetalle.notaEmpleado }}</div>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-btn variant="text" @click="dialogAbierto = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { UserRole } from '~/types/auth'
import { useAuthStore } from '~/stores/auth'
import { usePedidosAreaStore } from '~/stores/pedidosArea'
import type { Pedido } from '~/types/servicios'
import { getAreaConfigByRole } from '~/utils/areaPanelConfigs'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import StatCard from '~/components/shared/StatCard.vue'

definePageMeta({
  layout: 'operacion',
  middleware: ['auth', 'role'],
  roles: [UserRole.CAFETERIA, UserRole.LAVANDERIA, UserRole.SPA, UserRole.ROOM_SERVICE, UserRole.MINIBAR, UserRole.TRANSPORTE, UserRole.TOURS, UserRole.EVENTOS, UserRole.MANTENIMIENTO],
})

useHead({ title: 'Gestion de Pedidos' })

const authStore = useAuthStore()
const pedidosStore = usePedidosAreaStore()
const areaConfig = computed(() => getAreaConfigByRole(authStore.userRole as any))
const tituloGestion = computed(() => `Gestión de ${capitalizar(areaConfig.value.etiquetaItems)}`)

const loading = ref(false)
let refreshInterval: ReturnType<typeof setInterval> | null = null

const estadoFiltro = ref<string | null>(null)
const tipoEntregaFiltro = ref<string | null>(null)

const dialogAbierto = ref(false)
const pedidoDetalle = ref<Pedido | null>(null)

const estadoOptions = [
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'En Preparacion', value: 'en_preparacion' },
  { label: 'Listo', value: 'listo' },
  { label: 'Entregado', value: 'entregado' },
  { label: 'Cancelado', value: 'cancelado' },
]

const tipoEntregaOptions = [
  { label: 'Delivery', value: 'delivery' },
  { label: 'Recogida', value: 'recogida' },
]

const headers = [
  { title: 'ID', key: 'id', width: '80px' },
  { title: 'Cliente / Reserva', key: 'cliente', width: '140px' },
  { title: 'Items', key: 'items', width: '90px' },
  { title: 'Estado', key: 'estadoPedido' },
  { title: 'Entrega', key: 'tipoEntrega', width: '120px' },
  { title: 'Fecha', key: 'fechaPedido', width: '130px' },
  { title: 'Acciones', key: 'acciones', sortable: false, width: '80px', align: 'end' },
]

const pedidosFiltrados = computed(() => {
  let result = pedidosStore.pedidos

  if (estadoFiltro.value) {
    result = result.filter((pedido) => pedido.estadoPedido === estadoFiltro.value)
  }

  if (tipoEntregaFiltro.value) {
    result = result.filter((pedido) => pedido.tipoEntrega === tipoEntregaFiltro.value)
  }

  return result
})

const pendienteCount = computed(() => pedidosStore.pedidos.filter((p) => p.estadoPedido === 'pendiente').length)
const enPreparacionCount = computed(() => pedidosStore.pedidos.filter((p) => p.estadoPedido === 'en_preparacion').length)
const listosCount = computed(() => pedidosStore.pedidos.filter((p) => p.estadoPedido === 'listo').length)
const totalCount = computed(() => pedidosStore.pedidos.length)

const getAreaLabel = (role: string | null): string => {
  const labels: Record<string, string> = {
    cafeteria: 'Cafeteria',
    lavanderia: 'Lavanderia',
    spa: 'Spa',
    room_service: 'Room Service',
  }
  return labels[role?.toLowerCase() || ''] || 'Area desconocida'
}

const getColorEstado = (estado: string): string => {
  const colores: Record<string, string> = {
    pendiente: 'warning',
    en_preparacion: 'info',
    listo: 'success',
    entregado: 'success',
    cancelado: 'error',
  }
  return colores[estado] || 'secondary'
}

const formatearEstado = (estado: string): string => {
  const estados: Record<string, string> = {
    pendiente: 'Pendiente',
    en_preparacion: 'En preparacion',
    listo: 'Listo',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  }
  return estados[estado] || estado
}

const formatearFecha = (fecha?: string): string => {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

const formatearHora = (fecha?: string): string => {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

const filtrarPedidos = () => {
  // Reaccion controlada por computed
}

const getCategoria = (): string | null => {
  const role = authStore.userRole
  const roleCategoryMap: Record<string, string> = {
    cafeteria: 'cafeteria',
    lavanderia: 'lavanderia',
    spa: 'spa',
    room_service: 'room_service',
  }

  if (!role) return null
  return roleCategoryMap[String(role).toLowerCase()] || null
}

const cargarPedidosDelArea = async (): Promise<void> => {
  const hotelId = authStore.user?.idHotel
  const categoria = getCategoria()

  if (!hotelId || !categoria) {
    return
  }

  // 'todos' evita que el backend excluya entregados/cancelados por defecto
  await pedidosStore.cargarPedidos(hotelId, categoria, 'todos')
}

const refrescarPedidos = async () => {
  loading.value = true
  try {
    await cargarPedidosDelArea()
  } finally {
    loading.value = false
  }
}

const capitalizar = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

const abrirDetalle = (pedido: Pedido) => {
  pedidoDetalle.value = pedido
  dialogAbierto.value = true
}

onMounted(async () => {
  try {
    await refrescarPedidos()
  } catch (_error) {
    // El store expone el error; evitamos rechazo no controlado.
  }

  refreshInterval = setInterval(async () => {
    try {
      await cargarPedidosDelArea()
    } catch (error) {
      console.error('Error refrescando pedidos del area:', error)
    }
  }, 20000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>
