<template>
  <div class="pa-4 text-center">
    <h1 class="text-h5 font-weight-bold mb-6">Selecciona tu Área</h1>
    <p class="text-body-2 text-medium-emphasis mb-8">
      Accede al reporte detallado de ingresos y pedidos
    </p>

    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <div class="d-flex flex-column gap-2">
          <v-btn
            to="/dashboard/empleado/reportes/cafeteria"
            size="large"
            variant="tonal"
            color="info"
            prepend-icon="mdi-coffee"
            class="text-left"
          >
            <div>
              <div class="font-weight-bold">Cafetería</div>
              <div class="text-caption">Ver reportes de cafetería</div>
            </div>
          </v-btn>

          <v-btn
            to="/dashboard/empleado/reportes/spa"
            size="large"
            variant="tonal"
            color="success"
            prepend-icon="mdi-spa"
            class="text-left"
          >
            <div>
              <div class="font-weight-bold">Spa</div>
              <div class="text-caption">Ver reportes de spa</div>
            </div>
          </v-btn>

          <v-btn
            to="/dashboard/empleado/reportes/lavanderia"
            size="large"
            variant="tonal"
            color="warning"
            prepend-icon="mdi-washing-machine"
            class="text-left"
          >
            <div>
              <div class="font-weight-bold">Lavandería</div>
              <div class="text-caption">Ver reportes de lavandería</div>
            </div>
          </v-btn>

          <v-btn
            to="/dashboard/empleado/reportes/room_service"
            size="large"
            variant="tonal"
            color="primary"
            prepend-icon="mdi-bell-ring"
            class="text-left"
          >
            <div>
              <div class="font-weight-bold">Room Service</div>
              <div class="text-caption">Ver reportes de room service</div>
            </div>
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Link de retorno -->
    <div class="mt-8">
      <v-btn to="/dashboard/empleado" variant="text" prepend-icon="mdi-arrow-left">
        Volver al Dashboard
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserRole } from '~/types/auth'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.CAFETERIA, UserRole.LAVANDERIA, UserRole.SPA, UserRole.ROOM_SERVICE],
})

// Esta es una página índice simple que redirige a las áreas específicas
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>
