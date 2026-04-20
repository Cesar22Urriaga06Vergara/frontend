<template>
  <div>
    <PageHeader :title="config.titulo" :subtitle="config.subtitulo">
      <template #status>
        <StatusBadge :status="viewState.status.value" />
      </template>
      <template #actions>
        <v-chip :color="config.colorArea" variant="tonal" size="small">
          {{ totalDia }} {{ config.etiquetaItems }} registrados
        </v-chip>
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-refresh"
          :loading="pedidosStore.loading"
          @click="refrescar"
        >
          Actualizar
        </v-btn>
      </template>
    </PageHeader>

    <SectionCard v-if="viewState.isError.value || viewState.isUnavailable.value" :padded="false" class="mb-6">
      <EmptyState
        v-if="viewState.isUnavailable.value"
        icon="mdi-cloud-off-outline"
        title="Modulo temporalmente no disponible"
        description="No se pudo consultar pedidos del area desde el backend en este momento."
        action-label="Reintentar"
        @action="refrescar"
      />
      <EmptyState
        v-else
        icon="mdi-alert-circle-outline"
        title="No fue posible cargar pedidos"
        :description="pedidosStore.error || 'Error inesperado al consultar pedidos'"
        action-label="Reintentar"
        @action="refrescar"
      />
    </SectionCard>

    <!-- KPI Cards -->
    <v-row v-if="!viewState.isError.value && !viewState.isUnavailable.value" class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Pendientes"
          :value="pendienteCount"
          icon="mdi-clock-outline"
          color="warning"
          helper="ReciÃ©n creados"
          :loading="pedidosStore.loading"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatCard
          :label="config.labelMedio"
          :value="medioCount"
          :icon="config.iconoMedio"
          color="info"
          helper="Activos ahora"
          :loading="pedidosStore.loading"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatCard
          :label="config.labelCompleto"
          :value="completadoCount"
          icon="mdi-check-circle-outline"
          color="success"
          helper="Cierre exitoso"
          :loading="pedidosStore.loading"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Total del dÃ­a"
          :value="totalDia"
          :icon="config.iconoArea"
          :color="config.colorArea"
          helper="Carga total del turno"
          :loading="pedidosStore.loading"
        />
      </v-col>
    </v-row>

    <!-- Lista + resumen -->
    <v-row v-if="!viewState.isError.value && !viewState.isUnavailable.value">
      <v-col cols="12" md="8">
        <SectionCard class="h-100" :padded="false">
          <v-card-title class="text-subtitle-1 font-weight-bold pa-4 pb-2 d-flex align-center justify-space-between">
            {{ capitalizar(config.etiquetaItems) }} recientes
            <v-btn-toggle v-model="filtroEstadoActivo" density="compact" variant="outlined" rounded="lg" class="ml-auto">
              <v-btn value="" size="small">Todos</v-btn>
              <v-btn value="pendiente" size="small" color="warning">Pendientes</v-btn>
              <v-btn :value="config.estadoMedio" size="small" color="info">{{ config.labelMedio }}</v-btn>
            </v-btn-toggle>
          </v-card-title>

          <v-card-text>
            <v-skeleton-loader
              v-if="pedidosStore.loading"
              type="list-item-three-line@4"
            />

            <v-list
              v-else-if="pedidosFiltrados.length > 0"
              density="compact"
              class="bg-transparent"
            >
              <v-list-item
                v-for="pedido in pedidosFiltrados"
                :key="pedido.id"
                :active="pedidoSeleccionado?.id === pedido.id"
                rounded="lg"
                class="mb-1"
                style="cursor: pointer"
                @click="abrirDetalle(pedido)"
              >
                <template #prepend>
                  <v-icon
                    :icon="getIconEstado(pedido.estadoPedido)"
                    :color="getColorEstado(pedido.estadoPedido)"
                    size="20"
                    class="mr-2"
                  />
                </template>

                <v-list-item-title class="text-body-2 font-weight-medium">
                  {{ capitalizar(config.etiquetaItem) }} #{{ pedido.id }}
                  <span class="text-caption text-medium-emphasis ml-1">â€” {{ pedido.items?.length ?? 0 }} Ã­tem(s)</span>
                </v-list-item-title>

                <v-list-item-subtitle class="text-caption">
                  {{ formatHora(pedido.fechaPedido) }} Â·
                  <v-icon size="12" class="mr-1">{{ pedido.tipoEntrega === 'delivery' ? 'mdi-truck-fast' : 'mdi-walk' }}</v-icon>
                  {{ pedido.tipoEntrega === 'delivery' ? 'Delivery' : 'Recogida' }}
                  <span v-if="pedido.notaCliente" class="ml-2 text-warning">
                    <v-icon size="12">mdi-comment-text-outline</v-icon> Nota
                  </span>
                </v-list-item-subtitle>

                <template #append>
                  <div class="d-flex align-center gap-2">
                    <v-chip
                      :color="getColorEstado(pedido.estadoPedido)"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ formatEstado(pedido.estadoPedido) }}
                    </v-chip>
                    <v-icon v-if="esAccionable(pedido)" size="16" color="primary">mdi-chevron-right</v-icon>
                  </div>
                </template>
              </v-list-item>
            </v-list>

            <EmptyState
              v-else
              :icon="config.iconoVacio"
              :title="`Sin ${config.etiquetaItems} en este momento`"
              :description="config.mensajeVacio"
            />
          </v-card-text>
        </SectionCard>
      </v-col>

      <v-col cols="12" md="4">
        <SectionCard class="h-100" title="Resumen del turno" subtitle="Indicadores operativos del area">
          <div class="text-subtitle-2 font-weight-bold mb-4">Resumen del turno</div>

          <v-list class="bg-transparent" density="comfortable">
            <v-list-item prepend-icon="mdi-run-fast" title="Carga activa">
              <template #append>
                <span class="text-body-2 font-weight-medium">{{ pendienteCount + medioCount }}</span>
              </template>
            </v-list-item>

            <v-list-item prepend-icon="mdi-check-all" :title="config.labelCompleto">
              <template #append>
                <span class="text-body-2 font-weight-medium">{{ completadoCount }}</span>
              </template>
            </v-list-item>

            <v-list-item prepend-icon="mdi-information-outline" title="Flujo de trabajo">
              <template #append>
                <span class="text-caption text-medium-emphasis">
                  Pendiente â†’ {{ config.labelMedio }} â†’ Cerrado
                </span>
              </template>
            </v-list-item>
          </v-list>

          <v-alert
            v-if="totalDia === 0 && !pedidosStore.loading"
            type="success"
            variant="tonal"
            class="mt-4"
          >
            No hay {{ config.etiquetaItems }} pendientes. El Ã¡rea estÃ¡ al dÃ­a.
          </v-alert>

          <v-alert
            v-else-if="pendienteCount > 0 && !pedidosStore.loading"
            type="warning"
            variant="tonal"
            class="mt-4"
          >
            {{ pendienteCount }} {{ config.etiquetaItem }}(s) esperando atenciÃ³n.
          </v-alert>
        </SectionCard>
      </v-col>
    </v-row>

    <!-- Dialog detalle + acciÃ³n -->
    <v-dialog v-model="dialogAbierto" max-width="560" scrollable>
      <v-card v-if="pedidoSeleccionado" rounded="lg">
        <v-card-title class="d-flex align-center pa-4 pb-2">
          <v-icon :icon="config.iconoArea" :color="config.colorArea" class="mr-2" />
          {{ capitalizar(config.etiquetaItem) }} #{{ pedidoSeleccionado.id }}
          <v-spacer />
          <v-chip :color="getColorEstado(pedidoSeleccionado.estadoPedido)" size="small" variant="tonal">
            {{ formatEstado(pedidoSeleccionado.estadoPedido) }}
          </v-chip>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <!-- Metadata -->
          <div class="d-flex gap-4 mb-4 text-caption text-medium-emphasis">
            <span><v-icon size="14" class="mr-1">mdi-clock-outline</v-icon>{{ formatHora(pedidoSeleccionado.fechaPedido) }}</span>
            <span>
              <v-icon size="14" class="mr-1">{{ pedidoSeleccionado.tipoEntrega === 'delivery' ? 'mdi-truck-fast' : 'mdi-walk' }}</v-icon>
              {{ pedidoSeleccionado.tipoEntrega === 'delivery' ? 'Delivery' : 'Recogida' }}
            </span>
          </div>

          <!-- Nota del cliente -->
          <v-alert
            v-if="pedidoSeleccionado.notaCliente"
            type="info"
            variant="tonal"
            density="compact"
            icon="mdi-comment-text-outline"
            class="mb-4"
          >
            {{ pedidoSeleccionado.notaCliente }}
          </v-alert>

          <!-- Items -->
          <div class="text-subtitle-2 font-weight-bold mb-2">Ãtems</div>
          <v-list density="compact" class="bg-transparent pa-0 mb-4">
            <v-list-item
              v-for="item in pedidoSeleccionado.items"
              :key="item.id"
              class="px-0"
            >
              <template #prepend>
                <v-avatar size="28" color="surface-variant" rounded="sm" class="mr-2">
                  <span class="text-caption font-weight-bold">{{ item.cantidad }}</span>
                </v-avatar>
              </template>
              <v-list-item-title class="text-body-2">{{ item.nombreServicioSnapshot }}</v-list-item-title>
              <v-list-item-subtitle v-if="item.observacion" class="text-caption">
                Nota: {{ item.observacion }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <!-- Nota empleado -->
          <v-textarea
            v-if="esAccionable(pedidoSeleccionado)"
            v-model="notaEmpleado"
            label="Nota interna (opcional)"
            placeholder="Ej. Cliente en habitaciÃ³n 204, sin glutenâ€¦"
            rows="2"
            hide-details
            density="compact"
            variant="outlined"
            class="mb-2"
          />
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 gap-2">
          <v-btn variant="text" @click="dialogAbierto = false">Cerrar</v-btn>
          <v-spacer />

          <!-- Pendiente â†’ estadoMedio -->
          <v-btn
            v-if="pedidoSeleccionado.estadoPedido === 'pendiente'"
            :color="config.colorArea"
            variant="elevated"
            :loading="actualizando"
            :prepend-icon="config.iconoMedio"
            @click="avanzarEstado(pedidoSeleccionado, config.estadoMedio)"
          >
            {{ config.accionAceptar }}
          </v-btn>

          <!-- estadoMedio â†’ completado -->
          <v-btn
            v-if="pedidoSeleccionado.estadoPedido === config.estadoMedio"
            color="success"
            variant="elevated"
            :loading="actualizando"
            prepend-icon="mdi-check-circle"
            @click="avanzarEstado(pedidoSeleccionado, config.estadoCompletado)"
          >
            {{ config.accionCompletar }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useViewState } from '~/composables/useViewState'
import type { AreaPedidosConfig } from '~/types/servicios'
import type { Pedido } from '~/types/servicios'
import PageHeader from '~/components/shared/PageHeader.vue'
import StatCard from '~/components/shared/StatCard.vue'
import StatusBadge from '~/components/shared/StatusBadge.vue'
import EmptyState from '~/components/shared/EmptyState.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import { usePedidosAreaStore } from '~/stores/pedidosArea'
import { useAuthStore } from '~/stores/auth'
import { useNotification } from '~/composables/useNotification'

const props = defineProps<{ config: AreaPedidosConfig }>()

const pedidosStore = usePedidosAreaStore()
const authStore = useAuthStore()
const notification = useNotification()

// Dialog state
const dialogAbierto = ref(false)
const pedidoSeleccionado = ref<Pedido | null>(null)
const notaEmpleado = ref('')
const actualizando = ref(false)
const filtroEstadoActivo = ref('')

onMounted(async () => {
  const idHotel = authStore.user?.idHotel
  if (idHotel) {
    try {
      await pedidosStore.cargarPedidos(idHotel, props.config.categoria, 'todos')
    } catch (_error) {
      // El store maneja unavailable/error; evitamos error no controlado en la vista.
    }
  }
})

const refrescar = async () => {
  if (authStore.user?.idHotel) {
    try {
      await pedidosStore.refrescarPedidos()
    } catch (_error) {
      // El store ya expone el estado de error.
    }
  }
}

// Contadores derivados del store
const pendienteCount = computed(() =>
  pedidosStore.pedidos.filter(p => p.estadoPedido === 'pendiente').length
)
const medioCount = computed(() =>
  pedidosStore.pedidos.filter(p => p.estadoPedido === props.config.estadoMedio).length
)
const completadoCount = computed(() =>
  pedidosStore.pedidos.filter(p => p.estadoPedido === props.config.estadoCompletado).length
)
const totalDia = computed(() => pedidosStore.pedidos.length)

const pedidosFiltrados = computed(() => {
  const lista = pedidosStore.pedidos.filter(
    p => p.estadoPedido !== 'cancelado' && p.estadoPedido !== props.config.estadoCompletado
  )
  if (!filtroEstadoActivo.value) return lista
  return lista.filter(p => p.estadoPedido === filtroEstadoActivo.value)
})

const hasData = computed(() => pedidosStore.pedidos.length > 0)
const viewState = useViewState(
  computed(() => pedidosStore.loading),
  hasData,
  computed(() => pedidosStore.error),
  computed(() => pedidosStore.unavailable),
)

const esAccionable = (pedido: Pedido) =>
  pedido.estadoPedido === 'pendiente' || pedido.estadoPedido === props.config.estadoMedio

const abrirDetalle = (pedido: Pedido) => {
  pedidoSeleccionado.value = pedido
  notaEmpleado.value = ''
  dialogAbierto.value = true
}

const avanzarEstado = async (pedido: Pedido, nuevoEstado: string) => {
  actualizando.value = true
  try {
    await pedidosStore.actualizarEstadoPedido(pedido.id, nuevoEstado, notaEmpleado.value || undefined)
    notification.success(`${capitalizar(props.config.etiquetaItem)} #${pedido.id} actualizado`)
    dialogAbierto.value = false
  } catch (_err) {
    notification.error(`No fue posible actualizar el ${props.config.etiquetaItem}`)
  } finally {
    actualizando.value = false
  }
}

// Mapeos de estado a presentaciÃ³n
const ESTADO_COLOR: Record<string, string> = {
  pendiente: 'warning',
  en_preparacion: 'info',
  listo: 'primary',
  entregado: 'success',
  cancelado: 'error',
}

const ESTADO_ICON: Record<string, string> = {
  pendiente: 'mdi-clock-outline',
  en_preparacion: 'mdi-progress-clock',
  listo: 'mdi-check',
  entregado: 'mdi-check-circle',
  cancelado: 'mdi-close-circle',
}

const getColorEstado = (estado: string): string => ESTADO_COLOR[estado] ?? 'default'
const getIconEstado = (estado: string): string => ESTADO_ICON[estado] ?? 'mdi-help-circle-outline'
const formatEstado = (estado: string): string => estado.replaceAll('_', ' ')
const formatHora = (fecha: string): string =>
  fecha ? new Date(fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : 'â€”'
const capitalizar = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)
</script>
