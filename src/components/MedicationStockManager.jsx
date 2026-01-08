import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, AlertTriangle, Search, Filter, TrendingDown, 
  Calendar, X, RefreshCw, Activity,
  AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import {
  getStockLevel,
  getStockLevelInfo,
  formatStockInfo,
  getInventoryStatistics,
  searchMedication,
  getMedicationsNearExpiration
} from '../utils/medicationStockValidation';

/**
 * Componente de Gestión de Inventario de Medicamentos
 * Permite visualizar, agregar y actualizar stock de medicamentos
 */
export default function MedicationStockManager({ isOpen, onClose }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [stats, setStats] = useState(null);

  // Cargar inventario
  useEffect(() => {
    if (isOpen) {
      loadInventory();
    }
  }, [isOpen]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const { getMedicationInventory } = await import('../services/database.js');
      const data = await getMedicationInventory();
      console.log('📦 Inventario cargado:', data.length, 'medicamentos');
      setInventory(data);
      setStats(getInventoryStatistics(data));
    } catch (error) {
      console.error('Error cargando inventario:', error);
      alert('Error al cargar inventario de medicamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedInventory = async () => {
    if (!confirm('¿Deseas poblar el inventario con medicamentos de ejemplo?\n\nEsto agregará 10 medicamentos básicos.')) {
      return;
    }
    
    try {
      setLoading(true);
      const { getDb } = await import('../services/database.js');
      const db = getDb();
      
      const now = new Date().toISOString();
      const meds = [
        ['Paracetamol 500mg', 'Paracetamol', 'Tabletas', '500mg', 'ANALGESICO', 0, 500, 'tabletas', 100, 1000, 2.50, 'Distribuidora Farmacéutica México', 'Farmacia Principal - Estante A1'],
        ['Ibuprofeno 400mg', 'Ibuprofeno', 'Tabletas', '400mg', 'AINE', 0, 300, 'tabletas', 80, 500, 3.00, 'Distribuidora Farmacéutica México', 'Farmacia Principal - Estante A2'],
        ['Amoxicilina 500mg', 'Amoxicilina', 'Cápsulas', '500mg', 'ANTIBIOTICO', 0, 200, 'cápsulas', 50, 400, 5.50, 'Laboratorios Farma', 'Farmacia Principal - Estante B1'],
        ['Omeprazol 20mg', 'Omeprazol', 'Cápsulas', '20mg', 'GASTROPROTECTOR', 0, 150, 'cápsulas', 40, 300, 4.00, 'Laboratorios Farma', 'Farmacia Principal - Estante C1'],
        ['Metformina 850mg', 'Metformina', 'Tabletas', '850mg', 'ANTIDIABETICO', 0, 400, 'tabletas', 100, 600, 3.50, 'Distribuidora Farmacéutica México', 'Farmacia Principal - Estante D1'],
        ['Losartán 50mg', 'Losartán', 'Tabletas', '50mg', 'ANTIHIPERTENSIVO', 0, 250, 'tabletas', 60, 400, 4.50, 'Laboratorios Farma', 'Farmacia Principal - Estante D2'],
        ['Morfina 10mg/ml', 'Morfina', 'Ampolletas', '10mg/ml', 'OPIOIDE', 1, 50, 'ampolletas', 10, 100, 25.00, 'Distribuidora Especializada', 'Farmacia - Estante Controlados E1'],
        ['Solución Salina 0.9% 1000ml', 'Cloruro de Sodio', 'Bolsa IV', '0.9%', 'SOLUCIONES', 0, 100, 'bolsas', 30, 200, 15.00, 'Distribuidora Farmacéutica México', 'Almacén - Área de Soluciones'],
        ['Insulina Glargina 100UI/ml', 'Insulina Glargina', 'Pluma precargada', '100UI/ml', 'ANTIDIABETICO', 0, 30, 'plumas', 10, 50, 450.00, 'Laboratorios Especializados', 'Farmacia - Refrigerador R1'],
        ['Diclofenaco 75mg/3ml', 'Diclofenaco', 'Ampolletas', '75mg/3ml', 'AINE', 0, 80, 'ampolletas', 20, 150, 8.00, 'Distribuidora Farmacéutica México', 'Farmacia Principal - Estante A3']
      ];
      
      for (const m of meds) {
        await db.execute(
          `INSERT INTO medication_inventory (
            name, active_ingredient, presentation, concentration, category,
            is_controlled, quantity, unit, min_stock, max_stock, unit_price,
            supplier, location, storage_conditions, last_restocked, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8], m[9], m[10], m[11], m[12], 'Temperatura ambiente (15-30°C)', now, now, now]
        );
      }
      
      alert(`✅ Se agregaron ${meds.length} medicamentos al inventario`);
      await loadInventory();
    } catch (error) {
      console.error('Error poblando inventario:', error);
      alert('Error al poblar inventario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar medicamentos
  const filteredInventory = React.useMemo(() => {
    let filtered = inventory;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = searchMedication(filtered, searchTerm);
    }

    // Filtrar por nivel de stock
    if (filterLevel !== 'ALL') {
      filtered = filtered.filter(item => getStockLevel(item.quantity) === filterLevel);
    }

    return filtered;
  }, [inventory, searchTerm, filterLevel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                <Package size={32} className="text-blue-600" />
                Inventario de Medicamentos
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Gestión de stock y control de dispensación
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-lg transition"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Estadísticas */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <StatCard
                label="Total Medicamentos"
                value={stats.total}
                icon={Package}
                color="blue"
              />
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="px-8 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-3">
            {/* Búsqueda */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, ingrediente activo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por nivel */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-300 rounded-lg font-bold text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Todos los niveles</option>
                <option value="CRITICAL">🔴 Crítico</option>
                <option value="LOW">🟡 Bajo</option>
                <option value="NORMAL">🟢 Normal</option>
                <option value="HIGH">🔵 Alto</option>
              </select>
            </div>

            {/* Botones de acción */}
            <button
              onClick={loadInventory}
              className="px-4 py-2.5 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Tabla de inventario */}
        <div className="flex-1 overflow-auto p-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Activity size={48} className="text-blue-600 mx-auto animate-pulse mb-3" />
                <p className="text-gray-600 font-bold">Cargando inventario...</p>
              </div>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-20">
              <Package size={64} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold text-lg">
                {inventory.length === 0 ? 'El inventario está vacío' : 'No se encontraron medicamentos'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Agrega medicamentos al inventario'}
              </p>
              {inventory.length === 0 && (
                <button
                  onClick={handleSeedInventory}
                  className="mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto shadow-lg"
                >
                  <Plus size={20} />
                  Poblar con Medicamentos de Ejemplo
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                      Medicamento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                      Presentación
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">
                      Nivel
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">
                      Lote
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">
                      Vencimiento
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInventory.map((item) => {
                    const level = getStockLevel(item.quantity);
                    const levelInfo = getStockLevelInfo(level);

                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-bold text-gray-800">{item.name}</p>
                            {item.active_ingredient && (
                              <p className="text-xs text-gray-500">{item.active_ingredient}</p>
                            )}
                            {item.is_controlled === 1 && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
                                ⚠️ CONTROLADO
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.presentation || 'N/A'}
                          {item.concentration && (
                            <div className="text-xs text-gray-500">{item.concentration}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-lg text-gray-800">
                            {item.quantity}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">{item.unit}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border-2 ${
                              level === 'CRITICAL'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : level === 'LOW'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : level === 'NORMAL'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {levelInfo.emoji} {levelInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">
                          {item.lot_number || '-'}
                        </td>
                        <td className="px-4 py-3 text-center text-sm">
                          {item.expiration_date ? (
                            <ExpirationBadge date={item.expiration_date} />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer con resumen */}
        <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
          <p>
            Mostrando <strong>{filteredInventory.length}</strong> de <strong>{inventory.length}</strong> medicamentos
            {filterLevel !== 'ALL' && ` • Filtro: ${getStockLevelInfo(filterLevel).label}`}
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para mostrar estadística
function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    green: 'bg-green-50 text-green-600 border-green-200',
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={18} />
        <p className="text-xs font-bold uppercase opacity-75">{label}</p>
      </div>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

// Componente para mostrar fecha de expiración
function ExpirationBadge({ date }) {
  const today = new Date();
  const expDate = new Date(date);
  const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
        <AlertCircle size={12} />
        VENCIDO
      </span>
    );
  }

  if (diffDays <= 30) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">
        <Clock size={12} />
        {diffDays}d
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
      <CheckCircle size={12} />
      {new Date(date).toLocaleDateString()}
    </span>
  );
}
