import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart]       = useState({ items: [] });
  const [cartLoading, setCartLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchCart();
    else setCart({ items: [] });
  }, [user]);

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const { data } = await api.get('/cart');
      setCart(data || { items: [] });
    } catch (e) {
      console.error('fetchCart error:', e);
      setCart({ items: [] });
    } finally {
      setCartLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const { data } = await api.post('/cart/add', { productId, quantity });
      setCart(data);
    } catch (e) {
      console.error('addToCart error:', e);
      throw e;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await api.put('/cart/update', { productId, quantity });
      setCart(data);
    } catch (e) {
      console.error('updateQuantity error:', e);
      throw e;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const { data } = await api.delete(`/cart/remove/${productId}`);
      setCart(data);
    } catch (e) {
      console.error('removeFromCart error:', e);
      throw e;
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      setCart({ items: [] });
    } catch (e) {
      console.error('clearCart error:', e);
      setCart({ items: [] });
    }
  };

  const cartTotal = cart.items?.reduce(
    (sum, item) => sum + ((item.price || item.product?.price || 0) * item.quantity), 0
  ) || 0;

  const cartCount = cart.items?.reduce(
    (sum, item) => sum + item.quantity, 0
  ) || 0;

  return (
    <CartContext.Provider value={{
      cart, cartTotal, cartCount, cartLoading,
      addToCart, updateQuantity, removeFromCart, clearCart, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};