<template>
  <div>
    <PageHeader
      title="Métricas de la Plataforma"
      subtitle="Análisis de crecimiento y uso con foco en datos disponibles"
    >
      <template #actions>
        <v-btn-toggle
          v-model="periodoCrecimiento"
          color="primary"
          variant="outlined"
          divided
          mandatory
          @update:model-value="onPeriodoChange"
        >
          <v-btn value="mes">Mes</v-btn>
          <v-btn value="trimestre">Trimestre</v-btn>
          <v-btn value="año">Año</v-btn>
        </v-btn-toggle>
      </template>
    </PageHeader>

    <v-alert class="mb-6" type="info" variant="tonal">
      Esta fase reemplaza los placeholders de gráficas por resúmenes operativos reales. Las exportaciones avanzadas se habilitarán cuando exista soporte backend dedicado.
    </v-alert>

    <v-alert v-if="error" type="warning" variant="tonal" class="mb-6">
      {{ error }}
    </v-alert>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Hoteles nuevos"
          :value="metricasCrecimiento?.hotelesNuevos ?? 0"
          icon="mdi-domain-plus"
          color="primary"
          :loading="isLoading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Usuarios nuevos"
          :value="metricasCrecimiento?.usuariosNuevos ?? 0"
          icon="mdi-account-plus-outline"
          color="info"
          :loading="isLoading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Reservas del período"
          :value="metricasCrecimiento?.reservasPeriodo ?? 0"
          icon="mdi-calendar-range"
          color="success"
          :loading="isLoading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Tasa de crecimiento"
          :value="`${metricasCrecimiento?.tasaCrecimiento ?? 0}%`"
          icon="mdi-trending-up"
          color="warning"
          :loading="isLoading"
        />
      </v-col>
    </v-row>

    <v-row class="mb-6">
      <v-col cols="12" md="7">
        <SectionCard title="Serie del período" subtitle="Datos del período seleccionado">
          <v-skeleton-loader v-if="isLoading" type="list-item-two-line@4" />

            <v-timeline v-else-if="metricasCrecimiento?.datos?.length" density="compact" side="end" truncate-line="both">
              <v-timeline-item
                v-for="dato in metricasCrecimiento.datos"
                :key="String(dato.fecha)"
                dot-color="primary"
                size="small"
              >
                <div class="d-flex justify-space-between flex-wrap ga-2">
                  <div>
                    <div class="text-body-2 font-weight-medium">{{ formatFecha(dato.fecha) }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ dato.hoteles }} hoteles · {{ dato.usuarios }} usuarios
                    </div>
                  </div>
                  <v-chip color="success" size="small" variant="tonal">
                    ${{ formatCurrency(dato.ingresos) }}
                  </v-chip>
                </div>
              </v-timeline-item>
            </v-timeline>

            <div v-else class="text-center py-8">
              <v-icon icon="mdi-chart-timeline-variant" size="48" color="medium-emphasis" class="mb-3" />
              <div class="text-body-2 text-medium-emphasis">No hay datos suficientes para este período.</div>
            </div>
        </SectionCard>
      </v-col>

      <v-col cols="12" md="5">
        <v-card class="card-glow pa-5 h-100">
          <div class="text-subtitle-1 font-weight-bold mb-4">Lectura ejecutiva</div>
          <v-list class="bg-transparent" density="comfortable">
            <v-list-item prepend-icon="mdi-cash" title="Ingreso promedio">
              <template #append>
                <span class="text-body-2 font-weight-medium">${{ formatCurrency(metricasCrecimiento?.ingresoPromedio ?? 0) }}</span>
              </template>
            </v-list-item>
            <v-list-item prepend-icon="mdi-timer-sand" title="Período activo">
              <template #append>
                <span class="text-caption text-medium-emphasis">{{ metricasCrecimiento?.periodo ?? 'mes' }}</span>
              </template>
            </v-list-item>
            <v-list-item prepend-icon="mdi-database-outline" title="Fuente">
              <template #append>
                <span class="text-caption text-medium-emphasis">API consolidada</span>
              </template>
            </v-list-item>
          </v-list>

          <v-divider class="my-4" />

          <v-btn block color="primary" variant="tonal" prepend-icon="mdi-refresh" :loading="isLoading" @click="recargar">
            Recargar métricas
          </v-btn>

          <div class="text-caption text-medium-emphasis mt-3">
            Exportación PDF y CSV deshabilitada en esta fase para evitar prometer una salida que aún no existe en backend.
          </div>
        </v-card>
      </v-col>
    </v-row>

    <StandardDataTable
      title="Datos detallados"
      subtitle="Serie temporal de hoteles, usuarios e ingresos"
      :headers="detallesHeaders"
      :items="detallesItems"
      :loading="isLoading"
      :items-per-page="10"
      empty-icon="mdi-chart-line"
      empty-title="Sin datos disponibles"
      empty-description="No hay registros para el período seleccionado."
    >
      <template #item.fecha="{ item }">
        {{ formatFecha(item.fecha) }}
      </template>
      <template #item.ingresos="{ item }">
        ${{ formatCurrency(item.ingresos) }}
      </template>
    </StandardDataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import { useSuperAdminMetricas } from '~/composables/useSuperAdminMetricas'

import { UserRole } from '~/types/auth'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.SUPERADMIN],
  layout: 'superadmin'
})

const {
  metricasCrecimiento,
  error,
  periodoCrecimiento,
  isLoading,
  obtenerMetricasCrecimiento,
  cambiarPeriodoCrecimiento,
} = useSuperAdminMetricas()

const onPeriodoChange = async (periodo: 'mes' | 'trimestre' | 'año' | null) => {
  if (periodo) {
    await cambiarPeriodoCrecimiento(periodo)
  }
}

const recargar = async () => {
  await obtenerMetricasCrecimiento(periodoCrecimiento.value)
}

const formatFecha = (fecha: string | Date) => new Date(fecha).toLocaleDateString('es-CO')

const formatCurrency = (valor: number) => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}

const detallesHeaders = [
  { title: 'Fecha', key: 'fecha' },
  { title: 'Hoteles', key: 'hoteles' },
  { title: 'Usuarios', key: 'usuarios' },
  { title: 'Ingresos (COP)', key: 'ingresos' },
]

const detallesItems = computed(() => metricasCrecimiento.value?.datos || [])

onMounted(() => {
  obtenerMetricasCrecimiento('mes')
})
</script>

<style scoped>
.metricas-page {
  padding: 2rem;
}
</style>
