/**
 * 🏥 SISTEMA DE VALIDACIÓN DE ALTA MÉDICA
 * 
 * Cumplimiento normativo: NOM-004-SSA3-2012
 * Requisito: No se puede cerrar cuenta sin orden de alta del médico
 * 
 * Este módulo garantiza que los pacientes solo puedan ser dados de alta
 * del hospital con una orden médica formal autorizada.
 */

/**
 * Verifica si un paciente tiene una orden de alta médica válida
 * @param {number} patientId - ID del paciente
 * @param {Object} db - Instancia de base de datos
 * @returns {Promise<Object>} Estado de la orden de alta
 */
export async function checkDischargeOrder(patientId, db) {
  try {
    const result = await db.select(
      `SELECT * FROM discharge_orders 
       WHERE patient_id = ? 
       AND status = 'active'
       ORDER BY created_at DESC 
       LIMIT 1`,
      [patientId]
    );

    if (result && result.length > 0) {
      const order = result[0];
      return {
        hasOrder: true,
        order: order,
        canDischarge: true,
        message: '✅ Orden de alta médica autorizada'
      };
    }

    return {
      hasOrder: false,
      order: null,
      canDischarge: false,
      message: '❌ No se puede dar de alta sin orden médica'
    };
  } catch (error) {
    console.error('Error verificando orden de alta:', error);
    throw new Error('Error al verificar orden de alta médica');
  }
}

/**
 * Valida que la operación de alta esté autorizada
 * @param {number} patientId - ID del paciente
 * @param {Object} db - Instancia de base de datos
 * @throws {Error} Si no hay orden médica válida
 */
export async function validateDischargeOperation(patientId, db) {
  const validation = await checkDischargeOrder(patientId, db);
  
  if (!validation.canDischarge) {
    throw new Error(
      '🚫 ALTA NO AUTORIZADA\n\n' +
      'No se puede dar de alta a este paciente sin una orden médica formal.\n\n' +
      '📋 Requisito: El médico tratante debe emitir una orden de alta antes de cerrar la cuenta.\n\n' +
      '⚕️ Cumplimiento NOM-004: Todas las altas hospitalarias requieren autorización médica.'
    );
  }

  return validation;
}

/**
 * Crea una nueva orden de alta médica
 * @param {Object} orderData - Datos de la orden
 * @param {Object} db - Instancia de base de datos
 * @returns {Promise<Object>} Orden creada
 */
export async function createDischargeOrder(orderData, db) {
  const {
    patientId,
    doctorId,
    doctorName,
    dischargeType,
    diagnosis,
    recommendations,
    followUpInstructions,
    medications,
    restrictions
  } = orderData;

  // Validar que solo médicos puedan crear órdenes
  if (!doctorId || !doctorName) {
    throw new Error('❌ Solo médicos pueden emitir órdenes de alta');
  }

  // Verificar que no exista una orden activa
  const existing = await checkDischargeOrder(patientId, db);
  if (existing.hasOrder) {
    throw new Error('⚠️ Ya existe una orden de alta activa para este paciente');
  }

  const now = new Date().toISOString();

  try {
    await db.execute(
      `INSERT INTO discharge_orders (
        patient_id,
        doctor_id,
        doctor_name,
        discharge_type,
        diagnosis,
        recommendations,
        follow_up_instructions,
        medications,
        restrictions,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        doctorId,
        doctorName,
        dischargeType || 'Mejoría',
        diagnosis || '',
        recommendations || '',
        followUpInstructions || '',
        medications || '',
        restrictions || '',
        'active',
        now,
        now
      ]
    );

    return {
      success: true,
      message: '✅ Orden de alta médica emitida exitosamente',
      orderId: await getLastInsertId(db)
    };
  } catch (error) {
    console.error('Error creando orden de alta:', error);
    throw new Error('Error al crear orden de alta médica');
  }
}

/**
 * Cancela una orden de alta médica existente
 * @param {number} orderId - ID de la orden
 * @param {string} reason - Razón de cancelación
 * @param {Object} db - Instancia de base de datos
 */
export async function cancelDischargeOrder(orderId, reason, db) {
  try {
    await db.execute(
      `UPDATE discharge_orders 
       SET status = 'cancelled',
           cancellation_reason = ?,
           updated_at = ?
       WHERE id = ?`,
      [reason, new Date().toISOString(), orderId]
    );

    return {
      success: true,
      message: '✅ Orden de alta cancelada'
    };
  } catch (error) {
    console.error('Error cancelando orden de alta:', error);
    throw new Error('Error al cancelar orden de alta');
  }
}

/**
 * Completa el proceso de alta del paciente
 * @param {number} patientId - ID del paciente
 * @param {Object} db - Instancia de base de datos
 */
export async function completeDischarge(patientId, db) {
  // Validar que exista orden de alta
  await validateDischargeOperation(patientId, db);

  const now = new Date().toISOString();

  try {
    // Actualizar estado de la orden
    await db.execute(
      `UPDATE discharge_orders 
       SET status = 'completed',
           discharge_executed_at = ?,
           updated_at = ?
       WHERE patient_id = ? AND status = 'active'`,
      [now, now, patientId]
    );

    // Actualizar estado del paciente
    await db.execute(
      `UPDATE patients 
       SET status = 'discharged',
           discharge_date = ?,
           room = NULL
       WHERE id = ?`,
      [now, patientId]
    );

    return {
      success: true,
      message: '✅ Alta médica completada exitosamente'
    };
  } catch (error) {
    console.error('Error completando alta:', error);
    throw new Error('Error al completar alta médica');
  }
}

/**
 * Obtiene el historial de órdenes de alta de un paciente
 * @param {number} patientId - ID del paciente
 * @param {Object} db - Instancia de base de datos
 */
export async function getDischargeHistory(patientId, db) {
  try {
    const orders = await db.select(
      `SELECT * FROM discharge_orders 
       WHERE patient_id = ?
       ORDER BY created_at DESC`,
      [patientId]
    );

    return orders || [];
  } catch (error) {
    console.error('Error obteniendo historial de altas:', error);
    return [];
  }
}

/**
 * Obtiene información visual del estado de alta
 * @param {boolean} hasOrder - Si tiene orden de alta
 * @param {string} orderStatus - Estado de la orden
 */
export function getDischargeStatusStyle(hasOrder, orderStatus) {
  if (!hasOrder) {
    return {
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      icon: '🚫',
      label: 'Sin Orden de Alta',
      canDischarge: false
    };
  }

  if (orderStatus === 'active') {
    return {
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      icon: '✅',
      label: 'Autorizado para Alta',
      canDischarge: true
    };
  }

  if (orderStatus === 'completed') {
    return {
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      icon: '✓',
      label: 'Alta Completada',
      canDischarge: false
    };
  }

  return {
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    icon: '○',
    label: 'Orden Cancelada',
    canDischarge: false
  };
}

/**
 * Formatea la información de alta para mostrar al usuario
 * @param {Object} order - Orden de alta
 */
export function formatDischargeInfo(order) {
  if (!order) {
    return {
      title: 'Sin Orden de Alta',
      description: 'Se requiere autorización médica para dar de alta al paciente',
      type: 'warning'
    };
  }

  const createdDate = new Date(order.created_at).toLocaleString('es-MX');
  
  return {
    title: `Orden de Alta Médica - ${order.discharge_type}`,
    description: `Emitida por: ${order.doctor_name} el ${createdDate}`,
    diagnosis: order.diagnosis,
    recommendations: order.recommendations,
    followUp: order.follow_up_instructions,
    medications: order.medications,
    restrictions: order.restrictions,
    type: 'success'
  };
}

/**
 * Valida los datos de una orden de alta antes de crearla
 * @param {Object} orderData - Datos de la orden
 * @throws {Error} Si faltan datos requeridos
 */
export function validateDischargeOrderData(orderData) {
  const errors = [];

  if (!orderData.patientId) {
    errors.push('ID de paciente requerido');
  }

  if (!orderData.doctorId || !orderData.doctorName) {
    errors.push('Información del médico requerida');
  }

  if (!orderData.dischargeType) {
    errors.push('Tipo de alta requerido');
  }

  if (!orderData.diagnosis || orderData.diagnosis.trim().length < 10) {
    errors.push('Diagnóstico de egreso requerido (mínimo 10 caracteres)');
  }

  if (!orderData.recommendations || orderData.recommendations.trim().length < 10) {
    errors.push('Recomendaciones médicas requeridas (mínimo 10 caracteres)');
  }

  if (errors.length > 0) {
    throw new Error(
      '❌ Datos incompletos para orden de alta:\n\n' +
      errors.map(e => `• ${e}`).join('\n')
    );
  }

  return true;
}

/**
 * Obtiene el último ID insertado
 * @param {Object} db - Instancia de base de datos
 */
async function getLastInsertId(db) {
  try {
    const result = await db.select('SELECT last_insert_rowid() as id');
    return result[0]?.id || null;
  } catch (error) {
    console.error('Error obteniendo último ID:', error);
    return null;
  }
}

/**
 * Tipos de alta médica disponibles
 */
export const DISCHARGE_TYPES = {
  MEJORIA: 'Mejoría',
  CURACION: 'Curación',
  TRASLADO: 'Traslado',
  VOLUNTARIA: 'Voluntaria',
  DEFUNCION: 'Defunción',
  FUGA: 'Fuga'
};

/**
 * Obtiene estadísticas de órdenes de alta
 * @param {Object} db - Instancia de base de datos
 */
export async function getDischargeStatistics(db) {
  try {
    const stats = await db.select(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM discharge_orders
    `);

    return stats[0] || {
      total: 0,
      active: 0,
      completed: 0,
      cancelled: 0
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return { total: 0, active: 0, completed: 0, cancelled: 0 };
  }
}
