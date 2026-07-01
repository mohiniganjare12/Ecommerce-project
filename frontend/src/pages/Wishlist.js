import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState({ products: [] });
  const { addToCart } = useCart();

  useEffect(() => { api.get('/wishlist').then(r => setWishlist(r.data)); }, []);

  const remove = async (id) => {
    await api.post(`/wishlist/toggle/${id}`);
    setWishlist(w => ({ ...w, products: w.products.filter(p => p._id !== id) }));
    toast.info('Removed from wishlist');
  };

  const moveToCart = async (id) => {
    await addToCart(id); await remove(id);
    toast.success('Moved to cart!');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
      <h2>My Wishlist ({wishlist.products?.length} items)</h2>
      {!wishlist.products?.length && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#888' }}>Your wishlist is empty</p>
          <Link to="/products" style={{ color: '#e94560', textDecoration: 'none', fontWeight: 'bold' }}>Browse Products</Link>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        {wishlist.products?.map(p => (
          <div key={p._id} style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
            <img src={p.images?.[0]?.url || 'https://via.placeholder.com/200'} alt={p.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
            <div style={{ padding: '1rem' }}>
              <Link to={`/products/${p._id}`} style={{ fontWeight: 'bold', color: '#1a1a2e', textDecoration: 'none', fontSize: '0.9rem' }}>{p.name}</Link>
              <p style={{ color: '#e94560', fontWeight: 'bold', margin: '8px 0' }}>${p.price?.toFixed(2)}</p>
              <button onClick={() => moveToCart(p._id)} style={{ width: '100%', padding: '8px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '6px', fontSize: '0.85rem' }}>
                Move to Cart
              </button>
              <button onClick={() => remove(p._id)} style={{ width: '100%', padding: '8px', background: 'transparent', color: '#e94560', border: '1px solid #e94560', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
