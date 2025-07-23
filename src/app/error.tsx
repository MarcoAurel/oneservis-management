'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log del error para debug
    console.error('💥 Error capturado por Error Boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mx-auto h-20 w-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
          <span className="text-3xl font-bold text-white">One</span>
        </div>

        {/* Icono de Error */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        {/* Mensaje Principal */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Ups! Algo salió mal
        </h1>
        <p className="text-gray-600 mb-8">
          Se produjo un error inesperado en la aplicación. 
          Puedes intentar recargar o volver al inicio.
        </p>

        {/* Botones de Acción */}
        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Intentar de Nuevo
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center justify-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Ir al Inicio
          </button>
        </div>

        {/* Información de Debug */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <h3 className="text-sm font-medium text-red-800 mb-2">🔧 Información de Debug</h3>
            <div className="text-xs text-red-700 space-y-1">
              <p><strong>Error:</strong> {error.message}</p>
              {error.digest && <p><strong>Digest:</strong> {error.digest}</p>}
              <p><strong>Consola:</strong> Ver detalles completos en la consola del navegador (F12)</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-sm text-gray-500">
          © 2024 OneServis SPA
        </div>
      </div>
    </div>
  );
}