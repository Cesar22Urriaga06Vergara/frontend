<template>
  <v-card class="card-glow pa-4 h-100">
    <div class="d-flex align-center justify-space-between ga-3">
      <div class="min-w-0">
        <div class="text-caption text-medium-emphasis mb-1">{{ label }}</div>
        <div v-if="loading" class="pt-1">
          <v-skeleton-loader type="text" width="96" />
        </div>
        <div v-else class="text-h5 font-weight-bold text-high-emphasis">{{ value }}</div>
        <div v-if="helper" class="text-caption text-medium-emphasis mt-2">{{ helper }}</div>
      </div>

      <v-avatar :color="color" size="42" variant="tonal" rounded="lg">
        <v-icon :icon="icon" size="20" />
      </v-avatar>
    </div>
  </v-card>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  value: string | number
  icon: string
  color?: string
  helper?: string
  loading?: boolean
}>(), {
  color: 'primary',
  helper: '',
  loading: false,
})
</script>
