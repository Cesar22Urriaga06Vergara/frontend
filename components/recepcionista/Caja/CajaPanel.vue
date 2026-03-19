<template>
  <div class="caja-panel">
    <!-- Búsqueda de habitación -->
    <v-card class="mb-4" title="Buscar folio de habitación">
      <v-card-text>
        <div class="d-flex gap-2 align-center">
          <v-autocomplete
            v-model="habitacionBuscada"
            label="Habitación"
            placeholder="Ej: 101, 205..."
            :items="habitacionesOcupadas"
            item-title="numero"
            item-value="id"
            variant="outlined"
            density="compact"
            class="flex-grow-1"
            :loading="folios.buscandoHabitacion.value"
            no-data-text="No hay habitaciones ocupadas"
            @update:model-value="cargarFolio"
          ></v-autocomplete>
          <v-btn
            icon
            color="primary"
            @click="recargarFolio"
            :loading="folios.loadingFolio.value"
          >
            <v-icon>mdi-refresh</v-icon>
            <v-tooltip activator="parent">Recargar folio</v-tooltip>
          </v-btn>
          <v-btn
            icon
            color="error"
            @click="limpiarBusqueda"
            :disabled="!habitacionBuscada"
          >
            <v-icon>mdi-close</v-icon>
            <v-tooltip activator="parent">Limpiar</v-tooltip>
          </v-btn>
        </div>

        <!-- Mensaje de error si no hay folio -->
        <v-alert
          v-if="habitacionBuscada && !folios.folioActual.value && !folios.loadingFolio.value"
          type="info"
          variant="tonal"
          density="compact"
          class="mt-3 mb-0"
        >
          No hay folio activo para esta habitación. ¿Deseas abrirlo?
          <v-btn
            size="small"
            variant="text"
            color="info"
            class="ms-2"
            @click="crearFolioNuevo"
            :loading="folios.loadingOperacion.value"
          >
            Abrir folio
          </v-btn>
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Panel principal si hay folio -->
    <v-row v-if="folios.folioActual.value" class="ga-4">
      <!-- Columna izquierda: Folio card + cargos -->
      <v-col cols="12" md="7">
        <!-- FolioCard -->
        <FolioCard :folio="folios.folioActual.value" class="mb-4">
          <template #actions>
            <AgregarCargoForm
              ref="agregarCargoFormRef"
              :loading="folios.loadingOperacion.value"
              @agregar="agregarCargo"
            />
            <v-btn
              v-if="folios.puedeSerCerrado"
              color="warning"
              variant="tonal"
              size="small"
              @click="cerrarFolioConfirm"
              :loading="folios.loadingOperacion.value"
              class="ms-2"
            >
              Cerrar folio
            </v-btn>
          </template>
        </FolioCard>

        <!-- CargosList -->
        <CargosList
          :cargos="folios.folioActual.value.cargos"
          :folio-complete="folios.folioActual.value"
          @eliminar-cargo="eliminarCargoItem"
        >
          <template #actions>
            <v-spacer></v-spacer>
            <v-btn
              v-if="folios.puedeSerCobrado"
              color="success"
              prepend-icon="mdi-cash-multiple"
              size="small"
              @click="cobrarFolioDialog = true"
            >
              Procesar pago
            </v-btn>
          </template>
        </CargosList>
      </v-col>

      <!-- Columna derecha: Resumen y acciones rápidas -->
      <v-col cols="12" md="5">
        <!-- Acciones rápidas -->
        <v-card title="Opciones" class="mb-4">
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-if="folios.folioActual.value?.estado === 'ABIERTO'"
                title="Agregar cargo"
                subtitle="Agregar un nuevo cargo al folio"
                prepend-icon="mdi-plus-circle-outline"
                @click="triggerAgregarCargoForm"
              ></v-list-item>

              <v-list-item
                v-if="!folios.folioActual.value?.cargos || folios.folioActual.value.cargos.length === 0"
                title="No hay cargos"
                subtitle="Comienza aggregando cargos"
                disabled
                prepend-icon="mdi-information-outline"
              ></v-list-item>

              <v-divider v-if="folios.folioActual.value?.estado === 'ABIERTO'" class="my-2"></v-divider>

              <v-list-item
                v-if="folios.puedeSerCerrado"
                title="Cerrar folio"
                subtitle="Finalizar cargos y preparar para cobro"
                prepend-icon="mdi-door-closed"
                @click="cerrarFolioConfirm"
              ></v-list-item>

              <v-list-item
                v-if="folios.puedeSerCobrado"
                title="Procesar pago"
                subtitle="Registrar el pago y cerrar folio"
                prepend-icon="mdi-bank-transfer"
                @click="cobrarFolioDialog = true"
              ></v-list-item>

              <v-divider class="my-2"></v-divider>

              <v-list-item
                title="Cancelar folio"
                subtitle="Descartar todos los cambios"
                prepend-icon="mdi-cancel"
                @click="cancelarFolioConfirm"
              ></v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Historial del día (si está disponible) -->
        <v-card title="Historial reciente" :loading="folios.loadingHistorial.value">
          <v-list density="compact" v-if="foliosStore.foliosRecientes.length > 0">
            <v-list-item
              v-for="folio in foliosStore.foliosRecientes"
              :key="folio.id"
              :title="`HB${folio.numeroHabitacion}`"
              :subtitle="`$${folio.total.toLocaleString('es-CO')}`"
              :to="`/recepcionista/caja?folioId=${folio.id}`"
              class="cursor-pointer"
            >
              <template #prepend>
                <v-chip
                  :color="folioStateColor(folio.estado)"
                  size="small"
                  label
                  :text-color="folio.pagado ? 'white' : 'default'"
                >
                  {{ folioStateLabel(folio.estado) }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
          <v-card-text v-else class="text-center text-medium-emphasis">
            Sin folios recientes
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog para confirmar cobro -->
    <v-dialog v-model="cobrarFolioDialog" max-width="500px">
      <v-card title="Confirmar pago del folio">
        <ConfirmarCobro
          v-if="cobrarFolioDialog"
          :total-a-cobrar="folios.folioActual.value?.total || 0"
          :loading="folios.loadingOperacion.value"
          @confirmar-cobro="ejecutarCobro"
        >
          <template #activator="{ props }" />
        </ConfirmarCobro>
      </v-card>
    </v-dialog>

    <!-- Dialog para cerrar folio -->
    <v-dialog v-model="cerrarDialog" max-width="400px">
      <v-card title="Cerrar folio">
        <v-card-text>
          <p>¿Deseas cerrar este folio? Ya no podrás agregar más cargos.</p>
          <v-textarea
            v-model="observacionesCierre"
            label="Observaciones (opcional)"
            density="compact"
            variant="outlined"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="cerrarDialog = false">Cancelar</v-btn>
          <v-btn
            color="warning"
            variant="tonal"
            @click="ejecutarCierre"
            :loading="folios.loadingOperacion.value"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para cancelar folio -->
    <v-dialog v-model="cancelarDialog" max-width="400px">
      <v-card title="Cancelar folio">
        <v-card-text>
          <v-alert type="warning" variant="tonal" density="compact" class="mb-3">
            ¿Deseas cancelar este folio? Se perderán todos los cargos registrados.
          </v-alert>
          <v-textarea
            v-model="motivoCancelacion"
            label="Motivo de cancelación"
            density="compact"
            variant="outlined"
            :rules="[(v) => !!v || 'Motivo es obligatorio']"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="cancelarDialog = false">No, mantener folio</v-btn>
          <v-btn
            color="error"
            variant="tonal"
            @click="ejecutarCancelacion"
            :loading="folios.loadingOperacion.value"
          >
            Sí, cancelar folio
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFolios } from '~/composables/useFolios'
import { useFoliosStore } from '~/stores/folios'
import { useNotification } from '~/composables/useNotification'
import type { AgregarCargoDto } from '~/types/folio'

import FolioCard from './FolioCard.vue'
import CargosList from './CargosList.vue'
import AgregarCargoForm from './AgregarCargoForm.vue'
import ConfirmarCobro from './ConfirmarCobro.vue'

const { success, error } = useNotification()
const folios = useFolios()
const foliosStore = useFoliosStore()

// State local
const habitacionBuscada = ref<number | null>(null)
const cobrarFolioDialog = ref(false)
const cerrarDialog = ref(false)
const cancelarDialog = ref(false)
const observacionesCierre = ref('')
const motivoCancelacion = ref('')

// Mock: habitaciones ocupadas (en real vendría del composable)
const habitacionesOcupadas = computed(() => [
  { id: 1, numero: '101', piso: 1 },
  { id: 2, numero: '102', piso: 1 },
  { id: 5, numero: '205', piso: 2 },
  { id: 8, numero: '310', piso: 3 }
])

const cargarFolio = async (idHabitacion: number) => {
  if (!idHabitacion) return
  const resumen = await folios.obtenerFolio(idHabitacion)
  if (!resumen) {
    // Sin folio activo
  }
}

const recargarFolio = async () => {
  if (habitacionBuscada.value) {
    await cargarFolio(habitacionBuscada.value)
  }
}

const limpiarBusqueda = () => {
  habitacionBuscada.value = null
  folios.limpiarFolioActual()
}

const crearFolioNuevo = async () => {
  if (!habitacionBuscada.value) return
  try {
    await folios.crearFolio(habitacionBuscada.value)
  } catch (err) {
    error('Error al crear folio')
  }
}

const agregarCargo = async (cargo: AgregarCargoDto) => {
  if (!folios.folioActual.value?.idHabitacion) return
  try {
    await folios.agregarCargo(folios.folioActual.value.idHabitacion, cargo)
    foliosStore.actualizarFolioEnHistorial(folios.folioActual.value)
  } catch (err) {
    // Error ya mostrado en composable
  }
}

const eliminarCargoItem = async (idCargo: string) => {
  if (!folios.folioActual.value?.idHabitacion) return
  try {
    await folios.eliminarCargo(folios.folioActual.value.idHabitacion, idCargo)
    foliosStore.actualizarFolioEnHistorial(folios.folioActual.value)
  } catch (err) {
    // Error ya mostrado
  }
}

const cerrarFolioConfirm = () => {
  observacionesCierre.value = ''
  cerrarDialog.value = true
}

const ejecutarCierre = async () => {
  if (!folios.folioActual.value?.idHabitacion) return
  try {
    await folios.cerrarFolio(folios.folioActual.value.idHabitacion, observacionesCierre.value)
    foliosStore.actualizarFolioEnHistorial(folios.folioActual.value)
    cerrarDialog.value = false
  } catch (err) {
    // Error ya mostrado
  }
}

const ejecutarCobro = async (datos: any) => {
  if (!folios.folioActual.value?.idHabitacion) return
  try {
    const respuesta = await folios.cobrarFolio(
      folios.folioActual.value.idHabitacion,
      datos.montoRecibido,
      datos.medioPago
    )
    if (respuesta) {
      folios.folioActual.value = respuesta.folio
      foliosStore.agregarAlHistorial(respuesta.folio)
      cobrarFolioDialog.value = false
    }
  } catch (err) {
    // Error ya mostrado
  }
}

const cancelarFolioConfirm = () => {
  motivoCancelacion.value = ''
  cancelarDialog.value = true
}

const ejecutarCancelacion = async () => {
  if (motivoCancelacion.value.length < 5) {
    error('Motivo debe tener al menos 5 caracteres')
    return
  }

  if (!folios.folioActual.value?.idHabitacion) return
  try {
    // Aquí se cancela (por ahora simplemente limpiamos)
    success('Folio cancelado')
    folios.limpiarFolioActual()
    limpiarBusqueda()
    cancelarDialog.value = false
  } catch (err) {
    // Error
  }
}

const folioStateColor = (estado: string) => {
  switch (estado) {
    case 'ABIERTO':
      return 'info'
    case 'CERRADO':
      return 'warning'
    case 'PAGADO':
      return 'success'
    default:
      return 'default'
  }
}

const folioStateLabel = (estado: string) => {
  switch (estado) {
    case 'ABIERTO':
      return 'Abierto'
    case 'CERRADO':
      return 'Cerrado'
    case 'PAGADO':
      return 'Pagado'
    default:
      return estado
  }
}

const agregarCargoFormRef = ref<any>(null)

const triggerAgregarCargoForm = () => {
  agregarCargoFormRef.value?.open()
}

onMounted(() => {
  // Cargar historial del día
  folios.obtenerHistorial()
})
</script>

<style scoped>
.caja-panel {
  width: 100%;
}
</style>
