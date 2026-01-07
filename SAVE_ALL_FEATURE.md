# 💾 Guía: Botón "Guardar Todo" y Kardex

## ✨ Nueva Funcionalidad: Botón "Guardar Todo"

Se ha agregado un botón especial que permite guardar los **tres registros simultáneamente**:
- ✅ Signos Vitales
- ✅ Medicamentos (Kardex)
- ✅ Notas Evolutivas

El botón está ubicado **debajo de los tres formularios** en la zona de cuidados.

---

## 🧪 Pasos para Probar "Guardar Todo":

### 1. Inicia Sesión
- Usuario: `enfermero`
- Contraseña: `hash_enfermeros123`

### 2. Ve a "Pacientes Asignados"
- Haz clic en la pestaña "Pacientes Asignados"
- Haz clic en "Atender" para cualquier paciente

### 3. Llena los Tres Formularios (TODOS)
**Signos Vitales:**
- Temp (°C): `37.2`
- Presión: `120/80`
- Frec. Card.: `75`
- Frec. Resp.: `16`

**Medicamentos:**
- Nombre del Fármaco: `Omeprazol`
- Dosis: `20mg`
- Frecuencia: `Cada 12 horas`

**Nota Evolutiva:**
```
Paciente en condiciones estables.
Tolera vía oral sin problemas.
Continuar con el tratamiento prescrito.
```

### 4. Haz Clic en "💾 Guardar Todo"
- Deberías ver un botón grande con gradiente azul-púrpura
- Tiene el icono de disco y el texto "Guardar Todo"

### 5. Espera la Confirmación
- Verás un `alert()` indicando cuántos registros se guardaron
- Ejemplo: `✅ Se guardaron 3 registro(s) exitosamente.`

---

## 🔍 Verificación en el Kardex:

### 1. Ve a la Pestaña "Reportes & Analytics"
- Haz clic en la pestaña "Reportes & Analytics" (arriba del dashboard)

### 2. Ve al Kardex de Medicamentos
- En la vista de reportes, busca **"Kardex Medicamentos"**
- Selecciona el paciente en el que guardaste datos
- Deberías ver una tabla con:

| Medicamento | Dosis | Frecuencia | Estado |
|-------------|-------|-----------|--------|
| Omeprazol | 20mg | Cada 12 horas | Activo |

### 3. Verifica que los Datos sean Correctos
- Medicamento: El nombre que registraste
- Dosis: El valor exacto
- Frecuencia: La frecuencia que registraste
- Estado: Debe estar en "Activo"

---

## 📊 Verificación de Signos Vitales:

### 1. En la Misma Pestaña "Reportes & Analytics"
- Busca **"Historial de Signos Vitales"**
- Selecciona el paciente
- Deberías ver una tabla con:
  - Fecha
  - Temperatura
  - Presión Arterial
  - Frecuencia Cardíaca
  - Frecuencia Respiratoria

### 2. Verifica que tus Valores Aparezcan
- Los valores que registraste deben estar en la lista
- Debe mostrar la fecha y hora exacta

---

## 📝 Verificación de Notas:

### 1. En la Vista General (Overview)
- Regresa a la pestaña "Overview"
- Busca la sección **"Bitácora Reciente del Turno"**
- Deberías ver tu nota en la lista más reciente

### 2. Verifica el Contenido
- Debe mostrar la nota completa que escribiste
- Debe tener la fecha y hora
- Debe mostrar el nombre de la enfermera (tu usuario)

---

## ⚙️ Cómo Funciona "Guardar Todo":

### Comportamiento:
1. **Sin validación HTML**: Los campos individuales NO son obligatorios en el formulario
2. **Con validación JavaScript**: Cada campo se valida al intentar guardar
3. **Guardado paralelo**: Los tres registros se guardan simultáneamente (Promise.allSettled)
4. **Resultado granular**: Te dice exactamente cuántos se guardaron y cuántos fallaron

### Ejemplos de Resultado:
- ✅ `Se guardaron 3 registro(s) exitosamente.` - Todo se guardó
- ⚠️ `Se guardaron 2 registro(s) exitosamente. 1 registro(s) fallaron.` - Falló uno
- ⚠️ `No se guardó ningún registro. Por favor verifica los campos.` - Todos fallaron

---

## 💡 Casos de Uso:

### Caso 1: Guardar Todo Junto
1. Llenar todos los campos
2. Clic en "Guardar Todo"
3. ✅ Se guardan los 3 registros

### Caso 2: Guardar Solo Algunos
1. Llenar SOLO Signos Vitales y Medicamentos
2. Dejar Notas vacía
3. Clic en "Guardar Todo"
4. ✅ Se guardan 2 registros, 1 falla pero no hay error
5. Resultado: `Se guardaron 2 registro(s) exitosamente. 1 registro(s) fallaron.`

### Caso 3: Usar Botones Individuales
- Aún puedes usar los botones individuales de cada formulario
- "Guardar Todo" es opcional, no obligatorio

---

## 🔧 Cambios Implementados:

### Archivo `src/components/CareFormComponents.jsx`:
- ✅ Importado `useRef` y `CheckCircle`
- ✅ Creado nuevo componente `CareFormGroup`
- ✅ Creadas versiones con `useImperativeHandle` para cada formulario:
  - `VitalSignsFormWithRef`
  - `MedicationFormWithRef`
  - `NoteFormWithRef`
- ✅ Botón "Guardar Todo" con `Promise.allSettled()` para manejo de errores

### Archivo `src/App.jsx`:
- ✅ Importado `CareFormGroup`
- ✅ Reemplazada la estructura de formularios individuales con `CareFormGroup`
- ✅ Los handlers se mantienen igual (sin cambios en lógica)

### Archivos SIN cambios:
- `src/hooks/useDatabase.js` ✅
- `src/services/database.js` ✅
- `src/components/ReportsAnalytics.jsx` ✅

---

## ✅ Validación de Datos Guardados:

### Signos Vitales en BD:
```javascript
INSERT INTO vital_signs (
  patient_id,      // ID del paciente
  date,           // Fecha y hora
  temperature,    // Temp (°C)
  blood_pressure, // Presión
  heart_rate,     // Frecuencia cardíaca
  respiratory_rate, // Frecuencia respiratoria
  registered_by   // Nombre de la enfermera
)
```

### Medicamentos en BD (Kardex):
```javascript
INSERT INTO treatments (
  patient_id,      // ID del paciente
  medication,      // Nombre del fármaco
  dose,           // Dosis
  frequency,      // Frecuencia
  start_date,     // Fecha de inicio
  applied_by,     // Enfermera que lo registró
  last_application, // Última vez que se aplicó
  status,         // Estado (Activo/Inactivo)
  notes           // Notas adicionales
)
```

### Notas en BD:
```javascript
INSERT INTO nurse_notes (
  patient_id,   // ID del paciente
  date,         // Fecha y hora
  note,         // Contenido de la nota
  nurse_name,   // Nombre de la enfermera
  note_type     // Tipo de nota (Evolución)
)
```

---

## 🚨 Si Algo No Funciona:

### Problema: El botón "Guardar Todo" no aparece
**Solución**: 
- Recarga la página (F5)
- Asegúrate de haber seleccionado un paciente
- Verifica que estés en la pestaña "Atender"

### Problema: No se guarda nada
**Solución**:
- Abre la consola (F12)
- Busca logs rojos (errores)
- Verifica que todos los campos estén llenos correctamente
- Intenta con datos más simples

### Problema: Se guarda solo parte
**Solución**:
- Este es el comportamiento correcto
- Ver el mensaje de alerta: `Se guardaron X registro(s) exitosamente.`
- Los que fallaron tienen campos incompletos

### Problema: El Kardex no muestra los medicamentos
**Solución**:
- Asegúrate de haber guardado medicamentos
- Ve a "Reportes & Analytics"
- Selecciona el paciente correcto en el dropdown
- Busca la pestaña "Kardex Medicamentos"
- Recarga la página para refrescar

---

**Versión**: 2.5.1
**Fecha**: 5 de Enero, 2026
**Nueva Funcionalidad**: Botón "Guardar Todo"
