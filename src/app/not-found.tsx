'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
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
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Página no encontrada
        </h2>
        <p className="text-gray-600 mb-8">
          La página que buscas no existe o está en desarrollo.
          Por favor, verifica la URL o vuelve al inicio.
        </p>

        {/* Botones de Acción */}
        <div className="space-y-4">
          <button
            onClick={() => router.back()}
            className="w-full flex items-center justify-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver Atrás
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all"
          >
            <Home className="w-5 h-5 mr-2" />
            Ir al Inicio
          </button>
        </div>

        {/* Información Adicional */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">🔧 Información de Desarrollo</h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <p><strong>URL actual:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</p>
              <p><strong>Nota:</strong> Esta página se muestra cuando una ruta no existe</p>
              <p><strong>Estado:</strong> Muchas funcionalidades están en desarrollo</p>
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