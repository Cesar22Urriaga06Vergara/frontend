<template>
  <v-card class="mb-6">
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-calendar-search" size="24" class="mr-2" />
      Buscar Habitaciones
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-6">
      <v-form @submit.prevent="handleSubmit">
        <v-row>
          <v-col cols="12" sm="5">
            <v-text-field
              v-model="checkin"
              label="Check-in"
              type="date"
              :min="today"
              variant="outlined"
              density="compact"
              required
            />
          </v-col>

          <v-col cols="12" sm="5">
            <v-text-field
              v-model="checkout"
              label="Check-out"
              type="date"
              :min="tomorrow"
              variant="outlined"
              density="compact"
              required
            />
          </v-col>

          <v-col cols="12" sm="2" class="d-flex align-end">
            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :disabled="!checkin || !checkout"
              :loading="loading"
            >
              Buscar
            </v-btn>
          </v-col>
        </v-row>

        <v-row v-if="checkin && checkout" class="mt-4">
          <v-col>
            <v-chip color="primary" variant="tonal">
              {{ nights }} noche{{ nights > 1 ? 's' : '' }}
            </v-chip>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  buscar: [data: { checkin: string; checkout: string }]
}>()

const checkin = ref('')
const checkout = ref('')

const today = computed(() => {
  const date = new Date()
  return date.toISOString().split('T')[0]
})

const tomorrow = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().split('T')[0]
})

const nights = computed(() => {
  if (!checkin.value || !checkout.value) return 0
  const start = new Date(checkin.value)
  const end = new Date(checkout.value)
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
})

const handleSubmit = () => {
  emit('buscar', {
    checkin: checkin.value,
    checkout: checkout.value,
  })
}
</script>

<style scoped>
</style>
