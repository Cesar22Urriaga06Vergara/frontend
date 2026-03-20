# 🔴 VALIDACIÓN DE RUTAS: PROBLEMAS ENCONTRADOS

**Fecha:** 19/03/2026  
**Estado:** CRÍTICO - Refactorización requerida

---

## 📋 RESUMEN EJECUTIVO

**Problemas encontrados:** 5 críticos  
**Impacto:** Rutas mal organizadas, empleados de área accediendo a panel admin incorrecto

---

## 🚨 PROBLEMAS CRITCOS IDENTIFICADOS

### 1. ❌ `admin/area.vue` EN LUGAR INCORRECTO
**Ruta actual:** `/admin/area.vue`  
**Problema:** Este archivo es el panel de gestión de pedidos para empleados de área (cafetería, lavandería, spa, room-service), NO debería estar en `/admin/`  

**Por qué es problema:**
- Los roles `cafeteria`, `lavanderia`, `spa`, `room_service` son empleados, NO admins
- `/admin/` debe ser SOLO para gestión administrativa del hotel (usuarios, habitaciones, tipos, servicios, etc.)
- Confunde la navegación: empleados de área ven panel admin que no les corresponde

**Solución:** Mover a `/dashboard/empleado/area.vue` y actualizar rutas de navegación

---

### 2. ❌ `admin/pedidos.vue` EN LUGAR INCORRECTO
**Ruta actual:** `/admin/pedidos.vue`  
**Problema:** Este archivo es el panel operacional de pedidos para empleados de área, NO debería estar en `/admin/`

**Por qué es problema:**
- Los empleados de área ven este panel, pero está ubicado en `/admin/`
- Confunde la separación de responsabilidades (admin ≠ empleado de área)

**Solución:** Mover a `/dashboard/empleado/pedidos.vue` o consolidar con `/reportes/area/index.vue`

---

### 3. ⚠️ DUPLICACIÓN: `reportes/area/index.vue` + `admin/area.vue`
**Problema:** Existen DOS archivos que parecen hacer lo mismo

**Archivos implicados:**
- `/reportes/area/index.vue` - Panel Kanban de pedidos operacionales
- `/admin/area.vue` - También panel Kanban de pedidos

**Por qué es problema:**
- Mantenimiento duplicado
- Confusión sobre cuál es la fuente de verdad
- Riesgo de inconsistencias

**Solución:** Mantener SOLO `/reportes/area/index.vue` y eliminar `/admin/area.vue`

---

### 4. ⚠️ DUPLICACIÓN: `dashboard/empleado/` + Pedidos en `/admin/`
**Problema:** La navegación para empleados está fragmentada

**Rutas implicadas:**
- `/dashboard/empleado/` - Dashboard principal
- `/admin/pedidos.vue` - Gestión de pedidos (INCORRECTO)
- `/dashboard/empleado/reportes/` - Reportes de área

**Por qué es problema:**
- Empleados de área NO deberían ver `/admin/`
- Rutas inconsistentes para un mismo rol

**Solución:** Consolidar toda la navegación de empleados bajo `/dashboard/empleado/`

---

### 5. ⚠️ INCONSISTENCIA: Reportes de cafetería en `/reportes/area/cafeteria.vue`
**Ruta actual:** `/reportes/area/cafeteria.vue`  
**Problema:** CORRECTO (está bien ubicado) pero necesita validar acceso

**Por qué es Ok:**
- `/reportes/area/` es el lugar correcto para rutas por área
- Contiene: `cafeteria.vue`, `lavanderia.vue`, `spa.vue`, `room-service.vue`

**Validación de acceso:** Verificar que protege con `@usePermissions()` para roles específicos

---

## 📊 ESTRUCTURA ACTUAL vs ESTRUCTURA CORRECTA

### ACTUAL (Incorrecta) ❌
```
admin/
├── index.vue          ✅ OK
├── usuarios.vue       ✅ OK
├── habitaciones.vue   ✅ OK
├── tipos-habitacion.vue ✅ OK
├── servicios.vue      ✅ OK
├── amenidades.vue     ✅ OK
├── facturas.vue       ✅ OK
├── reservas.vue       ✅ OK
├── area.vue           ❌ PROBLEMA: Empleado área, no admin
├── pedidos.vue        ❌ PROBLEMA: Empleado área, no admin
├── reportes.vue       ⚠️ REVISAR
└── reset-stats.vue    ✅ OK

dashboard/
└── empleado/
    ├── index.vue      ✅ OK
    ├── reportes/
    │   ├── [categoria].vue

reportes/
└── area/
    ├── index.vue      ✅ CORRECTO (duplicado con admin/area.vue)
    ├── cafeteria.vue  ✅ OK
    ├── lavanderia.vue ✅ OK
    ├── spa.vue        ✅ OK
    └── room-service.vue ✅ OK
```

### CORRECTA ✅
```
admin/
├── index.vue              ✅ Dashboard admin hotel
├── usuarios.vue           ✅ Gestión de usuarios
├── habitaciones.vue       ✅ Gestión de habitaciones
├── tipos-habitacion.vue   ✅ Gestión de tipos
├── servicios.vue          ✅ Gestión de servicios
├── amenidades.vue         ✅ Gestión amenidades
├── facturas.vue           ✅ Gestión facturas
├── reservas.vue           ✅ Gestión reservas
└── reportes.vue           ✅ Reportes administrativos

dashboard/
└── empleado/
    ├── index.vue          ✅ Dashboard empleado área
    ├── pedidos.vue        ✅ Gestión operacional de pedidos
    ├── area.vue           ✅ Panel de área (Kanban)
    └── reportes/
        ├── index.vue
        └── [categoria].vue

reportes/
├── area/
│   ├── index.vue          ✅ Panel Kanban (vista general)
│   ├── cafeteria.vue      ✅ Reportes cafetería
│   ├── lavanderia.vue     ✅ Reportes lavandería
│   ├── spa.vue            ✅ Reportes spa
│   └── room-service.vue   ✅ Reportes room-service
└── oficina/
    └── [servicios, incidencias]
```

---

## 📋 CHECKLIST DE VALIDACIÓN DE RUTAS

### Backend Endpoints ✅ VALIDADOS

#### Servicios (POST/GET/PATCH/DELETE)
- ✅ `POST /servicios/catalogo` - Crear servicio
- ✅ `GET /servicios/catalogo/:idHotel` - Obtener catálogo
- ✅ `GET /servicios/catalogo-agrupado/:idHotel` - Catálogo agrupado
- ✅ `PATCH /servicios/catalogo/:id` - Actualizar servicio
- ✅ `DELETE /servicios/catalogo/:id` - Desactivar servicio

#### Pedidos Cliente
- ✅ `POST /servicios/pedidos` - Crear pedido (cliente)
- ✅ `GET /servicios/pedidos/mis-pedidos/:idReserva` - Mis pedidos (cliente)
- ✅ `DELETE /servicios/pedidos/:id/cancelar` - Cancelar pedido (cliente)

#### Pedidos por Área (Operacional)
- ✅ `GET /servicios/pedidos/area/:idHotel/:categoria` - Pedidos operacionales
- ✅ `GET /servicios/reportes/area/:idHotel/:categoria` - Reporte área (AUDITADO)
- ✅ `GET /servicios/reportes/hotel/:idHotel` - Reporte consolidado hotel

#### Folios / Caja
- ✅ `POST /folios` - Crear folio
- ✅ `GET /folios/:idHabitacion` - Obtener folio
- ✅ `POST /folios/:idHabitacion/cargos` - Agregar cargo
- ✅ `DELETE /folios/:idHabitacion/cargos/:idCargo` - Eliminar cargo
- ✅ `PUT /folios/:idHabitacion/cerrar` - Cerrar folio
- ✅ `POST /folios/:idHabitacion/cobrar` - Cobrar folio

#### Facturas
- ✅ `POST /facturas/generar/:idReserva` - Generar desde reserva
- ✅ `GET /facturas` - Listar facturas
- ✅ `GET /facturas/:id` - Obtener factura
- ✅ `PATCH /facturas/:id/emitir` - Emitir factura
- ✅ `PATCH /facturas/:id/anular` - Anular factura
- ✅ `PATCH /facturas/:id/marcar-pagada` - Marcar pagada

#### Pagos
- ✅ `POST /pagos` - Registrar pago
- ✅ `GET /pagos/factura/:idFactura` - Pagos de factura
- ✅ `GET /pagos` - Listar pagos
- ✅ `PATCH /pagos/:id/devolver` - Devolver pago

---

### Frontend Routes ❌ PROBLEMAS ENCONTRADOS

| Ruta Actual | Tipo | Rol Acceso | Problema |
|-------------|------|-----------|----------|
| `/admin/area.vue` | ❌ MAL | cafeteria, lavanderia, spa, room_service | NO DEBERÍA ESTAR EN ADMIN |
| `/admin/pedidos.vue` | ❌ MAL | cafeteria, lavanderia, spa, room_service | NO DEBERÍA ESTAR EN ADMIN |
| `/reportes/area/index.vue` | ✅ OK | cafeteria, lavanderia, spa, room_service | Correcto lugar |
| `/reportes/area/cafeteria.vue` | ✅ OK | cafeteria | Correcto lugar |
| `/reportes/area/lavanderia.vue` | ✅ OK | lavanderia | Correcto lugar |
| `/reportes/area/spa.vue` | ✅ OK | spa | Correcto lugar |
| `/reportes/area/room-service.vue` | ✅ OK | room_service | Correcto lugar |
| `/admin/reportes.vue` | ⚠️ REVISAR | admin | Verificar contenido |
| `/dashboard/empleado/index.vue` | ✅ OK | cafeteria, lavanderia, spa, room_service | Correcto |

---

## 🔧 PLAN DE CORRECCIÓN

### Paso 1: Mover archivos
```bash
# Mover admin/area.vue → dashboard/empleado/area.vue
# Mover admin/pedidos.vue → dashboard/empleado/pedidos.vue

# O eliminar admin/area.vue si ya existe reportes/area/index.vue
```

### Paso 2: Actualizar imports y rutas
- Actualizar rutas en middleware de protección
- Actualizar links de navegación en componentes
- Actualizar composables `useRoleNavigation`

### Paso 3: Validar protección de rutas
- Verificar `@usePermissions()` en componentes de área
- Verificar guards en backend para roles de área

### Paso 4: Testing
- Acceder con rol `cafeteria` → debe ver `/reportes/area/`
- NO debe ver `/admin/` directamente
- Acceder con rol `admin` → debe ver `/admin/`
- NO debe ver `/reportes/area/` en navegación

---

## ✅ RUTAS CORRECTAS FINALES

### Para Empleados de Área (cafeteria, lavanderia, spa, room_service)
```
/dashboard/empleado/ ← Dashboard
  ├── /dashboard/empleado/index.vue ← Stats rápidas
  ├── /dashboard/empleado/pedidos.vue ← Gestión operacional
  └── /dashboard/empleado/reportes/[categoria].vue ← Reportes

/reportes/area/ ← Reportes financieros (AUDITADO)
  ├── /reportes/area/index.vue ← Vista general Kanban
  ├── /reportes/area/cafeteria.vue ← Detalles cafetería
  ├── /reportes/area/lavanderia.vue ← Detalles lavandería
  ├── /reportes/area/spa.vue ← Detalles spa
  └── /reportes/area/room-service.vue ← Detalles room-service
```

### Para Recepcionista
```
/recepcionista/
  ├── /recepcionista/caja.vue ← Folios
  ├── /recepcionista/checkin-checkout.vue ← Gestión check-in/out
  └── /recepcionista/incidencias/ ← Gestión de incidencias
```

### Para Admin (Hotel)
```
/admin/
  ├── /admin/index.vue ← Dashboard
  ├── /admin/usuarios.vue ← Gestión de usuarios
  ├── /admin/habitaciones.vue ← Gestión habitaciones
  ├── /admin/tipos-habitacion.vue ← Gestión tipos
  ├── /admin/servicios.vue ← Gestión servicios
  ├── /admin/amenidades.vue ← Gestión amenidades
  ├── /admin/facturas.vue ← Gestión facturas
  ├── /admin/reservas.vue ← Gestión reservas
  └── /admin/reportes.vue ← Reportes hotel
```

### Para SuperAdmin
```
/superadmin/
  ├── /superadmin/index.vue ← Dashboard
  ├── /superadmin/hoteles/ ← Gestión hoteles
  ├── /superadmin/categorias/ ← Categorías servicios
  ├── /superadmin/metricas/ ← Métricas sistema
  ├── /superadmin/configuracion/ ← Configuración
  ├── /superadmin/soporte/ ← Soporte
  └── /superadmin/planes/ ← Planes
```

---

## 📌 NEXT STEPS

1. **Validar acceso a rutas** - Asegurar que cada rol ve solo sus rutas
2. **Mover archivos** - admin/area.vue → dashboard/empleado/
3. **Actualizar navegación** - Componentes menu deben apuntar a rutas correctas
4. **Ajustar protección** - Verificar guards en backend coincidan con frontend
5. **Testing E2E** - Validar flujos por rol
