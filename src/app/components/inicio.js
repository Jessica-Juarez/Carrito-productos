"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { readStoredUser, readStoredValue, useHydrated } from '../../services/browserSession';
import "./inicio.css";

export default function Inicio() {
  const [user] = useState(readStoredUser);
  const [cart, setCart] = useState(() => (
    user?.id ? readStoredValue(`cart_${user.id}`, []) : []
  ));
  const [showCartModal, setShowCartModal] = useState(false);
  const [showForumModal, setShowForumModal] = useState(false);
  const router = useRouter();
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated && !user) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/');
    }
  }, [hydrated, router, user]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart));
    }
  }, [cart, user]);

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
      const price = parseFloat(item.precio.replace('MX$', '').replace(',', ''));
      return total + (price * item.cantidad);
    }, 0).toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    });
  };

  const productos = useMemo(() => {
    const productosFijos = [
      {
        nombre: "Audifonos Apple",
        precio: "MX$12,999",
        imagen: "https://m.media-amazon.com/images/I/81S533RgkwL._AC_UF350,350_QL80_.jpg"
      },
      {
        nombre: "Audifonos Airpods",
        precio: "MX$2,380",
        imagen: "https://mobomx.vtexassets.com/arquivos/ids/209306-800-auto?v=638483692297530000&width=800&height=auto&aspect=true"
      },
      {
        nombre: "Apple iPhone 17",
        precio: "MX$30,999",
        imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStapZyknZOP3Lm6teC024aEIZzS7Itb9W6Iw&s"
      },
      {
        nombre: "Apple Watch s10",
        precio: "MX$11,999",
        imagen: "https://macstoreonline.com.mx/img/sku/watch454_FZ.jpg"
      },
      {
        nombre: "Apple iPad a16",
        precio: "MX$14,999",
        imagen: "https://macstoreonline.com.mx/img/sku/ipadapp780_FZ.jpg"
      },
      {
        nombre: "Apple MacBook",
        precio: "MX$59,999",
        imagen: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/mba13-skyblue-select-202503?wid=892&hei=820&fmt=jpeg&qlt=90&.v=M2RyY09CWXlTQUp1KzEveHR6VXNxcTQ1bzN1SitYTU83Mm9wbk1xa1lWN2h4SGtCQ2R3aStVaDRhL2VUV1NjdkJkRlpCNVhYU3AwTldRQldlSnpRa0lIV0Fmdk9rUlVsZ3hnNXZ3K3lEVlk"
      },
    ];
    const productosUsuario = user?.id
      ? readStoredValue(`userProducts_${user.id}`, [])
      : [];
    return [...productosFijos, ...productosUsuario];
  }, [user]);

  if (!hydrated) {
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
      {/* Header con título y usuario */}
      <header className="header">
        <h1 className="title">INICIO</h1>
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
          
          {/* Carrito en header */}
          <div className="cart-info" onClick={() => setShowCartModal(true)}>
            <img 
              src="https://cdn-icons-png.flaticon.com/512/3144/3144456.png" 
              alt="Carrito"
              className="cart-icon"
            />
            <span className="cart-count">{cart.reduce((sum, item) => sum + item.cantidad, 0)}</span>
            <span className="cart-total">Total: {calculateTotal()}</span>
          </div>
        </div>
      </header>

      {/* Barra de navegación con FORO y AGREGAR - CORREGIDO */}
      <nav className="navbar">
        <button className="nav-btn active">INICIO</button>
        <button className="nav-btn" onClick={() => router.push('/foro')}>FORO</button>
        <button className="nav-btn" onClick={() => router.push('/agregar')}>AGREGAR</button>
      </nav>

      {/* Grid de productos con imágenes reales */}
      <main className="product-grid">
        {productos.map((producto, index) => (
          <div key={index} className="product-card">
            <div className="product-image-container">
              <img 
                src={producto.imagen} 
                alt={producto.nombre}
                className="product-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/300x300/cccccc/666666?text=Imagen+no+disponible";
                }}
              />
            </div>
            <h2 className="product-name">{producto.nombre}</h2>
            <p className="product-price">{producto.precio}</p>
            <button 
              className="add-to-cart" 
              onClick={() => addToCart(producto)}
            >
              <img 
                src="https://cdn-icons-png.flaticon.com/512/263/263142.png" 
                alt="Agregar al carrito"
                className="cart-add-icon"
              />
              Agregar al carrito
            </button>
          </div>
        ))}
      </main>

      {/* Modal del Carrito */}
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
                        src={item.imagen || productos.find(p => p.nombre === item.nombre)?.imagen || "https://via.placeholder.com/50x50/cccccc/666666?text=Prod"} 
                        alt={item.nombre}
                        className="cart-item-image"
                      />
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.nombre}</span>
                        <span className="cart-item-price">{item.precio}</span>
                      </div>
                    </div>
                    <div className="cart-item-right">
                      <span className="cart-item-quantity">x{item.cantidad}</span>
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

      {/* Modal del Foro */}
      {showForumModal && (
        <div className="forum-modal">
          <div className="modal-content">
            <h2>
              <img 
                src="https://cdn-icons-png.flaticon.com/512/2462/2462719.png" 
                alt="Foro"
                className="forum-icon"
              />
              Foro de Discusión
              <button className="close-modal" onClick={() => setShowForumModal(false)}>×</button>
            </h2>
            <div className="forum-content">
              <p>¡Bienvenido al foro de la tienda Apple!</p>
              <p>Comparte tus experiencias, haz preguntas y discute sobre nuestros productos.</p>
              
              <div className="forum-messages">
                <div className="message">
                  <div className="message-header">
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" 
                      alt="Usuario"
                      className="message-avatar"
                    />
                    <span className="message-author">Carlos López</span>
                  </div>
                  <p className="message-text">¿Alguien ha probado los nuevos AirPods Pro? ¿Vale la pena la inversión?</p>
                </div>
                <div className="message">
                  <div className="message-header">
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/4323/4323005.png" 
                      alt="Usuario"
                      className="message-avatar"
                    />
                    <span className="message-author">Ana García</span>
                  </div>
                  <p className="message-text">Excelente calidad en todos los productos Apple. El MacBook es increíble para trabajo.</p>
                </div>
              </div>
              
              <div className="forum-input">
                <textarea placeholder="Escribe tu mensaje aquí..." rows="3"></textarea>
                <button>
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/786/786205.png" 
                    alt="Enviar"
                    className="send-icon"
                  />
                  Enviar Mensaje
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}