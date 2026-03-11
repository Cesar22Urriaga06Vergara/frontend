<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-h4 font-weight-bold mb-2">SuperAdmin Dashboard</h1>
      <p class="text-body-1 text-medium-emphasis">
        Panel de control del sistema Hotel Sena 2026
      </p>
    </div>

    <!-- Tarjetas de estadísticas -->
    <v-row class="mb-8">
      <v-col cols="12" sm="6" md="4">
        <v-card class="card-glow pa-6 text-center">
          <v-icon icon="mdi-calendar-check" size="48" color="success" class="mb-2" />
          <div class="text-h6 font-weight-bold">{{ reservasStore.totalCount }}</div>
          <div class="text-body-2 text-medium-emphasis">Reservas Totales</div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="card-glow pa-6 text-center">
          <v-icon icon="mdi-building" size="48" color="primary" class="mb-2" />
          <div class="text-h6 font-weight-bold">-</div>
          <div class="text-body-2 text-medium-emphasis">Hoteles Activos</div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="card-glow pa-6 text-center">
          <v-icon icon="mdi-account-group" size="48" color="warning" class="mb-2" />
          <div class="text-h6 font-weight-bold">-</div>
          <div class="text-body-2 text-medium-emphasis">Empleados Activos</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Menú rápido -->
    <v-card class="card-glow pa-6">
      <div class="text-subtitle-1 font-weight-bold mb-4">Accesos rápidos</div>
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <nuxt-link to="/dashboard/superadmin/reservas" class="no-decoration">
            <v-btn
              color="primary"
              block
              prepend-icon="mdi-calendar-check-outline"
            >
              Ver Reservas
            </v-btn>
          </nuxt-link>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <nuxt-link to="/dashboard/superadmin/hoteles" class="no-decoration">
            <v-btn
              color="primary"
              block
              prepend-icon="mdi-building-outline"
            >
              Gestionar Hoteles
            </v-btn>
          </nuxt-link>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <nuxt-link to="/dashboard/superadmin/empleados" class="no-decoration">
            <v-btn
              color="primary"
              block
              prepend-icon="mdi-account-group-outline"
            >
              Gestionar Empleados
            </v-btn>
          </nuxt-link>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useReservasStore } from '~/stores/reservas'
import { UserRole } from '~/types/auth'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.SUPERADMIN],
})

useHead({ title: 'SuperAdmin Dashboard' })

const reservasStore = useReservasStore()
</script>

<style scoped>
.no-decoration {
  text-decoration: none;
  color: inherit;
}

.card-glow {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
