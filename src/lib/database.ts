import mysql from 'mysql2/promise';
//src/lib/database.ts
// Configuración de conexión MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'oneservis_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

// Pool de conexiones para mejor rendimiento
const pool = mysql.createPool(dbConfig);

// Función helper para ejecutar queries
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Función para probar la conexión
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL exitosa');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error);
    return false;
  }
}

// Función para verificar y crear estructura de BD
export async function initializeDatabase() {
  try {
    // Verificar que existan las tablas principales
    const tables = ['cliente', 'ubicacion', 'equipo', 'personal', 'orden_trabajo'];
    
    for (const table of tables) {
      const result = await executeQuery(`SHOW TABLES LIKE '${table}'`) as any[];
      if (result.length === 0) {
        console.warn(`⚠️  Tabla '${table}' no encontrada. Asegúrate de ejecutar el script SQL.`);
      } else {
        console.log(`✅ Tabla '${table}' encontrada`);
      }
    }
    
    // Verificar que la tabla personal tenga campos necesarios para auth
    const personalColumns = await executeQuery(`DESCRIBE personal`) as any[];
    const hasPasswordField = personalColumns.some((col: any) => col.Field === 'password');
    const hasActivoField = personalColumns.some((col: any) => col.Field === 'activo');
    
    if (!hasPasswordField) {
      console.warn('⚠️  Campo "password" no encontrado en tabla personal. Se necesita para autenticación.');
    }
    
    if (!hasActivoField) {
      console.warn('⚠️  Campo "activo" no encontrado en tabla personal. Se recomienda agregarlo.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error verificando estructura de BD:', error);
    return false;
  }
}

export default pool;