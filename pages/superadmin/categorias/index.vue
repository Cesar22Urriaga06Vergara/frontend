<template>
  <div>
    <PageHeader
      title="Categorias de servicios"
      subtitle="Define y administra las categorias globales para los hoteles"
    >
      <template #status>
        <v-chip color="primary" variant="tonal" size="small">
          {{ categorias.length }} categorias
        </v-chip>
      </template>
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="dialogoCategorias = true">
          Nueva categoria
        </v-btn>
      </template>
    </PageHeader>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Total"
          :value="categorias.length"
          icon="mdi-shape-outline"
          color="primary"
          :loading="isLoading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Activas"
          :value="categoriasActivas"
          icon="mdi-check-circle-outline"
          color="success"
          :loading="isLoading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Inactivas"
          :value="categoriasInactivas"
          icon="mdi-pause-circle-outline"
          color="warning"
          :loading="isLoading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Con descripcion"
          :value="categoriasConDescripcion"
          icon="mdi-text-box-check-outline"
          color="info"
          :loading="isLoading"
        />
      </v-col>
    </v-row>

    <SectionCard v-if="error" :padded="false" class="mb-6">
      <EmptyState
        icon="mdi-alert-circle-outline"
        title="No fue posible cargar categorias"
        :description="error"
        action-label="Reintentar"
        @action="obtenerCategorias()"
      />
    </SectionCard>

    <StandardDataTable
      v-else
      title="Listado de categorias"
      subtitle="Activa, desactiva o elimina categorias segun politica operativa"
      :headers="headers"
      :items="categorias"
      :loading="isLoading"
      :items-per-page="10"
      empty-icon="mdi-tag-off-outline"
      empty-title="No hay categorias registradas"
      empty-description="Crea una categoria para comenzar a clasificar servicios."
      empty-action-label="Crear categoria"
      @empty-action="dialogoCategorias = true"
    >
      <template #item.nombre="{ item }">
        <div class="font-weight-medium">{{ item.nombre }}</div>
      </template>

      <template #item.codigo="{ item }">
        <span class="text-caption text-medium-emphasis font-mono">{{ item.codigo }}</span>
      </template>

      <template #item.descripcion="{ item }">
        <span>{{ item.descripcion || 'Sin descripcion' }}</span>
      </template>

      <template #item.activa="{ item }">
        <v-chip :color="item.activa ? 'success' : 'error'" size="small" variant="tonal">
          {{ item.activa ? 'Activa' : 'Inactiva' }}
        </v-chip>
      </template>

      <template #item.acciones="{ item }">
        <div class="d-flex align-center ga-1 justify-end">
          <v-btn
            size="small"
            variant="text"
            :color="item.activa ? 'warning' : 'success'"
            @click="toggleCategoria(item.id, !item.activa)"
          >
            {{ item.activa ? 'Desactivar' : 'Activar' }}
          </v-btn>
          <v-btn
            size="small"
            variant="text"
            color="error"
            icon="mdi-delete-outline"
            @click="eliminarCategoria(item.id)"
          />
        </div>
      </template>
    </StandardDataTable>

    <v-dialog v-model="dialogoCategorias" max-width="560">
      <SectionCard
        title="Nueva categoria"
        subtitle="Completa nombre, codigo y descripcion para registrarla"
      >
        <v-text-field v-model="formCategoria.nombre" label="Nombre" class="mb-3" required />
        <v-text-field v-model="formCategoria.codigo" label="Codigo unico" class="mb-3" required />
        <v-textarea v-model="formCategoria.descripcion" label="Descripcion" rows="3" class="mb-4" />

        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" @click="dialogoCategorias = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="isLoading" @click="guardarCategoria">Crear</v-btn>
        </div>
      </SectionCard>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, onMounted } from 'vue'
import { useSuperAdminCategorias } from '~/composables/useSuperAdminCategorias'
import { useNotification } from '~/composables/useNotification'
import { useAuthStore } from '~/stores/auth'
import { UserRole } from '~/types/auth'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import EmptyState from '~/components/shared/EmptyState.vue'
import StatCard from '~/components/shared/StatCard.vue'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.SUPERADMIN],
  layout: 'superadmin',
})

useHead({ title: 'Categorias de Servicios' })

const authStore = useAuthStore()
const notification = useNotification()

const {
  categorias,
  isLoading,
  error,
  dialogoCategorias,
  obtenerCategorias,
  crearCategoria,
  toggleCategoria,
  eliminarCategoria,
} = useSuperAdminCategorias()

const headers = [
  { title: 'Nombre', key: 'nombre' },
  { title: 'Codigo', key: 'codigo', width: '150px' },
  { title: 'Descripcion', key: 'descripcion' },
  { title: 'Estado', key: 'activa', width: '130px' },
  { title: 'Acciones', key: 'acciones', align: 'end', sortable: false, width: '210px' },
]

const categoriasActivas = computed(() => categorias.value.filter((cat) => cat.activa).length)
const categoriasInactivas = computed(() => categorias.value.filter((cat) => !cat.activa).length)
const categoriasConDescripcion = computed(() => categorias.value.filter((cat) => Boolean(cat.descripcion)).length)

const formCategoria = reactive({
  nombre: '',
  codigo: '',
  descripcion: '',
})

const guardarCategoria = async () => {
  if (!formCategoria.nombre || !formCategoria.codigo) return

  try {
    await crearCategoria({
      idHotel: authStore.user?.idHotel ?? 0,
      nombre: formCategoria.nombre,
      codigo: formCategoria.codigo,
      descripcion: formCategoria.descripcion,
    })

    notification.success('Categoria creada exitosamente')
    dialogoCategorias.value = false
    formCategoria.nombre = ''
    formCategoria.codigo = ''
    formCategoria.descripcion = ''
  } catch {
    notification.error('Error al crear la categoria')
  }
}

onMounted(() => {
  obtenerCategorias()
})
</script>
