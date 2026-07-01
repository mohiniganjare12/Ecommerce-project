// Admin Products
import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', category: '', stock: '', description: '' });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => { api.get('/products?limit=50').then(r => setProducts(r.data.products)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const { data } = await api.put(`/products/${editId}`, form);
        setProducts(p => p.map(x => x._id === editId ? data : x));
        toast.success('Product updated');
      } else {
        const { data } = await api.post('/products', form);
        setProducts(p => [...p, data]);
        toast.success('Product created');
      }
      setForm({ name: '', price: '', category: '', stock: '', description: '' });
      setShowForm(false); setEditId(null);
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    setProducts(p => p.filter(x => x._id !== id));
    toast.success('Deleted');
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, price: p.price, category: p.category, stock: p.stock, description: p.description });
    setEditId(p._id); setShowForm(true);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2>Manage Products</h2>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name:'',price:'',category:'',stock:'',description:'' }); }}
          style={{ background: '#e94560', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
          + Add Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[['name','Product Name'],['price','Price'],['category','Category'],['stock','Stock']].map(([f, p]) => (
            <input key={f} type={f === 'price' || f === 'stock' ? 'number' : 'text'} placeholder={p} value={form[f]} required
              onChange={e => setForm({ ...form, [f]: e.target.value })}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
          ))}
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', gridColumn: '1/-1', minHeight: '80px' }} />
          <button type="submit" style={{ background: '#e94560', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', gridColumn: '1/-1' }}>
            {editId ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <thead style={{ background: '#1a1a2e', color: '#fff' }}>
          <tr>{['Image','Name','Category','Price','Stock','Rating','Actions'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem' }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={p._id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
              <td style={{ padding: '12px 16px' }}><img src={p.images?.[0]?.url || 'https://via.placeholder.com/40'} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} /></td>
              <td style={{ padding: '12px 16px', fontWeight: 'bold', fontSize: '0.9rem' }}>{p.name}</td>
              <td style={{ padding: '12px 16px', color: '#888', fontSize: '0.85rem' }}>{p.category}</td>
              <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>${p.price}</td>
              <td style={{ padding: '12px 16px' }}><span style={{ color: p.stock <= 5 ? '#e74c3c' : '#2ecc71', fontWeight: 'bold' }}>{p.stock}</span></td>
              <td style={{ padding: '12px 16px' }}>⭐ {p.rating?.toFixed(1)}</td>
              <td style={{ padding: '12px 16px', display: 'flex', gap: '6px' }}>
                <button onClick={() => handleEdit(p)} style={{ padding: '6px 12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                <button onClick={() => handleDelete(p._id)} style={{ padding: '6px 12px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
