'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/types/database';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (correo: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Verificar sesión al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (correo: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, password }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Error en login');
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/login', {
        method: 'DELETE',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setUser(null);
      router.push('/login');
      router.refresh();
    }
  };

  const refresh = async () => {
    await checkAuth();
  };

  // Crear el objeto value fuera del JSX
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refresh
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}

// Hook para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

// Hook para verificar permisos
export function usePermissions() {
  const { user } = useAuth();
  
  const hasPermission = (requiredCategories: string[]): boolean => {
    if (!user) return false;
    
    const categoryHierarchy = {
      'ADMIN': 3,
      'TECNICO': 2,
      'CLIENTE': 1
    };
    
    const userLevel = categoryHierarchy[user.categoria as keyof typeof categoryHierarchy] || 0;
    const requiredLevels = requiredCategories.map(cat => categoryHierarchy[cat as keyof typeof categoryHierarchy] || 0);
    
    return requiredLevels.some(level => userLevel >= level);
  };

  const isAdmin = () => user?.categoria === 'ADMIN';
  const isTecnico = () => user?.categoria === 'TECNICO' || user?.categoria === 'ADMIN';
  const isCliente = () => user?.categoria === 'CLIENTE';

  return {
    hasPermission,
    isAdmin,
    isTecnico,
    isCliente,
    userCategory: user?.categoria,
    userName: user?.nombre,
    userEmail: user?.correo,
    userInstitution: user?.institucion
  };
}

// Hook para redirección automática
export function useAuthGuard(allowedCategories?: string[]) {
  const { user, isLoading } = useAuth();
  const { hasPermission } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (allowedCategories && !hasPermission(allowedCategories)) {
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
  }, [user, isLoading, allowedCategories, hasPermission, router]);

  return { user, isLoading };
}