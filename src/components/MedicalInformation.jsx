import React, { useState, useEffect } from 'react';
import { Stethoscope, Pill, FileText, Clock, User, AlertCircle } from 'lucide-react';
import { getPrescriptionsByPatientId } from '../services/database';

/**
 * 👨‍⚕️ COMPONENTE: Información Médica del Paciente
 * 
 * Muestra:
 * - Médico responsable
 * - Tratamientos/Medicamentos prescritos
 * - Diagnóstico
 */
export default function MedicalInformation({ patient }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patient?.id) {
      loadPrescriptions();
    }
  }, [patient?.id]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPrescriptionsByPatientId(patient.id);
      setPrescriptions(data || []);
    } catch (err) {
      console.error('Error cargando prescripciones:', err);
      setError('Error al cargar prescripciones');
    } finally {
      setLoading(false);
    }
  };

  if (!patient) {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800">Selecciona un paciente para ver información médica</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Médico Responsable */}
      <div className="bg-white p-6 rounded-lg border-2 border-blue-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Stethoscope className="text-blue-600" size={28} />
          <h3 className="text-xl font-bold text-gray-800">Médico Responsable</h3>
        </div>

        {patient.primary_doctor ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-bold text-blue-700 mb-1">MÉDICO ASIGNADO</p>
              <p className="text-lg font-bold text-gray-800">{patient.primary_doctor}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-bold text-blue-700 mb-1">ESTADO</p>
              <p className="text-lg font-bold text-green-600">✓ Asignado</p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-yellow-800">Sin médico asignado</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Es necesario asignar un médico responsable para este paciente
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Diagnóstico */}
      <div className="bg-white p-6 rounded-lg border-2 border-orange-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="text-orange-600" size={28} />
          <h3 className="text-xl font-bold text-gray-800">Diagnóstico</h3>
        </div>

        {patient.diagnosis && patient.diagnosis.trim() ? (
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-gray-800 leading-relaxed">{patient.diagnosis}</p>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-yellow-800">Sin diagnóstico registrado</p>
                <p className="text-sm text-yellow-700 mt-1">
                  El médico debe registrar el diagnóstico del paciente
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tratamientos/Medicamentos Prescritos */}
      <div className="bg-white p-6 rounded-lg border-2 border-green-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Pill className="text-green-600" size={28} />
          <h3 className="text-xl font-bold text-gray-800">
            Medicamentos Prescritos
            {prescriptions.length > 0 && (
              <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-normal">
                {prescriptions.length}
              </span>
            )}
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-6">
            <div className="spinner w-6 h-6 border-2"></div>
            <span className="ml-3 text-gray-600">Cargando...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        ) : prescriptions.length > 0 ? (
          <div className="space-y-3">
            {prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Medicamento */}
                  <div>
                    <p className="text-xs font-bold text-green-700 mb-1">MEDICAMENTO</p>
                    <p className="text-lg font-bold text-gray-800">
                      {prescription.medication_name}
                    </p>
                  </div>

                  {/* Dosis */}
                  <div>
                    <p className="text-xs font-bold text-green-700 mb-1">DOSIS</p>
                    <p className="text-lg font-bold text-gray-800">
                      {prescription.dosage}
                    </p>
                  </div>

                  {/* Frecuencia */}
                  <div>
                    <p className="text-xs font-bold text-green-700 mb-1">FRECUENCIA</p>
                    <p className="text-gray-800">{prescription.frequency}</p>
                  </div>

                  {/* Estado */}
                  <div>
                    <p className="text-xs font-bold text-green-700 mb-1">ESTADO</p>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        prescription.status === 'Active'
                          ? 'bg-green-200 text-green-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {prescription.status === 'Active' ? '✓ Activo' : 'Inactivo'}
                    </span>
                  </div>

                  {/* Duración */}
                  {prescription.duration && (
                    <div>
                      <p className="text-xs font-bold text-green-700 mb-1">DURACIÓN</p>
                      <p className="text-gray-800">{prescription.duration}</p>
                    </div>
                  )}

                  {/* Instrucciones */}
                  {prescription.instructions && (
                    <div className="md:col-span-2">
                      <p className="text-xs font-bold text-green-700 mb-1">INSTRUCCIONES</p>
                      <p className="text-gray-800 text-sm">{prescription.instructions}</p>
                    </div>
                  )}

                  {/* Fecha prescrita */}
                  {prescription.prescribed_date && (
                    <div className="text-xs text-gray-600">
                      <Clock size={12} className="inline mr-1" />
                      Prescrito: {new Date(prescription.prescribed_date).toLocaleDateString('es-MX')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-yellow-800">Sin medicamentos prescritos</p>
                <p className="text-sm text-yellow-700 mt-1">
                  No hay medicamentos prescritos actualmente para este paciente
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nota informativa */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
        <p className="font-bold mb-1">ℹ️ Información Médica</p>
        <p>
          Esta sección muestra la información médica actual del paciente incluyendo su médico responsable,
          diagnóstico y medicamentos prescritos. Todos estos datos forman parte del expediente clínico 
          del paciente.
        </p>
      </div>
    </div>
  );
}
