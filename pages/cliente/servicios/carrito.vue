<template>
  <div>
    <PageHeader
      title="Resumen del pedido"
      subtitle="Ajusta cantidades, define entrega y confirma tu solicitud"
    >
      <template #actions>
        <v-btn
          color="primary"
          variant="outlined"
          prepend-icon="mdi-arrow-left"
          @click="volverAlCatalogo"
        >
          Volver al catalogo
        </v-btn>
      </template>
    </PageHeader>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Items"
          :value="serviciosStore.carrito.length"
          icon="mdi-format-list-bulleted"
          color="primary"
          :loading="serviciosStore.loading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Categoria"
          :value="formatearCategoria(serviciosStore.categoriaDelCarrito || 'otros')"
          icon="mdi-shape-outline"
          color="info"
          :loading="serviciosStore.loading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Tipo de entrega"
          :value="serviciosStore.tipoEntregaSeleccionado === 'delivery' ? 'Delivery' : 'Recogida'"
          icon="mdi-truck-fast"
          color="warning"
          :loading="serviciosStore.loading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          label="Total"
          :value="`$${formatearPrecio(serviciosStore.totalCarrito)}`"
          icon="mdi-cash-multiple"
          color="success"
          :loading="serviciosStore.loading"
        />
      </v-col>
    </v-row>

    <SectionCard v-if="serviciosStore.carrito.length === 0" :padded="false" class="mb-6">
      <EmptyState
        icon="mdi-cart-off"
        title="Tu carrito esta vacio"
        description="Agrega servicios del catalogo para generar un pedido."
        action-label="Ir al catalogo"
        @action="volverAlCatalogo"
      />
    </SectionCard>

    <v-row v-else>
      <v-col cols="12" md="8">
        <StandardDataTable
          title="Items del pedido"
          subtitle="Edita cantidad, revisa subtotal y elimina lineas"
          :headers="headers"
          :items="serviciosStore.carrito"
          :loading="serviciosStore.loading"
          :items-per-page="-1"
          empty-title="Sin items"
          empty-description="Agrega productos desde el catalogo"
        >
          <template #item.servicio="{ item }">
            <div>
              <div class="font-weight-medium">{{ item.servicio.nombre }}</div>
              <div v-if="item.observacion" class="text-caption text-medium-emphasis">Nota: {{ item.observacion }}</div>
            </div>
          </template>

          <template #item.cantidad="{ item }">
            <v-text-field
              v-model.number="item.cantidad"
              type="number"
              min="1"
              max="100"
              hide-details
              density="compact"
              style="max-width: 80px"
              @update:model-value="serviciosStore.actualizarCantidad(item.servicio.id, item.cantidad)"
            />
          </template>

          <template #item.precio="{ item }">
            ${{ formatearPrecio(item.servicio.precioUnitario) }}
          </template>

          <template #item.subtotal="{ item }">
            <span class="font-weight-bold">${{ formatearPrecio(item.servicio.precioUnitario * item.cantidad) }}</span>
          </template>

          <template #item.acciones="{ item }">
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="serviciosStore.eliminarDelCarrito(item.servicio.id)"
            />
          </template>
        </StandardDataTable>

        <SectionCard title="Observaciones" subtitle="Instrucciones adicionales para el equipo" class="mt-4">
          <v-textarea
            v-model="serviciosStore.notaPedido"
            label="Nota especial"
            rows="3"
            counter
            maxlength="300"
            placeholder="Ej. Llevar a las 3 PM, sin azucar"
          />
        </SectionCard>
      </v-col>

      <v-col cols="12" md="4">
        <SectionCard title="Confirmacion" subtitle="Define entrega y confirma el pedido">
          <v-radio-group
            v-model="serviciosStore.tipoEntregaSeleccionado"
            label="Tipo de entrega"
            class="mb-4"
          >
            <v-radio label="Delivery (a habitacion)" value="delivery" />
            <v-radio label="Recogida" value="recogida" />
          </v-radio-group>

          <v-divider class="mb-4" />

          <div class="d-flex justify-space-between align-center mb-4">
            <span class="text-subtitle-1 font-weight-bold">Total</span>
            <span class="text-h5 font-weight-bold text-success">${{ formatearPrecio(serviciosStore.totalCarrito) }}</span>
          </div>

          <v-btn
            color="success"
            size="large"
            block
            :loading="serviciosStore.loading"
            prepend-icon="mdi-check-circle"
            class="mb-2"
            @click="confirmarPedido"
          >
            Confirmar pedido
          </v-btn>

          <v-btn
            color="grey"
            variant="outlined"
            size="small"
            block
            @click="serviciosStore.limpiarCarrito"
          >
            Limpiar carrito
          </v-btn>
        </SectionCard>

        <SectionCard title="Informacion" subtitle="Antes de confirmar" class="mt-4">
          <v-list density="comfortable" class="bg-transparent pa-0">
            <v-list-item prepend-icon="mdi-information-outline" title="Los precios pueden variar por disponibilidad" />
            <v-list-item prepend-icon="mdi-history" title="Podras seguir el pedido en Mis pedidos" />
          </v-list>
        </SectionCard>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { UserRole } from '~/types/auth'
import { useRouter } from 'vue-router'
import { useServiciosStore } from '~/stores/servicios'
import { useReservasStore } from '~/stores/reservas'
import { useAuthStore } from '~/stores/auth'
import { useNotification } from '~/composables/useNotification'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import StandardDataTable from '~/components/shared/StandardDataTable.vue'
import EmptyState from '~/components/shared/EmptyState.vue'
import StatCard from '~/components/shared/StatCard.vue'

definePageMeta({
  layout: 'cliente',
  middleware: ['auth', 'role'],
  roles: [UserRole.CLIENTE],
})

useHead({ title: 'Carrito de Servicios' })

const router = useRouter()
const serviciosStore = useServiciosStore()
const reservasStore = useReservasStore()
const authStore = useAuthStore()
const notification = useNotification()

const isQaMockSession = () => {
  const token = authStore.token || ''
  return token.startsWith('qa-token-')
}

const headers = [
  { title: 'Servicio', key: 'servicio' },
  { title: 'Cantidad', key: 'cantidad', width: '120px' },
  { title: 'P. Unit.', key: 'precio', width: '130px' },
  { title: 'Subtotal', key: 'subtotal', width: '140px' },
  { title: 'Acciones', key: 'acciones', sortable: false, width: '90px', align: 'end' },
]

const formatearCategoria = (cat: string): string => {
  const map: Record<string, string> = {
    cafeteria: 'Cafeteria',
    lavanderia: 'Lavanderia',
    spa: 'Spa',
    room_service: 'Room Service',
    minibar: 'Minibar',
    otros: 'Otros',
  }
  return map[cat] || cat
}

const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio)
}

const volverAlCatalogo = () => {
  router.push('/cliente/servicios')
}

const confirmarPedido = async () => {
  const reservaActual = reservasStore.reservas.find(
    (r) =>
      r.idCliente === authStore.user?.idCliente &&
      r.estadoReserva?.toLowerCase() === 'confirmada' &&
      r.checkinReal,
  )

  if (!reservaActual) {
    notification.error(
      'No tienes una reserva activa. Solo puedes pedir servicios con reserva confirmada y check-in realizado.',
    )
    return
  }

  const payload = {
    idReserva: reservaActual.id,
    tipoEntrega: serviciosStore.tipoEntregaSeleccionado,
    items: serviciosStore.carrito.map((item) => ({
      idServicio: item.servicio.id,
      cantidad: item.cantidad,
      observacion: item.observacion,
    })),
    notaCliente: serviciosStore.notaPedido || undefined,
  }

  try {
    await serviciosStore.crearPedido(payload)
    notification.success('Pedido confirmado exitosamente')
    serviciosStore.limpiarCarrito()
    router.push(`/cliente/servicios/mis-pedidos?reservaId=${reservaActual.id}`)
  } catch (error: any) {
    notification.error(error?.message || 'Error al confirmar el pedido')
  }
}

onMounted(async () => {
  if (isQaMockSession()) {
    return
  }

  try {
    if (!authStore.user?.idHotel && authStore.user?.role === UserRole.CLIENTE) {
      await authStore.fetchReservaActivaAndSetHotel()
    }

    if (authStore.user?.idCliente) {
      await reservasStore.obtenerReservasDelCliente(authStore.user.idCliente)
    }
  } catch (_error) {
    // En frontend cliente se maneja estado sin bloquear la vista.
  }
})
</script>
