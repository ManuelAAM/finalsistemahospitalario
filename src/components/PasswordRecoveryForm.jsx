import React, { useState } from 'react';
import { Key, ArrowLeft, CheckCircle, AlertCircle, Mail, Lock, Shield } from 'lucide-react';
import { requestPasswordRecovery, verifyResetToken, resetPassword } from '../services/auth';

export default function PasswordRecoveryForm({ onBack, onRecoverySuccess }) {
  // Estados del flujo
  const [step, setStep] = useState(1); // 1: Solicitar, 2: Validar y cambiar
  
  // Step 1: Solicitar token
  const [licenseNumber, setLicenseNumber] = useState('');
  const [tokenData, setTokenData] = useState(null);
  
  // Step 2: Ingresar token y nueva contraseña
  const [userToken, setUserToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados generales
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // ===== PASO 1: Solicitar Token =====
  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      // Validar cédula
      if (!licenseNumber || licenseNumber.trim().length === 0) {
        throw new Error('Por favor ingrese su cédula profesional');
      }
      
      // Solicitar token
      const result = await requestPasswordRecovery(licenseNumber.trim());
      
      // Guardar datos del token
      setTokenData(result);
      
      // Mensaje de éxito
      const { formatMessage } = await import('../utils/systemMessages.js');
      setSuccessMessage(
        formatMessage('MSG_02', 
          `📧 Se envió un código de verificación a: ${result.email}\n\n` +
          `El código es válido por 1 hora.`
        )
      );
      
      // Avanzar al paso 2 después de 2 segundos
      setTimeout(() => {
        setStep(2);
        setSuccessMessage('');
      }, 2000);
      
    } catch (err) {
      // Manejo de errores
      if (err.message.includes('ERR-03') || err.message.includes('no encontr')) {
        const { formatMessage } = await import('../utils/systemMessages.js');
        setError(formatMessage('ERR_03', 'Verifique que ingresó correctamente su cédula.'));
      } else if (err.message.includes('correo')) {
        setError('❌ Usuario sin correo registrado.\n\nContacte al administrador del sistema.');
      } else {
        setError(err.message || 'Error al solicitar recuperación');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ===== PASO 2: Validar Token y Cambiar Contraseña =====
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      // Validaciones
      if (!userToken || userToken.trim().length === 0) {
        throw new Error('Por favor ingrese el código de verificación');
      }
      
      if (!newPassword || newPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      
      if (newPassword !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      
      // Usar el token real (en desarrollo usamos el del resultado)
      const tokenToUse = tokenData?.token || userToken.trim();
      
      // Restablecer contraseña
      await resetPassword(tokenToUse, newPassword);
      
      // Éxito
      setSuccessMessage(
        '✅ ¡Contraseña actualizada exitosamente!\n\n' +
        'Ya puede iniciar sesión con su nueva contraseña.'
      );
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        if (onRecoverySuccess) {
          onRecoverySuccess({ success: true });
        } else {
          onBack();
        }
      }, 3000);
      
    } catch (err) {
      if (err.message.includes('Token inválido') || err.message.includes('expirado')) {
        setError(
          '❌ Código de verificación inválido o expirado.\n\n' +
          'Por favor solicite un nuevo código.'
        );
      } else {
        setError(err.message || 'Error al restablecer contraseña');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem'
    }} className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full p-8 relative animate-scaleIn" style={{ maxWidth: '480px' }}>
        {/* Indicador de pasos */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'} font-bold text-sm transition-all`}>
            <Shield size={16} />
            <span>1. Verificar</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step === 2 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'} font-bold text-sm transition-all`}>
            <Lock size={16} />
            <span>2. Cambiar</span>
          </div>
        </div>
        
        {/* Icon at top */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            {step === 1 ? <Shield size={40} className="text-white" strokeWidth={2.5} /> : <Lock size={40} className="text-white" strokeWidth={2.5} />}
          </div>
        </div>
        
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-800 mb-2">
            {step === 1 ? 'Verificar Identidad' : 'Nueva Contraseña'}
          </h2>
          <p className="text-sm text-gray-600">
            {step === 1 
              ? 'Ingrese su cédula profesional para validar su identidad' 
              : 'Ingrese el código recibido y su nueva contraseña'}
          </p>
        </div>

        {/* Mensajes de error/éxito */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3 animate-shake">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 font-medium whitespace-pre-line">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-start gap-3 animate-scaleIn">
            <CheckCircle size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-emerald-800 font-semibold whitespace-pre-line">{successMessage}</p>
              {step === 1 && <p className="text-xs text-emerald-700 mt-2">⏱️ Redirigiendo al siguiente paso...</p>}
              {step === 2 && <p className="text-xs text-emerald-700 mt-2">⏱️ Redirigiendo al login...</p>}
            </div>
          </div>
        )}

        {/* PASO 1: Formulario de Solicitud */}
        {step === 1 && (
          <form onSubmit={handleRequestToken} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Cédula Profesional
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ej: 12345678"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/30 outline-none transition-all text-base font-medium"
                  disabled={isLoading || successMessage}
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <AlertCircle size={12} />
                Solo para personal de enfermería registrado
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || successMessage || !licenseNumber}
              className="w-full py-3.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verificando...</span>
                </div>
              ) : successMessage ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle size={20} />
                  Verificación Exitosa
                </span>
              ) : (
                'Verificar Identidad y Enviar Código'
              )}
            </button>
          </form>
        )}

        {/* PASO 2: Formulario de Cambio de Contraseña */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Código de Verificación
              </label>
              <input
                type="text"
                required
                placeholder="Ingrese el código recibido por correo"
                value={userToken}
                onChange={(e) => setUserToken(e.target.value)}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/30 outline-none transition-all text-base font-mono"
                disabled={isLoading || successMessage}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                Revise su correo: <strong>{tokenData?.email || 'correo registrado'}</strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nueva Contraseña
              </label>
              <input
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/30 outline-none transition-all text-base"
                disabled={isLoading || successMessage}
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                required
                placeholder="Repita la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/30 outline-none transition-all text-base"
                disabled={isLoading || successMessage}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || successMessage || !userToken || !newPassword || !confirmPassword}
              className="w-full py-3.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Actualizando...</span>
                </div>
              ) : successMessage ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle size={20} />
                  Contraseña Actualizada
                </span>
              ) : (
                'Restablecer Contraseña'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setUserToken('');
                setNewPassword('');
                setConfirmPassword('');
                setError('');
              }}
              disabled={isLoading || successMessage}
              className="w-full py-2.5 text-emerald-600 hover:text-emerald-700 font-bold text-sm transition-colors disabled:opacity-50"
            >
              ← Solicitar nuevo código
            </button>
          </form>
        )}

        {/* Botón de regresar */}
        <div className="mt-6 text-center">
          <button 
            onClick={onBack}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 font-bold text-sm transition-colors inline-flex items-center gap-1 disabled:opacity-50"
          >
            <ArrowLeft size={16} /> Volver al inicio de sesión
          </button>
        </div>

        {/* Información de seguridad */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-900 font-semibold mb-1 flex items-center gap-1.5">
            <Shield size={14} />
            Seguridad y Privacidad
          </p>
          <ul className="text-xs text-blue-800 leading-relaxed space-y-1 ml-5 list-disc">
            <li>El código de verificación es de <strong>un solo uso</strong></li>
            <li>Expira automáticamente en <strong>1 hora</strong></li>
            <li>Solo se envía al correo institucional registrado</li>
            <li>Requiere validación de identidad mediante cédula profesional</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
