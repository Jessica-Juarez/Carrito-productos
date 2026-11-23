"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { readStoredUser, readStoredValue, useHydrated } from '../../services/browserSession';
import "./agregar.css";

export default function Agregar() {
  const [user] = useState(readStoredUser);
  const [cart, setCart] = useState(() => (
    user?.id ? readStoredValue(`cart_${user.id}`, []) : []
  ));
  const [showCartModal, setShowCartModal] = useState(false);
  const router = useRouter();
  const hydrated = useHydrated();

  // Estado para el formulario
  const [productData, setProductData] = useState({
    nombre: '',
    precio: '',
    imagen: '',
    descripcion: ''
  });

  // Estado para productos agregados
  const [userProducts, setUserProducts] = useState(() => (
    user?.id ? readStoredValue(`userProducts_${user.id}`, []) : []
  ));

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

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({
      ...productData,
      [name]: value
    });
  };

  // Agregar nuevo producto
  const handleAddProduct = (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!productData.nombre.trim()) {
      alert("Por favor, ingresa el nombre del producto");
      return;
    }
    
    if (!productData.precio.trim()) {
      alert("Por favor, ingresa el precio del producto");
      return;
    }
    
    if (!productData.imagen.trim()) {
      alert("Por favor, ingresa la URL de la imagen");
      return;
    }

    // Formatear precio
    let precioFormateado = productData.precio;
    if (!precioFormateado.startsWith('MX$')) {
      // Intentar formatear como moneda
      const precioNum = parseFloat(precioFormateado.replace(/[^0-9.-]+/g, ""));
      if (!isNaN(precioNum)) {
        precioFormateado = `MX$${precioNum.toLocaleString('es-MX', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        })}`;
      }
    }

    // Crear nuevo producto
    const newProduct = {
      id: Date.now(),
      nombre: productData.nombre,
      precio: precioFormateado,
      imagen: productData.imagen,
      descripcion: productData.descripcion || '',
      agregadoPor: user.nombre || user.name || user.email,
      fechaAgregado: new Date().toLocaleString('es-MX')
    };

    // Agregar a la lista de productos del usuario
    const updatedProducts = [...userProducts, newProduct];
    setUserProducts(updatedProducts);
    
    // Guardar en localStorage
    if (user?.id) {
      localStorage.setItem(`userProducts_${user.id}`, JSON.stringify(updatedProducts));
    }

    // Mostrar confirmación
    alert(`¡Producto "${productData.nombre}" agregado correctamente!\n\nAhora aparecerá en la página de inicio.`);

    // Resetear formulario
    setProductData({
      nombre: '',
      precio: '',
      imagen: '',
      descripcion: ''
    });
  };

  // Eliminar producto
  const handleDeleteProduct = (productId) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      const updatedProducts = userProducts.filter(product => product.id !== productId);
      setUserProducts(updatedProducts);
      
      if (user?.id) {
        localStorage.setItem(`userProducts_${user.id}`, JSON.stringify(updatedProducts));
      }
      
      alert('Producto eliminado correctamente');
    }
  };

  // Calcular total del carrito
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

  // Eliminar del carrito
  const removeFromCart = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

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
      {/* Header con título y usuario - IDÉNTICO A INICIO.JS */}
      <header className="header">
        <h1 className="title">AGREGAR</h1>
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

      {/* Barra de navegación - IDÉNTICA A INICIO.JS */}
      <nav className="navbar">
        <button className="nav-btn" onClick={() => router.push('/inicio')}>INICIO</button>
        <button className="nav-btn" onClick={() => router.push('/foro')}>FORO</button>
        <button className="nav-btn active">AGREGAR</button>
      </nav>

      {/* Contenido principal - Formulario para agregar productos */}
      <main className="agregar-content">
        <div className="agregar-title-section">
          <h1 className="agregar-main-title">
            Agregar Nuevo Producto
          </h1>
        </div>

        <div className="agregar-container">
          {/* Formulario para agregar producto */}
          <div className="form-container">
            <form onSubmit={handleAddProduct} className="add-product-form">
              <div className="form-group">
                <label htmlFor="nombre">Nombre del Producto:</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={productData.nombre}
                  onChange={handleInputChange}
                  placeholder="producto"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="precio">Precio:</label>
                <input
                  type="text"
                  id="precio"
                  name="precio"
                  value={productData.precio}
                  onChange={handleInputChange}
                  placeholder="precio"
                  required
                />
                <small className="form-hint">precio</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="imagen">URL de la Imagen:</label>
                <input
                  type="url"
                  id="imagen"
                  name="imagen"
                  value={productData.imagen}
                  onChange={handleInputChange}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  required
                />
                <small className="form-hint">Asegúrate de que la URL sea válida y la imagen sea visible</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="descripcion">Descripción (Opcional):</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={productData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Describe el producto, características, colores disponibles, etc."
                  rows="4"
                />
              </div>
              
              <div className="form-buttons">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setProductData({
                    nombre: '',
                    precio: '',
                    imagen: '',
                    descripcion: ''
                  })}
                >
                  Limpiar formulario
                </button>
                <button type="submit" className="submit-btn">
                  Agregar Producto
                </button>
              </div>
            </form>

            {/* Vista previa del producto */}
            {productData.nombre && (
              <div className="product-preview">
                <h3>Vista previa del producto:</h3>
                <div className="preview-card">
                  <div className="preview-image">
                    {productData.imagen ? (
                      <img 
                        src={productData.imagen} 
                        alt="Vista previa" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/300x200/cccccc/666666?text=Imagen+no+disponible";
                        }}
                      />
                    ) : (
                      <div className="no-image">Imagen no cargada</div>
                    )}
                  </div>
                  <div className="preview-info">
                    <h4>{productData.nombre || "Nombre del producto"}</h4>
                    <p className="preview-price">
                      {productData.precio ? (
                        productData.precio.startsWith('MX$') ? productData.precio : `MX$${parseFloat(productData.precio.replace(/[^0-9.-]+/g, "")).toLocaleString('es-MX') || "0"}`
                      ) : "MX$0"}
                    </p>
                    {productData.descripcion && (
                      <p className="preview-description">{productData.descripcion}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lista de productos agregados por el usuario */}
          <div className="user-products-section">
            <h2 className="user-products-title">
              Mis Productos Agregados ({userProducts.length})
            </h2>
            
            {userProducts.length === 0 ? (
              <div className="no-products">
                <p>Aún no has agregado productos</p>
              </div>
            ) : (
              <div className="user-products-list">
                {userProducts.map((product) => (
                  <div key={product.id} className="user-product-card">
                    <div className="user-product-image">
                      <img 
                        src={product.imagen} 
                        alt={product.nombre}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/100x100/cccccc/666666?text=Imagen";
                        }}
                      />
                    </div>
                    <div className="user-product-info">
                      <h4>{product.nombre}</h4>
                      <p className="user-product-price">{product.precio}</p>
                      <p className="user-product-added">
                        Agregado: {product.fechaAgregado}
                      </p>
                      {product.descripcion && (
                        <p className="user-product-description">{product.descripcion}</p>
                      )}
                    </div>
                    <button 
                      className="delete-product-btn"
                      onClick={() => handleDeleteProduct(product.id)}
                      title="Eliminar producto"
                    >
                      <img 
                        src="https://cdn-icons-png.flaticon.com/512/3096/3096687.png" 
                        alt="Eliminar"
                        className="delete-icon"
                      />
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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