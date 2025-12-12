import { Docente, Usuario, EvaluacionDocente, Periodo } from '../models/index.js';
import bcrypt from 'bcrypt';

export const getDocentesDashboard = async (req, res) => {
    try {
        // 1. Obtener el periodo activo
        const periodoActivo = await Periodo.findOne({ where: { estado: 'ACTIVO' } });
        
        if (!periodoActivo) {
            return res.status(404).json({ message: 'No hay periodo activo' });
        }

        // 2. Obtener todos los docentes con sus datos de Usuario y Evaluación
        const docentes = await Docente.findAll({
            include: [
                { 
                    model: Usuario, 
                    attributes: ['nombres', 'apellidos', 'email'] 
                },
                {
                    model: EvaluacionDocente,
                    where: { idPeriodo: periodoActivo.idPeriodo },
                    required: false,
                    attributes: ['idEvaluacion', 'estado', 'puntajeFinal', 'categoria']
                }
            ]
        });

        // 3. Formatear la respuesta para la tabla del frontend
        const data = docentes.map(d => ({
            idDocente: d.idDocente,
            codigo: d.codigoDocente,
            nombreCompleto: `${d.Usuario.nombres} ${d.Usuario.apellidos}`,
            email: d.Usuario.email,
            departamento: d.departamentoAcademico,
            // Datos de la evaluación (si existe)
            estado: d.EvaluacionDocentes[0]?.estado || 'PENDIENTE',
            puntaje: d.EvaluacionDocentes[0]?.puntajeFinal || '-',
            categoria: d.EvaluacionDocentes[0]?.categoria || '-'
        }));

        res.json({
            success: true,
            periodo: periodoActivo.nombre,
            data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener docentes' });
    }
};