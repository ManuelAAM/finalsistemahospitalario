import React, { useState, useEffect } from 'react';
import { 
  FileText, User, Calendar, CheckCircle, XCircle, 
  AlertCircle, Pill, Activity, ClipboardList, X, 
  AlertTriangle, Shield
} from 'lucide-react';

/**
 * 🏥 COMPONENTE: Orden de Alta Médica
 * 
 * Requisito NOM-004: No se puede dar de alta a un paciente sin orden médica formal
 * 
 * Funcionalidad:
 * - Emitir órdenes de alta médica (solo médicos)
 * - Visualizar estado de autorización de alta
 * - Completar proceso de alta hospitalaria
 * - Historial de órdenes de alta
 */

const DISCHARGE_TYPES = {
  'Mejoría': { icon: CheckCircle, color: 'green', description: 'Paciente dado de alta por mejoría' },
  'Curación': { icon: Activity, color: 'emerald', description: 'Paciente curado completamente' },
  'Traslado': { icon: AlertTriangle, color: 'blue', description: 'Traslado a otra institución' },
  'Voluntaria': { icon: User, color: 'purple', description: 'Alta solicitada por el paciente' },
  'Defunción': { icon: XCircle, color: 'gray', description: 'Alta por defunción' },
};

const DischargeOrderModal = ({ 
  isOpen, 
  onClose, 
  patient, 
  currentUser,
  onOrderCreated 
}) => {
  const [formData, setFormData] = useState({
    dischargeType: 'Mejoría',
    diagnosis: '',
    recommendations: '',
    followUpInstructions: '',
    medications: '',
    restrictions: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Solo médicos pueden emitir órdenes de alta
  const canIssueOrder = currentUser?.role === 'doctor';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validación de campos requeridos
    if (!formData.diagnosis || formData.diagnosis.trim().length < 10) {
      const { formatMessage } = await import('../utils/systemMessages.js');
      setError(formatMessage('ERR_02', 'El diagnóstico de egreso debe tener al menos 10 caracteres'));
      return;
    }

    if (!formData.recommendations || formData.recommendations.trim().length < 10) {
      const { formatMessage } = await import('../utils/systemMessages.js');
      setError(formatMessage('ERR_02', 'Las recomendaciones médicas deben tener al menos 10 caracteres'));
      return;
    }

    setLoading(true);

    try {
      const { createDischargeOrder } = await import('../services/database.js');
      
      await createDischargeOrder({
        patientId: patient.id,
        doctorId: currentUser.id,
        doctorName: currentUser.name,
        dischargeType: formData.dischargeType,
        diagnosis: formData.diagnosis,
        recommendations: formData.recommendations,
        followUpInstructions: formData.followUpInstructions,
        medications: formData.medications,
        restrictions: formData.restrictions
      });

      alert('✅ Orden de alta médica emitida exitosamente');
      onOrderCreated?.();
      onClose();
    } catch (err) {
      console.error('Error creando orden de alta:', err);
      setError(err.message || 'Error al emitir orden de alta');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3">
              <FileText size={28} />
              Orden de Alta Médica
            </h2>
            <p className="text-blue-100 text-sm mt-2">
              {patient?.name} • Habitación: {patient?.room}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Advertencia NOM-004 */}
        <div className="mx-6 mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800 mb-1">
                🔒 Requisito NOM-004-SSA3-2012
              </p>
              <p className="text-xs text-amber-700">
                La orden de alta médica es <strong>obligatoria</strong> para dar de alta a un paciente. 
                Solo médicos autorizados pueden emitir órdenes de alta.
              </p>
            </div>
          </div>
        </div>

        {/* Restricción para no-médicos */}
        {!canIssueOrder && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-800 mb-1">
                  🚫 Acceso Restringido
                </p>
                <p className="text-xs text-red-700">
                  Solo los médicos autorizados pueden emitir órdenes de alta médica. 
                  Su rol actual: <strong>{currentUser?.role || 'No definido'}</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de Alta */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Tipo de Alta <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.dischargeType}
              onChange={(e) => setFormData({ ...formData, dischargeType: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              disabled={!canIssueOrder}
            >
              {Object.keys(DISCHARGE_TYPES).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {DISCHARGE_TYPES[formData.dischargeType]?.description}
            </p>
          </div>

          {/* Diagnóstico de Egreso */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Diagnóstico de Egreso <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="Describa el diagnóstico final del paciente al momento del alta..."
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
              rows={4}
              disabled={!canIssueOrder}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 10 caracteres • {formData.diagnosis.length} caracteres
            </p>
          </div>

          {/* Recomendaciones Médicas */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Recomendaciones Médicas <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              placeholder="Indicaciones generales para el cuidado del paciente después del alta..."
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
              rows={4}
              disabled={!canIssueOrder}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 10 caracteres • {formData.recommendations.length} caracteres
            </p>
          </div>

          {/* Seguimiento */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Instrucciones de Seguimiento
            </label>
            <textarea
              value={formData.followUpInstructions}
              onChange={(e) => setFormData({ ...formData, followUpInstructions: e.target.value })}
              placeholder="Citas de seguimiento, estudios pendientes, consultas especializadas..."
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
              rows={3}
              disabled={!canIssueOrder}
            />
          </div>

          {/* Medicamentos */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Pill size={16} />
              Medicamentos para el hogar
            </label>
            <textarea
              value={formData.medications}
              onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
              placeholder="Lista de medicamentos que el paciente debe continuar tomando..."
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
              rows={3}
              disabled={!canIssueOrder}
            />
          </div>

          {/* Restricciones */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <AlertTriangle size={16} />
              Restricciones y Precauciones
            </label>
            <textarea
              value={formData.restrictions}
              onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
              placeholder="Actividades a evitar, restricciones dietéticas, precauciones especiales..."
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
              rows={3}
              disabled={!canIssueOrder}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canIssueOrder || loading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Emitiendo...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Emitir Orden de Alta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Componente para mostrar el estado de alta de un paciente
 */
export const DischargeStatus = ({ patient, onRequestDischarge }) => {
  const [dischargeOrder, setDischargeOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDischargeOrder();
  }, [patient?.id]);

  const loadDischargeOrder = async () => {
    if (!patient?.id) return;
    
    setLoading(true);
    try {
      const { getActiveDischargeOrder } = await import('../services/database.js');
      const order = await getActiveDischargeOrder(patient.id);
      setDischargeOrder(order);
    } catch (error) {
      console.error('Error cargando orden de alta:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
        <p className="text-sm text-gray-500">Verificando orden de alta...</p>
      </div>
    );
  }

  if (!dischargeOrder) {
    return (
      <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-800">
              🚫 Sin Autorización de Alta
            </p>
            <p className="text-xs text-red-700 mt-1">
              Este paciente NO puede ser dado de alta sin una orden médica formal.
            </p>
            <button
              onClick={onRequestDischarge}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition"
            >
              Solicitar Orden de Alta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
      <div className="flex items-start gap-3">
        <CheckCircle size={20} className="text-green-600 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-bold text-green-800">
            ✅ Autorizado para Alta Médica
          </p>
          <p className="text-xs text-green-700 mt-1">
            Orden emitida por: <strong>{dischargeOrder.doctor_name}</strong>
          </p>
          <p className="text-xs text-green-600 mt-1">
            Tipo: {dischargeOrder.discharge_type} • 
            {new Date(dischargeOrder.created_at).toLocaleDateString('es-MX')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DischargeOrderModal;
