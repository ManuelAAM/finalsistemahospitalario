import React, { useState } from 'react';
import {
  X, Tabs, Activity, Heart, MapPin, Pill, FileText, User,
  AlertCircle, Check
} from 'lucide-react';
import MedicalInformation from './MedicalInformation';
import VitalSignsHistory from './VitalSignsHistory';
import TransfersHistory from './TransfersHistory';
import TriageDisplay from './TriageDisplay';

/**
 * 👤 MODAL: Detalles Completos del Paciente
 * 
 * Muestra toda la información del paciente en una vista integrada:
 * - Información demográfica
 * - Triaje (solo lectura)
 * - Información médica (médico, diagnóstico, medicamentos)
 * - Historial de signos vitales (gráfico)
 * - Historial de traslados
 */
export default function PatientDetailsModal({ patient, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!patient) return null;

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: Activity },
    { id: 'medical', label: 'Información Médica', icon: Heart },
    { id: 'vitals', label: 'Signos Vitales', icon: Activity },
    { id: 'transfers', label: 'Traslados', icon: MapPin },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-auto">
      <div className="bg-white rounded-lg shadow-2xl w-11/12 max-w-6xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {patient.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Paciente ID: {patient.id} • CURP: {patient.curp}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={28} className="text-gray-600" />
          </button>
        </div>

        {/* Información Demográfica Rápida */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <div>
            <p className="text-xs font-bold text-gray-600 uppercase">Edad</p>
            <p className="text-xl font-bold text-gray-800">{patient.age} años</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600 uppercase">Género</p>
            <p className="text-xl font-bold text-gray-800">{patient.gender || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600 uppercase">Tipo Sangre</p>
            <p className="text-xl font-bold text-gray-800">{patient.blood_type}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600 uppercase">Sala/Cama</p>
            <p className="text-xl font-bold text-gray-800">{patient.room}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600 uppercase">Condición</p>
            <p className={`text-xl font-bold ${
              patient.condition === 'Crítico'
                ? 'text-red-600'
                : patient.condition === 'Estable'
                ? 'text-green-600'
                : 'text-yellow-600'
            }`}>
              {patient.condition}
            </p>
          </div>
        </div>

        {/* Triaje - Sección Destacada */}
        {patient.triage_level && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle size={22} className="text-red-600" />
              Clasificación de Triaje
            </h3>
            <TriageDisplay
              level={patient.triage_level}
              timestamp={patient.triage_timestamp}
              evaluatedBy={patient.triage_evaluated_by}
              symptoms={patient.triage_symptoms}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b-2 border-gray-200 bg-gray-50">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600 bg-white'
                    : 'text-gray-600 border-transparent hover:text-gray-800'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Contenido de Tabs */}
        <div className="p-6 max-h-[calc(100vh-500px)] overflow-y-auto">
          {/* Resumen */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Alergias */}
              {patient.allergies && (
                <div className="p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
                  <p className="text-xs font-bold text-orange-700 mb-1">⚠️ ALERGIAS</p>
                  <p className="text-orange-900 font-semibold">{patient.allergies}</p>
                </div>
              )}

              {/* Fecha de Admisión */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-bold text-blue-700 mb-1">Fecha de Admisión</p>
                  <p className="text-lg font-bold text-blue-900">
                    {new Date(patient.admission_date).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-bold text-blue-700 mb-1">Estado</p>
                  <p className="text-lg font-bold text-blue-900">{patient.status}</p>
                </div>
              </div>

              {/* Información de Emergencia */}
              {patient.emergency_contact_name && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs font-bold text-purple-700 mb-2">Contacto de Emergencia</p>
                  <p className="font-bold text-purple-900">{patient.emergency_contact_name}</p>
                  {patient.emergency_contact_phone && (
                    <p className="text-sm text-purple-700">Tel: {patient.emergency_contact_phone}</p>
                  )}
                </div>
              )}

              {/* Información de Seguros */}
              {patient.insurance_provider && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs font-bold text-green-700 mb-2">Información de Seguros</p>
                  <p className="font-bold text-green-900">{patient.insurance_provider}</p>
                  {patient.insurance_number && (
                    <p className="text-sm text-green-700">Póliza: {patient.insurance_number}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Información Médica */}
          {activeTab === 'medical' && (
            <MedicalInformation patient={patient} />
          )}

          {/* Historial de Signos Vitales */}
          {activeTab === 'vitals' && (
            <VitalSignsHistory patientId={patient.id} />
          )}

          {/* Historial de Traslados */}
          {activeTab === 'transfers' && (
            <TransfersHistory patientId={patient.id} />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t-2 border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
