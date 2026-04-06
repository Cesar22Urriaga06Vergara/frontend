<template>
  <AreaPedidosPanel :config="toursConfig" />
</template>

<script setup lang="ts">
import { UserRole } from '~/types/auth'
import AreaPedidosPanel from '~/components/shared/AreaPedidosPanel.vue'
import { getAreaConfigByCategoria } from '~/utils/areaPanelConfigs'

definePageMeta({
  layout: 'operacion',
  middleware: ['auth', 'role'],
  roles: [UserRole.TOURS, UserRole.ADMIN, UserRole.SUPERADMIN],
})

useHead({ title: 'Mi Área — Tours' })

const toursConfig = getAreaConfigByCategoria('tours')
</script>
