import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken } from '@/lib/auth';
import { testConnection } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/auth/login - Iniciando proceso de login');
    
    // Verificar conexión a BD
    const isConnected = await testConnection();
    if (!isConnected) {
      console.log('❌ Error de conexión a BD');
      return NextResponse.json(
        { error: 'Error de conexión a la base de datos' },
        { status: 500 }
      );
    }

    console.log('✅ Conexión a BD verificada');

    const body = await request.json();
    const { correo, password } = body;

    console.log('📨 Datos recibidos:', { correo, password: password ? '***' : 'vacío' });

    // Validar datos requeridos
    if (!correo || !password) {
      console.log('❌ Datos faltantes');
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Autenticar usuario
    console.log('🔐 Iniciando autenticación...');
    const user = await authenticateUser(correo, password);
    
    if (!user) {
      console.log('❌ Autenticación fallida');
      return NextResponse.json(
        { 
          error: 'Credenciales inválidas',
          debug: {
            email: correo,
            timestamp: new Date().toISOString()
          }
        },
        { status: 401 }
      );
    }

    console.log('✅ Usuario autenticado:', {
      id: user.id_personal,
      nombre: user.nombre,
      categoria: user.categoria
    });

    // Generar token JWT
    const token = generateToken(user);
    console.log('🎫 Token JWT generado');

    // Crear respuesta con cookie segura
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id_personal,
        nombre: user.nombre,
        correo: user.correo,
        categoria: user.categoria,
        institucion: user.institucion,
        cargo: user.cargo
      },
      token
    });

    // Configurar cookie del token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/'
    });

    console.log('✅ Login exitoso, cookie configurada');
    return response;

  } catch (error) {
    console.error('💥 Error en POST /api/auth/login:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// API para logout
export async function DELETE(request: NextRequest) {
  try {
    console.log('🚪 DELETE /api/auth/login - Logout');
    const response = NextResponse.json({ success: true });
    
    // Eliminar cookie del token
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    console.log('✅ Logout exitoso, cookie eliminada');
    return response;

  } catch (error) {
    console.error('💥 Error en logout:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// API para verificar sesión actual
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/auth/login - Verificando sesión');
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      console.log('❌ No hay token en cookie');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { verifyToken, getPersonalById } = await import('@/lib/auth');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      console.log('❌ Token inválido');
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Obtener datos actualizados del usuario
    const user = await getPersonalById(decoded.user.id_personal);
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ Sesión válida:', user.correo);
    return NextResponse.json({
      success: true,
      user: {
        id: user.id_personal,
        nombre: user.nombre,
        correo: user.correo,
        categoria: user.categoria,
        institucion: user.institucion,
        cargo: user.cargo
      }
    });

  } catch (error) {
    console.error('💥 Error verificando sesión:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}