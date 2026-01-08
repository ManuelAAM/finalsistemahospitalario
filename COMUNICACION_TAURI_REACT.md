# 🔄 Comunicación Tauri-React: Backend y Frontend

## 📋 Índice
1. [Arquitectura de Tauri](#arquitectura-de-tauri)
2. [¿Cómo se Comunican Rust y JavaScript?](#cómo-se-comunican-rust-y-javascript)
3. [Flujo de Datos en el Sistema](#flujo-de-datos-en-el-sistema)
4. [Plugin SQL: Caso Especial](#plugin-sql-caso-especial)
5. [Comandos Personalizados (Si los hubiera)](#comandos-personalizados)
6. [Ejemplos Prácticos del Proyecto](#ejemplos-prácticos-del-proyecto)
7. [Ventajas de esta Arquitectura](#ventajas-de-esta-arquitectura)

---

## 🏗️ Arquitectura de Tauri

### ¿Qué es Tauri?

**Tauri** es un framework que permite crear aplicaciones desktop nativas usando:
- **Backend**: Rust (lenguaje de sistemas, rápido y seguro)
- **Frontend**: Tecnologías web (HTML, CSS, JavaScript/React)

### Diferencia con Electron

| Característica | Tauri | Electron |
|---------------|-------|----------|
| Motor de renderizado | WebView del sistema (nativo) | Chromium embebido |
| Backend | Rust | Node.js |
| Tamaño del ejecutable | ~3-5 MB | ~50-100 MB |
| Consumo de RAM | Bajo (~30-50 MB) | Alto (~100-200 MB) |
| Seguridad | Alta (Rust + permisos granulares) | Media |

### Estructura del Proyecto

```
sistemahospitalario3/
├── src/                    ← FRONTEND (React)
│   ├── App.jsx
│   ├── components/
│   ├── services/
│   └── utils/
│
├── src-tauri/              ← BACKEND (Rust)
│   ├── src/
│   │   ├── main.rs        ← Punto de entrada Rust
│   │   └── lib.rs         ← Comandos personalizados
│   ├── Cargo.toml         ← Dependencias Rust
│   └── tauri.conf.json    ← Configuración Tauri
│
└── index.html             ← Entrada del frontend
```

---

## 🔌 ¿Cómo se Comunican Rust y JavaScript?

### Principio Fundamental: IPC (Inter-Process Communication)

Tauri usa **comunicación entre procesos** para conectar el backend (Rust) con el frontend (WebView/React):

```
┌─────────────────────────────────────────────────────────┐
│                   APLICACIÓN TAURI                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐           ┌──────────────────┐     │
│  │   FRONTEND     │           │     BACKEND      │     │
│  │   (React)      │  ◄─IPC──► │     (Rust)       │     │
│  │                │           │                  │     │
│  │  - UI          │           │  - Sistema       │     │
│  │  - Lógica      │           │  - Archivos      │     │
│  │  - Eventos     │           │  - Base Datos    │     │
│  └────────────────┘           └──────────────────┘     │
│       ▲                              ▲                  │
│       │                              │                  │
│   WebView                        Proceso Nativo        │
│  (Navegador)                      (Ejecutable)         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Mecanismos de Comunicación

#### 1. **JavaScript → Rust** (Invoke)

**Desde el frontend** (React/JS), puedes llamar funciones Rust usando:

```javascript
import { invoke } from '@tauri-apps/api/tauri';

// Llamar comando Rust
const result = await invoke('mi_comando', { 
  parametro1: 'valor',
  parametro2: 123 
});
```

**En el backend** (Rust), defines el comando:

```rust
// src-tauri/src/lib.rs
#[tauri::command]
fn mi_comando(parametro1: String, parametro2: i32) -> String {
    format!("Recibido: {} y {}", parametro1, parametro2)
}

// Registrar en main.rs
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![mi_comando])
        .run(tauri::generate_context!())
        .expect("error al ejecutar aplicación");
}
```

#### 2. **Rust → JavaScript** (Emit)

**Desde el backend** (Rust), puedes enviar eventos al frontend:

```rust
use tauri::Manager;

#[tauri::command]
fn procesar_datos(app_handle: tauri::AppHandle) {
    // Procesar...
    
    // Emitir evento al frontend
    app_handle.emit_all("datos_procesados", 
        serde_json::json!({ "resultado": "OK" })
    ).unwrap();
}
```

**En el frontend** (React), escuchas el evento:

```javascript
import { listen } from '@tauri-apps/api/event';

useEffect(() => {
  const unlisten = listen('datos_procesados', (event) => {
    console.log('Datos recibidos:', event.payload);
  });
  
  return () => { unlisten.then(fn => fn()); };
}, []);
```

#### 3. **Plugins de Tauri** (Caso SQLite)

Los plugins son **módulos Rust precompilados** que exponen APIs JavaScript para funcionalidades específicas.

---

## 🗄️ Flujo de Datos en el Sistema Hospitalario

### Caso 1: Login de Usuario (Sin Plugin SQL)

Si tuviéramos un comando Rust personalizado para autenticación:

```javascript
// Frontend: src/components/LoginForm.jsx
const handleLogin = async (cedula, password) => {
  try {
    // Llamar comando Rust
    const user = await invoke('authenticate_user', {
      license_number: cedula,
      password: password
    });
    
    setCurrentUser(user);
  } catch (error) {
    setError(error);
  }
};
```

```rust
// Backend: src-tauri/src/lib.rs
use rusqlite::{Connection, Result};

#[tauri::command]
fn authenticate_user(license_number: String, password: String) -> Result<User, String> {
    let conn = Connection::open("hospital.db")
        .map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT * FROM users WHERE license_number = ? AND password_hash = ?"
    ).map_err(|e| e.to_string())?;
    
    let user = stmt.query_row(&[&license_number, &hash_password(&password)], |row| {
        Ok(User {
            id: row.get(0)?,
            name: row.get(1)?,
            role: row.get(2)?,
            // ...
        })
    }).map_err(|e| "Credenciales incorrectas".to_string())?;
    
    Ok(user)
}
```

**Flujo**:
```
1. Usuario llena formulario (React)
   ↓
2. handleLogin → invoke('authenticate_user')
   ↓
3. IPC: JS envía JSON { license_number, password } a Rust
   ↓
4. Rust recibe parámetros
   ↓
5. Rust conecta a SQLite
   ↓
6. Rust ejecuta SELECT
   ↓
7. Rust serializa resultado a JSON
   ↓
8. IPC: Rust envía JSON de vuelta a JS
   ↓
9. React recibe objeto User
   ↓
10. Actualiza estado (setCurrentUser)
```

---

## 🔌 Plugin SQL: Caso Especial

### ¿Qué es `tauri-plugin-sql-api`?

En este proyecto, **NO se usan comandos Rust personalizados para la base de datos**. En su lugar, se usa el **plugin oficial de Tauri para SQL**.

#### Instalación del Plugin

En `src-tauri/Cargo.toml`:
```toml
[dependencies]
tauri = { version = "1.5", features = ["shell-open"] }
tauri-plugin-sql = { version = "1.0", features = ["sqlite"] }
```

En `src-tauri/src/main.rs`:
```rust
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

#### Uso desde React

**Toda la comunicación con SQLite se hace desde JavaScript**:

```javascript
// src/services/database.js
import Database from 'tauri-plugin-sql-api';

let db = null;

export async function initDatabase() {
  if (db) return db;
  
  // El plugin maneja la conexión internamente
  db = await Database.load('sqlite:hospital.db');
  return db;
}

export async function addPatient(data) {
  const db = await initDatabase();
  
  // El plugin serializa la query y envía a Rust
  await db.execute(`
    INSERT INTO patients (name, age, curp, room)
    VALUES (?, ?, ?, ?)
  `, [data.name, data.age, data.curp, data.room]);
}

export async function getPatients() {
  const db = await initDatabase();
  
  // El plugin deserializa la respuesta de Rust
  const result = await db.select('SELECT * FROM patients');
  return result;
}
```

### ¿Cómo Funciona Internamente el Plugin?

```
Frontend (JavaScript)                Plugin (Rust)
─────────────────────────────────────────────────────────

db.execute(query, params)
    │
    ├─ Serializa query + params a JSON
    │
    └─► invoke('plugin:sql|execute', data)
                                    │
                                    ├─ Deserializa JSON
                                    │
                                    ├─ Conecta a SQLite
                                    │
                                    ├─ Ejecuta query
                                    │
                                    ├─ Serializa resultado
                                    │
                                    └─► Retorna JSON
    ◄────────────────────────────────┘
    │
    └─ Deserializa respuesta
```

**Ventajas**:
- ✅ No necesitas escribir código Rust manualmente
- ✅ API JavaScript simple y directa
- ✅ Rust maneja la conexión SQLite de forma segura
- ✅ Transacciones, prepared statements, etc. manejados internamente

**Desventajas**:
- ❌ Menos control sobre la implementación
- ❌ Dependes del plugin para actualizaciones
- ❌ Overhead de serialización JSON en cada query

---

## 🛠️ Comandos Personalizados (Si los hubiera)

Aunque en este proyecto **no se usan**, aquí está cómo se implementarían:

### Ejemplo: Comando de Hash de Contraseñas

#### Backend (Rust)

```rust
// src-tauri/src/lib.rs
use argon2::{self, Config};
use rand::Rng;

#[tauri::command]
fn hash_password(password: String) -> Result<String, String> {
    let salt: [u8; 32] = rand::thread_rng().gen();
    let config = Config::default();
    
    argon2::hash_encoded(password.as_bytes(), &salt, &config)
        .map_err(|e| format!("Error hasheando: {}", e))
}

#[tauri::command]
fn verify_password(password: String, hash: String) -> Result<bool, String> {
    argon2::verify_encoded(&hash, password.as_bytes())
        .map_err(|e| format!("Error verificando: {}", e))
}

// Registrar comandos en main.rs
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            hash_password,
            verify_password
        ])
        .run(tauri::generate_context!())
        .expect("error running tauri application");
}
```

#### Frontend (React)

```javascript
// src/services/auth.js
import { invoke } from '@tauri-apps/api/tauri';

export async function authenticateUser(cedula, password) {
  // 1. Buscar usuario en BD (con plugin SQL)
  const db = await initDatabase();
  const users = await db.select(
    'SELECT * FROM users WHERE license_number = ?',
    [cedula]
  );
  
  if (users.length === 0) {
    throw new Error('Usuario no encontrado');
  }
  
  const user = users[0];
  
  // 2. Verificar contraseña (comando Rust)
  const isValid = await invoke('verify_password', {
    password: password,
    hash: user.password_hash
  });
  
  if (!isValid) {
    throw new Error('Contraseña incorrecta');
  }
  
  return user;
}
```

**Flujo combinado**:
```
1. React llama authenticateUser()
   ↓
2. JavaScript → Plugin SQL: SELECT usuario
   ↓
3. Rust (plugin) → SQLite → Resultado
   ↓
4. JavaScript recibe hash de contraseña
   ↓
5. JavaScript → Comando Rust: verify_password
   ↓
6. Rust verifica con Argon2
   ↓
7. Rust retorna true/false
   ↓
8. JavaScript decide si autenticar
```

---

## 📝 Ejemplos Prácticos del Proyecto

### Ejemplo 1: Inicialización de la Base de Datos

**Archivo**: `src/services/database.js`

```javascript
import Database from 'tauri-plugin-sql-api';

let db = null;

export async function initDatabase() {
  if (db) return db;
  
  try {
    console.log('🔌 Initializing SQLite database...');
    
    // ⚡ AQUÍ OCURRE LA COMUNICACIÓN TAURI
    // JavaScript → Plugin Rust → SQLite
    db = await Database.load('sqlite:hospital.db');
    
    console.log('✅ Database loaded successfully');
    
    // Crear tablas
    await createTables();
    await seedInitialData();
    
    return db;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw new Error(`Database initialization failed: ${error.message}`);
  }
}

async function createTables() {
  // ⚡ Otra llamada: JavaScript → Plugin Rust
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL
    )
  `);
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      curp TEXT UNIQUE NOT NULL,
      room TEXT
    )
  `);
  
  // ... más tablas
}
```

**¿Qué pasa internamente?**

1. **`Database.load('sqlite:hospital.db')`**:
   ```
   JavaScript                Plugin Rust
   ─────────────────────────────────────
   await Database.load()
       │
       └─► invoke('plugin:sql|load', { 
             db: 'sqlite:hospital.db' 
           })
                           │
                           ├─ Rust recibe parámetro
                           │
                           ├─ rusqlite::Connection::open()
                           │
                           ├─ Guarda referencia interna
                           │
                           └─► Retorna connection_id
       ◄─────────────────────┘
       │
       └─ JavaScript guarda ID
   ```

2. **`db.execute(sql, params)`**:
   ```
   JavaScript                Plugin Rust
   ─────────────────────────────────────
   await db.execute(...)
       │
       └─► invoke('plugin:sql|execute', {
             db_id: 123,
             sql: "CREATE TABLE...",
             params: []
           })
                           │
                           ├─ Recupera Connection por ID
                           │
                           ├─ conn.execute(sql, params)
                           │
                           ├─ Maneja errores SQLite
                           │
                           └─► Retorna { rows_affected: 0 }
       ◄─────────────────────┘
       │
       └─ Promise resuelto
   ```

### Ejemplo 2: Agregar un Paciente

**Archivo**: `src/services/database.js`

```javascript
export async function addPatient(patient) {
  const db = await initDatabase();
  
  // ⚡ COMUNICACIÓN TAURI: INSERT
  await db.execute(`
    INSERT INTO patients (
      name, age, curp, room, condition, 
      triage_level, blood_type, allergies, diagnosis
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    patient.name,
    patient.age,
    patient.curp,
    patient.room,
    patient.condition,
    patient.triage_level,
    patient.blood_type,
    patient.allergies,
    patient.diagnosis
  ]);
  
  console.log('✅ Patient added successfully');
}
```

**Flujo completo**:
```
Usuario → PatientRegistrationForm
            ↓
         handleSubmit()
            ↓
         addPatient(data)
            ↓
         db.execute(INSERT...)
            ↓
    ┌──────────────────┐
    │  FRONTEND (JS)   │
    └────────┬─────────┘
             │ IPC
             ▼
    ┌──────────────────┐
    │  PLUGIN RUST     │
    ├──────────────────┤
    │ 1. Deserializar  │
    │ 2. Validar SQL   │
    │ 3. Bind params   │
    │ 4. Execute       │
    │ 5. Serializar    │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  SQLite Engine   │
    │  (Archivo .db)   │
    └──────────────────┘
```

### Ejemplo 3: Obtener Pacientes (SELECT)

**Archivo**: `src/hooks/useDatabase.js`

```javascript
import { useState, useEffect } from 'react';
import { getDb } from '../services/database';

export function usePatients(options = {}) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchPatients() {
      try {
        const db = getDb();
        
        // ⚡ COMUNICACIÓN TAURI: SELECT
        let query = 'SELECT * FROM patients WHERE 1=1';
        const params = [];
        
        // Filtrar por enfermero
        if (options.nurseId && options.role === 'nurse') {
          query += ' AND assigned_nurse_id = ?';
          params.push(options.nurseId);
        }
        
        // ⚡ Plugin ejecuta query y retorna array de objetos
        const result = await db.select(query, params);
        
        setPatients(result);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setLoading(false);
      }
    }
    
    fetchPatients();
  }, [options.nurseId, options.role]);
  
  return { patients, loading };
}
```

**¿Qué retorna el plugin?**

El plugin Rust convierte las filas SQLite a objetos JavaScript:

```javascript
// Resultado del SELECT
[
  {
    id: 1,
    name: "Juan Pérez",
    age: 45,
    curp: "PEXJ791015HDFRXN01",
    room: "301-A",
    condition: "Estable",
    triage_level: "VERDE",
    blood_type: "O+",
    allergies: "Penicilina",
    diagnosis: "Neumonía"
  },
  {
    id: 2,
    name: "María González",
    // ...
  }
]
```

---

## 🔐 Configuración de Permisos

### `tauri.conf.json`

Este archivo define qué puede hacer el frontend:

```json
{
  "tauri": {
    "allowlist": {
      "all": false,  // ❌ Deshabilitar todo por defecto
      
      "shell": {
        "all": false,
        "open": true  // ✅ Permitir abrir URLs externas
      },
      
      "fs": {
        "all": false,  // ❌ Sin acceso al sistema de archivos
        "scope": []    //     (El plugin SQL maneja el .db)
      },
      
      "http": {
        "all": false,
        "scope": []    // ❌ Sin llamadas HTTP externas
      }
    },
    
    "plugins": {
      "sql": {
        "enabled": true  // ✅ Plugin SQL habilitado
      }
    }
  }
}
```

**Principio de Mínimo Privilegio**:
- El frontend solo puede usar lo que Tauri permite explícitamente
- El plugin SQL tiene permisos controlados
- Rust maneja operaciones sensibles (archivos, red, sistema)

---

## ⚡ Ventajas de esta Arquitectura

### 1. **Seguridad**

**Problema con Electron**:
```javascript
// Electron: JavaScript puede acceder directamente al sistema
const fs = require('fs');
fs.unlinkSync('/etc/passwd');  // 💀 Posible
```

**Solución con Tauri**:
```javascript
// Tauri: JavaScript solo puede llamar comandos permitidos
import { invoke } from '@tauri-apps/api/tauri';

await invoke('delete_file', { path: '/etc/passwd' });
// ❌ Error: Comando no registrado o sin permisos
```

### 2. **Rendimiento**

| Operación | Electron (Node.js) | Tauri (Rust) |
|-----------|-------------------|--------------|
| Leer 10,000 registros | ~150ms | ~20ms |
| Ejecutar query compleja | ~80ms | ~10ms |
| Consumo de RAM (idle) | 150 MB | 40 MB |
| Tamaño ejecutable | 80 MB | 4 MB |

### 3. **Tipado Seguro**

**Rust garantiza tipos en compile-time**:

```rust
#[tauri::command]
fn add_patient(name: String, age: i32) -> Result<(), String> {
    if age < 0 || age > 120 {
        return Err("Edad inválida".to_string());
    }
    // ...
}
```

Si JavaScript envía:
```javascript
await invoke('add_patient', { name: 123, age: "texto" });
```

Tauri detecta el error **antes de ejecutar** y retorna:
```
Error: tipo incorrecto para 'name': esperado String, recibido Number
```

### 4. **Concurrencia sin Bloqueos**

**Rust maneja múltiples operaciones simultáneas sin bloquear la UI**:

```rust
#[tauri::command]
async fn process_large_dataset() -> String {
    // Procesamiento pesado en thread separado
    tokio::spawn(async {
        // Operación que toma 10 segundos
    }).await.unwrap();
    
    "Procesado completado".to_string()
}
```

El frontend permanece responsivo mientras Rust trabaja.

---

## 📊 Comparativa: Con y Sin Plugin

### Opción A: Usando Plugin SQL (Actual)

**Ventajas**:
- ✅ Configuración mínima
- ✅ API JavaScript simple
- ✅ No necesitas saber Rust
- ✅ Actualizaciones automáticas del plugin

**Desventajas**:
- ❌ Overhead de serialización JSON
- ❌ Menos control sobre conexiones
- ❌ No puedes optimizar queries en Rust

**Código**:
```javascript
// Frontend
const patients = await db.select('SELECT * FROM patients');
```

### Opción B: Comandos Rust Personalizados

**Ventajas**:
- ✅ Control total sobre implementación
- ✅ Optimizaciones personalizadas
- ✅ Menos overhead (sin JSON intermedio)
- ✅ Validaciones en Rust antes de tocar BD

**Desventajas**:
- ❌ Requiere conocer Rust
- ❌ Más código para escribir y mantener
- ❌ Debugging más complejo

**Código**:
```rust
// Backend
#[tauri::command]
fn get_patients() -> Vec<Patient> {
    let conn = Connection::open("hospital.db").unwrap();
    let mut stmt = conn.prepare("SELECT * FROM patients").unwrap();
    
    stmt.query_map([], |row| {
        Ok(Patient {
            id: row.get(0)?,
            name: row.get(1)?,
            // ...
        })
    }).unwrap().collect()
}
```

```javascript
// Frontend
const patients = await invoke('get_patients');
```

---

## 🔍 Debugging de la Comunicación

### 1. **Logs del Frontend**

En `src/services/database.js`:
```javascript
export async function addPatient(patient) {
  console.log('📤 Enviando a Rust:', patient);
  
  const result = await db.execute(INSERT_QUERY, params);
  
  console.log('📥 Respuesta de Rust:', result);
  return result;
}
```

### 2. **Logs del Backend**

En `src-tauri/src/main.rs`:
```rust
fn main() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:hospital.db", vec![
                    // Migrations
                ])
                .build()
        )
        .setup(|app| {
            println!("🚀 Tauri backend iniciado");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error running tauri application");
}
```

### 3. **Herramientas de Desarrollo**

**DevTools del WebView**:
```javascript
// Abrir DevTools en desarrollo
if (import.meta.env.DEV) {
  window.__TAURI__.invoke('open_devtools');
}
```

**Logs de Rust en consola**:
```bash
npm run tauri dev

# Output:
# 🚀 Tauri backend iniciado
# 🔌 Initializing SQLite database...
# ✅ Database loaded successfully
```

---

## 📝 Resumen Ejecutivo

### Flujo de Comunicación en Este Proyecto

```
┌─────────────────────────────────────────────────────┐
│                APLICACIÓN DESKTOP                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  FRONTEND (React)                                   │
│  ├── LoginForm.jsx                                  │
│  ├── App.jsx                                        │
│  └── database.js ──────────┐                        │
│       ↓                     │                        │
│  Database.load()            │ IPC (JSON)            │
│  db.execute()               │                        │
│  db.select()                │                        │
│       ↓                     │                        │
│  ════════════════════════════════════               │
│       ↓                     ↓                        │
│  BACKEND (Rust)                                     │
│  ├── tauri-plugin-sql                               │
│  │   ├── Deserializa JSON                           │
│  │   ├── Valida queries                             │
│  │   └── Ejecuta SQLite                             │
│  └── SQLite Engine                                  │
│      └── hospital.db ──► Disco                      │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### En Una Frase

> **"React hace las queries en JavaScript, el plugin Rust las ejecuta en SQLite de forma segura, y los resultados vuelven automáticamente como objetos JavaScript."**

### Tecnologías Clave

1. **Tauri IPC**: Serialización automática JS ↔ Rust
2. **tauri-plugin-sql-api**: API SQL expuesta a JavaScript
3. **rusqlite**: Librería Rust que habla con SQLite
4. **WebView**: Navegador embebido que ejecuta React

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [Tauri IPC](https://tauri.app/v1/guides/features/command/)
- [Plugin SQL](https://github.com/tauri-apps/tauri-plugin-sql)
- [Rust SQLite](https://docs.rs/rusqlite/)

### Archivos Relevantes del Proyecto
- `src-tauri/Cargo.toml` → Dependencias Rust
- `src-tauri/tauri.conf.json` → Configuración permisos
- `src-tauri/src/main.rs` → Punto de entrada Rust
- `src/services/database.js` → Cliente JavaScript del plugin

---

**Fecha**: 7 de enero de 2026
**Autor**: Documentación técnica del sistema hospitalario
**Versión**: 1.0
