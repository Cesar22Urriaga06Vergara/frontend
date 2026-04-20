<template>
  <div>
    <PageHeader
      :title="`Panel de ${areaConfig.titulo}`"
      subtitle="Gestiona pedidos operativos del área con flujo estandarizado"
    />

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Área activa"
          :value="areaConfig.titulo"
          :icon="areaConfig.iconoArea"
          color="primary"
          helper="Operación en tiempo real"
        />
      </v-col>
    </v-row>

    <SectionCard class="mb-6" title="Panel operativo" subtitle="Seguimiento de pedidos por estado y prioridad">
      <AreaPedidosPanel :config="areaConfig" />
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UserRole } from '~/types/auth'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'
import AreaPedidosPanel from '~/components/shared/AreaPedidosPanel.vue'
import { useAuthStore } from '~/stores/auth'
import { getAreaConfigByRole } from '~/utils/areaPanelConfigs'

definePageMeta({
  layout: 'operacion',
  middleware: ['auth', 'role'],
  roles: [UserRole.CAFETERIA, UserRole.LAVANDERIA, UserRole.SPA, UserRole.ROOM_SERVICE],
})

const authStore = useAuthStore()

const areaConfig = computed(() => {
  const role = authStore.user?.role || UserRole.CAFETERIA
  return getAreaConfigByRole(role)
})
</script>
