/**
 * Validación de Contraseñas - RT-02
 * Requisitos de seguridad:
 * - Más de 6 caracteres
 * - Al menos 1 mayúscula
 * - Al menos 1 minúscula
 * - Al menos 1 número
 */

/**
 * Valida que una contraseña cumpla con los requisitos de seguridad
 * @param {string} password - Contraseña a validar
 * @returns {Object} Resultado de validación con detalles
 */
export function validatePassword(password) {
  const validations = {
    minLength: password.length > 6,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const isValid = Object.values(validations).every(v => v);

  return {
    isValid,
    validations,
    errors: getPasswordErrors(validations)
  };
}

/**
 * Obtiene los mensajes de error basados en las validaciones fallidas
 * @param {Object} validations - Objeto con resultados de validaciones
 * @returns {string[]} Array de mensajes de error
 */
function getPasswordErrors(validations) {
  const errors = [];
  
  if (!validations.minLength) {
    errors.push('La contraseña debe tener más de 6 caracteres');
  }
  if (!validations.hasUpperCase) {
    errors.push('Debe incluir al menos una letra mayúscula');
  }
  if (!validations.hasLowerCase) {
    errors.push('Debe incluir al menos una letra minúscula');
  }
  if (!validations.hasNumber) {
    errors.push('Debe incluir al menos un número');
  }
  
  return errors;
}

/**
 * Calcula la fortaleza de la contraseña en una escala de 0-100
 * @param {string} password - Contraseña a evaluar
 * @returns {Object} Fortaleza y nivel
 */
export function getPasswordStrength(password) {
  let strength = 0;
  
  // Longitud
  if (password.length > 6) strength += 20;
  if (password.length > 8) strength += 10;
  if (password.length > 12) strength += 10;
  
  // Caracteres
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/\d/.test(password)) strength += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 15;
  
  // Nivel
  let level = 'muy-debil';
  let color = 'red';
  
  if (strength >= 80) {
    level = 'fuerte';
    color = 'green';
  } else if (strength >= 60) {
    level = 'buena';
    color = 'blue';
  } else if (strength >= 40) {
    level = 'regular';
    color = 'yellow';
  } else if (strength >= 20) {
    level = 'debil';
    color = 'orange';
  }
  
  return { strength, level, color };
}

/**
 * Formatea los requisitos de contraseña para mostrar al usuario
 * @returns {Array} Array de requisitos con descripción
 */
export function getPasswordRequirements() {
  return [
    { id: 'minLength', label: 'Más de 6 caracteres', regex: /.{7,}/ },
    { id: 'hasUpperCase', label: 'Al menos 1 mayúscula (A-Z)', regex: /[A-Z]/ },
    { id: 'hasLowerCase', label: 'Al menos 1 minúscula (a-z)', regex: /[a-z]/ },
    { id: 'hasNumber', label: 'Al menos 1 número (0-9)', regex: /\d/ },
  ];
}

export default {
  validatePassword,
  getPasswordStrength,
  getPasswordRequirements
};
