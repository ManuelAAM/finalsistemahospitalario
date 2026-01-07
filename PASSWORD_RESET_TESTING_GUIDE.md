# 🧪 Guía de Pruebas: Sistema de Restablecimiento de Contraseñas

## 📋 Casos de Prueba

### Test 1: Flujo Completo Exitoso

**Objetivo:** Verificar que el flujo completo funciona correctamente

**Pasos:**
1. **Acceder al formulario de recuperación**
   - Ir al login
   - Clic en "¿Olvidó su contraseña?"
   - ✅ Debe mostrar formulario con paso 1/2

2. **Solicitar código (Paso 1)**
   - Ingresar cédula válida: `12345678` (enfermero de prueba)
   - Clic en "Verificar Identidad y Enviar Código"
   - ✅ Debe mostrar mensaje de éxito
   - ✅ Email enmascarado: `e***o@h*****.com`
   - ✅ Auto-avanzar al paso 2 tras 2 segundos

3. **Cambiar contraseña (Paso 2)**
   - En consola del navegador, copiar el token generado:
     ```javascript
     // Buscar en logs: "Token: abc123..."
     ```
   - Ingresar token en campo "Código de Verificación"
   - Nueva contraseña: `nuevapass123`
   - Confirmar contraseña: `nuevapass123`
   - Clic en "Restablecer Contraseña"
   - ✅ Debe mostrar éxito
   - ✅ Redirigir al login tras 3 segundos

4. **Verificar cambio**
   - Iniciar sesión con:
     - Cédula: `12345678`
     - Contraseña: `nuevapass123`
   - ✅ Login exitoso

**Resultado Esperado:** ✅ Flujo completo sin errores

---

### Test 2: Cédula Inexistente (ERR-03)

**Objetivo:** Verificar manejo de cédula no registrada

**Pasos:**
1. Ir a recuperación de contraseña
2. Ingresar cédula inexistente: `99999999`
3. Clic en "Verificar Identidad"

**Resultado Esperado:**
```
❌ ERR-03: Cédula profesional inexistente.
Verifique que ingresó correctamente su cédula.
```

**Verificación:** ✅ Mensaje de error correcto

---

### Test 3: Usuario sin Correo Registrado

**Objetivo:** Verificar validación de correo

**Pasos:**
1. **Preparar datos de prueba**
   ```sql
   -- Crear usuario sin email
   INSERT INTO users (username, password_hash, role, name, license_number)
   VALUES ('test_sin_email', 'hash_test123', 'nurse', 'Enfermero Sin Email', '88888888');
   ```

2. Ir a recuperación de contraseña
3. Ingresar cédula: `88888888`
4. Clic en "Verificar Identidad"

**Resultado Esperado:**
```
❌ Usuario sin correo registrado.
Contacte al administrador del sistema.
```

**Limpieza:**
```sql
DELETE FROM users WHERE license_number = '88888888';
```

---

### Test 4: Token Expirado

**Objetivo:** Verificar expiración de tokens

**Pasos:**
1. **Generar token y forzar expiración**
   ```sql
   -- En la consola del navegador:
   const db = await Database.load('sqlite:hospital.db');
   
   // Crear token expirado
   await db.execute(`
     INSERT INTO password_reset_tokens (
       user_id, username, license_number, email, token, 
       expires_at, created_at
     ) VALUES (
       1, 'enfermero1', '12345678', 'enfermero1@hospital.com',
       'tokenexpirado123', 
       datetime('now', '-2 hours'),  -- Expiró hace 2 horas
       datetime('now', '-3 hours')
     )
   `);
   ```

2. En el formulario (paso 2), ingresar token expirado: `tokenexpirado123`
3. Ingresar contraseña y confirmar
4. Clic en "Restablecer Contraseña"

**Resultado Esperado:**
```
❌ Código de verificación inválido o expirado.
Por favor solicite un nuevo código.
```

---

### Test 5: Token Reutilizado

**Objetivo:** Verificar que tokens no se pueden reutilizar

**Pasos:**
1. Completar flujo exitoso (Test 1)
2. Guardar el token usado
3. Intentar usar el mismo token nuevamente
   - Ir a paso 2
   - Ingresar el token ya usado
   - Intentar cambiar contraseña

**Resultado Esperado:**
```
❌ Código de verificación inválido o expirado.
```

**Verificación en BD:**
```sql
SELECT used FROM password_reset_tokens WHERE token = 'token_usado';
-- Debe retornar: used = 1
```

---

### Test 6: Contraseñas No Coinciden

**Objetivo:** Validar confirmación de contraseña

**Pasos:**
1. Solicitar token válido (paso 1 completo)
2. En paso 2:
   - Código: `[token válido]`
   - Nueva contraseña: `password123`
   - Confirmar contraseña: `password456` ← Diferente
3. Clic en "Restablecer"

**Resultado Esperado:**
```
❌ Las contraseñas no coinciden
```

---

### Test 7: Contraseña Muy Corta

**Objetivo:** Validar longitud mínima

**Pasos:**
1. En paso 2:
   - Nueva contraseña: `abc` ← Solo 3 caracteres
   - Confirmar: `abc`
2. Intentar enviar

**Resultado Esperado:**
```
❌ La contraseña debe tener al menos 6 caracteres
```

---

### Test 8: Invalidación de Tokens Anteriores

**Objetivo:** Verificar que solo el último token es válido

**Pasos:**
1. Solicitar token para cédula `12345678`
2. **Guardar token 1** (del log de consola)
3. SIN USAR el token 1, solicitar otro token para la misma cédula
4. **Guardar token 2**
5. Intentar usar **token 1** (debería fallar)
6. Usar **token 2** (debería funcionar)

**Resultado Esperado:**
- Token 1: ❌ Inválido (auto-invalidado)
- Token 2: ✅ Válido

**Verificación en BD:**
```sql
SELECT token, used FROM password_reset_tokens 
WHERE license_number = '12345678'
ORDER BY created_at DESC;

-- Token antiguo: used = 1
-- Token nuevo: used = 0
```

---

### Test 9: Botón "Solicitar Nuevo Código"

**Objetivo:** Verificar navegación entre pasos

**Pasos:**
1. Completar paso 1 (llegar a paso 2)
2. Clic en "← Solicitar nuevo código"

**Resultado Esperado:**
- ✅ Vuelve al paso 1
- ✅ Formulario limpio
- ✅ Sin errores mostrados

---

### Test 10: Auditoría en Base de Datos

**Objetivo:** Verificar trazabilidad completa

**Pasos:**
1. Completar flujo completo (Test 1)
2. Consultar auditoría:
   ```sql
   SELECT 
     license_number,
     username,
     email,
     token,
     created_at,
     expires_at,
     used,
     used_at,
     ip_address
   FROM password_reset_tokens
   WHERE license_number = '12345678'
   ORDER BY created_at DESC
   LIMIT 5;
   ```

**Resultado Esperado:**
- ✅ Registro existe
- ✅ `created_at` tiene timestamp
- ✅ `expires_at` es created_at + 1 hora
- ✅ `used = 1` tras usar token
- ✅ `used_at` tiene timestamp de cuando se usó
- ✅ `ip_address` registrado (si se pasó)

---

## 🔍 Verificaciones de Seguridad

### S1: Email Enmascarado en UI

**Verificar:**
- El email completo NO aparece en ningún mensaje de la UI
- Se muestra como: `u*****o@h******l.com`

**Dónde revisar:**
- Paso 1: Mensaje de confirmación
- Paso 2: Texto "Revise su correo: ..."

**Método:**
```javascript
// En src/services/auth.js
function maskEmail(email) {
  // Debe ocultar caracteres intermedios
}
```

---

### S2: Token No Retornado en API (Producción)

**Verificar:**
- En `requestPasswordRecovery`, el token NO debe incluirse en el response
- Solo para desarrollo/debug se permite en logs

**Código a revisar:**
```javascript
// src/services/auth.js - requestPasswordRecovery
return {
  success: true,
  // token: NO_INCLUIR_EN_PRODUCCION
  email: maskEmail(email)
};
```

---

### S3: Hash de Contraseñas

**Verificar:**
- Contraseñas NO se guardan en texto plano
- Se usa hashing antes de guardar en BD

**Método:**
```sql
SELECT password_hash FROM users WHERE license_number = '12345678';
-- NO debe verse la contraseña real
```

---

## 📊 Matriz de Resultados

| Test | Descripción | Estado | Notas |
|------|-------------|--------|-------|
| 1 | Flujo completo exitoso | ⬜ Pendiente | |
| 2 | ERR-03 cédula inexistente | ⬜ Pendiente | |
| 3 | Usuario sin correo | ⬜ Pendiente | |
| 4 | Token expirado | ⬜ Pendiente | |
| 5 | Token reutilizado | ⬜ Pendiente | |
| 6 | Contraseñas no coinciden | ⬜ Pendiente | |
| 7 | Contraseña muy corta | ⬜ Pendiente | |
| 8 | Invalidación automática | ⬜ Pendiente | |
| 9 | Navegación entre pasos | ⬜ Pendiente | |
| 10 | Auditoría en BD | ⬜ Pendiente | |

**Leyenda:**
- ✅ Pasó
- ❌ Falló
- ⬜ Pendiente
- ⚠️ Parcial

---

## 🛠️ Herramientas de Prueba

### Consola de Navegador

Para verificar logs del sistema:
```javascript
// Ver token generado (solo desarrollo)
// Buscar en consola: "🔐 Token de recuperación generado"
```

### SQLite Viewer

Para verificar base de datos:
```bash
# Abrir BD
sqlite3 hospital.db

# Ver tokens
SELECT * FROM password_reset_tokens;

# Ver usuarios
SELECT license_number, email FROM users;
```

### DevTools Network

Para verificar requests:
- Abrir DevTools → Network
- Filtrar por "XHR" o "Fetch"
- Verificar payloads enviados/recibidos

---

## 🐛 Errores Conocidos y Soluciones

### Error: "Cannot read property 'email' of undefined"

**Causa:** Usuario no encontrado en BD

**Solución:**
```sql
-- Verificar que el usuario existe
SELECT * FROM users WHERE license_number = '12345678';
```

---

### Error: "Token is not defined"

**Causa:** Token no se generó correctamente

**Solución:**
- Revisar logs de consola
- Verificar tabla `password_reset_tokens`
- Confirmar que `createPasswordResetToken` se ejecutó

---

### Email no se enmascara

**Causa:** Función `maskEmail` no aplicada

**Solución:**
```javascript
// src/services/auth.js
email: maskEmail(tokenData.email)  // ✅ Correcto
email: tokenData.email              // ❌ Incorrecto
```

---

## 📝 Checklist de Pruebas Completas

Antes de marcar como completado:

- [ ] Todos los tests 1-10 ejecutados
- [ ] Verificaciones de seguridad S1-S3 pasadas
- [ ] Auditoría en BD correcta
- [ ] Sin errores en consola
- [ ] UI responsiva en móvil/escritorio
- [ ] Mensajes de error claros y útiles
- [ ] Flujo de usuario intuitivo
- [ ] Documentación actualizada
- [ ] Performance aceptable (<2s por operación)

---

## 🚀 Pruebas de Usuario Final

### Escenario 1: Enfermera Olvida Contraseña

**Narrativa:**
> Ana es una enfermera que no ha ingresado al sistema en 3 meses.
> Olvidó su contraseña pero recuerda su cédula profesional: 12345678

**Pasos que Ana debe seguir:**
1. Intentar login → Falla
2. Clic "¿Olvidó su contraseña?"
3. Ingresar cédula: `12345678`
4. Revisar correo institucional
5. Copiar código del email
6. Ingresar código + nueva contraseña
7. Login exitoso con nueva contraseña

**Tiempo estimado:** 2-3 minutos

**Satisfacción esperada:** ⭐⭐⭐⭐⭐

---

## 📞 Reporte de Problemas

Si encuentra un bug durante las pruebas:

1. **Capturar información:**
   - Screenshot del error
   - Logs de consola
   - Pasos para reproducir

2. **Registrar en sistema:**
   - Usar ErrorReporter del sistema
   - Incluir contexto completo

3. **Verificar en BD:**
   ```sql
   SELECT * FROM system_errors 
   WHERE module = 'PasswordRecovery'
   ORDER BY created_at DESC;
   ```

---

*Documento de pruebas - Sistema de Restablecimiento Seguro*
*Última actualización: Enero 6, 2026*
