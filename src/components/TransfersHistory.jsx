import React, { useState, useEffect } from 'react';
import { ArrowRight, Clock, User, MapPin, AlertCircle, FileText } from 'lucide-react';
import { getTransfersByPatientId } from '../services/database';

/**
 * 🚚 COMPONENTE: Historial de Traslados del Paciente
 * 
 * Muestra todos los traslados realizados del paciente
 * Sin permitir modificar los traslados (solo visualización)
 * Cumple con NOM-004 (auditable e inmutable)
 */
export default function TransfersHistory({ patientId }) {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTransfers();
  }, [patientId]);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTransfersByPatientId(patientId);
      setTransfers(data || []);
    } catch (err) {
      console.error('Error cargando traslados:', err);
      setError('Error al cargar el historial de traslados');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    return timeStr;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="spinner mb-4 w-8 h-8 border-2 mx-auto"></div>
          <p className="text-gray-600 font-semibold">Cargando historial de traslados...</p>
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

  if (transfers.length === 0) {
    return (
      <div className="p-8 bg-blue-50 border border-blue-200 rounded-lg text-center">
        <MapPin className="mx-auto mb-3 text-blue-600" size={32} />
        <p className="text-blue-800 font-semibold">Sin traslados registrados</p>
        <p className="text-blue-600 text-sm mt-1">
          El paciente aún no ha sido trasladado entre salas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="text-blue-600" size={24} />
        <h3 className="text-xl font-bold text-gray-800">Historial de Traslados</h3>
        <span className="ml-auto bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-sm">
          {transfers.length} traslado{transfers.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4">
        {transfers.map((transfer, index) => (
          <div
            key={transfer.id}
            className="border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all"
          >
            {/* Header con fecha y hora */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <Clock className="text-blue-600 flex-shrink-0" size={18} />
                  <div>
                    <p className="font-bold text-gray-800">
                      {formatDate(transfer.transfer_date)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Hora: {formatTime(transfer.transfer_time)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {transfer.transferred_by && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <User size={14} />
                      <span className="font-semibold">{transfer.transferred_by}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contenido: De dónde a dónde */}
            <div className="p-6 space-y-4">
              {/* Origen */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1">
                  <MapPin size={14} />
                  ORIGEN
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs">Piso</p>
                    <p className="font-bold text-gray-800">{transfer.from_floor || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Área</p>
                    <p className="font-bold text-gray-800">{transfer.from_area || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Sala</p>
                    <p className="font-bold text-gray-800">{transfer.from_room || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Cama</p>
                    <p className="font-bold text-gray-800">{transfer.from_bed || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Flecha de traslado */}
              <div className="flex justify-center py-2">
                <div className="flex items-center gap-2 text-blue-600 font-bold">
                  <ArrowRight size={24} className="animate-pulse" />
                </div>
              </div>

              {/* Destino */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1">
                  <MapPin size={14} />
                  DESTINO
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs">Piso</p>
                    <p className="font-bold text-gray-800">{transfer.to_floor || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Área</p>
                    <p className="font-bold text-gray-800">{transfer.to_area || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Sala</p>
                    <p className="font-bold text-gray-800">{transfer.to_room || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Cama</p>
                    <p className="font-bold text-gray-800">{transfer.to_bed || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Razón y notas */}
              {(transfer.reason || transfer.notes) && (
                <div className="border-t-2 border-gray-200 pt-4 space-y-2">
                  {transfer.reason && (
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-1">Razón del Traslado</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {transfer.reason}
                      </p>
                    </div>
                  )}
                  {transfer.notes && (
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                        <FileText size={14} />
                        Notas Adicionales
                      </p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {transfer.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer con numeración */}
            <div className="bg-gray-100 px-6 py-2 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Traslado #{transfers.length - index}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Nota de auditoría */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
        <p className="font-bold mb-1">📋 Nota de Cumplimiento NOM-004</p>
        <p>
          Este historial de traslados es de solo lectura y se mantiene como registro permanente 
          del expediente clínico para garantizar trazabilidad y auditoría.
        </p>
      </div>
    </div>
  );
}
