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
          helper="Recién creados"
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
          label="Total del día"
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
          <v-card-title class="text-subtitle-1 font-weight-bold pa-4 pb-0">
            {{ capitalizar(config.etiquetaItems) }} recientes
          </v-card-title>

          <v-card-text>
            <v-skeleton-loader
              v-if="pedidosStore.loading"
              type="list-item-three-line@4"
            />

            <v-list
              v-else-if="pedidosRecientes.length > 0"
              density="compact"
              class="bg-transparent"
            >
              <v-list-item
                v-for="pedido in pedidosRecientes"
                :key="pedido.id"
              >
                <template #prepend>
                  <v-icon
                    :icon="getIconEstado(pedido.estadoPedido)"
                    :color="getColorEstado(pedido.estadoPedido)"
                    size="20"
                    class="mr-2"
                  />
                </template>

                <v-list-item-title class="text-body-2">
                  {{ capitalizar(config.etiquetaItem) }} #{{ pedido.id }} — {{ pedido.items?.length ?? 0 }} ítem(s)
                </v-list-item-title>

                <v-list-item-subtitle class="text-caption">
                  {{ formatHora(pedido.fechaPedido) }} · {{ pedido.tipoEntrega }}
                </v-list-item-subtitle>

                <template #append>
                  <v-chip
                    :color="getColorEstado(pedido.estadoPedido)"
                    size="x-small"
                    variant="tonal"
                  >
                    {{ formatEstado(pedido.estadoPedido) }}
                  </v-chip>
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

            <v-list-item prepend-icon="mdi-information-outline" title="Ruta sugerida">
              <template #append>
                <span class="text-caption text-medium-emphasis">Preparar, entregar, cerrar</span>
              </template>
            </v-list-item>
          </v-list>

          <v-alert
            v-if="totalDia === 0 && !pedidosStore.loading"
            type="success"
            variant="tonal"
            class="mt-4"
          >
            No hay {{ config.etiquetaItems }} pendientes. El área está al día.
          </v-alert>
        </SectionCard>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useViewState } from '~/composables/useViewState'
import type { AreaPedidosConfig } from '~/types/servicios'
import PageHeader from '~/components/shared/PageHeader.vue'
import StatCard from '~/components/shared/StatCard.vue'
import StatusBadge from '~/components/shared/StatusBadge.vue'
import EmptyState from '~/components/shared/EmptyState.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import { usePedidosAreaStore } from '~/stores/pedidosArea'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{ config: AreaPedidosConfig }>()

const pedidosStore = usePedidosAreaStore()
const authStore = useAuthStore()

onMounted(async () => {
  const idHotel = authStore.user?.idHotel
  if (idHotel) {
    try {
      await pedidosStore.cargarPedidos(idHotel, props.config.categoria)
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
const pedidosRecientes = computed(() => pedidosStore.pedidos.slice(0, 5))
const hasData = computed(() => pedidosStore.pedidos.length > 0)
const viewState = useViewState(
  computed(() => pedidosStore.loading),
  hasData,
  computed(() => pedidosStore.error),
  computed(() => pedidosStore.unavailable),
)

// Mapeos de estado a presentación (basados en los valores reales del API)
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
  fecha ? new Date(fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '—'
const capitalizar = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)
</script>
