/**
 * VALIDACIÓN DE STOCK DE MEDICAMENTOS
 * 
 * Sistema de control de inventario farmacéutico que previene
 * la dispensación de medicamentos sin existencias físicas.
 * 
 * Cumplimiento:
 * - NOM-176-SSA1-1998: Requisitos sanitarios de farmacias
 * - NOM-072-SSA1-2012: Etiquetado de medicamentos
 * - COFEPRIS: Control de medicamentos controlados
 * 
 * @author Sistema Hospitalario San Rafael
 * @version 1.0.0
 */

/**
 * Niveles de alerta de stock
 */
export const STOCK_LEVELS = {
  CRITICAL: {
    threshold: 10,
    label: 'Crítico',
    emoji: '🔴',
    color: 'red',
    action: 'Ordenar inmediatamente'
  },
  LOW: {
    threshold: 25,
    label: 'Bajo',
    emoji: '🟡',
    color: 'yellow',
    action: 'Programar pedido'
  },
  NORMAL: {
    threshold: 50,
    label: 'Normal',
    emoji: '🟢',
    color: 'green',
    action: 'Stock adecuado'
  },
  HIGH: {
    threshold: Infinity,
    label: 'Alto',
    emoji: '🔵',
    color: 'blue',
    action: 'Stock excesivo'
  }
};

/**
 * Categorías de medicamentos
 */
export const MEDICATION_CATEGORIES = {
  CONTROLLED: {
    code: 'CONTROLADO',
    name: 'Medicamento Controlado',
    requiresSpecialTracking: true,
    icon: '⚠️',
    examples: ['Morfina', 'Fentanilo', 'Tramadol']
  },
  ANTIBIOTIC: {
    code: 'ANTIBIOTICO',
    name: 'Antibiótico',
    requiresPrescription: true,
    icon: '💊',
    examples: ['Amoxicilina', 'Ciprofloxacino', 'Cefalexina']
  },
  HIGH_ALERT: {
    code: 'ALTO_RIESGO',
    name: 'Medicamento de Alto Riesgo',
    requiresDoubleCheck: true,
    icon: '🚨',
    examples: ['Insulina', 'Heparina', 'Warfarina']
  },
  STANDARD: {
    code: 'ESTANDAR',
    name: 'Medicamento Estándar',
    requiresSpecialTracking: false,
    icon: '📦',
    examples: ['Paracetamol', 'Ibuprofeno', 'Omeprazol']
  },
  REFRIGERATED: {
    code: 'REFRIGERADO',
    name: 'Requiere Refrigeración',
    storageTemp: '2-8°C',
    icon: '❄️',
    examples: ['Insulina', 'Vacunas', 'Algunos antibióticos']
  }
};

/**
 * Valida que hay suficiente stock antes de dispensar
 * @param {string} medicationName - Nombre del medicamento
 * @param {number} requestedQuantity - Cantidad solicitada
 * @param {number} currentStock - Stock actual disponible
 * @returns {Object} Resultado de validación
 * @throws {Error} Si no hay suficiente stock
 */
export function validateStockAvailability(medicationName, requestedQuantity, currentStock) {
  if (!medicationName || medicationName.trim().length === 0) {
    throw new Error('❌ ERROR: Nombre de medicamento es obligatorio');
  }

  if (!requestedQuantity || requestedQuantity <= 0) {
    throw new Error('❌ ERROR: La cantidad solicitada debe ser mayor a 0');
  }

  if (currentStock === undefined || currentStock === null) {
    throw new Error(
      `❌ MEDICAMENTO NO REGISTRADO EN INVENTARIO\n\n` +
      `Medicamento: ${medicationName}\n` +
      `El medicamento no existe en el sistema de inventario.\n\n` +
      `⚠️ Acción requerida:\n` +
      `  • Verificar nombre del medicamento\n` +
      `  • Registrar en inventario si es nuevo\n` +
      `  • Contactar al departamento de farmacia`
    );
  }

  if (currentStock < requestedQuantity) {
    const deficit = requestedQuantity - currentStock;
    throw new Error(
      `❌ STOCK INSUFICIENTE\n\n` +
      `Medicamento: ${medicationName}\n` +
      `Cantidad solicitada: ${requestedQuantity} unidades\n` +
      `Stock disponible: ${currentStock} unidades\n` +
      `Faltante: ${deficit} unidades\n\n` +
      `⚠️ No se puede dispensar sin inventario físico.\n\n` +
      `Acciones posibles:\n` +
      `  • Reducir cantidad solicitada a ${currentStock} unidades\n` +
      `  • Solicitar reabastecimiento urgente\n` +
      `  • Buscar medicamento alternativo`
    );
  }

  return {
    canDispense: true,
    stockAfterDispense: currentStock - requestedQuantity,
    stockLevel: getStockLevel(currentStock - requestedQuantity),
    warning: getStockWarning(currentStock - requestedQuantity)
  };
}

/**
 * Determina el nivel de stock según cantidad disponible
 * @param {number} quantity - Cantidad en stock
 * @returns {string} Nivel de stock (CRITICAL, LOW, NORMAL, HIGH)
 */
export function getStockLevel(quantity) {
  if (quantity <= STOCK_LEVELS.CRITICAL.threshold) return 'CRITICAL';
  if (quantity <= STOCK_LEVELS.LOW.threshold) return 'LOW';
  if (quantity <= STOCK_LEVELS.NORMAL.threshold) return 'NORMAL';
  return 'HIGH';
}

/**
 * Obtiene información del nivel de stock
 * @param {string} level - Nivel de stock
 * @returns {Object} Información del nivel
 */
export function getStockLevelInfo(level) {
  return STOCK_LEVELS[level] || STOCK_LEVELS.NORMAL;
}

/**
 * Genera advertencia si el stock está bajo
 * @param {number} quantity - Cantidad en stock
 * @returns {string|null} Mensaje de advertencia o null
 */
export function getStockWarning(quantity) {
  if (quantity === 0) {
    return '🔴 AGOTADO: Reabastecer inmediatamente';
  }
  if (quantity <= STOCK_LEVELS.CRITICAL.threshold) {
    return `🔴 CRÍTICO: Solo quedan ${quantity} unidades. Ordenar urgente.`;
  }
  if (quantity <= STOCK_LEVELS.LOW.threshold) {
    return `🟡 BAJO: ${quantity} unidades disponibles. Programar pedido.`;
  }
  return null;
}

/**
 * Calcula el stock después de dispensar
 * @param {number} currentStock - Stock actual
 * @param {number} quantity - Cantidad a dispensar
 * @returns {number} Stock resultante
 */
export function calculateStockAfterDispense(currentStock, quantity) {
  return Math.max(0, currentStock - quantity);
}

/**
 * Valida fecha de expiración del medicamento
 * @param {string} expirationDate - Fecha de expiración (YYYY-MM-DD)
 * @returns {Object} Información de expiración
 */
export function validateExpiration(expirationDate) {
  if (!expirationDate) {
    return {
      isExpired: false,
      daysUntilExpiration: null,
      warning: null
    };
  }

  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isExpired = diffDays < 0;
  const isNearExpiration = diffDays >= 0 && diffDays <= 30;

  let warning = null;
  if (isExpired) {
    warning = `🔴 MEDICAMENTO VENCIDO: Expiró hace ${Math.abs(diffDays)} días. NO DISPENSAR.`;
  } else if (isNearExpiration) {
    warning = `🟡 PRÓXIMO A VENCER: ${diffDays} días restantes. Usar prioritariamente.`;
  }

  return {
    isExpired,
    daysUntilExpiration: diffDays,
    warning,
    canDispense: !isExpired
  };
}

/**
 * Genera un registro de dispensación para auditoría
 * @param {Object} dispensation - Datos de dispensación
 * @returns {Object} Registro de auditoría
 */
export function createDispensationRecord(dispensation) {
  return {
    timestamp: new Date().toISOString(),
    medicationName: dispensation.medicationName,
    quantity: dispensation.quantity,
    dispensedBy: dispensation.dispensedBy,
    patientId: dispensation.patientId,
    stockBefore: dispensation.stockBefore,
    stockAfter: dispensation.stockAfter,
    lotNumber: dispensation.lotNumber || null,
    expirationDate: dispensation.expirationDate || null,
    reason: dispensation.reason || 'Tratamiento médico'
  };
}

/**
 * Calcula estadísticas de inventario
 * @param {Array} inventory - Array de medicamentos en inventario
 * @returns {Object} Estadísticas
 */
export function getInventoryStatistics(inventory) {
  if (!inventory || inventory.length === 0) {
    return {
      total: 0,
      critical: 0,
      low: 0,
      normal: 0,
      high: 0,
      expired: 0,
      nearExpiration: 0,
      totalValue: 0
    };
  }

  const stats = {
    total: inventory.length,
    critical: 0,
    low: 0,
    normal: 0,
    high: 0,
    expired: 0,
    nearExpiration: 0,
    totalValue: 0
  };

  const today = new Date();

  inventory.forEach(item => {
    // Nivel de stock
    const level = getStockLevel(item.quantity || 0);
    if (level === 'CRITICAL') stats.critical++;
    else if (level === 'LOW') stats.low++;
    else if (level === 'NORMAL') stats.normal++;
    else if (level === 'HIGH') stats.high++;

    // Expiración
    if (item.expiration_date) {
      const expDate = new Date(item.expiration_date);
      const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) stats.expired++;
      else if (diffDays <= 30) stats.nearExpiration++;
    }

    // Valor total
    if (item.unit_price && item.quantity) {
      stats.totalValue += item.unit_price * item.quantity;
    }
  });

  return stats;
}

/**
 * Filtra medicamentos por nivel de stock
 * @param {Array} inventory - Inventario completo
 * @param {string} level - Nivel a filtrar (CRITICAL, LOW, etc.)
 * @returns {Array} Medicamentos filtrados
 */
export function filterByStockLevel(inventory, level) {
  return inventory.filter(item => {
    const itemLevel = getStockLevel(item.quantity || 0);
    return itemLevel === level;
  });
}

/**
 * Ordena medicamentos por prioridad de reorden
 * @param {Array} inventory - Inventario
 * @returns {Array} Inventario ordenado
 */
export function sortByReorderPriority(inventory) {
  return [...inventory].sort((a, b) => {
    const levelA = getStockLevel(a.quantity || 0);
    const levelB = getStockLevel(b.quantity || 0);
    
    const priorityOrder = { CRITICAL: 0, LOW: 1, NORMAL: 2, HIGH: 3 };
    
    return priorityOrder[levelA] - priorityOrder[levelB];
  });
}

/**
 * Genera reporte de medicamentos a reordenar
 * @param {Array} inventory - Inventario
 * @returns {Array} Lista de medicamentos a reordenar
 */
export function generateReorderReport(inventory) {
  return inventory
    .filter(item => {
      const level = getStockLevel(item.quantity || 0);
      return level === 'CRITICAL' || level === 'LOW';
    })
    .map(item => ({
      medication: item.name,
      currentStock: item.quantity,
      level: getStockLevel(item.quantity),
      suggestedOrder: Math.max(100 - item.quantity, 50), // Llevar a 100 unidades
      urgency: getStockLevel(item.quantity) === 'CRITICAL' ? 'Urgente' : 'Normal',
      supplier: item.supplier || 'Por definir'
    }));
}

/**
 * Valida lote de medicamento
 * @param {string} lotNumber - Número de lote
 * @returns {Object} Validación de lote
 */
export function validateLotNumber(lotNumber) {
  if (!lotNumber || lotNumber.trim().length === 0) {
    return {
      isValid: false,
      error: 'Número de lote es obligatorio para trazabilidad'
    };
  }

  // Formato básico: 2-10 caracteres alfanuméricos
  const lotRegex = /^[A-Z0-9]{2,10}$/i;
  
  if (!lotRegex.test(lotNumber.trim())) {
    return {
      isValid: false,
      error: 'Formato de lote inválido. Use 2-10 caracteres alfanuméricos.'
    };
  }

  return {
    isValid: true,
    normalized: lotNumber.trim().toUpperCase()
  };
}

/**
 * Formatea información de stock para mostrar
 * @param {Object} medication - Datos del medicamento
 * @returns {string} Texto formateado
 */
export function formatStockInfo(medication) {
  const level = getStockLevel(medication.quantity || 0);
  const info = getStockLevelInfo(level);
  
  return `${info.emoji} ${medication.name}: ${medication.quantity} unidades (${info.label})`;
}

/**
 * Calcula valor total del inventario
 * @param {Array} inventory - Inventario
 * @returns {number} Valor total en pesos
 */
export function calculateInventoryValue(inventory) {
  return inventory.reduce((total, item) => {
    return total + ((item.unit_price || 0) * (item.quantity || 0));
  }, 0);
}

/**
 * Busca medicamento en inventario
 * @param {Array} inventory - Inventario completo
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Array} Medicamentos encontrados
 */
export function searchMedication(inventory, searchTerm) {
  const term = searchTerm.toLowerCase().trim();
  
  return inventory.filter(item => 
    item.name?.toLowerCase().includes(term) ||
    item.active_ingredient?.toLowerCase().includes(term) ||
    item.category?.toLowerCase().includes(term)
  );
}

/**
 * Obtiene medicamentos próximos a vencer
 * @param {Array} inventory - Inventario
 * @param {number} daysThreshold - Días de umbral (default: 30)
 * @returns {Array} Medicamentos próximos a vencer
 */
export function getMedicationsNearExpiration(inventory, daysThreshold = 30) {
  const today = new Date();
  
  return inventory
    .filter(item => {
      if (!item.expiration_date) return false;
      
      const expDate = new Date(item.expiration_date);
      const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
      
      return diffDays >= 0 && diffDays <= daysThreshold;
    })
    .sort((a, b) => {
      const dateA = new Date(a.expiration_date);
      const dateB = new Date(b.expiration_date);
      return dateA - dateB;
    });
}

/**
 * Obtiene categoría del medicamento
 * @param {string} categoryCode - Código de categoría
 * @returns {Object} Información de categoría
 */
export function getMedicationCategory(categoryCode) {
  return Object.values(MEDICATION_CATEGORIES).find(
    cat => cat.code === categoryCode
  ) || MEDICATION_CATEGORIES.STANDARD;
}

/**
 * Valida si se puede dispensar medicamento controlado
 * @param {Object} medication - Datos del medicamento
 * @param {Object} prescription - Datos de prescripción
 * @returns {Object} Validación
 */
export function validateControlledMedicationDispensation(medication, prescription) {
  if (!medication.is_controlled) {
    return { canDispense: true };
  }

  const errors = [];

  if (!prescription) {
    errors.push('Medicamento controlado requiere prescripción médica');
  }

  if (prescription && !prescription.doctor_cedula) {
    errors.push('Prescripción debe incluir cédula profesional del médico');
  }

  if (prescription && !prescription.patient_id) {
    errors.push('Prescripción debe estar asociada a un paciente');
  }

  return {
    canDispense: errors.length === 0,
    errors,
    requiresSpecialForm: true
  };
}

export default {
  STOCK_LEVELS,
  MEDICATION_CATEGORIES,
  validateStockAvailability,
  getStockLevel,
  getStockLevelInfo,
  getStockWarning,
  calculateStockAfterDispense,
  validateExpiration,
  createDispensationRecord,
  getInventoryStatistics,
  filterByStockLevel,
  sortByReorderPriority,
  generateReorderReport,
  validateLotNumber,
  formatStockInfo,
  calculateInventoryValue,
  searchMedication,
  getMedicationsNearExpiration,
  getMedicationCategory,
  validateControlledMedicationDispensation
};
