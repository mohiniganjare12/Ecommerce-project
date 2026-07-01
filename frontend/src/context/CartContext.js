import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchCart();
    else setCart({ items: [] });
  }, [user]);

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch (e) { console.error(e); }
  };

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await api.post('/cart/add', { productId, quantity });
    setCart(data);
  };

  const updateQuantity = async (productId, quantity) => {
    const { data } = await api.put('/cart/update', { productId, quantity });
    setCart(data);
  };

  const removeFromCart = async (productId) => {
    const { data } = await api.delete(`/cart/remove/${productId}`);
    setCart(data);
  };

  const clearCart = async () => {
    await api.delete('/cart/clear');
    setCart({ items: [] });
  };

  const cartTotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, cartTotal, cartCount, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
