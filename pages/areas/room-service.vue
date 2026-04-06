<template>
  <div class="ds-page">
    <AreaPedidosPanel v-if="config" :config="config" />
    <SectionCard v-else>
      <EmptyState
        icon="mdi-alert-circle-outline"
        title="No se pudo cargar el panel de Room Service"
        description="Verifica la configuración del área y recarga la página."
      />
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UserRole } from '~/types/auth'
import AreaPedidosPanel from '~/components/shared/AreaPedidosPanel.vue'
import EmptyState from '~/components/shared/EmptyState.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import { getAreaConfigByCategoria } from '~/utils/areaPanelConfigs'

definePageMeta({
  layout: 'operacion',
  middleware: ['auth', 'role'],
  roles: [UserRole.ROOM_SERVICE, UserRole.ADMIN, UserRole.SUPERADMIN],
})

useHead({ title: 'Mi Área — Room Service' })

const config = computed(() => {
  try {
    return getAreaConfigByCategoria('room_service')
  } catch (_error) {
    return null
  }
})
</script>
