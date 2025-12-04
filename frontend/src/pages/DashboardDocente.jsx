import { useEffect, useState } from 'react';
import { AuthService } from '../api/authService';
import { EvaluacionService } from '../api/evaluacionService';
import { useNavigate } from 'react-router-dom';

const DashboardDocente = () => {
    const [docente, setDocente] = useState(null);
    const [evaluacion, setEvaluacion] = useState(null);
    const navigate = useNavigate();
    const user = AuthService.getCurrentUser();

    useEffect(() => {
        if (user) {
            setDocente(user);
            cargarEstadoEvaluacion(user.idDocente);
        }
    }, []);

    const cargarEstadoEvaluacion = async (idDocente) => {
        try {
            // Asumimos periodo 1 por ahora
            const res = await EvaluacionService.obtenerEvaluacion(idDocente, 1);
            if (res.success && res.data) {
                setEvaluacion(res.data);
            }
        } catch (error) {
            console.error("No hay evaluación iniciada aún");
        }
    };

    const handleAutoevaluar = () => {
        navigate(`/autoevaluacion/${user.idDocente}`);
    };

    if (!docente) return <div>Cargando...</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Bienvenido, Prof. {docente.nombres}</h1>
                <button onClick={AuthService.logout} style={{backgroundColor: '#dc3545', color: 'white'}}>Salir</button>
            </div>

            <div style={{ 
                backgroundColor: 'white', padding: '30px', borderRadius: '10px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: '20px' 
            }}>
                <h2>Estado de tu Auditoría (2025-A)</h2>
                
                <div style={{ fontSize: '1.2em', margin: '20px 0' }}>
                    Estado: <span style={{ fontWeight: 'bold' }}>{evaluacion ? evaluacion.estado : 'PENDIENTE'}</span>
                    <br/>
                    Nota Parcial: <strong style={{ color: '#007bff' }}>{evaluacion ? evaluacion.puntajeFinal : '0.00'}</strong>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <p>
                        Como parte del proceso, debes completar tu <strong>Autoevaluación</strong> (Ítem 15).
                        Esto sumará hasta 10 puntos a tu nota final.
                    </p>
                    
                    <button 
                        onClick={handleAutoevaluar}
                        disabled={evaluacion && evaluacion.estado === 'FINALIZADO'}
                        style={{ 
                            width: '100%', padding: '15px', fontSize: '1.1em',
                            backgroundColor: (evaluacion && evaluacion.estado === 'FINALIZADO') ? '#ccc' : '#28a745',
                            color: 'white', border: 'none', borderRadius: '5px'
                        }}
                    >
                        {evaluacion && evaluacion.estado === 'FINALIZADO' ? 'Proceso Cerrado' : '📝 Realizar Autoevaluación'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardDocente;