<template>
  <v-chip :color="resolvedColor" size="small" variant="tonal">
    <v-icon :icon="resolvedIcon" size="14" class="mr-1" />
    {{ resolvedLabel }}
  </v-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ViewStatus } from '~/composables/useViewState'

const props = withDefaults(defineProps<{
  status: ViewStatus
  label?: string
}>(), {
  label: '',
})

const statusMap: Record<ViewStatus, { color: string; icon: string; label: string }> = {
  loading: { color: 'info', icon: 'mdi-loading', label: 'Cargando' },
  success: { color: 'success', icon: 'mdi-check-circle', label: 'Operativo' },
  empty: { color: 'warning', icon: 'mdi-inbox-outline', label: 'Sin datos' },
  error: { color: 'error', icon: 'mdi-alert-circle', label: 'Error' },
  unavailable: { color: 'grey', icon: 'mdi-cloud-off-outline', label: 'No disponible' },
}

const resolvedColor = computed(() => statusMap[props.status].color)
const resolvedIcon = computed(() => statusMap[props.status].icon)
const resolvedLabel = computed(() => props.label || statusMap[props.status].label)
</script>
