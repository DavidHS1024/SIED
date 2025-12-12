import { Usuario, Docente } from '../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Clave secreta para firmar los tokens
const JWT_SECRET = process.env.JWT_SECRET || 'sied_secreto_super_seguro_2025';

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar usuario
        const usuario = await Usuario.findOne({ 
            where: { email, estado: true } 
        });

        if (!usuario) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas (Usuario no encontrado)' });
        }

        // 2. Verificar contraseña
        const isMatch = await bcrypt.compare(password, usuario.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas (Contraseña incorrecta)' });
        }

        // 3. Obtener datos extra si es Docente
        let datosExtra = {};
        if (usuario.rol === 'DOCENTE') {
            const docente = await Docente.findOne({ where: { idUsuario: usuario.idUsuario } });
            if (docente) datosExtra = { idDocente: docente.idDocente, codigo: docente.codigoDocente };
        }

        // 4. Generar Token JWT
        // Este token contiene el ID y el ROL encriptados
        const token = jwt.sign(
            { 
                id: usuario.idUsuario, 
                rol: usuario.rol,
                ...datosExtra
            },
            JWT_SECRET,
            { expiresIn: '8h' } // El usuario deberá loguearse de nuevo en 8 horas
        );

        // 5. Responder al Frontend
        res.json({
            success: true,
            message: 'Bienvenido al SIED',
            token, // El frontend guardará esto
            user: {
                id: usuario.idUsuario,
                nombres: usuario.nombres,
                rol: usuario.rol,
                ...datosExtra
            }
        });

    } catch (error) {
        console.error("Error en Login:", error);
        res.status(500).json({ success: false, message: 'Error del servidor al iniciar sesión' });
    }
};