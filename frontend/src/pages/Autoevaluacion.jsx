import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RubricaService } from '../api/rubricaService';
import { AuthService } from '../api/authService';
import api from '../api/axiosConfig'; 

/**
 * MÓDULO DE AUTOEVALUACIÓN DOCENTE
 * Estilo: Royal Navy & Gold
 * Enfoque: Formulario de precisión para el ítem 15.
 */
const Autoevaluacion = () => {
    const { idDocente } = useParams();
    const navigate = useNavigate();
    const [itemsDocente, setItemsDocente] = useState([]);
    const [puntaje, setPuntaje] = useState(0);
    const [observacion, setObservacion] = useState('');
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState(null);
    
    const user = AuthService.getCurrentUser();

    useEffect(() => {
        cargarRubrica();
    }, []);

    const cargarRubrica = async () => {
        try {
            const data = await RubricaService.obtenerRubrica();
            if (data.success) {
                const itemsFiltrados = [];
                data.data.forEach(dim => {
                    dim.RubricaItems.forEach(item => {
                        if (item.rolEvaluador === 'DOCENTE') {
                            itemsFiltrados.push({ ...item, dimNombre: dim.nombre });
                        }
                    });
                });
                setItemsDocente(itemsFiltrados);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGuardar = async () => {
        if (itemsDocente.length === 0) return;
        const item = itemsDocente[0]; 
        
        if (Number(puntaje) > Number(item.puntajeMaximo)) {
            setMensaje({ tipo: 'error', texto: `⚠️ El puntaje máximo permitido es ${item.puntajeMaximo}` });
            return;
        }
        if (Number(puntaje) < 0) {
            setMensaje({ tipo: 'error', texto: `⚠️ El puntaje no puede ser negativo.` });
            return;
        }
        if (!Number.isInteger(Number(puntaje))) {
            setMensaje({ tipo: 'error', texto: '⚠️ Solo se permite puntajes enteros.' });
            return;
        }

        const payload = {
            idDocente: idDocente,
            idPeriodo: 1, // Quemado para MVP
            idEvaluador: user.idUsuario,
            detalles: [
                { idItem: item.idItem, puntaje: puntaje, observacion: observacion || 'Autoevaluación completada' }
            ]
        };

        try {
            const res = await api.post('/evaluacion/auto', payload);
            setMensaje({ tipo: 'success', texto: `✅ AUTOEVALUACIÓN REGISTRADA. Nuevo Total: ${res.data.data.puntajeTotal}` });
            
            // Efecto de salida elegante
            setTimeout(() => navigate('/dashboard-docente'), 2000);
        } catch (error) {
            setMensaje({ tipo: 'error', texto: '❌ Error al conectar con el servidor de auditoría.' });
        }
    };

    if (loading) return <div style={{padding:'100px', textAlign:'center', color:'var(--gold-primary)', letterSpacing:'2px'}}>CARGANDO PROTOCOLO...</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            
            {/* HEADER */}
            <div style={{ marginBottom: '30px', display:'flex', alignItems:'center', gap:'20px' }}>
                <button 
                    onClick={() => navigate('/dashboard-docente')} 
                    style={{ 
                        background: 'transparent', border: '1px solid var(--text-muted)', 
                        color: 'var(--text-muted)', padding: '10px 20px'
                    }}
                >
                    ⬅ Volver
                </button>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', border: 'none', textAlign: 'left' }}>Declaración Jurada</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>AUTOEVALUACIÓN DOCENTE</p>
                </div>
            </div>

            {/* NOTIFICACIONES */}
            {mensaje && (
                <div className="animate-enter" style={{ 
                    padding: '15px', marginBottom: '20px', borderRadius: '4px',
                    background: mensaje.tipo === 'success' ? 'rgba(40, 255, 100, 0.1)' : 'rgba(255, 100, 100, 0.1)',
                    border: `1px solid ${mensaje.tipo === 'success' ? 'var(--success)' : 'var(--danger)'}`,
                    color: mensaje.tipo === 'success' ? 'var(--success)' : 'var(--danger)'
                }}>
                    {mensaje.texto}
                </div>
            )}

            {itemsDocente.map(item => (
                <div key={item.idItem} className="glass-card" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
                    
                    {/* Etiqueta Decorativa */}
                    <div style={{
                        position: 'absolute', top: '0', right: '0', background: 'var(--gold-primary)',
                        color: 'var(--navy-deep)', padding: '5px 15px', fontSize: '0.7rem', fontWeight: 'bold',
                        borderRadius: '0 0 0 8px'
                    }}>
                        ÍTEM {item.numeroItem}
                    </div>

                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', border:'none', textAlign:'left' }}>
                        {item.dimNombre}
                    </h3>
                    <p style={{ fontSize: '1.4rem', color: 'var(--text-main)', margin: '10px 0 30px 0', fontFamily: 'Cinzel, serif' }}>
                        {item.concepto}
                    </p>
                    
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid var(--navy-light)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            
                            {/* Input de Puntaje */}
                            <div>
                                <label style={{marginBottom: '10px', display: 'block'}}>Su Calificación (Máx. {item.puntajeMaximo})</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input 
                                        type="number" 
                                        value={puntaje}
                                        onChange={(e) => setPuntaje(parseFloat(e.target.value) || 0)}
                                        min="0"
                                        max={item.puntajeMaximo}
                                        step="1"
                                        style={{ 
                                            fontSize: '2rem', width: '100px', textAlign: 'center', 
                                            color: 'var(--gold-primary)', fontWeight: 'bold',
                                            border: '2px solid var(--navy-light)'
                                        }}
                                    />
                                    <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>/ {item.puntajeMaximo}</span>
                                </div>
                            </div>

                            {/* Input de Observación */}
                            <div style={{ marginTop: '10px' }}>
                                <label>Sustento / Observación (Opcional)</label>
                                <input 
                                    type="text" 
                                    value={observacion}
                                    onChange={(e) => setObservacion(e.target.value)}
                                    placeholder="Breve justificación del puntaje..."
                                    style={{ width: '100%', padding: '15px' }}
                                />
                            </div>

                        </div>
                    </div>
                </div>
            ))}

            <button 
                onClick={handleGuardar}
                style={{ 
                    marginTop: '30px', width: '100%', padding: '18px', 
                    fontSize: '1.2rem', backgroundColor: 'var(--btn-blue)',
                    boxShadow: '0 0 20px rgba(0, 123, 255, 0.3)'
                }}
            >
                💾 CONFIRMAR Y GUARDAR
            </button>
        </div>
    );
};

export default Autoevaluacion;