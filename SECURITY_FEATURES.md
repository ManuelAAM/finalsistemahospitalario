# Características de Seguridad - Sistema de Gestión Hospitalaria

**Versión:** 2.5.1 - Fase 1 (Seguridad)  
**Fecha:** 2025-01-25  
**Cumplimiento:** NOM-004-SSA3-2012 + Módulos 1-7 Manual de Usuario

---

## 📋 Resumen Ejecutivo

Se han implementado tres características críticas de seguridad para cumplir con los requisitos del manual de usuario:

1. **Bloqueo de Cuenta por Intentos Fallidos** - Previene ataques de fuerza bruta
2. **Sistema de Reporte de Errores** - Permite a usuarios reportar problemas
3. **Centro de Errores para Administradores** - Gestiona y resuelve errores reportados

---

## 🔐 1. Bloqueo de Cuenta por Intentos Fallidos

### Descripción
Después de **3 intentos fallidos de login** en un periodo de **24 horas**, la cuenta se bloquea automáticamente. El usuario recibe una **contraseña temporal** válida por 24 horas para recuperar acceso.

### Flujo de Usuario

```
Usuario intenta login con credenciales incorrectas
    ↓
Sistema registra intento fallido
    ↓
¿Es el 3er intento en 24h?
    ├─ NO → Permitir reintentar
    └─ SÍ → Bloquear cuenta y generar contraseña temporal
            ↓
            Mostrar modal con contraseña temporal
            ↓
            Usuario usa contraseña temporal para acceder
            ↓
            REQUERIDO: Cambiar contraseña en próxima sesión
```

### Componentes Involucrados

**LoginForm.jsx**
```jsx
// Verifica si cuenta está bloqueada
const lockoutRecord = await isAccountLocked(cedula);
if (lockoutRecord) {
  setLockedAccount(lockoutRecord);
  // Muestra modal con contraseña temporal
  return;
}

// Registra intento de login (exitoso o fallido)
await recordLoginAttempt(cedula, success, 'web-app');
```

**Base de Datos (database.js)**

Nuevas funciones:
- `recordLoginAttempt(username, success, ipAddress)` - Registra intento y auto-bloquea al 3er fallo
- `isAccountLocked(username)` - Verifica si cuenta está bloqueada
- `lockAccount(username)` - Genera contraseña temporal (8 caracteres)
- `unlockAccount(username)` - Desbloquea cuenta manualmente

Nuevas tablas:
- `login_attempts` - Historial de intentos (username, success, ip_address, created_at)
- `account_lockouts` - Cuentas bloqueadas (username, locked_until, temporary_password)

### Modal de Cuenta Bloqueada

Cuando un usuario intenta acceder con una cuenta bloqueada:

```
┌─────────────────────────────────────┐
│  🔒 Cuenta Bloqueada              │
│                                     │
│  Su cuenta ha sido bloqueada por    │
│  múltiples intentos fallidos.       │
│  Use la contraseña temporal.        │
│                                     │
│  ┌─ Contraseña Temporal ──────┐   │
│  │ [TEMP-A1B2C3D4] [📋 Copiar]│   │
│  └────────────────────────────┘   │
│                                     │
│  ⏱️ Válida por 24 horas            │
│  Se requiere cambio al acceder     │
│                                     │
│  [Entendido - Intentar Acceso]     │
└─────────────────────────────────────┘
```

### Pasos para Recuperar Acceso

1. **Intenta login** con tu cédula profesional
2. **Ves el modal** con tu contraseña temporal
3. **Copia la contraseña** (botón copiar disponible)
4. **Usa esa contraseña** en el campo de contraseña
5. **Accedes al sistema** - Se abre la bitácora de cambio de contraseña
6. **Cambias tu contraseña** a una nueva segura
7. **Acceso restaurado** con nueva contraseña

---

## 🚨 2. Sistema de Reporte de Errores

### Descripción
Todo usuario puede reportar errores que encuentre en el sistema. Los reportes se registran en la base de datos para que el equipo técnico los revise y resuelva.

### Acceso

**Botón Flotante Rojo** (esquina inferior derecha)
- Visible para todos los usuarios
- Siempre accesible sin cerrar sesión
- Muestra tooltip: "Reportar Error"

### Formulario de Reporte

```
┌──────────────────────────────────────┐
│ 🚨 Reportar Error                   │
│ Ayúdanos a mejorar reportando...     │
│                                      │
│ Tipo de Error (Requerido)            │
│ ├ Aplicación (defecto)               │
│ ├ Base de Datos                      │
│ ├ Rendimiento                        │
│ └ Otro                               │
│                                      │
│ Módulo Afectado                      │
│ [Ej: Signos Vitales, Medicamentos]  │
│                                      │
│ Severidad                            │
│ ○ Baja  ○ Media  ○ Alta  ○ Crítica |
│                                      │
│ Descripción del Problema (Req.)      │
│ [Describe detalladamente qué pasó]  │
│                                      │
│ Pasos para Reproducir (Opcional)     │
│ [1. Abre...]                         │
│ [2. Haz clic...]                     │
│ [3. Observa...]                      │
│                                      │
│ [Cancelar] [📤 Enviar Reporte]      │
└──────────────────────────────────────┘
```

### Campos del Reporte

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| **Tipo** | Selector | Sí | Categoría del error (aplicación, BD, rendimiento, otro) |
| **Módulo** | Texto | No | Qué parte del sistema afecta (Ej: "Signos Vitales") |
| **Severidad** | Radio | Sí | Impacto (Baja/Media/Alta/Crítica) |
| **Descripción** | Textarea | Sí | Explicación detallada del problema |
| **Pasos** | Textarea | No | Cómo reproducir el error paso a paso |

### Componente ErrorReporter.jsx

```jsx
// Se incluye en NurseDashboard
<ErrorReporter userId={user.id} userName={user.name} />

// Registro en BD
await reportError({
  code: `ERROR-${Date.now()}`,          // ID único
  message: formData.description,         // Descripción
  type: formData.type,                   // aplicación/database/performance/other
  severity: formData.severity,           // low/medium/high/critical
  module: formData.module || 'General',  // Módulo afectado
  userId: userId,                        // ID de quien reporta
  userName: userName,                    // Nombre de quien reporta
  ipAddress: 'web-app',                  // Origen
  stackTrace: formData.stepsToReproduce, // Pasos para reproducir
});
```

### Base de Datos

**Nueva tabla: `system_errors`**

```sql
CREATE TABLE IF NOT EXISTS system_errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,  -- application, database, performance, other
  severity TEXT NOT NULL, -- low, medium, high, critical
  module TEXT,
  status TEXT DEFAULT 'Abierto',  -- Abierto, En Progreso, Resuelto
  user_id INTEGER,
  user_name TEXT,
  ip_address TEXT,
  stack_trace TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_by TEXT,
  resolution_notes TEXT,
  resolved_at DATETIME
);
```

**Funciones en database.js:**

- `reportError(errorData)` - Inserta nuevo error
- `getSystemErrors(filters)` - Obtiene errores con filtros
- `updateErrorStatus(errorId, status, resolvedBy, notes)` - Actualiza estado

---

## 👨‍💼 3. Centro de Errores (Solo Administradores)

### Acceso

**Solo para usuarios con rol `admin`**
- Opción en sidebar: "Centro de Errores"
- Color distintivo: Rojo
- Ubicado en sección "Sistema"

### Interfaz Principal

```
┌────────────────────────────────────────────────────┐
│ 📊 Centro de Errores                              │
│ Monitoreo y gestión de errores del sistema        │
│                                [🔄 Actualizar]    │
│                                                    │
│ FILTROS:                                          │
│ Estado: [Todos ▼]  Severidad: [Todas ▼]         │
│ Módulo: [Filtrar...]          [Restablecer]      │
│                                                    │
│ LISTA DE ERRORES:                                 │
│                                                    │
│ ┌──────────────────────────────────────────────┐  │
│ │ 🔴 CRÍTICA │ Signos Vitales                │  │
│ │                                              │  │
│ │ Error al guardar signos vitales             │  │
│ │ Reportado por: María López • 25/01/2025     │  │
│ │                                  [Abierto] │  │
│ │                                              │  │
│ │ [Expandir para más detalles...]             │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ ┌──────────────────────────────────────────────┐  │
│ │ 🟠 ALTA    │ Medicamentos                   │  │
│ │                                              │  │
│ │ Timeout al cargar kardex                    │  │
│ │ Reportado por: Juan Pérez • 25/01/2025      │  │
│ │                                [En Progreso] │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ ✅ No hay errores que mostrar                    │
└────────────────────────────────────────────────────┘
```

### Filtros Disponibles

- **Estado:** Todos / Abierto / En Progreso / Resuelto
- **Severidad:** Todas / Baja / Media / Alta / Crítica
- **Módulo:** Buscar por nombre (ej: "Signos")

### Detalles Expandidos de Error

Al hacer clic en un error, se expande para mostrar:

```
┌──────────────────────────────────────────────────┐
│ [Contraer detalles]                              │
│                                                  │
│ DETALLES TÉCNICOS:                              │
│ ┌────────────────────────────────────────────┐  │
│ │ Pasos para reproducir:                     │  │
│ │ 1. Abre el módulo de Signos Vitales       │  │
│ │ 2. Ingresa FC: 80, TA: 120/80, etc...    │  │
│ │ 3. Haz clic en "Guardar"                  │  │
│ │ 4. Aparece error en consola               │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ CAMBIAR ESTADO:                                 │
│ [Abierto] [En Progreso] [Resuelto]             │
│                                                  │
│ [Textarea para notas...]                        │
│ Si vas a marcar como resuelto...               │
│                                                  │
│ [Marcar como Resuelto]                         │
│                                                  │
│ ✅ RESUELTO POR: Admin User                     │
│    NOTAS: "Se actualizó la conexión BD"        │
└──────────────────────────────────────────────────┘
```

### Gestión de Errores

**Estados permitidos:**

| Estado | Descripción | Quién | Notas |
|--------|-------------|-------|-------|
| **Abierto** | Reportado, sin atención | Usuarios | Inicial al reportar |
| **En Progreso** | Siendo investigado/resuelto | Admin | Muestra actividad |
| **Resuelto** | Solucionado y verificado | Admin | Requiere notas |

**Workflow típico:**

```
1. Usuario reporta error
   Estado: Abierto
   
2. Admin lo ve en Centro de Errores
   Hace clic, revisa detalles
   Cambia a "En Progreso"
   
3. Admin investiga y resuelve
   Actualiza estado a "Resuelto"
   Ingresa notas: "Se actualizó la librería X"
   
4. Sistema registra:
   - resolved_by: "Admin User"
   - resolution_notes: "Se actualizó..."
   - resolved_at: "2025-01-25 14:30:00"
```

---

## 📊 Base de Datos - Tablas Nuevas

### login_attempts

```sql
CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  success INTEGER NOT NULL,  -- 1 = éxito, 0 = fallo
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Datos de ejemplo:**
```
id | username     | success | ip_address | created_at
1  | ENF-12345    | 1       | 192.168.1.1 | 2025-01-25 09:00:00
2  | ENF-12345    | 0       | 192.168.1.1 | 2025-01-25 09:05:00
3  | ENF-12345    | 0       | 192.168.1.1 | 2025-01-25 09:10:00
4  | ENF-12345    | 0       | 192.168.1.1 | 2025-01-25 09:15:00  ← 3er fallo
```

### account_lockouts

```sql
CREATE TABLE IF NOT EXISTS account_lockouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  locked_until DATETIME NOT NULL,
  temporary_password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Datos de ejemplo:**
```
id | username  | locked_until            | temporary_password | created_at
1  | ENF-12345 | 2025-01-26 09:15:00    | AB12CD34           | 2025-01-25 09:15:00
```

### system_errors

```sql
CREATE TABLE IF NOT EXISTS system_errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  module TEXT,
  status TEXT DEFAULT 'Abierto',
  user_id INTEGER,
  user_name TEXT,
  ip_address TEXT,
  stack_trace TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_by TEXT,
  resolution_notes TEXT,
  resolved_at DATETIME
);
```

**Datos de ejemplo:**
```
id | code          | message                  | severity | module     | status      | user_name     | created_at
1  | ERROR-17371.. | Error al guardar vitales | critical | Signos V.. | Abierto     | María López   | 2025-01-25...
2  | ERROR-17372.. | Timeout en kardex        | high     | Medicam... | En Progreso | Juan Pérez    | 2025-01-25...
```

---

## 🔌 Funciones Nuevas en database.js

### Login Tracking

```javascript
// Registra intento de login (automáticamente bloquea al 3er fallo)
await recordLoginAttempt(username, success, ipAddress);
// Retorna: undefined (pero puede lanzar excepción si bloquea)

// Verifica si cuenta está bloqueada
const lockout = await isAccountLocked(username);
// Retorna: { username, locked_until, temporary_password } o null

// Bloquea una cuenta y genera contraseña temporal
const { temporary_password } = await lockAccount(username);
// Retorna: { temporary_password, locked_until }

// Desbloquea una cuenta (uso administrativo)
await unlockAccount(username);
// Retorna: undefined

// Obtiene últimos 10 intentos
const attempts = await getLoginAttempts(username);
// Retorna: Array de intentos
```

### Error Reporting

```javascript
// Reporta un error
await reportError({
  code: 'ERROR-123456',
  message: 'Descripción del error',
  type: 'application',        // application, database, performance, other
  severity: 'high',           // low, medium, high, critical
  module: 'Signos Vitales',
  userId: 1,
  userName: 'María López',
  ipAddress: 'web-app',
  stackTrace: 'Pasos para reproducir...'
});
// Retorna: { id, code, message, ... }

// Obtiene errores con filtros
const errors = await getSystemErrors({
  status: 'Abierto',           // Opcional
  severity: 'high',            // Opcional
  module: 'Signos'             // Opcional (búsqueda parcial)
});
// Retorna: Array de errores ordenados por fecha DESC

// Actualiza estado de error
await updateErrorStatus(errorId, status, resolvedBy, notes);
// Retorna: undefined
```

---

## 🧪 Pruebas

### Test 1: Bloqueo de Cuenta por Intentos Fallidos

**Pasos:**
1. Abre login form
2. Ingresa cédula valida (Ej: ENF-12345)
3. Ingresa contraseña incorrecta
4. Repite pasos 2-3 dos veces más (total 3 intentos)
5. En el 3er intento, verás el modal "Cuenta Bloqueada"

**Resultado esperado:**
```
✅ Modal muestra contraseña temporal
✅ Botón copiar funciona
✅ Se puede usar contraseña temporal para acceder
```

### Test 2: Reporte de Error

**Pasos:**
1. Accede al dashboard
2. Haz clic en botón rojo flotante (esquina inferior derecha)
3. Completa el formulario:
   - Tipo: "Aplicación"
   - Módulo: "Test"
   - Severidad: "Media"
   - Descripción: "Este es un test"
4. Haz clic en "Enviar Reporte"

**Resultado esperado:**
```
✅ Modal muestra "¡Gracias por reportar!"
✅ Error aparece en Centro de Errores (si eres admin)
```

### Test 3: Centro de Errores (Admin)

**Pasos:**
1. Accede como usuario administrador
2. En sidebar, haz clic en "Centro de Errores"
3. Verás lista de errores reportados
4. Haz clic en uno para expandir detalles
5. Cambia estado a "En Progreso"
6. Cambia estado a "Resuelto" con notas
7. Usa filtros para buscar por módulo

**Resultado esperado:**
```
✅ Lista muestra todos los errores
✅ Detalles se expanden/contraen
✅ Estado se actualiza en tiempo real
✅ Filtros funcionan correctamente
✅ Se registra "resuelto por" y notas
```

---

## 📝 Integración Técnica

### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| **src/services/database.js** | +5 tablas, +10 funciones |
| **src/components/LoginForm.jsx** | Integración de recordLoginAttempt, isAccountLocked, modal |
| **src/components/ErrorReporter.jsx** | Nuevo componente (botón flotante + modal) |
| **src/components/ErrorDashboard.jsx** | Nuevo componente (panel de administración) |
| **src/App.jsx** | Imports + botón sidebar para admin |

### Sin Breaking Changes

✅ Todas las funciones existentes mantienen su firma  
✅ Las nuevas tablas no interfieren con existentes  
✅ Los componentes nuevos son independientes  
✅ LoginForm sigue funcionando igual para cuentas no bloqueadas

---

## 🚀 Próximos Pasos (Fase 2-3)

- [ ] Módulo de Seguimientos (Follow-ups)
- [ ] Módulo de Recetas (Prescriptions)
- [ ] Análisis de Laboratorio con Evolución
- [ ] Historial de últimos 3 estudios
- [ ] Gráficas comparativas
- [ ] Reportes avanzados por módulo

---

## 📞 Soporte

Para preguntas o problemas:
1. Reporta el error usando el botón rojo flotante
2. Admins revisarán en Centro de Errores
3. Se actualizará el estado con resolución

**Contacto Técnico:** IT @ Hospital San Rafael

