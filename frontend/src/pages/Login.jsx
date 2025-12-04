import { useState } from 'react';
import { AuthService } from '../api/authService';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await AuthService.login(email, password);
            
            // Pequeño delay para mostrar la animación de carga (UX Premium)
            setTimeout(() => {
                if(data.user.rol === 'COMISION') navigate('/dashboard-comision');
                else if (data.user.rol === 'DOCENTE') navigate('/dashboard-docente');
                else if (data.user.rol === 'DIRECTOR') navigate('/dashboard-director');
                else alert(`Bienvenido ${data.user.rol}.`);
            }, 800);

        } catch (errMsg) {
            setError(errMsg);
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            height: '100vh', width: '100vw', 
            background: 'radial-gradient(circle, #1b2d4a 0%, #020c1b 100%)',
            margin: 0, position: 'fixed', top: 0, left: 0 
        }}>
            <div className="glass-card" style={{ 
                padding: '50px', width: '100%', maxWidth: '420px', 
                textAlign: 'center', position: 'relative', overflow: 'hidden'
            }}>
                {/* Decoración Dorada Superior */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '4px',
                    background: 'linear-gradient(90deg, transparent, #d4af37, transparent)'
                }}></div>

                <div style={{ fontSize: '4rem', marginBottom: '10px', textShadow: '0 0 20px rgba(212,175,55,0.4)' }}>
                    🏛️
                </div>
                
                <h2 style={{ margin: '10px 0 5px 0', fontSize: '3rem' }}>SIED</h2>
                <p style={{ color: '#8892b0', fontSize: '0.9rem', letterSpacing: '2px', marginBottom: '40px', textTransform: 'uppercase' }}>
                    Sistema Integral de Evaluación Docente
                </p>

                {error && (
                    <div style={{ 
                        background: 'rgba(220, 53, 69, 0.1)', border: '1px solid #dc3545', 
                        color: '#ff6b6b', padding: '12px', borderRadius: '4px', 
                        marginBottom: '20px', fontSize: '0.9em', animation: 'fadeInUp 0.3s'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#d4af37', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                            CREDENCIALES
                        </label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="usuario@unac.edu.pe"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '30px', textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#d4af37', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                            CONTRASEÑA
                        </label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            width: '100%', backgroundColor: '#0056b3', fontSize: '1.1rem',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Autenticando...' : 'ACCEDER AL SISTEMA'}
                    </button>
                </form>
                
                <div style={{ marginTop: '40px', fontSize: '0.75rem', color: '#4a5568', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                    UNIVERSIDAD NACIONAL DEL CALLAO<br/>
                    OFICINA DE CALIDAD ACADÉMICA
                </div>
            </div>
        </div>
    );
};

export default Login;