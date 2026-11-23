"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import "./foro.css";

export default function Foro() {
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (!token || !savedUser) {
      router.push('/');
      return;
    }

    try {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Cargar comentarios del foro desde localStorage
      const savedComments = localStorage.getItem('forumComments');
      if (savedComments) {
        setComments(JSON.parse(savedComments));
      }
      
      // Cargar carrito del usuario si existe
      const savedCart = localStorage.getItem(`cart_${userData.id}`);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Error de autenticación:", error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart));
    }
  }, [cart, user]);

  const handleAddComment = () => {
    if (!newComment.trim()) {
      alert("Por favor, escribe un comentario");
      return;
    }

    // Evitar comentarios de prueba
    if (newComment.length < 5) {
      alert("El comentario debe tener al menos 5 caracteres");
      return;
    }

    const newCommentObj = {
      id: Date.now(),
      userId: user.id || user.email,
      user: user.nombre || user.name || user.email,
      avatar: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png",
      comment: newComment,
      date: new Date().toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const updatedComments = [newCommentObj, ...comments];
    setComments(updatedComments);
    localStorage.setItem('forumComments', JSON.stringify(updatedComments));
    setNewComment('');
    
    if (typeof document !== 'undefined') {
      const commentsSection = document.getElementById('comments-section');
      if (commentsSection) {
        commentsSection.scrollTop = 0;
      }
    }
  };

  // Función para borrar un comentario
  const handleDeleteComment = (commentId, commentUserId) => {
    // Verificar si el usuario actual es el dueño del comentario
    const currentUserId = user.id || user.email;
    
    if (currentUserId !== commentUserId) {
      alert("Solo puedes eliminar tus propios comentarios");
      return;
    }
    
    if (confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
      const updatedComments = comments.filter(comment => comment.id !== commentId);
      setComments(updatedComments);
      localStorage.setItem('forumComments', JSON.stringify(updatedComments));
    }
  };

  // Función para editar un comentario
  const handleEditComment = (commentId, commentUserId, currentText) => {
    // Verificar si el usuario actual es el dueño del comentario
    const currentUserId = user.id || user.email;
    
    if (currentUserId !== commentUserId) {
      alert("Solo puedes editar tus propios comentarios");
      return;
    }
    
    const newText = prompt("Edita tu comentario:", currentText);
    
    if (newText !== null && newText.trim() !== "" && newText !== currentText) {
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          return { 
            ...comment, 
            comment: newText,
            date: new Date().toLocaleString('es-MX', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }) + " (editado)"
          };
        }
        return comment;
      });
      
      setComments(updatedComments);
      localStorage.setItem('forumComments', JSON.stringify(updatedComments));
    }
  };

  const addToCart = (product) => {
    const existingProductIndex = cart.findIndex(item => item.nombre === product.nombre);
    
    if (existingProductIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingProductIndex].cantidad += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, cantidad: 1 }]);
    }
  };

  const removeFromCart = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.precio?.replace('MX$', '')?.replace(',', '') || '0');
      return total + (price * (item.cantidad || 1));
    }, 0).toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="inicio-container">
      {/* Header con título y usuario - IDÉNTICO A INICIO.JS */}
      <header className="header">
        <h1 className="title">FORO</h1>
        <div className="user-section">
          <div className="user-profile">
            <div className="profile-icon">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" 
                alt="Usuario"
                className="profile-image"
              />
            </div>
            <div className="profile-info">
              <span className="user-name">{user.nombre || user.name || user.email}</span>
              <button 
                className="logout-btn" 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  router.push('/');
                }}
              >
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/1828/1828427.png" 
                  alt="Cerrar sesión"
                  className="logout-icon"
                />
                Cerrar sesión
              </button>
            </div>
          </div>
          
          {/* Carrito en header - IDÉNTICO A INICIO.JS */}
          <div className="cart-info" onClick={() => setShowCartModal(true)}>
            <img 
              src="https://cdn-icons-png.flaticon.com/512/3144/3144456.png" 
              alt="Carrito"
              className="cart-icon"
            />
            <span className="cart-count">{cart.reduce((sum, item) => sum + (item.cantidad || 1), 0)}</span>
            <span className="cart-total">Total: {calculateTotal()}</span>
          </div>
        </div>
      </header>

      {/* Barra de navegación - IDÉNTICA A INICIO.JS - CORREGIDO */}
      <nav className="navbar">
        <button className="nav-btn" onClick={() => router.push('/inicio')}>INICIO</button>
        <button className="nav-btn active">FORO</button>
        <button className="nav-btn" onClick={() => router.push('/agregar')}>AGREGAR</button>
      </nav>

      {/* Contenido principal del foro */}
      <main className="foro-content">
        <div className="foro-title-section">
          <h1 className="foro-main-title"> 
            Foro de Discusión
          </h1>
        </div>

        {/* Panel de escribir comentario */}
        <div className="comment-writer">
          <div className="writer-header">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" 
              alt="Usuario"
              className="writer-avatar"
            />
            <div className="writer-info">
              <span className="writer-name">{user.nombre || user.name || user.email}</span>
              <span className="writer-label">Escribe tu comentario</span>
            </div>
          </div>
          
          <textarea
            className="comment-input"
            placeholder="Comparte tus experiencias, haz preguntas y discute sobre nuestros productos..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows="4"
          />
          
          <div className="comment-actions">
            <button 
              className="cancel-btn"
              onClick={() => setNewComment('')}
            >
              Cancelar
            </button>
            <button 
              className="submit-btn"
              onClick={handleAddComment}
            >
              <img 
                src="https://cdn-icons-png.flaticon.com/512/786/786205.png" 
                alt="Enviar"
                className="send-icon"
              />
              Publicar Comentario
            </button>
          </div>
        </div>

        {/* Lista de comentarios */}
        <div className="comments-section" id="comments-section">
          <h2 className="comments-title">
            Comentarios ({comments.length})
          </h2>
          
          {comments.length === 0 ? (
            <div className="no-comments">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/2462/2462719.png" 
                alt="Foro vacío"
                className="no-comments-icon"
              />
              <p>¡Sé el primero en comentar!</p>
            </div>
          ) : (
            <div className="comments-list">
              {comments.map((comment) => {
                const isCurrentUser = (user.id || user.email) === comment.userId;
                
                return (
                  <div key={comment.id} className={`comment-card ${isCurrentUser ? 'your-comment-highlight' : ''}`}>
                    <div className="comment-header">
                      <div className="comment-user">
                        <img 
                          src={comment.avatar} 
                          alt={comment.user}
                          className="comment-avatar"
                        />
                        <div className="comment-user-info">
                          <span className="comment-user-name">{comment.user} {isCurrentUser && <span className="your-comment">(Tú)</span>}</span>
                          <span className="comment-date">{comment.date}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="comment-body">
                      <p className="comment-text">{comment.comment}</p>
                    </div>
                    
                    {/* Botón de Borrar Comentario - SOLO para el usuario actual */}
                    {isCurrentUser && (
                      <div className="comment-footer">
                        <button 
                          className="edit-comment-btn"
                          onClick={() => handleEditComment(comment.id, comment.userId, comment.comment)}
                        >
                          <img 
                            src="https://cdn-icons-png.flaticon.com/512/1828/1828911.png" 
                            alt="Editar"
                            className="edit-icon"
                          />
                          Editar comentario
                        </button>
                        <button 
                          className="delete-comment-btn"
                          onClick={() => handleDeleteComment(comment.id, comment.userId)}
                        >
                          <img 
                            src="https://cdn-icons-png.flaticon.com/512/3096/3096687.png" 
                            alt="Eliminar"
                            className="delete-icon"
                          />
                          Borrar comentario
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal del Carrito - IDÉNTICO A INICIO.JS */}
      {showCartModal && (
        <div className="cart-modal">
          <div className="modal-content">
            <h2 style={{ color: '#000000' }}>
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3144/3144456.png" 
                alt="Carrito"
                className="modal-cart-icon"
              />
              Carrito de Compras
              <button className="close-modal" onClick={() => setShowCartModal(false)}>×</button>
            </h2>
            <div className="cart-items">
              {cart.length === 0 ? (
                <p className="empty-cart">El carrito está vacío</p>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="cart-item">
                    <div className="cart-item-left">
                      <img 
                        src={item.imagen || "https://via.placeholder.com/50x50/cccccc/666666?text=Prod"} 
                        alt={item.nombre}
                        className="cart-item-image"
                      />
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.nombre}</span>
                        <span className="cart-item-price">{item.precio}</span>
                      </div>
                    </div>
                    <div className="cart-item-right">
                      <span className="cart-item-quantity">x{item.cantidad || 1}</span>
                      <button 
                        className="remove-item" 
                        onClick={() => removeFromCart(index)}
                      >
                        <img 
                          src="https://cdn-icons-png.flaticon.com/512/3096/3096687.png" 
                          alt="Eliminar"
                          className="remove-icon"
                        />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="cart-summary">
              <p className="cart-total-summary">
                Total: <span id="totalPrice">{calculateTotal()}</span>
              </p>
              <div className="cart-buttons">
                <button onClick={() => setShowCartModal(false)}>Seguir Comprando</button>
                <button onClick={() => {
                  alert('¡Compra finalizada! Gracias por tu compra.');
                  setCart([]);
                  setShowCartModal(false);
                }}>
                  Finalizar Compra
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}