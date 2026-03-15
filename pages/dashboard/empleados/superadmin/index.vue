<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold mb-1">Panel de Control</h1>
      <p class="text-body-2 text-medium-emphasis">
        Bienvenido {{ authStore.user?.fullName || 'Empleado' }}
      </p>
    </div>

    <!-- Tarjetas de Acceso Rápido por Rol -->
    <v-row class="mb-6">
      <!-- Acceso para Superadmin y Admin -->
      <v-col v-if="canAccessUsers" cols="12" sm="6" md="3">
        <router-link to="/dashboard/empleados/usuarios" custom v-slot="{ navigate }">
          <v-card class="card-glow pa-4 h-100 cursor-pointer" @click="navigate">
            <div class="d-flex flex-column align-center text-center">
              <v-avatar color="primary" size="60" variant="tonal" class="mb-3" rounded="lg">
                <v-icon icon="mdi-account-group" size="30" />
              </v-avatar>
              <h3 class="text-subtitle-2 font-weight-bold mb-1">Usuarios</h3>
              <p class="text-caption text-medium-emphasis">Gestionar usuarios del sistema</p>
            </div>
          </v-card>
        </router-link>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <router-link to="/dashboard/empleados/reservas" custom v-slot="{ navigate }">
          <v-card class="card-glow pa-4 h-100 cursor-pointer" @click="navigate">
            <div class="d-flex flex-column align-center text-center">
              <v-avatar color="warning" size="60" variant="tonal" class="mb-3" rounded="lg">
                <v-icon icon="mdi-calendar-check" size="30" />
              </v-avatar>
              <h3 class="text-subtitle-2 font-weight-bold mb-1">Reservas</h3>
              <p class="text-caption text-medium-emphasis">Gestionar reservas del hotel</p>
            </div>
          </v-card>
        </router-link>
      </v-col>

      <v-col v-if="canAccessRooms" cols="12" sm="6" md="3">
        <router-link to="/dashboard/empleados/habitaciones" custom v-slot="{ navigate }">
          <v-card class="card-glow pa-4 h-100 cursor-pointer" @click="navigate">
            <div class="d-flex flex-column align-center text-center">
              <v-avatar color="info" size="60" variant="tonal" class="mb-3" rounded="lg">
                <v-icon icon="mdi-door" size="30" />
              </v-avatar>
              <h3 class="text-subtitle-2 font-weight-bold mb-1">Habitaciones</h3>
              <p class="text-caption text-medium-emphasis">Gestionar habitaciones</p>
            </div>
          </v-card>
        </router-link>
      </v-col>

      <v-col v-if="canAccessOrders" cols="12" sm="6" md="3">
        <router-link to="/dashboard/empleados/pedidos" custom v-slot="{ navigate }">
          <v-card class="card-glow pa-4 h-100 cursor-pointer" @click="navigate">
            <div class="d-flex flex-column align-center text-center">
              <v-avatar color="success" size="60" variant="tonal" class="mb-3" rounded="lg">
                <v-icon icon="mdi-clipboard-list" size="30" />
              </v-avatar>
              <h3 class="text-subtitle-2 font-weight-bold mb-1">Pedidos</h3>
              <p class="text-caption text-medium-emphasis">Gestionar pedidos de servicios</p>
            </div>
          </v-card>
        </router-link>
      </v-col>
    </v-row>

    <!-- Tarjeta recentement añadida sin acceso -->
    <v-card v-if="!hasAnyAccess" class="card-glow pa-6">
      <v-card-text class="text-center py-8">
        <v-icon icon="mdi-lock-outline" size="80" color="warning" class="mb-4 opacity-50" />
        <h3 class="text-h6 font-weight-medium mb-2">Acceso Limitado</h3>
        <p class="text-body-2 text-medium-emphasis">
          Tu rol actualmente no tiene acceso a ningún módulo administrativo.
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UserRole } from '~/types/auth'
import { useAuthStore } from '~/stores/auth'
import { usePermissions } from '~/composables/usePermissions'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.SUPERADMIN],
})

useHead({ title: 'Panel de Control' })

const authStore = useAuthStore()
const { hasRole, hasAnyRole } = usePermissions()

const canAccessUsers = computed(() => hasAnyRole('superadmin', 'admin'))
const canAccessRooms = computed(() => hasAnyRole('superadmin', 'admin'))
const canAccessOrders = computed(() => hasAnyRole('cafeteria', 'lavanderia', 'spa', 'room_service'))
const hasAnyAccess = computed(() => canAccessUsers.value || canAccessRooms.value || canAccessOrders.value)
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: all 0.3s ease;
}

.cursor-pointer:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
}

.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.h-100 {
  height: 100%;
}
</style>


