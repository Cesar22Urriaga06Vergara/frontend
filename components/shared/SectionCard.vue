<template>
  <v-card class="card-glow" :class="paddingClass">
    <div v-if="title || subtitle" class="mb-4 d-flex align-center justify-space-between flex-wrap ga-2">
      <div>
        <h2 v-if="title" class="text-subtitle-1 font-weight-bold">{{ title }}</h2>
        <p v-if="subtitle" class="text-body-2 text-medium-emphasis">{{ subtitle }}</p>
      </div>
      <slot name="actions" />
    </div>

    <slot />
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  padded?: boolean
}>(), {
  title: '',
  subtitle: '',
  padded: true,
})

const paddingClass = computed(() => (props.padded ? 'pa-6' : ''))
</script>
