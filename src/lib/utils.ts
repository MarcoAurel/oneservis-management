// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from 'date-fns';
// import { es } from 'date-fns/locale'; // Comentado temporalmente

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formateo de fechas en español
export function formatDate(date: Date | string, pattern: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  // Temporalmente sin locale español
  return format(dateObj, pattern);
}

// Formateo de fechas con hora
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
}

// Generar código único para correctivos/preventivos
export function generateCodigoMantenimiento(tipo: 'correctivo' | 'preventivo'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const prefix = tipo === 'correctivo' ? 'COR' : 'PRE';
  return `${prefix}-${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
}

// Validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Formatear texto para mostrar
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Obtener iniciales de nombre
export function getInitials(nombre: string): string {
  const palabras = nombre.split(' ');
  if (palabras.length >= 2) {
    return `${palabras[0].charAt(0)}${palabras[1].charAt(0)}`.toUpperCase();
  }
  return nombre.charAt(0).toUpperCase();
}

// Calcular días entre fechas
export function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Obtener color por estado de OT
export function getStatusColor(status: string): string {
  const colors = {
    'pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'en_proceso': 'bg-blue-100 text-blue-800 border-blue-200',
    'completada': 'bg-green-100 text-green-800 border-green-200',
    'cancelada': 'bg-red-100 text-red-800 border-red-200',
    'programada': 'bg-purple-100 text-purple-800 border-purple-200',
    'ejecutada': 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };
  
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
}

// Obtener color por categoría de personal
export function getCategoryColor(categoria: string): string {
  const colors = {
    'ADMIN': 'bg-red-100 text-red-800 border-red-200',
    'TECNICO': 'bg-blue-100 text-blue-800 border-blue-200',
    'CLIENTE': 'bg-green-100 text-green-800 border-green-200'
  };
  
  return colors[categoria as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
}

// Formatear estado para mostrar
export function formatStatus(status: string): string {
  const statusMap = {
    'pendiente': 'Pendiente',
    'en_proceso': 'En Proceso',
    'completada': 'Completada',
    'cancelada': 'Cancelada',
    'programada': 'Programada',
    'ejecutada': 'Ejecutada'
  };
  
  return statusMap[status as keyof typeof statusMap] || capitalize(status);
}

// Formatear categoría para mostrar
export function formatCategory(categoria: string): string {
  const categoryMap = {
    'ADMIN': 'Administrador',
    'TECNICO': 'Técnico',
    'CLIENTE': 'Cliente'
  };
  
  return categoryMap[categoria as keyof typeof categoryMap] || categoria;
}
