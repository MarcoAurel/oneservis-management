//src/app/api/ordenes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, testConnection } from '@/lib/database';
import { OrdenTrabajoCompleta } from '@/types/database';
import { z } from 'zod';

// Schema de validación para crear/actualizar órdenes
const OrdenSchema = z.object({
  fecha_ot: z.string(),
  estado: z.enum(['pendiente', 'en_proceso', 'completada', 'cancelada']),
  resumen: z.string().min(10, 'El resumen debe tener al menos 10 caracteres'),
  id_quien_informa: z.number().int().positive(),
  id_tecnico_asignado: z.number().int().positive().optional(),
  id_equipo: z.number().int().positive()
});

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
    const estado = searchParams.get('estado');
    const id_tecnico = searchParams.get('id_tecnico');
    const id_equipo = searchParams.get('id_equipo');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');

    // Construir consulta con filtros
    let whereConditions = [];
    let queryParams: any[] = [];

    if (search) {
      whereConditions.push(`(
        ot.resumen LIKE ? OR 
        ot.id_ot LIKE ? OR
        e.tipo_equipo LIKE ? OR
        e.serie LIKE ? OR
        qi.nombre LIKE ? OR
        ta.nombre LIKE ?
      )`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (estado) {
      whereConditions.push('ot.estado = ?');
      queryParams.push(estado);
    }

    if (id_tecnico) {
      whereConditions.push('ot.id_tecnico_asignado = ?');
      queryParams.push(id_tecnico);
    }

    if (id_equipo) {
      whereConditions.push('ot.id_equipo = ?');
      queryParams.push(id_equipo);
    }

    if (fecha_desde) {
      whereConditions.push('ot.fecha_ot >= ?');
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      whereConditions.push('ot.fecha_ot <= ?');
      queryParams.push(fecha_hasta);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Consulta principal con JOINs complejos
    const mainQuery = `
      SELECT 
        ot.id_ot,
        ot.fecha_ot,
        ot.estado,
        ot.resumen,
        ot.id_quien_informa,
        ot.id_tecnico_asignado,
        ot.id_equipo,
        
        -- Quien informa
        qi.nombre as quien_informa_nombre,
        qi.correo as quien_informa_correo,
        qi.categoria as quien_informa_categoria,
        qi.institucion as quien_informa_institucion,
        qi.cargo as quien_informa_cargo,
        
        -- Técnico asignado
        ta.nombre as tecnico_nombre,
        ta.correo as tecnico_correo,
        ta.categoria as tecnico_categoria,
        ta.institucion as tecnico_institucion,
        ta.cargo as tecnico_cargo,
        
        -- Equipo
        e.tipo_equipo,
        e.marca,
        e.modelo,
        e.serie,
        e.fecha_ingreso,
        
        -- Cliente del equipo
        c.nombre as cliente_nombre,
        c.rut as cliente_rut,
        c.correo as cliente_correo,
        c.telefono as cliente_telefono,
        c.direccion as cliente_direccion,
        
        -- Ubicación del equipo
        u.servicio_clinico,
        u.piso,
        u.detalle as ubicacion_detalle
        
      FROM orden_trabajo ot
      INNER JOIN personal qi ON ot.id_quien_informa = qi.id_personal
      LEFT JOIN personal ta ON ot.id_tecnico_asignado = ta.id_personal
      INNER JOIN equipo e ON ot.id_equipo = e.id_equipo
      INNER JOIN cliente c ON e.id_cliente = c.id_cliente
      INNER JOIN ubicacion u ON e.id_ubicacion = u.id_ubicacion
      ${whereClause}
      ORDER BY ot.fecha_ot DESC, ot.id_ot DESC
      LIMIT ? OFFSET ?
    `;

    // Consulta para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM orden_trabajo ot
      INNER JOIN personal qi ON ot.id_quien_informa = qi.id_personal
      LEFT JOIN personal ta ON ot.id_tecnico_asignado = ta.id_personal
      INNER JOIN equipo e ON ot.id_equipo = e.id_equipo
      INNER JOIN cliente c ON e.id_cliente = c.id_cliente
      INNER JOIN ubicacion u ON e.id_ubicacion = u.id_ubicacion
      ${whereClause}
    `;

    const offset = (page - 1) * limit;
    const ordenesRaw = await executeQuery(mainQuery, [...queryParams, limit, offset]) as any[];
    const countResult = await executeQuery(countQuery, queryParams) as any[];

    // Formatear datos
    const ordenes: OrdenTrabajoCompleta[] = ordenesRaw.map(row => ({
      id_ot: row.id_ot,
      fecha_ot: row.fecha_ot,
      estado: row.estado,
      resumen: row.resumen,
      id_quien_informa: row.id_quien_informa,
      id_tecnico_asignado: row.id_tecnico_asignado,
      id_equipo: row.id_equipo,
      quien_informa: {
        id_personal: row.id_quien_informa,
        nombre: row.quien_informa_nombre,
        correo: row.quien_informa_correo,
        categoria: row.quien_informa_categoria,
        institucion: row.quien_informa_institucion,
        cargo: row.quien_informa_cargo
      },
      tecnico_asignado: row.id_tecnico_asignado ? {
        id_personal: row.id_tecnico_asignado,
        nombre: row.tecnico_nombre,
        correo: row.tecnico_correo,
        categoria: row.tecnico_categoria,
        institucion: row.tecnico_institucion,
        cargo: row.tecnico_cargo
      } : undefined,
      equipo: {
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
      }
    }));

    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Obtener datos para filtros
    const equiposQuery = `
      SELECT e.id_equipo, e.tipo_equipo, e.serie, c.nombre as cliente_nombre
      FROM equipo e 
      INNER JOIN cliente c ON e.id_cliente = c.id_cliente 
      ORDER BY c.nombre, e.tipo_equipo
    `;
    
    const tecnicosQuery = `
      SELECT id_personal, nombre, cargo, institucion 
      FROM personal 
      WHERE categoria = 'TECNICO' 
      ORDER BY nombre
    `;

    const [equipos, tecnicos] = await Promise.all([
      executeQuery(equiposQuery),
      executeQuery(tecnicosQuery)
    ]);

    const estados = ['pendiente', 'en_proceso', 'completada', 'cancelada'];

    return NextResponse.json({
      success: true,
      data: {
        ordenes,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {
          equipos,
          tecnicos,
          estados
        }
      },
      message: `${ordenes.length} órdenes encontradas`
    });

  } catch (error) {
    console.error('💥 Error en API órdenes:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar conexión
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'No hay conexión a la base de datos'
      }, { status: 500 });
    }

    const body = await request.json();
    
    // Validar datos
    const validatedData = OrdenSchema.parse(body);

    // Verificar que el equipo existe
    const equipoExists = await executeQuery(
      'SELECT id_equipo FROM equipo WHERE id_equipo = ?',
      [validatedData.id_equipo]
    ) as any[];

    if (equipoExists.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'El equipo especificado no existe'
      }, { status: 400 });
    }

    // Verificar que quien informa existe
    const informanteExists = await executeQuery(
      'SELECT id_personal FROM personal WHERE id_personal = ?',
      [validatedData.id_quien_informa]
    ) as any[];

    if (informanteExists.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'La persona que informa no existe'
      }, { status: 400 });
    }

    // Verificar técnico asignado si se especifica
    if (validatedData.id_tecnico_asignado) {
      const tecnicoExists = await executeQuery(
        'SELECT id_personal FROM personal WHERE id_personal = ? AND categoria = "TECNICO"',
        [validatedData.id_tecnico_asignado]
      ) as any[];

      if (tecnicoExists.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'El técnico asignado no existe o no tiene la categoría correcta'
        }, { status: 400 });
      }
    }

    // Crear la orden de trabajo
    const insertQuery = `
      INSERT INTO orden_trabajo (
        fecha_ot, estado, resumen, id_quien_informa, id_tecnico_asignado, id_equipo
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(insertQuery, [
      validatedData.fecha_ot,
      validatedData.estado,
      validatedData.resumen,
      validatedData.id_quien_informa,
      validatedData.id_tecnico_asignado || null,
      validatedData.id_equipo
    ]) as any;

    const nuevaOrdenId = result.insertId;

    // Obtener la orden creada con todas las relaciones
    const ordenCreada = await executeQuery(`
      SELECT 
        ot.id_ot, ot.fecha_ot, ot.estado, ot.resumen,
        qi.nombre as quien_informa_nombre,
        ta.nombre as tecnico_nombre,
        e.tipo_equipo, e.serie
      FROM orden_trabajo ot
      INNER JOIN personal qi ON ot.id_quien_informa = qi.id_personal
      LEFT JOIN personal ta ON ot.id_tecnico_asignado = ta.id_personal
      INNER JOIN equipo e ON ot.id_equipo = e.id_equipo
      WHERE ot.id_ot = ?
    `, [nuevaOrdenId]) as any[];

    return NextResponse.json({
      success: true,
      data: {
        orden: ordenCreada[0],
        id_ot: nuevaOrdenId
      },
      message: `Orden de trabajo #${nuevaOrdenId} creada exitosamente`
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Datos de entrada inválidos',
        details: error.errors
      }, { status: 400 });
    }

    console.error('💥 Error creando orden:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}