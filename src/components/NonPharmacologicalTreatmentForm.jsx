import React, { useState, useCallback, useEffect, memo } from 'react';
import { AlertCircle, Save, Plus, Eye, Clock, FileText, Activity } from 'lucide-react';
import {
  addNonPharmacologicalTreatment,
  getNonPharmacologicalTreatmentsByPatientId,
  updateNonPharmacologicalTreatment
} from '../services/database';

/**
 * FORMULARIO DE TRATAMIENTOS NO FARMACOLÓGICOS
 * Para registrar: curaciones, nebulizaciones, fluidoterapia, drenajes, etc.
 * Cumple con NOM-004 (auditable, no eliminable)
 */
export default memo(function NonPharmacologicalTreatmentForm({ 
  patient, 
  nurse,
  onSuccess 
}) {
  // Estados del formulario
  const [formData, setFormData] = useState({
    treatment_type: 'curation', // curation, nebulization, fluidotherapy, drainage, other
    description: '',
    time_start: new Date().toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
    time_end: ''
  });

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [treatments, setTreatments] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Tipos de tratamiento disponibles
  const treatmentTypes = [
    { value: 'curation', label: '🩹 Curación de heridas', emoji: '🩹' },
    { value: 'nebulization', label: '💨 Nebulización', emoji: '💨' },
    { value: 'fluidotherapy', label: '💧 Fluidoterapia IV', emoji: '💧' },
    { value: 'drainage', label: '🚰 Drenaje', emoji: '🚰' },
    { value: 'catheter_care', label: '📍 Cuidado de catéter', emoji: '📍' },
    { value: 'bed_change', label: '🛏️ Cambio de ropa de cama', emoji: '🛏️' },
    { value: 'hygiene', label: '🧼 Aseo del paciente', emoji: '🧼' },
    { value: 'positioning', label: '↔️ Cambio de posición', emoji: '↔️' },
    { value: 'massage', label: '💆 Masaje terapéutico', emoji: '💆' },
    { value: 'other', label: '📋 Otro tratamiento', emoji: '📋' }
  ];

  // Cargar tratamientos previos al montar
  useEffect(() => {
    loadTreatments();
  }, [patient?.id]);

  const loadTreatments = useCallback(async () => {
    if (!patient?.id) return;
    try {
      const data = await getNonPharmacologicalTreatmentsByPatientId(patient.id);
      setTreatments(data || []);
    } catch (err) {
      console.error('Error cargando tratamientos:', err);
      setTreatments([]);
    }
  }, [patient?.id]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validaciones
      if (!formData.description.trim()) {
        throw new Error('Por favor describe el tratamiento realizado');
      }

      if (!formData.time_start) {
        throw new Error('Debes indicar la hora de inicio del tratamiento');
      }

      if (!patient?.id || !nurse?.id) {
        throw new Error('Información de paciente o enfermero incompleta');
      }

      // Registrar tratamiento
      const result = await addNonPharmacologicalTreatment({
        patient_id: patient.id,
        nurse_id: nurse.id,
        nurse_name: nurse.name,
        treatment_type: formData.treatment_type,
        description: formData.description.trim(),
        time_start: formData.time_start,
        time_end: formData.time_end || null
      });

      if (!result.success) {
        throw new Error(result.error || 'Error al registrar tratamiento');
      }

      // Éxito
      const treatmentLabel = treatmentTypes.find(t => t.value === formData.treatment_type)?.label || formData.treatment_type;
      setSuccess(`✅ ${treatmentLabel} registrado correctamente`);

      // Limpiar formulario
      setFormData({
        treatment_type: 'curation',
        description: '',
        time_start: new Date().toLocaleTimeString('es-MX', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        time_end: ''
      });

      // Recargar historial
      await loadTreatments();

      // Callback
      if (onSuccess) {
        onSuccess();
      }

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al registrar tratamiento');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [formData, patient, nurse, onSuccess]);

  return (
    <div className="space-y-6">
      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow-sm border border-hospital-200 overflow-hidden">
        <div className="p-5 border-b border-hospital-100 bg-gradient-to-r from-clinical-primary to-clinical-secondary text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity size={22} />
            <h3 className="font-bold text-lg">Registrar Tratamiento No Farmacológico</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 bg-white text-clinical-primary px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Eye size={16} />
            {showHistory ? 'Ocultar' : 'Ver'} Historial
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Mensajes */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <Activity size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-900 font-medium">{success}</p>
            </div>
          )}

          {/* Tipo de Tratamiento */}
          <div>
            <label className="block text-sm font-semibold text-hospital-800 mb-3">
              Tipo de Tratamiento *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {treatmentTypes.map(type => (
                <label
                  key={type.value}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.treatment_type === type.value
                      ? 'border-clinical-primary bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="treatment_type"
                    value={type.value}
                    checked={formData.treatment_type === type.value}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-clinical-primary"
                  />
                  <span className="ml-3 text-sm font-medium text-hospital-800">
                    {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-hospital-800 mb-2">
              Descripción del Tratamiento *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe el tratamiento realizado, observaciones, resultado, condiciones del paciente..."
              className="w-full px-4 py-3 border border-hospital-200 rounded-lg focus:ring-2 focus:ring-clinical-primary focus:border-transparent resize-vertical"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 caracteres
            </p>
          </div>

          {/* Horas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-hospital-800 mb-2">
                <Clock size={16} className="inline mr-2" />
                Hora de Inicio *
              </label>
              <input
                type="time"
                name="time_start"
                value={formData.time_start}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-hospital-200 rounded-lg focus:ring-2 focus:ring-clinical-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-hospital-800 mb-2">
                <Clock size={16} className="inline mr-2" />
                Hora de Fin (Opcional)
              </label>
              <input
                type="time"
                name="time_end"
                value={formData.time_end}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-hospital-200 rounded-lg focus:ring-2 focus:ring-clinical-primary"
              />
            </div>
          </div>

          {/* Info Paciente y Enfermero */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Paciente:</strong> {patient?.name || 'No seleccionado'} • 
              <strong className="ml-2">Enfermero:</strong> {nurse?.name || 'No identificado'}
            </p>
          </div>

          {/* Botón Guardar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-clinical-primary hover:bg-clinical-primary/90 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
          >
            <Save size={20} />
            {loading ? 'Registrando...' : 'Guardar Tratamiento'}
          </button>

          {/* Nota legal */}
          <p className="text-xs text-gray-600 text-center">
            📋 Este registro es permanente, auditable y cumple con NOM-004
          </p>
        </form>
      </div>

      {/* Historial */}
      {showHistory && (
        <div className="bg-white rounded-2xl shadow-sm border border-hospital-200 overflow-hidden">
          <div className="p-5 border-b border-hospital-100 bg-hospital-50 flex items-center gap-3">
            <FileText size={20} className="text-hospital-600" />
            <h4 className="font-bold text-hospital-800">
              Historial de Tratamientos ({treatments.length})
            </h4>
          </div>

          {treatments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No hay tratamientos registrados
            </div>
          ) : (
            <div className="divide-y max-h-96 overflow-y-auto">
              {treatments.map((treatment, idx) => (
                <div key={treatment.id || idx} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-hospital-800">
                        {treatmentTypes.find(t => t.value === treatment.treatment_type)?.emoji} {' '}
                        {treatmentTypes.find(t => t.value === treatment.treatment_type)?.label}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Enfermero: <strong>{treatment.nurse_name}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono text-gray-700">
                        {treatment.time_start} {treatment.time_end ? `→ ${treatment.time_end}` : ''}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(treatment.created_at).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    {treatment.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
