// Script simple para debug de BD
// Ejecutar en consola del navegador o como script independiente

const debugDB = {
  // Verificar usuarios en BD
  async checkUsers() {
    try {
      const response = await fetch('/api/debug/users');
      const data = await response.json();
      
      console.group('📊 DEBUG ONESERVIS - USUARIOS EN BD');
      
      if (data.success) {
        console.log('✅ Conexión BD: OK');
        console.log('📈 Total usuarios:', data.statistics?.total_usuarios);
        console.log('👥 Usuarios activos:', data.statistics?.activos);
        console.log('🔑 Con password:', data.statistics?.con_password);
        
        console.group('📋 Lista de usuarios:');
        data.users?.forEach(user => {
          const status = user.activo ? '✅' : '❌';
          const pwd = user.password_valor === 'temporal123' ? '🔑 temporal123' : user.password_valor;
          console.log(`${status} ${user.correo} (${user.categoria}) - ${pwd}`);
        });
        console.groupEnd();
        
      } else {
        console.log('❌ Error:', data.error);
      }
      
      console.groupEnd();
      return data;
    } catch (error) {
      console.error('💥 Error verificando BD:', error);
    }
  },

  // Probar login
  async testLogin(email, password) {
    console.log(`🧪 Probando login: ${email}`);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, password }),
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Login exitoso:', result.user);
      } else {
        console.log('❌ Login fallido:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('💥 Error en login:', error);
    }
  },

  // Atajos rápidos
  testAdmin: () => debugDB.testLogin('admin@oneservis.com', 'temporal123'),
  testTecnico: () => debugDB.testLogin('htripayana@oneservis.com', 'temporal123'),

  // Mostrar ayuda
  help() {
    console.group('🔧 FUNCIONES DE DEBUG DISPONIBLES:');
    console.log('debugDB.checkUsers()     - Ver usuarios en BD');
    console.log('debugDB.testAdmin()      - Probar login admin');
    console.log('debugDB.testTecnico()    - Probar login técnico');
    console.log('debugDB.testLogin(email, pwd) - Probar login personalizado');
    console.log('debugDB.help()           - Mostrar esta ayuda');
    console.groupEnd();
  }
};

// Auto-ejecutar en desarrollo
if (typeof window !== 'undefined') {
  window.debugDB = debugDB;
  console.log('🔧 Debug functions loaded! Run debugDB.help() for commands');
}

// Exportar para uso en Node.js si es necesario
if (typeof module !== 'undefined' && module.exports) {
  module.exports = debugDB;
}