import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import { Activity, Syringe, ClipboardList, Save, CheckCircle, Droplets, AlertCircle, Info } from 'lucide-react';
import { HelpTooltip } from './Tooltip';
import { validateAllVitalSigns, getValidationStyles } from '../utils/vitalSignsValidation';

/**
 * Componente memorizado para Signos Vitales
 * ESTADO ENCAPSULADO: cada componente maneja su propio estado
 * Esto evita que cambios en el padre causen re-renders indeseados
 */
export const VitalSignsForm = memo(({ 
  selectedPatient, 
  onSubmit 
}) => {
  const [vitals, setVitals] = useState({
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: ''
  });
  
  const [validations, setValidations] = useState({});

  const handleChange = useCallback((name, value) => {
    const updatedVitals = { ...vitals, [name]: value };
    setVitals(updatedVitals);
    
    // Validar en tiempo real solo si el campo tiene contenido
    if (value.trim()) {
      const validation = validateAllVitalSigns(updatedVitals);
      setValidations(validation.validations);
    }
  }, [vitals]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validar que todos los campos tengan datos
    if (!vitals.temperature || !vitals.bloodPressure || !vitals.heartRate || !vitals.respiratoryRate) {
      const { formatMessage } = await import('../utils/systemMessages.js');
      alert(formatMessage('ERR_02', 'Todos los campos de signos vitales son obligatorios'));
      return;
    }
    
    // Validar rangos fisiológicos
    const validation = validateAllVitalSigns(vitals);
    
    if (!validation.isValid) {
      alert("❌ VALORES INVÁLIDOS:\n\n" + validation.errors.join('\n') + "\n\nPor favor, verifica las mediciones e intenta de nuevo.");
      return;
    }
    
    // Advertencia si hay valores críticos
    if (validation.criticals.length > 0) {
      const confirmed = window.confirm(
        "⚠️ ADVERTENCIA - VALORES CRÍTICOS DETECTADOS:\n\n" +
        validation.criticals.join('\n') +
        "\n\n¿Confirmas que los valores son correctos y deseas guardarlos?"
      );
      if (!confirmed) return;
    }
    
    // Advertencia si hay valores anormales
    if (validation.warnings.length > 0) {
      const confirmed = window.confirm(
        "⚠️ VALORES FUERA DE RANGO NORMAL:\n\n" +
        validation.warnings.join('\n') +
        "\n\n¿Confirmas que los valores son correctos?"
      );
      if (!confirmed) return;
    }
    
    try {
      await onSubmit(vitals);
      // Limpiar después de enviar
      setVitals({ temperature: '', bloodPressure: '', heartRate: '', respiratoryRate: '' });
      setValidations({});
    } catch (error) {
      console.error('Error al guardar signos vitales:', error);
      alert("❌ Error al guardar signos vitales. Intenta de nuevo.");
    }
  }, [vitals, onSubmit]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-hospital-200 overflow-hidden">
      <div className="p-5 border-b border-hospital-100 bg-hospital-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-clinical-primary p-2 rounded-lg text-white"><Activity size={20}/></div>
          <h3 className="font-bold text-hospital-800">Registrar Signos Vitales</h3>
        </div>
        <HelpTooltip text="Los signos vitales se registran automáticamente con fecha y hora. Asegúrate de medirlos correctamente." />
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
          <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-800">
            <strong>Valores normales:</strong> Temp: 36-37°C • PA: 120/80 mmHg • FC: 60-100 lpm • FR: 12-20 rpm
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Temp (°C)', name: 'temperature', ph: '36.5', help: 'Temperatura corporal en grados Celsius' },
            { label: 'Presión', name: 'bloodPressure', ph: '120/80', help: 'Presión arterial (sistólica/diastólica)' },
            { label: 'Frec. Card.', name: 'heartRate', ph: '80', help: 'Frecuencia cardíaca en latidos por minuto' },
            { label: 'Frec. Resp.', name: 'respiratoryRate', ph: '18', help: 'Frecuencia respiratoria por minuto' }
          ].map((field) => {
            const validation = validations[field.name];
            const styles = validation ? getValidationStyles(validation.level) : getValidationStyles('default');
            
            return (
              <div key={field.name}>
                <label className="text-xs font-bold text-hospital-500 mb-1 flex items-center gap-1">
                  {field.label}
                  <HelpTooltip text={field.help} />
                </label>
                <input 
                  type="text" 
                  placeholder={field.ph} 
                  className={`w-full p-3 ${styles.bg} border ${styles.border} rounded-xl font-bold ${styles.text} outline-none focus:border-clinical-primary focus:ring-2 ${styles.ring} transition`}
                  value={vitals[field.name]} 
                  onChange={e => handleChange(field.name, e.target.value)}
                  aria-label={field.label}
                />
                {validation && validation.message && (
                  <p className={`text-xs mt-1 ${styles.text} font-medium flex items-center gap-1`}>
                    {validation.level === 'error' && <AlertCircle size={12} />}
                    {validation.level === 'critical' && <AlertCircle size={12} />}
                    {validation.level === 'warning' && <Info size={12} />}
                    {validation.level === 'normal' && <CheckCircle size={12} />}
                    {validation.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <button 
          type="submit" 
          className="mt-6 w-full py-3 bg-clinical-primary text-white rounded-xl font-bold hover:bg-clinical-dark transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!vitals.temperature || !vitals.bloodPressure || !vitals.heartRate || !vitals.respiratoryRate}
        >
          <CheckCircle size={18} />
          {!vitals.temperature || !vitals.bloodPressure || !vitals.heartRate || !vitals.respiratoryRate 
            ? 'Completa todos los campos' 
            : 'Guardar Registro'}
        </button>
      </form>
    </div>
  );
}, (prevProps, nextProps) => {
  // Memo SOLO compara selectedPatient y onSubmit
  return (prevProps.selectedPatient?.id === nextProps.selectedPatient?.id &&
          prevProps.onSubmit === nextProps.onSubmit);
});

VitalSignsForm.displayName = 'VitalSignsForm';

/**
 * Componente memorizado para Medicamentos
 * ESTADO ENCAPSULADO: maneja su propio estado de medicamentos
 */
export const MedicationForm = memo(({ 
  selectedPatient,
  onSubmit 
}) => {
  const [medication, setMedication] = useState({
    medication: '',
    dose: '',
    frequency: '',
    quantity: 1
  });
  const [stockInfo, setStockInfo] = useState(null);
  const [checkingStock, setCheckingStock] = useState(false);

  const handleChange = useCallback((field, value) => {
    setMedication(prev => ({ ...prev, [field]: value }));
  }, []);

  // Verificar stock cuando cambia el medicamento
  useEffect(() => {
    const checkStock = async () => {
      if (!medication.medication || medication.medication.trim().length < 3) {
        setStockInfo(null);
        return;
      }

      setCheckingStock(true);
      try {
        const { findMedicationByName } = await import('../services/database.js');
        const med = await findMedicationByName(medication.medication.trim());
        
        if (med) {
          const { getStockLevel, getStockLevelInfo } = await import('../utils/medicationStockValidation.js');
          const level = getStockLevel(med.quantity);
          const levelInfo = getStockLevelInfo(level);
          
          setStockInfo({
            available: med.quantity,
            level,
            levelInfo,
            canDispense: med.quantity >= (medication.quantity || 1)
          });
        } else {
          setStockInfo(null);
        }
      } catch (error) {
        console.error('Error verificando stock:', error);
      } finally {
        setCheckingStock(false);
      }
    };

    const debounce = setTimeout(checkStock, 500);
    return () => clearTimeout(debounce);
  }, [medication.medication, medication.quantity]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!medication.medication || !medication.dose || !medication.frequency) {
      alert("⚠️ Por favor completa todos los campos de medicamento");
      return;
    }

    // Validar cantidad
    const quantity = parseInt(medication.quantity) || 1;
    if (quantity <= 0) {
      alert("⚠️ La cantidad debe ser mayor a 0");
      return;
    }

    try {
      // Intentar dispensar (esto validará stock)
      const { dispenseMedication } = await import('../services/database.js');
      
      const result = await dispenseMedication({
        medicationName: medication.medication.trim(),
        quantity: quantity,
        patientId: selectedPatient?.id,
        patientName: selectedPatient?.name,
        dispensedBy: 'Usuario Actual', // TODO: obtener de sesión
        reason: `Dosis: ${medication.dose}, Frecuencia: ${medication.frequency}`
      });

      // Mostrar advertencia si el stock quedó bajo
      if (result.warning) {
        alert(`⚠️ ADVERTENCIA DE STOCK\n\n${result.warning}`);
      }

      // Llamar al callback original
      await onSubmit(medication);
      
      // Limpiar formulario
      setMedication({ medication: '', dose: '', frequency: '', quantity: 1 });
      setStockInfo(null);
      
      alert(`✅ Medicamento dispensado exitosamente\n\nStock restante: ${result.newStock} unidades`);
      
    } catch (error) {
      console.error('Error al dispensar medicamento:', error);
      alert(error.message || "❌ Error al dispensar medicamento");
    }
  }, [medication, onSubmit, selectedPatient]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-hospital-200 overflow-hidden">
      <div className="p-5 border-b border-hospital-100 bg-hospital-50 flex items-center gap-3">
        <div className="bg-emerald-500 p-2 rounded-lg text-white"><Syringe size={20}/></div>
        <h3 className="font-bold text-hospital-800">Medicamentos</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Advertencia de validación de stock */}
        <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
          <p className="text-sm font-bold text-blue-800">
            🔒 Validación de Stock Activa
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Solo se pueden dispensar medicamentos con inventario disponible.
          </p>
        </div>

        <input 
          type="text" 
          placeholder="Nombre del Fármaco" 
          className="w-full p-3 bg-hospital-50 border border-hospital-200 rounded-xl font-medium outline-none focus:border-emerald-500 transition"
          value={medication.medication} 
          onChange={e => handleChange('medication', e.target.value)} 
        />

        {/* Indicador de stock en tiempo real */}
        {checkingStock && (
          <div className="text-sm text-gray-500 italic">
            Verificando disponibilidad...
          </div>
        )}
        
        {stockInfo && (
          <div className={`p-3 rounded-lg border-2 ${
            stockInfo.level === 'CRITICAL' ? 'bg-red-50 border-red-200' :
            stockInfo.level === 'LOW' ? 'bg-yellow-50 border-yellow-200' :
            'bg-green-50 border-green-200'
          }`}>
            <p className="text-sm font-bold">
              {stockInfo.levelInfo.emoji} Stock disponible: {stockInfo.available} unidades
            </p>
            <p className="text-xs mt-1">
              Nivel: {stockInfo.levelInfo.label} • {stockInfo.levelInfo.action}
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-3">
          <input 
            type="text" 
            placeholder="Dosis" 
            className="p-3 bg-hospital-50 border border-hospital-200 rounded-xl font-medium outline-none focus:border-emerald-500 transition"
            value={medication.dose} 
            onChange={e => handleChange('dose', e.target.value)} 
          />
          <input 
            type="text" 
            placeholder="Frecuencia" 
            className="p-3 bg-hospital-50 border border-hospital-200 rounded-xl font-medium outline-none focus:border-emerald-500 transition"
            value={medication.frequency} 
            onChange={e => handleChange('frequency', e.target.value)} 
          />
          <input 
            type="number" 
            placeholder="Cantidad"
            min="1"
            className="p-3 bg-hospital-50 border border-hospital-200 rounded-xl font-medium outline-none focus:border-emerald-500 transition"
            value={medication.quantity} 
            onChange={e => handleChange('quantity', e.target.value)} 
          />
        </div>
        
        <button 
          type="submit" 
          disabled={stockInfo && !stockInfo.canDispense}
          className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition shadow-lg shadow-emerald-100 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {stockInfo && !stockInfo.canDispense ? '❌ Stock Insuficiente' : '✅ Dispensar Medicamento'}
        </button>
      </form>
    </div>
  );
}, (prevProps, nextProps) => {
  return (prevProps.selectedPatient?.id === nextProps.selectedPatient?.id &&
          prevProps.onSubmit === nextProps.onSubmit);
});

MedicationForm.displayName = 'MedicationForm';

/**
 * Componente memorizado para Notas Evolutivas
 * ESTADO ENCAPSULADO: maneja su propio estado de notas
 */
export const NoteForm = memo(({ 
  selectedPatient,
  onSubmit 
}) => {
  const [note, setNote] = useState('');

  const handleChange = useCallback((value) => {
    setNote(value);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    // Validar que el campo tenga datos
    if (!note || note.trim().length === 0) {
      alert("⚠️ Por favor escribe una nota");
      return;
    }
    try {
      await onSubmit(note);
      // Limpiar después de enviar
      setNote('');
    } catch (error) {
      console.error('Error al guardar nota:', error);
      alert("❌ Error al guardar nota. Intenta de nuevo.");
    }
  }, [note, onSubmit]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-hospital-200 overflow-hidden flex flex-col">
      <div className="p-5 border-b border-hospital-100 bg-hospital-50 flex items-center gap-3">
        <div className="bg-purple-500 p-2 rounded-lg text-white"><ClipboardList size={20}/></div>
        <h3 className="font-bold text-hospital-800">Nota Evolutiva</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-5 flex-1 flex flex-col">
        <textarea 
          rows="4" 
          placeholder="Observaciones SOAP..." 
          className="w-full p-3 bg-hospital-50 border border-hospital-200 rounded-xl font-medium outline-none focus:border-purple-500 transition resize-none flex-1 mb-4"
          value={note} 
          onChange={e => handleChange(e.target.value)}
        />
        <button 
          type="submit" 
          className="w-full py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition shadow-lg shadow-purple-100 mt-auto"
        >
          Guardar Nota
        </button>
      </form>
    </div>
  );
}, (prevProps, nextProps) => {
  return (prevProps.selectedPatient?.id === nextProps.selectedPatient?.id &&
          prevProps.onSubmit === nextProps.onSubmit);
});

NoteForm.displayName = 'NoteForm';

/**
 * Componente memorizado para Tratamientos No Farmacológicos
 * ESTADO ENCAPSULADO: maneja su propio estado de procedimientos
 */
export const NonPharmaForm = memo(({
  selectedPatient,
  onSubmit
}) => {
  const [treatment, setTreatment] = useState({
    treatmentType: 'Curación',
    description: '',
    duration: '',
    materials: ''
  });

  const treatmentTypes = [
    'Curación',
    'Nebulización',
    'Fluidoterapia',
    'Oxigenoterapia',
    'Aspiración de secreciones',
    'Vendaje',
    'Cateterismo',
    'Sonda nasogástrica',
    'Terapia respiratoria',
    'Otro'
  ];

  const handleChange = useCallback((field, value) => {
    setTreatment(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    // Validar que los campos obligatorios tengan datos
    if (!treatment.treatmentType || !treatment.description) {
      alert("⚠️ Por favor completa el tipo y descripción del tratamiento");
      return;
    }
    try {
      await onSubmit(treatment);
      // Limpiar después de enviar
      setTreatment({ treatmentType: 'Curación', description: '', duration: '', materials: '' });
    } catch (error) {
      console.error('Error al guardar tratamiento:', error);
      alert("❌ Error al guardar tratamiento. Intenta de nuevo.");
    }
  }, [treatment, onSubmit]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-hospital-200 overflow-hidden">
      <div className="p-5 border-b border-hospital-100 bg-hospital-50 flex items-center gap-3">
        <div className="bg-cyan-500 p-2 rounded-lg text-white"><Droplets size={20}/></div>
        <h3 className="font-bold text-hospital-800">Tratamiento No Farmacológico</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="text-xs font-bold text-hospital-500 mb-1 block ml-1">Tipo de Tratamiento</label>
          <select
            className="w-full p-3 bg-hospital-50 border border-hospital-200 rounded-xl font-medium outline-none focus:border-cyan-500 transition"
            value={treatment.treatmentType}
            onChange={e => handleChange('treatmentType', e.target.value)}
          >
            {treatmentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-hospital-500 mb-1 block ml-1">Descripción del Procedimiento</label>
          <textarea
            rows="3"
            placeholder="Detalles del tratamiento aplicado..."
            className="w-full p-3 bg-hospital-50 border border-hospital-200 rounded-xl font-medium outline-none focus:border-cyan-500 transition resize-none"
            value={treatment.description}
            onChange={e => handleChange('description', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-hospital-500 mb-1 block ml-1">Duración</label>
            <input
              type="text"
              placeholder="Ej: 30 min"
              className="w-full p-3 bg-hospital-50 border border-hospital-200 rounded-xl font-medium outline-none focus:border-cyan-500 transition"
              value={treatment.duration}
              onChange={e => handleChange('duration', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-hospital-500 mb-1 block ml-1">Materiales Utilizados</label>
            <input
              type="text"
              placeholder="Ej: Gasas, suero"
              className="w-full p-3 bg-hospital-50 border border-hospital-200 rounded-xl font-medium outline-none focus:border-cyan-500 transition"
              value={treatment.materials}
              onChange={e => handleChange('materials', e.target.value)}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition shadow-lg shadow-cyan-100"
        >
          Registrar Procedimiento
        </button>
      </form>
    </div>
  );
}, (prevProps, nextProps) => {
  return (prevProps.selectedPatient?.id === nextProps.selectedPatient?.id &&
          prevProps.onSubmit === nextProps.onSubmit);
});

NonPharmaForm.displayName = 'NonPharmaForm';

/**
 * Componente contenedor para los cuatro formularios con opción de "Guardar Todo"
 */
export const CareFormGroup = memo(({
  selectedPatient,
  onVitalSubmit,
  onMedicationSubmit,
  onNoteSubmit,
  onNonPharmaSubmit
}) => {
  const vitalFormRef = useRef(null);
  const medicationFormRef = useRef(null);
  const noteFormRef = useRef(null);
  const nonPharmaFormRef = useRef(null);

  const handleSaveAll = useCallback(async () => {
    try {
      // Ejecutar los cuatro formularios en paralelo
      const results = await Promise.allSettled([
        vitalFormRef.current?.submitForm?.(),
        medicationFormRef.current?.submitForm?.(),
        noteFormRef.current?.submitForm?.(),
        nonPharmaFormRef.current?.submitForm?.()
      ]);

      // Contar cuántos se guardaron exitosamente
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (successful > 0) {
        alert(`✅ Se guardaron ${successful} registro(s) exitosamente.${failed > 0 ? `\n⚠️ ${failed} registro(s) fallaron.` : ''}`);
      } else {
        alert("⚠️ No se guardó ningún registro. Por favor verifica los campos.");
      }
    } catch (error) {
      console.error('Error al guardar todo:', error);
      alert("❌ Error al guardar los registros.");
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Signos Vitales */}
      <VitalSignsFormWithRef
        ref={vitalFormRef}
        selectedPatient={selectedPatient}
        onSubmit={onVitalSubmit}
      />

      {/* Medicamentos, Notas y Procedimientos en grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MedicationFormWithRef
          ref={medicationFormRef}
          selectedPatient={selectedPatient}
          onSubmit={onMedicationSubmit}
        />

        <NoteFormWithRef
          ref={noteFormRef}
          selectedPatient={selectedPatient}
          onSubmit={onNoteSubmit}
        />
      </div>

      {/* Tratamientos No Farmacológicos */}
      <NonPharmaFormWithRef
        ref={nonPharmaFormRef}
        selectedPatient={selectedPatient}
        onSubmit={onNonPharmaSubmit}
      />

      {/* Botón "Guardar Todo" */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-dashed border-blue-200">
        <button
          onClick={handleSaveAll}
          className="w-full py-4 bg-gradient-to-r from-clinical-primary to-purple-600 text-white rounded-xl font-bold hover:from-clinical-dark hover:to-purple-700 transition shadow-lg flex items-center justify-center gap-3 text-lg"
        >
          <CheckCircle size={24} />
          💾 Guardar Todo (Signos, Medicamentos, Notas, Procedimientos)
        </button>
        <p className="text-xs text-hospital-500 mt-3 text-center">
          💡 Este botón guarda todos los formularios completados a la vez. Los campos vacíos se ignoran.
        </p>
      </div>
    </div>
  );
});

CareFormGroup.displayName = 'CareFormGroup';

// ========== VERSIONES CON REF PARA CONTROL DEL PADRE ==========

/**
 * Versión de VitalSignsForm con ref para permitir submit desde el padre
 */
const VitalSignsFormWithRef = memo(React.forwardRef(({
  selectedPatient,
  onSubmit
}, ref) => {
  const [vitals, setVitals] = useState({
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: ''
  });

  const handleChange = useCallback((name, value) => {
    setVitals(prev => ({ ...prev, [name]: value }));
  }, []);

  const submitForm = useCallback(async () => {
    // Validar que todos los campos tengan datos
    if (!vitals.temperature || !vitals.bloodPressure || !vitals.heartRate || !vitals.respiratoryRate) {
      throw new Error("Signos vitales incompletos");
    }
    try {
      await onSubmit(vitals);
      setVitals({ temperature: '', bloodPressure: '', heartRate: '', respiratoryRate: '' });
      return true;
    } catch (error) {
      console.error('Error al guardar signos vitales:', error);
      throw error;
    }
  }, [vitals, onSubmit]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      await submitForm();
      alert("✅ Signos vitales registrados.");
    } catch (error) {
      alert("⚠️ " + error.message);
    }
  }, [submitForm]);

  React.useImperativeHandle(ref, () => ({
    submitForm
  }), [submitForm]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-hospital-200 overflow-hidden">
      <div className="p-5 border-b border-hospital-100 bg-hospital-50 flex items-center gap-3">
        <div className="bg-clinical-primary p-2 rounded-lg text-white"><Activity size={20}/></div>
        <h3 className="font-bold text-hospital-800">Registrar Signos Vitales</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Temp (°C)', name: 'temperature', ph: '36.5' },
            { label: 'Presión', name: 'bloodPressure', ph: '120/80' },
            { label: 'Frec. Card.', name: 'heartRate', ph: '80' },
            { label: 'Frec. Resp.', name: 'respiratoryRate', ph: '18' }
          ].map((field) => (
            <div key={field.name}>
              <label className="text-xs font-bold text-hospital-500 mb-1 block ml-1">{field.label}</label>
              <input 
                type="text" 
                placeholder={field.ph} 
                className="w-full p-3 bg-hospital-50 border border-hospital-200 rounded-xl font-bold text-hospital-800 outline-none focus:border-clinical-primary transition"
                value={vitals[field.name]} 
                onChange={e => handleChange(field.name, e.target.value)} 
              />
            </div>
          ))}
        </div>
        <button 
          type="submit" 
          className="mt-6 w-full py-3 bg-clinical-primary text-white rounded-xl font-bold hover:bg-clinical-dark transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
        >
          ✅ Guardar Registro
        </button>
      </form>
    </div>
  );
}), (prevProps, nextProps) => {
  return (prevProps.selectedPatient?.id === nextProps.selectedPatient?.id &&
          prevProps.onSubmit === nextProps.onSubmit);
});

VitalSignsFormWithRef.displayName = 'VitalSignsFormWithRef';

/**
 * Versión de MedicationForm con ref
 */
const MedicationFormWithRef = memo(React.forwardRef(({
  selectedPatient,
  onSubmit
}, ref) => {
  const [medication, setMedication] = useState({
    medication: '',
    dose: '',
    frequency: ''
  });

  const handleChange = useCallback((field, value) => {
    setMedication(prev => ({ ...prev, [field]: value }));
  }, []);

  const submitForm = useCallback(async () => {
    if (!medication.medication || !medication.dose || !medication.frequency) {
      throw new Error("Medicamento incompleto");
    }
    try {
      await onSubmit(medication);
      setMedication({ medication: '', dose: '', frequency: '' });
      return true;
    } catch (error) {
      console.error('Error al guardar medicamento:', error);
      throw error;
    }
  }, [medication, onSubmit]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      await submitForm();
      alert("✅ Medicamento registrado.");
    } catch (error) {
      alert("⚠️ " + error.message);
    }
  }, [submitForm]);

  React.useImperativeHandle(ref, () => ({
    submitForm
  }), [submitForm]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-hospital-200 overflow-hidden">
      <div className="p-5 border-b border-hospital-100 bg-hospital-50 flex items-center gap-3">
        <div className="bg-emerald-500 p-2 rounded-lg text-white"><Syringe size={20}/></div>
        <h3 className="font-bold text-hospital-800">Medicamentos</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <input 
          type="text" 
          placeholder="Nombre del Fármaco" 
          className="w-full p-3 bg-hospital-50 border border-hospital-200 rounded-xl font-medium outline-none focus:border-emerald-500 transition"
          value={medication.medication} 
          onChange={e => handleChange('medication', e.target.value)} 
        />
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="Dosis" 
            className="flex-1 p-3 bg-hospital-50 border border-hospital-200 rounded-xl font-medium outline-none focus:border-emerald-500 transition"
            value={medication.dose} 
            onChange={e => handleChange('dose', e.target.value)} 
          />
          <input 
            type="text" 
            placeholder="Frecuencia" 
            className="flex-1 p-3 bg-hospital-50 border border-hospital-200 rounded-xl font-medium outline-none focus:border-emerald-500 transition"
            value={medication.frequency} 
            onChange={e => handleChange('frequency', e.target.value)} 
          />
        </div>
        <button 
          type="submit" 
          className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition shadow-lg shadow-emerald-100"
        >
          Registrar Aplicación
        </button>
      </form>
    </div>
  );
}), (prevProps, nextProps) => {
  return (prevProps.selectedPatient?.id === nextProps.selectedPatient?.id &&
          prevProps.onSubmit === nextProps.onSubmit);
});

MedicationFormWithRef.displayName = 'MedicationFormWithRef';

/**
 * Versión de NoteForm con ref
 */
const NoteFormWithRef = memo(React.forwardRef(({
  selectedPatient,
  onSubmit
}, ref) => {
  const [note, setNote] = useState('');

  const handleChange = useCallback((value) => {
    setNote(value);
  }, []);

  const submitForm = useCallback(async () => {
    if (!note || note.trim().length === 0) {
      throw new Error("Nota vacía");
    }
    try {
      await onSubmit(note);
      setNote('');
      return true;
    } catch (error) {
      console.error('Error al guardar nota:', error);
      throw error;
    }
  }, [note, onSubmit]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      await submitForm();
      alert("✅ Nota guardada.");
    } catch (error) {
      alert("⚠️ " + error.message);
    }
  }, [submitForm]);

  React.useImperativeHandle(ref, () => ({
    submitForm
  }), [submitForm]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-hospital-200 overflow-hidden flex flex-col">
      <div className="p-5 border-b border-hospital-100 bg-hospital-50 flex items-center gap-3">
        <div className="bg-purple-500 p-2 rounded-lg text-white"><ClipboardList size={20}/></div>
        <h3 className="font-bold text-hospital-800">Nota Evolutiva</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-5 flex-1 flex flex-col">
        <textarea 
          rows="4" 
          placeholder="Observaciones SOAP..." 
          className="w-full p-3 bg-hospital-50 border border-hospital-200 rounded-xl font-medium outline-none focus:border-purple-500 transition resize-none flex-1 mb-4"
          value={note} 
          onChange={e => handleChange(e.target.value)}
        />
        <button 
          type="submit" 
          className="w-full py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition shadow-lg shadow-purple-100 mt-auto"
        >
          Guardar Nota
        </button>
      </form>
    </div>
  );
}), (prevProps, nextProps) => {
  return (prevProps.selectedPatient?.id === nextProps.selectedPatient?.id &&
          prevProps.onSubmit === nextProps.onSubmit);
});

NoteFormWithRef.displayName = 'NoteFormWithRef';

/**
 * Versión de NonPharmaForm con ref
 */
const NonPharmaFormWithRef = memo(React.forwardRef(({
  selectedPatient,
  onSubmit
}, ref) => {
  const [treatment, setTreatment] = useState({
    treatmentType: 'Curación',
    description: '',
    duration: '',
    materials: ''
  });

  const treatmentTypes = [
    'Curación',
    'Nebulización',
    'Fluidoterapia',
    'Oxigenoterapia',
    'Aspiración de secreciones',
    'Vendaje',
    'Cateterismo',
    'Sonda nasogástrica',
    'Terapia respiratoria',
    'Otro'
  ];

  const handleChange = useCallback((field, value) => {
    setTreatment(prev => ({ ...prev, [field]: value }));
  }, []);

  const submitForm = useCallback(async () => {
    if (!treatment.treatmentType || !treatment.description) {
      throw new Error("Tratamiento incompleto");
    }
    try {
      await onSubmit(treatment);
      setTreatment({ treatmentType: 'Curación', description: '', duration: '', materials: '' });
      return true;
    } catch (error) {
      console.error('Error al guardar tratamiento:', error);
      throw error;
    }
  }, [treatment, onSubmit]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      await submitForm();
      alert("✅ Tratamiento registrado.");
    } catch (error) {
      alert("⚠️ " + error.message);
    }
  }, [submitForm]);

  React.useImperativeHandle(ref, () => ({
    submitForm
  }), [submitForm]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-hospital-200 overflow-hidden">
      <div className="p-5 border-b border-hospital-100 bg-hospital-50 flex items-center gap-3">
        <div className="bg-cyan-500 p-2 rounded-lg text-white"><Droplets size={20}/></div>
        <h3 className="font-bold text-hospital-800">Tratamiento No Farmacológico</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="text-xs font-bold text-hospital-500 mb-1 block ml-1">Tipo de Tratamiento</label>
          <select
            className="w-full p-3 bg-hospital-50 border border-hospital-200 rounded-xl font-medium outline-none focus:border-cyan-500 transition"
            value={treatment.treatmentType}
            onChange={e => handleChange('treatmentType', e.target.value)}
          >
            {treatmentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-hospital-500 mb-1 block ml-1">Descripción del Procedimiento</label>
          <textarea
            rows="3"
            placeholder="Detalles del tratamiento aplicado..."
            className="w-full p-3 bg-hospital-50 border border-hospital-200 rounded-xl font-medium outline-none focus:border-cyan-500 transition resize-none"
            value={treatment.description}
            onChange={e => handleChange('description', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-hospital-500 mb-1 block ml-1">Duración</label>
            <input
              type="text"
              placeholder="Ej: 30 min"
              className="w-full p-3 bg-hospital-50 border border-hospital-200 rounded-xl font-medium outline-none focus:border-cyan-500 transition"
              value={treatment.duration}
              onChange={e => handleChange('duration', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-hospital-500 mb-1 block ml-1">Materiales Utilizados</label>
            <input
              type="text"
              placeholder="Ej: Gasas, suero"
              className="w-full p-3 bg-hospital-50 border border-hospital-200 rounded-xl font-medium outline-none focus:border-cyan-500 transition"
              value={treatment.materials}
              onChange={e => handleChange('materials', e.target.value)}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition shadow-lg shadow-cyan-100"
        >
          Registrar Procedimiento
        </button>
      </form>
    </div>
  );
}), (prevProps, nextProps) => {
  return (prevProps.selectedPatient?.id === nextProps.selectedPatient?.id &&
          prevProps.onSubmit === nextProps.onSubmit);
});

NonPharmaFormWithRef.displayName = 'NonPharmaFormWithRef';
