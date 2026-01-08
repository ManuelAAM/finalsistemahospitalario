import React, { useEffect, useState } from 'react';
import { User, Clock, MapPin, AlertTriangle, CheckCircle, Briefcase, ClipboardList, AlertCircle, FileText, Bell, Mail, Phone, CreditCard, Calendar } from 'lucide-react';

export default function UserProfile({ user }) {
  const [shiftStatus, setShiftStatus] = useState('checking');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [canEditSchedule, setCanEditSchedule] = useState(false);

  // Datos de ejemplo para demostración
  const [shiftData, setShiftData] = useState({
    generalObservations: 'Turno con carga de trabajo moderada. Se recibieron 2 pacientes nuevos de urgencias. Personal completo sin ausencias.',
    pendingTasks: [
      { id: 1, task: 'Revisar signos vitales de paciente en hab. 302 cada 2 horas', priority: 'alta', completed: false },
      { id: 2, task: 'Preparar documentación de alta para María López', priority: 'media', completed: false },
      { id: 3, task: 'Coordinar traslado a UCI de paciente en hab. 215', priority: 'alta', completed: false },
      { id: 4, task: 'Actualizar inventario de medicamentos controlados', priority: 'baja', completed: true }
    ],
    incidents: [
      { id: 1, time: '14:30', description: 'Paciente Juan Ramírez presentó episodio de taquicardia (120 lpm). Se notificó a médico de guardia. Estabilizado con medicación.', severity: 'media' },
      { id: 2, time: '16:45', description: 'Alarma de monitor desconectado en hab. 310. Falsa alarma, se reconfiguró equipo.', severity: 'baja' }
    ],
    handoverNotes: 'Paciente en hab. 302 (García Pérez) requiere vigilancia estrecha nocturna por riesgo de deterioro. Familiar acompañante autorizado hasta las 22:00. Paciente en hab. 215 pendiente de resultados de laboratorio para decisión de traslado a UCI.'
  });

  useEffect(() => {
    // Solo el enfermero principal puede editar horarios
    setCanEditSchedule(user.username === 'enfermero');
    
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Actualizar cada minuto

    const checkShift = () => {
      // Si no hay datos de turno, asumimos desconocido
      if (!user.shift || !user.shift.start) return 'unknown';
      
      const now = new Date();
      // Convertir hora actual a decimal (ej: 14:30 -> 14.5)
      const currentH = now.getHours() + now.getMinutes() / 60;
      
      // Parsear horas de inicio y fin (ej: "06:00")
      const [sh, sm] = user.shift.start.split(':').map(Number);
      const [eh, em] = user.shift.end.split(':').map(Number);
      
      const start = sh + sm/60;
      const end = eh + em/60;

      // Validación simple (asume turno en el mismo día)
      if (currentH >= start && currentH < end) {
        return 'active';
      }
      return 'inactive'; // Fuera de turno -> ERR-15
    };

    setShiftStatus(checkShift());
    return () => clearInterval(timer);
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Perfil */}
      <div className="bg-gradient-to-br from-clinical-primary to-blue-600 p-8 rounded-3xl shadow-lg text-white">
        <div className="flex items-start gap-6">
          <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-white/30">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-4xl font-black mb-2">{user.name}</h2>
            <div className="flex flex-wrap gap-3 mb-4">
               <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-bold">
                 <Briefcase size={14}/> {user.role === 'nurse' ? 'Enfermería General' : user.role === 'doctor' ? 'Médico' : 'Administrador'}
               </span>
               <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-bold">
                 <CreditCard size={14}/> Cédula: {user.cedula || user.license_number || 'No asignada'}
               </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail size={16} className="opacity-80"/>
                <span>{user.email || 'Sin email registrado'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="opacity-80"/>
                <span>{user.phone || '(555) 123-4567'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="opacity-80"/>
                <span>Ingreso: {user.hire_date || '01/01/2024'}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="opacity-80"/>
                <span>Usuario: {user.username}</span>
              </div>
            </div>
          </div>
          <div className="text-right bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
             <p className="text-xs uppercase font-bold opacity-80 mb-1">Hora Sistema</p>
             <p className="text-3xl font-mono font-black">
               {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </p>
             <p className="text-xs opacity-80 mt-1">{currentTime.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Detalle Jornada (ECU-14) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-hospital-200">
           <h3 className="font-bold text-hospital-800 mb-4 flex items-center gap-2">
             <Clock className="text-clinical-primary"/> Mi Jornada Laboral
           </h3>
           
           {!canEditSchedule && (
             <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
               📌 Solo el enfermero principal puede modificar horarios
             </div>
           )}
           
           <div className="space-y-3">
             <div className="flex justify-between p-3 bg-hospital-50 rounded-xl">
               <span className="text-hospital-500 text-sm">Horario</span>
               <span className="font-bold text-hospital-800">{user.shift?.start} - {user.shift?.end}</span>
             </div>
             <div className="flex justify-between p-3 bg-hospital-50 rounded-xl">
               <span className="text-hospital-500 text-sm">Ubicación</span>
               <span className="font-bold text-hospital-800 flex items-center gap-1"><MapPin size={14}/> {user.shift?.area}</span>
             </div>
           </div>
        </div>

        {/* Estado y Error (ERR-15) */}
        <div className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center text-center ${
          shiftStatus === 'active' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
        }`}>
           {shiftStatus === 'active' ? (
             <>
               <CheckCircle size={40} className="text-emerald-500 mb-2"/>
               <h3 className="text-xl font-bold text-emerald-800">Jornada Activa</h3>
               <p className="text-emerald-600 text-sm">Sistema habilitado para registros.</p>
             </>
           ) : (
             <>
               <AlertTriangle size={40} className="text-red-500 mb-2"/>
               <h3 className="text-xl font-bold text-red-800">Fuera de Horario</h3>
               <div className="bg-white px-3 py-1 rounded border border-red-200 text-red-600 font-mono font-bold text-xs mt-2 mb-2">CODIGO: ERR-15</div>
               <p className="text-red-600 text-sm">No tiene una jornada laboral activa. El acceso a edición está restringido.</p>
             </>
           )}
        </div>
      </div>

      {/* Sección de Gestión de Turno */}
      <div className="space-y-6">
        {/* Observaciones Generales */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-hospital-200">
          <h3 className="font-bold text-hospital-800 mb-4 flex items-center gap-2">
            <FileText className="text-blue-500"/> Observaciones Generales del Turno
          </h3>
          <div className="bg-hospital-50 p-4 rounded-xl">
            <p className="text-hospital-700 text-sm leading-relaxed">
              {shiftData.generalObservations}
            </p>
            {canEditSchedule && (
              <button className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-bold">
                ✏️ Editar observaciones
              </button>
            )}
          </div>
        </div>

        {/* Tareas Pendientes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-hospital-200">
          <h3 className="font-bold text-hospital-800 mb-4 flex items-center gap-2">
            <ClipboardList className="text-purple-500"/> Tareas Pendientes
          </h3>
          <div className="space-y-2">
            {shiftData.pendingTasks.map(task => (
              <div key={task.id} className={`p-3 rounded-xl border ${task.completed ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-hospital-200'}`}>
                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    checked={task.completed}
                    disabled={!canEditSchedule}
                    className="mt-1 w-4 h-4 rounded border-hospital-300"
                    onChange={() => {
                      if (canEditSchedule) {
                        setShiftData(prev => ({
                          ...prev,
                          pendingTasks: prev.pendingTasks.map(t => 
                            t.id === task.id ? {...t, completed: !t.completed} : t
                          )
                        }));
                      }
                    }}
                  />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${task.completed ? 'line-through text-hospital-400' : 'text-hospital-800'}`}>
                      {task.task}
                    </p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${
                      task.priority === 'alta' ? 'bg-red-100 text-red-700' :
                      task.priority === 'media' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      Prioridad: {task.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {canEditSchedule && (
            <button className="mt-4 w-full py-2 border-2 border-dashed border-hospital-300 rounded-xl text-hospital-500 text-sm font-bold hover:border-purple-400 hover:text-purple-600 transition">
              + Agregar tarea
            </button>
          )}
        </div>

        {/* Incidentes Reportados */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-hospital-200">
          <h3 className="font-bold text-hospital-800 mb-4 flex items-center gap-2">
            <AlertCircle className="text-amber-500"/> Incidentes del Turno
          </h3>
          <div className="space-y-3">
            {shiftData.incidents.length > 0 ? (
              shiftData.incidents.map(incident => (
                <div key={incident.id} className={`p-4 rounded-xl border-l-4 ${
                  incident.severity === 'alta' ? 'bg-red-50 border-red-500' :
                  incident.severity === 'media' ? 'bg-amber-50 border-amber-500' :
                  'bg-blue-50 border-blue-500'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="bg-white px-2 py-1 rounded text-xs font-bold text-hospital-700 border border-hospital-200">
                      {incident.time}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-hospital-700 leading-relaxed">
                        {incident.description}
                      </p>
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold ${
                        incident.severity === 'alta' ? 'bg-red-200 text-red-800' :
                        incident.severity === 'media' ? 'bg-amber-200 text-amber-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        Severidad: {incident.severity}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-hospital-400 italic">
                No se han reportado incidentes en este turno
              </div>
            )}
          </div>
          {canEditSchedule && (
            <button className="mt-4 w-full py-2 border-2 border-dashed border-hospital-300 rounded-xl text-hospital-500 text-sm font-bold hover:border-amber-400 hover:text-amber-600 transition">
              + Reportar incidente
            </button>
          )}
        </div>

        {/* Notas de Relevo */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-hospital-200">
          <h3 className="font-bold text-hospital-800 mb-4 flex items-center gap-2">
            <Bell className="text-green-500"/> Notas de Relevo (Handover)
          </h3>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
            <p className="text-hospital-800 text-sm leading-relaxed font-medium whitespace-pre-line">
              {shiftData.handoverNotes}
            </p>
            {canEditSchedule && (
              <button className="mt-3 text-xs text-green-600 hover:text-green-700 font-bold">
                ✏️ Editar notas de relevo
              </button>
            )}
          </div>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
            <strong>💡 Tip:</strong> Las notas de relevo son críticas para la continuidad del cuidado. Asegúrate de incluir información vital para el siguiente turno.
          </div>
        </div>
      </div>
    </div>
  );
}
