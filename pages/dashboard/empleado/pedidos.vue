<template>
  <div>
    <PageHeader
      title="Gestion de pedidos"
      :subtitle="`Area: ${getAreaLabel(authStore.userRole)}`"
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
      title="Cola operativa"
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

      <template #item.createdAt="{ item }">
        {{ formatearHora(item.fechaPedido || item.createdAt) }}
      </template>

      <template #item.acciones="{ item }">
        <v-btn icon="mdi-pencil" size="small" variant="text" @click="abrirDetalle(item)" />
      </template>
    </StandardDataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { UserRole } from '~/types/auth'
import { useAuthStore } from '~/stores/auth'
import { usePedidosAreaStore } from '~/stores/pedidosArea'
import type { Pedido } from '~/types/servicios'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import StatCard from '~/components/shared/StatCard.vue'

definePageMeta({
  layout: 'operacion',
  middleware: ['auth', 'role'],
  roles: [UserRole.CAFETERIA, UserRole.LAVANDERIA, UserRole.SPA, UserRole.ROOM_SERVICE],
})

useHead({ title: 'Gestion de Pedidos' })

const authStore = useAuthStore()
const pedidosStore = usePedidosAreaStore()

const loading = ref(false)
const estadoFiltro = ref<string | null>(null)
const tipoEntregaFiltro = ref<string | null>(null)
let refreshInterval: ReturnType<typeof setInterval> | null = null

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
  { title: 'ID', key: 'id', width: '90px' },
  { title: 'Items', key: 'items', width: '100px' },
  { title: 'Estado', key: 'estadoPedido' },
  { title: 'Entrega', key: 'tipoEntrega' },
  { title: 'Hora', key: 'createdAt', width: '140px' },
  { title: 'Acciones', key: 'acciones', sortable: false, width: '90px', align: 'end' },
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

const pendienteCount = computed(() => pedidosFiltrados.value.filter((p) => p.estadoPedido === 'pendiente').length)
const enPreparacionCount = computed(() => pedidosFiltrados.value.filter((p) => p.estadoPedido === 'en_preparacion').length)
const listosCount = computed(() => pedidosFiltrados.value.filter((p) => p.estadoPedido === 'listo').length)
const totalCount = computed(() => pedidosFiltrados.value.length)

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

  await pedidosStore.cargarPedidos(hotelId, categoria)
}

const refrescarPedidos = async () => {
  loading.value = true
  try {
    await cargarPedidosDelArea()
  } finally {
    loading.value = false
  }
}

const abrirDetalle = (pedido: Pedido) => {
  console.log('Detalles del pedido:', pedido)
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
