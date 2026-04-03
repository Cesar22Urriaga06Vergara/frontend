<template>
  <div>
    <PageHeader
      title="Caja / Folios"
      subtitle="Gestión de cargos, cobros y control diario de folios"
    >
      <template #actions>
        <v-btn prepend-icon="mdi-history" variant="tonal" @click="showHistorial = true">
          Ver historial
        </v-btn>
        <v-btn prepend-icon="mdi-refresh" variant="tonal" @click="recargar" :loading="loading">
          Recargar
        </v-btn>
      </template>
    </PageHeader>

    <!-- Stats bar -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Folios abiertos"
          :value="statsStore.foliosDelDia.filter(f => f.estado === 'ABIERTO').length"
          icon="mdi-folder-open"
          color="info"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Folios cerrados" :value="foliosStore.foliosCerrados" icon="mdi-folder-check" color="warning" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Folios pagados" :value="foliosStore.foliosPagados" icon="mdi-cash-check" color="success" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Total cobrado"
          :value="`$${foliosStore.totalIngresos.toLocaleString('es-CO')}`"
          icon="mdi-currency-usd"
          color="primary"
        />
      </v-col>
    </v-row>

    <SectionCard class="mb-6" title="Panel principal" subtitle="Operación de cargos y cobros en habitaciones">
      <CajaPanel />
    </SectionCard>

    <StandardDataTable
      title="Historial del día"
      subtitle="Folios procesados en caja"
      :headers="historialHeaders"
      :items="foliosStore.historialDelDia"
      :items-per-page="8"
      empty-title="Sin folios registrados"
      empty-description="Cuando existan movimientos aparecerán en este listado."
    >
      <template #item.numeroHabitacion="{ item }">
        #{{ item.numeroHabitacion }}
      </template>
      <template #item.estado="{ item }">
        <v-chip size="small" :color="estadoColor(item.estado)">
          {{ estadoLabel(item.estado) }}
        </v-chip>
      </template>
      <template #item.total="{ item }">
        <span class="font-weight-bold">${{ item.total.toLocaleString('es-CO') }}</span>
      </template>
    </StandardDataTable>

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
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import CajaPanel from '~/components/recepcionista/Caja/CajaPanel.vue'

const { can } = usePermissions()
const folios = useFolios()
const foliosStore = useFoliosStore()

// Local state
const showHistorial = ref(false)
const loading = ref(false)

// Guards
import { UserRole } from '~/types/auth'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.RECEPCIONISTA, UserRole.ADMIN, UserRole.SUPERADMIN],
  layout: 'recepcion'
})

const historialHeaders = [
  { title: 'Habitación', key: 'numeroHabitacion' },
  { title: 'Cliente', key: 'nombreCliente' },
  { title: 'Estado', key: 'estado' },
  { title: 'Total', key: 'total' },
  { title: 'Medio Pago', key: 'medioPago' },
]

// Stats (mock - en real vendría de un composable)
const statsStore = computed(() => ({
  foliosDelDia: foliosStore.historialDelDia
}))

const recargar = async () => {
  loading.value = true
  try {
    const historial = await folios.obtenerHistorial()
    foliosStore.setHistorialDelDia(historial)
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

