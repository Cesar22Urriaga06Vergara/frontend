<template>
  <div>
    <PageHeader
      title="Mis pedidos"
      subtitle="Historial y estado en tiempo real de tus solicitudes"
    >
      <template #actions>
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-refresh"
          :loading="serviciosStore.loading"
          @click="refrescarPedidos"
        >
          Actualizar
        </v-btn>
        <v-btn
          color="primary"
          variant="outlined"
          prepend-icon="mdi-view-grid-outline"
          @click="irAlCatalogo"
        >
          Ir al catalogo
        </v-btn>
      </template>
    </PageHeader>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Total" :value="pedidosFiltrados.length" icon="mdi-receipt-text" color="primary" :loading="serviciosStore.loading" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Pendientes" :value="countByEstado('pendiente')" icon="mdi-clock-outline" color="warning" :loading="serviciosStore.loading" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="En preparacion" :value="countByEstado('en_preparacion')" icon="mdi-progress-clock" color="info" :loading="serviciosStore.loading" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Entregados" :value="countByEstado('entregado')" icon="mdi-check-circle-outline" color="success" :loading="serviciosStore.loading" />
      </v-col>
    </v-row>

    <StandardDataTable
      title="Listado de pedidos"
      subtitle="Consulta estado, categoria, entrega y total de cada pedido"
      :headers="headers"
      :items="pedidosFiltrados"
      :loading="serviciosStore.loading"
      :items-per-page="10"
      empty-icon="mdi-basket-off-outline"
      empty-title="Aun no tienes pedidos"
      empty-description="Cuando solicites servicios, los veras aqui con su estado."
      empty-action-label="Ir al catalogo"
      @empty-action="irAlCatalogo"
    >
      <template #item.id="{ item }">
        <v-btn variant="text" color="primary" class="px-0" @click="mostrarDetalle(item)">
          #{{ item.id }}
        </v-btn>
      </template>

      <template #item.fechaPedido="{ item }">
        {{ formatearFecha(item.fechaPedido) }}
      </template>

      <template #item.categoria="{ item }">
        <v-chip size="small" variant="tonal">{{ formatearCategoria(item.categoria) }}</v-chip>
      </template>

      <template #item.tipoEntrega="{ item }">
        <v-chip
          size="small"
          variant="tonal"
          :prepend-icon="item.tipoEntrega === 'delivery' ? 'mdi-bike' : 'mdi-walk'"
        >
          {{ item.tipoEntrega === 'delivery' ? 'Delivery' : 'Recogida' }}
        </v-chip>
      </template>

      <template #item.estadoPedido="{ item }">
        <v-chip :color="getColorChip(item.estadoPedido)" text-color="white" size="small">
          {{ formatearEstado(item.estadoPedido) }}
        </v-chip>
      </template>

      <template #item.totalPedido="{ item }">
        <span class="font-weight-bold text-success">${{ formatearPrecio(item.totalPedido) }}</span>
      </template>

      <template #item.acciones="{ item }">
        <div class="d-flex align-center ga-1 justify-end">
          <v-btn color="primary" variant="text" size="small" @click="mostrarDetalle(item)">
            Ver
          </v-btn>
          <v-btn
            v-if="item.estadoPedido === 'pendiente'"
            color="error"
            variant="text"
            size="small"
            @click="cancelarPedido(item.id)"
          >
            Cancelar
          </v-btn>
        </div>
      </template>
    </StandardDataTable>

    <v-dialog v-model="dialogoDetalle" max-width="680">
      <SectionCard
        v-if="pedidoDetalle"
        :title="`Detalle del pedido #${pedidoDetalle.id}`"
        subtitle="Trazabilidad completa de items, notas y totales"
      >
        <v-row class="mb-4">
          <v-col cols="6">
            <div class="text-caption text-medium-emphasis">Estado actual</div>
            <v-chip :color="getColorChip(pedidoDetalle.estadoPedido)" text-color="white" size="small">
              {{ formatearEstado(pedidoDetalle.estadoPedido) }}
            </v-chip>
          </v-col>
          <v-col cols="6">
            <div class="text-caption text-medium-emphasis">Ultima actualizacion</div>
            <div class="font-weight-medium">{{ formatearFechYHora(pedidoDetalle.fechaActualizacion) }}</div>
          </v-col>
        </v-row>

        <SectionCard title="Items" :padded="false" class="mb-4">
          <v-table>
            <thead>
              <tr>
                <th>Servicio</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">Precio</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in pedidoDetalle.items" :key="item.id">
                <td>
                  <div class="font-weight-medium">{{ item.nombreServicioSnapshot }}</div>
                  <div v-if="item.observacion" class="text-caption text-medium-emphasis">Nota: {{ item.observacion }}</div>
                </td>
                <td class="text-right">{{ item.cantidad }}</td>
                <td class="text-right">${{ formatearPrecio(item.precioUnitarioSnapshot) }}</td>
                <td class="text-right font-weight-bold">${{ formatearPrecio(item.subtotal) }}</td>
              </tr>
            </tbody>
          </v-table>
        </SectionCard>

        <div v-if="pedidoDetalle.notaCliente || pedidoDetalle.notaEmpleado" class="mb-4">
          <div v-if="pedidoDetalle.notaCliente" class="mb-2">
            <div class="text-caption text-medium-emphasis">Tu nota</div>
            <div class="pa-2 rounded bg-blue-lighten-5 text-body-2">{{ pedidoDetalle.notaCliente }}</div>
          </div>
          <div v-if="pedidoDetalle.notaEmpleado">
            <div class="text-caption text-medium-emphasis">Nota del personal</div>
            <div class="pa-2 rounded bg-green-lighten-5 text-body-2">{{ pedidoDetalle.notaEmpleado }}</div>
          </div>
        </div>

        <div class="d-flex justify-space-between align-center text-subtitle-1 font-weight-bold mb-4">
          <span>Total</span>
          <span class="text-success">${{ formatearPrecio(pedidoDetalle.totalPedido) }}</span>
        </div>

        <div class="d-flex justify-end">
          <v-btn color="primary" @click="dialogoDetalle = false">Cerrar</v-btn>
        </div>
      </SectionCard>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { UserRole } from '~/types/auth'
import { useRouter, useRoute } from 'vue-router'
import { useServiciosStore } from '~/stores/servicios'
import { useReservasStore } from '~/stores/reservas'
import { useAuthStore } from '~/stores/auth'
import { useNotification } from '~/composables/useNotification'
import type { Pedido } from '~/types/servicios'
import PageHeader from '~/components/shared/PageHeader.vue'
import StatCard from '~/components/shared/StatCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import SectionCard from '~/components/shared/SectionCard.vue'

definePageMeta({
  layout: 'cliente',
  middleware: ['auth', 'role'],
  roles: [UserRole.CLIENTE],
})

useHead({ title: 'Mis Pedidos' })

const router = useRouter()
const route = useRoute()
const serviciosStore = useServiciosStore()
const reservasStore = useReservasStore()
const authStore = useAuthStore()
const notification = useNotification()

const isQaMockSession = () => {
  const token = authStore.token || ''
  return token.startsWith('qa-token-')
}

const dialogoDetalle = ref(false)
const pedidoDetalle = ref<Pedido | null>(null)
let refreshInterval: any = null

const headers = [
  { title: 'Pedido', key: 'id', width: '110px' },
  { title: 'Fecha', key: 'fechaPedido', width: '130px' },
  { title: 'Categoria', key: 'categoria' },
  { title: 'Entrega', key: 'tipoEntrega' },
  { title: 'Estado', key: 'estadoPedido' },
  { title: 'Total', key: 'totalPedido', width: '120px' },
  { title: 'Acciones', key: 'acciones', sortable: false, width: '170px', align: 'end' },
]

const pedidosFiltrados = computed(() => {
  const reservaIdParam = route.query.reservaId
  if (reservaIdParam) {
    return serviciosStore.pedidosActivos.filter((p) => p.idReserva === Number(reservaIdParam))
  }
  return serviciosStore.pedidosActivos
})

const countByEstado = (estado: string) => pedidosFiltrados.value.filter((p) => p.estadoPedido === estado).length

const getColorChip = (estado: string): string => {
  switch (estado) {
    case 'pendiente': return '#ff9800'
    case 'en_preparacion': return '#2196f3'
    case 'listo': return '#66bb6a'
    case 'entregado': return '#4caf50'
    case 'cancelado': return '#f44336'
    default: return '#9e9e9e'
  }
}

const formatearEstado = (estado: string): string => {
  const map: Record<string, string> = {
    pendiente: 'Pendiente',
    en_preparacion: 'En preparacion',
    listo: 'Listo',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  }
  return map[estado] || estado
}

const formatearCategoria = (cat: string): string => {
  const map: Record<string, string> = {
    cafeteria: 'Cafeteria',
    lavanderia: 'Lavanderia',
    spa: 'Spa',
    room_service: 'Room Service',
    minibar: 'Minibar',
    otros: 'Otros',
  }
  return map[cat] || cat
}

const formatearFecha = (fecha: string | Date): string => {
  const d = new Date(fecha)
  return d.toLocaleDateString('es-CO')
}

const formatearFechYHora = (fecha: string | Date): string => {
  const d = new Date(fecha)
  return `${d.toLocaleDateString('es-CO')} ${d.toLocaleTimeString('es-CO')}`
}

const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio)
}

const cancelarPedido = async (idPedido: number) => {
  if (confirm('Deseas cancelar este pedido?')) {
    try {
      await serviciosStore.cancelarPedido(idPedido)
      notification.success('Pedido cancelado')
    } catch (error: any) {
      notification.error(error?.message || 'Error al cancelar')
    }
  }
}

const mostrarDetalle = (pedido: Pedido) => {
  pedidoDetalle.value = pedido
  dialogoDetalle.value = true
}

const refrescarPedidos = async () => {
  if (isQaMockSession()) {
    return
  }

  const reservaActual = reservasStore.reservas.find(
    (r) => r.idCliente === authStore.user?.idCliente && r.estadoReserva?.toLowerCase() !== 'cancelada',
  )

  if (reservaActual) {
    try {
      await serviciosStore.cargarMisPedidos(reservaActual.id)
    } catch (_error) {
      // El estado de la UI permanece estable aun si falla la actualizacion.
    }
  }
}

const irAlCatalogo = () => {
  router.push('/cliente/servicios')
}

onMounted(async () => {
  if (isQaMockSession()) {
    return
  }

  try {
    if (!authStore.user?.idHotel && authStore.user?.role === UserRole.CLIENTE) {
      await authStore.fetchReservaActivaAndSetHotel()
    }

    if (authStore.user?.idCliente) {
      await reservasStore.obtenerReservasDelCliente(authStore.user.idCliente)
    }

    const reservaActual = reservasStore.reservas.find(
      (r) => r.idCliente === authStore.user?.idCliente && r.estadoReserva?.toLowerCase() !== 'cancelada',
    )

    if (reservaActual) {
      await serviciosStore.cargarMisPedidos(reservaActual.id)
      refreshInterval = setInterval(async () => {
        try {
          await serviciosStore.cargarMisPedidos(reservaActual.id)
        } catch (_error) {
          // Evita ruido en consola durante reintentos automaticos.
        }
      }, 30000)
    }
  } catch (_error) {
    // Si no hay backend disponible, la pantalla conserva estado vacio sin romper UX.
  }
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>
