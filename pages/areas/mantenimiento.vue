<template>
  <AreaPedidosPanel :config="mantenimientoConfig" />
</template>

<script setup lang="ts">
import { UserRole } from '~/types/auth'
import AreaPedidosPanel from '~/components/shared/AreaPedidosPanel.vue'
import { getAreaConfigByCategoria } from '~/utils/areaPanelConfigs'

definePageMeta({
  layout: 'operacion',
  middleware: ['auth', 'role'],
  roles: [UserRole.MANTENIMIENTO, UserRole.ADMIN, UserRole.SUPERADMIN],
})

useHead({ title: 'Mi Área — Mantenimiento' })

const mantenimientoConfig = getAreaConfigByCategoria('mantenimiento')
</script>
