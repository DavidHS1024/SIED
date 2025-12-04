import { useEffect, useState } from 'react';
import { DocenteService } from '../api/docenteService';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../api/authService';

/**
 * PANEL DE COMISIÓN EVALUADORA
 * Estilo: Royal Navy & Gold - High Command
 */
const DashboardComision = () => {
    const [docentes, setDocentes] = useState([]);
    const [periodo, setPeriodo] = useState('');
    const [loading, setLoading] = useState(true);
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
            console.error("Error cargando lista:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEvaluar = (idDocente) => {
        navigate(`/evaluacion-comision/${idDocente}`);
    };

    // Helper para estilos de estado
    const getStatusStyle = (estado) => {
        if (estado === 'FINALIZADO') {
            return { 
                border: '1px solid var(--success)', color: 'var(--success)', 
                background: 'rgba(100, 255, 218, 0.05)' 
            };
        }
        return { 
            border: '1px solid var(--warning)', color: 'var(--warning)', 
            background: 'rgba(255, 215, 0, 0.05)' 
        };
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
            
            {/* HERO HEADER: Título Prominente */}
            <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', 
                marginBottom: '40px', borderBottom: '2px solid var(--gold-dim)', paddingBottom: '20px' 
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '2.5rem' }}>⚖️</span>
                        <h1 style={{ margin: 0, fontSize: '2.5rem', border: 'none', textAlign: 'left' }}>
                            Comisión Evaluadora
                        </h1>
                    </div>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1.1rem', letterSpacing: '1px' }}>
                        GESTIÓN DE AUDITORÍAS <span style={{color:'var(--gold-primary)', fontWeight:'bold'}}>| PERIODO {periodo}</span>
                    </p>
                </div>
                
                <button 
                    onClick={() => { AuthService.logout(); navigate('/login'); }}
                    style={{ backgroundColor: '#dc3545', padding: '12px 25px', fontSize: '0.9rem' }}
                >
                    Cerrar Sesión
                </button>
            </div>

            {/* ÁREA DE CONTENIDO (Glass Card) */}
            <div className="glass-card" style={{ padding: '20px', minHeight: '500px' }}>
                
                {loading ? (
                    <div style={{ padding: '50px', textAlign: 'center', color: 'var(--gold-primary)' }}>
                        Cargando expedientes docentes...
                    </div>
                ) : (
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '100px' }}>CÓDIGO</th>
                                <th>DOCENTE</th>
                                <th>DEPARTAMENTO</th>
                                <th style={{ textAlign: 'center' }}>ESTADO</th>
                                <th style={{ textAlign: 'center' }}>NOTA FINAL</th>
                                <th style={{ textAlign: 'center', width: '150px' }}>ACCIÓN</th>
                            </tr>
                        </thead>
                        <tbody>
                            {docentes.map(d => (
                                <tr key={d.idDocente}>
                                    <td style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--gold-text)' }}>
                                        {d.codigo}
                                    </td>
                                    <td style={{ fontWeight: '500', fontSize: '1.1rem' }}>
                                        {d.nombreCompleto}
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {d.departamento || 'INGENIERÍA DE SISTEMAS'}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{ 
                                            ...getStatusStyle(d.estado),
                                            padding: '6px 12px', borderRadius: '20px', 
                                            fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px'
                                        }}>
                                            {d.estado}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                        {d.puntaje !== '-' ? d.puntaje : <span style={{color:'rgba(255,255,255,0.1)'}}>--</span>}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button 
                                            onClick={() => handleEvaluar(d.idDocente)}
                                            style={{ 
                                                padding: '8px 16px', fontSize: '0.8rem',
                                                backgroundColor: d.estado === 'FINALIZADO' ? 'transparent' : 'var(--gold-primary)',
                                                border: d.estado === 'FINALIZADO' ? '1px solid var(--text-muted)' : 'none',
                                                color: d.estado === 'FINALIZADO' ? 'var(--text-main)' : 'var(--navy-deep)'
                                            }}
                                        >
                                            {d.estado === 'FINALIZADO' ? '👁️ VER' : '📝 EVALUAR'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            
                            {docentes.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                        No se encontraron docentes registrados en este periodo.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default DashboardComision;