'use client';

// Hook simple de debug sin JSX
export function useDebug() {
  const checkUsers = async () => {
    try {
      const response = await fetch('/api/debug/users');
      const data = await response.json();
      
      console.group('📊 ONESERVIS DEBUG - USUARIOS');
      if (data.success) {
        console.log('✅ BD Conectada');
        console.log('👥 Total:', data.statistics?.total_usuarios);
        console.log('✅ Activos:', data.statistics?.activos);
        console.log('🔑 Con password:', data.statistics?.con_password);
        
        if (data.users?.length > 0) {
          console.log('\n📋 Usuarios disponibles:');
          data.users.forEach((user: any) => {
            console.log(`  ${user.correo} - ${user.categoria} - ${user.activo ? 'Activo' : 'Inactivo'}`);
          });
        }
      } else {
        console.log('❌ Error:', data.error);
      }
      console.groupEnd();
      
      return data;
    } catch (error) {
      console.error('💥 Error en debug:', error);
    }
  };

  const testLogin = async (correo: string, password: string) => {
    console.log(`🧪 Testing login: ${correo}`);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password }),
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Login OK:', result.user);
      } else {
        console.log('❌ Login FAIL:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('💥 Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const quickDebug = () => {
    console.log('🚀 OneServis Debug initialized');
    
    // Agregar funciones globales para debug
    if (typeof window !== 'undefined') {
      (window as any).debugOneServis = {
        checkUsers,
        testLogin,
        testAdmin: () => testLogin('admin@oneservis.com', 'temporal123'),
        testTecnico: () => testLogin('htripayana@oneservis.com', 'temporal123'),
        help: () => {
          console.group('🔧 DEBUG COMMANDS');
          console.log('debugOneServis.checkUsers()   - Ver usuarios BD');
          console.log('debugOneServis.testAdmin()    - Test login admin');
          console.log('debugOneServis.testTecnico()  - Test login técnico');
          console.log('debugOneServis.help()         - Esta ayuda');
          console.groupEnd();
        }
      };
      
      console.log('🔧 Run: debugOneServis.help()');
      
      // Auto-verificar usuarios
      checkUsers();
    }
  };

  return { checkUsers, testLogin, quickDebug };
}