import React, { useState, useEffect, memo, useCallback } from 'react';
import { Users, MapPin, AlertTriangle, Clock, RefreshCw, Heart } from 'lucide-react';
import { getNurseAssignedPatientsWithDetails } from '../services/database';
import { getTriageStyle, getTriageInfo } from '../utils/triageValidation';

/**
 * LISTA DE PACIENTES ASIGNADOS AL ENFERMERO
 * Muestra ubicación, estado general, triaje con colores
 * Acceso rápido a historial y vitales de cada paciente
 */
export default memo(function NurseAssignedPatients({ 
  nurseId,
  onPatientSelected,
  refreshTrigger
}) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Cargar pacientes asignados
  useEffect(() => {
    loadPatients();
  }, [nurseId, refreshTrigger]);

  const loadPatients = useCallback(async () => {
    if (!nurseId) {
      setError('ID de enfermero no disponible');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await getNurseAssignedPatientsWithDetails(nurseId);
      setPatients(data || []);
      if (data.length === 0) {
        setError('No hay pacientes asignados en este turno');
      }
    } catch (err) {
      console.error('Error cargando pacientes:', err);
      setError('Error al cargar pacientes asignados');
    } finally {
      setLoading(false);
    }
  }, [nurseId]);

  const handlePatientClick = useCallback((patient) => {
    setSelectedPatient(patient);
    if (onPatientSelected) {
      onPatientSelected(patient);
    }
  }, [onPatientSelected]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-hospital-200 p-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-clinical-primary" size={32} />
          <p className="text-gray-600 font-medium">Cargando pacientes asignados...</p>
        </div>
      </div>
    );
  }

  if (error && patients.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-hospital-200 p-8">
        <div className="flex items-center gap-3 text-yellow-700 bg-yellow-50 p-4 rounded-lg">
          <AlertTriangle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-clinical-primary p-2 rounded-lg text-white">
            <Users size={24} />
          </div>
          <div>
            <h2 className="font-bold text-hospital-800 text-xl">
              Pacientes Asignados
            </h2>
            <p className="text-sm text-gray-600">
              {patients.length} paciente{patients.length !== 1 ? 's' : ''} en tu turno
            </p>
          </div>
        </div>
        <button
          onClick={loadPatients}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      {/* Grid de Pacientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => {
          const triageInfo = getTriageInfo(patient.triage_level);
          const triageStyle = getTriageStyle(patient.triage_level);

          return (
            <button
              key={patient.id}
              onClick={() => handlePatientClick(patient)}
              className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                selectedPatient?.id === patient.id
                  ? 'border-clinical-primary bg-blue-50'
                  : 'border-hospital-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Triaje */}
              <div className={`inline-block px-3 py-1 rounded-full text-white font-bold text-sm mb-3 ${triageStyle}`}>
                {triageInfo.emoji} {triageInfo.name}
              </div>

              {/* Nombre del Paciente */}
              <h4 className="font-bold text-hospital-800 text-base truncate">
                {patient.name}
              </h4>

              {/* CURP */}
              <p className="text-xs text-gray-500 font-mono mt-1">
                {patient.curp?.substring(0, 8) || 'N/A'}...
              </p>

              {/* Información Clínica */}
              <div className="mt-3 space-y-2 text-sm">
                {/* Edad y Género */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">
                    <strong>{patient.age}</strong> años • {patient.gender?.charAt(0) || '?'}
                  </span>
                  <span className="text-hospital-600 font-semibold">
                    {patient.blood_type}
                  </span>
                </div>

                {/* Ubicación */}
                <div className="flex items-start gap-2 bg-gray-50 p-2 rounded">
                  <MapPin size={16} className="text-clinical-primary flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-hospital-800">
                      {patient.room || 'Sin habitación'}
                    </p>
                    {patient.room_floor && (
                      <p className="text-gray-600">
                        Piso {patient.room_floor} {patient.room_area && `• ${patient.room_area}`}
                      </p>
                    )}
                    {patient.bed_number && (
                      <p className="text-gray-600">Cama {patient.bed_number}</p>
                    )}
                  </div>
                </div>

                {/* Médico */}
                {patient.primary_doctor && (
                  <div className="text-xs bg-blue-50 p-2 rounded">
                    <p className="text-gray-600">Dr/Dra: <strong>{patient.primary_doctor}</strong></p>
                  </div>
                )}

                {/* Estado */}
                <div className="flex items-center gap-2">
                  <Heart size={14} className={
                    patient.status === 'stable' ? 'text-green-600' :
                    patient.status === 'critical' ? 'text-red-600' :
                    'text-yellow-600'
                  } />
                  <span className="text-xs font-semibold capitalize text-gray-700">
                    {patient.status === 'stable' ? '✅ Estable' :
                     patient.status === 'critical' ? '⚠️ Crítico' :
                     '🔍 Pendiente'}
                  </span>
                </div>

                {/* Turno Asignado */}
                {patient.shift_type && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 border-t border-gray-200 pt-2">
                    <Clock size={14} />
                    <span>Turno: {patient.shift_type}</span>
                  </div>
                )}
              </div>

              {/* Notas */}
              {patient.notes && (
                <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-400 rounded text-xs text-yellow-900">
                  <strong>Nota:</strong> {patient.notes}
                </div>
              )}

              {/* Badge seleccionado */}
              {selectedPatient?.id === patient.id && (
                <div className="mt-3 flex items-center gap-1 text-clinical-primary text-xs font-bold">
                  ✓ Seleccionado
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Leyenda de Estados */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h5 className="font-semibold text-gray-700 text-sm mb-3">Triaje - Nivel de Urgencia</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span>🔴 Emergencia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>🟠 Urgente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>🟡 Semi-urgente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span>🟢 No urgente</span>
          </div>
        </div>
      </div>
    </div>
  );
});
