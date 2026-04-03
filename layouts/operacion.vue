<template>
  <AppWorkspaceLayout role="operacion" :dense="true">
    <slot />
  </AppWorkspaceLayout>
</template>

<script setup lang="ts">
import AppWorkspaceLayout from '~/components/shared/AppWorkspaceLayout.vue'
</script>
