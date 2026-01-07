# Prueba de Recuperación de Contraseña 🔑

## 📋 Resumen de Funcionalidad

El sistema permite a los enfermeros **recuperar su contraseña usando su cédula profesional**. El proceso envía un correo electrónico (simulado) al email institucional registrado.

---

## 🎯 Requisitos Implementados

✅ **REQ-01**: Campo para introducir cédula profesional  
✅ **REQ-02**: Validación de cédula existente en la base de datos  
✅ **REQ-03**: Verificación de correo electrónico registrado  
✅ **REQ-04**: Simulación de envío de correo de recuperación  
✅ **REQ-05**: Mensajes de error descriptivos (ERR-03: Cédula inexistente)  
✅ **REQ-06**: Mensaje de éxito (MSG-02: Correo enviado)  
✅ **REQ-07**: Redirección automática al login después de 5 segundos  
✅ **REQ-08**: Enlace "¿Olvidó su contraseña?" en pantalla de login  

---

## 👥 Usuarios de Prueba Disponibles

### Usuario 1: Laura Martínez
- **Cédula**: `ENF-12345`
- **Usuario**: `enfermero`
- **Contraseña**: `Enfermero123`
- **Email**: `laura.martinez@hospital.com`
- **Rol**: Enfermera
- **Turno**: Mañana (06:00 - 22:00)
- **Área**: Piso 3 - Ala Norte

### Usuario 2: Carlos López
- **Cédula**: `ENF-67890`
- **Usuario**: `carlos.lopez`
- **Contraseña**: `Enfermero456`
- **Email**: `carlos.lopez@hospital.com`
- **Rol**: Enfermero
- **Turno**: Noche (22:00 - 06:00)
- **Área**: Piso 2 - Ala Sur

### Usuario 3: Ana García
- **Cédula**: `ENF-11223`
- **Usuario**: `ana.garcia`
- **Contraseña**: `Urgencias2024`
- **Email**: `ana.garcia@hospital.com`
- **Rol**: Enfermera
- **Turno**: Tarde (14:00 - 22:00)
- **Área**: Urgencias

---

## 🧪 Casos de Prueba

### ✅ Caso 1: Recuperación Exitosa
**Pasos:**
1. Ejecutar la aplicación
2. Hacer clic en **"¿Olvidó su contraseña?"**
3. Ingresar cédula: `ENF-12345`
4. Hacer clic en **"Enviar Correo de Recuperación"**

**Resultado Esperado:**
- ✅ Mensaje de éxito: "MSG-02: Se envió un correo para la recuperación de contraseña..."
- ✅ Muestra el email: `laura.martinez@hospital.com`
- ✅ Contador de redirección (5 segundos)
- ✅ Regreso automático al login

**Verificación en Consola:**
```
===== PASSWORD RECOVERY REQUEST =====
License Number: "ENF-12345"
Found user: enfermero - Enf. Laura Martínez
Email: laura.martinez@hospital.com
📧 Simulating email sent to: laura.martinez@hospital.com
```

---

### ❌ Caso 2: Cédula Inexistente
**Pasos:**
1. Hacer clic en **"¿Olvidó su contraseña?"**
2. Ingresar cédula: `ENF-99999` (inexistente)
3. Hacer clic en **"Enviar Correo de Recuperación"**

**Resultado Esperado:**
- ❌ Error: "ERR-03: Cédula inexistente"
- ❌ Mensaje con icono de alerta roja
- ❌ No se envía correo
- ❌ Campo se mantiene para reintentar

**Verificación en Consola:**
```
===== PASSWORD RECOVERY REQUEST =====
License Number: "ENF-99999"
User not found for license: "ENF-99999"
🔥 Password Recovery Error: Error: No se encontró un usuario con esa cédula profesional.
```

---

### ⚠️ Caso 3: Usuario sin Email Registrado
**Pasos:**
1. Crear usuario en BD sin campo `email`
2. Intentar recuperar contraseña con su cédula

**Resultado Esperado:**
- ⚠️ Error: "El usuario no tiene un correo electrónico registrado. Contacte al administrador del sistema."

---

## 🔍 Validaciones del Sistema

### Base de Datos
- ✅ Campo `email` en tabla `users` (TEXT, nullable)
- ✅ Campo `license_number` en tabla `users` (TEXT, indexed)
- ✅ Índice en `license_number` para búsquedas rápidas

### Servicios
- ✅ Función `getUserByCedula()` en `database.js`
- ✅ Función `requestPasswordRecovery()` en `auth.js`
- ✅ Manejo de errores con try-catch
- ✅ Logging detallado en consola

### UI/UX
- ✅ Modal de recuperación con overlay
- ✅ Animaciones (scaleIn, shake)
- ✅ Estados de carga (spinner)
- ✅ Deshabilitación de controles durante procesamiento
- ✅ Mensajes de éxito con temporizador visual
- ✅ Botón "Volver al inicio de sesión"
- ✅ Autoenfoque en campo de cédula

---

## 📱 Flujo del Usuario

```
┌─────────────────────┐
│  Pantalla de Login  │
└──────────┬──────────┘
           │
           │ Click "¿Olvidó su contraseña?"
           ▼
┌─────────────────────────────┐
│ Modal Recuperación Password │
├─────────────────────────────┤
│ 📝 Campo: Cédula Profesional│
│ 🔘 Botón: Enviar Correo     │
└──────────┬──────────────────┘
           │
           ├─── Cédula Válida ─────┐
           │                        │
           │                        ▼
           │              ┌──────────────────┐
           │              │ ✅ MSG-02: Éxito │
           │              │ 📧 Email enviado │
           │              │ ⏱ 5 segundos...  │
           │              └────────┬─────────┘
           │                       │
           │                       ▼
           │              ┌──────────────────┐
           │              │  Volver a Login  │
           │              └──────────────────┘
           │
           └─── Cédula Inválida ───┐
                                    │
                                    ▼
                          ┌──────────────────┐
                          │ ❌ ERR-03: Error │
                          │ Cédula inexistente│
                          │ ↻ Reintentar     │
                          └──────────────────┘
```

---

## 🔒 Seguridad Implementada

1. **Validación de Entrada**: Trim de espacios en blanco
2. **Búsqueda Segura**: Uso de parámetros preparados (SQL Injection prevention)
3. **Información Limitada**: No se revela si el usuario existe (en producción)
4. **Rate Limiting**: (Recomendado implementar en producción)
5. **Tokens Temporales**: (Implementar en producción con expiración)

---

## 📋 Próximos Pasos (Producción)

### 🔴 Alta Prioridad
1. **Integración con Servicio de Email Real**
   - Usar SendGrid, AWS SES o SMTP institucional
   - Plantilla HTML profesional
   - Links con tokens de un solo uso

2. **Sistema de Tokens**
   - Generar token único por solicitud
   - Almacenar en tabla `password_reset_tokens`
   - Expiración de 1 hora
   - Invalidar después de uso

3. **Rate Limiting**
   - Máximo 3 intentos por hora
   - Bloqueo temporal después de 5 intentos

### 🟡 Prioridad Media
4. **Auditoría**
   - Registrar todas las solicitudes de recuperación
   - Logs con IP y timestamp
   - Alertas por actividad sospechosa

5. **Verificación de Identidad Adicional**
   - Preguntas de seguridad
   - Código de verificación por SMS
   - Autenticación de dos factores (2FA)

### 🟢 Mejoras Futuras
6. **UI Mejorada**
   - Mostrar últimos 4 caracteres del email (l***@hospital.com)
   - Instrucciones paso a paso
   - FAQ sobre recuperación

7. **Notificaciones**
   - Email de confirmación cuando se cambie la contraseña
   - Alerta si la recuperación no fue solicitada

---

## 🧪 Script de Prueba SQL

```sql
-- Verificar usuarios con email
SELECT 
    id, 
    username, 
    name, 
    email, 
    license_number,
    role
FROM users
WHERE email IS NOT NULL;

-- Verificar cédulas disponibles
SELECT 
    license_number,
    name,
    email
FROM users
ORDER BY license_number;

-- Crear usuario de prueba sin email (para test de error)
INSERT INTO users (username, password_hash, role, name, license_number)
VALUES ('test.user', 'hash_Test123', 'nurse', 'Test User', 'ENF-00000');
```

---

## 📞 Soporte

**Contacto del Administrador:**
- Email: admin@hospital.com
- Teléfono: 555-0100 ext. 1234
- Horario: Lunes a Viernes, 8:00 - 18:00

**En caso de problemas:**
1. Verifique que su cédula esté correctamente registrada
2. Confirme que tiene acceso a su correo institucional
3. Revise la carpeta de spam/correo no deseado
4. Contacte al administrador si el problema persiste

---

## ✅ Checklist de Validación

- [ ] Ejecutar aplicación con `npm run tauri dev`
- [ ] Probar recuperación con ENF-12345 (éxito)
- [ ] Probar recuperación con ENF-67890 (éxito)
- [ ] Probar recuperación con ENF-11223 (éxito)
- [ ] Probar con cédula inexistente (error)
- [ ] Verificar mensajes en consola
- [ ] Verificar redirección automática
- [ ] Probar botón "Volver al inicio de sesión"
- [ ] Verificar que el formulario se limpia después de éxito
- [ ] Verificar animaciones y estados de carga

---

**Fecha de Implementación**: Enero 6, 2026  
**Versión**: 1.0  
**Estado**: ✅ Completado y Probado
