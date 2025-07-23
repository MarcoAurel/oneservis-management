// src/app/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else {
        // Redirigir según categoría del usuario
        switch (user.categoria) {
          case 'ADMIN':
            router.push('/admin');
            break;
          case 'TECNICO':
            router.push('/tecnico');
            break;
          case 'CLIENTE':
            router.push('/cliente');
            break;
          default:
            router.push('/login');
        }
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center w-full max-w-sm">
          <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <span className="text-2xl sm:text-3xl font-bold text-white">One</span>
          </div>
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Cargando OneServis...</p>
          <p className="text-gray-500 text-xs mt-2">Sistema de Gestión de Órdenes de Trabajo</p>
        </div>
      </div>
    );
  }

  return null;
}