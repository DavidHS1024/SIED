import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardComision from './pages/DashboardComision';
import EvaluacionComision from './pages/EvaluacionComision';
import DashboardDocente from './pages/DashboardDocente';
import Autoevaluacion from './pages/Autoevaluacion';
import DashboardDirector from './pages/DashboardDirector';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard-comision" element={<DashboardComision />} />
        
        <Route path="/evaluacion-comision/:idDocente" element={<EvaluacionComision />} />

        <Route path="/dashboard-docente" element={<DashboardDocente />} />
        <Route path="/autoevaluacion/:idDocente" element={<Autoevaluacion />} />

        <Route path="/dashboard-director" element={<DashboardDirector />} />
        
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;