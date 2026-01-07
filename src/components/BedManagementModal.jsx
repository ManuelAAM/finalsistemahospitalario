import React, { useState, useEffect } from 'react';

/**
 * Modal para gestionar la asignación de habitaciones y camas
 * Muestra disponibilidad en tiempo real y previene doble asignación
 */
export default function BedManagementModal({ 
  isOpen, 
  onClose, 
  onAssignRoom, 
  patientName,
  currentRoom 
}) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar habitaciones disponibles
  useEffect(() => {
    if (isOpen) {
      loadRooms();
    }
  }, [isOpen]);

  const loadRooms = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { getRooms } = await import('../services/database.js');
      const allRooms = await getRooms();
      setRooms(allRooms);
    } catch (err) {
      console.error('Error cargando habitaciones:', err);
      setError('No se pudieron cargar las habitaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedRoom) {
      alert('⚠️ Selecciona una habitación');
      return;
    }

    const room = rooms.find(r => r.room_number === selectedRoom);
    const freeSpots = room.bed_count - room.occupied_beds;

    if (freeSpots <= 0) {
      alert(`❌ La habitación ${selectedRoom} no tiene camas disponibles`);
      return;
    }

    const confirmed = window.confirm(
      `¿Asignar paciente ${patientName} a la habitación ${selectedRoom}?\n\n` +
      `Tipo: ${room.room_type}\n` +
      `Camas disponibles: ${freeSpots}/${room.bed_count}\n` +
      `Piso: ${room.floor}\n` +
      `Departamento: ${room.department}`
    );

    if (confirmed) {
      try {
        await onAssignRoom(selectedRoom);
        alert(`✅ Paciente asignado a habitación ${selectedRoom}`);
        onClose();
      } catch (err) {
        alert(`❌ Error: ${err.message}`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Asignar Habitación</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm">
            <strong>Paciente:</strong> {patientName}
            {currentRoom && <span className="ml-2 text-gray-600">(Actualmente en: {currentRoom})</span>}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p>Cargando habitaciones...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <>
            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold text-green-600">
                  {rooms.filter(r => r.bed_count > r.occupied_beds && r.status === 'Available').length}
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <p className="text-sm text-gray-600">Ocupadas</p>
                <p className="text-2xl font-bold text-red-600">
                  {rooms.filter(r => r.occupied_beds >= r.bed_count).length}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <p className="text-sm text-gray-600">Mantenimiento</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {rooms.filter(r => r.status === 'Maintenance').length}
                </p>
              </div>
            </div>

            {/* Lista de habitaciones */}
            <div className="space-y-2">
              {rooms.map(room => {
                const freeSpots = room.bed_count - room.occupied_beds;
                const isAvailable = freeSpots > 0 && room.status === 'Available';
                
                let statusColor = 'bg-gray-200';
                let statusText = 'No disponible';
                
                if (room.status === 'Maintenance') {
                  statusColor = 'bg-yellow-200';
                  statusText = 'Mantenimiento';
                } else if (isAvailable) {
                  statusColor = freeSpots === room.bed_count ? 'bg-green-200' : 'bg-blue-200';
                  statusText = `${freeSpots} cama${freeSpots > 1 ? 's' : ''} disponible${freeSpots > 1 ? 's' : ''}`;
                } else if (room.status === 'Occupied') {
                  statusColor = 'bg-red-200';
                  statusText = 'Ocupada';
                }

                return (
                  <div
                    key={room.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedRoom === room.room_number
                        ? 'border-blue-500 bg-blue-50'
                        : isAvailable
                        ? 'border-gray-300 hover:border-blue-300'
                        : 'border-gray-200 opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => isAvailable && setSelectedRoom(room.room_number)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">{room.room_number}</h3>
                          <span className={`px-2 py-1 rounded text-sm ${statusColor}`}>
                            {statusText}
                          </span>
                          <span className="px-2 py-1 rounded text-sm bg-purple-100">
                            {room.room_type}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <p><strong>Piso:</strong> {room.floor}</p>
                          <p><strong>Departamento:</strong> {room.department}</p>
                          <p><strong>Camas:</strong> {room.occupied_beds}/{room.bed_count}</p>
                          <p><strong>Estado:</strong> {room.status}</p>
                        </div>

                        {room.equipment && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">
                              <strong>Equipamiento:</strong>{' '}
                              {typeof room.equipment === 'string' 
                                ? JSON.parse(room.equipment).join(', ')
                                : room.equipment.join(', ')
                              }
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        {selectedRoom === room.room_number && (
                          <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {rooms.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay habitaciones registradas en el sistema
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedRoom}
                className={`px-4 py-2 rounded ${
                  selectedRoom
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Asignar Habitación
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
