//src/app/(dashboard)/tecnico/page.tsx
'use client';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  Wrench, 
  ClipboardList, 
  LogOut,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';

export default function TecnicoDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  const stats = [
    { title: 'OTs Asignadas', value: '12', icon: ClipboardList, color: 'bg-blue-500' },
    { title: 'Pendientes Hoy', value: '5', icon: Clock, color: 'bg-yellow-500' },
    { title: 'Completadas', value: '8', icon: CheckCircle, color: 'bg-green-500' },
    { title: 'Urgentes', value: '2', icon: AlertTriangle, color: 'bg-red-500' },
  ];

  const ordenesPendientes = [
    { 
      id: 'OT-130209', 
      equipo: 'CAMA-228', 
      descripcion: 'Reparación cama eléctrica sector C',
      prioridad: 'Alta',
      ubicacion: 'UCI - Piso 3'
    },
    { 
      id: 'OT-130196', 
      equipo: 'CAMA-066', 
      descripcion: 'Cable cortado de la cama sala 4096-2',
      prioridad: 'Media',
      ubicacion: 'Medicina Interna - Piso 2'
    },
    { 
      id: 'OT-130015', 
      equipo: 'CAMA-214', 
      descripcion: 'Mantenimiento preventivo programado',
      prioridad: 'Baja',
      ubicacion: 'Urgencias - Piso 1'
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
                <p className="text-xs text-gray-500">Centro Operativo Técnico</p>
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
            Hola, {user?.nombre}
          </h2>
          <p className="text-gray-600">
            Centro operativo - Gestión de órdenes de trabajo
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
            title="Mis Órdenes"
            description="Ver órdenes de trabajo asignadas"
            icon={ClipboardList}
            onClick={() => router.push('/mis-ordenes')}
            color="bg-blue-500"
          />
          <ActionCard
            title="Equipos"
            description="Consultar equipos y historial"
            icon={Wrench}
            onClick={() => router.push('/equipos')}
            color="bg-green-500"
          />
          <ActionCard
            title="Calendario"
            description="Ver programación de trabajo"
            icon={Calendar}
            onClick={() => router.push('/calendario')}
            color="bg-purple-500"
          />
        </div>

        {/* Órdenes Pendientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Órdenes Pendientes</h3>
            <p className="text-sm text-gray-600">Órdenes de trabajo asignadas a ti</p>
          </div>
          <div className="divide-y divide-gray-200">
            {ordenesPendientes.map((orden, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-lg font-semibold text-gray-900">{orden.id}</span>
                      <span className="ml-3 text-sm font-medium text-gray-600">
                        {orden.equipo}
                      </span>
                      <span className={`ml-auto px-2 py-1 text-xs font-medium rounded-full ${
                        orden.prioridad === 'Alta' ? 'bg-red-100 text-red-800' :
                        orden.prioridad === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {orden.prioridad}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{orden.descripcion}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {orden.ubicacion}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Debug Info (solo desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">🔧 Información de Debug</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Usuario:</strong> {user?.correo} ({user?.categoria})</p>
              <p><strong>Institución:</strong> {user?.institucion}</p>
              <p><strong>Cargo:</strong> {user?.cargo}</p>
              <p><strong>Nota:</strong> Los datos mostrados son ejemplos. Las funcionalidades se implementarán progresivamente.</p>
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