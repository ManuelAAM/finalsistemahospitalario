import React from 'react';
import { AlertCircle, Lock } from 'lucide-react';
import { getTriageInfo, getTriageStyle } from '../utils/triageValidation';

/**
 * 🚨 COMPONENTE: Mostrador de Triaje (Solo Lectura)
 * 
 * Muestra el nivel de triaje asignado al paciente
 * SIN permitir edición (es inmutable según NOM-004)
 */
export function TriageDisplay({ level, timestamp = null, evaluatedBy = null, symptoms = null }) {
  if (!level) {
    return (
      <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
        <p className="text-gray-600 text-sm">Triaje no asignado</p>
      </div>
    );
  }

  const info = getTriageInfo(level);
  const style = getTriageStyle(level);

  return (
    <div className={`p-6 rounded-lg border-2 ${style.border} ${style.bg}`}>
      {/* Lock icon para indicar que no se puede editar */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="text-4xl">{info.emoji}</div>
          <div>
            <h3 className={`text-2xl font-bold ${style.text}`}>{info.name}</h3>
            <p className={`text-sm ${style.text} opacity-75`}>
              Nivel {info.level} - {info.priority}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
          <Lock size={14} className="text-gray-600" />
          <span className="text-xs font-semibold text-gray-700">Inmutable</span>
        </div>
      </div>

      {/* Descripción */}
      <div className="mb-4 p-3 bg-white bg-opacity-50 rounded-lg">
        <p className="text-sm text-gray-700">{info.description}</p>
      </div>

      {/* Información de evaluación */}
      {(evaluatedBy || timestamp) && (
        <div className="grid grid-cols-2 gap-3 p-3 bg-white bg-opacity-50 rounded-lg text-sm mb-4 border-t-2 border-white border-opacity-50">
          {evaluatedBy && (
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase">Evaluado por</p>
              <p className="font-semibold text-gray-800">{evaluatedBy}</p>
            </div>
          )}
          {timestamp && (
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase">Fecha de Evaluación</p>
              <p className="font-semibold text-gray-800">
                {new Date(timestamp).toLocaleDateString('es-MX')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Síntomas (si existen) */}
      {symptoms && (
        <div className="p-3 bg-white bg-opacity-50 rounded-lg mb-4">
          <p className="text-xs font-bold text-gray-600 mb-1 uppercase">Síntomas Reportados</p>
          <p className="text-sm text-gray-800">{symptoms}</p>
        </div>
      )}

      {/* Tiempo de atención esperado */}
      <div className="flex items-center gap-2 p-3 bg-white bg-opacity-50 rounded-lg border-l-4" style={{ borderColor: info.color }}>
        <div className="text-sm">
          <p className="text-xs font-bold text-gray-600">Tiempo de atención esperado</p>
          <p className="font-bold text-gray-800">{info.timeLimit}</p>
        </div>
      </div>

      {/* Nota de cumplimiento */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
        <AlertCircle size={16} className="text-yellow-700 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-800">
          <strong>NOM-004:</strong> El triaje es immutable una vez asignado. 
          Representa la evaluación inicial del paciente y se mantiene en el expediente clínico como registro permanente.
        </p>
      </div>
    </div>
  );
}

export default TriageDisplay;
