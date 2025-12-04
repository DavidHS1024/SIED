import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RubricaService } from '../api/rubricaService';
import { EvaluacionService } from '../api/evaluacionService'; // Necesitaremos agregar saveAutoevaluacion aquí
import { AuthService } from '../api/authService';
import api from '../api/axiosConfig'; // Importamos axios directo para el nuevo endpoint

const Autoevaluacion = () => {
    const { idDocente } = useParams();
    const navigate = useNavigate();
    const [itemsDocente, setItemsDocente] = useState([]);
    const [puntaje, setPuntaje] = useState(0);
    const [mensaje, setMensaje] = useState(null);
    
    const user = AuthService.getCurrentUser();

    useEffect(() => {
        cargarRubrica();
    }, []);

    const cargarRubrica = async () => {
        const data = await RubricaService.obtenerRubrica();
        if (data.success) {
            // FILTRAR: Solo queremos items donde rolEvaluador sea 'DOCENTE'
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
    };

    const handleGuardar = async () => {
        if (itemsDocente.length === 0) return;

        const item = itemsDocente[0]; // Asumimos que hay solo 1 por ahora (Item 15)
        
        if (puntaje > item.puntajeMaximo) {
            alert(`El puntaje máximo es ${item.puntajeMaximo}`);
            return;
        }

        const payload = {
            idDocente: idDocente,
            idPeriodo: 1, // Quemado por ahora
            idEvaluador: user.idUsuario,
            detalles: [
                { idItem: item.idItem, puntaje: puntaje, observacion: 'Autoevaluación realizada' }
            ]
        };

        try {
            // Llamamos al endpoint específico de AUTOEVALUACION
            const res = await api.post('/evaluacion/auto', payload);
            setMensaje({ tipo: 'success', texto: `✅ Guardado. Nuevo total: ${res.data.data.puntajeTotal}` });
            setTimeout(() => navigate('/dashboard-docente'), 2000);
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al guardar' });
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => navigate('/dashboard-docente')} style={{marginBottom: '20px', background:'#666', color:'white'}}>⬅ Volver</button>
            
            <h1>Mi Autoevaluación</h1>
            
            {mensaje && <div style={{padding:'10px', background: mensaje.tipo === 'success'?'#d4edda':'#f8d7da', color: 'black'}}>{mensaje.texto}</div>}

            {itemsDocente.map(item => (
                <div key={item.idItem} style={{ background: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
                    <h3>{item.dimNombre}</h3>
                    <p style={{ fontSize: '1.2em' }}>{item.concepto}</p>
                    <hr/>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
                        <label><strong>Tu Calificación (Max {item.puntajeMaximo}):</strong></label>
                        <input 
                            type="number" 
                            value={puntaje}
                            onChange={(e) => setPuntaje(e.target.value)}
                            min="0"
                            max={item.puntajeMaximo}
                            style={{ fontSize: '1.5em', width: '80px', textAlign: 'center' }}
                        />
                    </div>
                </div>
            ))}

            <button 
                onClick={handleGuardar}
                style={{ marginTop: '30px', width: '100%', padding: '15px', fontSize: '1.2em', background: '#007bff', color: 'white' }}
            >
                💾 Guardar Mi Nota
            </button>
        </div>
    );
};

export default Autoevaluacion;