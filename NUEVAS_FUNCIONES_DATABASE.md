# 📚 Nuevas Funciones de Base de Datos

## Archivo: src/services/database.js

Se han agregado las siguientes funciones para soportar los nuevos componentes y características.

---

## 🔍 Funciones de Lectura (Getters)

### Usuarios
```javascript
getAllUsers()
// Retorna: Array<User>
// Descripción: Obtiene todos los usuarios del sistema

getUsersByRole(role)
// Parámetro: role (string) - 'admin', 'nurse', 'doctor', 'patient'
// Retorna: Array<User>
// Descripción: Obtiene usuarios por rol específico
```

### Pacientes
```javascript
getAllPatients()
// Retorna: Array<Patient>
// Descripción: Obtiene todos los pacientes

getVitalSignsByPatientId(patientId)
// Parámetro: patientId (number)
// Retorna: Array<VitalSigns>
// Descripción: Obtiene signos vitales ordenados por fecha DESC
```

### Citas
```javascript
getAllAppointments()
// Retorna: Array<Appointment>
// Descripción: Obtiene todas las citas ordenadas por fecha DESC
```

### Salas
```javascript
getAllRooms()
// Retorna: Array<Room>
// Descripción: Obtiene todas las salas ordenadas por room_number
```

### Prescripciones/Medicamentos
```javascript
getAllPrescriptions()
// Retorna: Array<Prescription>
// Descripción: Obtiene todas las prescripciones

getPrescriptionsByPatientId(patientId)
// Parámetro: patientId (number)
// Retorna: Array<Prescription>
// Descripción: Obtiene prescripciones de un paciente ordenadas por fecha DESC

getActivePrescriptions()
// Retorna: Array<Prescription>
// Descripción: Obtiene prescripciones con status = 'Active'
```

### Signos Vitales
```javascript
getAllVitalSigns()
// Retorna: Array<VitalSigns>
// Descripción: Obtiene todos los signos vitales del sistema

getVitalSignsByPatientId(patientId)
// Parámetro: patientId (number)
// Retorna: Array<VitalSigns>
// Descripción: Obtiene signos vitales de un paciente
```

### Historial Médico
```javascript
getMedicalHistoryByPatientId(patientId)
// Parámetro: patientId (number)
// Retorna: Array<MedicalHistory>
// Descripción: Obtiene historial médico de un paciente ordenado por fecha DESC
```

### Pruebas de Laboratorio
```javascript
getLabTestsByPatientId(patientId)
// Parámetro: patientId (number)
// Retorna: Array<LabTest>
// Descripción: Obtiene pruebas de laboratorio de un paciente
```

### Notificaciones
```javascript
getAllNotifications(userId = null)
// Parámetro: userId (number, opcional)
// Retorna: Array<Notification>
// Descripción: Obtiene notificaciones globales o de un usuario

getUnreadNotifications(userId)
// Parámetro: userId (number)
// Retorna: Array<Notification>
// Descripción: Obtiene notificaciones no leídas de un usuario
```

### Traslados (NUEVAS)
```javascript
getTransfersByPatientId(patientId)
// Parámetro: patientId (number)
// Retorna: Array<PatientTransfer>
// Descripción: Obtiene historial de traslados de un paciente ordenados por fecha DESC
// Estructura de respuesta:
// {
//   id: number,
//   patient_id: number,
//   from_floor: string,
//   from_area: string,
//   from_room: string,
//   from_bed: string,
//   to_floor: string,
//   to_area: string,
//   to_room: string,
//   to_bed: string,
//   transfer_date: string (YYYY-MM-DD),
//   transfer_time: string (HH:MM),
//   reason: string,
//   transferred_by: string,
//   notes: string,
//   created_at: string
// }

getAllTransfers()
// Retorna: Array<PatientTransfer>
// Descripción: Obtiene todos los traslados del sistema
```

### Turnos/Shifts (NUEVAS)
```javascript
getShiftsByUserId(userId)
// Parámetro: userId (number)
// Retorna: Array<Shift>
// Descripción: Obtiene turnos de un usuario (enfermero)
// Estructura de respuesta:
// {
//   id: number,
//   user_id: number,
//   date: string (YYYY-MM-DD),
//   start_time: string (HH:MM),
//   end_time: string (HH:MM),
//   shift_type: string ('Mañana', 'Tarde', 'Noche'),
//   department: string,
//   status: string ('Scheduled', 'Completed', 'Cancelled'),
//   notes: string,
//   created_at: string
// }

getTodayShifts()
// Retorna: Array<Shift> con campo user.name
// Descripción: Obtiene todos los turnos programados para hoy

getAllShifts()
// Retorna: Array<Shift> con campo user.name
// Descripción: Obtiene todos los turnos del sistema
```

---

## ✍️ Funciones de Escritura (Setters)

### Traslados (NUEVAS)
```javascript
addPatientTransfer(transferData)
// Parámetro: transferData (object)
// {
//   patient_id: number (requerido),
//   from_floor: string,
//   from_area: string,
//   from_room: string,
//   from_bed: string,
//   to_floor: string (requerido),
//   to_area: string (requerido),
//   to_room: string (requerido),
//   to_bed: string (requerido),
//   transfer_date: string (YYYY-MM-DD, requerido),
//   transfer_time: string (HH:MM, requerido),
//   reason: string,
//   transferred_by: string (requerido),
//   notes: string
// }
// Retorna: boolean true si exitoso
// Descripción: Registra un nuevo traslado de paciente
```

### Usuarios (NUEVAS)
```javascript
deleteUser(userId)
// Parámetro: userId (number)
// Retorna: boolean true si exitoso
// Descripción: Elimina un usuario (DELETE físico)
// ⚠️ Advertencia: Operación irreversible

deactivateUser(userId)
// Parámetro: userId (number)
// Retorna: boolean true si exitoso
// Descripción: Desactiva un usuario (mantiene integridad de datos)
// ✅ Recomendado: Usar esta en lugar de deleteUser
```

---

## 📊 Estructuras de Datos

### PatientTransfer
```javascript
{
  id: number,                    // ID del traslado
  patient_id: number,            // ID del paciente
  from_floor: string,            // Piso de origen
  from_area: string,             // Área de origen (ej: 'Medicina Interna')
  from_room: string,             // Sala de origen
  from_bed: string,              // Cama de origen
  to_floor: string,              // Piso de destino
  to_area: string,               // Área de destino
  to_room: string,               // Sala de destino
  to_bed: string,                // Cama de destino
  transfer_date: string,         // Fecha (YYYY-MM-DD)
  transfer_time: string,         // Hora (HH:MM)
  reason: string,                // Razón del traslado
  transferred_by: string,        // Usuario que lo registró
  notes: string,                 // Notas adicionales
  created_at: string             // Timestamp de creación
}
```

### Shift
```javascript
{
  id: number,                    // ID del turno
  user_id: number,               // ID del usuario
  date: string,                  // Fecha del turno (YYYY-MM-DD)
  start_time: string,            // Hora de inicio (HH:MM)
  end_time: string,              // Hora de fin (HH:MM)
  shift_type: string,            // 'Mañana' | 'Tarde' | 'Noche'
  department: string,            // Departamento asignado
  status: string,                // 'Scheduled' | 'Completed' | 'Cancelled'
  notes: string,                 // Notas del turno
  created_at: string             // Timestamp de creación
}
```

---

## 🔗 Relaciones de Datos

```
Users (1) ----< (M) Shifts
              Cada enfermero tiene múltiples turnos

Patients (1) ----< (M) PatientTransfers
                   Cada paciente puede tener múltiples traslados

Patients (1) ----< (M) Prescriptions
                   Cada paciente tiene múltiples medicamentos prescritos

Patients (1) ----< (M) VitalSigns
                   Cada paciente tiene múltiples registros de signos vitales
```

---

## 💾 SQL Subyacente

### Tabla patient_transfers (ya existe)
```sql
CREATE TABLE IF NOT EXISTS patient_transfers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  from_floor TEXT,
  from_area TEXT,
  from_room TEXT,
  from_bed TEXT,
  to_floor TEXT NOT NULL,
  to_area TEXT NOT NULL,
  to_room TEXT NOT NULL,
  to_bed TEXT NOT NULL,
  transfer_date TEXT NOT NULL,
  transfer_time TEXT NOT NULL,
  reason TEXT,
  transferred_by TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

### Tabla shifts (ya existe)
```sql
CREATE TABLE IF NOT EXISTS shifts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  shift_type TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT DEFAULT 'Scheduled',
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🧪 Ejemplos de Uso

### Obtener traslados de un paciente
```javascript
const patientId = 1;
const transfers = await getTransfersByPatientId(patientId);

transfers.forEach(transfer => {
  console.log(`${transfer.from_room} → ${transfer.to_room}`);
  console.log(`Realizado por: ${transfer.transferred_by}`);
  console.log(`Razón: ${transfer.reason}`);
});
```

### Registrar un nuevo traslado
```javascript
const transferData = {
  patient_id: 1,
  from_floor: '3',
  from_area: 'Medicina Interna',
  from_room: '301',
  from_bed: 'A',
  to_floor: '4',
  to_area: 'UCI',
  to_room: '401-UCI',
  to_bed: 'A',
  transfer_date: '2026-01-06',
  transfer_time: '14:30',
  reason: 'Cambio a unidad de cuidados intensivos por deterioro',
  transferred_by: 'Enfermero Juan',
  notes: 'Se informó a familia'
};

await addPatientTransfer(transferData);
```

### Obtener turnos de un enfermero
```javascript
const nurseId = 5;
const shifts = await getShiftsByUserId(nurseId);

shifts.forEach(shift => {
  console.log(`${shift.date}: ${shift.start_time} - ${shift.end_time}`);
  console.log(`Turno: ${shift.shift_type}`);
  console.log(`Departamento: ${shift.department}`);
});
```

### Obtener todos los turnos de hoy
```javascript
const todayShifts = await getTodayShifts();
console.log(`Hay ${todayShifts.length} turnos programados para hoy`);

todayShifts.forEach(shift => {
  console.log(`${shift.name} en ${shift.department}`);
});
```

---

## ⚠️ Consideraciones Importantes

1. **Integridad de Datos:**
   - Usar `deactivateUser()` en lugar de `deleteUser()` cuando sea posible
   - Mantiene referencias referencial intacta

2. **Traslados:**
   - Son SOLO LECTURA una vez creados
   - No hay función de `updatePatientTransfer()`
   - Se registra quién, cuándo y por qué

3. **Turnos:**
   - Los datos son de demostración en `NurseSchedule.jsx`
   - En producción, cargarán desde BD

4. **Cumplimiento NOM-004:**
   - Todas las operaciones son auditables
   - Se guardan timestamps de creación
   - No se eliminan registros (soft delete cuando es necesario)

---

## 📞 Soporte

Si necesitas agregar más funciones o modificar las existentes:

1. Agregar la consulta SQL en `database.js`
2. Exportar la función como `export async function`
3. Usar en componentes importándola desde `../services/database`

Todas las funciones siguen el patrón:
- Obtienen conexión BD con `getDb()`
- Envuelven en try-catch
- Registran en console para debugging
- Retornan array vacío si error (fallback)
