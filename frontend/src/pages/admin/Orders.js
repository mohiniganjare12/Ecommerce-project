// Admin Orders
import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const q = filter ? `?status=${filter}` : '';
    api.get(`/orders${q}`).then(r => setOrders(r.data.orders || []));
  }, [filter]);

  const updateStatus = async (id, status, tracking) => {
    try {
      await api.put(`/orders/${id}/status`, { status, trackingNumber: tracking });
      setOrders(o => o.map(x => x._id === id ? { ...x, orderStatus: status } : x));
      toast.success('Status updated');
    } catch { toast.error('Failed'); }
  };

  const statusColor = { pending:'#f39c12',processing:'#3498db',shipped:'#9b59b6',delivered:'#2ecc71',cancelled:'#e74c3c' };

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Manage Orders</h2>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <option value="">All Status</option>
          {['pending','processing','shipped','delivered','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <thead style={{ background: '#1a1a2e', color: '#fff' }}>
          <tr>{['Order ID','Customer','Date','Total','Status','Update'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem' }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {orders.map((o, i) => (
            <tr key={o._id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
              <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.8rem' }}>#{o._id.slice(-8).toUpperCase()}</td>
              <td style={{ padding: '12px 16px' }}><p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{o.user?.name}</p><p style={{ color: '#888', fontSize: '0.8rem' }}>{o.user?.email}</p></td>
              <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#888' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
              <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>${o.totalPrice?.toFixed(2)}</td>
              <td style={{ padding: '12px 16px' }}><span style={{ background: statusColor[o.orderStatus] || '#888', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem' }}>{o.orderStatus}</span></td>
              <td style={{ padding: '12px 16px' }}>
                <select defaultValue={o.orderStatus} onChange={e => updateStatus(o._id, e.target.value)}
                  style={{ padding: '6px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.8rem' }}>
                  {['pending','processing','shipped','delivered','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
