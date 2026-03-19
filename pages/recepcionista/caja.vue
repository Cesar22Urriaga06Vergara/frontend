<template>
  <div class="caja-page">
    <!-- Breadcrumb + titulo -->
    <v-breadcrumbs :items="breadcrumbs" class="mb-4"></v-breadcrumbs>

    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Caja / Folios</h1>
        <p class="text-body-2 text-medium-emphasis">
          Gestión de cargos y cobros de habitaciones
        </p>
      </div>
      <div class="d-flex gap-2">
        <v-btn
          prepend-icon="mdi-history"
          variant="tonal"
          @click="showHistorial = true"
        >
          Ver historial
        </v-btn>
        <v-btn
          prepend-icon="mdi-refresh"
          variant="tonal"
          @click="recargar"
          :loading="loading"
        >
          Recargar
        </v-btn>
      </div>
    </div>

    <!-- Stats bar -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Folios abiertos</div>
            <div class="text-h5 font-weight-bold">{{ statsStore.foliosDelDia.filter(f => f.estado === 'ABIERTO').length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Folios cerrados</div>
            <div class="text-h5 font-weight-bold">{{ foliosStore.foliosCerrados }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Folios pagados</div>
            <div class="text-h5 font-weight-bold">{{ foliosStore.foliosPagados }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Total cobrado</div>
            <div class="text-h5 font-weight-bold text-success">
              ${{ foliosStore.totalIngresos.toLocaleString('es-CO') }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Panel principal -->
    <CajaPanel />

    <!-- Dialog historial -->
    <v-dialog v-model="showHistorial" max-width="900px">
      <v-card title="Historial de folios del día">
        <v-card-text>
          <v-table>
            <thead>
              <tr>
                <th>Habitación</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th class="text-right">Total</th>
                <th class="text-right">Cobrado</th>
                <th>Método pago</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="folio in foliosStore.historialDelDia" :key="folio.id">
                <td>#{{ folio.numeroHabitacion }}</td>
                <td>{{ folio.nombreCliente || '-' }}</td>
                <td>
                  <v-chip size="small" :color="estadoColor(folio.estado)">
                    {{ estadoLabel(folio.estado) }}
                  </v-chip>
                </td>
                <td class="text-right font-weight-bold">${{ folio.total.toLocaleString('es-CO') }}</td>
                <td class="text-right">
                  <span v-if="folio.montoRecibido" class="text-success font-weight-bold">
                    ${{ folio.montoRecibido.toLocaleString('es-CO') }}
                  </span>
                  <span v-else class="text-medium-emphasis">-</span>
                </td>
                <td>
                  <v-chip v-if="folio.medioPago" size="small" variant="outlined">
                    {{ folio.medioPago }}
                  </v-chip>
                  <span v-else class="text-medium-emphasis">-</span>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFolios } from '~/composables/useFolios'
import { useFoliosStore } from '~/stores/folios'
import { usePermissions } from '~/composables/usePermissions'
import CajaPanel from '~/components/recepcionista/Caja/CajaPanel.vue'

const { can } = usePermissions()
const folios = useFolios()
const foliosStore = useFoliosStore()

// Local state
const showHistorial = ref(false)
const loading = ref(false)

// Guards
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

// Breadcrumbs
const breadcrumbs = computed(() => [
  {
    title: 'Dashboard',
    href: '/dashboard'
  },
  {
    title: 'Recepción',
    href: '/recepcionista'
  },
  {
    title: 'Caja / Folios',
    disabled: true
  }
])

// Stats (mock - en real vendría de un composable)
const statsStore = computed(() => ({
  foliosDelDia: foliosStore.historialDelDia
}))

const recargar = async () => {
  loading.value = true
  try {
    await folios.obtenerHistorial()
  } finally {
    loading.value = false
  }
}

const estadoColor = (estado: string) => {
  switch (estado) {
    case 'ABIERTO':
      return 'info'
    case 'CERRADO':
      return 'warning'
    case 'PAGADO':
      return 'success'
    case 'CANCELADO':
      return 'error'
    default:
      return 'default'
  }
}

const estadoLabel = (estado: string) => {
  switch (estado) {
    case 'ABIERTO':
      return 'Abierto'
    case 'CERRADO':
      return 'Cerrado'
    case 'PAGADO':
      return 'Pagado'
    case 'CANCELADO':
      return 'Cancelado'
    default:
      return estado
  }
}

// Permiso check
if (!can('caja:ver')) {
  throw createError({
    statusCode: 403,
    statusMessage: 'No tienes acceso a esta página'
  })
}
</script>

<style scoped>
.caja-page {
  width: 100%;
}
</style>
