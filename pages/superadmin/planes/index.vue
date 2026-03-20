<template>
  <div class="planes-page">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">Gestión de Planes</h1>
        <p class="text-gray-600 dark:text-gray-400">Total: {{ planes.length }} planes</p>
      </div>
      <v-btn color="primary" @click="abrirDialogoCrearPlan" prepend-icon="mdi-plus">
        Crear Plan
      </v-btn>
    </div>

    <!-- Tabla de Planes -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-8">
      <v-table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio Mensual</th>
            <th>Usuarios Máx</th>
            <th>Habitaciones Máx</th>
            <th>Módulos</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="plan in planes" :key="plan.id">
            <td class="font-semibold">{{ plan.nombre }}</td>
            <td>${{ plan.precioMensual.toLocaleString('es-CO') }}</td>
            <td>{{ plan.usuariosMaximos }}</td>
            <td>{{ plan.habitacionesMaximas }}</td>
            <td>
              <div class="flex gap-1 flex-wrap">
                <v-chip v-for="mod in plan.modulos.slice(0, 2)" :key="mod" size="small">
                  {{ mod }}
                </v-chip>
                <v-chip v-if="plan.modulos.length > 2" size="small">
                  +{{ plan.modulos.length - 2 }}
                </v-chip>
              </div>
            </td>
            <td>
              <v-chip
                :color="plan.esActivo ? 'green' : 'red'"
                size="small"
                text-color="white"
              >
                {{ plan.esActivo ? 'Activo' : 'Inactivo' }}
              </v-chip>
            </td>
            <td>
              <v-menu>
                <template #activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" size="small" variant="text" v-bind="props"></v-btn>
                </template>
                <v-list>
                  <v-list-item @click="abrirDialogoEditarPlan(plan)">
                    <template #prepend><v-icon>mdi-pencil</v-icon></template>
                    <v-list-item-title>Editar</v-list-item-title>
                  </v-list-item>
                  <v-list-item v-if="plan.esActivo" @click="desactivarPlan(plan.id)">
                    <template #prepend><v-icon color="red">mdi-toggle-off</v-icon></template>
                    <v-list-item-title>Desactivar</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- Sección Límites Sistema -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Límites del Sistema</h2>
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
    </div>

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
import { useSuperAdminPlanes } from '~/composables/useSuperAdminPlanes'
import type { CreatePlanDto, UpdatePlanDto } from '~/types/superadmin'

import { UserRole } from '~/types/auth'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.SUPERADMIN],
  layout: 'default'
})

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

<style scoped>
.planes-page {
  padding: 2rem;
}
</style>
