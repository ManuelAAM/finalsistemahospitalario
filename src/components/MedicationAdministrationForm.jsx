import React, { useState, useEffect, memo, useCallback } from 'react';
import { Syringe, Save, AlertCircle, CheckCircle, Clock, Plus, Eye, Pill, Info, AlertTriangle } from 'lucide-react';
import {
  getPendingMedicationAdministration,
  recordMedicationAdministration,
  getMedicationAdministrationHistory,
  checkMedicationAllergy,
  validateMedicationStock
} from '../services/database';

/**
 * FORMULARIO SIMPLIFICADO DE ADMINISTRACIÓN DE MEDICAMENTOS
 * Para enfermero: solo selecciona medicamento, hora y registra
 * Interfaz sencilla y rápida para registro en turno
 */
export default memo(function MedicationAdministrationForm({
  patient,
  nurse,
  onSuccess
}) {
  // Estados del formulario
  const [formData, setFormData] = useState({
    medication_id: '',
    prescription_id: '',
    administration_time: new Date().toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }),
    medication_name: '',
    notes: ''
  });

  // Estados de datos
  const [pendingMeds, setPendingMeds] = useState([]);
  const [adminHistory, setAdminHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Cargar medicamentos pendientes al montar
  useEffect(() => {
    if (patient?.id) {
      loadPendingMedications();
      loadAdministrationHistory();
    }
  }, [patient?.id]);

  const loadPendingMedications = useCallback(async () => {
    if (!patient?.id) return;
    try {
      const data = await getPendingMedicationAdministration(patient.id);
      setPendingMeds(data || []);
    } catch (err) {
      console.error('Error cargando medicamentos pendientes:', err);
      setPendingMeds([]);
    }
  }, [patient?.id]);

  const loadAdministrationHistory = useCallback(async () => {
    if (!patient?.id) return;
    try {
      const data = await getMedicationAdministrationHistory(patient.id);
      setAdminHistory(data || []);
    } catch (err) {
      console.error('Error cargando historial:', err);
      setAdminHistory([]);
    }
  }, [patient?.id]);

  const handleMedicationSelect = useCallback((med) => {
    setFormData(prev => ({
      ...prev,
      medication_id: med.id,
      prescription_id: med.id,
      medication_name: med.medication_name,
      notes: `Dosis: ${med.dosage || 'N/A'} | Frecuencia: ${med.frequency || 'N/A'}`
    }));
    setError('');
  }, []);

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
      if (!formData.medication_id) {
        throw new Error('Por favor selecciona un medicamento');
      }

      if (!formData.administration_time) {
        throw new Error('Por favor indica la hora de administración');
      }

      if (!patient?.id || !nurse?.id) {
        throw new Error('Información de paciente o enfermero incompleta');
      }

      // ⚠️ VALIDACIÓN 5: Verificar ALERGIAS
      const allergyCheck = await checkMedicationAllergy(patient.id, formData.medication_name);
      if (allergyCheck.hasAllergy) {
        const proceedAnyway = window.confirm(
          `${allergyCheck.warning}\n\n¿CONFIRMAS que deseas administrar este medicamento de todas formas?`
        );
        if (!proceedAnyway) {
          setError('Administración cancelada por el usuario');
          return;
        }
      }

      // Registrar administración
      const result = await recordMedicationAdministration({
        patient_id: patient.id,
        nurse_id: nurse.id,
        medication_id: formData.medication_id,
        prescription_id: formData.prescription_id,
        administration_time: formData.administration_time,
        notes: formData.notes
      });

      if (!result.success) {
        throw new Error(result.error || 'Error al registrar administración');
      }

      // Éxito
      setSuccess(`✅ Medicamento administrado: ${formData.medication_name}`);

      // Limpiar y recargar
      setFormData({
        medication_id: '',
        prescription_id: '',
        administration_time: new Date().toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        medication_name: '',
        notes: ''
      });

      await loadPendingMedications();
      await loadAdministrationHistory();

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al registrar administración');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [formData, patient, nurse, onSuccess]);

  return (
    <div className="space-y-6">
      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow-sm border border-hospital-200 overflow-hidden">
        <div className="p-5 border-b border-hospital-100 bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Syringe size={22} />
            <h3 className="font-bold text-lg">Administrar Medicamentos</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
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
              <p className="text-red-900">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-900 font-medium">{success}</p>
            </div>
          )}

          {/* Info del Paciente */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Paciente:</strong> {patient?.name || 'No seleccionado'} • 
              <strong className="ml-2">Enfermero:</strong> {nurse?.name || 'No identificado'}
            </p>
          </div>

          {/* Medicamentos Pendientes */}
          <div>
            <label className="block text-sm font-semibold text-hospital-800 mb-3 flex items-center gap-2">
              <Pill size={16} />
              Medicamentos Pendientes por Administrar
            </label>

            {pendingMeds.length === 0 ? (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
                <p className="text-sm">No hay medicamentos pendientes</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {pendingMeds.map((med) => (
                  <button
                    key={med.id}
                    type="button"
                    onClick={() => handleMedicationSelect(med)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      formData.medication_id === med.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-hospital-800">
                          {med.medication_name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Dosis:</strong> {med.dosage} • 
                          <strong className="ml-2">Frecuencia:</strong> {med.frequency}
                        </p>
                        {med.doctor_name && (
                          <p className="text-xs text-gray-500 mt-1">
                            Prescrito por: {med.doctor_name}
                          </p>
                        )}
                      </div>
                      {formData.medication_id === med.id && (
                        <div className="text-green-600 font-bold">✓</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hora de Administración */}
          <div>
            <label className="block text-sm font-semibold text-hospital-800 mb-2">
              <Clock size={16} className="inline mr-2" />
              Hora de Administración *
            </label>
            <input
              type="time"
              name="administration_time"
              value={formData.administration_time}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-hospital-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Medicamento Seleccionado */}
          {formData.medication_name && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-sm text-green-900">
                <strong>Seleccionado:</strong> {formData.medication_name}
              </p>
              {formData.notes && (
                <p className="text-xs text-green-800 mt-1">
                  {formData.notes}
                </p>
              )}
            </div>
          )}

          {/* Notas Adicionales */}
          <div>
            <label className="block text-sm font-semibold text-hospital-800 mb-2">
              Notas (Opcional)
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Ej: Paciente rechazó medicamento, prescripción suspendida, etc."
              className="w-full px-4 py-3 border border-hospital-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3">
            <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900">
              El registro se guarda automáticamente con hora exacta del sistema. 
              Se mantiene historial completo auditable (NOM-004).
            </p>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading || !formData.medication_id}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
          >
            <Save size={20} />
            {loading ? 'Registrando...' : 'Registrar Administración'}
          </button>
        </form>
      </div>

      {/* Historial */}
      {showHistory && (
        <div className="bg-white rounded-2xl shadow-sm border border-hospital-200 overflow-hidden">
          <div className="p-5 border-b border-hospital-100 bg-hospital-50 flex items-center gap-3">
            <Pill size={20} className="text-hospital-600" />
            <h4 className="font-bold text-hospital-800">
              Historial de Administraciones ({adminHistory.length})
            </h4>
          </div>

          {adminHistory.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No hay administraciones registradas
            </div>
          ) : (
            <div className="divide-y max-h-96 overflow-y-auto">
              {adminHistory.map((admin, idx) => (
                <div key={admin.id || idx} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-hospital-800">
                      {admin.medication_name || 'Medicamento'}
                    </p>
                    <p className="text-xs font-mono text-gray-700">
                      {admin.dispensed_time}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">
                    {new Date(admin.dispensed_time).toLocaleDateString('es-MX')}
                  </p>
                  <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
                    <CheckCircle size={12} />
                    {admin.status === 'administered' ? 'Administrado' : 'Registrado'}
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
