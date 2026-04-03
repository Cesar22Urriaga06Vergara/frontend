<template>
  <SectionCard :title="title" :subtitle="subtitle" :padded="false" class="ds-table">
    <template #actions>
      <slot name="header-actions" />
    </template>

    <ActionToolbar v-if="$slots.filters || $slots.actions" class="px-4 pt-4">
      <template #filters>
        <slot name="filters" />
      </template>
      <template #actions>
        <slot name="actions" />
      </template>
    </ActionToolbar>

    <v-data-table
      :headers="headers"
      :items="items"
      :loading="loading"
      :items-per-page="itemsPerPage"
      :density="density"
      class="elevation-0"
      :hover="hover"
    >
      <template #loading>
        <v-skeleton-loader class="ds-skeleton pa-4" type="table-row@6" />
      </template>

      <template #no-data>
        <EmptyState
          :icon="emptyIcon"
          :title="emptyTitle"
          :description="emptyDescription"
          :action-label="emptyActionLabel"
          @action="$emit('empty-action')"
        />
      </template>

      <template v-for="(_, slotName) in $slots" :key="slotName" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps" />
      </template>
    </v-data-table>
  </SectionCard>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import ActionToolbar from '~/components/shared/ActionToolbar.vue'
import EmptyState from '~/components/shared/EmptyState.vue'
import SectionCard from '~/components/shared/SectionCard.vue'

withDefaults(defineProps<{
  title?: string
  subtitle?: string
  headers: any[]
  items: T[]
  loading?: boolean
  itemsPerPage?: number
  density?: 'default' | 'comfortable' | 'compact'
  hover?: boolean
  emptyIcon?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyActionLabel?: string
}>(), {
  title: '',
  subtitle: '',
  loading: false,
  itemsPerPage: 10,
  density: 'compact',
  hover: true,
  emptyIcon: 'mdi-database-off-outline',
  emptyTitle: 'Sin resultados',
  emptyDescription: 'No hay datos para los filtros seleccionados.',
  emptyActionLabel: '',
})

defineEmits<{
  'empty-action': []
}>()
</script>
