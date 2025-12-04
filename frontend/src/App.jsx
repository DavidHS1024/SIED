import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardComision from './pages/DashboardComision';
import EvaluacionComision from './pages/EvaluacionComision';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Nueva Pantalla Principal */}
        <Route path="/dashboard-comision" element={<DashboardComision />} />
        
        {/* Ruta Dinámica: :idDocente captura el ID que viene del click */}
        <Route path="/evaluacion-comision/:idDocente" element={<EvaluacionComision />} />
        
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;