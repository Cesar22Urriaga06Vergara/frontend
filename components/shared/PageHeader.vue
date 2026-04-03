<template>
  <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
    <div>
      <h1 class="text-h5 font-weight-bold mb-1">{{ title }}</h1>
      <p v-if="subtitle" class="text-body-2 text-medium-emphasis">{{ subtitle }}</p>
      <slot name="meta" />
    </div>

    <div class="d-flex align-center ga-2 flex-wrap">
      <slot name="status" />
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>
