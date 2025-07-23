//src/app/api/equipos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, testConnection } from '@/lib/database';
import { EquipoCompleto } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    // Verificar conexión
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'No hay conexión a la base de datos'
      }, { status: 500 });
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const id_cliente = searchParams.get('id_cliente');
    const id_ubicacion = searchParams.get('id_ubicacion');
    const tipo_equipo = searchParams.get('tipo_equipo');
    const marca = searchParams.get('marca');

    // Construir consulta con filtros
    let whereConditions = [];
    let queryParams: any[] = [];

    if (search) {
      whereConditions.push(`(
        e.tipo_equipo LIKE ? OR 
        e.marca LIKE ? OR 
        e.modelo LIKE ? OR 
        e.serie LIKE ? OR
        c.nombre LIKE ? OR
        u.servicio_clinico LIKE ?
      )`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (id_cliente) {
      whereConditions.push('e.id_cliente = ?');
      queryParams.push(id_cliente);
    }

    if (id_ubicacion) {
      whereConditions.push('e.id_ubicacion = ?');
      queryParams.push(id_ubicacion);
    }

    if (tipo_equipo) {
      whereConditions.push('e.tipo_equipo = ?');
      queryParams.push(tipo_equipo);
    }

    if (marca) {
      whereConditions.push('e.marca = ?');
      queryParams.push(marca);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Consulta principal con JOINs
    const mainQuery = `
      SELECT 
        e.id_equipo,
        e.id_cliente,
        e.id_ubicacion,
        e.tipo_equipo,
        e.marca,
        e.modelo,
        e.serie,
        e.fecha_ingreso,
        c.nombre as cliente_nombre,
        c.rut as cliente_rut,
        c.correo as cliente_correo,
        c.telefono as cliente_telefono,
        c.direccion as cliente_direccion,
        u.servicio_clinico,
        u.piso,
        u.detalle as ubicacion_detalle
      FROM equipo e
      INNER JOIN cliente c ON e.id_cliente = c.id_cliente
      INNER JOIN ubicacion u ON e.id_ubicacion = u.id_ubicacion
      ${whereClause}
      ORDER BY e.fecha_ingreso DESC, e.id_equipo DESC
      LIMIT ? OFFSET ?
    `;

    // Consulta para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM equipo e
      INNER JOIN cliente c ON e.id_cliente = c.id_cliente
      INNER JOIN ubicacion u ON e.id_ubicacion = u.id_ubicacion
      ${whereClause}
    `;

    const offset = (page - 1) * limit;
    const equiposRaw = await executeQuery(mainQuery, [...queryParams, limit, offset]) as any[];
    const countResult = await executeQuery(countQuery, queryParams) as any[];

    // Formatear datos
    const equipos: EquipoCompleto[] = equiposRaw.map(row => ({
      id_equipo: row.id_equipo,
      id_cliente: row.id_cliente,
      id_ubicacion: row.id_ubicacion,
      tipo_equipo: row.tipo_equipo,
      marca: row.marca,
      modelo: row.modelo,
      serie: row.serie,
      fecha_ingreso: row.fecha_ingreso,
      cliente: {
        id_cliente: row.id_cliente,
        nombre: row.cliente_nombre,
        rut: row.cliente_rut,
        correo: row.cliente_correo,
        telefono: row.cliente_telefono,
        direccion: row.cliente_direccion
      },
      ubicacion: {
        id_ubicacion: row.id_ubicacion,
        servicio_clinico: row.servicio_clinico,
        piso: row.piso,
        detalle: row.ubicacion_detalle
      }
    }));

    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Obtener datos para filtros
    const clientesQuery = 'SELECT id_cliente, nombre FROM cliente ORDER BY nombre';
    const ubicacionesQuery = 'SELECT id_ubicacion, servicio_clinico, piso FROM ubicacion ORDER BY servicio_clinico';
    const tiposQuery = 'SELECT DISTINCT tipo_equipo FROM equipo WHERE tipo_equipo IS NOT NULL ORDER BY tipo_equipo';
    const marcasQuery = 'SELECT DISTINCT marca FROM equipo WHERE marca IS NOT NULL ORDER BY marca';

    const [clientes, ubicaciones, tipos, marcas] = await Promise.all([
      executeQuery(clientesQuery),
      executeQuery(ubicacionesQuery),
      executeQuery(tiposQuery),
      executeQuery(marcasQuery)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        equipos,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {
          clientes,
          ubicaciones,
          tipos: tipos.map((t: any) => t.tipo_equipo),
          marcas: marcas.map((m: any) => m.marca)
        }
      },
      message: `${equipos.length} equipos encontrados`
    });

  } catch (error) {
    console.error('💥 Error en API equipos:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// POST para crear nuevo equipo (próxima iteración)
export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Funcionalidad de creación no implementada aún'
  }, { status: 501 });
}