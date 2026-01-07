# 🧪 Guía de Pruebas - Seguridad e Informes de Errores

**Última actualización:** 2025-01-25  
**Sistema:** Hospital San Rafael v2.5.1

---

## ✅ Pruebas Rápidas

### 1️⃣ Prueba: Bloqueo por Intentos Fallidos

**Duración:** ~3 minutos

```
1. Inicia la aplicación
2. En Login, ingresa:
   - Cédula: ENF-12345
   - Contraseña: INCORRECTA
3. Haz clic en "Acceder al Sistema"
4. Aparecerá error "Credenciales incorrectas" ✓
5. REPITE pasos 2-4 dos veces más (total 3 intentos fallidos)
6. En el 3er intento, aparecerá un MODAL ROJO diciendo:
   "Cuenta Bloqueada - Su cuenta ha sido bloqueada..."
   
RESULTADO ESPERADO:
✅ Modal muestra contraseña temporal (8 caracteres)
✅ Botón copiar funciona (dice "Copiado" por 2 segundos)
✅ Dice "Válida por 24 horas"
✅ Botón "Entendido - Intentar Acceso" cierra el modal
```

---

### 2️⃣ Prueba: Acceso con Contraseña Temporal

**Duración:** ~2 minutos  
**Requisito:** Completar Prueba #1

```
1. El modal de "Cuenta Bloqueada" está visible
2. Copia la contraseña temporal (ej: AB12CD34)
3. Haz clic en "Entendido - Intentar Acceso"
4. El modal se cierra y vuelves al formulario
5. Ingresa:
   - Cédula: ENF-12345
   - Contraseña: [LA QUE COPIASTE]
6. Haz clic en "Acceder al Sistema"

RESULTADO ESPERADO:
✅ Acceso exitoso al dashboard
✅ Se abre bitácora de cambio de contraseña
✅ REQUERIDO: Cambiar contraseña antes de continuar
   (Nota: Esta función se implementará en siguiente versión)
```

---

### 3️⃣ Prueba: Reporte de Error (Usuario Normal)

**Duración:** ~2 minutos

```
1. Estando logueado en dashboard
2. Busca botón ROJO FLOTANTE en esquina inferior derecha
   (Tiene icono de ⚠️ AlertTriangle)
3. Haz clic en el botón
4. Se abre modal "Reportar Error"
5. Completa el formulario:
   ├─ Tipo: Selecciona "Aplicación"
   ├─ Módulo: Escribe "Test Module"
   ├─ Severidad: Selecciona "Media"
   └─ Descripción: Escribe "Este es un error de prueba"
6. OPCIONAL: En "Pasos para Reproducir", escribe:
   "1. Abre dashboard
    2. Haz clic en botón flotante
    3. Observa el formulario"
7. Haz clic en "📤 Enviar Reporte"

RESULTADO ESPERADO:
✅ Modal muestra "¡Gracias por reportar!"
✅ Muestra icono ✓ verde
✅ Dice "Tu reporte ha sido registrado"
✅ Después de 2 segundos, modal se cierra
```

---

### 4️⃣ Prueba: Centro de Errores (SOLO ADMIN)

**Duración:** ~3 minutos  
**Requisito:** Ser usuario admin + completar Prueba #3

```
1. Estando logueado como ADMIN
2. En sidebar izquierdo, busca nueva sección "SISTEMA"
   (debajo de "Expediente y Personal")
3. Haz clic en "Centro de Errores" (icono rojo 🚨)
4. Se abre panel "Centro de Errores"
5. Deberías ver tu error de Prueba #3 en la lista

RESULTADO ESPERADO:
✅ Panel muestra título "Centro de Errores"
✅ Muestra tu error reportado en la lista
✅ Aparece:
   - Color badge: AMARILLA (Media)
   - Módulo: "Test Module"
   - Descripción: "Este es un error de prueba"
   - Reportado por: Tu nombre
   - Estado: "Abierto" (rojo)
```

---

### 5️⃣ Prueba: Filtrar Errores

**Duración:** ~2 minutos  
**Requisito:** Prueba #4 completada

```
1. Estando en Centro de Errores
2. En la fila de FILTROS, verás 4 campos:
   ├─ Estado: [Todos ▼]
   ├─ Severidad: [Todas ▼]
   ├─ Módulo: [___________]
   └─ [Restablecer]
3. Prueba #1: Cambia "Estado" a "Abierto"
   └─ Solo deberías ver errores abiertos ✓
4. Prueba #2: Cambia "Severidad" a "Media"
   └─ Solo deberías ver errores medianos ✓
5. Prueba #3: En "Módulo", escribe "Test"
   └─ Se filtra por módulo que contiene "Test" ✓
6. Haz clic en "Restablecer"
   └─ Vuelven todos los filtros por defecto ✓

RESULTADO ESPERADO:
✅ Filtro por Estado funciona
✅ Filtro por Severidad funciona
✅ Filtro por Módulo funciona (búsqueda parcial)
✅ Botón Restablecer limpia todos los filtros
```

---

### 6️⃣ Prueba: Cambiar Estado de Error

**Duración:** ~2 minutos  
**Requisito:** Prueba #4 completada

```
1. Estando en Centro de Errores
2. Busca tu error en la lista
3. Haz clic en el error para EXPANDIR detalles
4. Se abren más secciones:
   ├─ Detalles Técnicos (muestra pasos)
   └─ Cambiar Estado
5. Verás 3 botones:
   [Abierto] [En Progreso] [Resuelto]
6. Prueba #1: Haz clic en "En Progreso"
   └─ El botón se pone de color azul ✓
   └─ En la lista, el estado cambia a "En Progreso" ✓
7. Prueba #2: Haz clic en "Resuelto"
   └─ Aparece un TEXTAREA para notas
   └─ Escribe: "Error resuelto en versión 2.5.1"
   └─ Haz clic en "Marcar como Resuelto"
   └─ Se cierra la fila y se marca como ✅ Resuelto ✓

RESULTADO ESPERADO:
✅ Cambiar a "En Progreso" funciona
✅ El estado se actualiza en tiempo real
✅ Para "Resuelto", requiere notas
✅ Dice "Resuelto por: [Tu nombre]"
✅ Muestra las notas ingresadas
```

---

### 7️⃣ Prueba: Botón de Actualizar

**Duración:** ~1 minuto  
**Requisito:** Prueba #6 completada

```
1. Estando en Centro de Errores
2. En la esquina superior derecha, hay un botón:
   🔄 (Actualizar)
3. Haz clic en el botón
4. El icono girará (animación)
5. La lista se recargará
6. Tu error seguirá mostrando estado "Resuelto"

RESULTADO ESPERADO:
✅ Botón inicia carga (icono gira)
✅ Se recarga la lista
✅ Los datos persisten correctamente
✅ Las notas resueltas se mantienen
```

---

## 📋 Checklist de Validación Completa

```
BLOQUEO DE CUENTA
☐ Intento 1 fallido: Muestra error, permitir reintentar
☐ Intento 2 fallido: Muestra error, permitir reintentar
☐ Intento 3 fallido: Muestra modal de cuenta bloqueada
☐ Modal muestra contraseña temporal (8 caracteres)
☐ Botón copiar en modal funciona
☐ Se puede usar contraseña temporal para acceder
☐ No se puede acceder con contraseña original mientras está bloqueado

REPORTE DE ERRORES
☐ Botón flotante rojo visible en esquina inferior derecha
☐ Al hacer clic, abre modal con formulario
☐ Campo "Tipo" tiene opciones: App, BD, Rendimiento, Otro
☐ Campo "Módulo" es texto libre
☐ Campo "Severidad" tiene radio buttons: Baja/Media/Alta/Crítica
☐ Campo "Descripción" es obligatorio (requiere al menos 1 carácter)
☐ Campo "Pasos" es opcional
☐ Botón "Enviar" valida descripción
☐ Muestra confirmación "¡Gracias por reportar!"
☐ Error se guarda en BD

CENTRO DE ERRORES (ADMIN)
☐ Opción en sidebar "Centro de Errores" solo para admins
☐ Panel abre sin errores
☐ Lista muestra todos los errores reportados
☐ Cada error muestra:
  ☐ Color según severidad (Rojo=Crítica, Naranja=Alta, Amarillo=Media, Verde=Baja)
  ☐ Tipo de error
  ☐ Módulo
  ☐ Descripción
  ☐ Usuario que reportó
  ☐ Fecha/hora
  ☐ Estado actual
☐ Click en error lo expande
☐ Detalles técnicos muestran pasos (si existen)
☐ Botones de estado funcionan
☐ Cambiar a "Resuelto" requiere notas
☐ Notas de resolución se guardan

FILTROS
☐ Filtro por Estado funciona
☐ Filtro por Severidad funciona
☐ Filtro por Módulo funciona (búsqueda parcial)
☐ Botón "Restablecer" limpia todos los filtros
☐ Filtros se aplican en tiempo real

PERSISTENCIA
☐ Los errores se guardan en BD
☐ Refrescar página mantiene los errores
☐ Los estados se guardan correctamente
☐ Las notas de resolución persisten
```

---

## 🐛 Resolución de Problemas

### Problema: No veo el botón flotante rojo
```
Causa: Verificar que estés logueado
Solución: El botón solo aparece cuando hay usuario activo en dashboard
```

### Problema: Centro de Errores no aparece en sidebar
```
Causa: No eres administrador
Solución: Cambia a un usuario con rol 'admin' (ej: usuario admin)
```

### Problema: Modal de cuenta bloqueada no aparece
```
Causa: Posible caché del navegador
Solución: 
  1. Limpia caché (Ctrl+Shift+Del)
  2. Cierra y reabre navegador
  3. Intenta de nuevo con 3 intentos fallidos
```

### Problema: Contraseña temporal no funciona
```
Causa: Vencimiento de 24 horas o error de copia
Solución:
  1. Copia exactamente el código mostrado
  2. Sin espacios adicionales
  3. Verifica que sea diferente a la contraseña original
```

### Problema: Centro de Errores vacío pero reporté error
```
Causa: Posible filtro activo o recarga no completada
Solución:
  1. Haz clic en botón "Restablecer" en filtros
  2. Haz clic en botón "🔄 Actualizar"
  3. Espera a que recargue (icono deja de girar)
```

---

## 📞 Contacto Soporte

Si encuentras problemas durante las pruebas:

1. **Reporta el error** usando el botón flotante rojo
2. **Incluye:**
   - Paso exacto donde ocurrió
   - Mensaje de error (si aplica)
   - Navegador y versión
3. **Admin revisará** en Centro de Errores
4. **Se actualizará** el estado con solución

---

**✨ ¡Gracias por probar estas nuevas características de seguridad!**

