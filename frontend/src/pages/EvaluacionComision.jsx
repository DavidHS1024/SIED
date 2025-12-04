import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RubricaService } from '../api/rubricaService';
import { EvaluacionService } from '../api/evaluacionService';

/**
 * RÚBRICA DE AUDITORÍA (COMISIÓN)
 * Estilo: Royal Navy & Gold - High Command
 * UX: Tabla densa pero legible, inputs de alto contraste.
 */
const EvaluacionComision = () => {
    const { idDocente } = useParams();
    const navigate = useNavigate();
    
    const [rubrica, setRubrica] = useState([]);
    const [loading, setLoading] = useState(true);
    const [respuestas, setRespuestas] = useState({}); 
    const [mensaje, setMensaje] = useState(null);

    // Datos de contexto (Simulados por ahora, vendrían del Auth/Periodo)
    const idPeriodo = 1;
    const idEvaluador = 99; 

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            // 1. Cargar estructura de la Rúbrica
            const dataRubrica = await RubricaService.obtenerRubrica();
            
            // 2. Cargar evaluación previa (si existe) para pre-llenar
            let previos = {};
            try {
                const dataEval = await EvaluacionService.obtenerEvaluacion(idDocente, idPeriodo);
                if (dataEval.success && dataEval.data) {
                    // Convertir array de detalles a objeto { idItem: { puntaje, observacion } }
                    dataEval.data.DetalleEvaluacions.forEach(d => {
                        previos[d.idItem] = {
                            puntaje: d.puntajeObtenido,
                            observacion: d.observacion
                        };
                    });
                }
            } catch (err) {
                console.log("Sin evaluación previa, iniciando desde cero.");
            }

            if(dataRubrica.success) {
                setRubrica(dataRubrica.data);
                if (Object.keys(previos).length > 0) {
                    setRespuestas(previos);
                    setMensaje({ tipo: 'info', texto: '📂 Se han cargado datos previos de este docente.' });
                }
            }
        } catch (error) {
            setMensaje({ tipo: 'error', texto: "Error cargando rúbrica: " + error.message });
        } finally {
            setTimeout(() => setLoading(false), 600);
        }
    };

    const handleInputChange = (idItem, campo, valor) => {
        setRespuestas(prev => ({
            ...prev,
            [idItem]: {
                ...prev[idItem],
                [campo]: valor
            }
        }));
    };

    const handleSubmit = async () => {
        const detallesArray = Object.keys(respuestas).map(key => ({
            idItem: parseInt(key),
            puntaje: respuestas[key].puntaje || 0,
            observacion: respuestas[key].observacion || ''
        }));

        if (detallesArray.length === 0) {
            alert("⚠️ El formulario está vacío. Ingrese al menos un puntaje.");
            return;
        }

        try {
            const payload = { idDocente, idPeriodo, idEvaluador, detalles: detallesArray };
            const resultado = await EvaluacionService.guardarEvaluacion(payload);
            
            // Feedback de éxito visual
            setMensaje({ 
                tipo: 'success', 
                texto: `✅ AUDITORÍA GUARDADA CON ÉXITO. NOTA FINAL: ${resultado.data.puntajeTotal} (${resultado.data.categoria})` 
            });
            
            // Scroll al inicio para ver el mensaje
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Opcional: Redirigir después de unos segundos
            // setTimeout(() => navigate('/dashboard-comision'), 3000);

        } catch (error) {
            setMensaje({ tipo: 'error', texto: `❌ ERROR DE GUARDADO: ${error.message}` });
        }
    };

    if (loading) return <div style={{padding:'100px', textAlign:'center', color:'var(--gold-primary)', letterSpacing:'3px'}}>CARGANDO EXPEDIENTE...</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
            
            {/* HEADER DE EXPEDIENTE */}
            <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', 
                marginBottom: '40px', borderBottom: '2px solid var(--gold-dim)', paddingBottom: '20px' 
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '2rem' }}>📋</span>
                        <h1 style={{ margin: 0, fontSize: '2rem', border: 'none', textAlign: 'left' }}>
                            Ficha de Evaluación
                        </h1>
                    </div>
                    <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                        EXPEDIENTE DOCENTE ID: <span style={{color:'var(--gold-primary)', fontWeight:'bold'}}>#{idDocente}</span>
                    </p>
                </div>
                
                <button 
                    onClick={() => navigate('/dashboard-comision')}
                    style={{ backgroundColor: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-muted)' }}
                >
                    ↩ Cancelar / Volver
                </button>
            </div>

            {/* ÁREA DE NOTIFICACIONES */}
            {mensaje && (
                <div className="animate-enter" style={{ 
                    padding: '15px 20px', 
                    background: mensaje.tipo === 'success' ? 'rgba(40, 167, 69, 0.2)' : mensaje.tipo === 'info' ? 'rgba(23, 162, 184, 0.2)' : 'rgba(220, 53, 69, 0.2)',
                    borderLeft: `5px solid ${mensaje.tipo === 'success' ? 'var(--success)' : mensaje.tipo === 'info' ? '#17a2b8' : 'var(--danger)'}`,
                    color: 'var(--text-main)',
                    marginBottom: '30px', borderRadius: '4px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}>
                    <strong style={{marginRight: '10px', textTransform: 'uppercase'}}>{mensaje.tipo === 'success' ? 'ÉXITO' : 'SISTEMA'}:</strong> 
                    {mensaje.texto}
                </div>
            )}

            {/* TABLA DE RÚBRICA (GLASS PANEL) */}
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ margin: 0 }}>
                    <thead>
                        <tr style={{ background: 'rgba(17, 34, 64, 0.9)' }}>
                            <th style={{ width: '80px', textAlign: 'center' }}>#</th>
                            <th>INDICADOR DE DESEMPEÑO</th>
                            <th style={{ width: '100px', textAlign: 'center' }}>MAX</th>
                            <th style={{ width: '120px', textAlign: 'center' }}>NOTA</th>
                            <th style={{ width: '30%' }}>OBSERVACIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rubrica.map((dimension) => (
                            <>
                                {/* Separador de Dimensión */}
                                <tr key={`dim-${dimension.idDimension}`} style={{ background: 'rgba(212, 175, 55, 0.15)' }}>
                                    <td colSpan="5" style={{ 
                                        padding: '15px 25px', 
                                        color: 'var(--gold-primary)', 
                                        fontFamily: 'Cinzel, serif', fontWeight: 'bold', letterSpacing: '1px',
                                        borderTop: '1px solid var(--gold-dim)',
                                        borderBottom: '1px solid var(--gold-dim)'
                                    }}>
                                        {dimension.nombre} <span style={{fontSize:'0.8em', opacity: 0.7, marginLeft: '10px'}}>({dimension.peso}%)</span>
                                    </td>
                                </tr>
                                
                                {/* Items de la Dimensión */}
                                {dimension.RubricaItems.map((item) => {
                                    const valPuntaje = respuestas[item.idItem]?.puntaje || '';
                                    const valObs = respuestas[item.idItem]?.observacion || '';
                                    
                                    // Detectar si es autoevaluación (Rol DOCENTE) para deshabilitar o marcar
                                    const isAuto = item.rolEvaluador === 'DOCENTE';

                                    return (
                                        <tr key={item.idItem} style={{ background: isAuto ? 'rgba(0,0,0,0.2)' : 'transparent' }}>
                                            <td style={{ textAlign: 'center', fontWeight: 'bold', opacity: 0.5 }}>
                                                {item.numeroItem}
                                            </td>
                                            <td style={{ paddingRight: '30px' }}>
                                                <div style={{ marginBottom: '5px', lineHeight: '1.4' }}>{item.concepto}</div>
                                                <div style={{ fontSize: '0.75rem', color: isAuto ? 'var(--warning)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    {isAuto ? '⚠️ Llenado por el Docente' : `Responsable: ${item.rolEvaluador}`}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                                                {item.puntajeMaximo}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <input 
                                                    type="number" 
                                                    min="0" 
                                                    max={item.puntajeMaximo}
                                                    step="0.5"
                                                    disabled={isAuto} // La comisión no debe editar la autoevaluación aquí
                                                    value={valPuntaje}
                                                    onChange={(e) => handleInputChange(item.idItem, 'puntaje', e.target.value)}
                                                    placeholder="0"
                                                    style={{ 
                                                        width: '70px', textAlign: 'center', 
                                                        fontSize: '1.1rem', fontWeight: 'bold',
                                                        border: valPuntaje ? '1px solid var(--success)' : undefined,
                                                        color: isAuto ? 'var(--text-muted)' : 'var(--gold-text)'
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    value={valObs}
                                                    disabled={isAuto}
                                                    onChange={(e) => handleInputChange(item.idItem, 'observacion', e.target.value)}
                                                    placeholder={isAuto ? "Campo reservado al docente" : "Observación opcional..."}
                                                    style={{ width: '95%', fontSize: '0.9rem', fontStyle: 'italic' }}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* BARRA DE ACCIÓN FIJA INFERIOR (Para que siempre esté a mano) */}
            <div style={{ 
                position: 'sticky', bottom: '20px', marginTop: '40px',
                background: 'var(--navy-glass)', backdropFilter: 'blur(15px)',
                padding: '20px', borderRadius: '10px', border: '1px solid var(--gold-dim)',
                display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 100
            }}>
                <div style={{ color: 'var(--text-muted)', marginRight: 'auto', paddingLeft: '10px' }}>
                    <span style={{ color: 'var(--warning)' }}>⚠️</span> Revise todos los puntajes antes de cerrar el acta.
                </div>
                <button 
                    onClick={handleSubmit}
                    style={{ 
                        backgroundColor: 'var(--btn-blue)', 
                        padding: '15px 40px', 
                        fontSize: '1.1rem',
                        boxShadow: '0 0 15px rgba(0, 123, 255, 0.4)'
                    }}
                >
                    💾 Guardar y Finalizar Auditoría
                </button>
            </div>
        </div>
    );
};

export default EvaluacionComision;