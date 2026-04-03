<template>
  <div class="ds-page">
    <PageHeader
      title="Dashboard SaaS"
      subtitle="Vista general de hoteles, actividad y crecimiento de la plataforma"
    >
      <template #status>
        <StatusBadge status="success" label="Plataforma estable" />
      </template>
      <template #actions>
        <v-btn
          prepend-icon="mdi-refresh"
          color="primary"
          variant="tonal"
          :loading="isLoading"
          @click="cargarMetricas"
        >
          Actualizar
        </v-btn>
      </template>
    </PageHeader>

    <SectionCard :padded="false">
      <v-alert type="info" variant="tonal">
        Los módulos avanzados de planes, configuración y soporte siguen visibles, pero algunas funciones dependen de endpoints que aún no están desplegados en todo el backend.
      </v-alert>
    </SectionCard>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Hoteles activos"
          :value="metricasPlataforma?.hotelesActivos || 0"
          icon="mdi-hotel"
          color="primary"
          :helper="`${metricasCrecimiento?.hotelesNuevos ?? 0} nuevos en el período`"
          :loading="isLoading"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Usuarios totales"
          :value="metricasPlataforma?.usuariosTotales || 0"
          icon="mdi-account-multiple"
          color="info"
          :helper="`${metricasCrecimiento?.usuariosNuevos ?? 0} nuevos usuarios`"
          :loading="isLoading"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Servicios activos"
          :value="metricasPlataforma?.serviciosActivos || 0"
          icon="mdi-briefcase-outline"
          color="success"
          :helper="`${metricasCrecimiento?.reservasPeriodo ?? 0} reservas en el período`"
          :loading="isLoading"
        />
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Ingresos SaaS"
          :value="currencyLabel"
          icon="mdi-cash-multiple"
          color="warning"
          helper="Lectura consolidada de la plataforma"
          :loading="isLoading"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="7">
        <v-card class="card-glow pa-6 h-100">
          <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
            <div>
              <div class="text-subtitle-1 font-weight-bold">Acciones prioritarias</div>
              <div class="text-body-2 text-medium-emphasis">
                Navegación rápida a los módulos con soporte operativo actual.
              </div>
            </div>
            <v-chip color="primary" variant="tonal" size="small">Superadmin</v-chip>
          </div>

          <v-row>
            <v-col v-for="action in acciones" :key="action.to" cols="12" sm="6">
              <v-card class="card-glow pa-4 h-100 cursor-pointer" variant="outlined" @click="navigateTo(action.to)">
                <v-avatar :color="action.color" size="52" variant="tonal" rounded="lg" class="mb-3">
                  <v-icon :icon="action.icon" size="26" />
                </v-avatar>
                <div class="text-subtitle-2 font-weight-bold mb-1">{{ action.title }}</div>
                <div class="text-body-2 text-medium-emphasis mb-3">{{ action.description }}</div>
                <v-chip :color="action.statusColor" size="small" variant="tonal">{{ action.status }}</v-chip>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card class="card-glow pa-6 h-100">
          <div class="text-subtitle-1 font-weight-bold mb-4">Lectura del período</div>

          <v-list class="bg-transparent" density="comfortable">
            <v-list-item prepend-icon="mdi-trending-up" title="Tasa de crecimiento">
              <template #append>
                <span class="text-body-2 font-weight-medium">{{ metricasCrecimiento?.tasaCrecimiento ?? 0 }}%</span>
              </template>
            </v-list-item>

            <v-list-item prepend-icon="mdi-office-building-outline" title="Ingreso promedio">
              <template #append>
                <span class="text-body-2 font-weight-medium">${{ formatCurrency(metricasCrecimiento?.ingresoPromedio ?? 0) }}</span>
              </template>
            </v-list-item>

            <v-list-item prepend-icon="mdi-chart-timeline-variant" title="Cobertura de datos">
              <template #append>
                <span class="text-caption text-medium-emphasis">{{ metricasCrecimiento?.periodo ?? 'mes' }}</span>
              </template>
            </v-list-item>
          </v-list>

          <v-divider class="my-4" />

          <div class="text-caption text-medium-emphasis mb-2">Estado de disponibilidad</div>
          <v-progress-linear color="primary" model-value="60" rounded />
          <div class="text-caption text-medium-emphasis mt-2">
            La base operacional está disponible; la capa avanzada de analítica aún se está cerrando por etapas.
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import PageHeader from '~/components/shared/PageHeader.vue'
import StatusBadge from '~/components/shared/StatusBadge.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'
import { useSuperAdminMetricas } from '~/composables/useSuperAdminMetricas'

import { UserRole } from '~/types/auth'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.SUPERADMIN],
  layout: 'superadmin'
})

const { metricasPlataforma, metricasCrecimiento, isLoading, obtenerMetricasPlataforma, obtenerMetricasCrecimiento } = useSuperAdminMetricas()

const acciones = [
  {
    to: '/superadmin/hoteles',
    title: 'Gestión de hoteles',
    description: 'Alta, seguimiento de estado y revisión de operación base.',
    icon: 'mdi-domain-plus',
    color: 'primary',
    status: 'Operativo',
    statusColor: 'success',
  },
  {
    to: '/superadmin/categorias',
    title: 'Categorías globales',
    description: 'Módulo estable para ordenar servicios reutilizables.',
    icon: 'mdi-shape-outline',
    color: 'success',
    status: 'Operativo',
    statusColor: 'success',
  },
  {
    to: '/superadmin/metricas',
    title: 'Métricas de plataforma',
    description: 'Resumen analítico sin exportaciones ni gráficas avanzadas todavía.',
    icon: 'mdi-chart-line',
    color: 'warning',
    status: 'Parcial',
    statusColor: 'warning',
  },
  {
    to: '/superadmin/planes',
    title: 'Planes SaaS',
    description: 'Visualización de planes disponible. Escritura en despliegue backend.',
    icon: 'mdi-layers-outline',
    color: 'info',
    status: 'En despliegue',
    statusColor: 'info',
  },
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const currencyLabel = computed(() => {
  return `$${formatCurrency(metricasPlataforma.value?.ingresosSaaS || 0)}`
})

onMounted(async () => {
  await cargarMetricas()
})

const cargarMetricas = async () => {
  await Promise.all([
    obtenerMetricasPlataforma(),
    obtenerMetricasCrecimiento('mes'),
  ])
}
</script>
