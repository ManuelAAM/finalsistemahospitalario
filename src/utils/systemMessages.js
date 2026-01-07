/**
 * Sistema de Mensajes Estandarizados del Hospital San Rafael
 * Códigos MSG-01 a MSG-10 para consistencia en comunicación con usuarios
 * Códigos ERR-01 a ERR-10 para errores del sistema
 */

export const SYSTEM_MESSAGES = {
  // ============================================
  // CÓDIGOS DE ERROR (ERR-XX)
  // ============================================
  
  // ERR-01: Autenticación fallida
  ERR_01: {
    code: 'ERR-01',
    text: 'Cédula o contraseña incorrecta',
    type: 'error',
    icon: '❌'
  },

  // ERR-02: Validación de campos obligatorios
  ERR_02: {
    code: 'ERR-02',
    text: 'Error: Complete los campos marcados con (*) para continuar',
    type: 'error',
    icon: '⚠️'
  },

  // ERR-03: Cédula inexistente (recuperación de contraseña)
  ERR_03: {
    code: 'ERR-03',
    text: 'Cédula profesional inexistente',
    type: 'error',
    icon: '❌'
  },

  // ============================================
  // MENSAJES DEL SISTEMA (MSG-XX)
  // ============================================
  
  // MSG-01: Validación de cédula profesional
  MSG_01: {
    code: 'MSG-01',
    text: 'Debe ingresar su cédula profesional',
    type: 'warning',
    icon: '⚠️'
  },

  // MSG-02: Confirmación de envío de correo de recuperación
  MSG_02: {
    code: 'MSG-02',
    text: 'Se envió un correo para la recuperación de contraseña',
    type: 'success',
    icon: '✅'
  },

  // MSG-03: Confirmación antes de guardar nota evolutiva
  MSG_03: {
    code: 'MSG-03',
    text: '¿Está seguro de guardar esta nota evolutiva?',
    type: 'confirm',
    icon: '❓'
  },

  // MSG-04: Confirmación de signos vitales guardados
  MSG_04: {
    code: 'MSG-04',
    text: 'Signos vitales guardados correctamente',
    type: 'success',
    icon: '✅'
  },

  // MSG-05: Confirmación de medicamento registrado
  MSG_05: {
    code: 'MSG-05',
    text: 'Medicamento registrado correctamente',
    type: 'success',
    icon: '✅'
  },

  // MSG-06: Error de acceso no autorizado
  MSG_06: {
    code: 'MSG-06',
    text: 'Acceso no autorizado al expediente del paciente',
    type: 'error',
    icon: '❌'
  },

  // MSG-07: Confirmación de formulario guardado
  MSG_07: {
    code: 'MSG-07',
    text: 'Formulario guardado correctamente',
    type: 'success',
    icon: '✅'
  },

  // MSG-08: Notificación de cierre de sesión por inactividad
  MSG_08: {
    code: 'MSG-08',
    text: 'Sesión cerrada por inactividad',
    type: 'warning',
    icon: '⏱️'
  },

  // MSG-09: Confirmación de traslado registrado
  MSG_09: {
    code: 'MSG-09',
    text: 'Traslado registrado con éxito',
    type: 'success',
    icon: '✅'
  },

  // MSG-10: Notificación de cuenta bloqueada
  MSG_10: {
    code: 'MSG-10',
    text: 'Su cuenta ha sido bloqueada, vuélvalo a intentar más tarde',
    type: 'error',
    icon: '🔒'
  }
};

/**
 * Formatea un mensaje del sistema con su código
 * @param {string} messageKey - Clave del mensaje (ej: 'MSG_01')
 * @param {string} additionalInfo - Información adicional opcional
 * @returns {string} Mensaje formateado
 */
export function formatMessage(messageKey, additionalInfo = '') {
  const message = SYSTEM_MESSAGES[messageKey];
  if (!message) {
    console.warn(`Mensaje no encontrado: ${messageKey}`);
    return additionalInfo;
  }

  const formatted = `${message.icon} ${message.code}: ${message.text}`;
  return additionalInfo ? `${formatted}\n\n${additionalInfo}` : formatted;
}

/**
 * Obtiene solo el texto del mensaje sin código
 * @param {string} messageKey - Clave del mensaje
 * @returns {string} Texto del mensaje
 */
export function getMessage(messageKey) {
  const message = SYSTEM_MESSAGES[messageKey];
  return message ? message.text : '';
}

/**
 * Obtiene el tipo de mensaje para estilizado
 * @param {string} messageKey - Clave del mensaje
 * @returns {string} Tipo: 'success' | 'error' | 'warning' | 'confirm'
 */
export function getMessageType(messageKey) {
  const message = SYSTEM_MESSAGES[messageKey];
  return message ? message.type : 'info';
}

/**
 * Muestra un mensaje del sistema con alert (para compatibilidad)
 * @param {string} messageKey - Clave del mensaje
 * @param {string} additionalInfo - Información adicional
 */
export function showSystemMessage(messageKey, additionalInfo = '') {
  alert(formatMessage(messageKey, additionalInfo));
}

/**
 * Muestra un mensaje de confirmación del sistema
 * @param {string} messageKey - Clave del mensaje
 * @param {string} additionalInfo - Información adicional
 * @returns {boolean} true si el usuario confirmó
 */
export function confirmSystemMessage(messageKey, additionalInfo = '') {
  return confirm(formatMessage(messageKey, additionalInfo));
}

export default SYSTEM_MESSAGES;
