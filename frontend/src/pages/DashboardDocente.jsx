import { useEffect, useState } from 'react';
import { AuthService } from '../api/authService';
import { EvaluacionService } from '../api/evaluacionService';
import { useNavigate } from 'react-router-dom';

/**
 * DASHBOARD DEL DOCENTE (VISTA PERSONAL)
 * Estilo: Royal Navy & Gold
 */
const DashboardDocente = () => {
    const [docente, setDocente] = useState(null);
    const [evaluacion, setEvaluacion] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    const user = AuthService.getCurrentUser();

    useEffect(() => {
        if (user) {
            setDocente(user);
            cargarEstadoEvaluacion(user.idDocente);
        } else {
            navigate('/login');
        }
    }, []);

    const cargarEstadoEvaluacion = async (idDocente) => {
        try {
            // Asumimos periodo 1 por ahora (MVP)
            const res = await EvaluacionService.obtenerEvaluacion(idDocente, 1);
            if (res.success && res.data) {
                setEvaluacion(res.data);
            }
        } catch (error) {
            console.log("Aún no hay evaluación iniciada.");
        } finally {
            setLoading(false);
        }
    };

    const handleAutoevaluar = () => {
        navigate(`/autoevaluacion/${user.idDocente}`);
    };

    // Helper para color de estado
    const getStatusColor = (status) => {
        if (status === 'FINALIZADO') return 'var(--success)';
        if (status === 'EN_PROCESO') return 'var(--warning)';
        return 'var(--text-muted)';
    };

    if (!docente || loading) return <div style={{padding:'40px', textAlign:'center', color:'var(--gold-primary)'}}>Cargando perfil...</div>;

    const estadoActual = evaluacion ? evaluacion.estado : 'PENDIENTE';
    const notaActual = evaluacion ? evaluacion.puntajeFinal : '0.00';
    const esFinalizado = estadoActual === 'FINALIZADO';

    return (
        <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
            
            {/* HEADER SUPERIOR */}
            <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                marginBottom: '40px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px' 
            }}>
                <div>
                    <h2 style={{ margin: 0, textAlign: 'left', fontSize: '1.8rem' }}>Panel del Docente</h2>
                    <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>
                        Bienvenido, <span style={{color: 'var(--gold-primary)', fontWeight:'bold'}}>Prof. {docente.nombres}</span>
                    </p>
                </div>
                <button 
                    onClick={() => { AuthService.logout(); navigate('/login'); }}
                    style={{ backgroundColor: '#dc3545', fontSize: '0.8rem', padding: '10px 20px' }}
                >
                    Cerrar Sesión
                </button>
            </div>

            {/* TARJETA PRINCIPAL DE ESTADO */}
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                
                {/* Cabecera de la tarjeta */}
                <div style={{ 
                    background: 'rgba(17, 34, 64, 0.8)', padding: '20px 30px',
                    borderBottom: '1px solid var(--glass-border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', border: 'none' }}>Auditoría Académica 2025-A</h3>
                    <span style={{ 
                        border: `1px solid ${getStatusColor(estadoActual)}`,
                        color: getStatusColor(estadoActual),
                        padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px'
                    }}>
                        {estadoActual}
                    </span>
                </div>

                <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    
                    {/* Sección de Nota */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '2px' }}>
                            Puntaje Acumulado Actual
                        </div>
                        <div style={{ 
                            fontSize: '5rem', fontWeight: '700', color: 'var(--text-main)',
                            textShadow: '0 0 30px rgba(100, 255, 218, 0.2)', margin: '10px 0'
                        }}>
                            {notaActual} <span style={{fontSize: '1.5rem', color: 'var(--text-muted)'}}>/ 100</span>
                        </div>
                        {evaluacion && evaluacion.categoria && (
                             <div style={{ 
                                color: evaluacion.categoria === 'DEFICIENTE' ? 'var(--danger)' : 'var(--success)',
                                fontWeight: 'bold', letterSpacing: '1px'
                            }}>
                                RANGO: {evaluacion.categoria}
                            </div>
                        )}
                    </div>

                    {/* Línea divisoria decorativa */}
                    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--glass-border), transparent)' }}></div>

                    {/* Sección de Acción (Autoevaluación) */}
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', maxWidth: '600px', margin: '0 auto 20px auto' }}>
                            {esFinalizado 
                                ? "El proceso de auditoría ha concluido. Ya no se pueden realizar modificaciones a su autoevaluación."
                                : "Como parte del proceso, debe completar su Autoevaluación (Ítem 15). Esta acción sumará hasta 10 puntos a su calificación final."
                            }
                        </p>

                        <button 
                            onClick={handleAutoevaluar}
                            disabled={esFinalizado}
                            style={{ 
                                width: '100%', maxWidth: '400px',
                                backgroundColor: esFinalizado ? '#333' : '#28a745', // Gris oscuro si finalizado, verde si no
                                padding: '18px', fontSize: '1.1rem',
                                marginTop: '10px'
                            }}
                        >
                            {esFinalizado ? '🔒 PROCESO CERRADO' : '📝 REALIZAR AUTOEVALUACIÓN'}
                        </button>
                    </div>

                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <p>Si tiene dudas sobre su puntaje, contacte a la Oficina de Calidad Académica.</p>
            </div>
        </div>
    );
};

export default DashboardDocente;