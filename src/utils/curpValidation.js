/**
 * Utilidad de Validación de CURP (Clave Única de Registro de Población)
 * Previene duplicidad de expedientes médicos
 */

/**
 * Valida el formato de una CURP mexicana
 * Formato: 18 caracteres alfanuméricos
 * Ejemplo: PEXJ791015HDFRXN01
 * 
 * Estructura:
 * - Posiciones 1-4: Apellido paterno (1 letra) + Apellido materno (1 letra) + Nombre (2 letras)
 * - Posiciones 5-10: Fecha de nacimiento (AAMMDD)
 * - Posición 11: Sexo (H/M)
 * - Posiciones 12-13: Estado de nacimiento (2 letras)
 * - Posiciones 14-16: Primera consonante interna de apellidos y nombre
 * - Posiciones 17-18: Homoclave (2 dígitos/letras)
 * 
 * @param {string} curp - CURP a validar
 * @returns {Object} { isValid: boolean, errors: string[], normalized: string }
 */
export function validateCURP(curp) {
  const errors = [];
  let normalized = '';

  // Normalizar: convertir a mayúsculas y eliminar espacios
  if (typeof curp !== 'string') {
    return { isValid: false, errors: ['CURP debe ser una cadena de texto'], normalized: '' };
  }

  normalized = curp.trim().toUpperCase();

  // 1. Longitud exacta de 18 caracteres
  if (normalized.length !== 18) {
    errors.push(`CURP debe tener exactamente 18 caracteres (tiene ${normalized.length})`);
  }

  // 2. Formato alfanumérico (letras y números)
  const formatoValido = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]{2}$/;
  if (!formatoValido.test(normalized)) {
    errors.push('Formato de CURP inválido. Debe seguir el patrón: 4 letras + 6 dígitos + H/M + 5 letras + 2 alfanuméricos');
  }

  // 3. Validar fecha de nacimiento (posiciones 5-10: AAMMDD)
  if (normalized.length >= 10) {
    const año = parseInt(normalized.substring(4, 6), 10);
    const mes = parseInt(normalized.substring(6, 8), 10);
    const dia = parseInt(normalized.substring(8, 10), 10);

    // Validar mes (01-12)
    if (mes < 1 || mes > 12) {
      errors.push(`Mes inválido en CURP: ${mes.toString().padStart(2, '0')} (debe ser 01-12)`);
    }

    // Validar día (01-31)
    if (dia < 1 || dia > 31) {
      errors.push(`Día inválido en CURP: ${dia.toString().padStart(2, '0')} (debe ser 01-31)`);
    }

    // Validación básica de días por mes
    const diasPorMes = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (mes >= 1 && mes <= 12 && dia > diasPorMes[mes - 1]) {
      errors.push(`Día ${dia} inválido para el mes ${mes.toString().padStart(2, '0')}`);
    }
  }

  // 4. Validar sexo (posición 11: H o M)
  if (normalized.length >= 11) {
    const sexo = normalized.charAt(10);
    if (sexo !== 'H' && sexo !== 'M') {
      errors.push(`Sexo inválido en CURP: ${sexo} (debe ser H o M)`);
    }
  }

  // 5. Validar entidad federativa (posiciones 12-13)
  const entidadesValidas = [
    'AS', 'BC', 'BS', 'CC', 'CL', 'CM', 'CS', 'CH', 'DF', 'DG',
    'GT', 'GR', 'HG', 'JC', 'MC', 'MN', 'MS', 'NT', 'NL', 'OC',
    'PL', 'QT', 'QR', 'SP', 'SL', 'SR', 'TC', 'TS', 'TL', 'VZ',
    'YN', 'ZS', 'NE' // NE = Nacido en el Extranjero
  ];

  if (normalized.length >= 13) {
    const entidad = normalized.substring(11, 13);
    if (!entidadesValidas.includes(entidad)) {
      errors.push(`Estado inválido en CURP: ${entidad}. Debe ser una clave de entidad federativa válida`);
    }
  }

  // 6. Validar caracteres prohibidos (letras inconvenientes)
  const palabrasInconvenientes = ['BACA', 'BAKA', 'BUEI', 'BUEY', 'CACA', 'CACO', 
    'CAGA', 'CAGO', 'CAKA', 'CAKO', 'COGE', 'COGI', 'COJA', 'COJE', 'COJI', 
    'COJO', 'COLA', 'CULO', 'FALO', 'FETO', 'GETA', 'GUEI', 'GUEY', 'JOTO', 
    'KACA', 'KACO', 'KAGA', 'KAGO', 'KAKA', 'KAKO', 'KOGE', 'KOGI', 'KOJA', 
    'KOJE', 'KOJI', 'KOJO', 'KOLA', 'KULO', 'LILO', 'LOCA', 'LOCO', 'LOKA', 
    'LOKO', 'MAME', 'MAMO', 'MEAR', 'MEAS', 'MEON', 'MIAR', 'MION', 'MOCO', 
    'MOKO', 'MULA', 'MULO', 'NACA', 'NACO', 'PEDA', 'PEDO', 'PENE', 'PIPI', 
    'PITO', 'POPO', 'PUTA', 'PUTO', 'QULO', 'RATA', 'ROBA', 'ROBE', 'ROBO', 
    'RUIN', 'SENO', 'TETA', 'VACA', 'VAGA', 'VAGO', 'VAKA', 'VUEI', 'VUEY', 
    'WUEI', 'WUEY'];
  
  const primerosCuatro = normalized.substring(0, 4);
  if (palabrasInconvenientes.includes(primerosCuatro)) {
    errors.push(`Las primeras 4 letras forman una palabra inconveniente: ${primerosCuatro}`);
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    normalized: normalized
  };
}

/**
 * Verifica si un CURP ya existe en la base de datos
 * @param {string} curp - CURP a verificar
 * @returns {Promise<boolean>} true si el CURP ya existe
 */
export async function checkCURPExists(curp) {
  try {
    const { getDb } = await import('../services/database.js');
    const db = getDb();
    
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }

    const normalized = curp.trim().toUpperCase();
    const result = await db.select(
      'SELECT COUNT(*) as count FROM patients WHERE curp = ?',
      [normalized]
    );

    return result[0].count > 0;
  } catch (error) {
    console.error('Error verificando CURP:', error);
    throw error;
  }
}

/**
 * Extrae información básica del CURP
 * @param {string} curp - CURP válido
 * @returns {Object} Información extraída (fecha nacimiento, sexo, estado)
 */
export function extractCURPInfo(curp) {
  const validation = validateCURP(curp);
  
  if (!validation.isValid) {
    return null;
  }

  const normalized = validation.normalized;

  // Extraer año (asumiendo años 1900-2099)
  let año = parseInt(normalized.substring(4, 6), 10);
  año = año <= 26 ? 2000 + año : 1900 + año; // Si es <= 26, es del 2000+

  const mes = parseInt(normalized.substring(6, 8), 10);
  const dia = parseInt(normalized.substring(8, 10), 10);
  const sexo = normalized.charAt(10) === 'H' ? 'Masculino' : 'Femenino';
  const estado = normalized.substring(11, 13);

  const estadosNombres = {
    'AS': 'Aguascalientes', 'BC': 'Baja California', 'BS': 'Baja California Sur',
    'CC': 'Campeche', 'CL': 'Coahuila', 'CM': 'Colima', 'CS': 'Chiapas',
    'CH': 'Chihuahua', 'DF': 'Ciudad de México', 'DG': 'Durango',
    'GT': 'Guanajuato', 'GR': 'Guerrero', 'HG': 'Hidalgo', 'JC': 'Jalisco',
    'MC': 'Estado de México', 'MN': 'Michoacán', 'MS': 'Morelos',
    'NT': 'Nayarit', 'NL': 'Nuevo León', 'OC': 'Oaxaca', 'PL': 'Puebla',
    'QT': 'Querétaro', 'QR': 'Quintana Roo', 'SP': 'San Luis Potosí',
    'SL': 'Sinaloa', 'SR': 'Sonora', 'TC': 'Tabasco', 'TS': 'Tamaulipas',
    'TL': 'Tlaxcala', 'VZ': 'Veracruz', 'YN': 'Yucatán', 'ZS': 'Zacatecas',
    'NE': 'Nacido en el Extranjero'
  };

  return {
    fechaNacimiento: `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${año}`,
    año: año,
    mes: mes,
    dia: dia,
    sexo: sexo,
    estado: estado,
    estadoNombre: estadosNombres[estado] || estado,
    edad: calcularEdad(año, mes, dia)
  };
}

/**
 * Calcula la edad actual a partir de una fecha de nacimiento
 */
function calcularEdad(año, mes, dia) {
  const hoy = new Date();
  const nacimiento = new Date(año, mes - 1, dia);
  
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mesActual = hoy.getMonth() + 1;
  const diaActual = hoy.getDate();
  
  // Ajustar si aún no ha cumplido años este año
  if (mesActual < mes || (mesActual === mes && diaActual < dia)) {
    edad--;
  }
  
  return edad;
}

/**
 * Formatea un CURP para mostrar (con guiones para legibilidad)
 * Ejemplo: PEXJ791015HDFRXN01 → PEXJ-791015-H-DFRXN-01
 */
export function formatCURP(curp) {
  const validation = validateCURP(curp);
  
  if (!validation.isValid) {
    return curp; // Devolver sin formatear si es inválido
  }

  const normalized = validation.normalized;
  return `${normalized.substring(0, 4)}-${normalized.substring(4, 10)}-${normalized.charAt(10)}-${normalized.substring(11, 16)}-${normalized.substring(16, 18)}`;
}

/**
 * Genera un mensaje de error amigable para el usuario
 */
export function getCURPErrorMessage(validation) {
  if (validation.isValid) {
    return '';
  }

  if (validation.errors.length === 0) {
    return 'CURP inválido';
  }

  return '❌ CURP inválido:\n' + validation.errors.map(e => `  • ${e}`).join('\n');
}
