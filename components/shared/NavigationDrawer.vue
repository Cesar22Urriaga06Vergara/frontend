<template>
  <v-navigation-drawer
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :temporary="isMobile"
    :rail="isRail && !isMobile"
    :expand-on-hover="isRail && !isMobile"
    color="surface"
    border="r"
    :width="280"
    rail-width="72"
  >
    <!-- Logo / Brand -->
    <div class="drawer-header pa-4 pb-2">
      <div class="d-flex align-center">
        <v-avatar
          color="primary"
          size="38"
          rounded="lg"
          class="drawer-logo flex-shrink-0"
        >
          <v-icon icon="mdi-puzzle" size="20" />
        </v-avatar>
        <div class="ml-3 overflow-hidden">
          <div
            class="text-subtitle-2 font-weight-bold text-no-wrap"
            style="line-height: 1.2"
          >
            Dashboard
          </div>
          <div class="text-caption text-medium-emphasis text-no-wrap">
            Panel de control
          </div>
        </div>
      </div>
    </div>

    <v-divider class="mx-4 my-2" />

    <!-- Navigation items -->
    <v-list nav density="compact" class="px-2">
      <template v-for="(section, sIndex) in nav.navigationSections.value" :key="sIndex">
        <!-- Section header -->
        <v-list-subheader
          v-if="section.title"
          class="text-uppercase text-caption font-weight-bold mt-4 mb-1"
          style="letter-spacing: 0.08em; min-height: 24px"
        >
          {{ section.title }}
        </v-list-subheader>

        <!-- Items -->
        <v-list-item
          v-for="item in section.items"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :disabled="item.disabled"
          rounded="lg"
          class="mb-1 nav-item"
          active-class="nav-item--active"
          :height="44"
        >
          <!-- Badge -->
          <template v-if="item.badge" #append>
            <v-badge
              :content="item.badge"
              color="error"
              inline
            />
          </template>
        </v-list-item>
      </template>
    </v-list>

    <!-- Footer -->
    <template #append>
      <div class="pa-3">
        <!-- Tarjeta de rol -->
        <v-card
          variant="tonal"
          :color="nav.roleColor.value"
          rounded="xl"
          class="pa-3"
        >
          <div class="d-flex align-center">
            <v-icon :icon="nav.roleIcon.value" size="18" class="mr-2" />
            <div class="overflow-hidden">
              <div class="text-caption font-weight-bold text-no-wrap">
                {{ nav.roleLabel.value }}
              </div>
              <div
                class="text-caption text-medium-emphasis text-no-wrap"
                style="font-size: 0.68rem"
              >
                Sesión activa
              </div>
            </div>
          </div>
        </v-card>

        <!-- Botón para colapsar (solo desktop) -->
        <v-btn
          v-if="!isMobile"
          variant="text"
          density="compact"
          block
          class="mt-2"
          size="small"
          @click="$emit('toggle-rail')"
        >
          <v-icon :icon="isRail ? 'mdi-chevron-right' : 'mdi-chevron-left'" />
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useRoleNavigation } from '~/composables/useRoleNavigation'

const props = defineProps<{
  modelValue: boolean
  rail?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
  'toggle-rail': []
}>()

const nav = useRoleNavigation()
const { mobile } = useDisplay()

const isMobile = computed(() => mobile.value)
const isRail = computed(() => props.rail && !isMobile.value)
</script>

<style scoped lang="scss">
.drawer-header {
  min-height: 60px;
  display: flex;
  align-items: center;
}

.nav-item {
  transition: all 0.15s ease;

  &:hover {
    transform: translateX(2px);
  }
}

.nav-item--active {
  background: rgb(var(--v-theme-primary)) !important;
  color: rgb(var(--v-theme-on-primary)) !important;

  .v-list-item__prepend .v-icon {
    color: inherit;
  }
}
</style>
