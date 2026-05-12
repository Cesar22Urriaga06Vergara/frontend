<template>
  <div class="ds-page">
    <PageHeader :title="`Bienvenido, ${authStore.userName}`" subtitle="Panel de control del huésped">
      <template #status>
        <StatusBadge :status="estadiaStatus" :label="estadiaLabel" />
      </template>
    </PageHeader>

    <!-- Info rápida del huésped -->
    <SectionCard title="Resumen personal" subtitle="Datos de sesión y acceso rápido a perfil">
      <v-row>
        <v-col cols="12" sm="6">
          <v-card class="card-glow pa-5 h-100">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="44" variant="tonal" rounded="lg" class="mr-4">
              <v-icon icon="mdi-account" size="22" />
            </v-avatar>
            <div>
              <div class="text-caption text-medium-emphasis">Huésped</div>
              <div class="text-subtitle-2 font-weight-bold">{{ authStore.userName }}</div>
              <div class="text-caption text-medium-emphasis">{{ authStore.userEmail }}</div>
            </div>
          </div>
        </v-card>
        </v-col>

        <v-col cols="12" sm="6">
          <v-card to="/dashboard/profile" class="card-glow pa-5 h-100" style="cursor: pointer">
          <div class="d-flex align-center">
            <v-avatar color="secondary" size="44" variant="tonal" rounded="lg" class="mr-4">
              <v-icon icon="mdi-account-edit-outline" size="22" />
            </v-avatar>
            <div>
              <div class="text-subtitle-2 font-weight-bold">Editar perfil</div>
              <div class="text-caption text-medium-emphasis">Actualizar información personal</div>
            </div>
            <v-spacer />
            <v-icon icon="mdi-chevron-right" size="20" color="medium-emphasis" />
          </div>
        </v-card>
        </v-col>
      </v-row>
    </SectionCard>

    <!-- Accesos rápidos -->
    <SectionCard title="Accesos rápidos" subtitle="Tareas frecuentes del huésped">
      <v-row>
        <v-col cols="12" sm="6" md="3">
        <v-card to="/cliente/servicios" class="card-glow pa-5" style="cursor: pointer">
          <div class="d-flex align-center">
            <v-avatar color="orange" size="44" variant="tonal" rounded="lg" class="mr-4">
              <v-icon icon="mdi-room-service-outline" size="22" />
            </v-avatar>
            <div>
              <div class="text-subtitle-2 font-weight-bold">Servicios</div>
              <div class="text-caption text-medium-emphasis">Pedir cafetería, spa y más</div>
            </div>
            <v-spacer />
            <v-icon icon="mdi-chevron-right" size="20" color="medium-emphasis" />
          </div>
        </v-card>
      </v-col>

        <v-col cols="12" sm="6" md="3">
        <v-card to="/cliente/servicios/mis-pedidos" class="card-glow pa-5" style="cursor: pointer">
          <div class="d-flex align-center">
            <v-avatar color="blue" size="44" variant="tonal" rounded="lg" class="mr-4">
              <v-icon icon="mdi-clipboard-list-outline" size="22" />
            </v-avatar>
            <div>
              <div class="text-subtitle-2 font-weight-bold">Mis Pedidos</div>
              <div class="text-caption text-medium-emphasis">Ver historial de servicios</div>
            </div>
            <v-spacer />
            <v-icon icon="mdi-chevron-right" size="20" color="medium-emphasis" />
          </div>
        </v-card>
      </v-col>

        <v-col cols="12" sm="6" md="3">
        <v-card to="/cliente/cuenta" class="card-glow pa-5" style="cursor: pointer">
          <div class="d-flex align-center">
            <v-avatar color="green" size="44" variant="tonal" rounded="lg" class="mr-4">
              <v-icon icon="mdi-receipt" size="22" />
            </v-avatar>
            <div>
              <div class="text-subtitle-2 font-weight-bold">Mi Cuenta</div>
              <div class="text-caption text-medium-emphasis">Ver total de consumo</div>
            </div>
            <v-spacer />
            <v-icon icon="mdi-chevron-right" size="20" color="medium-emphasis" />
          </div>
        </v-card>
      </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card to="/cliente/reservas/mis-reservas" class="card-glow pa-5" style="cursor: pointer">
            <div class="d-flex align-center">
              <v-avatar color="primary" size="44" variant="tonal" rounded="lg" class="mr-4">
                <v-icon icon="mdi-calendar-check-outline" size="22" />
              </v-avatar>
              <div>
                <div class="text-subtitle-2 font-weight-bold">Mis Reservas</div>
                <div class="text-caption text-medium-emphasis">Ver y gestionar reservas</div>
              </div>
              <v-spacer />
              <v-icon icon="mdi-chevron-right" size="20" color="medium-emphasis" />
            </div>
          </v-card>
        </v-col>
      </v-row>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { UserRole } from '~/types/auth'
import { useApi } from '~/composables/useApi'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatusBadge from '~/components/shared/StatusBadge.vue'
import type { ViewStatus } from '~/composables/useViewState'

definePageMeta({
  layout: 'cliente',
  middleware: ['auth', 'role'],
  roles: [UserRole.CLIENTE],
})

useHead({ title: 'Dashboard Cliente' })

const authStore = useAuthStore()
const api = useApi()

const cargandoEstadia = ref(false)
const tieneEstadiaActiva = ref(false)
const errorEstadia = ref(false)

const estadiaStatus = computed<ViewStatus>(() => {
  if (cargandoEstadia.value) return 'loading'
  if (errorEstadia.value) return 'unavailable'
  return tieneEstadiaActiva.value ? 'success' : 'empty'
})

const estadiaLabel = computed(() => {
  if (cargandoEstadia.value) return 'Verificando estadía'
  if (errorEstadia.value) return 'Estado no disponible'
  return tieneEstadiaActiva.value ? 'Estadía activa' : 'Sin estadía activa'
})

const cargarEstadoEstadia = async () => {
  if (!authStore.user?.idCliente) {
    tieneEstadiaActiva.value = false
    return
  }

  cargandoEstadia.value = true
  errorEstadia.value = false

  try {
    const reserva = await api.get<any>(`/reservas/activa/${authStore.user.idCliente}`)
    tieneEstadiaActiva.value = Boolean(reserva?.id)
  } catch (error: any) {
    if (error?.statusCode === 404) {
      tieneEstadiaActiva.value = false
    } else {
      errorEstadia.value = true
    }
  } finally {
    cargandoEstadia.value = false
  }
}

onMounted(cargarEstadoEstadia)
</script>
