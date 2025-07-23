//src/app/api/debug/route.ts
import { NextResponse } from 'next/server';
import { executeQuery, testConnection } from '@/lib/database';
export async function GET() {
  try {
    console.log('🔍 API Debug - Verificando usuarios en BD');
    
    // Test de conexión
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'No hay conexión a la base de datos'
      }, { status: 500 });
    }

    // Obtener todos los usuarios
    const query = `
      SELECT 
        id_personal, 
        nombre, 
        correo, 
        categoria, 
        institucion, 
        cargo,
        activo,
        password,
        fecha_creacion,
        fecha_actualizacion
      FROM personal 
      ORDER BY categoria DESC, id_personal ASC
    `;
    
    const users = await executeQuery(query) as any[];
    
    console.log(`📊 Encontrados ${users.length} usuarios en BD`);
    
    // Formatear para debug (ocultar passwords)
    const usersFormatted = users.map(user => ({
      id_personal: user.id_personal,
      nombre: user.nombre,
      correo: user.correo,
      categoria: user.categoria,
      institucion: user.institucion,
      cargo: user.cargo,
      activo: user.activo,
      tiene_password: !!user.password,
      password_valor: user.password === 'temporal123' ? 'temporal123' : (user.password ? 'hasheado' : 'sin_password'),
      fecha_creacion: user.fecha_creacion,
      fecha_actualizacion: user.fecha_actualizacion
    }));

    // Estadísticas
    const stats = {
      total_usuarios: users.length,
      activos: users.filter(u => u.activo === 1).length,
      inactivos: users.filter(u => u.activo === 0).length,
      por_categoria: {
        ADMIN: users.filter(u => u.categoria === 'ADMIN').length,
        TECNICO: users.filter(u => u.categoria === 'TECNICO').length,
        CLIENTE: users.filter(u => u.categoria === 'CLIENTE').length
      },
      con_password: users.filter(u => u.password).length,
      sin_password: users.filter(u => !u.password).length
    };

    return NextResponse.json({
      success: true,
      message: 'Debug de usuarios completado',
      timestamp: new Date().toISOString(),
      database_info: {
        connection: 'OK',
        table: 'personal'
      },
      statistics: stats,
      users: usersFormatted,
      debug_info: {
        note: 'Esta API es solo para desarrollo',
        credenciales_prueba: {
          admin: 'admin@oneservis.com',
          tecnico: 'htripayana@oneservis.com',
          password: 'temporal123'
        }
      }
    });

  } catch (error) {
    console.error('💥 Error en API debug:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}