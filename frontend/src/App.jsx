import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import EvaluacionComision from './pages/EvaluacionComision';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta por defecto: Redirigir al Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Pantalla de Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Pantalla de Comisión */}
        <Route path="/evaluacion-comision" element={<EvaluacionComision />} />
        
        {/* Ruta comodín para 404 */}
        <Route path="*" element={<div>Página no encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;