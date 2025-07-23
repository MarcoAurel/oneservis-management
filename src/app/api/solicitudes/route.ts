//src/app/api/solicitudes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, testConnection } from '@/lib/database';
import { z } from 'zod';

// Schema de validación para nueva solicitud
const SolicitudSchema = z.object({
  id_equipo: z.number().int().positive('Debe seleccionar un equipo'),
  tipo_solicitud: z.enum(['correctivo', 'preventivo'], {
    required_error: 'Debe especificar el tipo de solicitud'
  }),
  descripcion_problema: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  prioridad: z.enum(['baja', 'media', 'alta'], {
    required_error: 'Debe especificar la prioridad'
  }),
  contacto_nombre: z.string().min(2, 'Nombre del contacto requerido'),
  contacto_correo: z.string().email('Correo electrónico inválido'),
  contacto_telefono: z.string().optional(),
  observaciones: z.string().optional(),
  id_quien_solicita: z.number().int().positive('ID de solicitante requerido')
});

export async function GET(request: NextRequest) {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'No hay conexión a la base de datos'
      }, { status: 500 });
    }

    // Obtener equipos disponibles agrupados por ubicación
    const equiposQuery = `
      SELECT 
        e.id_equipo,
        e.tipo_equipo,
        e.marca,
        e.modelo,
        e.serie,
        c.nombre as cliente_nombre,
        u.id_ubicacion,
        u.servicio_clinico,
        u.piso,
        u.detalle as ubicacion_detalle
      FROM equipo e
      INNER JOIN cliente c ON e.id_cliente = c.id_cliente
      INNER JOIN ubicacion u ON e.id_ubicacion = u.id_ubicacion
      ORDER BY u.servicio_clinico ASC, e.tipo_equipo ASC
    `;

    const equipos = await executeQuery(equiposQuery) as any[];

    // Agrupar equipos por ubicación
    const equiposPorUbicacion = equipos.reduce((acc: any, equipo: any) => {
      const ubicacionKey = `${equipo.servicio_clinico}${equipo.piso ? ` - Piso ${equipo.piso}` : ''}`;
      
      if (!acc[ubicacionKey]) {
        acc[ubicacionKey] = {
          id_ubicacion: equipo.id_ubicacion,
          servicio_clinico: equipo.servicio_clinico,
          piso: equipo.piso,
          detalle: equipo.ubicacion_detalle,
          equipos: []
        };
      }
      
      acc[ubicacionKey].equipos.push({
        id_equipo: equipo.id_equipo,
        tipo_equipo: equipo.tipo_equipo,
        marca: equipo.marca,
        modelo: equipo.modelo,
        serie: equipo.serie,
        cliente_nombre: equipo.cliente_nombre
      });
      
      return acc;
    }, {});

    // Obtener ubicaciones únicas
    const ubicacionesQuery = `
      SELECT DISTINCT 
        id_ubicacion,
        servicio_clinico,
        piso,
        detalle
      FROM ubicacion
      ORDER BY servicio_clinico ASC
    `;

    const ubicaciones = await executeQuery(ubicacionesQuery) as any[];

    return NextResponse.json({
      success: true,
      data: {
        equipos_por_ubicacion: equiposPorUbicacion,
        ubicaciones,
        tipos_solicitud: ['correctivo', 'preventivo'],
        niveles_prioridad: ['baja', 'media', 'alta']
      },
      message: 'Datos para formulario obtenidos exitosamente'
    });

  } catch (error) {
    console.error('💥 Error en API solicitudes:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'No hay conexión a la base de datos'
      }, { status: 500 });
    }

    // Verificar que hay contenido en el body
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({
        success: false,
        error: 'Content-Type debe ser application/json',
        example: {
          id_equipo: 1,
          tipo_solicitud: "correctivo",
          descripcion_problema: "Ejemplo de descripción del problema que debe tener al menos 20 caracteres",
          prioridad: "alta",
          contacto_nombre: "Juan Pérez",
          contacto_correo: "juan@ejemplo.com",
          contacto_telefono: "+56912345678",
          observaciones: "Observaciones opcionales",
          id_quien_solicita: 4
        }
      }, { status: 400 });
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json({
        success: false,
        error: 'Body JSON inválido o vacío',
        details: 'Asegúrese de enviar un JSON válido en el body de la petición',
        example: {
          id_equipo: 1,
          tipo_solicitud: "correctivo",
          descripcion_problema: "Ejemplo de descripción del problema que debe tener al menos 20 caracteres",
          prioridad: "alta",
          contacto_nombre: "Juan Pérez",
          contacto_correo: "juan@ejemplo.com",
          contacto_telefono: "+56912345678",
          observaciones: "Observaciones opcionales",
          id_quien_solicita: 4
        }
      }, { status: 400 });
    }
    
    // Validar datos
    const validatedData = SolicitudSchema.parse(body);

    // Verificar que el equipo existe
    const equipoQuery = `
      SELECT 
        e.id_equipo, e.tipo_equipo, e.serie,
        c.nombre as cliente_nombre,
        u.servicio_clinico
      FROM equipo e
      INNER JOIN cliente c ON e.id_cliente = c.id_cliente
      INNER JOIN ubicacion u ON e.id_ubicacion = u.id_ubicacion
      WHERE e.id_equipo = ?
    `;
    
    const equipoExists = await executeQuery(equipoQuery, [validatedData.id_equipo]) as any[];

    if (equipoExists.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'El equipo especificado no existe'
      }, { status: 400 });
    }

    const equipo = equipoExists[0];

    // Verificar que quien solicita existe
    const solicitanteExists = await executeQuery(
      'SELECT id_personal, nombre FROM personal WHERE id_personal = ?',
      [validatedData.id_quien_solicita]
    ) as any[];

    if (solicitanteExists.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'El solicitante no existe'
      }, { status: 400 });
    }

    // Generar resumen automático de la OT
    const resumenOT = `${validatedData.tipo_solicitud.toUpperCase()}: ${validatedData.descripcion_problema.substring(0, 100)}${validatedData.descripcion_problema.length > 100 ? '...' : ''} - ${equipo.tipo_equipo} ${equipo.serie} (${equipo.servicio_clinico})`;

    // Crear la orden de trabajo automáticamente
    const insertOrdenQuery = `
      INSERT INTO orden_trabajo (
        fecha_ot, 
        estado, 
        resumen, 
        id_quien_informa, 
        id_tecnico_asignado, 
        id_equipo
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const fechaActual = new Date().toISOString().split('T')[0];
    const resultado = await executeQuery(insertOrdenQuery, [
      fechaActual,
      'pendiente',
      resumenOT,
      validatedData.id_quien_solicita,
      null, // Sin técnico asignado inicialmente
      validatedData.id_equipo
    ]) as any;

    const nuevaOrdenId = resultado.insertId;

    // Crear registro de solicitud (si tienes tabla específica para solicitudes)
    // En este caso, guardamos los detalles adicionales como un correctivo/preventivo según el tipo

    if (validatedData.tipo_solicitud === 'correctivo') {
      const codigoCorrectivo = `COR-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      await executeQuery(`
        INSERT INTO bd_correctivos (
          codigo, id_ot, id_equipo, id_personal, fecha, detalle, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        codigoCorrectivo,
        nuevaOrdenId,
        validatedData.id_equipo,
        validatedData.id_quien_solicita,
        fechaActual,
        `SOLICITUD CORRECTIVA - Prioridad: ${validatedData.prioridad}\n\nDescripción: ${validatedData.descripcion_problema}\n\nContacto: ${validatedData.contacto_nombre} (${validatedData.contacto_correo})\n\nObservaciones: ${validatedData.observaciones || 'Ninguna'}`,
        'pendiente'
      ]);
    } else {
      const codigoPreventivo = `PRE-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      await executeQuery(`
        INSERT INTO bd_preventivos (
          codigo, id_ot, id_equipo, id_personal, fecha_programada, detalle, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        codigoPreventivo,
        nuevaOrdenId,
        validatedData.id_equipo,
        validatedData.id_quien_solicita,
        fechaActual,
        `SOLICITUD PREVENTIVA - Prioridad: ${validatedData.prioridad}\n\nDescripción: ${validatedData.descripcion_problema}\n\nContacto: ${validatedData.contacto_nombre} (${validatedData.contacto_correo})\n\nObservaciones: ${validatedData.observaciones || 'Ninguna'}`,
        'programada'
      ]);
    }

    // Obtener la orden creada con información completa
    const ordenCreada = await executeQuery(`
      SELECT 
        ot.id_ot, ot.fecha_ot, ot.estado, ot.resumen,
        p.nombre as solicitante_nombre,
        e.tipo_equipo, e.serie,
        c.nombre as cliente_nombre,
        u.servicio_clinico
      FROM orden_trabajo ot
      INNER JOIN personal p ON ot.id_quien_informa = p.id_personal
      INNER JOIN equipo e ON ot.id_equipo = e.id_equipo
      INNER JOIN cliente c ON e.id_cliente = c.id_cliente
      INNER JOIN ubicacion u ON e.id_ubicacion = u.id_ubicacion
      WHERE ot.id_ot = ?
    `, [nuevaOrdenId]) as any[];

    return NextResponse.json({
      success: true,
      data: {
        orden_trabajo: ordenCreada[0],
        numero_solicitud: `SOL-${nuevaOrdenId.toString().padStart(6, '0')}`,
        numero_ot: `OT-${nuevaOrdenId.toString().padStart(6, '0')}`,
        tipo_solicitud: validatedData.tipo_solicitud,
        prioridad: validatedData.prioridad
      },
      message: `Solicitud enviada exitosamente. Se ha generado la OT #${nuevaOrdenId}`
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Datos de entrada inválidos',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    console.error('💥 Error creando solicitud:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}