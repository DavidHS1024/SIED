import { useEffect, useState } from 'react';
import { RubricaService } from '../api/rubricaService';
import { EvaluacionService } from '../api/evaluacionService';

const EvaluacionComision = () => {
    const [rubrica, setRubrica] = useState([]);
    const [loading, setLoading] = useState(true);
    const [respuestas, setRespuestas] = useState({}); // Almacena { idItem: { puntaje, observacion } }
    const [mensaje, setMensaje] = useState(null);

    // DATOS QUEMADOS (HARDCODED) PARA PRUEBA - LUEGO VENDRÁN DEL LOGIN/SELECCIÓN
    const idDocente = 1; 
    const idPeriodo = 1;
    const idEvaluador = 99;

    // 1. Cargar la Rúbrica al iniciar
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const data = await RubricaService.obtenerRubrica();
            if(data.success) {
                setRubrica(data.data); // Guardamos las dimensiones
            }
        } catch (error) {
            console.error("Error cargando rúbrica");
        } finally {
            setLoading(false);
        }
    };

    // 2. Manejar cambios en los inputs (Puntaje y Observación)
    const handleInputChange = (idItem, campo, valor) => {
        setRespuestas(prev => ({
            ...prev,
            [idItem]: {
                ...prev[idItem],
                [campo]: valor
            }
        }));
    };

    // 3. Enviar formulario al Backend
    const handleSubmit = async () => {
        // Convertimos el objeto respuestas a un array limpio para la API
        const detallesArray = Object.keys(respuestas).map(key => ({
            idItem: parseInt(key),
            puntaje: respuestas[key].puntaje || 0,
            observacion: respuestas[key].observacion || ''
        }));

        if (detallesArray.length === 0) {
            alert("Por favor califique al menos un ítem.");
            return;
        }

        const payload = {
            idDocente,
            idPeriodo,
            idEvaluador,
            detalles: detallesArray
        };

        try {
            const resultado = await EvaluacionService.guardarEvaluacion(payload);
            setMensaje({ tipo: 'success', texto: `✅ Guardado! Nota: ${resultado.data.puntajeTotal} (${resultado.data.categoria})` });
        } catch (error) {
            setMensaje({ tipo: 'error', texto: `❌ Error: ${error.message}` });
        }
    };

    if (loading) return <div>Cargando Rúbrica...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1>Auditoría Docente (Comisión)</h1>
            
            {mensaje && (
                <div style={{ 
                    padding: '10px', 
                    backgroundColor: mensaje.tipo === 'success' ? '#d4edda' : '#f8d7da',
                    color: mensaje.tipo === 'success' ? '#155724' : '#721c24',
                    marginBottom: '20px', borderRadius: '5px'
                }}>
                    {mensaje.texto}
                </div>
            )}

            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2', color: '#000' }}>
                        <th>Item</th>
                        <th>Concepto / Indicador</th>
                        <th>Max</th>
                        <th>Puntaje</th>
                        <th>Observación</th>
                    </tr>
                </thead>
                <tbody>
                    {rubrica.map((dimension) => (
                        <>
                            {/* Fila de Título de Dimensión */}
                            <tr key={`dim-${dimension.idDimension}`} style={{ backgroundColor: '#e9ecef', color: '#000' }}>
                                <td colSpan="5" style={{ fontWeight: 'bold' }}>
                                    {dimension.nombre} ({dimension.peso}%)
                                </td>
                            </tr>
                            
                            {/* Filas de Items */}
                            {dimension.RubricaItems.map((item) => (
                                <tr key={item.idItem}>
                                    <td style={{ textAlign: 'center' }}>{item.numeroItem}</td>
                                    <td>
                                        {item.concepto}
                                        <div style={{ fontSize: '0.8em', color: '#666' }}>Rol: {item.rolEvaluador}</div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{item.puntajeMaximo}</td>
                                    <td>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            max={item.puntajeMaximo}
                                            step="0.5"
                                            style={{ width: '60px', padding: '5px' }}
                                            onChange={(e) => handleInputChange(item.idItem, 'puntaje', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            type="text" 
                                            placeholder="Opcional"
                                            style={{ width: '90%', padding: '5px' }}
                                            onChange={(e) => handleInputChange(item.idItem, 'observacion', e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button 
                    onClick={handleSubmit}
                    style={{ 
                        padding: '15px 30px', 
                        fontSize: '16px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    💾 Guardar Evaluación Final
                </button>
            </div>
        </div>
    );
};

export default EvaluacionComision;