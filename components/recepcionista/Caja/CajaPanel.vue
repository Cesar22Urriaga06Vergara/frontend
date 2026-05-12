<template>
  <div class="caja-panel">
    <!-- Busqueda de folio por cliente -->
    <v-card class="mb-4" title="Buscar folio por cedula">
      <v-card-text>
        <div class="d-flex gap-2 align-center">
          <v-text-field
            v-model="cedulaBuscada"
            label="Cedula del cliente"
            placeholder="Ej: 50919231"
            prepend-inner-icon="mdi-card-account-details-outline"
            variant="outlined"
            density="compact"
            class="flex-grow-1"
            :loading="folios.buscandoCedula.value"
            clearable
            @keyup.enter="buscarFolioPorCedula"
            @click:clear="limpiarBusqueda"
          ></v-text-field>
          <v-btn
            icon
            color="primary"
            @click="buscarFolioPorCedula"
            :loading="folios.loadingFolio.value"
            :disabled="!cedulaBuscada.trim()"
          >
            <v-icon>mdi-magnify</v-icon>
            <v-tooltip activator="parent">Buscar folio</v-tooltip>
          </v-btn>
          <v-btn
            icon
            color="error"
            @click="limpiarBusqueda"
            :disabled="!cedulaBuscada && !habitacionBuscada && !folios.folioActual.value"
          >
            <v-icon>mdi-close</v-icon>
            <v-tooltip activator="parent">Limpiar</v-tooltip>
          </v-btn>
        </div>

        <!-- Mensaje de error si no hay folio -->
        <v-alert
          v-if="busquedaCedulaRealizada && cedulaBuscada && !folios.folioActual.value && !folios.loadingFolio.value"
          type="info"
          variant="tonal"
          density="compact"
          class="mt-3 mb-0"
        >
          No hay folio activo para esta cedula. Valida que el cliente tenga check-in y folio abierto.
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

        <!-- Alerta si folio ya está pagado -->
        <v-alert
          v-if="folios.folioActual.value?.estado === 'PAGADO'"
          type="success"
          variant="tonal"
          density="compact"
          class="mb-4"
          title="Folio pagado"
        >
          Este folio ya fue pagado. El pago se registró correctamente.
          <v-btn
            size="small"
            variant="text"
            color="success"
            class="ms-2"
            prepend-icon="mdi-download"
          >
            Descargar factura
          </v-btn>
        </v-alert>

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
              :to="`/recepcionista/caja?habitacion=${folio.idHabitacion}`"
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
    <v-dialog v-model="cobrarFolioDialog" max-width="720px">
      <v-card title="Confirmar pago del folio">
        <v-card-text v-if="cobrarFolioDialog">
          <v-tabs v-model="modoCobro" density="compact" class="mb-4">
            <v-tab value="simple">Pago simple</v-tab>
            <v-tab value="mixto">Pago mixto</v-tab>
          </v-tabs>

          <v-window v-model="modoCobro">
            <v-window-item value="simple">
              <ConfirmarCobroForm
                :total-a-cobrar="folios.folioActual.value?.total || 0"
                :loading="folios.loadingOperacion.value"
                @confirmar-cobro="ejecutarCobro"
              />
            </v-window-item>
            <v-window-item value="mixto">
              <PagoMixtoForm
                :id-habitacion="folios.folioActual.value?.idHabitacion || 0"
                :total-a-cobrar="folios.folioActual.value?.total || 0"
                :loading="folios.loadingOperacion.value"
                @confirmar="ejecutarCobroMixto"
              />
            </v-window-item>
          </v-window>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="cobrarFolioDialog = false">
            Cancelar pago
          </v-btn>
        </v-card-actions>
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

    <!-- Dialog Factura -->
    <v-dialog v-model="facturaDialog" max-width="1000px" fullscreen>
      <v-card v-if="facturaGenerada" class="factura-print-container">
        <v-card-title class="d-flex align-center ga-2 no-print">
          <v-icon icon="mdi-printer-pos" />
          Factura POS
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" @click="facturaDialog = false" />
        </v-card-title>
        <v-card-text class="pa-4">
          <v-skeleton-loader v-if="loadingTicket" type="article" />
          <FacturaPosTicketPreview
            v-else-if="ticketPosFactura"
            :ticket="ticketPosFactura"
            :formato="formatoTicketPos"
            :downloading-pdf="loadingTicket"
            @update:formato="cambiarFormatoTicketCaja"
            @download-pdf="descargarTicketPdfCaja"
          />
          <v-alert v-else type="info" variant="tonal">
            No se pudo generar la vista POS de esta factura.
          </v-alert>
        </v-card-text>
        <!-- Contenido imprimible -->
        <div v-if="false" style="background: white; padding: 40px; font-family: Arial, sans-serif; color: #333;">
          
          <!-- Encabezado del Hotel -->
          <div style="display: flex; justify-content: space-between;Align-items: center; margin-bottom: 30px; border-bottom: 3px solid #1976d2; padding-bottom: 20px;">
            <div>
              <h1 style="margin: 0; font-size: 28px; color: #1976d2; font-weight: bold;">{{ hotelActual?.nombre?.toUpperCase() || 'HOTEL NO CONFIGURADO' }}</h1>
              <p style="margin: 5px 0; font-size: 12px; color: #666;">NIT: {{ hotelActual?.nit || 'N/A' }}</p>
              <p style="margin: 5px 0; font-size: 12px; color: #666;">{{ hotelActual?.direccion || 'N/A' }} - {{ hotelActual?.ciudad || 'N/A' }}</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 24px; color: #d32f2f; font-weight: bold;">FACTURA</h2>
              <p style="margin: 5px 0; font-size: 12px; color: #666;">Prefijo: {{ hotelActual?.prefijoFacturacion || 'N/A' }}</p>
            </div>
          </div>

          <!-- Información de Factura -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; padding: 15px; background: #f5f5f5; border-radius: 4px;">
            <div>
              <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: bold; color: #666; text-transform: uppercase;">Datos del Documento</p>
              <p style="margin: 3px 0; font-size: 13px;"><strong>Número:</strong> {{ facturaGenerada.numeroFactura }}</p>
              <p style="margin: 3px 0; font-size: 13px;"><strong>Fecha:</strong> {{ new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
              <p style="margin: 3px 0; font-size: 11px; color: #777;"><strong>ID:</strong> {{ facturaGenerada.uuid }}</p>
            </div>
            <div>
              <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: bold; color: #666; text-transform: uppercase;">Datos del Huésped</p>
              <p style="margin: 3px 0; font-size: 13px;"><strong>Nombre:</strong> {{ folios.folioActual.value?.nombreCliente || 'N/A' }}</p>
              <p style="margin: 3px 0; font-size: 13px;"><strong>Cédula:</strong> {{ folios.folioActual.value?.cedulaCliente || 'N/A' }}</p>
              <p style="margin: 3px 0; font-size: 13px;"><strong>Habitación:</strong> {{ folios.folioActual.value?.numeroHabitacion || 'N/A' }}</p>
            </div>
          </div>

          <!-- Tabla de Cargos por Categoría -->
          <div style="margin-bottom: 30px;">
            <h3 style="margin: 0 0 15px 0; font-size: 13px; font-weight: bold; text-transform: uppercase; color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 8px;">Desglose de Cargos con Impuestos</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
              <thead>
                <tr style="background-color: #e3f2fd; border-bottom: 2px solid #1976d2;">
                  <th style="padding: 10px; text-align: left; font-weight: bold;">Concepto</th>
                  <th style="padding: 10px; text-align: center; font-weight: bold;">Cant.</th>
                  <th style="padding: 10px; text-align: right; font-weight: bold;">V. Unit.</th>
                  <th style="padding: 10px; text-align: right; font-weight: bold;">Subtotal</th>
                  <th style="padding: 10px; text-align: right; font-weight: bold; color: #1976d2;">IVA (19%)</th>
                  <th style="padding: 10px; text-align: right; font-weight: bold; color: #d32f2f;">INC (8%)</th>
                  <th style="padding: 10px; text-align: right; font-weight: bold;">Total</th>
                  <th style="padding: 10px; text-align: center; font-weight: bold;">Categoría</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(detalle, idx) in facturaGenerada?.detalles || []" :key="detalle.id" :style="{ backgroundColor: (idx as number) % 2 === 0 ? '#fafafa' : 'white', borderBottom: '1px solid #e0e0e0' }">
                  <td style="padding: 8px 10px; text-align: left;">{{ detalle.descripcion }}</td>
                  <td style="padding: 8px 10px; text-align: center;">{{ detalle.cantidad || 1 }}</td>
                  <td style="padding: 8px 10px; text-align: right;">${{ (detalle.precioUnitario || 0).toLocaleString('es-CO') }}</td>
                  <td style="padding: 8px 10px; text-align: right; font-weight: bold;">${{ (detalle.subtotal || 0).toLocaleString('es-CO') }}</td>
                  <!-- IVA real calculado por el backend -->
                  <td style="padding: 8px 10px; text-align: right; color: #1976d2; font-size: 10px;">
                    ${{ (detalle.montoIva || 0).toLocaleString('es-CO') }}
                  </td>
                  <!-- INC real calculado por el backend -->
                  <td style="padding: 8px 10px; text-align: right; color: #d32f2f; font-size: 10px;">
                    ${{ (detalle.montoInc || 0).toLocaleString('es-CO') }}
                  </td>
                  <!-- Total por línea calculado por el backend -->
                  <td style="padding: 8px 10px; text-align: right; font-weight: bold; background: #fffacd;">
                    ${{ (detalle.total || 0).toLocaleString('es-CO') }}
                  </td>
                  <td style="padding: 8px 10px; text-align: center; font-size: 10px; color: #1976d2;"><strong>{{ detalle.categoriaNombre || 'N/A' }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Resumen Financiero -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
            
            <!-- Ítem izquierdo: Desglose por Categoría -->
            <div v-if="facturaGenerada.desgloseMonetario" style="border: 1px solid #e0e0e0; padding: 15px; border-radius: 4px; background: #f9f9f9;">
              <h4 style="margin: 0 0 12px 0; font-size: 12px; font-weight: bold; color: #1976d2; text-transform: uppercase;">Desglose por Categoría</h4>
              <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
                <tbody>
                  <tr v-for="(montos, categoria) in facturaGenerada.desgloseMonetario" :key="categoria" style="border-bottom: 1px solid #e0e0e0;">
                    <td style="padding: 6px 0; font-weight: bold; color: #333;">{{ categoria }}</td>
                    <td style="padding: 6px 0; text-align: right; color: #1976d2;">
                      <strong>${{ Number(montos.subtotal || 0).toLocaleString('es-CO') }}</strong>
                    </td>
                  </tr>
                  <tr style="background: #e3f2fd; font-weight: bold;">
                    <td style="padding: 8px 0; border-top: 2px solid #1976d2;">Subtotal</td>
                    <td style="padding: 8px 0; text-align: right; border-top: 2px solid #1976d2;">
                      ${{ (facturaGenerada.subtotal || 0).toLocaleString('es-CO') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Ítem derecho: Cálculo de Impuestos y Total -->
            <div style="border: 2px solid #d32f2f; padding: 20px; border-radius: 4px; background: #fff3e0;">
              <h4 style="margin: 0 0 15px 0; font-size: 12px; font-weight: bold; color: #d32f2f; text-transform: uppercase;">Resumen de Impuestos</h4>
              
              <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                <tbody>
                  <tr style="border-bottom: 1px solid #ffe0b2;">
                    <td style="padding: 8px 0; color: #666;">Subtotal</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold;">
                      ${{ (facturaGenerada.subtotal || 0).toLocaleString('es-CO') }}
                    </td>
                  </tr>
                  <tr v-if="facturaGenerada.montoIva > 0" style="border-bottom: 1px solid #ffe0b2;">
                    <td style="padding: 8px 0; color: #666;">IVA ({{ facturaGenerada.porcentajeIva || 0 }}%)</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #1976d2;">
                      ${{ (facturaGenerada.montoIva || 0).toLocaleString('es-CO') }}
                    </td>
                  </tr>
                  <tr v-if="facturaGenerada.montoInc > 0" style="border-bottom: 1px solid #ffe0b2;">
                    <td style="padding: 8px 0; color: #666;">INC ({{ facturaGenerada.porcentajeInc || 0 }}%)</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #d32f2f;">
                      ${{ (facturaGenerada.montoInc || 0).toLocaleString('es-CO') }}
                    </td>
                  </tr>
                  <tr style="background: #d32f2f; color: white; font-weight: bold; border-top: 2px solid #d32f2f; border-bottom: 2px solid #d32f2f;">
                    <td style="padding: 12px 0; font-size: 14px;">TOTAL A PAGAR</td>
                    <td style="padding: 12px 0; text-align: right; font-size: 16px;">
                      ${{ (facturaGenerada.total || 0).toLocaleString('es-CO') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Información de Pago -->
          <div style="padding: 15px; background: #c8e6c9; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
            <p style="margin: 0 0 5px 0; font-size: 12px;"><strong>Método de Pago:</strong> {{ folios.folioActual.value?.medioPago || 'Efectivo' }}</p>
            <p style="margin: 0; font-size: 12px;"><strong>Estado:</strong> <span style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 3px; font-weight: bold; font-size: 11px;">PAGADO</span></p>
          </div>

          <!-- Pie de página -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 10px;">
            <p style="margin: 5px 0;">Gracias por su compra. Esta factura fue generada electrónicamente.</p>
            <p style="margin: 5px 0;">Para consultas, contacte a recepción al hotel.</p>
          </div>
        </div>

        <v-divider v-if="false"></v-divider>

        <v-card-actions v-if="false" class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="tonal"
            color="info"
            prepend-icon="mdi-printer"
            @click="imprimirFactura()"
          >
            Imprimir
          </v-btn>
          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="mdi-download"
            @click="descargarFacturaPDF()"
          >
            Descargar PDF
          </v-btn>
          <v-btn
            variant="flat"
            color="success"
            @click="facturaDialog = false"
          >
            Cerrar
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
import { useHotel } from '~/composables/useHotel'
import { useCaja } from '~/composables/useCaja'
import { useFacturas } from '~/composables/useFacturas'
import type { AgregarCargoDto, CobrarFolioMixtoDto, RespuestaCobro } from '~/types/folio'
import type { FacturaPosTicket, FormatoTicketPos } from '~/types/factura'

import FolioCard from './FolioCard.vue'
import CargosList from './CargosList.vue'
import AgregarCargoForm from './AgregarCargoForm.vue'
import ConfirmarCobroForm from './ConfirmarCobroForm.vue'
import PagoMixtoForm from './PagoMixtoForm.vue'
import FacturaPosTicketPreview from '~/components/facturas/FacturaPosTicket.vue'

const { success, error } = useNotification()
const folios = useFolios()
const foliosStore = useFoliosStore()
const hotel = useHotel()
const caja = useCaja()
const {
  obtenerTicketPos,
  descargarTicketPosPdf,
  loadingTicket,
} = useFacturas()
const route = useRoute()

// State local
const cedulaBuscada = ref('')
const habitacionBuscada = ref<number | null>(null)
const busquedaCedulaRealizada = ref(false)
const cobrarFolioDialog = ref(false)
const modoCobro = ref<'simple' | 'mixto'>('simple')
const cerrarDialog = ref(false)
const cancelarDialog = ref(false)
const observacionesCierre = ref('')
const motivoCancelacion = ref('')
const facturaDialog = ref(false)
const facturaGenerada = ref<any>(null)
const hotelActual = ref<any>(null)
const ticketPosFactura = ref<FacturaPosTicket | null>(null)
const formatoTicketPos = ref<FormatoTicketPos>('80mm')

const habitacionesOcupadas = computed(() => {
  const habitaciones = new Map<number, { id: number; numero: string; piso?: string }>()

  foliosStore.historialDelDia
    .filter((folio) => folio.estado !== 'PAGADO' || Number(folio.saldo || 0) > 0)
    .forEach((folio) => {
      if (!folio.idHabitacion || habitaciones.has(folio.idHabitacion)) {
        return
      }

      habitaciones.set(folio.idHabitacion, {
        id: folio.idHabitacion,
        numero: folio.numeroHabitacion,
      })
    })

  if (foliosStore.folioActual?.idHabitacion && !habitaciones.has(foliosStore.folioActual.idHabitacion)) {
    habitaciones.set(foliosStore.folioActual.idHabitacion, {
      id: foliosStore.folioActual.idHabitacion,
      numero: foliosStore.folioActual.numeroHabitacion,
    })
  }

  return Array.from(habitaciones.values())
})

const sincronizarHistorial = (historial: Awaited<ReturnType<typeof folios.obtenerHistorial>>) => {
  foliosStore.setHistorialDelDia(historial)
}

const cargarFolio = async (idHabitacion: number) => {
  if (!idHabitacion) return
  const resumen = await folios.obtenerFolio(idHabitacion)
  if (!resumen) {
    // Sin folio activo
  } else if (folios.folioActual.value?.cedulaCliente) {
    cedulaBuscada.value = folios.folioActual.value.cedulaCliente
  }

  foliosStore.setFolioActual(folios.folioActual.value)
}

const buscarFolioPorCedula = async () => {
  const cedula = cedulaBuscada.value.trim()

  if (!cedula) {
    error('Ingresa la cedula del cliente')
    return
  }

  busquedaCedulaRealizada.value = true
  const resumen = await folios.obtenerFolioPorCedula(cedula)

  if (resumen?.idHabitacion) {
    habitacionBuscada.value = resumen.idHabitacion
  }

  foliosStore.setFolioActual(folios.folioActual.value)

  if (folios.folioActual.value) {
    foliosStore.agregarAlHistorial(folios.folioActual.value)
  }
}

const recargarFolio = async () => {
  if (cedulaBuscada.value.trim()) {
    await buscarFolioPorCedula()
    return
  }

  if (habitacionBuscada.value) {
    await cargarFolio(habitacionBuscada.value)
  }
}

const limpiarBusqueda = () => {
  cedulaBuscada.value = ''
  habitacionBuscada.value = null
  busquedaCedulaRealizada.value = false
  folios.limpiarFolioActual()
}

const crearFolioNuevo = async () => {
  if (!habitacionBuscada.value) return
  try {
    const folio = await folios.crearFolio(habitacionBuscada.value)
    foliosStore.setFolioActual(folio)
    foliosStore.agregarAlHistorial(folio)
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

const aplicarFormatoPosHotel = (hotelData: any) => {
  const formato = hotelData?.posFormatoDefault
  if (formato === '58mm' || formato === '80mm') {
    formatoTicketPos.value = formato
  }
}

const cargarTicketPosCaja = async (idFactura: number) => {
  ticketPosFactura.value = null
  try {
    ticketPosFactura.value = await obtenerTicketPos(idFactura, formatoTicketPos.value)
  } catch (err) {
    ticketPosFactura.value = null
  }
}

const cambiarFormatoTicketCaja = async (formato: FormatoTicketPos) => {
  formatoTicketPos.value = formato
  if (facturaGenerada.value?.id) {
    await cargarTicketPosCaja(facturaGenerada.value.id)
  }
}

const descargarTicketPdfCaja = async () => {
  if (!facturaGenerada.value?.id) {
    error('No hay factura para descargar')
    return
  }

  await descargarTicketPosPdf(
    facturaGenerada.value.id,
    formatoTicketPos.value,
    'Descarga/reimpresion ticket POS desde caja',
  )
}

const procesarRespuestaCobro = async (respuesta: RespuestaCobro | undefined, mensajeExito: string) => {
  if (!respuesta?.folio) {
    error('No se proceso el pago correctamente')
    return
  }

  if (respuesta.factura?.id) {
    respuesta.folio.idFactura = respuesta.factura.id
    respuesta.folio.numeroFactura = respuesta.factura.numeroFactura
  }

  folios.folioActual.value = respuesta.folio
  foliosStore.setFolioActual(respuesta.folio)
  foliosStore.actualizarFolioEnHistorial(respuesta.folio)

  success(mensajeExito)
  await caja.obtenerTurnoActual().catch(() => {})

  cobrarFolioDialog.value = false
  modoCobro.value = 'simple'

  if (respuesta.factura) {
    facturaGenerada.value = respuesta.factura
    if (respuesta.factura.idHotel) {
      await hotel.obtenerPorId(respuesta.factura.idHotel).then((hotelData) => {
        hotelActual.value = hotelData
        aplicarFormatoPosHotel(hotelData)
      }).catch(() => {
        hotelActual.value = null
      })
    }
    await cargarTicketPosCaja(respuesta.factura.id)
    facturaDialog.value = true
  }
}

const ejecutarCobro = async (datos: any) => {
  if (!folios.folioActual.value?.idHabitacion) return
  try {
    const respuesta = await folios.cobrarFolio(
      folios.folioActual.value.idHabitacion,
      datos.montoRecibido,
      datos.medioPago,
      datos.referencia
    )
    await procesarRespuestaCobro(
      respuesta,
      `Pago registrado correctamente. Cambio: $${(respuesta?.transaccion?.vuelto || 0).toLocaleString('es-CO')}`,
    )
  } catch (err: any) {
    error(err?.message || 'Error al procesar el pago')
  }
}

const ejecutarCobroMixto = async (payload: CobrarFolioMixtoDto) => {
  if (!folios.folioActual.value?.idHabitacion) return
  try {
    const respuesta = await folios.cobrarFolioMixto(
      folios.folioActual.value.idHabitacion,
      payload,
    )
    await procesarRespuestaCobro(
      respuesta,
      `Pago mixto registrado correctamente. Cambio total: $${(respuesta?.transaccion?.vuelto || 0).toLocaleString('es-CO')}`,
    )
  } catch (err: any) {
    error(err?.message || 'Error al procesar el pago mixto')
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

const imprimirFactura = () => {
  window.print()
}

const descargarFacturaPDF = () => {
  // Placeholder para implementación de descarga PDF
  success('Funcionalidad de descarga PDF en desarrollo')
}

onMounted(async () => {
  const habitacionQuery = Number(route.query.habitacion)
  const folioIdQuery = Number(route.query.folioId)

  const historial = await folios.obtenerHistorial()
  sincronizarHistorial(historial)

  if (habitacionQuery > 0) {
    habitacionBuscada.value = habitacionQuery
    await cargarFolio(habitacionQuery)
    return
  }

  if (folioIdQuery > 0) {
    const folioSeleccionado = historial.find((folio) => folio.id === folioIdQuery)

    if (folioSeleccionado?.idHabitacion) {
      habitacionBuscada.value = folioSeleccionado.idHabitacion
      await cargarFolio(folioSeleccionado.idHabitacion)
    }
  }
})
</script>

<style scoped>
.caja-panel {
  width: 100%;
}
</style>
