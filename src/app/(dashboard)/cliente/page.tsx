//src/app/(dashboard)/cliente/page.tsx
'use client';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Wrench, 
  ClipboardList, 
  LogOut,
  BarChart3,
  MessageSquare,
  Calendar,
  AlertCircle,
  Plus,
  Search,
  CheckCircle
} from 'lucide-react';

export default function ClienteDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  const stats = [
    { title: 'Solicitudes Enviadas', value: '8', icon: FileText, color: 'bg-blue-500' },
    { title: 'En Proceso', value: '3', icon: ClipboardList, color: 'bg-yellow-500' },
    { title: 'Completadas', value: '5', icon: CheckCircle, color: 'bg-green-500' },
    { title: 'Equipos Registrados', value: '12', icon: Wrench, color: 'bg-purple-500' },
  ];

  const solicitudesRecientes = [
    { 
      id: 'SOL-000001', 
      equipo: 'Cama Eléctrica - S300CA0740', 
      tipo: 'Correctivo',
      estado: 'En Proceso',
      fecha: '22/07/2024'
    },
    { 
      id: 'SOL-000002', 
      equipo: 'Cama Eléctrica - S/S', 
      tipo: 'Correctivo',
      estado: 'Completada',
      fecha: '21/07/2024'
    },
    { 
      id: 'SOL-000003', 
      equipo: 'Cama Eléctrica - S/S', 
      tipo: 'Preventivo',
      estado: 'En Proceso',
      fecha: '20/07/2024'
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
                <p className="text-xs text-gray-500">Portal del Cliente</p>
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
            Portal de autoservicio para solicitudes de mantenimiento
          </p>
        </div>

        {/* Acción Principal - Nueva Solicitud */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">¿Necesita mantenimiento para algún equipo?</h3>
                <p className="text-orange-100 mb-4">
                  Genere una solicitud de mantenimiento rápida y sencilla
                </p>
                <button
                  onClick={() => router.push('/solicitudes')}
                  className="flex items-center px-6 py-3 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nueva Solicitud
                </button>
              </div>
              <div className="hidden md:block">
                <FileText className="w-24 h-24 text-orange-200" />
              </div>
            </div>
          </div>
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
            title="Mis Solicitudes"
            description="Ver todas mis solicitudes enviadas"
            icon={ClipboardList}
            onClick={() => router.push('/mis-solicitudes')}
            color="bg-blue-500"
          />
          <ActionCard
            title="Mis Equipos"
            description="Consultar equipos registrados"
            icon={Wrench}
            onClick={() => router.push('/equipos')}
            color="bg-green-500"
          />
          <ActionCard
            title="Reportes"
            description="Ver estadísticas y reportes"
            icon={BarChart3}
            onClick={() => router.push('/reportes')}
            color="bg-purple-500"
          />
        </div>

        {/* Solicitudes Recientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Solicitudes Recientes</h3>
              <button
                onClick={() => router.push('/mis-solicitudes')}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Ver todas
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {solicitudesRecientes.map((solicitud, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-lg font-semibold text-gray-900">{solicitud.id}</span>
                      <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                        solicitud.estado === 'Completada' ? 'bg-green-100 text-green-800' :
                        solicitud.estado === 'En Proceso' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {solicitud.estado}
                      </span>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        solicitud.tipo === 'Correctivo' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {solicitud.tipo}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{solicitud.equipo}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {solicitud.fecha}
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
            <h3 className="text-sm font-medium text-green-800 mb-2">🔧 Información de Debug - Cliente</h3>
            <div className="text-xs text-green-700 space-y-1">
              <p><strong>Usuario:</strong> {user?.correo} ({user?.categoria})</p>
              <p><strong>Institución:</strong> {user?.institucion}</p>
              <p><strong>Cargo:</strong> {user?.cargo}</p>
              <p><strong>Nueva funcionalidad:</strong> Formulario de solicitudes (/solicitudes) implementado</p>
              <p><strong>Nota:</strong> Los datos mostrados son ejemplos. Próxima iteración: "Mis Solicitudes" real</p>
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
}

function ActionCard({ title, description, icon: Icon, onClick, color }: ActionCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
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