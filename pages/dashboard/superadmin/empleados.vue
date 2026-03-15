<template>
  <div class="pa-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Gestión de Empleados</h1>
        <p class="text-body-2 text-medium-emphasis">
          Administra los empleados del sistema y sus roles
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="abrirDialogoNuevo"
      >
        Nuevo Empleado
      </v-btn>
    </div>

    <!-- Tabla de empleados -->
    <v-card class="card-glow">
      <v-progress-linear v-if="cargando" indeterminate />
      <v-table>
        <thead>
          <tr>
            <th>Cédula</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Hotel</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="empleado in empleados" :key="empleado.id">
            <td class="font-weight-bold">{{ empleado.cedula }}</td>
            <td>{{ empleado.nombre }} {{ empleado.apellido }}</td>
            <td class="text-caption">{{ empleado.email }}</td>
            <td>
              <v-chip size="small" variant="outlined">
                {{ formatearRol(empleado.rol) }}
              </v-chip>
            </td>
            <td class="text-caption">{{ empleado.idHotel || '—' }}</td>
            <td>
              <v-chip
                :color="empleado.estado === 'activo' ? 'success' : 'error'"
                text-color="white"
                size="small"
              >
                {{ empleado.estado === 'activo' ? 'Activo' : 'Inactivo' }}
              </v-chip>
            </td>
            <td>
              <v-icon-btn
                icon="mdi-pencil"
                size="small"
                color="primary"
                @click="abrirDialogoEditar(empleado)"
              />
              <v-icon-btn
                icon="mdi-toggle-switch"
                size="small"
                :color="empleado.estado === 'activo' ? 'warning' : 'success'"
                @click="cambiarEstado(empleado.id, empleado.estado === 'activo' ? 'inactivo' : 'activo')"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
      <div v-if="empleados.length === 0 && !cargando" class="pa-6 text-center">
        <v-icon size="48" color="grey-lighten-1" class="d-block mb-2">
          mdi-account-group-outline
        </v-icon>
        <p class="text-medium-emphasis">No hay empleados registrados</p>
      </div>
    </v-card>

    <!-- Dialog nuevo/editar empleado -->
    <v-dialog v-model="dialogoEmpleado" max-width="600" persistent>
      <v-card>
        <v-card-title>
          {{ empleadoEditando ? 'Editar Empleado' : 'Nuevo Empleado' }}
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-4">
          <v-form ref="formEmpleado" @submit.prevent="guardarEmpleado">
            <!-- Cédula (no editable si se está editando) -->
            <v-text-field
              v-model="formulario.cedula"
              label="Cédula"
              outlined
              required
              :readonly="!!empleadoEditando"
              class="mb-4"
            />

            <!-- Nombre -->
            <v-text-field
              v-model="formulario.nombre"
              label="Nombre"
              outlined
              required
              class="mb-4"
            />

            <!-- Apellido -->
            <v-text-field
              v-model="formulario.apellido"
              label="Apellido"
              outlined
              required
              class="mb-4"
            />

            <!-- Email (no editable si se está editando) -->
            <v-text-field
              v-model="formulario.email"
              label="Email"
              type="email"
              outlined
              required
              :readonly="!!empleadoEditando"
              class="mb-4"
            />

            <!-- Password (solo en creación) -->
            <v-text-field
              v-if="!empleadoEditando"
              v-model="formulario.password"
              label="Contraseña"
              type="password"
              outlined
              required
              hint="Mínimo 6 caracteres"
              class="mb-4"
            />

            <!-- Rol -->
            <v-select
              v-model="formulario.rol"
              label="Rol"
              :items="rolesDisponibles"
              outlined
              required
              class="mb-4"
            />

            <!-- Hotel (obligatorio) -->
            <v-select
              v-model="formulario.id_hotel"
              label="Hotel"
              :items="hotelOptions"
              :rules="[v => (formulario.rol === 'superadmin' || !!v) || 'El hotel es requerido']"
              outlined
              :clearable="formulario.rol === 'superadmin'"
              required
              class="mb-4"
            />

            <!-- Estado -->
            <v-select
              v-model="formulario.estado"
              label="Estado"
              :items="[
                { title: 'Activo', value: 'activo' },
                { title: 'Inactivo', value: 'inactivo' }
              ]"
              outlined
              class="mb-4"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" @click="dialogoEmpleado = false">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="guardarEmpleado"
            :loading="guardando"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useApi } from '~/composables/useApi';
import { useNotification } from '~/composables/useNotification';
import { UserRole } from '~/types/auth';

interface Empleado {
  id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  idHotel?: number;
  estado: 'activo' | 'inactivo';
}

definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.SUPERADMIN],
})

useHead({ title: 'Gestión de Empleados' })

const api = useApi();
const notification = useNotification();

// State
const empleados = ref<Empleado[]>([]);
const cargando = ref(false);
const guardando = ref(false);
const dialogoEmpleado = ref(false);
const empleadoEditando = ref<Empleado | null>(null);
const formEmpleado = ref<any>(null);

const formulario = reactive({
  cedula: '',
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  rol: 'recepcionista',
  id_hotel: null as number | null,
  estado: 'activo' as 'activo' | 'inactivo',
});

const rolesDisponibles = [
  { title: 'Recepcionista', value: 'recepcionista' },
  { title: 'Admin', value: 'admin' },
  { title: 'Cafetería', value: 'cafeteria' },
  { title: 'Lavandería', value: 'lavanderia' },
  { title: 'Spa', value: 'spa' },
  { title: 'Room Service', value: 'room_service' },
  { title: 'SuperAdmin', value: 'superadmin' },
];

const hotelOptions = ref<Array<{ title: string; value: number }>>([]);

const formatearRol = (rol: string): string => {
  const mapa: Record<string, string> = {
    recepcionista: 'Recepcionista',
    admin: 'Admin',
    cafeteria: 'Cafetería',
    lavanderia: 'Lavandería',
    spa: 'Spa',
    room_service: 'Room Service',
    superadmin: 'SuperAdmin',
  };
  return mapa[rol] || rol;
};

const cargarHoteles = async () => {
  try {
    const data = await api.get('/hoteles');
    hotelOptions.value = data.map((hotel: any) => ({
      title: hotel.nombre || `Hotel ${hotel.id}`,
      value: hotel.id,
    }));
    // Pre-seleccionar el primer hotel
    if (hotelOptions.value.length > 0) {
      formulario.id_hotel = hotelOptions.value[0].value;
    }
  } catch (error) {
    console.error('Error cargando hoteles:', error);
  }
};

const cargarEmpleados = async () => {
  cargando.value = true;
  try {
    const data = await api.get('/empleados');
    empleados.value = data;
  } catch (error) {
    notification.error('Error cargando empleados');
    console.error(error);
  } finally {
    cargando.value = false;
  }
};

const abrirDialogoNuevo = () => {
  empleadoEditando.value = null;
  Object.assign(formulario, {
    cedula: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'recepcionista',
    id_hotel: hotelOptions.value.length > 0 ? hotelOptions.value[0].value : null,
    estado: 'activo',
  });
  dialogoEmpleado.value = true;
};

const abrirDialogoEditar = (empleado: Empleado) => {
  empleadoEditando.value = empleado;
  Object.assign(formulario, {
    cedula: empleado.cedula,
    nombre: empleado.nombre,
    apellido: empleado.apellido,
    email: empleado.email,
    password: '',
    rol: empleado.rol,
    id_hotel: empleado.idHotel || null,
    estado: empleado.estado,
  });
  dialogoEmpleado.value = true;
};

const guardarEmpleado = async () => {
  if (!formEmpleado.value?.validate()) return;

  guardando.value = true;
  try {
    if (empleadoEditando.value) {
      // Actualizar (no incluir cédula ni email)
      const { cedula, email, password, ...datos } = formulario;
      await api.patch(`/empleados/${empleadoEditando.value.id}`, datos);
      notification.success('Empleado actualizado correctamente');
    } else {
      // Crear
      await api.post('/empleados', formulario);
      notification.success('Empleado creado correctamente');
    }
    dialogoEmpleado.value = false;
    await cargarEmpleados();
  } catch (error: any) {
    notification.error(error?.data?.message ?? 'Error al guardar el empleado');
  } finally {
    guardando.value = false;
  }
};

const cambiarEstado = async (idEmpleado: number, nuevoEstado: string) => {
  try {
    await api.patch(`/empleados/${idEmpleado}`, { estado: nuevoEstado });
    notification.success('Estado actualizado');
    await cargarEmpleados();
  } catch (error: any) {
    notification.error(error?.data?.message ?? 'Error al cambiar estado');
  }
};

onMounted(() => {
  cargarHoteles();
  cargarEmpleados();
});
</script>

<style scoped>
.card-glow {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
