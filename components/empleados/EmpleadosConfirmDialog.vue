<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="420"
  >
    <v-card rounded="xl">
      <v-card-text class="pa-6 text-center">
        <v-avatar
          :color="color"
          size="56"
          variant="tonal"
          class="mb-4"
        >
          <v-icon :icon="icon" size="28" />
        </v-avatar>

        <h3 class="text-h6 font-weight-bold mb-2">{{ title }}</h3>
        <p class="text-body-2 text-medium-emphasis">{{ message }}</p>
      </v-card-text>

      <v-card-actions class="px-6 pb-5">
        <v-btn
          variant="text"
          @click="$emit('update:modelValue', false)"
          :disabled="loading"
        >
          Cancelar
        </v-btn>
        <v-spacer />
        <v-btn
          :color="color"
          :loading="loading"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    message: string
    confirmText?: string
    color?: string
    icon?: string
    loading?: boolean
  }>(),
  {
    confirmText: 'Confirmar',
    color: 'error',
    icon: 'mdi-alert-circle-outline',
    loading: false,
  }
)

defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()
</script>
