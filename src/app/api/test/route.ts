//src/app/api/test/route.ts
import { NextResponse } from 'next/server';
import { testConnection, initializeDatabase } from '@/lib/database';
import { createInitialAdmin } from '@/lib/auth';
export async function GET() {
  try {
    console.log('🔍 Probando conexión a base de datos...');
    
    // Test de conexión
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'No se pudo conectar a la base de datos',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Verificar estructura de BD
    console.log('🔍 Verificando estructura de base de datos...');
    const dbStructureOk = await initializeDatabase();

    // Intentar crear admin inicial si no existe
    try {
      await createInitialAdmin();
    } catch (error) {
      console.warn('Advertencia creando admin inicial:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Conexión exitosa a base de datos',
      database_structure: dbStructureOk ? 'OK' : 'Verificar tablas y campos',
      admin_setup: 'Ejecutado',
      timestamp: new Date().toISOString(),
      environment: {
        node_env: process.env.NODE_ENV,
        db_host: process.env.DB_HOST || 'localhost',
        db_name: process.env.DB_NAME || 'gestion_ot',
        jwt_configured: !!process.env.JWT_SECRET
      },
      instructions: {
        next_steps: [
          '1. Ejecutar script SQL adicional para campos de autenticación',
          '2. Verificar que usuarios tengan password configurado',
          '3. Probar login en /login'
        ]
      }
    });

  } catch (error) {
    console.error('❌ Error en test de conexión:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}