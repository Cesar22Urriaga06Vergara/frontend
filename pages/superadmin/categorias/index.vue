<template>
  <div class="categorias-page">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Categorías de Servicios -->
      <div>
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Categorías de Servicios</h2>
          <v-btn size="small" color="primary" @click="dialogoCategorias = true" prepend-icon="mdi-plus">
            Nueva
          </v-btn>
        </div>

        <div class="space-y-4">
          <div v-for="cat in categorias" :key="cat.id" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-white">{{ cat.nombre }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ cat.descripcion }}</p>
                <div class="mt-3">
                  <v-chip
                    :color="cat.esActiva ? 'green' : 'red'"
                    size="small"
                    text-color="white"
                  >
                    {{ cat.esActiva ? 'Activa' : 'Inactiva' }}
                  </v-chip>
                </div>
              </div>
              <v-menu>
                <template #activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" size="small" variant="text" v-bind="props"></v-btn>
                </template>
                <v-list>
                  <v-list-item @click="desactivarCategoria(cat.id)">
                    <template #prepend><v-icon>mdi-toggle-off</v-icon></template>
                    <v-list-item-title>{{ cat.esActiva ? 'Desactivar' : 'Activar' }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>
        </div>
      </div>

      <!-- Módulos del Sistema -->
      <div>
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Módulos del Sistema</h2>
          <v-btn size="small" color="primary" @click="dialogoModulos = true" prepend-icon="mdi-plus">
            Nuevo
          </v-btn>
        </div>

        <div class="space-y-4">
          <div v-for="mod in modulos" :key="mod.id" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-white">{{ mod.nombre }}</h3>
                <p class="text-xs text-gray-500 dark:text-gray-500 font-mono">{{ mod.clave }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ mod.descripcion }}</p>
                <div class="mt-3">
                  <v-chip
                    :color="mod.esActivo ? 'green' : 'red'"
                    size="small"
                    text-color="white"
                  >
                    {{ mod.esActivo ? 'Activo' : 'Inactivo' }}
                  </v-chip>
                </div>
              </div>
              <v-menu>
                <template #activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" size="small" variant="text" v-bind="props"></v-btn>
                </template>
                <v-list>
                  <v-list-item @click="desactivarModulo(mod.id)">
                    <template #prepend><v-icon>mdi-toggle-off</v-icon></template>
                    <v-list-item-title>{{ mod.esActivo ? 'Desactivar' : 'Activar' }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Diálogo Categorías -->
    <v-dialog v-model="dialogoCategorias" max-width="500">
      <v-card>
        <v-card-title>Nueva Categoría</v-card-title>
        <v-card-text>
          <v-text-field label="Nombre" class="mb-4"></v-text-field>
          <v-textarea label="Descripción" class="mb-4"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialogoCategorias = false">Cancelar</v-btn>
          <v-btn color="primary" @click="dialogoCategorias = false">Crear</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo Módulos -->
    <v-dialog v-model="dialogoModulos" max-width="500">
      <v-card>
        <v-card-title>Nuevo Módulo</v-card-title>
        <v-card-text>
          <v-text-field label="Nombre" class="mb-4"></v-text-field>
          <v-text-field label="Clave (slug)" class="mb-4"></v-text-field>
          <v-textarea label="Descripción" class="mb-4"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialogoModulos = false">Cancelar</v-btn>
          <v-btn color="primary" @click="dialogoModulos = false">Crear</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSuperAdminCategorias } from '~/composables/useSuperAdminCategorias'

definePageMeta({
  middleware: ['auth'],
  layout: 'default'
})

const {
  categorias,
  modulos,
  dialogoCategorias,
  dialogoModulos,
  obtenerCategorias,
  obtenerModulos,
  desactivarCategoria,
  desactivarModulo
} = useSuperAdminCategorias()

onMounted(async () => {
  await obtenerCategorias()
  await obtenerModulos()
})
</script>

<style scoped>
.categorias-page {
  padding: 2rem;
}
</style>
