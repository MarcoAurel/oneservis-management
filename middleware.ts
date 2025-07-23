import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicPaths = [
    '/login',
    '/api/auth/login',
    '/api/test',
    '/'
  ];
  
  // Rutas estáticas de Next.js
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/favicon') || 
      pathname === '/favicon.ico') {
    return NextResponse.next();
  }
  
  // Verificar si es una ruta pública
  const isPublicPath = publicPaths.includes(pathname);
  
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Verificar token en rutas protegidas
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // Redirigir a login si no hay token
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: 'No autorizado - Token requerido' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
    
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Para simplicidad en desarrollo, no verificamos el token aquí
  // La aplicación maneja la validación del token
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};