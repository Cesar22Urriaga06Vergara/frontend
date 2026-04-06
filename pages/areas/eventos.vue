<template>
  <AreaPedidosPanel :config="eventosConfig" />
</template>

<script setup lang="ts">
import { UserRole } from '~/types/auth'
import AreaPedidosPanel from '~/components/shared/AreaPedidosPanel.vue'
import { getAreaConfigByCategoria } from '~/utils/areaPanelConfigs'

definePageMeta({
  layout: 'operacion',
  middleware: ['auth', 'role'],
  roles: [UserRole.EVENTOS, UserRole.ADMIN, UserRole.SUPERADMIN],
})

useHead({ title: 'Mi Área — Eventos' })

const eventosConfig = getAreaConfigByCategoria('eventos')
</script>
