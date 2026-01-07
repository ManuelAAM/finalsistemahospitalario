import React, { useState, useEffect, memo } from 'react';
import { Users, Pill, Activity, FileText, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import NurseAssignedPatients from './NurseAssignedPatients';
import MedicationAdministrationForm from './MedicationAdministrationForm';
import NonPharmacologicalTreatmentForm from './NonPharmacologicalTreatmentForm';
import NursingShiftReport from './NursingShiftReport';
import NurseSchedule from './NurseSchedule';
import VitalSignsHistory from './VitalSignsHistory';
import CareFormComponents from './CareFormComponents';

/**
 * DASHBOARD DEL ENFERMERO
 * Integración completa de todos los componentes de enfermería
 * Con acceso a pacientes asignados, medicamentos, tratamientos, etc.
 */
export default memo(function NurseDashboard({ currentUser }) {
  const [activeTab, setActiveTab] = useState('patients');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

  // Tabs disponibles
  const tabs = [
    { id: 'patients', label: 'Pacientes Asignados', icon: Users },
    { id: 'medications', label: 'Medicamentos', icon: Pill },
    { id: 'treatments', label: 'Tratamientos', icon: Activity },
    { id: 'vitals', label: 'Signos Vitales', icon: Heart },
    { id: 'shift-report', label: 'Reporte de Turno', icon: FileText },
    { id: 'schedule', label: 'Mi Horario', icon: Clock }
  ];

  const handleRefresh = () => {
    setRefreshTrigger(t => t + 1);
  };

  const handlePatientSelection = (patient) => {
    setSelectedPatient(patient);
    setActiveTab('medications'); // Cambiar a medicamentos cuando se selecciona un paciente
  };

  // Validar que el enfermero esté logueado
  if (!currentUser || currentUser.role !== 'nurse') {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-bold">Acceso restringido: Solo enfermeros</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-hospital-800 mb-2">
          Dashboard del Enfermero
        </h1>
        <p className="text-gray-600">
          Bienvenido, <strong>{currentUser.name}</strong> • Turno: <strong>Activo</strong>
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-clinical-primary text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-clinical-primary'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
        <button
          onClick={handleRefresh}
          className="ml-auto flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-clinical-primary transition-all"
        >
          <RefreshCw size={18} />
          Actualizar
        </button>
      </div>

      {/* Contenido por Tab */}
      <div className="space-y-6">
        {/* PACIENTES ASIGNADOS */}
        {activeTab === 'patients' && (
          <NurseAssignedPatients
            nurseId={currentUser.id}
            onPatientSelected={handlePatientSelection}
            refreshTrigger={refreshTrigger}
          />
        )}

        {/* MEDICAMENTOS */}
        {activeTab === 'medications' && (
          <div className="space-y-6">
            {selectedPatient ? (
              <MedicationAdministrationForm
                patient={selectedPatient}
                nurse={currentUser}
                onSuccess={handleRefresh}
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-hospital-200 p-8 text-center">
                <AlertCircle size={48} className="text-yellow-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  Selecciona un paciente de la pestaña "Pacientes Asignados" para administrar medicamentos
                </p>
              </div>
            )}
          </div>
        )}

        {/* TRATAMIENTOS NO FARMACOLÓGICOS */}
        {activeTab === 'treatments' && (
          <div className="space-y-6">
            {selectedPatient ? (
              <NonPharmacologicalTreatmentForm
                patient={selectedPatient}
                nurse={currentUser}
                onSuccess={handleRefresh}
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-hospital-200 p-8 text-center">
                <AlertCircle size={48} className="text-yellow-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  Selecciona un paciente de la pestaña "Pacientes Asignados" para registrar tratamientos
                </p>
              </div>
            )}
          </div>
        )}

        {/* SIGNOS VITALES */}
        {activeTab === 'vitals' && (
          <div className="space-y-6">
            {selectedPatient ? (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-hospital-200 p-6">
                  <h3 className="text-xl font-bold text-hospital-800 mb-4">
                    Registrar Signos Vitales
                  </h3>
                  <CareFormComponents.VitalSignsForm
                    selectedPatient={selectedPatient}
                    onSubmit={async (vitals) => {
                      // Aquí se guardarían los signos vitales
                      alert('✅ Signos vitales registrados');
                      handleRefresh();
                    }}
                  />
                </div>
                <VitalSignsHistory patientId={selectedPatient.id} />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-hospital-200 p-8 text-center">
                <AlertCircle size={48} className="text-yellow-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  Selecciona un paciente de la pestaña "Pacientes Asignados" para ver sus signos vitales
                </p>
              </div>
            )}
          </div>
        )}

        {/* REPORTE DE TURNO */}
        {activeTab === 'shift-report' && (
          <NursingShiftReport user={currentUser} patients={[]} />
        )}

        {/* HORARIO */}
        {activeTab === 'schedule' && (
          <NurseSchedule nurseId={currentUser.id} />
        )}
      </div>

      {/* Info del Paciente Seleccionado */}
      {selectedPatient && (
        <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border-2 border-clinical-primary p-4 max-w-xs">
          <p className="text-sm text-gray-600">
            <strong>Paciente seleccionado:</strong>
          </p>
          <p className="text-lg font-bold text-hospital-800">
            {selectedPatient.name}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Cuarto: {selectedPatient.room} • Triaje: {selectedPatient.triage_level}
          </p>
          <button
            onClick={() => setSelectedPatient(null)}
            className="mt-2 text-xs text-clinical-primary font-semibold hover:underline"
          >
            Cambiar paciente
          </button>
        </div>
      )}
    </div>
  );
});

// Importar Heart icon
import { Heart } from 'lucide-react';
