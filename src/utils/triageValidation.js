/**
 * 🚨 SISTEMA DE CLASIFICACIÓN DE TRIAJE
 * 
 * Cumplimiento normativo: Sistema de Triaje Manchester / Urgencias
 * Requisito: Obligatorio asignar color/nivel de urgencia al ingreso
 * 
 * Este módulo implementa el sistema de triaje hospitalario para clasificar
 * la urgencia de atención de los pacientes según estándares internacionales.
 */

/**
 * Niveles de triaje según código de colores internacional
 */
export const TRIAGE_LEVELS = {
  ROJO: {
    level: 1,
    name: 'Resucitación',
    color: '#DC2626', // red-600
    bgColor: '#FEE2E2', // red-50
    borderColor: '#FCA5A5', // red-300
    textColor: '#991B1B', // red-800
    icon: '🔴',
    timeLimit: 'Inmediato',
    description: 'Riesgo vital inmediato - Requiere atención instantánea',
    examples: [
      'Paro cardiorrespiratorio',
      'Shock severo',
      'Trauma severo con compromiso vital',
      'Quemaduras extensas',
      'Pérdida masiva de sangre'
    ],
    priority: 1
  },
  NARANJA: {
    level: 2,
    name: 'Emergencia',
    color: '#EA580C', // orange-600
    bgColor: '#FFEDD5', // orange-50
    borderColor: '#FDBA74', // orange-300
    textColor: '#9A3412', // orange-800
    icon: '🟠',
    timeLimit: '10-15 min',
    description: 'Situación de emergencia - Atención muy urgente',
    examples: [
      'Dolor torácico severo',
      'Dificultad respiratoria grave',
      'Alteración del estado de conciencia',
      'Hemorragia importante',
      'Fractura expuesta'
    ],
    priority: 2
  },
  AMARILLO: {
    level: 3,
    name: 'Urgente',
    color: '#CA8A04', // yellow-600
    bgColor: '#FEF9C3', // yellow-50
    borderColor: '#FDE047', // yellow-300
    textColor: '#713F12', // yellow-800
    icon: '🟡',
    timeLimit: '30-60 min',
    description: 'Urgencia moderada - Requiere atención pronta',
    examples: [
      'Dolor abdominal intenso',
      'Fiebre alta en niños',
      'Vómitos persistentes',
      'Fracturas sin complicaciones',
      'Deshidratación moderada'
    ],
    priority: 3
  },
  VERDE: {
    level: 4,
    name: 'Menos Urgente',
    color: '#16A34A', // green-600
    bgColor: '#DCFCE7', // green-50
    borderColor: '#86EFAC', // green-300
    textColor: '#14532D', // green-800
    icon: '🟢',
    timeLimit: '1-2 horas',
    description: 'Urgencia menor - Atención diferida',
    examples: [
      'Heridas menores',
      'Esguinces leves',
      'Infecciones urinarias simples',
      'Cefalea leve',
      'Problemas dermatológicos'
    ],
    priority: 4
  },
  AZUL: {
    level: 5,
    name: 'No Urgente',
    color: '#2563EB', // blue-600
    bgColor: '#DBEAFE', // blue-50
    borderColor: '#93C5FD', // blue-300
    textColor: '#1E3A8A', // blue-800
    icon: '🔵',
    timeLimit: '2-4 horas',
    description: 'Sin urgencia - Puede ser atendido en consulta externa',
    examples: [
      'Consultas de rutina',
      'Certificados médicos',
      'Seguimiento de tratamientos',
      'Síntomas crónicos estables',
      'Recetas médicas'
    ],
    priority: 5
  }
};

/**
 * Obtiene todos los niveles de triaje ordenados por prioridad
 */
export function getTriageLevels() {
  return Object.entries(TRIAGE_LEVELS)
    .map(([key, value]) => ({ ...value, code: key }))
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Obtiene información de un nivel de triaje específico
 * @param {string} triageCode - Código del triaje (ROJO, NARANJA, etc.)
 */
export function getTriageInfo(triageCode) {
  if (!triageCode) {
    return null;
  }
  
  const code = triageCode.toUpperCase();
  return TRIAGE_LEVELS[code] || null;
}

/**
 * Valida que el triaje sea obligatorio al registrar paciente
 * @param {string} triageLevel - Nivel de triaje seleccionado
 * @throws {Error} Si no se ha seleccionado triaje
 */
export function validateTriageRequired(triageLevel) {
  if (!triageLevel || triageLevel.trim() === '') {
    throw new Error(
      '🚨 CLASIFICACIÓN DE TRIAJE OBLIGATORIA\n\n' +
      'Debe asignar un nivel de urgencia al paciente antes de completar el ingreso.\n\n' +
      '📋 Seleccione el color/nivel apropiado según la condición del paciente:\n\n' +
      '🔴 ROJO - Resucitación (inmediato)\n' +
      '🟠 NARANJA - Emergencia (10-15 min)\n' +
      '🟡 AMARILLO - Urgente (30-60 min)\n' +
      '🟢 VERDE - Menos urgente (1-2 h)\n' +
      '🔵 AZUL - No urgente (2-4 h)'
    );
  }

  // Validar que el nivel de triaje sea válido
  const code = triageLevel.toUpperCase();
  if (!TRIAGE_LEVELS[code]) {
    throw new Error(
      `❌ Nivel de triaje inválido: "${triageLevel}"\n\n` +
      'Debe seleccionar uno de los niveles estándar de triaje.'
    );
  }

  return true;
}

/**
 * Obtiene el estilo visual para un nivel de triaje
 * @param {string} triageCode - Código del triaje
 */
export function getTriageStyle(triageCode) {
  const info = getTriageInfo(triageCode);
  
  if (!info) {
    return {
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      icon: '⚪',
      label: 'Sin Clasificar'
    };
  }

  return {
    bgColor: info.bgColor,
    textColor: info.textColor,
    borderColor: info.borderColor,
    icon: info.icon,
    label: info.name,
    timeLimit: info.timeLimit
  };
}

/**
 * Formatea la información de triaje para mostrar
 * @param {string} triageCode - Código del triaje
 */
export function formatTriageInfo(triageCode) {
  const info = getTriageInfo(triageCode);
  
  if (!info) {
    return {
      title: 'Sin Clasificación',
      subtitle: 'Requiere evaluación de triaje',
      description: 'Este paciente aún no ha sido clasificado según nivel de urgencia',
      type: 'warning'
    };
  }

  return {
    title: `${info.icon} ${info.name}`,
    subtitle: `Nivel ${info.level} - ${info.timeLimit}`,
    description: info.description,
    examples: info.examples,
    priority: info.priority,
    type: 'info'
  };
}

/**
 * Determina el nivel de triaje sugerido basado en síntomas
 * @param {Object} symptoms - Síntomas del paciente
 */
export function suggestTriageLevel(symptoms) {
  const {
    vitalSignsAbnormal,
    consciousness,
    breathing,
    circulation,
    painLevel,
    trauma
  } = symptoms;

  // Nivel 1 - ROJO (Resucitación)
  if (
    consciousness === 'unconscious' ||
    breathing === 'absent' ||
    circulation === 'absent' ||
    vitalSignsAbnormal === 'critical'
  ) {
    return 'ROJO';
  }

  // Nivel 2 - NARANJA (Emergencia)
  if (
    consciousness === 'altered' ||
    breathing === 'severe_difficulty' ||
    circulation === 'weak' ||
    painLevel >= 8 ||
    trauma === 'severe'
  ) {
    return 'NARANJA';
  }

  // Nivel 3 - AMARILLO (Urgente)
  if (
    breathing === 'moderate_difficulty' ||
    painLevel >= 5 ||
    trauma === 'moderate' ||
    vitalSignsAbnormal === 'moderate'
  ) {
    return 'AMARILLO';
  }

  // Nivel 4 - VERDE (Menos urgente)
  if (
    painLevel >= 3 ||
    trauma === 'minor'
  ) {
    return 'VERDE';
  }

  // Nivel 5 - AZUL (No urgente)
  return 'AZUL';
}

/**
 * Valida los datos de triaje antes de guardar
 * @param {Object} triageData - Datos del triaje
 */
export function validateTriageData(triageData) {
  const errors = [];

  if (!triageData.level) {
    errors.push('Nivel de triaje requerido');
  }

  if (!triageData.evaluatedBy) {
    errors.push('Responsable de evaluación requerido');
  }

  if (!triageData.symptoms || triageData.symptoms.trim().length < 10) {
    errors.push('Descripción de síntomas requerida (mínimo 10 caracteres)');
  }

  if (errors.length > 0) {
    throw new Error(
      '❌ Datos incompletos de triaje:\n\n' +
      errors.map(e => `• ${e}`).join('\n')
    );
  }

  return true;
}

/**
 * Obtiene estadísticas de triaje
 * @param {Array} patients - Lista de pacientes
 */
export function getTriageStatistics(patients) {
  const stats = {
    total: patients.length,
    byLevel: {
      ROJO: 0,
      NARANJA: 0,
      AMARILLO: 0,
      VERDE: 0,
      AZUL: 0,
      SIN_CLASIFICAR: 0
    },
    criticalCount: 0,
    urgentCount: 0,
    nonUrgentCount: 0
  };

  patients.forEach(patient => {
    const triage = patient.triage_level || patient.triageLevel;
    
    if (!triage) {
      stats.byLevel.SIN_CLASIFICAR++;
    } else {
      const code = triage.toUpperCase();
      if (stats.byLevel[code] !== undefined) {
        stats.byLevel[code]++;
        
        // Categorizar por urgencia
        if (code === 'ROJO' || code === 'NARANJA') {
          stats.criticalCount++;
        } else if (code === 'AMARILLO') {
          stats.urgentCount++;
        } else {
          stats.nonUrgentCount++;
        }
      }
    }
  });

  return stats;
}

/**
 * Ordena pacientes por prioridad de triaje
 * @param {Array} patients - Lista de pacientes
 */
export function sortByTriagePriority(patients) {
  return [...patients].sort((a, b) => {
    const triageA = a.triage_level || a.triageLevel;
    const triageB = b.triage_level || b.triageLevel;
    
    const infoA = getTriageInfo(triageA);
    const infoB = getTriageInfo(triageB);
    
    const priorityA = infoA?.priority || 999;
    const priorityB = infoB?.priority || 999;
    
    return priorityA - priorityB;
  });
}

/**
 * Verifica si un paciente requiere atención inmediata
 * @param {string} triageCode - Código del triaje
 */
export function requiresImmediateAttention(triageCode) {
  const info = getTriageInfo(triageCode);
  return info?.level <= 2; // ROJO o NARANJA
}

/**
 * Calcula el tiempo de espera recomendado en minutos
 * @param {string} triageCode - Código del triaje
 */
export function getRecommendedWaitTime(triageCode) {
  const waitTimes = {
    ROJO: 0,
    NARANJA: 15,
    AMARILLO: 60,
    VERDE: 120,
    AZUL: 240
  };

  const code = triageCode?.toUpperCase();
  return waitTimes[code] || 240;
}

/**
 * Genera un badge de triaje para UI
 * @param {string} triageCode - Código del triaje
 */
export function getTriageBadge(triageCode) {
  const info = getTriageInfo(triageCode);
  
  if (!info) {
    return {
      text: 'Sin Clasificar',
      className: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: '⚪',
      pulse: false
    };
  }

  const pulse = info.level <= 2; // Parpadeo para críticos

  return {
    text: `${info.icon} ${info.name}`,
    className: `${info.bgColor} ${info.textColor} border-2`,
    icon: info.icon,
    pulse: pulse,
    priority: info.priority
  };
}

/**
 * Valida cambio de nivel de triaje
 * @param {string} currentLevel - Nivel actual
 * @param {string} newLevel - Nuevo nivel propuesto
 * @param {string} reason - Razón del cambio
 */
export function validateTriageChange(currentLevel, newLevel, reason) {
  if (!newLevel) {
    throw new Error('Debe especificar el nuevo nivel de triaje');
  }

  if (currentLevel === newLevel) {
    throw new Error('El nuevo nivel debe ser diferente al actual');
  }

  if (!reason || reason.trim().length < 20) {
    throw new Error(
      'Debe proporcionar una justificación detallada del cambio de triaje ' +
      '(mínimo 20 caracteres)'
    );
  }

  return true;
}

/**
 * Obtiene alertas basadas en el nivel de triaje
 * @param {string} triageCode - Código del triaje
 */
export function getTriageAlerts(triageCode) {
  const info = getTriageInfo(triageCode);
  
  if (!info) {
    return [{
      type: 'warning',
      message: '⚠️ Paciente sin clasificación de triaje',
      action: 'Realizar evaluación inmediata'
    }];
  }

  const alerts = [];

  if (info.level === 1) {
    alerts.push({
      type: 'critical',
      message: '🚨 ATENCIÓN INMEDIATA REQUERIDA',
      action: 'Activar equipo de emergencias'
    });
  }

  if (info.level === 2) {
    alerts.push({
      type: 'urgent',
      message: '⚡ Atención urgente en menos de 15 minutos',
      action: 'Priorizar en lista de espera'
    });
  }

  return alerts;
}
