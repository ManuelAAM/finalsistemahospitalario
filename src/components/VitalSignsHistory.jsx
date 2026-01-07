import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Area, AreaChart
} from 'recharts';
import { Activity, TrendingUp, AlertCircle, Download } from 'lucide-react';
import { getVitalSignsByPatientId } from '../services/database';

/**
 * 📊 COMPONENTE: Historial de Signos Vitales
 * 
 * Muestra el historial gráfico de signos vitales del paciente
 * Permite visualizar tendencias a lo largo del tiempo
 */
export default function VitalSignsHistory({ patientId }) {
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [stats, setStats] = useState({
    avgTemp: 0,
    avgBP: { systolic: 0, diastolic: 0 },
    avgHR: 0,
    avgRR: 0
  });

  useEffect(() => {
    loadVitals();
  }, [patientId]);

  const loadVitals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVitalSignsByPatientId(patientId);
      
      if (data && data.length > 0) {
        // Procesar datos para gráficos
        const processedData = data.reverse().map((v, idx) => ({
          ...v,
          index: idx,
          date: formatDateShort(v.date),
          temperature: parseFloat(v.temperature) || 0,
          heartRate: parseInt(v.heart_rate) || 0,
          respiratoryRate: parseInt(v.respiratory_rate) || 0,
          bpSystolic: extractBPSystolic(v.blood_pressure),
          bpDiastolic: extractBPDiastolic(v.blood_pressure)
        }));
        
        setVitals(processedData);
        calculateStats(processedData);
      }
    } catch (err) {
      console.error('Error cargando signos vitales:', err);
      setError('Error al cargar el historial de signos vitales');
    } finally {
      setLoading(false);
    }
  };

  const extractBPSystolic = (bp) => {
    if (!bp) return 0;
    return parseInt(bp.split('/')[0]) || 0;
  };

  const extractBPDiastolic = (bp) => {
    if (!bp) return 0;
    return parseInt(bp.split('/')[1]) || 0;
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr.substring(0, 10);
    }
  };

  const calculateStats = (data) => {
    if (data.length === 0) return;

    const avgTemp = (data.reduce((sum, v) => sum + v.temperature, 0) / data.length).toFixed(1);
    const avgHR = Math.round(data.reduce((sum, v) => sum + v.heartRate, 0) / data.length);
    const avgRR = Math.round(data.reduce((sum, v) => sum + v.respiratoryRate, 0) / data.length);
    const avgSystolic = Math.round(data.reduce((sum, v) => sum + v.bpSystolic, 0) / data.length);
    const avgDiastolic = Math.round(data.reduce((sum, v) => sum + v.bpDiastolic, 0) / data.length);

    setStats({
      avgTemp: parseFloat(avgTemp),
      avgBP: { systolic: avgSystolic, diastolic: avgDiastolic },
      avgHR,
      avgRR
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="spinner mb-4 w-8 h-8 border-2 mx-auto"></div>
          <p className="text-gray-600 font-semibold">Cargando historial de signos vitales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-300 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-bold text-red-800">Error</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (vitals.length === 0) {
    return (
      <div className="p-8 bg-blue-50 border border-blue-200 rounded-lg text-center">
        <Activity className="mx-auto mb-3 text-blue-600" size={32} />
        <p className="text-blue-800 font-semibold">Sin registros de signos vitales</p>
        <p className="text-blue-600 text-sm mt-1">
          Aún no hay mediciones de signos vitales registradas para este paciente
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Activity className="text-green-600" size={28} />
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Historial de Signos Vitales</h3>
            <p className="text-sm text-gray-600 mt-1">
              {vitals.length} registro{vitals.length !== 1 ? 's' : ''} disponible{vitals.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Temp. Promedio"
          value={`${stats.avgTemp}°C`}
          color="from-orange-500 to-red-500"
          icon="🌡️"
        />
        <StatCard
          label="P.A. Promedio"
          value={`${stats.avgBP.systolic}/${stats.avgBP.diastolic}`}
          color="from-red-500 to-pink-500"
          icon="❤️"
        />
        <StatCard
          label="F.C. Promedio"
          value={`${stats.avgHR} lpm`}
          color="from-pink-500 to-purple-500"
          icon="💓"
        />
        <StatCard
          label="F.R. Promedio"
          value={`${stats.avgRR} rpm`}
          color="from-blue-500 to-cyan-500"
          icon="💨"
        />
      </div>

      {/* Controles de vista */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedMetric('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            selectedMetric === 'all'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todos los Signos
        </button>
        <button
          onClick={() => setSelectedMetric('temperature')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            selectedMetric === 'temperature'
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Temperatura
        </button>
        <button
          onClick={() => setSelectedMetric('bloodPressure')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            selectedMetric === 'bloodPressure'
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Presión
        </button>
        <button
          onClick={() => setSelectedMetric('heartRate')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            selectedMetric === 'heartRate'
              ? 'bg-pink-500 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Frecuencia Cardíaca
        </button>
      </div>

      {/* Gráfico de Temperatura */}
      {(selectedMetric === 'all' || selectedMetric === 'temperature') && (
        <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-sm">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🌡️</span>
            Temperatura (°C)
            <span className="text-xs font-normal text-gray-600 ml-auto">
              Rango normal: 36.5 - 37.5°C
            </span>
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={vitals} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[35, 40]} />
              <Tooltip
                formatter={(value) => [value.toFixed(1), 'Temp (°C)']}
                labelFormatter={(label) => `Lectura ${label}`}
              />
              <Area
                type="monotone"
                dataKey="temperature"
                stroke="#f97316"
                fillOpacity={1}
                fill="url(#colorTemp)"
              />
              <Line
                type="monotone"
                dataKey={() => 37}
                stroke="#10b981"
                strokeDasharray="5 5"
                name="Normal"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráfico de Presión Arterial */}
      {(selectedMetric === 'all' || selectedMetric === 'bloodPressure') && (
        <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-sm">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">❤️</span>
            Presión Arterial (mmHg)
            <span className="text-xs font-normal text-gray-600 ml-auto">
              Normal: 120/80, Elevada: 130-139/80-89, HTA: ≥140/90
            </span>
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={vitals} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[60, 180]} />
              <Tooltip formatter={(value) => value} labelFormatter={(label) => `Lectura ${label}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="bpSystolic"
                stroke="#ef4444"
                name="Sistólica"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="bpDiastolic"
                stroke="#f87171"
                name="Diastólica"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey={() => 120}
                stroke="#10b981"
                strokeDasharray="5 5"
                name="Normal Sistólica"
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráfico de Frecuencia Cardíaca */}
      {(selectedMetric === 'all' || selectedMetric === 'heartRate') && (
        <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-sm">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">💓</span>
            Frecuencia Cardíaca (lpm)
            <span className="text-xs font-normal text-gray-600 ml-auto">
              Rango normal en reposo: 60-100 lpm
            </span>
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={vitals} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[40, 140]} />
              <Tooltip formatter={(value) => value} labelFormatter={(label) => `Lectura ${label}`} />
              <Area
                type="monotone"
                dataKey="heartRate"
                stroke="#ec4899"
                fillOpacity={1}
                fill="url(#colorHR)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráfico de Frecuencia Respiratoria */}
      {(selectedMetric === 'all' || selectedMetric === 'heartRate') && (
        <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-sm">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">💨</span>
            Frecuencia Respiratoria (rpm)
            <span className="text-xs font-normal text-gray-600 ml-auto">
              Rango normal: 12-20 rpm
            </span>
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vitals} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 40]} />
              <Tooltip formatter={(value) => value} labelFormatter={(label) => `Lectura ${label}`} />
              <Bar dataKey="respiratoryRate" fill="#06b6d4" name="Respiratoria" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabla detallada */}
      <div className="bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
          <h4 className="font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp size={20} />
            Registros Detallados
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Fecha</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Hora</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Temperatura</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Presión</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">F. Cardíaca</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">F. Respiratoria</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Registrado por</th>
              </tr>
            </thead>
            <tbody>
              {vitals.map((v, idx) => (
                <tr
                  key={v.id}
                  className={`border-b border-gray-200 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-50 transition-colors`}
                >
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                    {formatDateShort(v.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">-</td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      {v.temperature}°C
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                      {v.blood_pressure}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded">
                      {v.heart_rate} lpm
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded">
                      {v.respiratory_rate} rpm
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {v.registered_by || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <p className="font-bold mb-1">ℹ️ Información</p>
        <p>
          Este historial proporciona una visualización gráfica de los signos vitales del paciente
          a lo largo del tiempo. Los datos son actualizados automáticamente cuando se registran
          nuevas mediciones.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className={`bg-gradient-to-br ${color} p-4 rounded-lg text-white shadow-lg`}>
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-xs font-semibold opacity-90">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}
