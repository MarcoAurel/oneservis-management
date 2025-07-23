'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  ClipboardList, 
  LogOut,
  Plus,
  Clock,
  CheckCircle,
  FileText,
  AlertTriangle
} from 'lucide-react';

export default function ClienteDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  const stats = [
    { title: 'Solicitudes Activas', value: '3', icon: ClipboardList, color: 'bg-blue-500' },
    { title: 'En Proceso', value: '2', icon: Clock, color: 'bg-yellow-500' },
    { title: 'Completadas', value: '15', icon: CheckCircle, color: 'bg-green-500' },
    { title: 'Urgentes', value: '1', icon: AlertTriangle, color: 'bg-red-500' },
  ];

  const solicitudesRecientes = [
    { 
      id: 'SOL-130209', 
      equipo: 'CAMA-228', 
      descripcion: 'Solicitud reparación cama eléctrica',
      estado: 'En proceso',
      fecha: '22/07/2024',
      tecnico: 'Héctor Tripayán'
    },
    { 
      id: 'SOL-130196', 
      equipo: 'CAMA-066', 
      descripcion: 'Cable cortado en cama sala 4096-2',
      estado: 'Completada',
      fecha: '21/07/2024',
      tecnico: 'María González'
    },
    { 
      id: 'SOL-130015', 
      equipo: 'CAMA-214', 
      descripcion: 'Solicitud mantenimiento preventivo',
      estado: 'Pendiente',
      fecha: '20/07/2024',
      tecnico: 'Por asignar'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y Título */}
            <div className="flex items-center">
              <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">One</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">OneServis</h1>
                <p className="text-xs text-gray-500">Portal de Solicitudes</p>
              </div>
            </div>

            {/* Usuario y Logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.nombre}</p>
                <p className="text-xs text-gray-500">{user?.categoria} - {user?.institucion}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Bienvenida */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenido, {user?.nombre}
          </h2>
          <p className="text-gray-600">
            Portal de solicitudes de mantenimiento - {user?.institucion}
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ActionCard
            title="Nueva Solicitud"
            description="Crear nueva solicitud de mantenimiento"
            icon={Plus}
            onClick={() => router.push('/nueva-solicitud')}
            color="bg-orange-500"
            highlighted
          />
          <ActionCard
            title="Mis Solicitudes"
            description="Ver historial de solicitudes"
            icon={ClipboardList}
            onClick={() => router.push('/mis-solicitudes')}
            color="bg-blue-500"
          />
          <ActionCard
            title="Reportes"
            description="Descargar reportes de mantenimiento"
            icon={FileText}
            onClick={() => router.push('/reportes')}
            color="bg-green-500"
          />
        </div>

        {/* Solicitudes Recientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Solicitudes Recientes</h3>
            <p className="text-sm text-gray-600">Últimas solicitudes de mantenimiento</p>
          </div>
          <div className="divide-y divide-gray-200">
            {solicitudesRecientes.map((solicitud, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-lg font-semibold text-gray-900">{solicitud.id}</span>
                      <span className="ml-3 text-sm font-medium text-gray-600">
                        {solicitud.equipo}
                      </span>
                      <span className={`ml-auto px-2 py-1 text-xs font-medium rounded-full ${
                        solicitud.estado === 'Completada' ? 'bg-green-100 text-green-800' :
                        solicitud.estado === 'En proceso' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {solicitud.estado}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{solicitud.descripcion}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Fecha: {solicitud.fecha}</span>
                      <span>Técnico: {solicitud.tecnico}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Debug Info (solo desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">🔧 Información de Debug</h3>
            <div className="text-xs text-green-700 space-y-1">
              <p><strong>Usuario:</strong> {user?.correo} ({user?.categoria})</p>
              <p><strong>Institución:</strong> {user?.institucion}</p>
              <p><strong>Cargo:</strong> {user?.cargo}</p>
              <p><strong>Nota:</strong> Portal de autoservicio para clientes. Los datos son ejemplos.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Componente de tarjeta de acción
interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  color: string;
  highlighted?: boolean;
}

function ActionCard({ title, description, icon: Icon, onClick, color, highlighted }: ActionCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm border-2 p-6 hover:shadow-md transition-all cursor-pointer group ${
        highlighted ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start">
        <div className={`${color} p-3 rounded-lg group-hover:scale-105 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}