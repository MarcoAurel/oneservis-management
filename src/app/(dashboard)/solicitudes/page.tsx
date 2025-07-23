//src/app/(dashboard)/solicitudes/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FileText,
  LogOut,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Camera,
  MapPin,
  Wrench,
  User,
  Mail,
  Phone,
  AlertTriangle,
  Clock,
  Flag
} from 'lucide-react';

// Schema de validación (mismo que la API)
const SolicitudSchema = z.object({
  id_equipo: z.number().int().positive('Debe seleccionar un equipo'),
  tipo_solicitud: z.enum(['correctivo', 'preventivo'], {
    required_error: 'Debe especificar el tipo de solicitud'
  }),
  descripcion_problema: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  prioridad: z.enum(['baja', 'media', 'alta'], {
    required_error: 'Debe especificar la prioridad'
  }),
  contacto_nombre: z.string().min(2, 'Nombre del contacto requerido'),
  contacto_correo: z.string().email('Correo electrónico inválido'),
  contacto_telefono: z.string().optional(),
  observaciones: z.string().optional(),
  id_quien_solicita: z.number().int().positive('ID de solicitante requerido')
});

type SolicitudFormData = z.infer<typeof SolicitudSchema>;

interface FormularioData {
  equipos_por_ubicacion: Record<string, {
    id_ubicacion: number;
    servicio_clinico: string;
    piso?: string;
    detalle?: string;
    equipos: any[];
  }>;
  ubicaciones: any[];
  tipos_solicitud: string[];
  niveles_prioridad: string[];
}

export default function SolicitudesPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Estados
  const [datosFormulario, setDatosFormulario] = useState<FormularioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);
  const [selectedUbicacion, setSelectedUbicacion] = useState('');
  const [equiposDisponibles, setEquiposDisponibles] = useState<any[]>([]);

  // Configurar formulario
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<SolicitudFormData>({
    resolver: zodResolver(SolicitudSchema),
    defaultValues: {
      id_quien_solicita: user?.id_personal || 0,
      contacto_nombre: user?.nombre || '',
      contacto_correo: user?.correo || ''
    }
  });

  const watchedEquipo = watch('id_equipo');

  // Cargar datos del formulario
  const cargarDatosFormulario = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/solicitudes');
      const data = await response.json();

      if (data.success) {
        setDatosFormulario(data.data);
      } else {
        setError(data.error || 'Error al cargar datos del formulario');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de ubicación
  const handleUbicacionChange = (ubicacionKey: string) => {
    setSelectedUbicacion(ubicacionKey);
    if (ubicacionKey && datosFormulario?.equipos_por_ubicacion[ubicacionKey]) {
      setEquiposDisponibles(datosFormulario.equipos_por_ubicacion[ubicacionKey].equipos);
    } else {
      setEquiposDisponibles([]);
    }
    setValue('id_equipo', 0); // Reset equipo selection
  };

  // Enviar solicitud
  const onSubmit = async (data: SolicitudFormData) => {
    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.data);
        reset(); // Limpiar formulario
        setSelectedUbicacion('');
        setEquiposDisponibles([]);
      } else {
        setError(result.error || 'Error al enviar la solicitud');
      }
    } catch (err) {
      setError('Error de conexión al enviar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const nuevaSolicitud = () => {
    setSuccess(null);
    setError(null);
    reset();
    setSelectedUbicacion('');
    setEquiposDisponibles([]);
  };

  // Efectos
  useEffect(() => {
    cargarDatosFormulario();
  }, []);

  useEffect(() => {
    if (user) {
      setValue('id_quien_solicita', user.id_personal);
      setValue('contacto_nombre', user.nombre);
      setValue('contacto_correo', user.correo);
    }
  }, [user, setValue]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando formulario...</p>
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
                <h1 className="text-xl font-semibold text-gray-900">Nueva Solicitud</h1>
                <p className="text-xs text-gray-500">Formulario de Solicitud de Mantenimiento</p>
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
        <div className="max-w-3xl mx-auto">
          {/* Mensaje de éxito */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                <h3 className="text-lg font-semibold text-green-900">¡Solicitud enviada exitosamente!</h3>
              </div>
              <div className="text-green-800 space-y-2">
                <p><strong>Número de Solicitud:</strong> {success.numero_solicitud}</p>
                <p><strong>Orden de Trabajo:</strong> {success.numero_ot}</p>
                <p><strong>Tipo:</strong> {success.tipo_solicitud.toUpperCase()}</p>
                <p><strong>Prioridad:</strong> {success.prioridad.toUpperCase()}</p>
                <p className="text-sm mt-4">
                  Su solicitud ha sido registrada y será revisada por nuestro equipo técnico. 
                  Recibirá actualizaciones por correo electrónico.
                </p>
              </div>
              <button
                onClick={nuevaSolicitud}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Crear Nueva Solicitud
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Formulario */}
          {!success && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <FileText className="w-6 h-6 text-orange-500 mr-3" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Solicitud de Mantenimiento</h2>
                    <p className="text-sm text-gray-600">Complete el formulario para generar una orden de trabajo</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Tipo de Solicitud */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Solicitud *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="correctivo"
                        {...register('tipo_solicitud')}
                        className="mr-3 text-orange-500"
                      />
                      <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                        <div>
                          <div className="font-medium">Correctivo</div>
                          <div className="text-sm text-gray-500">Reparación de falla o problema</div>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="preventivo"
                        {...register('tipo_solicitud')}
                        className="mr-3 text-orange-500"
                      />
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-blue-500 mr-2" />
                        <div>
                          <div className="font-medium">Preventivo</div>
                          <div className="text-sm text-gray-500">Mantenimiento programado</div>
                        </div>
                      </div>
                    </label>
                  </div>
                  {errors.tipo_solicitud && (
                    <p className="mt-1 text-sm text-red-600">{errors.tipo_solicitud.message}</p>
                  )}
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Ubicación del Equipo *
                  </label>
                  <select
                    value={selectedUbicacion}
                    onChange={(e) => handleUbicacionChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Seleccione una ubicación</option>
                    {datosFormulario && Object.entries(datosFormulario.equipos_por_ubicacion).map(([key, ubicacion]) => (
                      <option key={key} value={key}>
                        {ubicacion.servicio_clinico} {ubicacion.piso && `- Piso ${ubicacion.piso}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Equipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Wrench className="w-4 h-4 inline mr-1" />
                    Equipo *
                  </label>
                  <select
                    {...register('id_equipo', { valueAsNumber: true })}
                    disabled={!selectedUbicacion}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value={0}>
                      {selectedUbicacion ? 'Seleccione un equipo' : 'Primero seleccione una ubicación'}
                    </option>
                    {equiposDisponibles.map((equipo) => (
                      <option key={equipo.id_equipo} value={equipo.id_equipo}>
                        {equipo.tipo_equipo} - {equipo.marca} - {equipo.serie}
                      </option>
                    ))}
                  </select>
                  {errors.id_equipo && (
                    <p className="mt-1 text-sm text-red-600">{errors.id_equipo.message}</p>
                  )}
                </div>

                {/* Prioridad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Flag className="w-4 h-4 inline mr-1" />
                    Prioridad *
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {['baja', 'media', 'alta'].map((nivel) => (
                      <label key={nivel} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          value={nivel}
                          {...register('prioridad')}
                          className="mr-2 text-orange-500"
                        />
                        <span className={`font-medium ${
                          nivel === 'alta' ? 'text-red-600' : 
                          nivel === 'media' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.prioridad && (
                    <p className="mt-1 text-sm text-red-600">{errors.prioridad.message}</p>
                  )}
                </div>

                {/* Descripción del Problema */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del Problema *
                  </label>
                  <textarea
                    {...register('descripcion_problema')}
                    rows={4}
                    placeholder="Describa detalladamente el problema o el mantenimiento requerido..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {errors.descripcion_problema && (
                    <p className="mt-1 text-sm text-red-600">{errors.descripcion_problema.message}</p>
                  )}
                </div>

                {/* Información de Contacto */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Contacto</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Nombre de Contacto *
                      </label>
                      <input
                        type="text"
                        {...register('contacto_nombre')}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      {errors.contacto_nombre && (
                        <p className="mt-1 text-sm text-red-600">{errors.contacto_nombre.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        {...register('contacto_correo')}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      {errors.contacto_correo && (
                        <p className="mt-1 text-sm text-red-600">{errors.contacto_correo.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Teléfono (Opcional)
                    </label>
                    <input
                      type="tel"
                      {...register('contacto_telefono')}
                      placeholder="+56 9 1234 5678"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Observaciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones Adicionales
                  </label>
                  <textarea
                    {...register('observaciones')}
                    rows={3}
                    placeholder="Información adicional, horarios preferenciales, etc..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Solicitud'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">🔧 Debug - Formulario de Solicitudes</h3>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Usuario:</strong> {user?.correo} (ID: {user?.id_personal})</p>
                <p><strong>Ubicación seleccionada:</strong> {selectedUbicacion || 'Ninguna'}</p>
                <p><strong>Equipos disponibles:</strong> {equiposDisponibles.length}</p>
                <p><strong>Equipo seleccionado:</strong> {watchedEquipo || 'Ninguno'}</p>
                <p><strong>Datos cargados:</strong> {datosFormulario ? 'Sí' : 'No'}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}