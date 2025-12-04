import { useEffect, useState } from 'react';
import { ReporteService } from '../api/reporteService';
import { AuthService } from '../api/authService';
import { useNavigate } from 'react-router-dom';

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
            setLoading(false);
        }
    };

    if (loading) return <div style={{padding: '40px', textAlign:'center'}}>Generando Reportes...</div>;
    if (!reporte) return <div>Error al cargar datos.</div>;

    const { stats, data, periodo } = reporte;

    // Componente simple para tarjetas (Card)
    const StatCard = ({ title, value, color }) => (
        <div style={{ 
            background: 'white', padding: '20px', borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: 1, textAlign: 'center',
            borderTop: `4px solid ${color}`
        }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9em' }}>{title}</h3>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#333' }}>{value}</div>
        </div>
    );

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Tablero de Control (Director)</h1>
                    <p style={{ color: '#666', marginTop: '5px' }}>Periodo: {periodo}</p>
                </div>
                <button onClick={() => { AuthService.logout(); navigate('/login'); }} style={{background: '#333', color: 'white'}}>
                    Cerrar Sesión
                </button>
            </div>

            {/* SECCIÓN DE KPIs */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
                <StatCard title="Total Docentes" value={stats.total} color="#007bff" />
                <StatCard title="Evaluados" value={`${stats.avance}%`} color="#28a745" />
                <StatCard title="Pendientes" value={stats.pendientes} color="#ffc107" />
                <StatCard title="Excelencia" value={stats.porCategoria.EXCELENTE} color="#17a2b8" />
                <StatCard title="En Riesgo (Deficiente)" value={stats.porCategoria.DEFICIENTE} color="#dc3545" />
            </div>

            {/* TABLA DETALLADA */}
            <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '20px' }}>
                <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2em' }}>Detalle por Docente</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', color: '#495057' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Código</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Docente</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Estado</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Nota</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Categoría</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(d => (
                            <tr key={d.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px' }}>{d.codigo}</td>
                                <td style={{ padding: '12px', fontWeight: '500' }}>{d.nombre}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <span style={{ 
                                        padding: '4px 8px', borderRadius: '12px', fontSize: '0.8em',
                                        background: d.estado === 'FINALIZADO' ? '#d4edda' : '#f8d7da',
                                        color: d.estado === 'FINALIZADO' ? '#155724' : '#721c24'
                                    }}>
                                        {d.estado}
                                    </span>
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{d.nota}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>{d.categoria}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashboardDirector;