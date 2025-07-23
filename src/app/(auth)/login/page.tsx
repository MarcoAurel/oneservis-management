'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

// Esquema de validación
const loginSchema = z.object({
  correo: z.string().email('Email inválido').min(1, 'Email es requerido'),
  password: z.string().min(1, 'Contraseña es requerida')
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Debug inline - solo en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Funciones de debug simples
      const debugFunctions = {
        async checkUsers() {
          try {
            const response = await fetch('/api/debug/users');
            const data = await response.json();
            console.group('📊 USUARIOS EN BD');
            if (data.success) {
              console.log('✅ Total usuarios:', data.statistics?.total_usuarios);
              console.log('👥 Activos:', data.statistics?.activos);
              console.log('🔑 Con password:', data.statistics?.con_password);
              data.users?.forEach((user: any) => {
                console.log(`${user.correo} - ${user.categoria} - ${user.activo ? 'Activo' : 'Inactivo'}`);
              });
            }
            console.groupEnd();
            return data;
          } catch (error) {
            console.error('Error debug:', error);
          }
        },
        
        async testLogin(email: string, password: string) {
          console.log(`🧪 Testing: ${email}`);
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ correo: email, password }),
              credentials: 'include'
            });
            const result = await response.json();
            console.log(result.success ? '✅ Login OK' : '❌ Login FAIL:', result);
            return result;
          } catch (error) {
            console.error('Error login:', error);
          }
        }
      };

      // Agregar al window para acceso desde consola
      (window as any).debugLogin = {
        ...debugFunctions,
        testAdmin: () => debugFunctions.testLogin('admin@oneservis.com', 'temporal123'),
        testTecnico: () => debugFunctions.testLogin('htripayana@oneservis.com', 'temporal123'),
        help: () => {
          console.log('🔧 Commands: debugLogin.checkUsers(), debugLogin.testAdmin(), debugLogin.testTecnico()');
        }
      };

      console.log('🔧 Debug loaded! Run: debugLogin.help()');
      
      // Auto-verificar usuarios
      debugFunctions.checkUsers();
    }
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      correo: 'admin@oneservis.com',
      password: 'temporal123'
    }
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error en login');
      }

      // Login exitoso - redirigir según categoría
      const userCategory = result.user.categoria;
      
      switch (userCategory) {
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
          router.push('/dashboard');
      }
      
      // Recargar para actualizar middleware
      router.refresh();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo y Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
            <span className="text-2xl sm:text-3xl font-bold text-white">One</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            OneServis
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Sistema de Gestión de Órdenes de Trabajo
          </p>
        </div>

        {/* Formulario de Login */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Campo Email */}
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                {...register('correo')}
                type="email"
                id="correo"
                className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                  errors.correo ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="admin@oneservis.com"
                disabled={isLoading}
              />
              {errors.correo && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.correo.message}
                </p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`w-full px-4 py-3 pr-12 bg-white border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error General */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="break-words">{error}</span>
                </p>
              </div>
            )}

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                <div className="flex items-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Iniciar Sesión
                </div>
              )}
            </button>
          </form>

          {/* Credenciales de prueba */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-600 mb-2">Credenciales de prueba:</p>
            <div className="text-xs text-gray-700 space-y-1">
              <p><strong>Admin:</strong> admin@oneservis.com</p>
              <p><strong>Técnico:</strong> htripayana@oneservis.com</p>
              <p><strong>Contraseña:</strong> temporal123</p>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-blue-600">
                  🔧 Debug: Abre consola (F12) → <code className="bg-gray-200 px-1 rounded">debugLogin.help()</code>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs sm:text-sm text-gray-500">
          © 2024 OneServis SPA. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}