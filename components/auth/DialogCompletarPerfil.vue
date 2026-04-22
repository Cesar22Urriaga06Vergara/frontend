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
              item-title="title"
              item-value="value"
              :rules="[v => !!v || 'Selecciona un tipo de documento']"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.cedula"
              label="Número de Documento"
              placeholder="1003001750"
              type="number"
              :error-messages="cedulaErrores"
              :rules="[
                v => !!v || 'El número es requerido',
                v => v.length >= 4 || 'Mínimo 4 caracteres',
                v => v.length <= 20 || 'Máximo 20 caracteres',
                v => /^[\\d\\-]+$/.test(v) || 'Solo dígitos y guiones permitidos',
                v => !esNumeroUno(v) || 'La cédula no puede ser solo 1'
              ]"
              hint="Mín. 4 dígitos, máx. 20 caracteres"
              persistent-hint
              @input="validarCedula"
              @keyup.enter="guardar"
            />
          </v-col>
        </v-row>

        <!-- Teléfono -->
        <v-text-field
          v-model="formData.telefono"
          label="Teléfono (opcional)"
          placeholder="+573001234567"
          :error-messages="telefonoErrores"
          :rules="[
            v => !v || v.length >= 10 || 'Mínimo 10 caracteres',
            v => !v || validarFormatoTelefono(v) || 'Formato: +57XXXXXXXXXX o 10+ dígitos'
          ]"
          hint="Formato: +57XX XXXXXXXX o 10 dígitos mínimo"
          persistent-hint
          type="tel"
          @input="validarTelefono"
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
          hint="Selecciona tu país actual para validación de regrímenes de impuestos"
          persistent-hint
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

const tiposDocumento = [
  { title: 'Cédula', value: 'CC' },
  { title: 'Pasaporte', value: 'PEP' },
  { title: 'Licencia', value: 'LI' },
  { title: 'Tarjeta de Identidad', value: 'TI' },
  { title: 'Cédula de Extranjería', value: 'CE' },
]
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

const cedulaErrores = ref<string[]>([])
const telefonoErrores = ref<string[]>([])

const esNumeroUno = (v: string): boolean => {
  return v === '1'
}

const validarCedula = (value: string) => {
  cedulaErrores.value = []
  
  if (!value) return
  
  // Eliminar espacios
  const cedulaLimpia = value.trim()
  
  // Validación: solo "1"
  if (esNumeroUno(cedulaLimpia)) {
    cedulaErrores.value.push('La cédula no puede ser solo "1"')
    return
  }
  
  // Validación: al menos 4 dígitos
  if (cedulaLimpia.length < 4) {
    cedulaErrores.value.push('La cédula debe tener mínimo 4 caracteres')
    return
  }
  
  // Validación: no debe ser todo ceros
  if (/^[0\-]+$/.test(cedulaLimpia)) {
    cedulaErrores.value.push('La cédula no puede contener solo ceros')
    return
  }
}

const validarTelefono = (value: string) => {
  telefonoErrores.value = []
  
  if (!value) return
  
  const telefonoLimpio = value.trim()
  
  // Si tiene contenido, debe tener al menos 10 dígitos
  if (telefonoLimpio.length > 0 && telefonoLimpio.replace(/\D/g, '').length < 10) {
    telefonoErrores.value.push('El teléfono debe tener al menos 10 dígitos')
    return
  }
}

const validarFormatoTelefono = (value: string): boolean => {
  if (!value) return true // opcional
  
  const telefonoLimpio = value.trim()
  const soloDigitos = telefonoLimpio.replace(/\D/g, '')
  
  // Debe tener al menos 10 dígitos
  if (soloDigitos.length < 10) return false
  
  // Debe empezar con + (intl) o ser solo dígitos/caracteres permitidos
  const formatoValido = /^(\+\d{1,3})?[\d\s\-()]{9,}$/
  return formatoValido.test(telefonoLimpio)
}

const formData = reactive({
  nombre: props.nombre || '',
  apellido: props.apellido || '',
  tipoDocumento: 'CC',
  cedula: '',
  telefono: '',
  direccion: '',
  paisResidencia: 'CO',
  idiomaPreferido: 'Español',
})

const formValido = computed(() => {
  const cedulaLimpia = formData.cedula?.trim() || ''
  
  // Validar que la cédula no sea "1" ni esté vacía
  if (!cedulaLimpia || esNumeroUno(cedulaLimpia)) {
    return false
  }
  
  return (
    !!formData.nombre &&
    !!formData.apellido &&
    !!formData.tipoDocumento &&
    !!formData.cedula &&
    cedulaErrores.value.length === 0 &&
    telefonoErrores.value.length === 0
  )
})

const guardar = async () => {
  if (!formValido.value) {
    // Ejecutar validaciones nuevamente
    validarCedula(formData.cedula)
    validarTelefono(formData.telefono || '')
    return
  }

  cargando.value = true
  try {
    // Limpiar espacios extra
    const datosLimpios = {
      ...formData,
      cedula: formData.cedula?.trim().replace(/\s+/g, ''),
      telefono: formData.telefono?.trim().replace(/\s+/g, ''),
    }
    emit('guardar', datosLimpios)
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
