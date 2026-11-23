"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../services/api';
import "./login.css";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const usuario = e.target.username.value.trim().toLowerCase();
    const password = e.target.password.value;
    
    // Validaciones básicas
    if (!usuario || !password) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Enviar petición al backend
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: usuario,
          contraseña: password
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Guardar token y datos del usuario
        const { token, usuario: userData } = data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('user_id', userData.id);
        
        // Redirigir a la página de inicio
        router.push('/inicio');
      } else {
        setError(data.mensaje || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error("Error de login:", error);
      setError('Error de conexión. Verifica que el backend esté disponible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">INICIAR SESIÓN</h1>
        <p className="login-subtitle">Ingresa con tu usuario y contraseña</p>
        
        {error && (
          <div className="error-message" style={{
            color: '#721c24',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          
          <div className="form-group">
            <label className="form-label">Ingresar Email</label>
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="tuemail@ejemplo.com"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Tu contraseña"
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#ccc' : '',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Iniciando sesión...
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
          
          <div className="register-link">
            ¿No tienes cuenta? 
            <button 
              type="button" 
              onClick={() => router.push('/registro')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2575fc',
                cursor: 'pointer',
                fontWeight: 'bold',
                padding: 0,
                marginLeft: '5px',
                textDecoration: 'underline',
                fontSize: '14px'
              }}
              disabled={loading}
            >
              Regístrate
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}