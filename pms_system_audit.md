# 🏨 PMS HOTEL SENA 2026 — PLAN DE CAMBIOS ACCIONABLE
> Generado: 2026-03-16 | Arquitecto: GitHub Copilot  
> Basado en auditoría completa de código real de ambos repositorios

---

## 📁 REPOSITORIOS

| Repo | Tecnología | URL |
|---|---|---|
| **Backend** | NestJS + TypeORM + MySQL | `Cesar22Urriaga06Vergara/hotel-sena-2026-backend` |
| **Frontend** | Nuxt 3 + Vue 3 + Pinia | `Cesar22Urriaga06Vergara/dashboard` |

---

## 🗂️ ÍNDICE DE CAMBIOS POR PRIORIDAD

| # | Prioridad | Cambio | Repo |
|---|---|---|---|
| 1 | 🔴 CRÍTICO | Fix `idHotel: 1` hardcodeado en login de clientes | Backend |
| 2 | 🔴 CRÍTICO | Impuestos diferenciados IVA 19% vs INC 8% por tipo de servicio | Backend |
| 3 | 🔴 CRÍTICO | Campo `cambio` en pagos en efectivo | Backend |
| 4 | 🔴 CRÍTICO | Eliminar dependencia circular `forwardRef` Reserva ↔ Factura | Backend |
| 5 | 🔴 CRÍTICO | Fix acceso a repositorio privado con bracket notation en PagoService | Backend |
| 6 | 🔴 CRÍTICO | Módulo de Incidentes de Habitación (no existe) | Backend + Frontend |
| 7 | 🟡 IMPORTANTE | Restricción de roles: Admin y SuperAdmin NO deben hacer check-in/checkout | Frontend |
| 8 | 🟡 IMPORTANTE | Eliminar duplicación de páginas entre roles | Frontend |
| 9 | 🟡 IMPORTANTE | Flujo de checkout como modal (no páginas separadas) | Frontend |
| 10 | 🟡 IMPORTANTE | Paginación en `GET /reservas` (sin límite actual) | Backend |
| 11 | 🟡 IMPORTANTE | Área Minibar faltante | Backend + Frontend |
| 12 | 🟡 IMPORTANTE | AuditLog — trazabilidad de acciones | Backend |
| 13 | 🟢 MEJORA | Rate limiting en endpoints de autenticación | Backend |
| 14 | 🟢 MEJORA | Historial de estancias del cliente | Frontend |
| 15 | 🟢 MEJORA | Timeline de consumos en tiempo real para recepcionista | Frontend |

---

---

# ═══════════════════════════════════════
# 🔴 CAMBIOS CRÍTICOS — BLOQUEAN PRODUCCIÓN
# ═══════════════════════════════════════

---

## CAMBIO #1 — Fix `idHotel: 1` hardcodeado en login de clientes

### 📍 Archivos afectados

```
hotel-sena-2026-backend/
└── src/
    └── auth/
        └── auth.service.ts          ← MODIFICAR (líneas 76, 85, 38, 448, 461)
```

### 🔍 Problema en código actual

**Archivo:** `src/auth/auth.service.ts`

```typescript
// ❌ LÍNEA 76 — login() cliente
const token = this.generateToken(cliente.id, cliente.email, 'cliente', 1, cliente.id);
//                                                                       ↑
//                                               idHotel hardcodeado como 1

// ❌ LÍNEA 85 — respuesta login cliente
return {
  user: {
    ...
    idHotel: 1,  // ← HARDCODED — todos los clientes quedan en hotel 1
  },
};

// ❌ LÍNEA 38 — register() cliente
const token = this.generateToken(cliente.id, cliente.email, 'cliente', 1, cliente.id);

// ❌ LÍNEAS 448, 461 — googleLogin()
const token = this.generateToken(cliente.id, cliente.email, 'cliente', 1, cliente.id);
// ...
idHotel: 1,  // ← mismo problema en OAuth
```

### ✅ Lógica correcta

Un cliente no tiene un `idHotel` fijo en su perfil. El hotel relevante se determina por su **reserva activa**. El JWT del cliente **no debe llevar `idHotel`**, o debe ser `null`. El frontend debe obtener el hotel desde la reserva activa.

### 🔧 Cambio requerido

**En `src/auth/auth.service.ts`:**

```typescript
// ✅ CORRECTO — login() cliente: NO enviar idHotel fijo
async login(loginDto: LoginDto) {
  // ...
  if (cliente) {
    // Sin idHotel en el token del cliente — se determina por reserva activa
    const token = this.generateToken(cliente.id, cliente.email, 'cliente', undefined, cliente.id);
    return {
      user: {
        id: cliente.id,
        fullName: `${cliente.nombre} ${cliente.apellido}`,
        email: cliente.email,
        role: 'cliente',
        isActive: true,
        idCliente: cliente.id,
        idHotel: null,  // ← null, no 1
      },
      token,
      refreshToken: null,
    };
  }
}

// ✅ CORRECTO — register() cliente
const token = this.generateToken(cliente.id, cliente.email, 'cliente', undefined, cliente.id);

// ✅ CORRECTO — googleLogin()
async googleLogin(cliente: any) {
  const token = this.generateToken(cliente.id, cliente.email, 'cliente', undefined, cliente.id);
  return {
    user: {
      ...
      idHotel: null,  // ← null
    },
  };
}
```

### ⚠️ Validaciones a agregar

```typescript
// En endpoints que usan idHotel del token del cliente, validar que no sea null
// Ejemplo en servicio.controller.ts al crear pedido:
if (!req.user.idHotel && req.user.rol === 'cliente') {
  // Obtener idHotel desde la reserva activa del cliente
  const reservaActiva = await reservaService.findReservaActivaByCliente(req.user.idCliente);
  if (!reservaActiva) {
    throw new BadRequestException('No tienes una reserva activa para solicitar servicios');
  }
  idHotel = reservaActiva.idHotel;
}
```

### 🔗 Impacto en frontend

**Archivo:** `stores/auth.ts` o `composables/useAuth.ts` — revisar que no dependa de `user.idHotel` para clientes. Si lo hace, cambiar a obtener el hotel desde la reserva activa (`stores/reservas.ts → reservaActiva.idHotel`).

---

## CAMBIO #2 — Impuestos diferenciados: IVA 19% vs INC 8% por concepto

### 📍 Archivos afectados

```
hotel-sena-2026-backend/
└── src/
    └── factura/
        ├── entities/
        │   ├── factura.entity.ts            ← MODIFICAR
        │   └── detalle-factura.entity.ts    ← MODIFICAR (agregar campos de impuesto)
        └── factura.service.ts               ← MODIFICAR (lógica de cálculo)
```

### 🔍 Problema en código actual

**Archivo:** `src/factura/factura.service.ts` — líneas 139-143

```typescript
// ❌ INCORRECTO — aplica 19% IVA a TODO sin distinción
const subtotal = detalles.reduce((sum, d) => sum + Number(d.total), 0);
const porcentajeIva = 19; // IVA estándar Colombia  ← ÚNICO IMPUESTO PARA TODO
const montoIva = subtotal * (porcentajeIva / 100);
const total = subtotal + montoIva;
```

**Archivo:** `src/factura/entities/factura.entity.ts` — líneas 53-63

```typescript
// ❌ Un solo campo de IVA para toda la factura
@Column({ name: 'porcentaje_iva', type: 'decimal', default: 19 })
porcentajeIva: number;

@Column({ name: 'monto_iva', type: 'decimal', precision: 12, scale: 2 })
montoIva: number;
// Falta: montoInc, totalIva, totalInc separados
```

**Archivo:** `src/factura/entities/detalle-factura.entity.ts`

```typescript
// ❌ No tiene campos de impuesto por ítem
// Falta: tipoImpuesto, porcentajeImpuesto, montoImpuesto
```

### 📐 Regla de negocio Colombia (DIAN)

| Tipo concepto | Impuesto | Porcentaje |
|---|---|---|
| `habitacion` | IVA | 19% |
| `servicio` categoría `cafeteria` / `restaurante` | INC | 8% |
| `servicio` categoría `spa` | IVA | 19% |
| `servicio` categoría `room_service` | IVA | 19% |
| `servicio` categoría `lavanderia` | IVA | 19% |
| `servicio` categoría `minibar` | IVA | 19% |

### 🔧 Cambio requerido

**1. En `src/factura/entities/detalle-factura.entity.ts` — agregar:**

```typescript
// ✅ Agregar estos campos al DetalleFactura
@Column({ name: 'tipo_impuesto', default: 'IVA' })
tipoImpuesto: 'IVA' | 'INC';  // IVA = 19%, INC = 8%

@Column({
  name: 'porcentaje_impuesto',
  type: 'decimal',
  precision: 5,
  scale: 2,
  default: 19,
})
porcentajeImpuesto: number;

@Column({
  name: 'monto_impuesto',
  type: 'decimal',
  precision: 12,
  scale: 2,
  default: 0,
})
montoImpuesto: number;
```

**2. En `src/factura/entities/factura.entity.ts` — agregar campos separados:**

```typescript
// ✅ Reemplazar el único montoIva por campos separados IVA / INC
@Column({ name: 'total_iva', type: 'decimal', precision: 12, scale: 2, default: 0 })
totalIva: number;

@Column({ name: 'total_inc', type: 'decimal', precision: 12, scale: 2, default: 0 })
totalInc: number;

// Mantener montoIva para compatibilidad pero calcularlo como totalIva + totalInc
```

**3. En `src/factura/factura.service.ts` — reemplazar el bloque de cálculo (líneas 139-143):**

```typescript
// ✅ CORRECTO — función para determinar el tipo de impuesto por categoría
private getTipoImpuesto(tipoConcepto: string, categoriaServicio?: string): { tipo: 'IVA' | 'INC'; porcentaje: number } {
  if (tipoConcepto === 'habitacion') {
    return { tipo: 'IVA', porcentaje: 19 };
  }
  // Cafetería/Restaurante aplica INC 8% según Ley 1819/2016 Colombia
  if (categoriaServicio === 'cafeteria' || categoriaServicio === 'restaurante') {
    return { tipo: 'INC', porcentaje: 8 };
  }
  // Todos los demás servicios: IVA 19%
  return { tipo: 'IVA', porcentaje: 19 };
}

// ✅ En generarDesdeReserva() — actualizar el push de detalles de servicios
for (const pedido of pedidosEntregados) {
  for (const item of pedido.items) {
    const subtotalServicio = Number(item.cantidad) * Number(item.precioUnitarioSnapshot);
    const impuesto = this.getTipoImpuesto('servicio', pedido.categoriaServicio);
    const montoImpuesto = subtotalServicio * (impuesto.porcentaje / 100);

    detalles.push({
      tipoConcepto: 'servicio',
      descripcion: `${item.nombreServicioSnapshot} (${new Date(pedido.fechaPedido).toLocaleDateString('es-CO')})`,
      cantidad: item.cantidad,
      precioUnitario: Number(item.precioUnitarioSnapshot),
      subtotal: subtotalServicio,
      tipoImpuesto: impuesto.tipo,
      porcentajeImpuesto: impuesto.porcentaje,
      montoImpuesto,
      descuento: 0,
      total: subtotalServicio + montoImpuesto,
      idReferencia: item.id,
    });
  }
}

// ✅ Calcular totales separando IVA e INC
const subtotalBase = detalles.reduce((sum, d) => sum + Number(d.subtotal), 0);
const totalIva = detalles
  .filter(d => d.tipoImpuesto === 'IVA')
  .reduce((sum, d) => sum + Number(d.montoImpuesto ?? 0), 0);
const totalInc = detalles
  .filter(d => d.tipoImpuesto === 'INC')
  .reduce((sum, d) => sum + Number(d.montoImpuesto ?? 0), 0);
const total = subtotalBase + totalIva + totalInc;

factura.subtotal = subtotalBase;
factura.totalIva = totalIva;
factura.totalInc = totalInc;
factura.montoIva = totalIva + totalInc;  // compatibilidad
factura.total = total;
```

### ⚠️ Validación requerida

```typescript
// Agregar validación en el DTO o al construir el detalle:
// Si tipoConcepto es 'servicio', verificar que categoriaServicio no sea null
if (tipoConcepto === 'servicio' && !pedido.categoriaServicio) {
  console.warn(`[IMPUESTO] Pedido ${pedido.id} sin categoría definida — usando IVA 19% por defecto`);
}
```

---

## CAMBIO #3 — Campo `cambio` en pagos en efectivo

### 📍 Archivos afectados

```
hotel-sena-2026-backend/
└── src/
    └── pago/
        ├── entities/
        │   └── pago.entity.ts           ← MODIFICAR (agregar campo cambio)
        ├── dto/
        │   └── create-pago.dto.ts       ← MODIFICAR (agregar montoPagado)
        └── pago.service.ts              ← MODIFICAR (calcular y validar cambio)
```

### 🔍 Problema en código actual

La entidad `Pago` **no tiene campo `cambio`**. El servicio no valida si el monto es suficiente ni calcula el cambio cuando el medio de pago es efectivo.

### 🔧 Cambio requerido

**1. En `src/pago/entities/pago.entity.ts` — agregar:**

```typescript
// ✅ Agregar al final de la entidad Pago
@Column({
  name: 'monto_pagado',
  type: 'decimal',
  precision: 12,
  scale: 2,
  nullable: true,
  comment: 'Monto físico entregado por el cliente (solo efectivo)',
})
montoPagado: number;

@Column({
  name: 'cambio',
  type: 'decimal',
  precision: 12,
  scale: 2,
  default: 0,
  comment: 'Cambio devuelto al cliente (solo aplica para efectivo)',
})
cambio: number;
```

**2. En `src/pago/pago.service.ts` — agregar lógica de cambio:**

```typescript
// ✅ En registrarPago() — después de validar el monto
async registrarPago(dto: CreatePagoDto): Promise<Pago> {
  const factura = await this.facturaService.findOne(dto.idFactura);

  if (factura.estado === 'anulada') {
    throw new BadRequestException('No se puede registrar pago en una factura anulada');
  }

  // ✅ VALIDACIÓN EFECTIVO: monto físico debe cubrir la deuda
  let cambio = 0;
  const totalPendiente = Number(factura.total) - (pagosAnteriores ?? 0);

  if (dto.medioPago === 'efectivo' || dto.medioPago?.toLowerCase().includes('efectivo')) {
    const montoPagado = dto.montoPagado ?? dto.monto;

    if (montoPagado < totalPendiente) {
      throw new BadRequestException(
        `El monto en efectivo (${montoPagado.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}) ` +
        `es insuficiente. Total a pagar: ${totalPendiente.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`
      );
    }
    cambio = montoPagado - totalPendiente;
  }

  const pago = this.pagoRepository.create({
    ...dto,
    monto: Math.min(dto.monto, totalPendiente), // nunca cobrar más de lo debido
    montoPagado: dto.montoPagado ?? dto.monto,
    cambio,
    estado: 'completado',
  });

  return await this.pagoRepository.save(pago);
}
```

**3. En `src/pago/dto/create-pago.dto.ts` — agregar:**

```typescript
// ✅ Agregar campo opcional para el monto físico entregado
@IsOptional()
@IsNumber()
@Min(0)
montoPagado?: number;  // Monto que el cliente físicamente entrega (efectivo)
```

### ⚠️ Validaciones requeridas

```typescript
// Validar que si hay cambio, el medio de pago sea efectivo
if (cambio > 0 && !esMedioEfectivo) {
  throw new BadRequestException('Solo los pagos en efectivo pueden generar cambio');
}

// Validar que la factura no esté ya pagada en exceso
if (dto.monto > totalPendiente && !esMedioEfectivo) {
  throw new BadRequestException('El monto excede el total pendiente de la factura');
}
```

---

## CAMBIO #4 — Eliminar dependencia circular `forwardRef` Reserva ↔ Factura

### 📍 Archivos afectados

```
hotel-sena-2026-backend/
└── src/
    ├── checkout/
    │   ├── checkout.service.ts     ← CREAR NUEVO
    │   ├── checkout.controller.ts  ← CREAR NUEVO (opcional, mover endpoint)
    │   └── checkout.module.ts      ← CREAR NUEVO
    ├── reserva/
    │   ├── reserva.service.ts      ← MODIFICAR (eliminar import FacturaService)
    │   └── reserva.module.ts       ← MODIFICAR
    └── factura/
        ├── factura.service.ts      ← MODIFICAR (eliminar import ReservaService)
        └── factura.module.ts       ← MODIFICAR
```

### 🔍 Problema en código actual

**`src/reserva/reserva.service.ts` línea 35:**
```typescript
// ❌ CIRCULAR — ReservaService depende de FacturaService
@Inject(forwardRef(() => FacturaService))
private facturaService: FacturaService,
```

**`src/factura/factura.service.ts` línea 33:**
```typescript
// ❌ CIRCULAR — FacturaService depende de ReservaService
@Inject(forwardRef(() => ReservaService))
private reservaService: ReservaService,
```

### 🔧 Solución: Crear `CheckoutService` orquestador

**Nuevo archivo `src/checkout/checkout.service.ts`:**

```typescript
// ✅ CheckoutService orquesta el proceso sin que Reserva y Factura se conozcan
@Injectable()
export class CheckoutService {
  constructor(
    private readonly reservaService: ReservaService,    // Sin forwardRef
    private readonly facturaService: FacturaService,    // Sin forwardRef
  ) {}

  async ejecutarCheckout(idReserva: number): Promise<{ reserva: Reserva; factura: Factura }> {
    // 1. Validar y completar la reserva
    const reserva = await this.reservaService.findOne(idReserva);
    if (reserva.estadoReserva?.toLowerCase() !== 'confirmada') {
      throw new BadRequestException('Solo se pueden hacer check-out en reservas confirmadas');
    }

    reserva.checkoutReal = new Date();
    reserva.estadoReserva = 'completada';
    const reservaCompletada = await this.reservaService.guardarReserva(reserva);

    // 2. Generar factura
    const factura = await this.facturaService.generarDesdeReserva(reservaCompletada);

    // 3. (Futuro) Notificaciones, AuditLog, etc.
    return { reserva: reservaCompletada, factura };
  }
}
```

**En `src/reserva/reserva.service.ts` — eliminar FacturaService:**

```typescript
// ✅ ANTES (eliminar):
@Inject(forwardRef(() => FacturaService))
private facturaService: FacturaService,

// ✅ El método confirmarCheckout() en reserva.service.ts ahora solo actualiza la reserva
// sin generar factura — eso lo hace CheckoutService
async confirmarCheckout(id: number): Promise<Reserva> {
  const reserva = await this.findOne(id);
  if (reserva.estadoReserva?.toLowerCase() !== 'confirmada') {
    throw new BadRequestException('Solo se pueden hacer check-out en reservas confirmadas');
  }
  reserva.checkoutReal = new Date();
  reserva.estadoReserva = 'completada';
  return await this.reservaRepository.save(reserva);
}

// ✅ Exponer método público para guardar reserva (lo usa CheckoutService)
async guardarReserva(reserva: Reserva): Promise<Reserva> {
  return await this.reservaRepository.save(reserva);
}
```

**En `src/factura/factura.service.ts` — eliminar ReservaService:**

```typescript
// ✅ ANTES (eliminar):
@Inject(forwardRef(() => ReservaService))
private reservaService: ReservaService,
// FacturaService ya recibe el objeto Reserva como parámetro en generarDesdeReserva()
// No necesita inyectar ReservaService
```

---

## CAMBIO #5 — Fix acceso a repositorio privado con bracket notation

### 📍 Archivos afectados

```
hotel-sena-2026-backend/
└── src/
    └── pago/
        └── pago.service.ts    ← MODIFICAR
    └── factura/
        └── factura.service.ts ← MODIFICAR (exponer método público)
```

### 🔍 Problema en código actual

**`src/pago/pago.service.ts` (línea que accede al repositorio privado):**
```typescript
// ❌ ANTIPATRÓN — accede al repositorio privado de otro servicio con bracket notation
await this.facturaService['facturaRepository'].save(factura);
//                        ↑
//    Evade TypeScript private — si cambia el nombre del campo, falla en runtime sin error
```

### 🔧 Cambio requerido

**En `src/factura/factura.service.ts` — agregar método público:**

```typescript
// ✅ Exponer un método público específico para actualizar el estado
async actualizarEstado(id: number, nuevoEstado: 'pendiente' | 'pagada' | 'anulada' | 'emitida'): Promise<void> {
  await this.facturaRepository.update({ id }, { estado: nuevoEstado });
}
```

**En `src/pago/pago.service.ts` — reemplazar el acceso directo:**

```typescript
// ✅ CORRECTO — usar el método público
// ANTES (❌):
await this.facturaService['facturaRepository'].save(factura);

// DESPUÉS (✅):
await this.facturaService.actualizarEstado(factura.id, 'pagada');
```

---

## CAMBIO #6 — Módulo de Incidentes de Habitación (crear desde cero)

### 📍 Archivos a CREAR

```
hotel-sena-2026-backend/
└── src/
    └── incidente/
        ├── entities/
        │   └── incidente.entity.ts         ← CREAR
        ├── dto/
        │   ├── create-incidente.dto.ts     ← CREAR
        │   └── update-incidente.dto.ts     ← CREAR
        ├── incidente.controller.ts         ← CREAR
        ├── incidente.service.ts            ← CREAR
        └── incidente.module.ts             ← CREAR

/dashboard/ (frontend)
└── pages/
    └── dashboard/
        └── empleados/
            └── recepcionista/
                └── incidentes.vue          ← CREAR
```

### 🔧 Estructura de la entidad

**`src/incidente/entities/incidente.entity.ts`:**

```typescript
// ✅ Entidad Incidente
@Entity('incidentes')
export class Incidente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_habitacion' })
  idHabitacion: number;

  @Column({ name: 'id_hotel' })
  idHotel: number;

  @Column({ name: 'numero_habitacion' })
  numeroHabitacion: string;  // Desnormalizado para historial

  // Tipo: 'mantenimiento' | 'limpieza' | 'seguridad' | 'otros'
  @Column({ name: 'tipo_incidente', default: 'mantenimiento' })
tipoIncidente: string;

  @Column({ type: 'text' })
descripcion: string;

  // Estado: 'abierto' | 'en_proceso' | 'resuelto'
  @Column({ default: 'abierto' })
estado: string;

  // Prioridad: 'baja' | 'media' | 'alta' | 'critica'
  @Column({ default: 'media' })
  prioridad: string;

  @Column({ name: 'id_reportado_por' })
  idReportadoPor: number;  // idEmpleado del recepcionista

  @Column({ name: 'nombre_reportado_por' })
  nombreReportadoPor: string;

  @Column({ name: 'id_asignado_a', nullable: true })
  idAsignadoA: number;  // idEmpleado de mantenimiento/limpieza

  @Column({ name: 'fecha_resolucion', nullable: true })
  fechaResolucion: Date;

  @Column({ nullable: true, type: 'text' })
  notasResolucion: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 🔒 Permisos por rol

| Acción | Roles permitidos |
|---|---|
| Crear incidente | `recepcionista`, `admin`, `superadmin` |
| Ver todos los incidentes del hotel | `recepcionista`, `admin`, `superadmin` |
| Actualizar estado incidente | `recepcionista`, `admin`, `superadmin` |
| Ver solo incidentes asignados | (futuro) empleado de mantenimiento |
| Eliminar incidente | `admin`, `superadmin` |

### ⚠️ Validaciones requeridas en el DTO

```typescript
// create-incidente.dto.ts
@IsNotEmpty({ message: 'La habitación es requerida' })
@IsNumber({}, { message: 'El ID de habitación debe ser un número' })
idHabitacion: number;

@IsNotEmpty({ message: 'La descripción es requerida' })
@IsString()
@MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
descripcion: string;

@IsIn(['mantenimiento', 'limpieza', 'seguridad', 'otros'], {
  message: 'Tipo de incidente inválido'
})
tipoIncidente: string;

@IsIn(['baja', 'media', 'alta', 'critica'], {
  message: 'Prioridad inválida'
})
prioridad: string;
```

---

---

# ══════════════════════════════════════
# 🟡 CAMBIOS IMPORTANTES
# ══════════════════════════════════════

---

## CAMBIO #7 — Restricción de roles: Admin y SuperAdmin NO operan check-in/checkout

### 📍 Archivos afectados en FRONTEND

```
dashboard/
└── pages/
    └── dashboard/
        └── empleados/
            ├── admin/
            │   ├── checkin.vue        ← ELIMINAR o BLOQUEAR con redirect
            │   ├── checkout.vue       ← ELIMINAR o BLOQUEAR con redirect
            │   └── registrar-pago.vue ← MOVER solo a recepcionista
            └── superadmin/
                ├── checkin.vue        ← ELIMINAR o BLOQUEAR con redirect
                ├── checkout.vue       ← ELIMINAR o BLOQUEAR con redirect
                └── registrar-pago.vue ← ELIMINAR o BLOQUEAR
```

### 🔧 Opciones de implementación

**Opción A (Rápida) — Redirigir con middleware:**
```typescript
// En las páginas admin/checkin.vue y superadmin/checkin.vue — agregar en <script setup>:
definePageMeta({
  middleware: ['auth', 'role'],
});

// O directamente en onMounted:
const auth = useAuthStore();
if (auth.user?.role === 'admin' || auth.user?.role === 'superadmin') {
  // ❌ El admin/superadmin no opera check-in
  await navigateTo('/dashboard/empleados/admin'); // redirigir al dashboard del rol
}
```

**Opción B (Correcta) — Eliminar las páginas duplicadas:**
Eliminar `admin/checkin.vue`, `admin/checkout.vue`, `superadmin/checkin.vue`, `superadmin/checkout.vue` y actualizar los menús de navegación de esos roles para que NO incluyan esas rutas.

### 🔒 Validación en backend (doble capa)
**`src/reserva/reserva.controller.ts` — endpoint de checkin/checkout:**
```typescript
// ✅ Agregar validación de rol operativo
@Post(':id/checkin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('recepcionista')  // ← SOLO recepcionista, no admin ni superadmin
async confirmarCheckin(@Param('id') id: string, @Request() req) {
  // ...
}

@Post(':id/checkout')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('recepcionista')  // ← SOLO recepcionista
async confirmarCheckout(@Param('id') id: string, @Request() req) {
  // ...
}
}
```

---

## CAMBIO #8 — Eliminar duplicación de páginas entre roles

### 📍 Estado actual del problema
```
dashboard/pages/dashboard/empleados/
├── admin/
│   ├── checkin.vue         (9.6KB)  ─┐
│   ├── checkout.vue       (10.5KB)   │ Casi idénticos
│   ├── reservas.vue       (19.9KB)   │ en los 3 roles
│   └── ...                          │
├── superadmin/                       │
│   ├── checkin.vue         (9.6KB)  ─┤
│   ├── checkout.vue       (10.5KB)   │
│   ├── reservas.vue       (19.9KB)   ─┘
│   └── ...
└── recepcionista/
    ├── checkin.vue         (9.6KB)
    ├── checkout.vue       (28.2KB)  ← Tiene más funcionalidad
    └── reservas.vue       (15.1KB)
```

### 🔧 Estrategia de refactorización
**Crear componentes compartidos:**
```
dashboard/
└── components/
    └── reservas/
        ├── ReservasList.vue        ← CREAR — lista de reservas reutilizable
        ├── CheckinModal.vue        ← CREAR — modal de check-in
        ├── CheckoutModal.vue       ← CREAR — modal de checkout completo
        └── PagoModal.vue           ← CREAR — modal de registro de pago
```

**Los componentes reciben props de rol para ajustar permisos:**
```vue
<!-- ReservasList.vue -->
<script setup>
defineProps<{
  rol: 'recepcionista' | 'admin' | 'superadmin'
  idHotel: number
}>()// El componente oculta/muestra acciones según el prop `rol`
</script>
```

**Las páginas por rol quedan simplificadas a wrappers:**
```vue
<!-- pages/dashboard/empleados/recepcionista/reservas.vue -->
<template>
  <ReservasList rol="recepcionista" :id-hotel="auth.user.idHotel" />
</template>
```

---

## CAMBIO #9 — Flujo de checkout como modal (no páginas separadas)
### 📍 Archivos afectados
```
dashboard/
└── pages/
    └── dashboard/
        └── empleados/
            └── recepcionista/
                ├── reservas.vue        ← MODIFICAR (integrar modal en lugar de navegar)
                ├── checkout.vue        ← REFACTORIZAR a componente modal
                └── factura-checkout.vue ← INTEGRAR dentro del flujo modal
```
### 🔍 Problema actual
El flujo navega entre páginas:
```
reservas.vue → checkout.vue → factura-checkout.vue
```
### 🔧 Flujo modal correcto
```
reservas.vue (lista)
  └── [Botón "Checkout"] → abre modal paso 1
      └── Paso 1: Resumen de consumos (detalles de la factura)
          └── [Continuar] → Paso 2: Selección de método de pago
              └── Paso 2: PaymentDialog
                  - Selector método: Efectivo / Tarjeta / Transferencia / Mixto
                  - Si Efectivo: campo "Monto entregado" → muestra cambio automático
                  └── [Confirmar pago] → Paso 3: Recibo/Confirmación
                      └── Paso 3: Recibo con opción de imprimir
                          └── [Cerrar] → regresa a la lista de reservas (actualizada)
```
**Estructura del componente modal:**
```vue
<!-- components/checkout/CheckoutWizard.vue -->
<template>
  <div v-if="paso === 1">
    <!-- Resumen de factura con items -->
  </div>
  <div v-if="paso === 2">
    <!-- Selección método de pago -->
    <select v-model="metodoPago">
      <option value="efectivo">Efectivo</option>
      <option value="tarjeta">Tarjeta</option>
      <option value="transferencia">Transferencia</option>
    </select>
    <!-- Si efectivo: campo de monto pagado y cambio calculado -->
    <div v-if="metodoPago === 'efectivo'">
      <input v-model="montoPagado" type="number" placeholder="Monto entregado" />
      <p>Cambio a devolver: {{ cambioCalculado }}</p>
      <!-- ⚠️ Validar que montoPagado >= totalFactura antes de habilitar "Confirmar" -->
    </div>
  </div>
  <div v-if="paso === 3">
    <!-- Recibo de pago -->
  </div>
</template>
<script setup>
const cambioCalculado = computed(() => {
  if (metodoPago.value === 'efectivo' && montoPagado.value) {
    const cambio = montoPagado.value - totalFactura.value;
    return cambio >= 0 ? cambio : 0;
  }
  return 0;
});

// ⚠️ Validar antes de confirmar
const puedeConfirmar = computed(() => {
  if (metodoPago.value === 'efectivo') {
    return montoPagado.value >= totalFactura.value;
  }
  return metodoPago.value !== '';
});
</script>
```
---

## CAMBIO #10 — Paginación en `GET /reservas`
### 📍 Archivos afectados
```
hotel-sena-2026-backend/
└── src/
    └── reserva/
        ├── reserva.controller.ts  ← MODIFICAR (agregar query params de paginación)
        └── reserva.service.ts     ← MODIFICAR (agregar .take() y .skip())
```
### 🔧 Cambio requerido
**`src/reserva/reserva.service.ts`:**
```typescript
// ✅ Agregar paginación a findAll()
async findAll(page: number = 1, limit: number = 50): Promise<{ reservas: Reserva[]; total: number; page: number; totalPages: number }> {
  const [reservas, total] = await this.reservaRepository.findAndCount({
    relations: ['habitacion', 'tipoHabitacion'],
    order: { checkinPrevisto: 'ASC' },
    take: limit,
    skip: (page - 1) * limit,
  });

  return {
    reservas,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
```
**`src/reserva/reserva.controller.ts`:**
```typescript
// ✅ Agregar query params
@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin')
async findAll(
  @Query('page') page: string = '1',
  @Query('limit') limit: string = '50',
) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50)); // máximo 100 por página
  return this.reservaService.findAll(pageNum, limitNum);
}
```
---

## CAMBIO #11 — Área Minibar (crear desde cero)
### 📍 Archivos a CREAR
```
dashboard/
└── pages/
    └── dashboard/
        └── empleados/
            └── area/
                └── minibar.vue    ← CREAR (similar a cafeteria.vue)
```
### 🔧 Cambio en backend
Verificar que en el catálogo de servicios del backend, la categoría `minibar` exista. Si no:
```typescript
// En src/servicio/servicio.service.ts o seed de datos
// Agregar categoría 'minibar' como valor válido en el campo categoria
// Verificar el enum o check constraint en la BD
```
**La página `minibar.vue` debe seguir el mismo patrón que `cafeteria.vue`**:
- Ver pedidos con estado `PENDIENTE` / `EN_PROCESO`
- Cambiar estado a `ENTREGADO`
- No mostrar totales financieros
- No mostrar datos de factura
---

## CAMBIO #12 — AuditLog (trazabilidad de acciones críticas)
### 📍 Archivos a CREAR
```
hotel-sena-2026-backend/
└── src/
    └── audit-log/
        ├── entities/
        │   └── audit-log.entity.ts     ← CREAR
        ├── audit-log.service.ts        ← CREAR
        └── audit-log.module.ts         ← CREAR
```
### 🔧 Estructura
```typescript
// src/audit-log/entities/audit-log.entity.ts
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  // Quién hizo la acción
  @Column({ name: 'id_usuario' })
  idUsuario: number;

  @Column({ name: 'nombre_usuario' })
  nombreUsuario: string;

  @Column({ name: 'rol_usuario' })
  rolUsuario: string;

  // Qué acción
  @Column()
  accion: string;  // 'CHECKIN', 'CHECKOUT', 'CREAR_FACTURA', 'PAGO', 'CANCELAR_RESERVA', etc.

  // Sobre qué entidad
  @Column({ name: 'tipo_entidad' })
  tipoEntidad: string;  // 'Reserva', 'Factura', 'Pago', 'Incidente'

  @Column({ name: 'id_entidad' })
  idEntidad: number;

  @Column({ name: 'id_hotel', nullable: true })
  idHotel: number;

  // Contexto
  @Column({ name: 'datos_antes', nullable: true, type: 'json' })
  datosAntes: object;

  @Column({ name: 'datos_despues', nullable: true, type: 'json' })
  datosDespues: object;

  @Column({ nullable: true })
  ip: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```
### ✅ Acciones que DEBEN auditarse
| Acción | Prioridad |
|---|---|
| Check-in de reserva | Alta |
| Check-out de reserva | Alta |
| Creación de factura | Alta |
| Registro de pago | Alta |
| Anulación de factura | Alta |
| Cancelación de reserva | Alta |
| Creación/modificación de usuario | Media |
| Reset de estadísticas | Alta |
| Cambio de estado de incidente | Media |
|
---

---

# 🟢 MEJORAS UX / TÉCNICAS

---

## CAMBIO #13 — Rate limiting en autenticación
### 📍 Archivos afectados
```
hotel-sena-2026-backend/
├── src/
│   └── auth/
│       └── auth.controller.ts    ← MODIFICAR (agregar @Throttle)
└── app.module.ts                  ← MODIFICAR (registrar ThrottlerModule)
```
### 🔧 Cambio requerido
**Instalar:** `npm install @nestjs/throttler`
**`app.module.ts`:**
```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,    // ventana de 1 minuto
      limit: 10,     // máximo 10 requests por ventana
    }]),
    // ...resto de módulos
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```
**`src/auth/auth.controller.ts`:**
```typescript
// Límite específico para login: máximo 5 intentos por minuto
@Throttle({ default: { ttl: 60000, limit: 5 } })
@Post('login')
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```
---

## CAMBIO #14 — Historial de estancias del cliente
### 📍 Archivos a CREAR/MODIFICAR
```
dashboard/
└── pages/
    └── dashboard/
        └── empleados/
            └── recepcionista/
                └── historial-cliente.vue  ← CREAR
```
### 🔧 Descripción
La página `historial-cliente.vue` debe:
1. Tener un campo de búsqueda por cédula
2. Llamar a `GET /reservas/by-cedula?cedula=XXX&idHotel=YYY` (endpoint ya existe en `reserva.service.ts`)
3. Mostrar la lista de todas las reservas del cliente (completadas + activas + canceladas)
4. Para cada reserva: fechas, habitación, estado, total facturado (si existe)
5. Enlace para ver los consumos de cada estancia
---

## CAMBIO #15 — Timeline de consumos en tiempo real
### 📍 Archivos a CREAR/MODIFICAR
```
dashboard/
└── components/
    └── reservas/
        └── ConsumoTimeline.vue    ← CREAR
```
### 🔧 Descripción
El componente `ConsumoTimeline.vue` debe:
1. Recibir `idReserva` como prop
2. Llamar a `GET /servicios/pedidos/by-reserva/:idReserva`
3. Mostrar una línea de tiempo de pedidos ordenada por fecha
4. Cada pedido muestra: área, items, estado (con color), hora
5. Actualización cada 30 segundos (polling) o WebSocket si disponible
6. Solo mostrar subtotales por pedido, **no el total de factura**
```vue
<!-- ConsumoTimeline.vue -->
<script setup>
const props = defineProps<{ idReserva: number }>();
// Polling cada 30 segundos para ver nuevos pedidos entregados
const { data: pedidos, refresh } = await useAsyncData(
  `pedidos-${props.idReserva}`,
  () => api.get(`/servicios/pedidos/by-reserva/${props.idReserva}`)
);
// Actualización automática
onMounted(() => {
  const intervalo = setInterval(refresh, 30000);
  onUnmounted(() => clearInterval(intervalo));
});
</script>
```