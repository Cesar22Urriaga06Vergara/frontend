<template>
  <AreaPedidosPanel :config="transporteConfig" />
</template>

<script setup lang="ts">
import { UserRole } from '~/types/auth'
import AreaPedidosPanel from '~/components/shared/AreaPedidosPanel.vue'
import { getAreaConfigByCategoria } from '~/utils/areaPanelConfigs'

definePageMeta({
  layout: 'operacion',
  middleware: ['auth', 'role'],
  roles: [UserRole.TRANSPORTE, UserRole.ADMIN, UserRole.SUPERADMIN],
})

useHead({ title: 'Mi Área — Transporte' })

const transporteConfig = getAreaConfigByCategoria('transporte')
</script>
