<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="600" persistent>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span>Completa tu Perfil</span>
        <v-btn icon="mdi-close" size="small" variant="text" :disabled="cargando" @click="$emit('update:modelValue', false)" />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <p class="text-body-2 text-medium-emphasis mb-6">
          Para completar tu registro, necesitamos que llenes los siguientes datos:
        </p>

        <!-- Nombre y Apellido -->
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.nombre"
              label="Nombre"
              placeholder="Juan"
              :rules="[v => !!v || 'El nombre es requerido']"
              @keyup.enter="guardar"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.apellido"
              label="Apellido"
              placeholder="Pérez"
              :rules="[v => !!v || 'El apellido es requerido']"
              @keyup.enter="guardar"
            />
          </v-col>
        </v-row>

        <!-- Documento -->
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="formData.tipoDocumento"
              label="Tipo de Documento"
              :items="tiposDocumento"
              :rules="[v => !!v || 'Selecciona un tipo de documento']"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.cedula"
              label="Número de Documento"
              placeholder="5555555"
              :rules="[v => !!v || 'El número es requerido']"
              @keyup.enter="guardar"
            />
          </v-col>
        </v-row>

        <!-- Teléfono -->
        <v-text-field
          v-model="formData.telefono"
          label="Teléfono (opcional)"
          placeholder="5551234567"
          @keyup.enter="guardar"
        />

        <!-- Dirección -->
        <v-text-field
          v-model="formData.direccion"
          label="Dirección (opcional)"
          placeholder="Calle 1 #123"
          @keyup.enter="guardar"
        />

        <!-- País de residencia -->
        <v-select
          v-model="formData.paisResidencia"
          label="País de Residencia (opcional)"
          :items="paises"
          item-title="nombre"
          item-value="codigo"
          filterable
          clearable
        />

        <!-- Idioma preferido -->
        <v-select
          v-model="formData.idiomaPreferido"
          label="Idioma Preferido"
          :items="idiomas"
          clearable
        />
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="$emit('update:modelValue', false)"
          :disabled="cargando"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          @click="guardar"
          :loading="cargando"
          :disabled="!formValido"
        >
          <v-icon start icon="mdi-check" />
          Guardar Datos
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  nombre?: string
  apellido?: string
}

const props = withDefaults(defineProps<Props>(), {
  nombre: '',
  apellido: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  guardar: [datos: any]
}>()

const tiposDocumento = ['Cédula', 'Pasaporte', 'Licencia', 'Otro']
const idiomas = ['Español', 'Inglés', 'Francés', 'Portugués', 'Italiano']
const paises = [
  { nombre: 'Colombia', codigo: 'CO' },
  { nombre: 'Argentina', codigo: 'AR' },
  { nombre: 'Chile', codigo: 'CL' },
  { nombre: 'México', codigo: 'MX' },
  { nombre: 'Perú', codigo: 'PE' },
  { nombre: 'Brasil', codigo: 'BR' },
  { nombre: 'Venezuela', codigo: 'VE' },
  { nombre: 'Ecuador', codigo: 'EC' },
  { nombre: 'Bolivia', codigo: 'BO' },
  { nombre: 'Uruguay', codigo: 'UY' },
  { nombre: 'Paraguay', codigo: 'PY' },
  { nombre: 'Otros', codigo: 'OT' },
]

const cargando = ref(false)

const formData = reactive({
  nombre: props.nombre || '',
  apellido: props.apellido || '',
  tipoDocumento: 'Cédula',
  cedula: '',
  telefono: '',
  direccion: '',
  paisResidencia: 'CO',
  idiomaPreferido: 'Español',
})

const formValido = computed(() => {
  return (
    !!formData.nombre &&
    !!formData.apellido &&
    !!formData.tipoDocumento &&
    !!formData.cedula
  )
})

const guardar = async () => {
  if (!formValido.value) return

  cargando.value = true
  try {
    emit('guardar', formData)
  } finally {
    cargando.value = false
  }
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      formData.nombre = props.nombre || ''
      formData.apellido = props.apellido || ''
    }
  },
)
</script>

<style scoped></style>
