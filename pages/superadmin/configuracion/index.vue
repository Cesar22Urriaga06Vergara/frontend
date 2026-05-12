<template>
  <div>
    <PageHeader
      title="Configuracion del Sistema"
      subtitle="Gestiona parametros globales, flags y facturacion por hotel"
    />

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Feature Flags" :value="featuresFlags.length" icon="mdi-toggle-switch" color="primary" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Parametros" :value="parametrosGlobales.length" icon="mdi-cog" color="info" />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard label="Resoluciones" :value="resoluciones.length" icon="mdi-file-certificate" color="success" />
      </v-col>
    </v-row>

    <v-alert type="warning" variant="tonal" class="mb-6" prepend-icon="mdi-clock-alert-outline">
      <strong>Modulo en despliegue.</strong> Los features flags y parametros globales estan en modo solo lectura.
      La configuracion de resoluciones ya opera contra backend.
    </v-alert>

    <SectionCard class="mb-6" title="Modulos de configuracion" subtitle="Selecciona la seccion a administrar">
      <v-tabs v-model="tabActiva">
        <v-tab value="features" prepend-icon="mdi-toggle-switch">
          Features Flags ({{ featuresFlags.length }})
        </v-tab>
        <v-tab value="parametros" prepend-icon="mdi-cog">
          Parametros Globales ({{ parametrosGlobales.length }})
        </v-tab>
        <v-tab value="facturacion" prepend-icon="mdi-file-certificate">
          Facturacion ({{ resoluciones.length }})
        </v-tab>
      </v-tabs>
    </SectionCard>

    <div v-if="tabActiva === 'features'" class="space-y-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Controlar Features</h2>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="dialogoFeatureFlags = true">
          Nuevo Flag
        </v-btn>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div v-for="flag in featuresFlags" :key="flag.id" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ flag.nombre }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ flag.descripcion }}</p>
              <p class="text-xs text-gray-500 font-mono mt-2">{{ flag.clave }}</p>
            </div>
            <v-switch
              :model-value="flag.esActivo"
              :disabled="true"
              :color="flag.esActivo ? 'green' : 'red'"
            />
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-600 dark:text-gray-400">Progreso Deploy</p>
              <v-progress-linear
                :model-value="flag.porcentajeDeploy"
                :color="flag.porcentajeDeploy === 100 ? 'green' : 'orange'"
                class="mt-2"
              />
              <p class="text-xs text-gray-500 mt-1">{{ flag.porcentajeDeploy }}%</p>
            </div>
            <div>
              <p class="text-gray-600 dark:text-gray-400">Proximo vencimiento</p>
              <p class="text-xs font-mono mt-2">
                {{ flag.fechaVencimiento ? new Date(flag.fechaVencimiento).toLocaleDateString('es-CO') : 'Sin vencimiento' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="tabActiva === 'parametros'" class="space-y-6">
      <div class="mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Variables Globales</h2>
        <p class="text-gray-600 dark:text-gray-400 mt-1">Ajusta parametros de configuracion del sistema</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="param in parametrosGlobales" :key="param.id" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ param.clave }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ param.descripcion }}</p>
            </div>
            <v-chip size="small" variant="outlined">{{ param.categoria }}</v-chip>
          </div>

          <v-switch
            v-if="param.tipo === 'boolean'"
            :model-value="param.valor === 'true'"
            :disabled="true"
            density="compact"
            class="mb-4"
          />
          <v-text-field
            v-else
            :model-value="param.valor"
            :type="param.tipo === 'number' ? 'number' : 'text'"
            label="Valor"
            density="compact"
            :disabled="!param.esModificable"
            @blur="actualizarParametroGlobal(param.clave, $event)"
          />

          <p v-if="!param.esModificable" class="text-xs text-gray-500 mt-2">
            <v-icon icon="mdi-alert-circle-outline" size="16" class="mr-1" />
            Este parametro es de solo lectura
          </p>
        </div>
      </div>
    </div>

    <div v-if="tabActiva === 'facturacion'" class="space-y-6">
      <SectionCard class="mb-6" title="Resoluciones de facturacion" subtitle="Numeracion fiscal por hotel y prefijo">
        <v-row align="center">
          <v-col cols="12" md="5">
            <v-select
              v-model="idHotelSeleccionado"
              :items="hoteles"
              item-title="nombre"
              item-value="id"
              label="Hotel"
              variant="outlined"
              density="comfortable"
              hide-details
              :loading="loadingHoteles"
              @update:model-value="cargarContextoHotel"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-card variant="tonal" color="success" class="pa-4" rounded="lg">
              <div class="text-caption text-medium-emphasis mb-1">Resolucion activa</div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ resolucionActiva?.numeroResolucion || 'Sin resolucion activa' }}
              </div>
              <div v-if="resolucionActiva" class="text-caption">
                {{ siguienteConsecutivo }} disponible
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="3" class="text-md-right">
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              :disabled="!idHotelSeleccionado"
              @click="abrirDialogoResolucion"
            >
              Nueva resolucion
            </v-btn>
          </v-col>
        </v-row>
      </SectionCard>

      <v-alert
        v-if="resolucionActiva?.ambiente === 'desarrollo'"
        type="info"
        variant="tonal"
        class="mb-6"
        prepend-icon="mdi-test-tube"
      >
        La resolucion activa es de desarrollo. Sirve para pruebas locales y no representa autorizacion fiscal DIAN.
      </v-alert>

      <SectionCard class="mb-6" title="Datos fiscales y POS" subtitle="Informacion comercial del hotel para facturas y tickets">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="formFiscal.nombre" label="Nombre comercial" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="formFiscal.razonSocial" label="Razon social" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="formFiscal.nit" label="NIT" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="formFiscal.telefono" label="Telefono" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="formFiscal.email" label="Email" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="formFiscal.direccion" label="Direccion" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="formFiscal.ciudad" label="Ciudad" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="formFiscal.pais" label="Pais" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="formFiscal.logoUrl" label="URL logo" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="2">
            <v-select v-model="formFiscal.moneda" :items="monedas" label="Moneda" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="2">
            <v-select v-model="formFiscal.posFormatoDefault" :items="formatosPos" label="POS" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="formFiscal.prefijoFacturacion" label="Prefijo sugerido" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="formFiscal.resolucionFacturacion" label="Texto resolucion legacy/opcional" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="formFiscal.pieFactura" label="Pie de factura/ticket" variant="outlined" density="comfortable" rows="2" />
          </v-col>
          <v-col cols="12" class="d-flex justify-end">
            <v-btn
              color="primary"
              prepend-icon="mdi-content-save"
              :loading="guardandoFiscal"
              :disabled="!idHotelSeleccionado"
              @click="guardarConfiguracionFiscal"
            >
              Guardar datos fiscales/POS
            </v-btn>
          </v-col>
        </v-row>
      </SectionCard>

      <v-card rounded="lg" variant="outlined">
        <v-table>
          <thead>
            <tr>
              <th>Resolucion</th>
              <th>Prefijo</th>
              <th>Rango</th>
              <th>Actual</th>
              <th>Vigencia</th>
              <th>Ambiente</th>
              <th>Estado</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingResoluciones">
              <td colspan="8" class="text-center py-6">
                <v-progress-circular indeterminate color="primary" size="24" />
              </td>
            </tr>
            <tr v-else-if="!resolucionesOrdenadas.length">
              <td colspan="8" class="text-center py-6 text-medium-emphasis">
                Sin resoluciones registradas para este hotel.
              </td>
            </tr>
            <tr v-for="resolucion in resolucionesOrdenadas" v-else :key="resolucion.id">
              <td>
                <div class="font-weight-medium">{{ resolucion.numeroResolucion }}</div>
                <div class="text-caption text-medium-emphasis">{{ resolucion.tipoDocumento }}</div>
              </td>
              <td>{{ resolucion.prefijo }}</td>
              <td>{{ resolucion.rangoDesde }} - {{ resolucion.rangoHasta }}</td>
              <td>{{ resolucion.numeroActual }}</td>
              <td>{{ formatearFecha(resolucion.fechaInicio) }} - {{ formatearFecha(resolucion.fechaFin) }}</td>
              <td>
                <v-chip size="small" variant="tonal" :color="resolucion.ambiente === 'produccion' ? 'primary' : 'info'">
                  {{ resolucion.ambiente }}
                </v-chip>
              </td>
              <td>
                <v-chip size="small" variant="flat" :color="colorEstado(resolucion.estado)">
                  {{ etiquetaEstado(resolucion.estado) }}
                </v-chip>
              </td>
              <td class="text-right">
                <v-btn
                  v-if="resolucion.estado !== 'activa'"
                  icon="mdi-check-circle-outline"
                  variant="text"
                  color="success"
                  :loading="guardandoResolucion"
                  @click="cambiarEstadoResolucion(resolucion.id, 'activa')"
                />
                <v-btn
                  v-if="resolucion.estado === 'activa'"
                  icon="mdi-pause-circle-outline"
                  variant="text"
                  color="warning"
                  :loading="guardandoResolucion"
                  @click="cambiarEstadoResolucion(resolucion.id, 'inactiva')"
                />
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </div>

    <v-dialog v-model="dialogoFeatureFlags" max-width="500">
      <v-card>
        <v-card-title>Nuevo Features Flag</v-card-title>
        <v-card-text>
          <v-text-field label="Nombre" class="mb-4" />
          <v-text-field label="Clave (slug)" class="mb-4" />
          <v-textarea label="Descripcion" class="mb-4" />
          <v-text-field label="Porcentaje Deploy" type="number" min="0" max="100" class="mb-4" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogoFeatureFlags = false">Cancelar</v-btn>
          <v-btn color="primary" @click="dialogoFeatureFlags = false">Crear</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogoResolucion" max-width="720">
      <v-card>
        <v-card-title>Nueva resolucion de facturacion</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="7">
              <v-text-field v-model="formResolucion.numeroResolucion" label="Numero de resolucion" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" md="5">
              <v-text-field v-model="formResolucion.prefijo" label="Prefijo" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="formResolucion.fechaResolucion" type="date" label="Fecha resolucion" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="formResolucion.fechaInicio" type="date" label="Inicio" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="formResolucion.fechaFin" type="date" label="Fin" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model.number="formResolucion.rangoDesde" type="number" min="1" label="Rango desde" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model.number="formResolucion.rangoHasta" type="number" min="1" label="Rango hasta" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model.number="formResolucion.numeroActual" type="number" min="0" label="Consecutivo actual" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="formResolucion.ambiente" :items="ambientesResolucion" label="Ambiente" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formResolucion.tipoDocumento" label="Tipo documento" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="formResolucion.observaciones" label="Observaciones" variant="outlined" density="comfortable" rows="2" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogoResolucion = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="guardandoResolucion" @click="guardarResolucion">
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <StandardDataTable
      class="mt-6"
      title="Resumen de configuracion"
      subtitle="Estado actual de modulos disponibles"
      :headers="resumenHeaders"
      :items="resumenItems"
      :items-per-page="5"
      empty-title="Sin datos"
      empty-description="No hay informacion de resumen disponible."
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StatCard from '~/components/shared/StatCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import { useResolucionesFacturacion } from '~/composables/useResolucionesFacturacion'
import { useSuperAdminConfiguracion } from '~/composables/useSuperAdminConfiguracion'
import { useSuperAdminHoteles } from '~/composables/useSuperAdminHoteles'
import { useNotification } from '~/composables/useNotification'
import { UserRole } from '~/types/auth'
import type { CreateResolucionFacturacionDto, EstadoResolucionFacturacion } from '~/types/resolucionFacturacion'
import type { UpdateHotelDto } from '~/types/superadmin'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.SUPERADMIN],
  layout: 'superadmin',
})

const {
  featuresFlags,
  parametrosGlobales,
  dialogoFeatureFlags,
  obtenerFeaturesFlags,
  actualizarParametroGlobal,
  obtenerParametrosGlobales,
} = useSuperAdminConfiguracion()

const {
  hoteles,
  isLoading: loadingHoteles,
  obtenerHoteles,
  actualizarHotel,
} = useSuperAdminHoteles()

const {
  resoluciones,
  resolucionesOrdenadas,
  resolucionActiva,
  loading: loadingResoluciones,
  guardando: guardandoResolucion,
  listar,
  crear,
  actualizar,
  etiquetaEstado,
  colorEstado,
} = useResolucionesFacturacion()

const { success, warning } = useNotification()

const tabActiva = ref('features')
const dialogoResolucion = ref(false)
const idHotelSeleccionado = ref<number | null>(null)
const ambientesResolucion = ['desarrollo', 'produccion']
const monedas = ['COP', 'USD', 'EUR']
const formatosPos = ['80mm', '58mm']
const guardandoFiscal = ref(false)

const crearFormFiscal = (): UpdateHotelDto => ({
  nombre: '',
  razonSocial: '',
  nit: '',
  telefono: '',
  email: '',
  direccion: '',
  ciudad: '',
  pais: 'Colombia',
  logoUrl: '',
  resolucionFacturacion: '',
  prefijoFacturacion: 'FV',
  pieFactura: '',
  moneda: 'COP',
  posFormatoDefault: '80mm',
})

const formFiscal = ref<UpdateHotelDto>(crearFormFiscal())

const crearFormResolucion = (): CreateResolucionFacturacionDto => {
  const hoy = new Date()
  const fecha = hoy.toISOString().slice(0, 10)
  const fin = `${hoy.getFullYear() + 4}-12-31`
  const hotel = hoteles.value.find((item) => item.id === idHotelSeleccionado.value)
  const nombreHotel = hotel?.nombre?.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase() || 'HOTEL'

  return {
    idHotel: idHotelSeleccionado.value || undefined,
    numeroResolucion: `DEV-${nombreHotel}-${hoy.getFullYear()}`,
    prefijo: 'FV',
    fechaResolucion: fecha,
    fechaInicio: fecha,
    fechaFin: fin,
    rangoDesde: 1,
    rangoHasta: 999999,
    numeroActual: 0,
    tipoDocumento: 'factura_venta',
    ambiente: 'desarrollo',
    observaciones: 'Resolucion de pruebas para desarrollo local.',
  }
}

const formResolucion = ref<CreateResolucionFacturacionDto>(crearFormResolucion())

const siguienteConsecutivo = computed(() => {
  if (!resolucionActiva.value) return ''
  const siguiente = Number(resolucionActiva.value.numeroActual || 0) + 1
  return `${resolucionActiva.value.prefijo}-${String(siguiente).padStart(6, '0')}`
})

const resumenHeaders = [
  { title: 'Modulo', key: 'modulo' },
  { title: 'Total', key: 'total' },
  { title: 'Estado', key: 'estado' },
]

const resumenItems = computed(() => [
  { modulo: 'Feature Flags', total: featuresFlags.value.length, estado: 'Solo lectura' },
  { modulo: 'Parametros Globales', total: parametrosGlobales.value.length, estado: 'Solo lectura' },
  { modulo: 'Resoluciones', total: resoluciones.value.length, estado: 'Operativo' },
])

const cargarResoluciones = async () => {
  if (!idHotelSeleccionado.value) return
  await listar(idHotelSeleccionado.value)
}

const cargarFormularioFiscal = () => {
  const hotel = hoteles.value.find((item) => item.id === idHotelSeleccionado.value)
  if (!hotel) {
    formFiscal.value = crearFormFiscal()
    return
  }

  formFiscal.value = {
    nombre: hotel.nombre || '',
    razonSocial: hotel.razonSocial || '',
    nit: hotel.nit || '',
    telefono: hotel.telefono || '',
    email: hotel.email || '',
    direccion: hotel.direccion || '',
    ciudad: hotel.ciudad || '',
    pais: hotel.pais || 'Colombia',
    logoUrl: hotel.logoUrl || '',
    resolucionFacturacion: hotel.resolucionFacturacion || '',
    prefijoFacturacion: hotel.prefijoFacturacion || resolucionActiva.value?.prefijo || 'FV',
    pieFactura: hotel.pieFactura || '',
    moneda: hotel.moneda || 'COP',
    posFormatoDefault: hotel.posFormatoDefault || '80mm',
  }
}

const cargarContextoHotel = async () => {
  cargarFormularioFiscal()
  await cargarResoluciones()
  cargarFormularioFiscal()
}

const abrirDialogoResolucion = () => {
  formResolucion.value = crearFormResolucion()
  dialogoResolucion.value = true
}

const guardarResolucion = async () => {
  if (!idHotelSeleccionado.value) {
    warning('Selecciona un hotel')
    return
  }

  if (!formResolucion.value.numeroResolucion || !formResolucion.value.prefijo) {
    warning('Numero de resolucion y prefijo son obligatorios')
    return
  }

  await crear({
    ...formResolucion.value,
    idHotel: idHotelSeleccionado.value,
    prefijo: formResolucion.value.prefijo.toUpperCase().trim(),
  })

  dialogoResolucion.value = false
}

const cambiarEstadoResolucion = async (id: number, estado: EstadoResolucionFacturacion) => {
  await actualizar(id, { estado }, idHotelSeleccionado.value || undefined)
  cargarFormularioFiscal()
}

const limpiarTexto = (value: unknown) => {
  const text = String(value ?? '').trim()
  return text.length ? text : undefined
}

const guardarConfiguracionFiscal = async () => {
  if (!idHotelSeleccionado.value) {
    warning('Selecciona un hotel')
    return
  }

  if (!formFiscal.value.nombre || !formFiscal.value.nit) {
    warning('Nombre comercial y NIT son obligatorios')
    return
  }

  guardandoFiscal.value = true
  try {
    await actualizarHotel(idHotelSeleccionado.value, {
      nombre: limpiarTexto(formFiscal.value.nombre),
      razonSocial: limpiarTexto(formFiscal.value.razonSocial),
      nit: limpiarTexto(formFiscal.value.nit),
      telefono: limpiarTexto(formFiscal.value.telefono),
      email: limpiarTexto(formFiscal.value.email),
      direccion: limpiarTexto(formFiscal.value.direccion),
      ciudad: limpiarTexto(formFiscal.value.ciudad),
      pais: limpiarTexto(formFiscal.value.pais),
      logoUrl: limpiarTexto(formFiscal.value.logoUrl),
      resolucionFacturacion: limpiarTexto(formFiscal.value.resolucionFacturacion),
      prefijoFacturacion: limpiarTexto(formFiscal.value.prefijoFacturacion)?.toUpperCase(),
      pieFactura: limpiarTexto(formFiscal.value.pieFactura),
      moneda: limpiarTexto(formFiscal.value.moneda)?.toUpperCase(),
      posFormatoDefault: formFiscal.value.posFormatoDefault || '80mm',
    })
    success('Datos fiscales/POS actualizados')
    await obtenerHoteles()
    cargarFormularioFiscal()
  } finally {
    guardandoFiscal.value = false
  }
}

const formatearFecha = (fecha?: string | null) => {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-CO')
}

onMounted(async () => {
  await Promise.all([
    obtenerFeaturesFlags(),
    obtenerParametrosGlobales(),
    obtenerHoteles(),
  ])

  if (hoteles.value.length) {
    idHotelSeleccionado.value = hoteles.value[0].id
    await cargarContextoHotel()
  }
})
</script>
