<template>
  <div>
    <PageHeader
      title="Servicios disponibles"
      subtitle="Solicita servicios durante tu estadia desde un catalogo centralizado"
    >
      <template #status>
        <v-chip
          :color="checked ? 'success' : 'warning'"
          variant="tonal"
          size="small"
          :prepend-icon="checked ? 'mdi-check-circle' : 'mdi-clock-outline'"
        >
          {{ checked ? 'Check-in confirmado' : 'Disponible tras check-in' }}
        </v-chip>
      </template>
      <template #actions>
        <v-btn
          color="primary"
          variant="outlined"
          prepend-icon="mdi-history"
          @click="router.push('/cliente/servicios/mis-pedidos')"
        >
          Mis pedidos
        </v-btn>
      </template>
    </PageHeader>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="4">
        <StatCard
          label="Categorias"
          :value="totalCategorias"
          icon="mdi-shape-plus-outline"
          color="primary"
          :loading="serviciosStore.loading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <StatCard
          label="Servicios activos"
          :value="totalServicios"
          icon="mdi-room-service-outline"
          color="info"
          :loading="serviciosStore.loading"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <StatCard
          label="Items en carrito"
          :value="serviciosStore.carrito.length"
          icon="mdi-cart-outline"
          color="success"
          helper="Tu seleccion actual"
          :loading="serviciosStore.loading"
        />
      </v-col>
    </v-row>

    <SectionCard v-if="!checked" :padded="false" class="mb-6">
      <EmptyState
        icon="mdi-calendar-check-outline"
        title="Activa tu check-in para pedir servicios"
        description="La recepcion debe confirmar tu ingreso antes de habilitar solicitudes."
        action-label="Ver mis reservas"
        @action="irAReservas"
      />
    </SectionCard>

    <SectionCard v-if="isUnavailable" :padded="false" class="mb-6">
      <EmptyState
        icon="mdi-cloud-off-outline"
        title="Catálogo no disponible en este momento"
        :description="unavailableMessage"
        action-label="Reintentar"
        @action="recargarCatalogo"
      />
    </SectionCard>

    <SectionCard
      v-if="!isUnavailable"
      title="Catalogo por categoria"
      subtitle="Explora servicios, revisa condiciones de entrega y agrega al carrito"
      :padded="false"
    >
      <template #actions>
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-cart"
          :disabled="serviciosStore.carrito.length === 0"
          @click="irAlCarrito"
        >
          Carrito ({{ serviciosStore.carrito.length }})
        </v-btn>
      </template>

      <div class="pa-4">
        <v-tabs v-model="tabActiva" class="mb-4">
          <v-tab v-for="(_, categoria) in serviciosStore.catalogo" :key="categoria" :value="categoria">
            {{ formatearCategoria(categoria) }}
          </v-tab>
        </v-tabs>

        <v-window v-model="tabActiva">
          <v-window-item
            v-for="(servicios, categoria) in serviciosStore.catalogo"
            :key="categoria"
            :value="categoria"
          >
            <v-row>
              <v-col v-for="servicio in servicios" :key="servicio.id" cols="12" sm="6" md="4" lg="3">
                <v-card class="h-100 d-flex flex-column card-glow" variant="outlined">
                  <v-img
                    v-if="servicio.imagenUrl"
                    :src="servicio.imagenUrl"
                    height="150"
                    cover
                  />
                  <div v-else class="bg-grey-lighten-3 d-flex align-center justify-center" style="height: 150px">
                    <v-icon size="40" color="grey">mdi-image-off</v-icon>
                  </div>

                  <v-card-text class="flex-grow-1">
                    <div class="text-subtitle-2 font-weight-bold mb-2">{{ servicio.nombre }}</div>
                    <p class="text-caption text-medium-emphasis mb-3">{{ servicio.descripcion || 'Sin descripcion' }}</p>

                    <div class="d-flex ga-1 flex-wrap mb-3">
                      <v-chip
                        v-if="servicio.disponibleDelivery"
                        size="small"
                        variant="tonal"
                        color="info"
                        prepend-icon="mdi-bike"
                      >
                        Delivery
                      </v-chip>
                      <v-chip
                        v-if="servicio.disponibleRecogida"
                        size="small"
                        variant="tonal"
                        color="warning"
                        prepend-icon="mdi-walk"
                      >
                        Recogida
                      </v-chip>
                    </div>

                    <div class="text-h6 font-weight-bold text-success">
                      ${{ formatearPrecio(servicio.precioUnitario) }}
                    </div>
                    <div class="text-caption text-medium-emphasis">por {{ servicio.unidadMedida }}</div>
                  </v-card-text>

                  <v-card-actions>
                    <v-btn
                      :disabled="!checked"
                      color="primary"
                      block
                      prepend-icon="mdi-plus"
                      @click="abrirDialogAgregar(servicio)"
                    >
                      Agregar
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </div>
    </SectionCard>

    <v-dialog v-model="dialogoAgregarActivo" max-width="440">
      <SectionCard
        :title="`Agregar ${servicioSeleccionado?.nombre || 'servicio'}`"
        subtitle="Define cantidad y observaciones para el pedido"
      >
        <v-text-field
          v-model.number="cantidadTmp"
          label="Cantidad"
          type="number"
          min="1"
          class="mb-3"
        />
        <v-textarea
          v-model="observacionTmp"
          label="Observaciones (opcional)"
          rows="3"
          counter
          maxlength="150"
          class="mb-4"
        />
        <div class="text-subtitle-1 font-weight-bold mb-4">
          Subtotal: ${{ formatearPrecio((servicioSeleccionado?.precioUnitario || 0) * cantidadTmp) }}
        </div>

        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" @click="dialogoAgregarActivo = false">Cancelar</v-btn>
          <v-btn color="primary" @click="confirmarAgregar">Agregar al carrito</v-btn>
        </div>
      </SectionCard>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { UserRole } from '~/types/auth'
import { useRouter } from 'vue-router'
import { useServiciosStore } from '~/stores/servicios'
import { useReservasStore } from '~/stores/reservas'
import { useAuthStore } from '~/stores/auth'
import type { Servicio } from '~/types/servicios'
import PageHeader from '~/components/shared/PageHeader.vue'
import SectionCard from '~/components/shared/SectionCard.vue'
import EmptyState from '~/components/shared/EmptyState.vue'
import StatCard from '~/components/shared/StatCard.vue'

definePageMeta({
  layout: 'cliente',
  middleware: ['auth', 'role'],
  roles: [UserRole.CLIENTE],
})

useHead({ title: 'Servicios' })

const router = useRouter()
const serviciosStore = useServiciosStore()
const reservasStore = useReservasStore()
const authStore = useAuthStore()
const unavailableMessage = ref('')

const tabActiva = ref<string>('')
const dialogoAgregarActivo = ref(false)
const servicioSeleccionado = ref<Servicio | null>(null)
const cantidadTmp = ref(1)
const observacionTmp = ref('')
const isUnavailable = computed(() => Boolean(unavailableMessage.value))

const isQaMockSession = () => {
  const token = authStore.token || ''
  return token.startsWith('qa-token-')
}

const checked = computed(() => {
  return reservasStore.reservas.some(
    (r) =>
      r.idCliente === authStore.user?.idCliente &&
      r.estadoReserva?.toLowerCase() !== 'cancelada' &&
      r.estadoReserva?.toLowerCase() !== 'completada' &&
      !!r.checkinReal &&
      !r.checkoutReal,
  )
})

const totalCategorias = computed(() => Object.keys(serviciosStore.catalogo).length)
const totalServicios = computed(() => Object.values(serviciosStore.catalogo).flat().length)

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

const abrirDialogAgregar = (servicio: Servicio) => {
  servicioSeleccionado.value = servicio
  cantidadTmp.value = 1
  observacionTmp.value = ''
  dialogoAgregarActivo.value = true
}

const confirmarAgregar = () => {
  if (servicioSeleccionado.value) {
    try {
      serviciosStore.agregarAlCarrito(
        servicioSeleccionado.value,
        cantidadTmp.value,
        observacionTmp.value || undefined,
      )
      dialogoAgregarActivo.value = false
      servicioSeleccionado.value = null
    } catch (error: any) {
      alert(error.message || 'Error al agregar al carrito')
    }
  }
}

const irAlCarrito = () => {
  router.push('/cliente/servicios/carrito')
}

const irAReservas = () => {
  router.push('/cliente/reservas/mis-reservas')
}

const recargarCatalogo = async () => {
  unavailableMessage.value = ''

  if (isQaMockSession()) {
    unavailableMessage.value = 'Entorno QA detectado sin backend autenticado. El catálogo se mostrará cuando uses sesión real.'
    return
  }

  try {
    if (!authStore.user?.idHotel && authStore.user?.role === UserRole.CLIENTE) {
      await authStore.fetchReservaActivaAndSetHotel()
    }

    if (authStore.user?.idCliente) {
      await reservasStore.obtenerReservasDelCliente(authStore.user.idCliente)
    }

    const idHotel = authStore.user?.idHotel
    if (!idHotel) {
      unavailableMessage.value = 'No se encontró un hotel asociado a la reserva activa.'
      return
    }

    await serviciosStore.cargarCatalogo(idHotel)

    const categorias = Object.keys(serviciosStore.catalogo)
    if (categorias.length > 0) {
      tabActiva.value = categorias[0]
    }
  } catch (_error) {
    unavailableMessage.value = 'No fue posible cargar el catálogo de servicios. Intenta nuevamente en unos minutos.'
  }
}

onMounted(async () => {
  await recargarCatalogo()
})
</script>

<style scoped>
.card-glow {
  transition: all 0.25s ease;
}

.card-glow:hover {
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.12);
  transform: translateY(-2px);
}
</style>
