//src/app/api/ordenes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, testConnection } from '@/lib/database';
import { z } from 'zod';

// Schema para actualizar órdenes
const UpdateOrdenSchema = z.object({
  fecha_ot: z.string().optional(),
  estado: z.enum(['pendiente', 'en_proceso', 'completada', 'cancelada']).optional(),
  resumen: z.string().min(10, 'El resumen debe tener al menos 10 caracteres').optional(),
  id_tecnico_asignado: z.number().int().positive().nullable().optional()
});

// GET - Obtener una orden específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'No hay conexión a la base de datos'
      }, { status: 500 });
    }

    const id_ot = parseInt(params.id);
    
    if (isNaN(id_ot)) {
      return NextResponse.json({
        success: false,
        error: 'ID de orden inválido'
      }, { status: 400 });
    }

    const query = `
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
      WHERE ot.id_ot = ?
    `;

    const result = await executeQuery(query, [id_ot]) as any[];

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Orden de trabajo no encontrada'
      }, { status: 404 });
    }

    const row = result[0];
    const orden = {
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
      } : null,
      equipo: {
        id_equipo: row.id_equipo,
        tipo_equipo: row.tipo_equipo,
        marca: row.marca,
        modelo: row.modelo,
        serie: row.serie,
        fecha_ingreso: row.fecha_ingreso,
        cliente: {
          nombre: row.cliente_nombre,
          rut: row.cliente_rut,
          correo: row.cliente_correo,
          telefono: row.cliente_telefono,
          direccion: row.cliente_direccion
        },
        ubicacion: {
          servicio_clinico: row.servicio_clinico,
          piso: row.piso,
          detalle: row.ubicacion_detalle
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: { orden },
      message: 'Orden encontrada'
    });

  } catch (error) {
    console.error('💥 Error obteniendo orden:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// PUT - Actualizar una orden
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'No hay conexión a la base de datos'
      }, { status: 500 });
    }

    const id_ot = parseInt(params.id);
    
    if (isNaN(id_ot)) {
      return NextResponse.json({
        success: false,
        error: 'ID de orden inválido'
      }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = UpdateOrdenSchema.parse(body);

    // Verificar que la orden existe
    const ordenExists = await executeQuery(
      'SELECT id_ot FROM orden_trabajo WHERE id_ot = ?',
      [id_ot]
    ) as any[];

    if (ordenExists.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Orden de trabajo no encontrada'
      }, { status: 404 });
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

    // Construir query de actualización dinámico
    const updateFields = [];
    const updateValues = [];

    if (validatedData.fecha_ot !== undefined) {
      updateFields.push('fecha_ot = ?');
      updateValues.push(validatedData.fecha_ot);
    }

    if (validatedData.estado !== undefined) {
      updateFields.push('estado = ?');
      updateValues.push(validatedData.estado);
    }

    if (validatedData.resumen !== undefined) {
      updateFields.push('resumen = ?');
      updateValues.push(validatedData.resumen);
    }

    if (validatedData.id_tecnico_asignado !== undefined) {
      updateFields.push('id_tecnico_asignado = ?');
      updateValues.push(validatedData.id_tecnico_asignado);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No se proporcionaron campos para actualizar'
      }, { status: 400 });
    }

    // Ejecutar actualización
    updateValues.push(id_ot);
    const updateQuery = `
      UPDATE orden_trabajo 
      SET ${updateFields.join(', ')}
      WHERE id_ot = ?
    `;

    await executeQuery(updateQuery, updateValues);

    // Obtener orden actualizada
    const ordenActualizada = await executeQuery(`
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
    `, [id_ot]) as any[];

    return NextResponse.json({
      success: true,
      data: { orden: ordenActualizada[0] },
      message: `Orden de trabajo #${id_ot} actualizada exitosamente`
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Datos de entrada inválidos',
        details: error.errors
      }, { status: 400 });
    }

    console.error('💥 Error actualizando orden:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// DELETE - Eliminar una orden (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'No hay conexión a la base de datos'
      }, { status: 500 });
    }

    const id_ot = parseInt(params.id);
    
    if (isNaN(id_ot)) {
      return NextResponse.json({
        success: false,
        error: 'ID de orden inválido'
      }, { status: 400 });
    }

    // Verificar que la orden existe
    const ordenExists = await executeQuery(
      'SELECT id_ot FROM orden_trabajo WHERE id_ot = ?',
      [id_ot]
    ) as any[];

    if (ordenExists.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Orden de trabajo no encontrada'
      }, { status: 404 });
    }

    // Eliminar registros relacionados primero (si existen)
    await executeQuery('DELETE FROM bd_correctivos WHERE id_ot = ?', [id_ot]);
    await executeQuery('DELETE FROM bd_preventivos WHERE id_ot = ?', [id_ot]);

    // Eliminar la orden
    await executeQuery('DELETE FROM orden_trabajo WHERE id_ot = ?', [id_ot]);

    return NextResponse.json({
      success: true,
      message: `Orden de trabajo #${id_ot} eliminada exitosamente`
    });

  } catch (error) {
    console.error('💥 Error eliminando orden:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}