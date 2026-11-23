"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../services/api';
import "./registro.css";

export default function Registro() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const nombre = e.target.nombre.value.trim();
    const email = e.target.email.value.trim().toLowerCase();
    const password = e.target.password.value;
    
    // Validaciones
    if (!nombre || !email || !password) {
      setError('Todos los campos son obligatorios');
      return;
    }
    
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!email.includes('@')) {
      setError('Ingresa un email válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Enviar petición al backend
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nombre, 
          email, 
          contraseña: password 
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Guardar token y datos del usuario
        const { token, usuario } = data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(usuario));
        localStorage.setItem('user_id', usuario.id);
        
        // Mostrar mensaje de éxito
        alert(`¡Registro exitoso!\nBienvenido/a ${nombre}`);
        
        // Redirigir a la página de inicio
        router.push('/inicio');
      } else {
        setError(data.mensaje || 'Error al registrar usuario');
      }
    } catch (error) {
      console.error("Error de registro:", error);
      setError('Error de conexión. Verifica que el backend esté disponible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-card">
        <h1 className="registro-title">REGISTRAR</h1>
        
        <div className="login-link">
          <span>¿Ya estás registrado?</span>
          <button 
            type="button"
            onClick={() => router.push('/')}
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
            Iniciar sesión aquí
          </button>
        </div>
        
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
        
        <form onSubmit={handleSubmit} className="registro-form">
          
          <div className="form-group">
            <label className="form-label">Nombre completo</label>
            <input
              type="text"
              name="nombre"
              className="form-input"
              placeholder="Ingresa tu nombre completo"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="ejemplo@email.com"
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
              placeholder="Contraseña"
              minLength="6"
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="registro-button"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#ccc' : '',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Registrando...
              </>
            ) : (
              'Registrarse'
            )}
          </button>
          
        </form>
      </div>
    </div>
  );
}