//src/app/(dashboard)/equipos/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  Wrench, 
  Search, 
  Filter, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  MapPin,
  Building,
  Calendar,
  Hash
} from 'lucide-react';
import { EquipoCompleto } from '@/types/database';
import { formatDate } from '@/lib/utils';

interface EquiposResponse {
  success: boolean;
  data: {
    equipos: EquipoCompleto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters: {
      clientes: any[];
      ubicaciones: any[];
      tipos: string[];
      marcas: string[];
    };
  };
  message: string;
}

export default function EquiposPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Estados
  const [equipos, setEquipos] = useState<EquipoCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<any>({});
  
  // Estados de filtros
  const [search, setSearch] = useState('');
  const [selectedCliente, setSelectedCliente] = useState('');
  const [selectedUbicacion, setSelectedUbicacion] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedMarca, setSelectedMarca] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});

  // Cargar equipos
  const cargarEquipos = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (search) params.append('search', search);
      if (selectedCliente) params.append('id_cliente', selectedCliente);
      if (selectedUbicacion) params.append('id_ubicacion', selectedUbicacion);
      if (selectedTipo) params.append('tipo_equipo', selectedTipo);
      if (selectedMarca) params.append('marca', selectedMarca);

      const response = await fetch(`/api/equipos?${params}`);
      const data: EquiposResponse = await response.json();

      if (data.success) {
        setEquipos(data.data.equipos);
        setPagination(data.data.pagination);
        setFiltros(data.data.filters);
      } else {
        setError(data.message || 'Error al cargar equipos');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    cargarEquipos(currentPage);
  }, [currentPage, search, selectedCliente, selectedUbicacion, selectedTipo, selectedMarca]);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        cargarEquipos(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleLogout = async () => {
    await logout();
  };

  const limpiarFiltros = () => {
    setSearch('');
    setSelectedCliente('');
    setSelectedUbicacion('');
    setSelectedTipo('');
    setSelectedMarca('');
    setCurrentPage(1);
  };

  if (loading && equipos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando equipos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">One</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Gestión de Equipos</h1>
                <p className="text-xs text-gray-500">OneServis Management System</p>
              </div>
            </div>

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
        {/* Controles */}
        <div className="mb-6 space-y-4">
          {/* Barra de búsqueda y filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar equipos por tipo, marca, modelo, serie o cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </button>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <select
                  value={selectedCliente}
                  onChange={(e) => setSelectedCliente(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todos los clientes</option>
                  {filtros.clientes?.map((cliente: any) => (
                    <option key={cliente.id_cliente} value={cliente.id_cliente}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                <select
                  value={selectedUbicacion}
                  onChange={(e) => setSelectedUbicacion(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todas las ubicaciones</option>
                  {filtros.ubicaciones?.map((ubicacion: any) => (
                    <option key={ubicacion.id_ubicacion} value={ubicacion.id_ubicacion}>
                      {ubicacion.servicio_clinico} {ubicacion.piso && `- ${ubicacion.piso}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Equipo</label>
                <select
                  value={selectedTipo}
                  onChange={(e) => setSelectedTipo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todos los tipos</option>
                  {filtros.tipos?.map((tipo: string) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                <select
                  value={selectedMarca}
                  onChange={(e) => setSelectedMarca(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todas las marcas</option>
                  {filtros.marcas?.map((marca: string) => (
                    <option key={marca} value={marca}>{marca}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-4 flex justify-end">
                <button
                  onClick={limpiarFiltros}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-orange-500" />
            <span className="text-lg font-semibold text-gray-900">
              {pagination.total || 0} equipos encontrados
            </span>
          </div>
          {pagination.page && (
            <span className="text-sm text-gray-500">
              Página {pagination.page} de {pagination.totalPages}
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Tabla de equipos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {equipos.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron equipos</h3>
              <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detalles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Ingreso
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {equipos.map((equipo) => (
                    <tr key={equipo.id_equipo} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                            <Wrench className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {equipo.tipo_equipo}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {equipo.id_equipo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {equipo.cliente?.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {equipo.cliente?.rut}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          {equipo.ubicacion?.servicio_clinico}
                        </div>
                        {equipo.ubicacion?.piso && (
                          <div className="text-sm text-gray-500">
                            Piso {equipo.ubicacion.piso}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div><strong>Marca:</strong> {equipo.marca}</div>
                          <div><strong>Modelo:</strong> {equipo.modelo}</div>
                          <div><strong>Serie:</strong> {equipo.serie}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(equipo.fecha_ingreso)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
              {pagination.total} resultados
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={!pagination.hasPrev}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(page => page + 1)}
                disabled={!pagination.hasNext}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">🔧 Debug - Lista de Equipos</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Equipos cargados:</strong> {equipos.length}</p>
              <p><strong>Total en BD:</strong> {pagination.total}</p>
              <p><strong>Página actual:</strong> {pagination.page}/{pagination.totalPages}</p>
              <p><strong>Filtros activos:</strong> {[search, selectedCliente, selectedUbicacion, selectedTipo, selectedMarca].filter(Boolean).length}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}