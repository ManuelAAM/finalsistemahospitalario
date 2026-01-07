# 🔧 Guía de Integración de Nuevos Componentes

## Introducción

Se han creado 6 nuevos componentes y múltiples funciones de base de datos para cumplir con los requisitos solicitados. Esta guía te mostrará cómo integrarlos en tus dashboards existentes.

---

## 1. TransfersHistory - Visualizar Traslados

### Importación
```jsx
import TransfersHistory from './components/TransfersHistory';
```

### Uso
```jsx
<TransfersHistory patientId={patient.id} />
```

### Propiedades
| Prop | Tipo | Descripción |
|------|------|------------|
| `patientId` | number | ID del paciente para obtener sus traslados |

### Función de Base de Datos
```javascript
// En src/services/database.js
getTransfersByPatientId(patientId)  // Retorna array de traslados
addPatientTransfer(transferData)    // Registra un nuevo traslado
getAllTransfers()                   // Obtiene todos los traslados
```

### Ejemplo de Integración en AdminDashboard
```jsx
import TransfersHistory from '../components/TransfersHistory';

// Dentro del componente
{selectedPatient && (
  <div className="mt-6">
    <TransfersHistory patientId={selectedPatient.id} />
  </div>
)}
```

---

## 2. VitalSignsHistory - Historial de Signos Vitales

### Importación
```jsx
import VitalSignsHistory from './components/VitalSignsHistory';
```

### Uso
```jsx
<VitalSignsHistory patientId={patient.id} />
```

### Propiedades
| Prop | Tipo | Descripción |
|------|------|------------|
| `patientId` | number | ID del paciente |

### Características
- 5 vistas diferentes de signos vitales
- Gráficos interactivos con Recharts
- Estadísticas automáticas
- Tabla detallada
- Rangos normales e indicadores de alerta

### Función de Base de Datos
```javascript
getVitalSignsByPatientId(patientId)  // Retorna array de signos vitales
getAllVitalSigns()                   // Todos los signos vitales
```

### Ejemplo de Integración
```jsx
import VitalSignsHistory from '../components/VitalSignsHistory';

// En un tab de "Signos Vitales"
{activeTab === 'vitals' && (
  <VitalSignsHistory patientId={selectedPatient.id} />
)}
```

---

## 3. MedicalInformation - Información Médica

### Importación
```jsx
import MedicalInformation from './components/MedicalInformation';
```

### Uso
```jsx
<MedicalInformation patient={patient} />
```

### Propiedades
| Prop | Tipo | Descripción |
|------|------|------------|
| `patient` | object | Objeto completo del paciente |

### Muestra
- Médico responsable (`patients.primary_doctor`)
- Diagnóstico (`patients.diagnosis`)
- Medicamentos prescritos (tabla `prescriptions`)

### Funciones de Base de Datos
```javascript
getPrescriptionsByPatientId(patientId)  // Obtiene medicamentos prescritos
```

### Ejemplo de Integración en DoctorDashboard
```jsx
import MedicalInformation from '../components/MedicalInformation';

// En el panel del paciente
{selectedPatient && (
  <MedicalInformation patient={selectedPatient} />
)}
```

---

## 4. TriageDisplay - Mostrar Triaje (Read-Only)

### Importación
```jsx
import { TriageDisplay } from './components/TriageDisplay';
```

### Uso
```jsx
<TriageDisplay 
  level={patient.triage_level}
  timestamp={patient.triage_timestamp}
  evaluatedBy={patient.triage_evaluated_by}
  symptoms={patient.triage_symptoms}
/>
```

### Propiedades
| Prop | Tipo | Descripción |
|------|------|-----------|
| `level` | string | Código de triaje (ROJO, AMARILLO, VERDE, etc.) |
| `timestamp` | string | Fecha/hora de evaluación (opcional) |
| `evaluatedBy` | string | Nombre de quien realizó evaluación (opcional) |
| `symptoms` | string | Síntomas reportados (opcional) |

### Características
- **SOLO LECTURA** - No se puede editar
- Muestra nivel, descripción, tiempo de atención
- Indicador visual de "Inmutable"
- Información de cumplimiento NOM-004

### Ejemplo de Integración
```jsx
import { TriageDisplay } from '../components/TriageDisplay';

// En vista del paciente
<div className="border-2 border-red-200 p-4 rounded-lg mb-4">
  <TriageDisplay
    level={patient.triage_level}
    timestamp={patient.triage_timestamp}
    evaluatedBy={patient.triage_evaluated_by}
    symptoms={patient.triage_symptoms}
  />
</div>
```

---

## 5. NurseSchedule - Horario del Enfermero

### Importación
```jsx
import NurseSchedule from './components/NurseSchedule';
```

### Uso
```jsx
<NurseSchedule user={currentUser} />
```

### Propiedades
| Prop | Tipo | Descripción |
|------|------|-----------|
| `user` | object | Objeto del usuario enfermero con `shift` |

### Características
- Vista de turnos de hoy
- Vista de próximos turnos
- Resumen visual semanal
- Información de departamento

### Funciones de Base de Datos
```javascript
getShiftsByUserId(userId)     // Turnos de un enfermero
getTodayShifts()              // Todos los turnos de hoy
getAllShifts()                // Todos los turnos del sistema
```

### Ejemplo de Integración
```jsx
import NurseSchedule from '../components/NurseSchedule';

// Crear nueva página o sección
function NurseSchedulePage({ currentUser }) {
  return <NurseSchedule user={currentUser} />;
}
```

---

## 6. PatientDetailsModal - Modal Integrado

### Importación
```jsx
import PatientDetailsModal from './components/PatientDetailsModal';
```

### Uso
```jsx
const [showModal, setShowModal] = useState(false);
const [selectedPatient, setSelectedPatient] = useState(null);

// En JSX
{showModal && (
  <PatientDetailsModal 
    patient={selectedPatient} 
    onClose={() => setShowModal(false)} 
  />
)}

// Disparar desde botón
<button onClick={() => {
  setSelectedPatient(patient);
  setShowModal(true);
}}>
  Ver Detalles
</button>
```

### Propiedades
| Prop | Tipo | Descripción |
|------|------|-----------|
| `patient` | object | Objeto completo del paciente |
| `onClose` | function | Callback al cerrar modal |

### Pestañas Incluidas
1. **Resumen** - Información demográfica, alergias, contacto emergencia
2. **Información Médica** - Médico, diagnóstico, medicamentos
3. **Signos Vitales** - Gráficos e historial
4. **Traslados** - Historial de movimientos

---

## 📊 Comparación: Antes vs Después

### Antes
- ❌ Triaje se podía editar después de registrado
- ❌ Sin visualización de traslados
- ❌ Sin historial visual de signos vitales
- ❌ Información médica dispersa
- ❌ Horario de enfermero solo mostraba start/end

### Después
- ✅ Triaje inmutable con componente read-only
- ✅ Historial completo de traslados visible
- ✅ Gráficos interactivos de signos vitales
- ✅ Información médica consolidada en un componente
- ✅ Vista completa del horario con turnos próximos

---

## 🎨 Ejemplo Completo: AdminDashboard Mejorado

```jsx
import React, { useState } from 'react';
import PatientDetailsModal from './components/PatientDetailsModal';
import { getAllPatients } from './services/database';

export default function AdminDashboard({ currentUser }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Cargar pacientes
  const loadPatients = async () => {
    const data = await getAllPatients();
    setPatients(data);
  };

  // Abrir modal de detalles
  const handleViewPatientDetails = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Lista de pacientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map(patient => (
          <div key={patient.id} className="p-4 border rounded-lg">
            <h3 className="font-bold">{patient.name}</h3>
            <p className="text-sm text-gray-600">Sala: {patient.room}</p>
            <button
              onClick={() => handleViewPatientDetails(patient)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ver Detalles Completos
            </button>
          </div>
        ))}
      </div>

      {/* Modal con todas las pestañas */}
      {showModal && (
        <PatientDetailsModal 
          patient={selectedPatient} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
}
```

---

## ⚙️ Configuración de Base de Datos

### Tabla de Traslados (ya existe)
```sql
CREATE TABLE patient_transfers (
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

### Tabla de Turnos (ya existe)
```sql
CREATE TABLE shifts (
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

## 🔍 Debugging y Troubleshooting

### Si no se cargan los traslados
```javascript
// Verifica en console
const transfers = await getTransfersByPatientId(patientId);
console.log('Traslados:', transfers);
```

### Si los gráficos de signos vitales no aparecen
1. Verifica que Recharts esté instalado
2. Comprueba que hay datos en `vital_signs`
3. Revisa errores en console

### Si no se muestra el médico
1. Verifica que `primary_doctor` está en tabla `patients`
2. Comprueba que está llenado el campo

---

## 📝 Próximos Pasos Sugeridos

1. **Integrar en AdminDashboard:**
   - Agregar botón "Ver Detalles" en tabla de pacientes
   - Abre `PatientDetailsModal` con todos los datos

2. **Integrar en DoctorDashboard:**
   - Mostrar `MedicalInformation` al seleccionar paciente
   - Agregar pestaña de "Signos Vitales"

3. **Página de Enfermero:**
   - Crear página con `NurseSchedule`
   - Mostrar mis pacientes y mi horario

4. **Vista de Traslados:**
   - Crear sección administrativa para registrar traslados
   - Usar `addPatientTransfer()` en un formulario

---

## ✅ Checklist de Integración

- [ ] Importar todos los componentes
- [ ] Agregar funciones de DB a servicios
- [ ] Integrar `PatientDetailsModal` en AdminDashboard
- [ ] Agregar `NurseSchedule` en perfil de enfermero
- [ ] Probar gráficos de signos vitales
- [ ] Probar visualización de traslados
- [ ] Verificar que triaje no sea editable
- [ ] Probar información médica en DoctorDashboard

---

## 🚀 ¡Listo para Usar!

Todos los componentes están listos para producción y cumplen con NOM-004 y los requisitos especificados.
