<template>
  <v-card title="Cargos registrados">
    <v-card-text>
      <v-empty-state
        v-if="!cargos || cargos.length === 0"
        icon="mdi-clipboard-list-outline"
        title="Sin cargos"
        text="Agrega cargos al folio para comenzar"
      ></v-empty-state>

      <v-table v-else density="compact" class="cargos-table">
        <thead>
          <tr>
            <th class="text-left">Descripción</th>
            <th class="text-center">Tipo</th>
            <th class="text-right">Monto</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cargo, index) in cargos" :key="cargo.id" :class="{ 'cargo-descuento': esDescuento(cargo) }">
            <td>
              <div class="font-weight-medium">{{ cargo.descripcion }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ cargo.usuarioRegistro }} • {{ formatearHora(cargo.fechaRegistro) }}
              </div>
            </td>
            <td class="text-center">
              <v-chip size="small" variant="tonal" :color="colorTipo(cargo.tipo)">
                {{ labelTipo(cargo.tipo) }}
              </v-chip>
            </td>
            <td class="text-right">
              <div class="font-weight-bold" :class="{ 'text-error': esDescuento(cargo) }">
                {{ esDescuento(cargo) ? '-' : '' }}${{ Math.abs(cargo.monto).toLocaleString('es-CO') }}
              </div>
            </td>
            <td class="text-center">
              <v-btn
                v-if="!folioComplete?.pagado"
                icon
                size="x-small"
                variant="text"
                color="error"
                @click="eliminarCargo(cargo.id)"
                :loading="loadingEliminar === cargo.id"
              >
                <v-icon>mdi-trash-can-outline</v-icon>
                <v-tooltip activator="parent">Eliminar cargo</v-tooltip>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions>
      <slot name="actions"></slot>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Cargo, Folio, TipoCargo } from '~/types/folio'

interface Props {
  cargos?: Cargo[] | null
  folioComplete?: Folio | null
  loading?: boolean
}

interface Emits {
  (e: 'eliminar-cargo', idCargo: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loadingEliminar = ref<string | null>(null)

const esDescuento = (cargo: Cargo) => {
  return cargo.tipo === 'DESCUENTO' || cargo.monto < 0
}

const colorTipo = (tipo: TipoCargo) => {
  switch (tipo) {
    case 'CONSUMO':
      return 'info'
    case 'SERVICIO':
      return 'primary'
    case 'ADICIONAL':
      return 'warning'
    case 'DESCUENTO':
      return 'error'
    default:
      return 'default'
  }
}

const labelTipo = (tipo: TipoCargo) => {
  switch (tipo) {
    case 'CONSUMO':
      return 'Consumo'
    case 'SERVICIO':
      return 'Servicio'
    case 'ADICIONAL':
      return 'Adicional'
    case 'DESCUENTO':
      return 'Descuento'
    default:
      return tipo
  }
}

const formatearHora = (fecha?: string) => {
  if (!fecha) return '-'
  const date = new Date(fecha)
  return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

const eliminarCargo = async (idCargo: string) => {
  if (!confirm('¿Deseas eliminar este cargo?')) return

  loadingEliminar.value = idCargo
  try {
    emit('eliminar-cargo', idCargo)
  } finally {
    loadingEliminar.value = null
  }
}
</script>

<style scoped>
.cargos-table {
  width: 100%;
}

.cargos-table tr.cargo-descuento {
  background-color: rgba(244, 67, 54, 0.05);
}

.cargos-table :deep(td) {
  padding: 12px !important;
  vertical-align: middle;
}

.cargos-table :deep(th) {
  background-color: rgba(0, 0, 0, 0.04);
  font-weight: 600 !important;
}
</style>
