<template>
  <AreaPedidosPanel :config="config" />
</template>

<script setup lang="ts">
import { UserRole } from '~/types/auth'
import AreaPedidosPanel from '~/components/shared/AreaPedidosPanel.vue'
import { getAreaConfigByCategoria } from '~/utils/areaPanelConfigs'

definePageMeta({
  layout: 'operacion',
  middleware: ['auth', 'role'],
  roles: [UserRole.LAVANDERIA, UserRole.ADMIN, UserRole.SUPERADMIN],
})

useHead({ title: 'Mi Área — Lavandería' })

const config = getAreaConfigByCategoria('lavanderia')
</script>
