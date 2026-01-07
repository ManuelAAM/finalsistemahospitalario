import React, { useState } from 'react';
import { Activity, User, Lock, AlertCircle, ArrowRight, Key, Copy, Check } from 'lucide-react';
import { login as authLogin } from '../services/auth';
import { recordLoginAttempt, isAccountLocked } from '../services/database';
import { formatMessage } from '../utils/systemMessages';
import PasswordRecoveryForm from './PasswordRecoveryForm';

export default function LoginForm({ onLoginSuccess }) {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lockedAccount, setLockedAccount] = useState(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setLockedAccount(null);

    try {
      // Verificar si la cuenta está bloqueada
      const lockoutRecord = await isAccountLocked(cedula);
      if (lockoutRecord) {
        setLockedAccount(lockoutRecord);
        setIsLoading(false);
        return;
      }

      // Intenta hacer login
      const user = await authLogin(cedula, password);
      
      // Registra intento exitoso (usa username del usuario encontrado)
      await recordLoginAttempt(user.username, true, 'web-app');
      
      onLoginSuccess(user);
    } catch (err) {
      console.error(err);
      let msg = 'Error al iniciar sesión.';
      
      // Detectar tipo de error
      if (err.message.includes('not found') || err.message.includes('no existe')) {
        msg = '❌ La cédula no está registrada.';
      } else if (err.message.includes('password') || err.message.includes('contraseña')) {
        msg = '❌ Contraseña incorrecta.';
      } else if (err.message.includes('locked')) {
        msg = '🔒 Cuenta bloqueada por seguridad.';
      }

      setError(msg);
      // Si pasaste la prop notify desde App.jsx:
      if (notify) notify(msg, 'error');
      
      setIsLoading(false);
    }
  };

  const copyPassword = () => {
    if (lockedAccount?.temporary_password) {
      navigator.clipboard.writeText(lockedAccount.temporary_password);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-hospital-50 p-4 z-50">
      {/* Modal: Cuenta Bloqueada */}
      {lockedAccount && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border-2 border-red-200 animate-scaleIn">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-4 rounded-full">
                <Lock className="text-red-600" size={40} />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center text-red-600 mb-3">
              {formatMessage('MSG_10').split(',')[0]}
            </h2>
            
            <p className="text-center text-hospital-600 mb-6 text-sm">
              {formatMessage('MSG_10')}
              <br /><br />
              Use la contraseña temporal para acceder.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <label className="block text-xs font-bold text-blue-700 uppercase mb-2 ml-1">
                Contraseña Temporal
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={lockedAccount.temporary_password}
                  readOnly
                  className="flex-1 px-4 py-3 bg-white border border-blue-300 rounded-lg font-mono font-bold text-blue-900"
                />
                <button
                  type="button"
                  onClick={copyPassword}
                  className="p-3 bg-clinical-primary text-white rounded-lg hover:bg-clinical-dark transition"
                >
                  {copiedPassword ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                ⏱️ Válida por 24 horas. Se requiere cambio de contraseña al acceder.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-yellow-800">
                <span className="font-bold">Pasos:</span>
                <ol className="list-decimal ml-4 mt-1 space-y-1">
                  <li>Ingrese su cédula y la contraseña temporal</li>
                  <li>Se le pedirá que cambie la contraseña inmediatamente</li>
                  <li>Configure una nueva contraseña fuerte</li>
                </ol>
              </p>
            </div>

            <button
              onClick={() => setLockedAccount(null)}
              className="w-full py-3 bg-clinical-primary text-white rounded-xl font-bold hover:bg-clinical-dark transition"
            >
              Entendido - Intentar Acceso
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl grid md:grid-cols-5 overflow-hidden border border-hospital-100 animate-scaleIn">
        
        {/* Lado Izquierdo (Branding) */}
        <div className="hidden md:flex md:col-span-2 bg-gradient-to-br from-clinical-primary to-clinical-dark p-10 flex-col justify-between text-white relative">
          <Activity size={100} className="absolute -top-5 -right-5 opacity-10" />
          <div>
            <h1 className="text-3xl font-black leading-tight mb-2">Hospital<br/>San Rafael</h1>
            <p className="text-blue-100 font-medium">Gestión de Enfermería</p>
          </div>
          <div className="text-xs text-blue-200 space-y-1">
            <p>• Cumplimiento NOM-004</p>
            <p>• Acceso Seguro SSL</p>
            <p>v2.5.0 Enterprise</p>
          </div>
        </div>

        {/* Lado Derecho (Formulario) */}
        <div className="md:col-span-3 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-hospital-800 mb-6">Iniciar Sesión</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100 animate-pulse">
              <AlertCircle size={20}/> <span className="font-bold text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-hospital-500 uppercase mb-2 ml-1">Cédula Profesional</label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 text-hospital-400 group-focus-within:text-clinical-primary transition-colors" size={20} />
                <input
                  type="text"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-hospital-50 border border-hospital-200 rounded-xl focus:bg-white focus:border-clinical-primary focus:ring-4 focus:ring-blue-50 outline-none font-bold text-hospital-800 transition-all placeholder:font-normal placeholder:text-hospital-300"
                  placeholder="Ej. ENF-12345"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-hospital-500 uppercase mb-2 ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-hospital-400 group-focus-within:text-clinical-primary transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-hospital-50 border border-hospital-200 rounded-xl focus:bg-white focus:border-clinical-primary focus:ring-4 focus:ring-blue-50 outline-none font-bold text-hospital-800 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-4 bg-clinical-primary text-white rounded-xl font-bold hover:bg-clinical-dark transition shadow-xl shadow-blue-200/50 flex justify-center items-center gap-2 disabled:opacity-70 mt-2">
              {isLoading ? 'Verificando...' : <>Acceder al Sistema <ArrowRight size={20}/></>}
            </button>
          </form>

          {/* Enlace de recuperación de contraseña */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowRecoveryForm(true)}
              className="text-clinical-primary hover:text-clinical-dark font-bold text-sm transition-colors inline-flex items-center gap-1.5"
            >
              <Key size={14} />
              ¿Olvidó su contraseña?
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-hospital-100 text-center">
            <p className="text-hospital-400 text-xs mb-3 font-bold">Credenciales de Prueba:</p>
            <div className="space-y-2">
              <div className="inline-block bg-hospital-50 px-4 py-2 rounded-lg border border-hospital-200 text-xs text-hospital-600 font-mono">
                Cédula: <b>ENF-12345</b> | Contraseña: <b>Enfermero123</b>
              </div>
              <div className="inline-block bg-hospital-50 px-4 py-2 rounded-lg border border-hospital-200 text-xs text-hospital-600 font-mono ml-2">
                Cédula: <b>ENF-67890</b> | Contraseña: <b>Enfermero456</b>
              </div>
            </div>
            <p className="text-hospital-400 text-xs mt-3 italic">
              💡 Para recuperación: Use las cédulas ENF-12345, ENF-67890 o ENF-11223
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Recuperación de Contraseña */}
      {showRecoveryForm && (
        <PasswordRecoveryForm
          onBack={() => setShowRecoveryForm(false)}
          onRecoverySuccess={() => {
            setShowRecoveryForm(false);
            setError('');
          }}
        />
      )}
    </div>
  );
}
