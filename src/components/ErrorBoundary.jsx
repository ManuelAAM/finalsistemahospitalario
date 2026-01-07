import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔥 Error crítico capturado:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border border-red-100">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-600" size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Sistema Interrumpido</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Se detectó un problema inesperado. Sus datos están seguros.
            </p>
            <div className="bg-gray-100 p-3 rounded mb-4 text-xs text-left font-mono overflow-auto max-h-24">
               {this.state.error && this.state.error.toString()}
            </div>
            <button onClick={this.handleReset} className="w-full py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition">
              <RefreshCw size={18} className="inline mr-2"/> Reiniciar Sistema
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;