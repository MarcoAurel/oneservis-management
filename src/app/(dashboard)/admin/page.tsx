//src/app/(dashboard)/admin/page.tsx
'use client';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Wrench, 
  ClipboardList, 
  Settings, 
  LogOut,
  BarChart3,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  const stats = [
    { title: 'Total Equipos', value: '156', icon: Wrench, color: 'bg-blue-500' },
    { title: 'Órdenes Pendientes', value: '23', icon: ClipboardList, color: 'bg-yellow-500' },
    { title: 'Técnicos Activos', value: '8', icon: Users, color: 'bg-green-500' },
    { title: 'Alertas', value: '5', icon: AlertTriangle, color: 'bg-red-500' },
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
                <p className="text-xs text-gray-500">Panel de Administración</p>
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
            Panel de administración del sistema OneServis
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
            title="Gestión de Equipos"
            description="Ver y administrar todos los equipos médicos"
            icon={Wrench}
            onClick={() => router.push('/equipos')}
            color="bg-blue-500"
          />
          <ActionCard
            title="Órdenes de Trabajo"
            description="Gestionar órdenes de mantenimiento"
            icon={ClipboardList}
            onClick={() => router.push('/ordenes')}
            color="bg-yellow-500"
          />
          <ActionCard
            title="Personal Técnico"
            description="Administrar técnicos y personal"
            icon={Users}
            onClick={() => router.push('/personal')}
            color="bg-green-500"
          />
          <ActionCard
            title="Reportes"
            description="Ver reportes y estadísticas"
            icon={BarChart3}
            onClick={() => router.push('/reportes')}
            color="bg-purple-500"
          />
          <ActionCard
            title="Calendario"
            description="Programación de mantenimientos"
            icon={Calendar}
            onClick={() => router.push('/calendario')}
            color="bg-indigo-500"
          />
          <ActionCard
            title="Configuración"
            description="Configurar sistema"
            icon={Settings}
            onClick={() => router.push('/configuracion')}
            color="bg-gray-500"
          />
        </div>

        {/* Debug Info (solo desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">🔧 Información de Debug</h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <p><strong>Usuario:</strong> {user?.correo} ({user?.categoria})</p>
              <p><strong>Institución:</strong> {user?.institucion}</p>
              <p><strong>ID:</strong> {user?.id_personal}</p>
              <p><strong>Nota:</strong> Las páginas de equipos, órdenes, etc. se crearán en siguientes iteraciones</p>
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