import { useState } from 'react';
import { AuthService } from '../api/authService';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Hook para redirigir a otra pagina

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const data = await AuthService.login(email, password);
            
            // Si llegamos aquí, el login fue exitoso.
            // Redirigimos según el rol (Por ahora todos van a evaluación)
            console.log("Usuario logueado:", data.user);
            
            if(data.user.rol === 'COMISION') {
                navigate('/dashboard-comision');
            } else if (data.user.rol === 'DOCENTE') {  
                navigate('/dashboard-docente');
            } else {
                // Aquí pondremos más rutas luego (ej: /mis-resultados para docentes)
                alert(`Bienvenido ${data.user.rol}. Tu módulo está en construcción.`);
            }

        } catch (errMsg) {
            setError(errMsg);
        }
    };

    return (
        <div style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            height: '100vh', backgroundColor: '#f0f2f5' 
        }}>
            <div style={{ 
                backgroundColor: 'white', padding: '40px', borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' 
            }}>
                <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>
                    SIED v2.0 <br/><span style={{fontSize: '0.6em', color: '#666'}}>Acceso Institucional</span>
                </h2>

                {error && (
                    <div style={{ 
                        backgroundColor: '#ffebee', color: '#c62828', 
                        padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9em' 
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Correo Electrónico</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            placeholder="ej. comision@unac.edu.pe"
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Contraseña</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            placeholder="••••••"
                        />
                    </div>

                    <button 
                        type="submit" 
                        style={{ 
                            width: '100%', padding: '12px', backgroundColor: '#0056b3', 
                            color: 'white', border: 'none', borderRadius: '4px', 
                            fontSize: '16px', cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        Ingresar
                    </button>
                </form>
                
                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8em', color: '#888' }}>
                    © 2025 Universidad Nacional del Callao
                </p>
            </div>
        </div>
    );
};

export default Login;