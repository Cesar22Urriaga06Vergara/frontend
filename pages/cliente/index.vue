<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold mb-1">Bienvenido, {{ authStore.userName }}</h1>
      <p class="text-body-2 text-medium-emphasis">Panel de control del huésped</p>
    </div>

    <!-- Info rápida del huésped -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6">
        <v-card class="card-glow pa-5">
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
        <v-card to="/dashboard/profile" class="card-glow pa-5" style="cursor: pointer">
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

    <!-- Accesos rápidos -->
    <v-row>
      <v-col cols="12" sm="4">
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

      <v-col cols="12" sm="4">
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

      <v-col cols="12" sm="4">
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
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { UserRole } from '~/types/auth'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.CLIENTE],
})

useHead({ title: 'Dashboard Cliente' })

const authStore = useAuthStore()
</script>
