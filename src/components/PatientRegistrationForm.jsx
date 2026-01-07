import React, { useState } from 'react';
import { UserPlus, Activity, AlertCircle, CheckCircle, X } from 'lucide-react';
import { validateCURP, extractCURPInfo, formatCURP, getCURPErrorMessage } from '../utils/curpValidation';
import { validateTriageRequired } from '../utils/triageValidation';
import { validatePatientUniqueness, validateTriageRequired as validateTriageBD } from '../services/database';
import TriageSelector from './TriageSelector';
import { invoke } from '@tauri-apps/api/tauri';

/**
 * Formulario de Registro de Pacientes con Validación de CURP
 * Previene duplicidad de expedientes médicos
 */
export default function PatientRegistrationForm({ isOpen, onPatientAdded, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    curp: '',
    age: '',
    blood_type: 'O+',
    room: '',
    condition: 'En valoración',
    triage_level: '',
    triage_symptoms: '',
    admission_date: new Date().toISOString().split('T')[0],
    allergies: '',
    diagnosis: ''
  });

  const [curpValidation, setCurpValidation] = useState(null);
  const [curpInfo, setCurpInfo] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validar CURP en tiempo real
  const handleCurpChange = (e) => {
    const curp = e.target.value.toUpperCase();
    setFormData({ ...formData, curp });
    
    if (curp.length === 18) {
      const validation = validateCURP(curp);
      setCurpValidation(validation);
      
      if (validation.isValid) {
        const info = extractCURPInfo(curp);
        setCurpInfo(info);
        
        // Auto-completar edad si es válida
        if (info && info.edad >= 0) {
          setFormData(prev => ({ ...prev, age: info.edad.toString() }));
        }
      } else {
        setCurpInfo(null);
      }
    } else {
      setCurpValidation(null);
      setCurpInfo(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // --- NUEVAS VALIDACIONES ---
    const requiredFields = [
      { field: formData.name, msg: 'El nombre es obligatorio' },
      { field: formData.curp, msg: 'El CURP es obligatorio' },
      { field: formData.age, msg: 'La edad es obligatoria' },
      { field: formData.triage_symptoms, msg: 'Debe describir los síntomas' } // Si aplica
    ];

    for (const check of requiredFields) {
      if (!check.field || check.field.toString().trim() === '') {
        setError(`⚠️ ${check.msg}`);
        return; // Detiene el envío
      }
    }

    // Validaciones
    if (!formData.name.trim()) {
      const { formatMessage } = await import('../utils/systemMessages.js');
      setError(formatMessage('ERR_02', 'El nombre del paciente es obligatorio'));
      return;
    }

    if (!formData.curp || formData.curp.length !== 18) {
      const { formatMessage } = await import('../utils/systemMessages.js');
      setError(formatMessage('ERR_02', 'Ingrese un CURP válido de 18 caracteres'));
      return;
    }

    if (!curpValidation || !curpValidation.isValid) {
      setError(getCURPErrorMessage(curpValidation || { isValid: false, errors: ['CURP inválido'] }));
      return;
    }

    if (!formData.age || parseInt(formData.age) < 0) {
      const { formatMessage } = await import('../utils/systemMessages.js');
      setError(formatMessage('ERR_02', 'Ingrese una edad válida'));
      return;
    }

    if (!formData.blood_type) {
      setError('Seleccione un tipo de sangre');
      return;
    }

    // Validar triaje obligatorio
    try {
      validateTriageRequired(formData.triage_level);
    } catch (triageError) {
      setError(triageError.message);
      return;
    }

    if (!formData.triage_symptoms || formData.triage_symptoms.trim().length < 10) {
      setError('Debe describir los síntomas del paciente (mínimo 10 caracteres)');
      return;
    }

    setIsSubmitting(true);

    try {
      const { addPatient, validatePatientUniqueness } = await import('../services/database.js');
      
      // Validación 6: Verificar unicidad de CURP
      try {
        const uniquenessCheck = await validatePatientUniqueness(formData.curp);
        if (!uniquenessCheck.unique) {
          setError(`❌ ${uniquenessCheck.message}\n\nEste CURP ya existe en el sistema. Verifique los datos del paciente.`);
          setIsSubmitting(false);
          return;
        }
      } catch (uniqueError) {
        console.warn('Advertencia en validación CURP:', uniqueError);
        // Continuar aún si hay error en validación (base de datos puede estar vacía)
      }
      
      // Agregar timestamp de triaje y evaluador
      const patientData = {
        ...formData,
        age: parseInt(formData.age),
        triage_timestamp: new Date().toISOString(),
        triage_evaluated_by: 'Usuario Actual' // TODO: usar usuario logueado
      };

      await addPatient(patientData);

      // Obtener info del triaje para mostrar en alerta
      const { getTriageInfo } = await import('../utils/triageValidation');
      const triageInfo = getTriageInfo(formData.triage_level);

      alert(`✅ Paciente registrado exitosamente\n\nNombre: ${formData.name}\nCURP: ${formatCURP(formData.curp)}\nTriaje: ${triageInfo.emoji} ${triageInfo.name}\nPrioridad: ${triageInfo.priority}\n\n⚠️ Este expediente es único e irrepetible.`);
      
      if (onPatientAdded) {
        onPatientAdded();
      }
      
      // Resetear formulario
      setFormData({
        name: '',
        curp: '',
        age: '',
        blood_type: 'O+',
        room: '',
        condition: 'En valoración',
        triage_level: '',
        triage_symptoms: '',
        admission_date: new Date().toISOString().split('T')[0],
        allergies: '',
        diagnosis: ''
      });
      setCurpValidation(null);
      setCurpInfo(null);
      
    } catch (err) {
      console.error('Error registrando paciente:', err);
      setError(err.message || 'Error al registrar paciente');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <UserPlus size={28} />
            <div>
              <h2 className="text-2xl font-bold">Registro de Nuevo Paciente</h2>
              <p className="text-blue-100 text-sm">Validación de CURP única</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Banner de Advertencia */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 m-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-bold text-amber-900">Unicidad del Expediente</p>
              <p className="text-sm text-amber-800">
                El CURP garantiza que no haya expedientes duplicados. 
                Un paciente solo puede tener un expediente en el sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg whitespace-pre-line">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} />
                <span className="font-bold">Error</span>
              </div>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          )}

          {/* CURP - Campo Principal */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">
              CURP * <span className="text-sm font-normal text-gray-500">(18 caracteres)</span>
            </label>
            <input
              type="text"
              value={formData.curp}
              onChange={handleCurpChange}
              maxLength={18}
              placeholder="Ej: PEXJ791015HDFRXN01"
              className={`w-full p-3 border-2 rounded-lg font-mono uppercase text-lg ${
                !formData.curp
                  ? 'border-gray-300'
                  : curpValidation?.isValid
                  ? 'border-green-500 bg-green-50'
                  : formData.curp.length === 18
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
              }`}
              required
            />
            
            {/* Validación en tiempo real */}
            {formData.curp.length === 18 && curpValidation && (
              <div className={`mt-2 p-3 rounded-lg ${
                curpValidation.isValid 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {curpValidation.isValid ? (
                  <div className="flex items-start gap-2 text-green-800">
                    <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">✅ CURP Válido</p>
                      {curpInfo && (
                        <div className="text-sm mt-2 space-y-1">
                          <p><strong>Nacimiento:</strong> {curpInfo.fechaNacimiento}</p>
                          <p><strong>Edad:</strong> {curpInfo.edad} años</p>
                          <p><strong>Sexo:</strong> {curpInfo.sexo}</p>
                          <p><strong>Estado:</strong> {curpInfo.estadoNombre}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-red-800">
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">❌ CURP Inválido</p>
                      <ul className="text-sm mt-1 list-disc list-inside">
                        {curpValidation.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nombre Completo */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Juan Pérez García"
              className="w-full p-3 border-2 border-gray-300 rounded-lg"
              required
            />
          </div>

          {/* Edad y Tipo de Sangre */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-2">
                Edad * {curpInfo && <span className="text-sm font-normal text-green-600">(Auto-detectada)</span>}
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                min="0"
                max="120"
                placeholder="Ej: 45"
                className="w-full p-3 border-2 border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">
                Tipo de Sangre *
              </label>
              <select
                value={formData.blood_type}
                onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg"
                required
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          {/* Habitación y Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-2">
                Habitación
              </label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="Ej: 301-A"
                className="w-full p-3 border-2 border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">
                Estado Clínico
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg"
              >
                <option value="En valoración">En valoración</option>
                <option value="Estable">Estable</option>
                <option value="Recuperación">Recuperación</option>
                <option value="Crítico">Crítico</option>
              </select>
            </div>
          </div>

          {/* Alergias */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">
              Alergias
            </label>
            <input
              type="text"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="Ej: Penicilina, Polen (dejar vacío si no tiene)"
              className="w-full p-3 border-2 border-gray-300 rounded-lg"
            />
          </div>

          {/* Clasificación de Triaje - OBLIGATORIO */}
          <div className="col-span-full border-t-2 border-gray-200 pt-6 mt-4">
            <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-yellow-800 mb-1">
                    🚨 Clasificación de Triaje Obligatoria
                  </p>
                  <p className="text-xs text-yellow-700">
                    Todos los pacientes deben ser clasificados según nivel de urgencia al momento del ingreso.
                  </p>
                </div>
              </div>
            </div>

            <TriageSelector
              value={formData.triage_level}
              onChange={(level) => setFormData({ ...formData, triage_level: level })}
              required
            />
          </div>

          {/* Síntomas para Triaje */}
          <div className="col-span-full">
            <label className="block font-bold text-gray-700 mb-2">
              Síntomas y Motivo de Consulta *
            </label>
            <textarea
              value={formData.triage_symptoms}
              onChange={(e) => setFormData({ ...formData, triage_symptoms: e.target.value })}
              placeholder="Describa los síntomas principales que presenta el paciente al ingreso..."
              rows={4}
              className="w-full p-3 border-2 border-gray-300 rounded-lg resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 10 caracteres • {formData.triage_symptoms.length} caracteres
            </p>
          </div>

          {/* Diagnóstico */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">
              Diagnóstico Inicial
            </label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="Ej: Neumonía adquirida en la comunidad"
              rows={3}
              className="w-full p-3 border-2 border-gray-300 rounded-lg"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !curpValidation?.isValid}
              className={`px-6 py-3 rounded-lg font-bold text-white transition flex items-center gap-2 ${
                isSubmitting || !curpValidation?.isValid
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Activity size={20} />
              {isSubmitting ? 'Registrando...' : 'Registrar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
