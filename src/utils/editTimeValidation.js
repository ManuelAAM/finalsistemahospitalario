/**
 * Utilidad de Bloqueo de Edición por Tiempo
 * Las notas médicas solo son editables dentro de las primeras 24 horas
 */

/**
 * Verifica si una nota está dentro del período de edición (24 horas)
 * @param {string} createdAt - Timestamp de creación en formato ISO o SQLite
 * @returns {Object} { isEditable: boolean, hoursRemaining: number, timeLeft: string }
 */
export function checkEditTimeLimit(createdAt) {
  if (!createdAt) {
    return {
      isEditable: false,
      hoursRemaining: 0,
      timeLeft: 'Sin fecha de creación',
      reason: 'Fecha de creación no disponible'
    };
  }

  // Convertir timestamp a Date object
  let creationDate;
  try {
    // Manejar diferentes formatos de fecha
    if (createdAt.includes('T')) {
      // Formato ISO: 2026-01-06T15:30:00.000Z
      creationDate = new Date(createdAt);
    } else if (createdAt.includes('-')) {
      // Formato SQLite: 2026-01-06 15:30:00
      creationDate = new Date(createdAt.replace(' ', 'T'));
    } else {
      // Formato personalizado: intenta parsearlo
      creationDate = new Date(createdAt);
    }
    
    if (isNaN(creationDate.getTime())) {
      throw new Error('Fecha inválida');
    }
  } catch (error) {
    console.error('Error parseando fecha de creación:', createdAt, error);
    return {
      isEditable: false,
      hoursRemaining: 0,
      timeLeft: 'Fecha inválida',
      reason: 'Error al procesar fecha de creación'
    };
  }

  const now = new Date();
  const millisecondsElapsed = now.getTime() - creationDate.getTime();
  const hoursElapsed = millisecondsElapsed / (1000 * 60 * 60);
  
  // Límite de edición: 24 horas
  const EDIT_LIMIT_HOURS = 24;
  const isEditable = hoursElapsed < EDIT_LIMIT_HOURS;
  const hoursRemaining = Math.max(0, EDIT_LIMIT_HOURS - hoursElapsed);

  // Calcular tiempo restante legible
  let timeLeft = '';
  if (isEditable) {
    if (hoursRemaining >= 1) {
      const hours = Math.floor(hoursRemaining);
      const minutes = Math.floor((hoursRemaining - hours) * 60);
      timeLeft = `${hours}h ${minutes}m restantes`;
    } else {
      const minutes = Math.floor(hoursRemaining * 60);
      timeLeft = `${minutes} minutos restantes`;
    }
  } else {
    const hoursOverdue = hoursElapsed - EDIT_LIMIT_HOURS;
    if (hoursOverdue >= 24) {
      const days = Math.floor(hoursOverdue / 24);
      timeLeft = `Bloqueada hace ${days} día${days > 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(hoursOverdue);
      timeLeft = `Bloqueada hace ${hours}h`;
    }
  }

  return {
    isEditable,
    hoursRemaining,
    timeLeft,
    reason: isEditable ? 'Dentro del período de edición' : 'Período de edición expirado',
    createdAt: creationDate.toISOString(),
    hoursElapsed: Math.round(hoursElapsed * 100) / 100
  };
}

/**
 * Verifica si múltiples notas están editables
 * @param {Array} notes - Array de notas con campo created_at
 * @returns {Array} Array con información de editabilidad para cada nota
 */
export function checkMultipleNotesEditability(notes) {
  return notes.map(note => ({
    ...note,
    editStatus: checkEditTimeLimit(note.created_at)
  }));
}

/**
 * Valida si una operación de edición está permitida
 * @param {string} createdAt - Timestamp de creación
 * @param {string} operation - Tipo de operación ('edit', 'delete', 'update')
 * @throws {Error} Si la operación no está permitida
 */
export function validateEditOperation(createdAt, operation = 'edit') {
  const timeCheck = checkEditTimeLimit(createdAt);
  
  if (!timeCheck.isEditable) {
    throw new Error(
      `❌ EDICIÓN BLOQUEADA: No se puede ${operation === 'edit' ? 'editar' : operation === 'delete' ? 'eliminar' : 'modificar'} esta nota.\n\n` +
      `Razón: ${timeCheck.reason}\n` +
      `Estado: ${timeCheck.timeLeft}\n` +
      `Tiempo transcurrido: ${timeCheck.hoursElapsed} horas\n\n` +
      `Las notas solo son editables durante las primeras 24 horas después de su creación.`
    );
  }

  return timeCheck;
}

/**
 * Obtiene el estado de todas las notas de un paciente con información de editabilidad
 * @param {number} patientId - ID del paciente
 * @param {Function} getNotesFunction - Función para obtener notas de BD
 * @returns {Promise<Array>} Notas con estado de editabilidad
 */
export async function getPatientNotesWithEditStatus(patientId, getNotesFunction) {
  try {
    const notes = await getNotesFunction(patientId);
    return checkMultipleNotesEditability(notes);
  } catch (error) {
    console.error('Error obteniendo notas con estado de edición:', error);
    throw error;
  }
}

/**
 * Formatea el tiempo de creación para mostrar en UI
 * @param {string} createdAt - Timestamp de creación
 * @returns {string} Fecha formateada legible
 */
export function formatCreationTime(createdAt) {
  try {
    const date = new Date(createdAt.includes('T') ? createdAt : createdAt.replace(' ', 'T'));
    
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return createdAt;
  }
}

/**
 * Genera mensaje explicativo sobre el bloqueo de edición
 * @param {Object} timeCheck - Resultado de checkEditTimeLimit
 * @returns {string} Mensaje para mostrar al usuario
 */
export function getEditLockMessage(timeCheck) {
  if (timeCheck.isEditable) {
    return `✅ Nota editable (${timeCheck.timeLeft})`;
  }

  return (
    `🔒 EDICIÓN BLOQUEADA\n\n` +
    `Esta nota fue creada hace más de 24 horas y ya no puede ser modificada.\n\n` +
    `Estado: ${timeCheck.timeLeft}\n` +
    `Tiempo transcurrido: ${timeCheck.hoursElapsed} horas\n\n` +
    `Esta restricción protege la integridad del registro médico.`
  );
}

/**
 * Configuración del bloqueo de edición
 */
export const EDIT_TIME_CONFIG = {
  LIMIT_HOURS: 24,
  WARNING_HOURS: 2, // Mostrar advertencia cuando queden menos de 2 horas
  COLORS: {
    EDITABLE: '#10b981', // Verde
    WARNING: '#f59e0b',  // Amarillo
    BLOCKED: '#ef4444'   // Rojo
  },
  ICONS: {
    EDITABLE: '✏️',
    WARNING: '⏰',
    BLOCKED: '🔒'
  }
};

/**
 * Obtiene el color y ícono apropiado según el estado de edición
 * @param {Object} timeCheck - Resultado de checkEditTimeLimit
 * @returns {Object} { color, icon, className }
 */
export function getEditStatusStyle(timeCheck) {
  if (!timeCheck.isEditable) {
    return {
      color: EDIT_TIME_CONFIG.COLORS.BLOCKED,
      icon: EDIT_TIME_CONFIG.ICONS.BLOCKED,
      className: 'text-red-600 bg-red-50 border-red-200'
    };
  }

  if (timeCheck.hoursRemaining <= EDIT_TIME_CONFIG.WARNING_HOURS) {
    return {
      color: EDIT_TIME_CONFIG.COLORS.WARNING,
      icon: EDIT_TIME_CONFIG.ICONS.WARNING,
      className: 'text-amber-600 bg-amber-50 border-amber-200'
    };
  }

  return {
    color: EDIT_TIME_CONFIG.COLORS.EDITABLE,
    icon: EDIT_TIME_CONFIG.ICONS.EDITABLE,
    className: 'text-green-600 bg-green-50 border-green-200'
  };
}