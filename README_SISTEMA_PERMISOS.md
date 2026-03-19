# 📖 Sistema de Permisos: Índice de Documentación

> **Última exploración:** 19 de marzo de 2026 | **Estado:** Documentación completa

---

## 🎯 Elige tu ruta según lo que necesites

### 🚀 Tengo 5 minutos (Very Busy)

→ Lee **[REFERENCIA_RAPIDA_PERMISOS.md](REFERENCIA_RAPIDA_PERMISOS.md)**
- 3 pasos para agregar permiso
- API rápida
- Checklist de 10 líneas

---

### ⏱️ Tengo 15 minutos (Normal)

→ Lee **[DIAGRAMAS_SISTEMA_PERMISOS.md](DIAGRAMAS_SISTEMA_PERMISOS.md)**
- 10 diagramas visuales
- Flujos completos
- No requiere entender código

→ Luego lee **[REFERENCIA_RAPIDA_PERMISOS.md](REFERENCIA_RAPIDA_PERMISOS.md)**

---

### 📚 Quiero entender bien (Learning Mode)

**Secuencia recomendada:**

1. **[REFERENCIA_RAPIDA_PERMISOS.md](REFERENCIA_RAPIDA_PERMISOS.md)** (5 min)
   - Conceptos clave
   - API básica

2. **[DIAGRAMAS_SISTEMA_PERMISOS.md](DIAGRAMAS_SISTEMA_PERMISOS.md)** (10 min)
   - Arquitectura visual
   - Flujos de datos

3. **[GUIA_PRACTICA_PERMISOS.md](GUIA_PRACTICA_PERMISOS.md)** (20 min)
   - Paso a paso para implementar
   - Patrones pattern explained
   - Anti-patterns

4. **[ANALISIS_SISTEMA_PERMISOS.md](ANALISIS_SISTEMA_PERMISOS.md)** (30 min)
   - Análisis técnico deep dive
   - Todos los detalles

---

### 💻 Quiero copiar-pegar código (Implementing)

→ Lee **[EJEMPLO_FACTURAS_PERMISOS.md](EJEMPLO_FACTURAS_PERMISOS.md)**
- Código completo y funcional
- Página entera lista para copiar
- Testing checklist incluido

---

### 🔍 Quiero saber EXACTAMENTE cómo funciona

→ Lee **[ANALISIS_SISTEMA_PERMISOS.md](ANALISIS_SISTEMA_PERMISOS.md)**
- Todos los archivos involucrados
- Código fuente real del proyecto
- Explicación línea por línea

---

## 📋 Resumen de Documentos

| Documento | Páginas | Para quién | Tiempo |
|-----------|---------|-----------|--------|
| [REFERENCIA_RAPIDA_PERMISOS.md](REFERENCIA_RAPIDA_PERMISOS.md) | 6 | Developers ocupados | 5 min |
| [DIAGRAMAS_SISTEMA_PERMISOS.md](DIAGRAMAS_SISTEMA_PERMISOS.md) | 15 | Visual learners | 10 min |
| [GUIA_PRACTICA_PERMISOS.md](GUIA_PRACTICA_PERMISOS.md) | 20 | Implementadores | 20 min |
| [EJEMPLO_FACTURAS_PERMISOS.md](EJEMPLO_FACTURAS_PERMISOS.md) | 25 | Copy-paste devs | 30 min |
| [ANALISIS_SISTEMA_PERMISOS.md](ANALISIS_SISTEMA_PERMISOS.md) | 50 | Architects/seniors | 45 min |

---

## 🎓 Contenido por Documento

### REFERENCIA_RAPIDA_PERMISOS.md

**¿Qué contiene?**
- 3 pasos para agregar permiso
- API de usePermissions() completa
- 3 niveles de control (gráfico)
- Anti-patrones
- Archivos clave
- Quick test en consola

**Mejor para:** Agilidad, recordar rápido

---

### DIAGRAMAS_SISTEMA_PERMISOS.md

**¿Qué contiene?**
- Inicio: Flujo autenticación → autorización
- Matriz de permisos visual
- Arquitectura de permisos (diagrama)
- Flujo de componente con permisos
- 3 niveles (capas visuales)
- Ciclo de agregar permiso
- Frontend vs Backend (seguridad)
- Diagrama de datos del usuario
- Flujo completo de una acción
- Checklist rápido

**Mejor para:** Entender la arquitectura, visual learners

---

### GUIA_PRACTICA_PERMISOS.md

**¿Qué contiene?**
- Escenario: manage_tax_rates
- Paso 1: Agregar a matriz
- Paso 2A: Proteger página (hard constraint)
- Paso 2B: Control granular en componentes
- Paso 3: Agregar a navegación
- Paso 4: Botón condicional
- Paso 5: Testing checklist
- Estructura mental: niveles de control
- Verificación rápida
- Anti-patrones
- Checklist de implementación

**Mejor para:** Aprender el proceso paso a paso

---

### EJEMPLO_FACTURAS_PERMISOS.md

**¿Qué contiene?**
- Requisito claro: qué puede hacer cada rol
- Paso 1: Definir en ROLE_PERMISSIONS
- Paso 2: Crear página ADMIN con código completo (250+ líneas)
  - Tabla con filtros
  - Botones condicionales (v-if can())
  - Diálogos de creación/edición
  - Diálogo de estado
  - Manejo de eliminación
- Paso 3: Agregar a navegación
- Paso 4: Página para RECEPCIONISTA (limitado)
- Paso 5: Cliente ve sus propias facturas
- Paso 6: Componentes inteligentes
- Testing checklist (3 tests)
- Resumen de cambios
- Recordatorios de seguridad

**Mejor para:** Implementar ahora, copiar código

---

### ANALISIS_SISTEMA_PERMISOS.md

**¿Qué contiene?**
- Resumen ejecutivo
- 1. Estructura de Usuario (types/auth.ts)
- 2. Matriz de Permisos por Rol
- 3. API completa de usePermissions
- 4A. Auth Middleware
- 4B. Role Middleware
- 4C. Cómo usar en páginas
- 5. Configuraciones de Rol (labels, colores, iconos, rutas)
- 6. Navegación por Rol (useRoleNavigation)
- 7. Auth Store (getters importantes)
- Flujo completo: diagrama ASCII
- 3 patrones actuales de validación
- Cómo agregar nuevas reglas (3 pasos)
- Ejemplos de uso real en el código
- Resumen (tabla de referencias)
- Próximos pasos
- Consideraciones importantes (seguridad, consistencia)

**Mejor para:** Entender cada parte, debugging, arquitectura

---

## 🔗 Referencias Cruzadas

### Si quiero agregar un nuevo permiso:
1. Lee [GUIA_PRACTICA_PERMISOS.md](GUIA_PRACTICA_PERMISOS.md) - Paso 1
2. Ve a [EJEMPLO_FACTURAS_PERMISOS.md](EJEMPLO_FACTURAS_PERMISOS.md) - Para ver cómo se usa
3. Usa [REFERENCIA_RAPIDA_PERMISOS.md](REFERENCIA_RAPIDA_PERMISOS.md) - Para checklist

### Si no funciona un permiso:
1. Lee [DIAGRAMAS_SISTEMA_PERMISOS.md](DIAGRAMAS_SISTEMA_PERMISOS.md) - Diagrama 1 (flujo)
2. Ve a [ANALISIS_SISTEMA_PERMISOS.md](ANALISIS_SISTEMA_PERMISOS.md) - Sección 4B (role middleware)
3. Check [REFERENCIA_RAPIDA_PERMISOS.md](REFERENCIA_RAPIDA_PERMISOS.md) - Quick test

### Si quiero entender la seguridad:
1. Lee [DIAGRAMAS_SISTEMA_PERMISOS.md](DIAGRAMAS_SISTEMA_PERMISOS.md) - Diagrama 7 (Frontend vs Backend)
2. Ve a [ANALISIS_SISTEMA_PERMISOS.md](ANALISIS_SISTEMA_PERMISOS.md) - Última sección

### Si quiero hacer un feature como Facturas:
1. Lee [EJEMPLO_FACTURAS_PERMISOS.md](EJEMPLO_FACTURAS_PERMISOS.md) - Completo
2. Adapta el código
3. Usa [GUIA_PRACTICA_PERMISOS.md](GUIA_PRACTICA_PERMISOS.md) - Para testing

---

## 🎯 Quick Start: Los 3 Archivos Más Importantes

### Para entender:
```
DIAGRAMAS_SISTEMA_PERMISOS.md
    ↓
ANALISIS_SISTEMA_PERMISOS.md
```

### Para implementar:
```
REFERENCIA_RAPIDA_PERMISOS.md
    ↓
GUIA_PRACTICA_PERMISOS.md
    ↓
EJEMPLO_FACTURAS_PERMISOS.md
```

---

## 📍 Ubicación de Archivos

Todos los documentos están en:
```
c:\Users\urria\dashboard\
├── REFERENCIA_RAPIDA_PERMISOS.md
├── DIAGRAMAS_SISTEMA_PERMISOS.md
├── GUIA_PRACTICA_PERMISOS.md
├── EJEMPLO_FACTURAS_PERMISOS.md
└── ANALISIS_SISTEMA_PERMISOS.md  ← Este archivo INDEX
```

Archivos clave del sistema (referenciados):
```
c:\Users\urria\dashboard\
├── composables/
│   ├── usePermissions.ts        ← Matriz de permisos
│   └── useRoleNavigation.ts     ← Navegación por rol
├── middleware/
│   ├── auth.ts                  ← Guard de autenticación
│   └── role.ts                  ← Guard de roles
├── stores/
│   └── auth.ts                  ← Datos del usuario
├── types/
│   └── auth.ts                  ← Enum UserRole
└── utils/
    └── constants.ts             ← Labels, colores, etc.
```

---

## 🎓 Learning Path por Experiencia

### Junior Dev ("Sin experiencia con permisos")
```
1. REFERENCIA_RAPIDA_PERMISOS.md (entiende qué es)
2. DIAGRAMAS_SISTEMA_PERMISOS.md (ve cómo funciona)
3. GUIA_PRACTICA_PERMISOS.md (aprende el proceso)
4. EJEMPLO_FACTURAS_PERMISOS.md (copia código)
Total: 45 min
```

### Mid-Level Dev ("Necesito implementar ahora")
```
1. EJEMPLO_FACTURAS_PERMISOS.md (copia código + adapta)
2. Quick test con REFERENCIA_RAPIDA_PERMISOS.md
Total: 20 min
```

### Senior Dev ("Necesito entender toda la arquitectura")
```
1. ANALISIS_SISTEMA_PERMISOS.md (lees una vez)
2. REFERENCIA_RAPIDA_PERMISOS.md (para futuras referencias)
Total: 45 min
```

---

## 🔧 Próximos Pasos Sugeridos

### Si completaste la exploración:

- [ ] Lee un documento (elige arriba según tu tiempo)
- [ ] Abre los archivos del código listados arriba
- [ ] Intenta agregar un permiso nuevo (ej: `manage_tax_rates`)
- [ ] Testa con 2 roles diferentes
- [ ] Verifica que el backend también valida

---

## 📝 Notas de Implementación

### Cosas que funcionan bien: ✅
- Matriz centralizada en `usePermissions.ts`
- Guards de ruta con `roles: [...]` en `definePageMeta`
- Composables que devuelven computed (lazy evaluation)
- Normalización a minúsculas evita bugs

### Mejoras futuras posibles: 💭
- [ ] Sistema de multi-rol (usuario con múltiples roles)
- [ ] Permisos dinámicos desde backend
- [ ] Dashboard de auditoría de permisos
- [ ] Permisos granulares por dominio (ej: "manage_users_for_hotel_1")

---

## 🆘 Necesitas ayuda?

**Si tu pregunta es sobre...**

| Pregunta | Lee |
|----------|-----|
| "¿Cómo agrego permiso X?" | [GUIA_PRACTICA_PERMISOS.md](GUIA_PRACTICA_PERMISOS.md) - Paso 1-3 |
| "¿Por qué no funciona?" | [DIAGRAMAS_SISTEMA_PERMISOS.md](DIAGRAMAS_SISTEMA_PERMISOS.md) - Diagrama 1 |
| "¿Cómo protejo una página?" | [ANALISIS_SISTEMA_PERMISOS.md](ANALISIS_SISTEMA_PERMISOS.md) - Sección 4C |
| "¿Cuál es el código de X?" | [EJEMPLO_FACTURAS_PERMISOS.md](EJEMPLO_FACTURAS_PERMISOS.md) |
| "¿Necesito validar en backend?" | [DIAGRAMAS_SISTEMA_PERMISOS.md](DIAGRAMAS_SISTEMA_PERMISOS.md) - Diagrama 7 |
| "Rápido, solo dame lo importante" | [REFERENCIA_RAPIDA_PERMISOS.md](REFERENCIA_RAPIDA_PERMISOS.md) |

---

## ✨ Gracias por usar esta documentación

Todos los documentos fueron creados **19 de marzo de 2026** con exploración completa del codebase.

Si encontras errores o tienes sugerencias, actualiza estos archivos.

---

