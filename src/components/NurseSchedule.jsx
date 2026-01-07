import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle, User } from 'lucide-react';

/**
 * 📅 COMPONENTE: Horario del Enfermero
 * 
 * Muestra los turnos asignados al enfermero
 * Incluyendo día, hora, departamento y estado
 */
export default function NurseSchedule({ user }) {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    loadShifts();
  }, [user?.id]);

  const loadShifts = async () => {
    try {
      setLoading(true);
      // Por ahora, simulamos datos. En producción, cargaríamos desde DB
      // const data = await getShiftsByUserId(user.id);
      
      // SIMULACIÓN DE DATOS
      const mockShifts = [
        {
          id: 1,
          date: new Date().toISOString().split('T')[0],
          start_time: '06:00',
          end_time: '14:00',
          shift_type: 'Mañana',
          department: 'Medicina Interna',
          status: 'Scheduled',
          notes: 'Turno normal'
        },
        {
          id: 2,
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          start_time: '14:00',
          end_time: '22:00',
          shift_type: 'Tarde',
          department: 'Urgencias',
          status: 'Scheduled',
          notes: 'Cobertura adicional'
        },
        {
          id: 3,
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          start_time: '22:00',
          end_time: '06:00',
          shift_type: 'Noche',
          department: 'UCI',
          status: 'Scheduled',
          notes: null
        }
      ];
      
      setShifts(mockShifts);
    } catch (err) {
      console.error('Error cargando horario:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTodayShifts = () => {
    const today = new Date().toISOString().split('T')[0];
    return shifts.filter(s => s.date === today);
  };

  const getUpcomingShifts = () => {
    const today = new Date().toISOString().split('T')[0];
    return shifts.filter(s => s.date > today).sort((a, b) => a.date.localeCompare(b.date));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getShiftColor = (type) => {
    switch (type) {
      case 'Mañana':
        return 'from-yellow-500 to-orange-500';
      case 'Tarde':
        return 'from-orange-500 to-red-500';
      case 'Noche':
        return 'from-blue-900 to-blue-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getShiftIcon = (type) => {
    switch (type) {
      case 'Mañana':
        return '🌅';
      case 'Tarde':
        return '☀️';
      case 'Noche':
        return '🌙';
      default:
        return '⏰';
    }
  };

  const displayShifts = activeTab === 'today' ? getTodayShifts() : getUpcomingShifts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Calendar className="text-blue-600" size={32} />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mi Horario</h2>
          <p className="text-sm text-gray-600 mt-1">
            {user?.name || 'Enfermero'} - Turno: {user?.shift?.start ? `${user.shift.start} - ${user.shift.end}` : 'No asignado'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'today'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Hoy
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'upcoming'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Próximos Turnos
        </button>
      </div>

      {/* Lista de Turnos */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="spinner w-8 h-8 border-3 mb-3"></div>
          <p className="text-gray-600">Cargando horario...</p>
        </div>
      ) : displayShifts.length === 0 ? (
        <div className="p-8 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <Calendar className="mx-auto mb-3 text-blue-600" size={32} />
          <p className="text-blue-800 font-semibold">
            {activeTab === 'today' ? 'Sin turno hoy' : 'Sin próximos turnos'}
          </p>
          <p className="text-blue-600 text-sm mt-1">
            {activeTab === 'today'
              ? 'No tiene turno asignado para hoy'
              : 'No hay más turnos programados'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayShifts.map((shift) => (
            <div
              key={shift.id}
              className={`bg-gradient-to-r ${getShiftColor(
                shift.shift_type
              )} p-6 rounded-lg text-white shadow-lg hover:shadow-xl transition-shadow`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fecha y Tipo */}
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{getShiftIcon(shift.shift_type)}</div>
                  <div>
                    <p className="text-sm font-semibold opacity-90">
                      {formatDate(shift.date)}
                    </p>
                    <p className="text-2xl font-bold mt-1">{shift.shift_type}</p>
                    <span className="inline-block mt-2 bg-white bg-opacity-30 px-3 py-1 rounded-full text-sm font-bold">
                      {shift.status === 'Scheduled' ? '✓ Programado' : shift.status}
                    </span>
                  </div>
                </div>

                {/* Hora */}
                <div className="flex items-center gap-3">
                  <Clock size={24} className="flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold opacity-90">HORARIO</p>
                    <p className="text-xl font-bold">
                      {shift.start_time} - {shift.end_time}
                    </p>
                    <p className="text-sm opacity-75 mt-1">
                      {Math.round(
                        (parseInt(shift.end_time) - parseInt(shift.start_time)) || 8
                      )}{' '}
                      horas
                    </p>
                  </div>
                </div>

                {/* Departamento */}
                <div className="flex items-center gap-3">
                  <MapPin size={24} className="flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold opacity-90">DEPARTAMENTO</p>
                    <p className="text-xl font-bold">{shift.department}</p>
                    {shift.notes && (
                      <p className="text-sm opacity-75 mt-1">{shift.notes}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-4 pt-4 border-t border-white border-opacity-30 flex gap-2">
                <button className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold py-2 rounded-lg transition-all">
                  Ver Pacientes
                </button>
                <button className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold py-2 rounded-lg transition-all">
                  Tareas del Turno
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resumen de horario semanal */}
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Resumen Semanal
        </h3>

        <div className="grid grid-cols-7 gap-2">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, idx) => {
            const dayDate = new Date();
            dayDate.setDate(dayDate.getDate() - dayDate.getDay() + idx + 1);
            const dateStr = dayDate.toISOString().split('T')[0];
            const hasShift = shifts.some(s => s.date === dateStr);

            return (
              <div
                key={idx}
                className={`p-3 rounded-lg text-center font-bold text-sm transition-all ${
                  hasShift
                    ? 'bg-green-100 text-green-800 border-2 border-green-400'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                }`}
              >
                <p>{day}</p>
                <p className="text-xs mt-1">
                  {hasShift ? '✓ Turno' : 'Libre'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nota informativa */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <p className="font-bold mb-1">ℹ️ Información de Horario</p>
        <p>
          Este es tu horario de trabajo programado. Puedes ver tus turnos, departamentos asignados
          y horarios. Si necesitas cambios en tu horario, comunícate con el administrador.
        </p>
      </div>
    </div>
  );
}
