// Tipos basados en el esquema SQL real de gestion_ot
//src/types/database.ts
export interface Cliente {
  id_cliente: number;
  nombre: string;
  rut?: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
}

export interface Ubicacion {
  id_ubicacion: number;
  servicio_clinico: string;
  piso?: string;
  detalle?: string;
}

export interface Equipo {
  id_equipo: number;
  id_cliente: number;
  id_ubicacion: number;
  tipo_equipo: string;
  marca: string;
  modelo: string;
  serie: string;
  fecha_ingreso: Date;
  
  // Relaciones opcionales
  cliente?: Cliente;
  ubicacion?: Ubicacion;
}

export interface InventarioEquipo {
  id_item: number;
  id_equipo: number;
  nombre_componente: string;
  cantidad: number;
  unidad: string;
  estado: string;
  
  // Relación opcional
  equipo?: Equipo;
}

export interface Personal {
  id_personal: number;
  nombre: string;
  cargo: string;
  correo: string;
  categoria: 'ADMIN' | 'TECNICO' | 'CLIENTE';
  institucion: string;
  
  // Campos adicionales para autenticación
  password?: string;
  activo?: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface OrdenTrabajo {
  id_ot: number;
  fecha_ot: Date;
  estado: string;
  resumen: string;
  id_quien_informa: number;
  id_tecnico_asignado?: number;
  id_equipo: number;
  
  // Relaciones opcionales
  quien_informa?: Personal;
  tecnico_asignado?: Personal;
  equipo?: Equipo;
}

export interface BdCorrectivos {
  id_correctivo: number;
  codigo: string;
  id_ot: number;
  id_equipo: number;
  id_personal: number;
  fecha: Date;
  detalle: string;
  estado: string;
  
  // Relaciones opcionales
  orden_trabajo?: OrdenTrabajo;
  equipo?: Equipo;
  personal?: Personal;
}

export interface BdPreventivos {
  id_preventivo: number;
  codigo: string;
  id_ot: number;
  id_equipo: number;
  id_personal: number;
  fecha_programada: Date;
  fecha_ejecucion?: Date;
  detalle: string;
  estado: string;
  
  // Relaciones opcionales
  orden_trabajo?: OrdenTrabajo;
  equipo?: Equipo;
  personal?: Personal;
}

// Tipos para autenticación (basado en Personal)
export interface AuthUser {
  id_personal: number;
  nombre: string;
  correo: string;
  categoria: 'ADMIN' | 'TECNICO' | 'CLIENTE';
  institucion: string;
  cargo: string;
}

// Tipos para creación/actualización (sin IDs auto-incrementales)
export type CrearCliente = Omit<Cliente, 'id_cliente'>;
export type ActualizarCliente = Partial<CrearCliente>;

export type CrearEquipo = Omit<Equipo, 'id_equipo'>;
export type ActualizarEquipo = Partial<CrearEquipo>;

export type CrearOrdenTrabajo = Omit<OrdenTrabajo, 'id_ot'>;
export type ActualizarOrdenTrabajo = Partial<CrearOrdenTrabajo>;

export type CrearCorrectivo = Omit<BdCorrectivos, 'id_correctivo'>;
export type ActualizarCorrectivo = Partial<CrearCorrectivo>;

export type CrearPreventivo = Omit<BdPreventivos, 'id_preventivo'>;
export type ActualizarPreventivo = Partial<CrearPreventivo>;

export type CrearPersonal = Omit<Personal, 'id_personal'>;
export type ActualizarPersonal = Partial<CrearPersonal>;

// Tipos para consultas con joins
export interface EquipoCompleto extends Equipo {
  cliente: Cliente;
  ubicacion: Ubicacion;
  inventario?: InventarioEquipo[];
}

export interface OrdenTrabajoCompleta extends OrdenTrabajo {
  quien_informa: Personal;
  tecnico_asignado?: Personal;
  equipo: EquipoCompleto;
  correctivos?: BdCorrectivos[];
  preventivos?: BdPreventivos[];
}

// Tipos para dashboards y estadísticas
export interface EstadisticasDashboard {
  total_equipos: number;
  total_clientes: number;
  ordenes_pendientes: number;
  ordenes_completadas_mes: number;
  correctivos_pendientes: number;
  preventivos_vencidos: number;
  personal_activo: number;
}

export interface FiltrosEquipo {
  id_cliente?: number;
  id_ubicacion?: number;
  tipo_equipo?: string;
  marca?: string;
  modelo?: string;
}

export interface FiltrosOrdenTrabajo {
  estado?: string;
  id_tecnico_asignado?: number;
  id_equipo?: number;
  fecha_desde?: Date;
  fecha_hasta?: Date;
}

export interface FiltrosPersonal {
  categoria?: 'ADMIN' | 'TECNICO' | 'CLIENTE';
  institucion?: string;
  cargo?: string;
}

// Tipos para reportes
export interface ReporteEquipoPorCliente {
  cliente: string;
  total_equipos: number;
  equipos_activos: number;
}

export interface ReporteMantenimiento {
  equipo_id: number;
  tipo_equipo: string;
  marca: string;
  modelo: string;
  ultimo_preventivo?: Date;
  proximo_preventivo?: Date;
  total_correctivos: number;
}