import React, { useState } from 'react';
import { AlertCircle, Clock, Activity, CheckCircle, Info } from 'lucide-react';
import { TRIAGE_LEVELS, getTriageInfo, getTriageStyle } from '../utils/triageValidation';

/**
 * 🚨 COMPONENTE: Selector de Nivel de Triaje
 * 
 * Permite seleccionar el nivel de urgencia del paciente de manera visual
 * e intuitiva usando el sistema de colores estándar de triaje.
 */

const TriageSelector = ({ value, onChange, required = false, disabled = false }) => {
  const [showInfo, setShowInfo] = useState(null);

  const handleSelect = (code) => {
    if (!disabled) {
      onChange(code);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold text-gray-700">
        Clasificación de Triaje {required && <span className="text-red-500">*</span>}
      </label>

      {required && !value && (
        <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
          <p className="text-xs font-bold text-red-800">
            🚨 Campo obligatorio - Debe clasificar al paciente según nivel de urgencia
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {Object.entries(TRIAGE_LEVELS).map(([code, info]) => {
          const isSelected = value === code;
          
          return (
            <div key={code} className="relative">
              <button
                type="button"
                onClick={() => handleSelect(code)}
                onMouseEnter={() => setShowInfo(code)}
                onMouseLeave={() => setShowInfo(null)}
                disabled={disabled}
                className={`
                  w-full p-4 rounded-xl border-2 transition-all duration-200
                  ${isSelected 
                    ? `${info.bgColor} border-4 ring-2 ring-offset-2 shadow-lg scale-105` 
                    : `bg-white border-gray-200 hover:border-gray-400 hover:shadow-md`}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                style={{
                  borderColor: isSelected ? info.color : undefined
                }}
              >
                <div className="text-center space-y-2">
                  <div className="text-4xl">{info.icon}</div>
                  <div className={`font-bold text-sm ${isSelected ? info.textColor : 'text-gray-700'}`}>
                    {info.name}
                  </div>
                  <div className={`text-xs ${isSelected ? info.textColor : 'text-gray-500'}`}>
                    Nivel {info.level}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                    <Clock size={12} />
                    {info.timeLimit}
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
                    <CheckCircle size={16} />
                  </div>
                )}
              </button>

              {/* Tooltip con información */}
              {showInfo === code && (
                <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                  <div className="font-bold mb-1">{info.description}</div>
                  <div className="text-gray-300 text-xs">
                    Ejemplos: {info.examples.slice(0, 2).join(', ')}
                  </div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                    <div className="border-8 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {value && (
        <TriageInfoPanel triageCode={value} />
      )}
    </div>
  );
};

/**
 * Panel informativo del nivel de triaje seleccionado
 */
const TriageInfoPanel = ({ triageCode }) => {
  const info = getTriageInfo(triageCode);
  
  if (!info) return null;

  return (
    <div 
      className="p-4 rounded-xl border-2"
      style={{
        backgroundColor: info.bgColor,
        borderColor: info.color
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{info.icon}</div>
        <div className="flex-1">
          <h4 className={`font-bold ${info.textColor} mb-1`}>
            Nivel {info.level}: {info.name}
          </h4>
          <p className="text-sm text-gray-700 mb-2">{info.description}</p>
          
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
            <Clock size={14} />
            <span className="font-bold">Tiempo de atención:</span>
            <span>{info.timeLimit}</span>
          </div>

          <div className="mt-3 space-y-1">
            <p className="text-xs font-bold text-gray-700">Ejemplos de casos:</p>
            <ul className="text-xs text-gray-600 list-disc list-inside space-y-0.5">
              {info.examples.map((example, idx) => (
                <li key={idx}>{example}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Badge compacto de triaje para mostrar en listas
 */
export const TriageBadge = ({ triageCode, showTime = false, className = '' }) => {
  const info = getTriageInfo(triageCode);
  
  if (!info) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300 ${className}`}>
        ⚪ Sin Clasificar
      </span>
    );
  }

  const pulseClass = info.level <= 2 ? 'animate-pulse' : '';

  return (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border-2 ${pulseClass} ${className}`}
      style={{
        backgroundColor: info.bgColor,
        color: info.textColor,
        borderColor: info.color
      }}
    >
      <span>{info.icon}</span>
      <span>{info.name}</span>
      {showTime && (
        <>
          <span className="mx-1">•</span>
          <Clock size={12} />
          <span>{info.timeLimit}</span>
        </>
      )}
    </span>
  );
};

/**
 * Indicador visual de prioridad de triaje
 */
export const TriagePriorityIndicator = ({ triageCode, size = 'md' }) => {
  const info = getTriageInfo(triageCode);
  
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const sizeClass = sizes[size] || sizes.md;
  const pulseClass = info?.level <= 2 ? 'animate-pulse' : '';

  return (
    <div 
      className={`rounded-full ${sizeClass} ${pulseClass} border-2 border-white shadow-md`}
      style={{ backgroundColor: info?.color || '#9CA3AF' }}
      title={info?.name || 'Sin Clasificar'}
    />
  );
};

/**
 * Formulario completo de evaluación de triaje
 */
export const TriageEvaluationForm = ({ 
  onSubmit, 
  evaluatorName,
  initialData = {} 
}) => {
  const [formData, setFormData] = useState({
    level: initialData.level || '',
    symptoms: initialData.symptoms || '',
    vitalSigns: initialData.vitalSigns || '',
    consciousness: initialData.consciousness || 'alert',
    breathing: initialData.breathing || 'normal',
    painLevel: initialData.painLevel || 0
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.level) {
      setError('Debe seleccionar un nivel de triaje');
      return;
    }

    if (!formData.symptoms || formData.symptoms.trim().length < 10) {
      setError('Debe describir los síntomas principales (mínimo 10 caracteres)');
      return;
    }

    onSubmit({
      ...formData,
      evaluatedBy: evaluatorName,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selector de Triaje */}
      <TriageSelector
        value={formData.level}
        onChange={(level) => setFormData({ ...formData, level })}
        required
      />

      {/* Síntomas Principales */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Síntomas Principales <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.symptoms}
          onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
          placeholder="Describa los síntomas que presenta el paciente..."
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
          rows={4}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.symptoms.length} caracteres
        </p>
      </div>

      {/* Estado de Conciencia */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Estado de Conciencia
        </label>
        <select
          value={formData.consciousness}
          onChange={(e) => setFormData({ ...formData, consciousness: e.target.value })}
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
        >
          <option value="alert">Alerta y orientado</option>
          <option value="drowsy">Somnoliento</option>
          <option value="confused">Confuso/desorientado</option>
          <option value="unresponsive">No responde</option>
        </select>
      </div>

      {/* Respiración */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Patrón Respiratorio
        </label>
        <select
          value={formData.breathing}
          onChange={(e) => setFormData({ ...formData, breathing: e.target.value })}
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
        >
          <option value="normal">Normal</option>
          <option value="tachypnea">Taquipnea (rápida)</option>
          <option value="dyspnea">Disnea (dificultad)</option>
          <option value="apnea">Apnea (pausas)</option>
        </select>
      </div>

      {/* Nivel de Dolor */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Nivel de Dolor (0-10)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="10"
            value={formData.painLevel}
            onChange={(e) => setFormData({ ...formData, painLevel: parseInt(e.target.value) })}
            className="flex-1"
          />
          <span className={`text-2xl font-bold ${
            formData.painLevel >= 7 ? 'text-red-600' :
            formData.painLevel >= 4 ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {formData.painLevel}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Sin dolor</span>
          <span>Dolor moderado</span>
          <span>Dolor severo</span>
        </div>
      </div>

      {/* Signos Vitales */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Signos Vitales (Opcional)
        </label>
        <textarea
          value={formData.vitalSigns}
          onChange={(e) => setFormData({ ...formData, vitalSigns: e.target.value })}
          placeholder="PA: 120/80, FC: 75, FR: 18, T: 36.5°C, SpO2: 98%"
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none resize-none"
          rows={2}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
        >
          <Activity size={20} />
          Guardar Evaluación de Triaje
        </button>
      </div>
    </form>
  );
};

export default TriageSelector;
