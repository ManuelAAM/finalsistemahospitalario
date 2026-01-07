import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, MessageCircle, Filter, RefreshCw } from 'lucide-react';
import { getSystemErrors, updateErrorStatus } from '../services/database';

export default function ErrorDashboard({ userName }) {
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'Abierto', // Abierto, En Progreso, Resuelto
    severity: '', // '', low, medium, high, critical
    module: '',
  });
  const [selectedError, setSelectedError] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const loadErrors = async () => {
    setIsLoading(true);
    try {
      const fetchedErrors = await getSystemErrors({
        status: filters.status || undefined,
        severity: filters.severity || undefined,
        module: filters.module || undefined,
      });
      setErrors(fetchedErrors);
    } catch (error) {
      console.error('Error loading errors:', error);
      alert('Error al cargar errores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadErrors();
  }, [filters]);

  const handleStatusUpdate = async (errorId, newStatus) => {
    if (newStatus === 'Resuelto' && !resolutionNotes.trim()) {
      alert('Por favor ingresa notas de resolución');
      return;
    }

    try {
      await updateErrorStatus(
        errorId,
        newStatus,
        userName,
        resolutionNotes || 'Sin notas'
      );
      setResolutionNotes('');
      setSelectedError(null);
      loadErrors();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar estado');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Abierto':
        return <AlertTriangle className="text-red-500" size={18} />;
      case 'En Progreso':
        return <Clock className="text-yellow-500" size={18} />;
      case 'Resuelto':
        return <CheckCircle className="text-green-500" size={18} />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-hospital-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-hospital-800">
              Centro de Errores
            </h2>
            <p className="text-hospital-500 text-sm">
              Monitoreo y gestión de errores del sistema
            </p>
          </div>
          <button
            onClick={loadErrors}
            disabled={isLoading}
            className="p-3 bg-clinical-primary text-white rounded-lg hover:bg-clinical-dark transition disabled:opacity-70"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-hospital-50 rounded-xl border border-hospital-200">
          <div>
            <label className="block text-xs font-bold text-hospital-600 uppercase mb-2">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-hospital-200 rounded-lg text-sm focus:border-clinical-primary outline-none"
            >
              <option value="">Todos</option>
              <option value="Abierto">Abierto</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Resuelto">Resuelto</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-hospital-600 uppercase mb-2">
              Severidad
            </label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="w-full px-3 py-2 border border-hospital-200 rounded-lg text-sm focus:border-clinical-primary outline-none"
            >
              <option value="">Todas</option>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-hospital-600 uppercase mb-2">
              Módulo
            </label>
            <input
              type="text"
              value={filters.module}
              onChange={(e) => setFilters({ ...filters, module: e.target.value })}
              placeholder="Filtrar por módulo..."
              className="w-full px-3 py-2 border border-hospital-200 rounded-lg text-sm focus:border-clinical-primary outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: 'Abierto', severity: '', module: '' })}
              className="w-full py-2 bg-hospital-300 text-white rounded-lg text-sm hover:bg-hospital-400 transition"
            >
              Restablecer
            </button>
          </div>
        </div>

        {/* Lista de Errores */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-hospital-400">
              Cargando errores...
            </div>
          ) : errors.length === 0 ? (
            <div className="text-center py-8 text-hospital-400">
              <CheckCircle size={40} className="mx-auto mb-2 opacity-50" />
              <p>No hay errores que mostrar</p>
            </div>
          ) : (
            errors.map((error) => (
              <div
                key={error.id}
                onClick={() => setSelectedError(selectedError?.id === error.id ? null : error)}
                className="bg-white border border-hospital-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(error.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${getSeverityColor(error.severity)}`}>
                          {error.severity?.toUpperCase()}
                        </span>
                        <span className="text-xs text-hospital-500">
                          {error.module}
                        </span>
                      </div>
                      <p className="font-bold text-hospital-800 mb-1">
                        {error.message}
                      </p>
                      <p className="text-xs text-hospital-500">
                        Reportado por: <span className="font-semibold">{error.user_name}</span> • {formatDate(error.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    error.status === 'Abierto' ? 'bg-red-100 text-red-700' :
                    error.status === 'En Progreso' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {error.status}
                  </span>
                </div>

                {/* Detalles Expandidos */}
                {selectedError?.id === error.id && (
                  <div className="mt-4 pt-4 border-t border-hospital-200 space-y-3">
                    {error.stack_trace && (
                      <div>
                        <p className="text-xs font-bold text-hospital-600 mb-1">Detalles Técnicos:</p>
                        <div className="bg-hospital-50 p-2 rounded text-xs font-mono text-hospital-700 max-h-32 overflow-y-auto border border-hospital-200">
                          {error.stack_trace}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-hospital-600 mb-2">
                        Cambiar Estado:
                      </label>
                      <div className="flex gap-2 mb-3">
                        {['Abierto', 'En Progreso', 'Resuelto'].map(status => (
                          <button
                            key={status}
                            onClick={() => {
                              if (status === 'Resuelto') {
                                // Mostrar campo de notas
                                setResolutionNotes('');
                              } else {
                                handleStatusUpdate(error.id, status);
                              }
                            }}
                            className={`px-3 py-2 rounded text-xs font-bold transition ${
                              error.status === status
                                ? 'bg-clinical-primary text-white'
                                : 'bg-hospital-100 text-hospital-700 hover:bg-hospital-200'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>

                      {error.status !== 'Resuelto' && (
                        <textarea
                          placeholder="Si vas a marcar como resuelto, ingresa notas..."
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          className="w-full px-3 py-2 border border-hospital-200 rounded text-xs resize-none mb-2"
                          rows="2"
                        />
                      )}

                      {error.status !== 'Resuelto' && resolutionNotes.trim() && (
                        <button
                          onClick={() => handleStatusUpdate(error.id, 'Resuelto')}
                          className="w-full py-2 bg-green-500 text-white rounded text-xs font-bold hover:bg-green-600 transition"
                        >
                          Marcar como Resuelto
                        </button>
                      )}
                    </div>

                    {error.resolved_by && (
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <p className="text-xs text-green-800">
                          <span className="font-bold">Resuelto por:</span> {error.resolved_by}
                        </p>
                        {error.resolution_notes && (
                          <p className="text-xs text-green-700 mt-1">
                            <span className="font-bold">Notas:</span> {error.resolution_notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
