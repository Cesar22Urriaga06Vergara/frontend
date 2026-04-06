# Áreas Operativas del Hotel

Este directorio contiene las **vistas de trabajo** para empleados de áreas operativas.

## ⚠️ Importante: Cada área es DIFERENTE

Actualmente todas las áreas usan el componente genérico `AreaPedidosPanel`, pero esto es **temporal**. Cada área tiene **necesidades únicas** y requiere desarrollo específico.

## 🎯 Funcionalidad por Área

### 1. **Cafetería** (`/areas/cafeteria`)
- **Función**: Gestionar pedidos de comida y bebidas
- **Características necesarias**:
  - Lista de pedidos activos (pendientes, en preparación)
  - Detalles del pedido (mesa/habitación, items, cantidad)
  - Cambiar estado: Pendiente → En preparación → Listo → Entregado
  - Historial del día
  - Inventario básico de ingredientes

### 2. **Lavandería** (`/areas/lavanderia`)
- **Función**: Gestionar lotes de ropa de huéspedes
- **Características necesarias**:
  - Crear lotes por habitación
  - Registro de prendas (tipo, cantidad, estado)
  - Estados: Recibido → Lavando → Secando → Planchado → Listo
  - Tracking de ubicación de prendas
  - Horario de entrega estimado

### 3. **Spa** (`/areas/spa`)
- **Función**: Gestionar servicios de bienestar
- **Características necesarias**:
  - Calendario de citas (por terapeuta, sala)
  - Reservas de servicios (masajes, faciales, etc.)
  - Estados: Agendado → En sesión → Completado
  - Inventario de productos/insumos
  - Notas del cliente (preferencias, alergias)

### 4. **Room Service** (`/areas/room-service`)
- **Función**: Gestionar entregas a habitaciones
- **Características necesarias**:
  - Cola de pedidos por entregar
  - Asignación de meseros/runners
  - Tracking de ubicación (en cocina, en ruta, entregado)
  - Priorización por urgencia
  - Mapa de habitaciones

### 5. **Minibar** (`/areas/minibar`)
- **Función**: Gestionar reposición de minibares en habitaciones
- **Características necesarias**:
  - Lista de habitaciones a reponer
  - Inventario consumido vs. disponible
  - Carga de productos al carro
  - Registro de consumos por habitación
  - Alertas de stock bajo

### 6. **Transporte** (`/areas/transporte`)
- **Función**: Gestionar traslados de huéspedes
- **Características necesarias**:
  - Calendario de traslados (aeropuerto, tours, etc.)
  - Asignación de vehículos y conductores
  - Tracking GPS en tiempo real
  - Registro de kilometraje
  - Confirmación de recogida/entrega

### 7. **Tours** (`/areas/tours`)
- **Función**: Gestionar excursiones y actividades
- **Características necesarias**:
  - Calendario de tours disponibles
  - Reservas por tour (cupos, participantes)
  - Asignación de guías
  - Checklist de equipamiento
  - Itinerario detallado

### 8. **Eventos** (`/areas/eventos`)
- **Función**: Gestionar salones y eventos
- **Características necesarias**:
  - Calendario de ocupación de salones
  - Detalles del evento (tipo, capacidad, montaje)
  - Checklist de equipamiento (audio, mobiliario, decoración)
  - Coordinación con catering/cocina
  - Timeline del evento

### 9. **Mantenimiento** (`/areas/mantenimiento`)
- **Función**: Gestionar órdenes de trabajo
- **Características necesarias**:
  - Cola de tareas (urgente, programado, preventivo)
  - Asignación de técnicos
  - Inventario de herramientas/repuestos
  - Registro de trabajo realizado
  - Historial por habitación/área

## 🛠️ Estado Actual

**Componente genérico**: `AreaPedidosPanel.vue`
- Muestra pedidos de la categoría correspondiente
- UI básica con estados (pendiente, en preparación, completado)
- Funciona como **proof of concept**

## 📋 Plan de Desarrollo

Cada área debería tener su propio componente especializado:

```
components/
  areas/
    CafeteriaPanel.vue        # UI específica para cafetería
    LavanderiaPanel.vue       # Gestión de lotes de ropa
    SpaPanel.vue              # Calendario de citas
    RoomServicePanel.vue      # Tracking de entregas
    MinibarPanel.vue          # Inventario y reposiciones
    TransportePanel.vue       # GPS y rutas
    ToursPanel.vue            # Gestión de excursiones
    EventosPanel.vue          # Salones y montajes
    MantenimientoPanel.vue    # Órdenes de trabajo
```

## 🎨 Diferencias en UI/UX

- **Cafetería**: Enfoque en velocidad, cocina tipo kanban
- **Lavandería**: Timeline de proceso, tracking de prendas
- **Spa**: Calendario semanal, vista por terapeuta
- **Room Service**: Mapa de habitaciones, priorización
- **Minibar**: Grilla de productos, checkboxes
- **Transporte**: Mapa GPS, línea de tiempo
- **Tours**: Cards de tours, lista de participantes
- **Eventos**: Gantt chart, checklist complejo
- **Mantenimiento**: Tickets tipo helpdesk, prioridades

## 🔄 Migración Gradual

1. **Fase 1** ✅: Estructura base con componente genérico (ACTUAL)
2. **Fase 2**: Desarrollar componente específico para el área prioritaria
3. **Fase 3**: Replicar patrón para otras áreas según demanda
4. **Fase 4**: Optimizaciones y features avanzadas

## 📝 Notas

- El componente genérico `AreaPedidosPanel` usa `getAreaConfigByCategoria()` para personalización básica
- Las configuraciones están en `utils/areaPanelConfigs.ts`
- Cada área comparte el **mismo backend** (`ServicioService`, `PedidoService`)
- La diferencia está en la **presentación** y **workflow** específico de cada operación
