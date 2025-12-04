import { useEffect, useState } from 'react';
import { DocenteService } from '../api/docenteService';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../api/authService';

const DashboardComision = () => {
    const [docentes, setDocentes] = useState([]);
    const [periodo, setPeriodo] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        cargarData();
    }, []);

    const cargarData = async () => {
        try {
            const resp = await DocenteService.getDashboard();
            if(resp.success) {
                setDocentes(resp.data);
                setPeriodo(resp.periodo);
            }
        } catch (error) {
            alert("Error cargando lista: " + error.message);
        }
    };

    const handleEvaluar = (idDocente) => {
        // Navegar a la pantalla de evaluación enviando el ID
        navigate(`/evaluacion-comision/${idDocente}`);
    };

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#333' }}>Panel de Comisión</h1>
                    <p style={{ color: '#666' }}>Periodo Académico: <strong>{periodo}</strong></p>
                </div>
                <button 
                    onClick={AuthService.logout}
                    style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Cerrar Sesión
                </button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#007bff', color: 'white' }}>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Código</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Docente</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Departamento</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>Estado</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>Nota Final</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {docentes.map(d => (
                            <tr key={d.idDocente} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '15px', color: '#333' }}>{d.codigo}</td>
                                <td style={{ padding: '15px', color: '#333', fontWeight: '500' }}>{d.nombreCompleto}</td>
                                <td style={{ padding: '15px', color: '#666' }}>{d.departamento}</td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    <span style={{ 
                                        padding: '5px 10px', borderRadius: '15px', fontSize: '0.85em', fontWeight: 'bold',
                                        backgroundColor: d.estado === 'FINALIZADO' ? '#d4edda' : '#fff3cd',
                                        color: d.estado === 'FINALIZADO' ? '#155724' : '#856404'
                                    }}>
                                        {d.estado}
                                    </span>
                                </td>
                                <td style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
                                    {d.puntaje}
                                </td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    <button 
                                        onClick={() => handleEvaluar(d.idDocente)}
                                        style={{ 
                                            padding: '6px 12px', 
                                            backgroundColor: d.estado === 'FINALIZADO' ? '#6c757d' : '#28a745', 
                                            color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' 
                                        }}
                                    >
                                        {d.estado === 'FINALIZADO' ? 'Ver / Editar' : 'Evaluar'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {docentes.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No se encontraron docentes asignados.</div>
                )}
            </div>
        </div>
    );
};

export default DashboardComision;