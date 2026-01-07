# 🔌 GUÍA DE INTEGRACIÓN - NUEVOS COMPONENTES ENFERMERO

**Última actualización:** 6 de Enero, 2026

---

## 📍 Ubicación de Archivos

```
src/components/
├── NonPharmacologicalTreatmentForm.jsx      ← Tratamientos no farmacológicos
├── NurseAssignedPatients.jsx                ← Pacientes asignados
├── MedicationAdministrationForm.jsx         ← Administración de medicamentos
└── [existentes - sin cambios]
```

---

## 1️⃣ NonPharmacologicalTreatmentForm.jsx

### Qué hace
Permite registrar tratamientos como curaciones, nebulizaciones, fluidoterapia, etc.

### Importar
```jsx
import NonPharmacologicalTreatmentForm from './components/NonPharmacologicalTreatmentForm';
```

### Usar
```jsx
<NonPharmacologicalTreatmentForm
  patient={{ 
    id: 123,
    name: "Juan Pérez"
  }}
  nurse={{ 
    id: 456,
    name: "María García"
  }}
  onSuccess={() => {
    // Callback cuando se guarda exitosamente
    console.log('Tratamiento registrado');
  }}
/>
```

### Props Detalladas
| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| patient | Object | Sí | { id: number, name: string } |
| nurse | Object | Sí | { id: number, name: string } |
| onSuccess | Function | No | Callback sin parámetros |

### Ejemplo Completo
```jsx
import { useState } from 'react';
import NonPharmacologicalTreatmentForm from './components/NonPharmacologicalTreatmentForm';

export default function PatientCareView() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const currentNurse = { id: 1, name: 'Ana López' };

  return (
    <div className="p-6">
      <h1>Registrar Cuidados</h1>
      {selectedPatient && (
        <NonPharmacologicalTreatmentForm
          patient={selectedPatient}
          nurse={currentNurse}
          onSuccess={() => {
            alert('✅ Cuidado registrado');
          }}
        />
      )}
    </div>
  );
}
```

### Tipos de Tratamiento Disponibles
```javascript
[
  'curation'      // 🩹 Curación de heridas
  'nebulization'  // 💨 Nebulización
  'fluidotherapy' // 💧 Fluidoterapia IV
  'drainage'      // 🚰 Drenaje
  'catheter_care' // 📍 Cuidado de catéter
  'bed_change'    // 🛏️ Cambio de ropa de cama
  'hygiene'       // 🧼 Aseo del paciente
  'positioning'   // ↔️ Cambio de posición
  'massage'       // 💆 Masaje terapéutico
  'other'         // 📋 Otro tratamiento
]
```

### Funciones BD que Usa
```javascript
addNonPharmacologicalTreatment()           // Guardar nuevo
getNonPharmacologicalTreatmentsByPatientId() // Cargar historial
```

---

## 2️⃣ NurseAssignedPatients.jsx

### Qué hace
Muestra lista de pacientes asignados al enfermero con ubicación, estado y triaje.

### Importar
```jsx
import NurseAssignedPatients from './components/NurseAssignedPatients';
```

### Usar
```jsx
<NurseAssignedPatients
  nurseId={456}
  onPatientSelected={(patient) => {
    console.log('Paciente seleccionado:', patient);
    setCurrentPatient(patient);
  }}
  refreshTrigger={refreshCounter}
/>
```

### Props Detalladas
| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| nurseId | number | Sí | ID del enfermero en sesión |
| onPatientSelected | Function | No | Callback con patient object |
| refreshTrigger | number | No | Incrementa para refrescar |

### Ejemplo Completo
```jsx
import { useState } from 'react';
import NurseAssignedPatients from './components/NurseAssignedPatients';
import PatientDetailsPanel from './PatientDetailsPanel';

export default function NurseShiftView({ currentNurse }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      {/* Pacientes asignados */}
      <div className="col-span-1">
        <NurseAssignedPatients
          nurseId={currentNurse.id}
          onPatientSelected={setSelectedPatient}
          refreshTrigger={refreshCount}
        />
      </div>

      {/* Detalles del paciente seleccionado */}
      <div className="col-span-2">
        {selectedPatient ? (
          <PatientDetailsPanel
            patient={selectedPatient}
            onRefresh={() => setRefreshCount(c => c + 1)}
          />
        ) : (
          <p className="text-gray-500">Selecciona un paciente</p>
        )}
      </div>
    </div>
  );
}
```

### Información Que Muestra
```javascript
{
  id,                    // ID del paciente
  name,                  // Nombre completo
  curp,                  // CURP
  age,                   // Edad
  blood_type,            // Tipo de sangre
  gender,                // Género
  triage_level,          // ROJO/NARANJA/AMARILLO/VERDE
  room,                  // Número de habitación
  primary_doctor,        // Médico responsable
  diagnosis,             // Diagnóstico
  status,                // Estado (stable/critical/pending)
  assigned_at,           // Cuándo se asignó
  shift_type,            // Turno (Mañana/Tarde/Noche)
  notes,                 // Notas de asignación
  room_floor,            // Piso
  room_area,             // Área (Ej: Medicina General)
  bed_number             // Número de cama
}
```

### Funciones BD que Usa
```javascript
getNurseAssignedPatientsWithDetails() // Cargar pacientes asignados
```

---

## 3️⃣ MedicationAdministrationForm.jsx

### Qué hace
Interfaz simplificada para registrar la administración de medicamentos al paciente.

### Importar
```jsx
import MedicationAdministrationForm from './components/MedicationAdministrationForm';
```

### Usar
```jsx
<MedicationAdministrationForm
  patient={{ 
    id: 123,
    name: "Juan Pérez"
  }}
  nurse={{ 
    id: 456,
    name: "María García"
  }}
  onSuccess={() => {
    console.log('Medicamento administrado');
  }}
/>
```

### Props Detalladas
| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| patient | Object | Sí | { id: number, name: string } |
| nurse | Object | Sí | { id: number, name: string } |
| onSuccess | Function | No | Callback sin parámetros |

### Ejemplo Completo
```jsx
import { useState, useCallback } from 'react';
import MedicationAdministrationForm from './components/MedicationAdministrationForm';

export default function MedicineTab({ patient, nurse }) {
  const [successMessage, setSuccessMessage] = useState('');

  const handleSuccess = useCallback(() => {
    setSuccessMessage('✅ Medicamento administrado');
    setTimeout(() => setSuccessMessage(''), 3000);
  }, []);

  return (
    <div>
      {successMessage && (
        <div className="bg-green-100 text-green-800 p-4 rounded mb-4">
          {successMessage}
        </div>
      )}
      <MedicationAdministrationForm
        patient={patient}
        nurse={nurse}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
```

### Flujo de Uso
1. Componente carga medicamentos pendientes automáticamente
2. Enfermero selecciona uno de la lista
3. Ingresa la hora de administración
4. Opcionalmente agrega notas
5. Presiona "Registrar Administración"
6. Sistema guarda y muestra en historial

### Funciones BD que Usa
```javascript
getPendingMedicationAdministration()  // Cargar pendientes
recordMedicationAdministration()      // Guardar registro
getMedicationAdministrationHistory()  // Cargar historial
```

---

## 🎨 Ejemplo Integrado: Portal del Enfermero

```jsx
import { useState, useEffect } from 'react';
import { Tabs, TabList, TabPanel, Tab } from 'react-tabs';
import NurseAssignedPatients from './components/NurseAssignedPatients';
import MedicationAdministrationForm from './components/MedicationAdministrationForm';
import NonPharmacologicalTreatmentForm from './components/NonPharmacologicalTreatmentForm';
import VitalSignsHistory from './components/VitalSignsHistory';
import CareFormComponents from './components/CareFormComponents';

export default function NursePortal({ currentUser }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (!selectedPatient) {
    return (
      <div className="p-6">
        <NurseAssignedPatients
          nurseId={currentUser.id}
          onPatientSelected={setSelectedPatient}
          refreshTrigger={refreshTrigger}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Cuidados: {selectedPatient.name}
        </h1>
        <button
          onClick={() => setSelectedPatient(null)}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          ← Volver a Pacientes
        </button>
      </div>

      {/* Tabs */}
      <Tabs>
        <TabList className="flex gap-2 border-b">
          <Tab>Medicamentos</Tab>
          <Tab>Signos Vitales</Tab>
          <Tab>Tratamientos</Tab>
          <Tab>Historial</Tab>
        </TabList>

        {/* Medicamentos */}
        <TabPanel>
          <MedicationAdministrationForm
            patient={selectedPatient}
            nurse={currentUser}
            onSuccess={() => setRefreshTrigger(t => t + 1)}
          />
        </TabPanel>

        {/* Signos Vitales */}
        <TabPanel>
          <div className="space-y-6">
            <CareFormComponents.VitalSignsForm
              selectedPatient={selectedPatient}
              onSubmit={async (vitals) => {
                // Guardar signos vitales
              }}
            />
            <VitalSignsHistory patientId={selectedPatient.id} />
          </div>
        </TabPanel>

        {/* Tratamientos No Farmacológicos */}
        <TabPanel>
          <NonPharmacologicalTreatmentForm
            patient={selectedPatient}
            nurse={currentUser}
            onSuccess={() => setRefreshTrigger(t => t + 1)}
          />
        </TabPanel>

        {/* Historial */}
        <TabPanel>
          <div className="space-y-6">
            <VitalSignsHistory patientId={selectedPatient.id} />
            <TransfersHistory patientId={selectedPatient.id} />
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
```

---

## 🧪 Pruebas Recomendadas

### Test 1: NonPharmacologicalTreatmentForm
```javascript
// 1. Selecciona un paciente
// 2. Abre el formulario de tratamientos
// 3. Elige "Curación de heridas"
// 4. Escribe: "Se cambió vendaje de la herida quirúrgica"
// 5. Confirma horarios
// 6. Presiona Guardar
// ESPERADO: ✅ Mensaje de éxito y registro visible en historial
```

### Test 2: NurseAssignedPatients
```javascript
// 1. Abre el componente con tu ID de enfermero
// 2. Verifica que aparezcan todos tus pacientes
// 3. Comprueba que se muestre ubicación, triaje, médico
// 4. Selecciona un paciente
// ESPERADO: ✅ Paciente se resalta y trigger de selección funciona
```

### Test 3: MedicationAdministrationForm
```javascript
// 1. Abre el formulario
// 2. Verifica que cargue medicamentos pendientes
// 3. Selecciona un medicamento
// 4. Ingresa hora
// 5. Presiona Registrar
// ESPERADO: ✅ Aparece en historial con hora exacta
```

---

## 🔧 Resolución de Problemas

### Error: "Patient undefined"
```javascript
// ❌ MAL
<NonPharmacologicalTreatmentForm patient={null} />

// ✅ CORRECTO
const [patient, setPatient] = useState(null);
{patient && (
  <NonPharmacologicalTreatmentForm patient={patient} />
)}
```

### Error: "getNurseAssignedPatientsWithDetails is not a function"
```javascript
// Asegúrate de importar de database.js
import { getNurseAssignedPatientsWithDetails } from '../services/database';

// Verifica que database.js esté actualizado (ver línea 2670+)
```

### Error: "Medicamentos no cargan"
```javascript
// Verifica que el paciente tenga prescripciones activas
// En base de datos: prescriptions.status = 'active' y prescriptions.patient_id = patientId

// Si no hay medicamentos:
- Registra una prescripción en el médico
- Verifica que esté en estado 'active'
- Recarga el componente
```

### Interfaz se ve deformada
```javascript
// Verifica que Tailwind CSS esté cargado correctamente
// En main.jsx o index.html debe estar:
import './index.css'

// Y en index.css:
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 📱 Responsive Design

Todos los componentes están optimizados para:
- ✅ Desktop (1200px+)
- ✅ Tablet (768px-1199px)
- ✅ Móvil (< 768px)

### Ejemplo de Layout Responsive
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* En móvil: 1 columna */}
  {/* En tablet: 2 columnas */}
  {/* En desktop: 3 columnas */}
</div>
```

---

## 💾 Datos Que Se Guardan

### NonPharmacologicalTreatmentForm
```javascript
{
  id: auto,
  patient_id: number,
  nurse_id: number,
  nurse_name: string,
  treatment_type: string,
  description: string,
  time_start: HH:MM,
  time_end: HH:MM,
  created_at: timestamp,
  // NOM-004: No se puede eliminar, auditado automáticamente
}
```

### NurseAssignedPatients
```javascript
// Solo lectura, muestra datos de:
// - patients table
// - nurse_patient_assignments table
// - rooms table (para ubicación)
```

### MedicationAdministrationForm
```javascript
{
  id: auto,
  patient_id: number,
  medication_id: number,
  nurse_id: number,
  quantity: number,
  dispensed_time: HH:MM,
  notes: string,
  status: 'administered',
  // Guardado en pharmacy_dispensation
}
```

---

## 📞 Soporte Rápido

| Problema | Solución |
|----------|----------|
| Componente no aparece | Verifica que esté importado y props sean correctas |
| Datos no cargan | Verifica que nurseId/patientId sean válidos |
| Botones deshabilitados | Completa todos los campos requeridos |
| Errores en consola | Abre DevTools (F12) y busca "Error:" |
| BD devuelve vacío | Verifica que existan registros en las tablas |

---

**Última actualización:** 6 de Enero, 2026  
**Versión:** 1.0  
**Estado:** ✅ COMPLETO Y FUNCIONAL
