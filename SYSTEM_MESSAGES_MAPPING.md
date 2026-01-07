# 📋 Mapeo de Mensajes Estandarizados del Sistema

## Códigos MSG-01 a MSG-10 - Implementación

Este documento describe la ubicación y uso de cada mensaje estandarizado en el sistema.

---

## 📊 Tabla de Mensajes

| Código | Mensaje | Tipo | Componentes que lo usan |
|--------|---------|------|-------------------------|
| **MSG-01** | "Debe ingresar su cédula profesional" | ⚠️ Warning | LoginForm |
| **MSG-02** | "Se envió un correo para la recuperación de contraseña" | ✅ Success | PasswordRecoveryForm |
| **MSG-03** | "¿Está seguro de guardar esta nota evolutiva?" | ❓ Confirm | EditableNotesList |
| **MSG-04** | "Signos vitales guardados correctamente" | ✅ Success | App (handleVitalSubmit) |
| **MSG-05** | "Medicamento registrado correctamente" | ✅ Success | App (handleMedicationSubmit) |
| **MSG-06** | "Acceso no autorizado al expediente del paciente" | ❌ Error | (Futuro: Control de acceso) |
| **MSG-07** | "Formulario guardado correctamente" | ✅ Success | App (handleNoteSubmit) |
| **MSG-08** | "Sesión cerrada por inactividad" | ⏱️ Warning | (Futuro: SessionTimeout) |
| **MSG-09** | "Traslado registrado con éxito" | ✅ Success | (Futuro: BedManagement) |
| **MSG-10** | "Su cuenta ha sido bloqueada, vuélvalo a intentar más tarde" | 🔒 Error | LoginForm (cuenta bloqueada) |

---

## 🔍 Detalle de Implementación

### MSG-01: Validación de Cédula Profesional

**Ubicación:** [LoginForm.jsx](src/components/LoginForm.jsx)

**Contexto:** Validación de campo vacío en formulario de login

**Código:**
```javascript
import { formatMessage } from '../utils/systemMessages';

if (!cedula || !password) {
  setError(!cedula ? formatMessage('MSG_01') : 'Por favor complete todos los campos.');
  return;
}
```

**Mensaje mostrado:**
```
⚠️ MSG-01: Debe ingresar su cédula profesional
```

---

### MSG-02: Correo de Recuperación Enviado

**Ubicación:** [PasswordRecoveryForm.jsx](src/components/PasswordRecoveryForm.jsx)

**Contexto:** Confirmación tras solicitar token de recuperación

**Código:**
```javascript
import { formatMessage } from '../utils/systemMessages';

const result = await requestPasswordRecovery(licenseNumber.trim());
setSuccessMessage(
  formatMessage('MSG_02', 
    `📧 Se envió un código de verificación a: ${result.email}\n\n` +
    `El código es válido por 1 hora.`
  )
);
```

**Mensaje mostrado:**
```
✅ MSG-02: Se envió un correo para la recuperación de contraseña

📧 Se envió un código de verificación a: e***o@h*****.com

El código es válido por 1 hora.
```

---

### MSG-03: Confirmación de Nota Evolutiva

**Ubicación:** [EditableNotesList.jsx](src/components/EditableNotesList.jsx)

**Contexto:** Antes de guardar una nota editada

**Código (a implementar):**
```javascript
import { confirmSystemMessage } from '../utils/systemMessages';

const handleSave = async () => {
  if (!confirmSystemMessage('MSG_03')) {
    return;
  }
  // Guardar nota...
};
```

**Mensaje mostrado:**
```
❓ MSG-03: ¿Está seguro de guardar esta nota evolutiva?
```

---

### MSG-04: Signos Vitales Guardados

**Ubicación:** [App.jsx](src/App.jsx) - función `handleVitalSubmit`

**Contexto:** Confirmación tras registrar signos vitales

**Código:**
```javascript
const handleVitalSubmit = useCallback(async (vitals) => {
  // ... validaciones ...
  
  await addVitalSignsDB({...});
  
  const { formatMessage } = await import('./utils/systemMessages.js');
  alert(formatMessage('MSG_04', 
    `Temp: ${vitals.temperature}°C | PA: ${vitals.bloodPressure} | ` +
    `FC: ${vitals.heartRate} | FR: ${vitals.respiratoryRate}`
  ));
}, [selectedPatientId, addVitalSignsDB, user.name]);
```

**Mensaje mostrado:**
```
✅ MSG-04: Signos vitales guardados correctamente

Temp: 36.5°C | PA: 120/80 | FC: 75 | FR: 18
```

---

### MSG-05: Medicamento Registrado

**Ubicación:** [App.jsx](src/App.jsx) - función `handleMedicationSubmit`

**Contexto:** Confirmación tras registrar medicamento en Kardex

**Código:**
```javascript
const handleMedicationSubmit = useCallback(async (med) => {
  // ... validaciones ...
  
  await addTreatmentDB({...});
  
  const { formatMessage } = await import('./utils/systemMessages.js');
  alert(formatMessage('MSG_05', 
    `${med.medication} - Dosis: ${med.dose} - Frecuencia: ${med.frequency}`
  ));
}, [selectedPatientId, addTreatmentDB, user.name]);
```

**Mensaje mostrado:**
```
✅ MSG-05: Medicamento registrado correctamente

Paracetamol 500mg - Dosis: 1 tableta - Frecuencia: Cada 8 horas
```

---

### MSG-06: Acceso No Autorizado

**Ubicación:** *Por implementar* - Sistema de control de acceso

**Contexto:** Cuando un usuario intenta acceder a un expediente sin permisos

**Código sugerido:**
```javascript
import { formatMessage } from '../utils/systemMessages';

const checkAccess = async (patientId, userId) => {
  const hasAccess = await validatePatientAccess(patientId, userId);
  
  if (!hasAccess) {
    throw new Error(formatMessage('MSG_06'));
  }
};
```

**Mensaje mostrado:**
```
❌ MSG-06: Acceso no autorizado al expediente del paciente
```

**Casos de uso:**
- Enfermero intentando ver paciente de otro turno
- Personal sin asignación al paciente
- Roles sin permisos para cierto tipo de datos

---

### MSG-07: Formulario Guardado

**Ubicación:** [App.jsx](src/App.jsx) - función `handleNoteSubmit`

**Contexto:** Confirmación tras guardar nota SOAP

**Código:**
```javascript
const handleNoteSubmit = useCallback(async (noteValue) => {
  // ... validaciones ...
  
  await addNurseNoteDB({...});
  
  const { formatMessage } = await import('./utils/systemMessages.js');
  alert(formatMessage('MSG_07', 'Nota SOAP registrada en expediente clínico'));
}, [selectedPatientId, addNurseNoteDB, user.name]);
```

**Mensaje mostrado:**
```
✅ MSG-07: Formulario guardado correctamente

Nota SOAP registrada en expediente clínico
```

---

### MSG-08: Sesión Cerrada por Inactividad

**Ubicación:** *Por implementar* - Hook de timeout de sesión

**Contexto:** Después de 15-30 minutos de inactividad

**Código sugerido:**
```javascript
import { formatMessage } from '../utils/systemMessages';

const useSessionTimeout = (timeoutMinutes = 15) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      alert(formatMessage('MSG_08'));
      logout();
    }, timeoutMinutes * 60 * 1000);
    
    return () => clearTimeout(timer);
  }, []);
};
```

**Mensaje mostrado:**
```
⏱️ MSG-08: Sesión cerrada por inactividad
```

**Mejora sugerida:**
- Mostrar advertencia 2 minutos antes
- Botón "Mantener sesión activa"
- Registro en auditoría

---

### MSG-09: Traslado Registrado

**Ubicación:** *Por implementar* - Función `handleRoomAssignment` en App.jsx

**Contexto:** Tras asignar/cambiar habitación de un paciente

**Código sugerido:**
```javascript
import { formatMessage } from '../utils/systemMessages';

const handleRoomAssignment = async (roomNumber) => {
  const { assignPatientToRoom } = await import('./services/database.js');
  
  await assignPatientToRoom(bedModalPatient.id, roomNumber);
  
  alert(formatMessage('MSG_09', 
    `Paciente: ${bedModalPatient.name}\n` +
    `Nueva ubicación: Habitación ${roomNumber}`
  ));
};
```

**Mensaje mostrado:**
```
✅ MSG-09: Traslado registrado con éxito

Paciente: Juan Pérez
Nueva ubicación: Habitación 301-A
```

---

### MSG-10: Cuenta Bloqueada

**Ubicación:** [LoginForm.jsx](src/components/LoginForm.jsx)

**Contexto:** Modal mostrado cuando cuenta está bloqueada por intentos fallidos

**Código:**
```javascript
import { formatMessage } from '../utils/systemMessages';

<h2 className="text-2xl font-bold text-center text-red-600 mb-3">
  {formatMessage('MSG_10').split(',')[0]}
</h2>

<p className="text-center text-hospital-600 mb-6 text-sm">
  {formatMessage('MSG_10')}
  <br /><br />
  Use la contraseña temporal para acceder.
</p>
```

**Mensaje mostrado:**
```
🔒 MSG-10: Su cuenta ha sido bloqueada, vuélvalo a intentar más tarde
```

**Contexto adicional:**
- Se muestra modal con contraseña temporal
- Usuario tiene 3 intentos antes del bloqueo
- Bloqueo automático por 15 minutos

---

## 🛠️ Uso de la Utilidad

### Importación

```javascript
import { 
  formatMessage,      // Formatea mensaje con código
  getMessage,         // Solo el texto
  getMessageType,     // Obtiene tipo (success/error/warning)
  showSystemMessage,  // Alert con formato
  confirmSystemMessage // Confirm con formato
} from '../utils/systemMessages';
```

### Ejemplos de Uso

#### 1. Mensaje Simple con Alert
```javascript
import { formatMessage } from '../utils/systemMessages';

// Solo código
alert(formatMessage('MSG_04'));
// Resultado: "✅ MSG-04: Signos vitales guardados correctamente"

// Con información adicional
alert(formatMessage('MSG_04', 'Temp: 36.5°C'));
// Resultado: "✅ MSG-04: Signos vitales guardados correctamente\n\nTemp: 36.5°C"
```

#### 2. Confirmación
```javascript
import { confirmSystemMessage } from '../utils/systemMessages';

if (confirmSystemMessage('MSG_03')) {
  // Usuario confirmó
  saveNote();
}
```

#### 3. Solo Texto (sin código)
```javascript
import { getMessage } from '../utils/systemMessages';

const errorMessage = getMessage('MSG_06');
// Resultado: "Acceso no autorizado al expediente del paciente"
```

#### 4. Para Componentes Personalizados
```javascript
import { SYSTEM_MESSAGES } from '../utils/systemMessages';

const message = SYSTEM_MESSAGES.MSG_04;
console.log(message.text);  // "Signos vitales guardados correctamente"
console.log(message.type);  // "success"
console.log(message.icon);  // "✅"
```

---

## 📈 Estadísticas de Uso

| Mensaje | Estado | Prioridad | Implementado |
|---------|--------|-----------|--------------|
| MSG-01 | ✅ Completo | Alta | Sí |
| MSG-02 | ✅ Completo | Alta | Sí |
| MSG-03 | ⏳ Pendiente | Media | No |
| MSG-04 | ✅ Completo | Alta | Sí |
| MSG-05 | ✅ Completo | Alta | Sí |
| MSG-06 | ⏳ Pendiente | Baja | No |
| MSG-07 | ✅ Completo | Alta | Sí |
| MSG-08 | ⏳ Pendiente | Media | No |
| MSG-09 | ⏳ Pendiente | Media | No |
| MSG-10 | ✅ Completo | Alta | Sí |

**Implementados:** 6/10 (60%)  
**Pendientes:** 4/10 (40%)

---

## 🔜 Próximos Pasos

### Alta Prioridad
1. ✅ **MSG-01, MSG-02, MSG-04, MSG-05, MSG-07, MSG-10** - Completados

### Media Prioridad
2. **MSG-03** - Implementar en EditableNotesList
   - Agregar confirmación antes de guardar edición
   - Usar `confirmSystemMessage('MSG_03')`

3. **MSG-08** - Crear hook de timeout de sesión
   - Configurar tiempo de inactividad (15 min)
   - Advertencia 2 minutos antes
   - Cierre automático con mensaje MSG-08

4. **MSG-09** - Actualizar BedManagementModal
   - Mensaje de éxito tras asignar habitación
   - Incluir datos del paciente y nueva ubicación

### Baja Prioridad
5. **MSG-06** - Implementar sistema de control de acceso
   - Validar permisos por rol y turno
   - Auditar intentos de acceso no autorizado
   - Mostrar MSG-06 cuando sea necesario

---

## 📚 Documentos Relacionados

- [systemMessages.js](src/utils/systemMessages.js) - Definiciones de mensajes
- [SECURITY_FEATURES.md](SECURITY_FEATURES.md) - Características de seguridad
- [ACCOUNT_LOCKOUT_FEATURE.md](ACCOUNT_LOCKOUT_FEATURE.md) - Bloqueo de cuentas (MSG-10)
- [PASSWORD_RESET_SECURITY_GUIDE.md](PASSWORD_RESET_SECURITY_GUIDE.md) - Recuperación (MSG-01, MSG-02)

---

*Última actualización: Enero 6, 2026*
