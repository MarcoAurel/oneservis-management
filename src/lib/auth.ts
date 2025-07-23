import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { executeQuery } from './database';
import { Personal, AuthUser } from '@/types/database';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthToken {
  user: AuthUser;
  iat: number;
  exp: number;
}

// Tipo para el resultado de la query de personal con campos adicionales
interface PersonalConAuth {
  id_personal: number;
  nombre: string;
  cargo: string;
  correo: string;
  categoria: 'ADMIN' | 'TECNICO' | 'CLIENTE';
  institucion: string;
  password?: string;
  activo?: number; // Como viene de MySQL (1/0)
}

// Generar JWT token
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { user },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Verificar JWT token
export function verifyToken(token: string): AuthToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthToken;
  } catch (error) {
    return null;
  }
}

// Hash de contraseña
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verificar contraseña
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Autenticar usuario usando tabla personal
export async function authenticateUser(correo: string, password: string): Promise<AuthUser | null> {
  try {
    console.log('🔍 Intentando autenticar usuario:', correo);
    
    const query = `
      SELECT id_personal, nombre, correo, categoria, institucion, cargo, password, activo
      FROM personal 
      WHERE correo = ?
    `;
    
    console.log('📋 Ejecutando query:', query);
    console.log('📋 Con parámetro:', correo);
    
    const results = await executeQuery(query, [correo]) as PersonalConAuth[];
    
    console.log('📊 Resultados de la query:', {
      cantidad: results.length,
      usuario: results.length > 0 ? {
        id_personal: results[0].id_personal,
        nombre: results[0].nombre,
        correo: results[0].correo,
        categoria: results[0].categoria,
        activo: results[0].activo,
        tiene_password: !!results[0].password
      } : 'No encontrado'
    });
    
    if (results.length === 0) {
      console.log('❌ Usuario no encontrado en BD');
      return null;
    }
    
    const personal = results[0];
    
    // Verificar que el usuario esté activo
    if (personal.activo === 0) {
      console.log('❌ Usuario inactivo');
      return null;
    }
    
    console.log('🔑 Verificando contraseña...');
    console.log('🔑 Password ingresado:', password);
    console.log('🔑 Password en BD:', personal.password);
    
    // Verificar contraseña
    let isValidPassword = false;
    
    if (personal.password && personal.password !== 'temporal123') {
      // Si hay password hasheado, verificar con bcrypt
      console.log('🔐 Verificando con bcrypt...');
      isValidPassword = await verifyPassword(password, personal.password);
    } else {
      // Verificación directa para password temporal
      console.log('🔐 Verificando password temporal...');
      isValidPassword = password === 'temporal123';
    }
    
    console.log('🔑 Resultado verificación:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Contraseña inválida');
      return null;
    }
    
    console.log('✅ Autenticación exitosa');
    
    // Retornar usuario sin contraseña
    return {
      id_personal: personal.id_personal,
      nombre: personal.nombre,
      correo: personal.correo,
      categoria: personal.categoria,
      institucion: personal.institucion,
      cargo: personal.cargo
    };
  } catch (error) {
    console.error('💥 Error en autenticación:', error);
    return null;
  }
}

// Obtener personal por ID
export async function getPersonalById(personalId: number): Promise<AuthUser | null> {
  try {
    const query = `
      SELECT id_personal, nombre, correo, categoria, institucion, cargo, activo
      FROM personal 
      WHERE id_personal = ?
    `;
    
    const results = await executeQuery(query, [personalId]) as PersonalConAuth[];
    
    if (results.length === 0) {
      return null;
    }
    
    const personal = results[0];
    
    // Verificar que el usuario esté activo
    if (personal.activo === 0) {
      return null;
    }
    
    return {
      id_personal: personal.id_personal,
      nombre: personal.nombre,
      correo: personal.correo,
      categoria: personal.categoria,
      institucion: personal.institucion,
      cargo: personal.cargo
    };
  } catch (error) {
    console.error('Error obteniendo personal:', error);
    return null;
  }
}

// Verificar permisos por categoría
export function hasPermission(userCategory: string, requiredCategories: string[]): boolean {
  const categoryHierarchy = {
    'ADMIN': 3,
    'TECNICO': 2,
    'CLIENTE': 1
  };
  
  const userLevel = categoryHierarchy[userCategory as keyof typeof categoryHierarchy] || 0;
  const requiredLevels = requiredCategories.map(cat => categoryHierarchy[cat as keyof typeof categoryHierarchy] || 0);
  
  return requiredLevels.some(level => userLevel >= level);
}

// Middleware para extraer usuario del token
export function extractUserFromRequest(request: Request): AuthUser | null {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    return decoded?.user || null;
  } catch (error) {
    return null;
  }
}

// Crear usuario inicial (para setup)
export async function createInitialAdmin(): Promise<void> {
  try {
    // Verificar si ya existe un admin
    const checkQuery = `SELECT COUNT(*) as count FROM personal WHERE categoria = 'ADMIN'`;
    const result = await executeQuery(checkQuery) as [{count: number}];
    
    if (result[0].count > 0) {
      console.log('✅ Admin ya existe');
      return;
    }
    
    // Crear admin inicial
    const insertQuery = `
      INSERT INTO personal (nombre, cargo, correo, categoria, institucion, activo, password)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await executeQuery(insertQuery, [
      'Administrador Sistema',
      'Administrador',
      'admin@oneservis.com',
      'ADMIN',
      'OneServis Central',
      1, // activo = 1
      'temporal123' // password temporal
    ]);
    
    console.log('✅ Usuario admin inicial creado');
    console.log('📧 Email: admin@oneservis.com');
    console.log('🔑 Password temporal: temporal123');
    
  } catch (error) {
    console.error('Error creando admin inicial:', error);
  }
}