//src/app/(dashboard)/ordenes/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Plus,
  User,
  Calendar,
  Wrench,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle
} from 'lucide-react';
import { OrdenTrabajoCompleta } from '@/types/database';
import { formatDate, getStatusColor, formatStatus } from '@/lib/utils';

interface OrdenesResponse {
  success: boolean;
  data: {
    ordenes: OrdenTrabajoCompleta[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters: {
      equipos: any[];
      tecnicos: any[];
      estados: string[];
    };
  };
  message: string;
}

export default function OrdenesPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Estados
  const [ordenes, setOrdenes] = useState<OrdenTrabajoCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<any>({});
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  
  // Estados de filtros
  const [search, setSearch] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedTecnico, setSelectedTecnico] = useState('');
  const [selectedEquipo, setSelectedEquipo] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});

  // Cargar órdenes
  const cargarOrdenes = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (search) params.append('search', search);
      if (selectedEstado) params.append('estado', selectedEstado);
      if (selectedTecnico) params.append('id_tecnico', selectedTecnico);
      if (selectedEquipo) params.append('id_equipo', selectedEquipo);
      if (fechaDesde) params.append('fecha_desde', fechaDesde);
      if (fechaHasta) params.append('fecha_hasta', fechaHasta);

      const response = await fetch(`/api/ordenes?${params}`);
      const data: OrdenesResponse = await response.json();

      if (data.success) {
        setOrdenes(data.data.ordenes);
        setPagination(data.data.pagination);
        setFiltros(data.data.filters);
      } else {
        setError(data.message || 'Error al cargar órdenes');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    cargarOrdenes(currentPage);
  }, [currentPage, search, selectedEstado, selectedTecnico, selectedEquipo, fechaDesde, fechaHasta]);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        cargarOrdenes(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleLogout = async () => {
    await logout();
  };

  const limpiarFiltros = () => {
    setSearch('');
    setSelectedEstado('');
    setSelectedTecnico('');
    setSelectedEquipo('');
    setFechaDesde('');
    setFechaHasta('');
    setCurrentPage(1);
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Clock className="w-4 h-4" />;
      case 'en_proceso':
        return <PlayCircle className="w-4 h-4" />;
      case 'completada':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelada':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading && ordenes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando órdenes de trabajo...</p>
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
                <h1 className="text-xl font-semibold text-gray-900">Órdenes de Trabajo</h1>
                <p className="text-xs text-gray-500">OneServis Management System</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNewOrderModal(true)}
                className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Orden
              </button>
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
                placeholder="Buscar por número de orden, resumen, equipo o técnico..."
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
            <div className="bg-white p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={selectedEstado}
                  onChange={(e) => setSelectedEstado(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todos los estados</option>
                  {filtros.estados?.map((estado: string) => (
                    <option key={estado} value={estado}>
                      {formatStatus(estado)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Técnico</label>
                <select
                  value={selectedTecnico}
                  onChange={(e) => setSelectedTecnico(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todos los técnicos</option>
                  {filtros.tecnicos?.map((tecnico: any) => (
                    <option key={tecnico.id_personal} value={tecnico.id_personal}>
                      {tecnico.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipo</label>
                <select
                  value={selectedEquipo}
                  onChange={(e) => setSelectedEquipo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todos los equipos</option>
                  {filtros.equipos?.map((equipo: any) => (
                    <option key={equipo.id_equipo} value={equipo.id_equipo}>
                      {equipo.tipo_equipo} - {equipo.serie} ({equipo.cliente_nombre})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="lg:col-span-5 flex justify-end">
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
            <ClipboardList className="w-5 h-5 text-orange-500" />
            <span className="text-lg font-semibold text-gray-900">
              {pagination.total || 0} órdenes encontradas
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

        {/* Lista de órdenes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {ordenes.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron órdenes</h3>
              <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {ordenes.map((orden) => (
                <div key={orden.id_ot} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Cabecera de la orden */}
                      <div className="flex items-center mb-3">
                        <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                          <ClipboardList className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                              OT-{orden.id_ot.toString().padStart(6, '0')}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(orden.estado)}`}>
                              {getEstadoIcon(orden.estado)}
                              <span className="ml-1">{formatStatus(orden.estado)}</span>
                            </span>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(orden.fecha_ot)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Resumen */}
                      <p className="text-gray-700 mb-4 line-clamp-2">{orden.resumen}</p>

                      {/* Detalles en grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {/* Equipo */}
                        <div className="flex items-start space-x-2">
                          <Wrench className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {orden.equipo?.tipo_equipo}
                            </p>
                            <p className="text-gray-500">
                              {orden.equipo?.marca} - {orden.equipo?.serie}
                            </p>
                            <p className="text-gray-500">
                              {orden.equipo?.cliente?.nombre}
                            </p>
                          </div>
                        </div>

                        {/* Ubicación */}
                        <div className="flex items-start space-x-2">
                          <Building className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {orden.equipo?.ubicacion?.servicio_clinico}
                            </p>
                            {orden.equipo?.ubicacion?.piso && (
                              <p className="text-gray-500">
                                Piso {orden.equipo.ubicacion.piso}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Personal */}
                        <div className="flex items-start space-x-2">
                          <User className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900">
                              Informó: {orden.quien_informa?.nombre}
                            </p>
                            {orden.tecnico_asignado ? (
                              <p className="text-gray-500">
                                Asignado: {orden.tecnico_asignado.nombre}
                              </p>
                            ) : (
                              <p className="text-yellow-600">Sin asignar</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
            <h3 className="text-sm font-medium text-blue-800 mb-2">🔧 Debug - Órdenes de Trabajo</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Órdenes cargadas:</strong> {ordenes.length}</p>
              <p><strong>Total en BD:</strong> {pagination.total}</p>
              <p><strong>Página actual:</strong> {pagination.page}/{pagination.totalPages}</p>
              <p><strong>Filtros activos:</strong> {[search, selectedEstado, selectedTecnico, selectedEquipo, fechaDesde, fechaHasta].filter(Boolean).length}</p>
              <p><strong>Modal nueva orden:</strong> {showNewOrderModal ? 'Abierto' : 'Cerrado'}</p>
            </div>
          </div>
        )}
      </main>

      {/* Modal Nueva Orden (placeholder) */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Nueva Orden de Trabajo</h3>
            <p className="text-gray-600 mb-4">
              El formulario de creación se implementará en la siguiente iteración.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}