import { useState } from 'react';
import { AuthService } from '../api/authService';
import { useNavigate } from 'react-router-dom';

/**
 * PANTALLA DE ACCESO INSTITUCIONAL (V2.0)
 * Estilo: Royal Navy & Gold
 * UX: Feedback de carga y transiciones suaves.
 */
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Estado para animación de carga
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true); // Iniciamos animación de "Procesando..."

        try {
            // 1. Autenticación Real con el Backend
            const data = await AuthService.login(email, password);
            
            // 2. Simulación de "Handshake de Seguridad" (1.5s)
            // Esto da tiempo al usuario de ver la animación y sentir robustez en el sistema.
            setTimeout(() => {
                if(data.user.rol === 'COMISION') {
                    navigate('/dashboard-comision');
                } else if (data.user.rol === 'DOCENTE') {  
                    navigate('/dashboard-docente');
                } else if (data.user.rol === 'DIRECTOR') {
                    navigate('/dashboard-director');
                } else {
                    alert(`Bienvenido ${data.user.rol}. Módulo en construcción.`);
                    setLoading(false);
                }
            }, 1500);

        } catch (errMsg) {
            // Error real (credenciales mal, red caída)
            setTimeout(() => {
                setError(errMsg);
                setLoading(false);
            }, 500); // Pequeño delay para que no sea un "golpe" visual
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh', 
            width: '100vw',
            // El fondo base ya está en index.css, pero aseguramos centrado perfecto aquí
            position: 'fixed', 
            top: 0, 
            left: 0,
            zIndex: 1000
        }}>
            {/* TARJETA DE CRISTAL (Glassmorphism) */}
            <div className="glass-card" style={{ 
                padding: '3rem', 
                width: '100%', 
                maxWidth: '450px', 
                textAlign: 'center',
                position: 'relative'
            }}>
                
                {/* Encabezado Institucional */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ 
                        fontSize: '5rem', 
                        marginBottom: '1rem',
                        filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.3))'
                    }}>
                        🏛️
                    </div>
                    <h1 style={{ 
                        fontSize: '4rem', 
                        marginBottom: '0.5rem',
                        border: 'none',
                        textShadow: '0 4px 10px rgba(0,0,0,0.5)'
                    }}>
                        SIED
                    </h1>
                    <p style={{ 
                        color: '#8892b0', 
                        letterSpacing: '3px', 
                        textTransform: 'uppercase',
                        fontSize: '0.9rem',
                        borderTop: '1px solid rgba(212, 175, 55, 0.2)',
                        paddingTop: '1rem',
                        display: 'inline-block'
                    }}>
                        Sistema Integral de Evaluación Docente
                    </p>
                </div>

                {/* Mensaje de Error (Animado) */}
                {error && (
                    <div style={{ 
                        background: 'rgba(220, 53, 69, 0.15)', 
                        border: '1px solid #dc3545', 
                        color: '#ff8585', 
                        padding: '12px', 
                        borderRadius: '4px', 
                        marginBottom: '20px', 
                        fontSize: '0.9rem',
                        animation: 'fadeInUp 0.3s ease-out'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                        <label>Credenciales Institucionales</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="usuario@unac.edu.pe"
                            disabled={loading}
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '2.5rem', textAlign: 'left' }}>
                        <label>Clave de Acceso</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            disabled={loading}
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            width: '100%', 
                            fontSize: '1rem',
                            padding: '15px',
                            letterSpacing: '2px',
                            background: loading ? 'rgba(212, 175, 55, 0.1)' : undefined, // Cambio sutil al cargar
                            border: loading ? '1px solid rgba(212, 175, 55, 0.3)' : undefined
                        }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                {/* Pequeño spinner CSS inline para no complicar */}
                                <span style={{
                                    width: '12px', height: '12px', 
                                    border: '2px solid #d4af37', 
                                    borderTopColor: 'transparent', 
                                    borderRadius: '50%', 
                                    display: 'inline-block',
                                    animation: 'spin 1s linear infinite'
                                }}></span>
                                Verificando...
                            </span>
                        ) : 'INICIAR SESIÓN'}
                    </button>
                </form>

                {/* Footer Sutil */}
                <div style={{ 
                    marginTop: '3rem', 
                    fontSize: '0.7rem', 
                    color: '#4a5568',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    paddingTop: '1rem'
                }}>
                    &copy; 2025 UNIVERSIDAD NACIONAL DEL CALLAO<br/>
                    OFICINA DE CALIDAD ACADÉMICA Y ACREDITACIÓN
                </div>
            </div>

            {/* Estilo inline para la animación de rotación del spinner */}
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Login;