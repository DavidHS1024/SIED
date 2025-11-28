import { Docente, Usuario } from '../models/index.js';
import bcrypt from 'bcrypt';

// Listar todos los docentes
export const getDocentes = async (req, res) => {
    try {
        const docentes = await Docente.findAll({
            include: [{
                model: Usuario,
                attributes: ['nombres', 'apellidos', 'email', 'estado'] // Solo traemos info útil
            }]
        });
        res.json(docentes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear un nuevo docente (y su usuario asociado)
export const createDocente = async (req, res) => {
    const { nombres, apellidos, email, dni, codigoDocente, departamento } = req.body;

    try {
        // 1. Crear el Usuario primero (Login)
        const passwordHash = await bcrypt.hash(dni, 10); // DNI es la password inicial
        
        const nuevoUsuario = await Usuario.create({
            nombres,
            apellidos,
            email,
            passwordHash,
            rol: 'DOCENTE',
            estado: true
        });

        // 2. Crear el perfil Docente vinculado
        const nuevoDocente = await Docente.create({
            idUsuario: nuevoUsuario.idUsuario,
            codigoDocente,
            categoria: 'Principal', // Default
            departamentoAcademico: departamento
        });

        res.json({
            success: true,
            message: 'Docente registrado correctamente',
            docente: nuevoDocente
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al registrar docente. Posiblemente el código o email ya existen.' 
        });
    }
};