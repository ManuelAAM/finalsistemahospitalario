import { getUserByCedula, createPasswordResetToken, validatePasswordResetToken, resetPasswordWithToken } from './database';

// Simulación de hash (Coincide con database.js)
const hashPassword = (pwd) => `hash_${pwd}`;

export async function login(cedula, password) {
  try {
    const cedulaTrimmed = cedula.trim();
    const passwordTrimmed = password.trim();
    
    console.log('===== DEBUG LOGIN =====' );
    console.log(`Cedula: "${cedulaTrimmed}" (length: ${cedulaTrimmed.length})`);
    console.log(`Password: "${passwordTrimmed}" (length: ${passwordTrimmed.length})`);
    
    // Consulta a la BD
    const user = await getUserByCedula(cedulaTrimmed);
    
    if (!user) {
      console.error(`User not found for: "${cedulaTrimmed}"`);
      throw new Error('Cédula no encontrada en el sistema.');
    }

    console.log(`Found user: ${user.username} (${user.license_number})`);

    // Calcular el hash esperado
    const expectedHash = user.password_hash;
    const inputHash = hashPassword(passwordTrimmed);

    console.log(`Expected: "${expectedHash}"`);
    console.log(`Input:    "${inputHash}"`);
    console.log(`Match: ${expectedHash === inputHash ? 'YES' : 'NO'}`);

    if (expectedHash !== inputHash) {
      console.warn('Hash mismatch error');
      throw new Error('Contraseña incorrecta.');
    }

    // Procesar datos de turno si existen
    let shiftData = null;
    try {
        if (user.assigned_shifts && typeof user.assigned_shifts === 'string') {
            shiftData = JSON.parse(user.assigned_shifts);
        }
    } catch (e) {
        console.warn('⚠️ Error parsing shift data', e);
    }

    console.log("✅ Login Successful!");
         return {
        id: user.id,
        username: user.username,
        name: user.name,
    };

  } catch (error) {
    console.error('🔥 Auth Error:', error);
    throw error;
  }
}

export async function recoverPassword(cedula) {
  const user = await getUserByCedula(cedula);
  if (!user) {
    throw new Error('No existe usuario con esa cédula.');
  }
  return `Se ha enviado un enlace de recuperación al correo asociado: ${user.email}`;
}

/**
 * Solicita recuperación de contraseña usando cédula profesional
 * Genera un token de un solo uso y envía email (simulado)
 * @param {string} licenseNumber - Cédula profesional del enfermero
 * @param {string} ipAddress - IP del cliente (opcional)
 * @returns {Promise<Object>} Información del token y usuario
 */
export async function requestPasswordRecovery(licenseNumber, ipAddress = null) {
  try {
    const cedulaTrimmed = licenseNumber.trim();
    
    console.log('===== PASSWORD RECOVERY REQUEST =====');
    console.log(`License Number: "${cedulaTrimmed}"`);
    
    // Crear token de recuperación (ya valida la cédula internamente)
    const tokenData = await createPasswordResetToken(cedulaTrimmed, ipAddress);
    
    console.log(`✅ Token generado para: ${tokenData.username}`);
    console.log(`📧 Email simulado enviado a: ${tokenData.email}`);
    console.log(`🔐 Token: ${tokenData.token.substring(0, 10)}...`);
    console.log(`⏰ Expira: ${new Date(tokenData.expiresAt).toLocaleString('es-MX')}`);
    
    // En producción, aquí se enviaría el correo real
    // await sendPasswordResetEmail(tokenData.email, tokenData.token, tokenData.name);
    
    return {
      success: true,
      username: tokenData.username,
      name: tokenData.name,
      email: tokenData.email,
      token: tokenData.token, // En producción NO enviar al frontend
      expiresAt: tokenData.expiresAt,
      message: `Se ha enviado un correo de recuperación a ${maskEmail(tokenData.email)}`
    };
  } catch (error) {
    console.error('🔥 Password Recovery Error:', error);
    throw error;
  }
}

/**
 * Valida un token de recuperación
 * @param {string} token - Token a validar
 * @returns {Promise<Object>} Información del usuario si es válido
 */
export async function verifyResetToken(token) {
  try {
    console.log('🔍 Validando token de recuperación...');
    
    const validation = await validatePasswordResetToken(token);
    
    console.log(`✅ Token válido para: ${validation.username}`);
    
    return {
      valid: true,
      username: validation.username,
      email: maskEmail(validation.email)
    };
  } catch (error) {
    console.error('❌ Token inválido:', error);
    throw error;
  }
}

/**
 * Restablece contraseña usando token válido
 * @param {string} token - Token de recuperación
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function resetPassword(token, newPassword) {
  try {
    console.log('🔐 Restableciendo contraseña...');
    
    // Validar complejidad de contraseña
    if (newPassword.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    
    const result = await resetPasswordWithToken(token, newPassword);
    
    console.log('✅ Contraseña actualizada correctamente');
    
    return result;
  } catch (error) {
    console.error('❌ Error restableciendo contraseña:', error);
    throw error;
  }
}

/**
 * Enmascara un email para mostrar parcialmente
 * ejemplo@dominio.com -> e****o@d*****.com
 */
function maskEmail(email) {
  if (!email) return '';
  
  const [localPart, domain] = email.split('@');
  
  const maskedLocal = localPart.charAt(0) + 
    '*'.repeat(Math.max(localPart.length - 2, 0)) + 
    (localPart.length > 1 ? localPart.charAt(localPart.length - 1) : '');
  
  const [domainName, extension] = domain.split('.');
  const maskedDomain = domainName.charAt(0) + 
    '*'.repeat(Math.max(domainName.length - 2, 0)) + 
    (domainName.length > 1 ? domainName.charAt(domainName.length - 1) : '');
  
  return `${maskedLocal}@${maskedDomain}.${extension}`;
}
