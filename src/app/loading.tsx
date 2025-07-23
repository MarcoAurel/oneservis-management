export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
      <div className="text-center">
        {/* Logo Animado */}
        <div className="mx-auto h-20 w-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-pulse">
          <span className="text-3xl font-bold text-white">One</span>
        </div>
        
        {/* Spinner */}
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        
        {/* Texto */}
        <p className="text-gray-600 text-lg font-medium">Cargando OneServis...</p>
        <p className="text-gray-500 text-sm mt-2">Sistema de Gestión de Órdenes de Trabajo</p>
      </div>
    </div>
  );
}