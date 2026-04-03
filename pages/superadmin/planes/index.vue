<template>
  <div>
    <PageHeader title="Gestión de Planes" :subtitle="`Total: ${planes.length} planes`">
      <template #actions>
        <v-btn color="primary" @click="abrirDialogoCrearPlan" prepend-icon="mdi-plus" :disabled="true">
          Crear Plan
        </v-btn>
      </template>
    </PageHeader>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Planes totales" :value="planes.length" icon="mdi-file-document-multiple" color="primary" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Activos" :value="planes.filter(p => p.esActivo).length" icon="mdi-check-circle" color="success" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Inactivos" :value="planes.filter(p => !p.esActivo).length" icon="mdi-close-circle" color="warning" />
      </v-col>
    </v-row>

    <v-alert
      type="warning"
      variant="tonal"
      class="mb-6"
      prepend-icon="mdi-clock-alert-outline"
    >
      <strong>Módulo en despliegue.</strong> La visualización está disponible, pero las operaciones de escritura (crear, editar, desactivar) aún no están activas en el backend. Los cambios no se guardarán.
    </v-alert>

    <StandardDataTable
      class="mb-8"
      title="Planes"
      subtitle="Catálogo de planes y límites comerciales"
      :headers="planesHeaders"
      :items="planes"
      :loading="isLoading"
      empty-title="No hay planes configurados"
      empty-description="Las funciones de escritura estarán disponibles próximamente."
    >
      <template #item.nombre="{ item }">
        <span class="font-weight-medium">{{ item.nombre }}</span>
      </template>
      <template #item.precioMensual="{ item }">
        ${{ item.precioMensual.toLocaleString('es-CO') }}
      </template>
      <template #item.modulos="{ item }">
        <div class="d-flex ga-1 flex-wrap">
          <v-chip v-for="mod in item.modulos.slice(0, 2)" :key="mod" size="small">{{ mod }}</v-chip>
          <v-chip v-if="item.modulos.length > 2" size="small">+{{ item.modulos.length - 2 }}</v-chip>
        </div>
      </template>
      <template #item.esActivo="{ item }">
        <v-chip :color="item.esActivo ? 'green' : 'red'" size="small" text-color="white">
          {{ item.esActivo ? 'Activo' : 'Inactivo' }}
        </v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-menu>
          <template #activator="{ props }">
            <v-btn icon="mdi-dots-vertical" size="small" variant="text" v-bind="props" />
          </template>
          <v-list>
            <v-list-item @click="abrirDialogoEditarPlan(item)">
              <template #prepend><v-icon>mdi-pencil</v-icon></template>
              <v-list-item-title>Editar</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="item.esActivo" @click="desactivarPlan(item.id)">
              <template #prepend><v-icon color="red">mdi-toggle-off</v-icon></template>
              <v-list-item-title>Desactivar</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </StandardDataTable>

    <SectionCard class="mb-8" title="Límites del Sistema" subtitle="Parámetros y topes por categoría">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="limite in limites" :key="limite.clave" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900 dark:text-white">{{ limite.descripcion }}</h3>
            <v-chip size="small" variant="outlined">{{ limite.categoria }}</v-chip>
          </div>
          <div class="mb-4">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Valor actual</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ limite.valorActual }}</p>
          </div>
          <v-text-field
            v-model.number="limite.valorActual"
            label="Nuevo valor"
            type="number"
            :min="limite.valorMinimo"
            :max="limite.valorMaximo"
            density="compact"
            @blur="actualizarLimite(limite.clave, { valorActual: limite.valorActual })"
          ></v-text-field>
        </div>
      </div>
    </SectionCard>

    <!-- Diálogo Crear/Editar Plan -->
    <v-dialog v-model="dialogo" max-width="600">
      <v-card>
        <v-card-title>{{ modoEdicion ? 'Editar Plan' : 'Crear Nuevo Plan' }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="formPlan.nombre"
            label="Nombre del Plan"
            required
            class="mb-4"
          ></v-text-field>
          <v-textarea
            v-model="formPlan.descripcion"
            label="Descripción"
            class="mb-4"
          ></v-textarea>
          <v-text-field
            v-model.number="formPlan.precioMensual"
            label="Precio Mensual (COP)"
            type="number"
            class="mb-4"
          ></v-text-field>
          <v-text-field
            v-model.number="formPlan.precioAnual"
            label="Precio Anual (COP)"
            type="number"
            class="mb-4"
          ></v-text-field>
          <v-text-field
            v-model.number="formPlan.usuariosMaximos"
            label="Usuarios Máximos"
            type="number"
            class="mb-4"
          ></v-text-field>
          <v-text-field
            v-model.number="formPlan.habitacionesMaximas"
            label="Habitaciones Máximas"
            type="number"
            class="mb-4"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="cerrarDialogo">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarPlan" :loading="isLoading">
            {{ modoEdicion ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import { useSuperAdminPlanes } from '~/composables/useSuperAdminPlanes'
import type { CreatePlanDto, UpdatePlanDto } from '~/types/superadmin'

import { UserRole } from '~/types/auth'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.SUPERADMIN],
  layout: 'superadmin'
})

const planesHeaders = [
  { title: 'Nombre', key: 'nombre' },
  { title: 'Precio Mensual', key: 'precioMensual' },
  { title: 'Usuarios Máx', key: 'usuariosMaximos' },
  { title: 'Habitaciones Máx', key: 'habitacionesMaximas' },
  { title: 'Módulos', key: 'modulos' },
  { title: 'Estado', key: 'esActivo' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const {
  planes,
  planSeleccionado,
  limites,
  isLoading,
  dialogo,
  modoEdicion,
  obtenerPlanes,
  crearPlan,
  actualizarPlan,
  desactivarPlan,
  abrirDialogoCrearPlan,
  abrirDialogoEditarPlan,
  cerrarDialogo,
  obtenerLimites,
  actualizarLimite
} = useSuperAdminPlanes()

const formPlan = ref<CreatePlanDto>({
  nombre: '',
  descripcion: '',
  precioMensual: 0,
  precioAnual: 0,
  usuariosMaximos: 5,
  habitacionesMaximas: 20,
  modulos: []
})

const guardarPlan = async () => {
  if (modoEdicion.value && planSeleccionado.value) {
    const datos: UpdatePlanDto = formPlan.value
    await actualizarPlan(planSeleccionado.value.id, datos)
  } else {
    await crearPlan(formPlan.value)
  }
  formPlan.value = {
    nombre: '',
    descripcion: '',
    precioMensual: 0,
    precioAnual: 0,
    usuariosMaximos: 5,
    habitacionesMaximas: 20,
    modulos: []
  }
}

onMounted(async () => {
  await obtenerPlanes()
  await obtenerLimites()
})
</script>

