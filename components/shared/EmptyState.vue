<template>
  <div class="text-center py-10">
    <v-icon :icon="icon" :size="iconSize" color="medium-emphasis" class="mb-3" />
    <p class="text-body-1 font-weight-medium mb-1">{{ title }}</p>
    <p v-if="description" class="text-body-2 text-medium-emphasis mb-4">{{ description }}</p>
    <v-btn
      v-if="actionLabel"
      :color="actionColor"
      :variant="actionVariant"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  iconSize?: number
  title: string
  description?: string
  actionLabel?: string
  actionColor?: string
  actionVariant?: 'flat' | 'text' | 'elevated' | 'tonal' | 'outlined' | 'plain'
}>(), {
  icon: 'mdi-information-outline',
  iconSize: 48,
  description: '',
  actionLabel: '',
  actionColor: 'primary',
  actionVariant: 'tonal',
})

defineEmits<{
  action: []
}>()
</script>
