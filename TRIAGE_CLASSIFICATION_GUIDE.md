# 🚨 Sistema de Clasificación de Triaje

## Índice
- [Descripción General](#descripción-general)
- [Niveles de Triaje](#niveles-de-triaje)
- [Implementación Técnica](#implementación-técnica)
- [Uso del Sistema](#uso-del-sistema)
- [Validaciones](#validaciones)
- [Ejemplos de Código](#ejemplos-de-código)

---

## Descripción General

El **Sistema de Clasificación de Triaje** es un componente obligatorio para el ingreso de pacientes que permite clasificar la urgencia médica según el estándar Manchester modificado. Este sistema garantiza que todos los pacientes sean evaluados y priorizados adecuadamente al momento de su admisión.

### Características Principales

- ✅ **Obligatorio al Ingreso**: No se puede registrar un paciente sin clasificación de triaje
- 🎨 **5 Niveles Color-Coded**: Sistema visual intuitivo (Rojo, Naranja, Amarillo, Verde, Azul)
- ⏱️ **Tiempos de Atención Definidos**: Cada nivel tiene un tiempo máximo de espera
- 📋 **Registro de Síntomas**: Documentación obligatoria del motivo de consulta
- 👤 **Trazabilidad**: Registro de quién realizó la evaluación y cuándo

### Cumplimiento Normativo

Este sistema cumple con:
- **NOM-004-SSA3-2012**: Expediente clínico
- **NOM-027-SSA3-2013**: Regulación de servicios de urgencias médicas
- Estándares internacionales de triaje (Manchester Triage System)

---

## Niveles de Triaje

### 🔴 Nivel 1: ROJO - Resucitación
**Prioridad: CRÍTICA - Atención Inmediata**

- **Tiempo máximo**: 0 minutos (Inmediato)
- **Descripción**: Situaciones que amenazan la vida de manera inmediata
- **Ejemplos**:
  - Paro cardiorrespiratorio
  - Shock severo
  - Trauma craneoencefálico grave
  - Hemorragia masiva activa
  - Obstrucción de vía aérea completa

**Acciones requeridas**:
- Activar código de emergencia
- Movilización inmediata del equipo de reanimación
- Iniciar soporte vital avanzado

---

### 🟠 Nivel 2: NARANJA - Emergencia
**Prioridad: MUY URGENTE - Atención en 10-15 minutos**

- **Tiempo máximo**: 10-15 minutos
- **Descripción**: Condiciones que requieren atención urgente para prevenir deterioro
- **Ejemplos**:
  - Dolor torácico con sospecha de infarto
  - Dificultad respiratoria severa
  - Politraumatismo
  - Alteración del estado de conciencia
  - Quemaduras extensas

**Acciones requeridas**:
- Monitorización continua de signos vitales
- Acceso venoso inmediato
- Evaluación médica prioritaria

---

### 🟡 Nivel 3: AMARILLO - Urgente
**Prioridad: URGENTE - Atención en 30-60 minutos**

- **Tiempo máximo**: 30-60 minutos
- **Descripción**: Condiciones urgentes que requieren atención pronta pero sin riesgo inmediato
- **Ejemplos**:
  - Dolor abdominal agudo moderado
  - Fracturas sin compromiso vascular
  - Fiebre alta en adultos
  - Vómito persistente
  - Heridas que requieren sutura

**Acciones requeridas**:
- Toma de signos vitales
- Analgesia si es necesario
- Valoración médica en tiempo establecido

---

### 🟢 Nivel 4: VERDE - Menos Urgente
**Prioridad: MENOS URGENTE - Atención en 1-2 horas**

- **Tiempo máximo**: 1-2 horas
- **Descripción**: Condiciones que pueden esperar sin riesgo de complicaciones
- **Ejemplos**:
  - Síntomas de resfriado común
  - Dolor de garganta leve
  - Esguinces menores
  - Heridas superficiales
  - Consultas de seguimiento

**Acciones requeridas**:
- Registro en sala de espera
- Monitorización periódica del estado
- Atención según disponibilidad

---

### 🔵 Nivel 5: AZUL - No Urgente
**Prioridad: NO URGENTE - Atención en 2-4 horas**

- **Tiempo máximo**: 2-4 horas
- **Descripción**: Condiciones crónicas o administrativas que no requieren urgencias
- **Ejemplos**:
  - Renovación de recetas
  - Resultados de laboratorio
  - Consultas administrativas
  - Certificados médicos
  - Síntomas crónicos estables

**Acciones requeridas**:
- Puede ser redirigido a consulta externa
- Atención cuando recursos estén disponibles

---

## Implementación Técnica

### Archivos del Sistema

```
src/
├── utils/
│   └── triageValidation.js      # Lógica de validación y clasificación
├── components/
│   ├── TriageSelector.jsx       # Componentes visuales de triaje
│   └── PatientRegistrationForm.jsx  # Formulario con triaje integrado
└── services/
    └── database.js              # Esquema de BD con campos de triaje
```

### Esquema de Base de Datos

```sql
CREATE TABLE patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  curp TEXT UNIQUE NOT NULL,
  -- ... otros campos ...
  
  -- Campos de Triaje (OBLIGATORIOS)
  triage_level TEXT NOT NULL,           -- 'ROJO', 'NARANJA', 'AMARILLO', 'VERDE', 'AZUL'
  triage_evaluated_by TEXT,             -- Nombre del evaluador
  triage_symptoms TEXT,                 -- Síntomas y motivo de consulta
  triage_timestamp TEXT,                -- Fecha/hora de evaluación
  
  -- ... otros campos ...
);
```

### Estructura de Datos

```javascript
// Objeto de configuración de niveles
const TRIAGE_LEVELS = {
  ROJO: {
    code: 'ROJO',
    name: 'Resucitación',
    emoji: '🔴',
    priority: 1,
    colorClass: 'bg-red-600',
    textClass: 'text-red-700',
    borderClass: 'border-red-600',
    maxWaitTime: 0,
    description: 'Atención inmediata - Riesgo vital',
    examples: ['Paro cardiorrespiratorio', 'Shock severo', ...]
  },
  // ... otros niveles
};
```

---

## Uso del Sistema

### 1. Registro de Nuevo Paciente

```javascript
// El formulario de registro ahora requiere triaje
const patientData = {
  name: 'Juan Pérez',
  age: 45,
  curp: 'PERJ800101HDFRNN09',
  
  // CAMPOS OBLIGATORIOS DE TRIAJE
  triage_level: 'NARANJA',
  triage_symptoms: 'Dolor torácico de inicio súbito hace 30 minutos, irradiado a brazo izquierdo',
  triage_evaluated_by: 'Dra. María López',
  triage_timestamp: '2024-01-15T10:30:00Z'
};

await addPatient(patientData);
```

### 2. Selección Visual en la UI

El componente `TriageSelector` proporciona una interfaz visual intuitiva:

```jsx
import TriageSelector from './components/TriageSelector';

function PatientForm() {
  const [triageLevel, setTriageLevel] = useState('');
  
  return (
    <div>
      <TriageSelector
        value={triageLevel}
        onChange={setTriageLevel}
        required
      />
    </div>
  );
}
```

### 3. Visualización en Lista de Pacientes

```jsx
import { TriageBadge } from './components/TriageSelector';

function PatientList({ patients }) {
  return (
    <table>
      <tbody>
        {patients.map(patient => (
          <tr key={patient.id}>
            <td>{patient.name}</td>
            <td>
              <TriageBadge level={patient.triage_level} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## Validaciones

### Validación Obligatoria

El sistema NO permite registrar pacientes sin triaje:

```javascript
import { validateTriageRequired } from './utils/triageValidation';

try {
  validateTriageRequired(formData.triage_level);
  // Continuar con el registro
} catch (error) {
  // Error: "⚠️ CLASIFICACIÓN DE TRIAJE REQUERIDA: ..."
  alert(error.message);
}
```

### Validación de Síntomas

Los síntomas deben tener al menos 10 caracteres:

```javascript
if (!formData.triage_symptoms || formData.triage_symptoms.trim().length < 10) {
  throw new Error('Debe describir los síntomas del paciente (mínimo 10 caracteres)');
}
```

### Mensajes de Error

```
❌ CLASIFICACIÓN DE TRIAJE REQUERIDA

No se puede registrar un paciente sin evaluación de triaje.

⚠️ Acción requerida:
  • Seleccione el nivel de urgencia apropiado
  • Registre los síntomas principales
  • Complete la evaluación antes de continuar

Razón: Cumplimiento de NOM-027-SSA3-2013
```

---

## Ejemplos de Código

### Ejemplo 1: Sugerir Nivel de Triaje

```javascript
import { suggestTriageLevel } from './utils/triageValidation';

const symptoms = 'dolor torácico intenso, sudoración, náuseas';
const suggestion = suggestTriageLevel(symptoms);

console.log(suggestion);
// {
//   suggestedLevel: 'NARANJA',
//   confidence: 'Alta',
//   reasoning: 'Síntomas compatibles con síndrome coronario agudo',
//   recommendation: 'Evaluación médica urgente requerida'
// }
```

### Ejemplo 2: Obtener Información del Triaje

```javascript
import { getTriageInfo } from './utils/triageValidation';

const info = getTriageInfo('ROJO');
console.log(info);
// {
//   code: 'ROJO',
//   name: 'Resucitación',
//   emoji: '🔴',
//   priority: 1,
//   maxWaitTime: 0,
//   description: 'Atención inmediata - Riesgo vital'
// }
```

### Ejemplo 3: Ordenar Pacientes por Prioridad

```javascript
import { sortByTriagePriority } from './utils/triageValidation';

const patients = [
  { id: 1, name: 'Juan', triage_level: 'VERDE' },
  { id: 2, name: 'María', triage_level: 'ROJO' },
  { id: 3, name: 'Pedro', triage_level: 'AMARILLO' }
];

const sorted = sortByTriagePriority(patients);
console.log(sorted.map(p => p.name));
// ['María', 'Pedro', 'Juan']
```

### Ejemplo 4: Verificar Atención Inmediata

```javascript
import { requiresImmediateAttention } from './utils/triageValidation';

const patient = { triage_level: 'ROJO' };

if (requiresImmediateAttention(patient.triage_level)) {
  alert('🚨 PACIENTE CRÍTICO - ACTIVAR CÓDIGO DE EMERGENCIA');
  activateEmergencyProtocol(patient);
}
```

### Ejemplo 5: Obtener Tiempo de Espera Recomendado

```javascript
import { getRecommendedWaitTime } from './utils/triageValidation';

const waitTime = getRecommendedWaitTime('AMARILLO');
console.log(waitTime);
// '30-60 minutos'
```

---

## Componentes Visuales

### TriageSelector

Selector principal con 5 botones color-coded:

```jsx
<TriageSelector
  value={selectedLevel}
  onChange={setSelectedLevel}
  required
  showInfo={true}  // Mostrar panel de información
/>
```

**Características**:
- Botones grandes con códigos de color
- Tooltips con información al hover
- Checkmark en la opción seleccionada
- Panel de información detallada
- Animación de pulso en nivel ROJO

### TriageInfoPanel

Panel de información detallada del nivel seleccionado:

```jsx
<TriageInfoPanel level="NARANJA" />
```

**Muestra**:
- Nombre y emoji del nivel
- Tiempo máximo de espera
- Descripción detallada
- Ejemplos de condiciones

### TriageBadge

Badge compacto para mostrar en listas:

```jsx
<TriageBadge 
  level="ROJO" 
  showText={true}
  size="md"
/>
```

**Variantes de tamaño**:
- `sm`: Pequeño (24px)
- `md`: Mediano (32px)
- `lg`: Grande (40px)

### TriagePriorityIndicator

Indicador visual de prioridad (punto de color):

```jsx
<TriagePriorityIndicator level="AMARILLO" />
```

### TriageEvaluationForm

Formulario completo de evaluación de triaje:

```jsx
<TriageEvaluationForm
  onSubmit={(data) => {
    console.log('Triaje completado:', data);
  }}
  initialData={{
    symptoms: '',
    consciousness: 'Alerta',
    breathing: 'Normal',
    painLevel: 0
  }}
/>
```

---

## Estadísticas y Análisis

### Obtener Estadísticas de Triaje

```javascript
import { getTriageStatistics } from './utils/triageValidation';

const patients = [...]; // Array de pacientes
const stats = getTriageStatistics(patients);

console.log(stats);
// {
//   total: 100,
//   byLevel: {
//     ROJO: 5,
//     NARANJA: 15,
//     AMARILLO: 30,
//     VERDE: 40,
//     AZUL: 10
//   },
//   percentages: {
//     ROJO: 5,
//     NARANJA: 15,
//     AMARILLO: 30,
//     VERDE: 40,
//     AZUL: 10
//   },
//   critical: 5,      // ROJO
//   urgent: 45,       // ROJO + NARANJA + AMARILLO
//   nonUrgent: 50     // VERDE + AZUL
// }
```

### Formato de Información para Alertas

```javascript
import { formatTriageInfo } from './utils/triageValidation';

const info = formatTriageInfo('ROJO');
console.log(info);
// "🔴 ROJO - Resucitación (Prioridad: 1)"
```

---

## Mejores Prácticas

### ✅ DO (Hacer)

1. **Siempre evaluar triaje al ingreso**
   ```javascript
   // ✅ Correcto
   const patientData = {
     name: 'Juan Pérez',
     triage_level: 'AMARILLO',
     triage_symptoms: 'Dolor abdominal moderado desde hace 3 horas'
   };
   ```

2. **Documentar síntomas específicos**
   ```javascript
   // ✅ Correcto
   triage_symptoms: 'Dolor torácico opresivo de 8/10, inicio súbito hace 20 minutos, irradiado a brazo izquierdo y mandíbula'
   ```

3. **Registrar quién evaluó**
   ```javascript
   // ✅ Correcto
   triage_evaluated_by: currentUser.fullName
   ```

4. **Revisar triaje si condición cambia**
   ```javascript
   // ✅ Correcto
   if (patientConditionWorsened) {
     updateTriage(patientId, 'NARANJA');
   }
   ```

### ❌ DON'T (No hacer)

1. **No registrar sin triaje**
   ```javascript
   // ❌ Incorrecto - Fallará la validación
   const patientData = {
     name: 'Juan Pérez',
     triage_level: ''  // Vacío
   };
   ```

2. **No usar descripciones genéricas**
   ```javascript
   // ❌ Incorrecto
   triage_symptoms: 'dolor'  // Muy corto, poco específico
   
   // ✅ Correcto
   triage_symptoms: 'Dolor abdominal en cuadrante inferior derecho, inicio hace 6 horas, intensidad 7/10'
   ```

3. **No omitir reevaluación**
   ```javascript
   // ❌ Incorrecto - No actualizar triaje si cambia el estado
   // Si el paciente empeora, debe reclasificarse
   ```

4. **No ignorar alertas de triaje crítico**
   ```javascript
   // ❌ Incorrecto
   if (patient.triage_level === 'ROJO') {
     // Ignorar... NO HACER ESTO
   }
   
   // ✅ Correcto
   if (patient.triage_level === 'ROJO') {
     activateEmergencyProtocol();
     notifyEmergencyTeam();
     assignToResuscitationArea();
   }
   ```

---

## Preguntas Frecuentes (FAQ)

### ¿Puedo cambiar el nivel de triaje después de registrar?

Sí, el triaje puede ser reevaluado si la condición del paciente cambia. Usar la función `updateTriage()`:

```javascript
await updateTriage(patientId, newLevel, {
  symptoms: 'Nuevos síntomas...',
  evaluated_by: 'Dr. Smith',
  reason: 'Deterioro del estado general'
});
```

### ¿Qué pasa si no estoy seguro del nivel?

Usa la función `suggestTriageLevel()` para obtener una sugerencia basada en los síntomas:

```javascript
const suggestion = suggestTriageLevel(symptoms);
// Revisa la sugerencia y ajusta según criterio clínico
```

**Regla general**: En caso de duda, **clasifica al nivel superior** (más urgente) para garantizar seguridad del paciente.

### ¿Los tiempos de espera son estrictos?

Los tiempos son **recomendaciones máximas** basadas en estándares internacionales. Sin embargo:

- **ROJO**: Atención inmediata es OBLIGATORIA
- **NARANJA**: Debe verse dentro de 15 minutos
- Otros niveles: Flexibles según carga de trabajo

### ¿Puedo personalizar los niveles?

Sí, los niveles se pueden personalizar editando el objeto `TRIAGE_LEVELS` en [triageValidation.js](src/utils/triageValidation.js). Sin embargo, se recomienda mantener el estándar Manchester por consistencia y cumplimiento normativo.

### ¿El sistema registra quién realizó el triaje?

Sí, el campo `triage_evaluated_by` almacena el nombre del evaluador. Actualmente se debe pasar manualmente, pero en futuras versiones se integrará con el sistema de autenticación.

---

## Roadmap y Mejoras Futuras

### Versión 1.0 (Actual) ✅
- [x] Sistema de 5 niveles color-coded
- [x] Validación obligatoria al ingreso
- [x] Componentes visuales completos
- [x] Integración en formulario de registro
- [x] Registro de síntomas y evaluador

### Versión 1.1 (Planeada)
- [ ] Re-triaje automático
- [ ] Integración con signos vitales
- [ ] Alertas push para triaje crítico
- [ ] Dashboard de estadísticas de triaje
- [ ] Exportar reportes de triaje

### Versión 2.0 (Futura)
- [ ] IA para sugerencia automática de triaje
- [ ] Integración con wearables (signos vitales en tiempo real)
- [ ] Sistema de notificaciones por prioridad
- [ ] Historial de cambios de triaje
- [ ] Auditoría completa de decisiones de triaje

---

## Soporte y Contacto

Para preguntas, sugerencias o reportar problemas:

- **Documentación**: Este archivo
- **Código fuente**: `/src/utils/triageValidation.js`, `/src/components/TriageSelector.jsx`
- **Issues**: Reportar en el sistema de control de versiones

---

## Referencias

1. **Manchester Triage System**: [https://www.triagenet.net/](https://www.triagenet.net/)
2. **NOM-027-SSA3-2013**: Regulación de servicios de urgencias médicas
3. **NOM-004-SSA3-2012**: Del expediente clínico
4. **Emergency Severity Index (ESI)**: Sistema de triaje de 5 niveles

---

## Changelog

### v1.0.0 - 2024-01-15
- ✨ Implementación inicial del sistema de triaje
- ✨ 5 niveles de clasificación (ROJO, NARANJA, AMARILLO, VERDE, AZUL)
- ✨ Validación obligatoria al ingreso
- ✨ Componentes visuales completos
- ✨ Integración en formulario de registro
- ✨ Documentación completa

---

**Última actualización**: Enero 2024  
**Versión**: 1.0.0  
**Estado**: ✅ Producción
