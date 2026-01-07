import React, { useState } from 'react';
import { AlertTriangle, X, Send, CheckCircle } from 'lucide-react';
import { reportError } from '../services/database';

export default function ErrorReporter({ userId, userName, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    type: 'application', // application, database, performance, other
    severity: 'medium', // low, medium, high, critical
    module: '',
    description: '',
    stepsToReproduce: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      alert('Por favor describe el problema');
      return;
    }

    setIsSubmitting(true);
    try {
      await reportError({
        code: `ERROR-${Date.now()}`,
        message: formData.description,
        type: formData.type,
        severity: formData.severity,
        module: formData.module || 'General',
        userId: userId,
        userName: userName,
        ipAddress: 'web-app',
        stackTrace: formData.stepsToReproduce,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setFormData({
          type: 'application',
          severity: 'medium',
          module: '',
          description: '',
          stepsToReproduce: '',
        });
        setIsSuccess(false);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Error reporting error:', error);
      alert('Error al reportar el problema. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-40 group"
        title="Reportar un error"
      >
        <AlertTriangle size={24} />
        <div className="absolute bottom-full right-0 mb-2 bg-hospital-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Reportar Error
        </div>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-900">Reportar Error</h2>
                  <p className="text-xs text-red-700">Ayúdanos a mejorar reportando problemas</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white rounded-lg transition"
              >
                <X size={24} className="text-hospital-400" />
              </button>
            </div>

            {/* Contenido */}
            {isSuccess ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <CheckCircle className="text-green-600" size={48} />
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  ¡Gracias por reportar!
                </h3>
                <p className="text-green-700">
                  Tu reporte ha sido registrado. El equipo técnico lo revisará pronto.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Tipo de Error */}
                <div>
                  <label className="block text-sm font-bold text-hospital-700 mb-2">
                    Tipo de Error <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-hospital-200 rounded-lg focus:bg-white focus:border-clinical-primary focus:ring-4 focus:ring-blue-50 outline-none"
                  >
                    <option value="application">Aplicación</option>
                    <option value="database">Base de Datos</option>
                    <option value="performance">Rendimiento</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                {/* Módulo */}
                <div>
                  <label className="block text-sm font-bold text-hospital-700 mb-2">
                    Módulo Afectado
                  </label>
                  <input
                    type="text"
                    name="module"
                    value={formData.module}
                    onChange={handleChange}
                    placeholder="Ej: Signos Vitales, Medicamentos, etc."
                    className="w-full px-4 py-2 border border-hospital-200 rounded-lg focus:border-clinical-primary focus:ring-4 focus:ring-blue-50 outline-none"
                  />
                </div>

                {/* Severidad */}
                <div>
                  <label className="block text-sm font-bold text-hospital-700 mb-2">
                    Severidad
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['low', 'medium', 'high', 'critical'].map(level => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="severity"
                          value={level}
                          checked={formData.severity === level}
                          onChange={handleChange}
                          className="w-4 h-4"
                        />
                        <span className={`text-xs font-bold capitalize ${
                          level === 'low' ? 'text-green-600' :
                          level === 'medium' ? 'text-yellow-600' :
                          level === 'high' ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {level === 'low' ? 'Baja' :
                           level === 'medium' ? 'Media' :
                           level === 'high' ? 'Alta' :
                           'Crítica'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-bold text-hospital-700 mb-2">
                    Descripción del Problema <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe detalladamente qué pasó..."
                    rows="4"
                    className="w-full px-4 py-2 border border-hospital-200 rounded-lg focus:border-clinical-primary focus:ring-4 focus:ring-blue-50 outline-none resize-none"
                  />
                </div>

                {/* Pasos para Reproducir */}
                <div>
                  <label className="block text-sm font-bold text-hospital-700 mb-2">
                    Pasos para Reproducir (opcional)
                  </label>
                  <textarea
                    name="stepsToReproduce"
                    value={formData.stepsToReproduce}
                    onChange={handleChange}
                    placeholder="1. Abre...&#10;2. Haz clic en...&#10;3. Observa..."
                    rows="3"
                    className="w-full px-4 py-2 border border-hospital-200 rounded-lg focus:border-clinical-primary focus:ring-4 focus:ring-blue-50 outline-none resize-none"
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 border border-hospital-200 rounded-lg font-bold text-hospital-700 hover:bg-hospital-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-clinical-primary text-white rounded-lg font-bold hover:bg-clinical-dark transition disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
