<template>
  <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
    <div class="d-flex align-center ga-2 flex-wrap">
      <slot name="filters" />
    </div>
    <div class="d-flex align-center ga-2 flex-wrap">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
// Wrapper de toolbar con slots para filtros y acciones.
</script>
