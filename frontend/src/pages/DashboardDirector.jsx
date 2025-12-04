import { useEffect, useState } from 'react';
import { ReporteService } from '../api/reporteService';
import { AuthService } from '../api/authService';
import { useNavigate } from 'react-router-dom';

/**
 * TABLERO DE MANDO - DIRECTOR (ESTRATÉGICO)
 * Estilo: Royal Navy & Gold
 */
const DashboardDirector = () => {
    const [reporte, setReporte] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const data = await ReporteService.getGlobalStats();
            if (data.success) setReporte(data);
        } catch (error) {
            console.error(error);
        } finally {
            setTimeout(() => setLoading(false), 500);
        }
    };

    if (loading) return <div style={{padding: '100px', textAlign:'center', color:'var(--gold-primary)'}}>GENERANDO INFORME ESTRATÉGICO...</div>;
    if (!reporte) return <div style={{padding: '40px', textAlign:'center', color:'var(--danger)'}}>Error de conexión con la base de datos.</div>;

    const { stats, data, periodo } = reporte;

    // Componente Interno: StatCard
    const StatCard = ({ title, value, color, icon }) => (
        <div className="glass-card" style={{ 
            padding: '25px', flex: 1, textAlign: 'center',
            borderTop: `4px solid ${color}`, 
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            minWidth: '180px'
        }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px', opacity: 0.8 }}>{icon}</div>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '0.8rem', border:'none' }}>
                {title}
            </h3>
            <div style={{ 
                fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-main)',
                // Corrección: Usamos drop-shadow en lugar de concatenar alpha al color
                filter: `drop-shadow(0 0 10px ${color})` 
            }}>
                {value}
            </div>
        </div>
    );

    return (
        <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
            
            {/* HEADER */}
            <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', 
                marginBottom: '50px', borderBottom: '2px solid var(--gold-dim)', paddingBottom: '20px' 
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.2rem', border: 'none', textAlign: 'left' }}>
                        <span style={{fontSize:'1.5rem'}}>🏛️</span> Despacho de Dirección
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0', letterSpacing: '1px' }}>
                        REPORTE EJECUTIVO <span style={{color:'var(--gold-primary)', fontWeight:'bold'}}>| CICLO {periodo}</span>
                    </p>
                </div>
                <button 
                    onClick={() => { AuthService.logout(); navigate('/login'); }}
                    style={{ backgroundColor: '#dc3545', fontSize: '0.85rem', padding: '10px 25px' }}
                >
                    Cerrar Sesión
                </button>
            </div>

            {/* MATRIZ DE INDICADORES (KPIs) */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '50px', flexWrap: 'wrap' }}>
                <StatCard 
                    title="PLANA DOCENTE" 
                    value={stats.total} 
                    color="#007bff" // Corrección: Color explícito (Hex) en vez de variable inexistente
                    icon="👥" 
                />
                <StatCard 
                    title="AVANCE AUDITORÍA" 
                    value={`${stats.avance}%`} 
                    color="var(--success)" 
                    icon="📈" 
                />
                <StatCard 
                    title="PENDIENTES" 
                    value={stats.pendientes} 
                    color="var(--warning)" 
                    icon="⏳" 
                />
                <StatCard 
                    title="ALTO RENDIMIENTO" 
                    value={stats.porCategoria.EXCELENTE} 
                    color="#00f2ff" 
                    icon="⭐" 
                />
                <StatCard 
                    title="OBSERVADOS" 
                    value={stats.porCategoria.DEFICIENTE} 
                    color="var(--danger)" 
                    icon="⚠️" 
                />
            </div>

            {/* SECCIÓN DE DETALLE */}
            <h2 style={{ fontSize: '1.5rem', textAlign: 'left', borderBottom: '1px solid var(--glass-border)', paddingBottom:'10px', marginBottom:'20px' }}>
                Expediente Detallado
            </h2>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ margin: 0 }}>
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: '30px' }}>CÓDIGO</th>
                            <th>DOCENTE</th>
                            <th style={{QmtextAlign: 'center' }}>ESTADO</th>
                            <th style={{ textAlign: 'center' }}>PUNTAJE</th>
                            <th style={{ textAlign: 'center' }}>CATEGORÍA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(d => (
                            <tr key={d.id}>
                                <td style={{ paddingLeft: '30px', fontFamily: 'monospace', color: 'var(--gold-text)' }}>
                                    {d.codigo}
                                </td>
                                <td style={{ fontWeight: '500' }}>
                                    {d.nombre}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={{ 
                                        padding: '5px 12px', borderRadius: '12px', fontSize: '0.7rem', fontWeight:'bold',
                                        border: d.estado === 'FINALIZADO' ? '1px solid var(--success)' : '1px solid var(--warning)',
                                        color: d.estado === 'FINALIZADO' ? 'var(--success)' : 'var(--warning)',
                                        backgroundColor: d.estado === 'FINALIZADO' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(255, 193, 7, 0.1)'
                                    }}>
                                        {d.estado}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                    {/* CORRECCIÓN CRÍTICA: Convertimos a Number antes de usar toFixed */}
                                    {Number(d.nota) > 0 ? Number(d.nota).toFixed(2) : <span style={{opacity:0.3}}>-</span>}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={{
                                        color: d.categoria === 'DEFICIENTE' ? 'var(--danger)' : 
                                               d.categoria === 'EXCELENTE' ? '#00f2ff' : 'var(--text-muted)',
                                        fontWeight: d.categoria !== '-' ? 'bold' : 'normal'
                                    }}>
                                        {d.categoria}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                             <tr><td colSpan="5" style={{textAlign:'center', padding:'30px'}}>Sin datos disponibles.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashboardDirector;