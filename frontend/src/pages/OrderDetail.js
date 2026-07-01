// OrderDetail.js
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => { api.get(`/orders/${id}`).then(r => setOrder(r.data)); }, [id]);
  if (!order) return <div style={{ padding: '2rem' }}>Loading...</div>;

  const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStep = statusSteps.indexOf(order.orderStatus);

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <h2>Order #{order._id.slice(-8).toUpperCase()}</h2>

      {/* Tracking timeline */}
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2rem 0', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '16px', left: '10%', right: '10%', height: '3px', background: '#eee', zIndex: 0 }} />
        {statusSteps.map((step, i) => (
          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: i <= currentStep ? '#e94560' : '#ddd', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {i < currentStep ? '✓' : i + 1}
            </div>
            <p style={{ fontSize: '0.75rem', marginTop: '6px', color: i <= currentStep ? '#e94560' : '#aaa', textTransform: 'capitalize' }}>{step}</p>
          </div>
        ))}
      </div>

      {/* Items */}
      <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Items Ordered</h3>
        {order.orderItems?.map(item => (
          <div key={item._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <img src={item.image} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
            <div style={{ flex: 1 }}><p style={{ fontWeight: 'bold' }}>{item.name}</p><p style={{ color: '#888' }}>Qty: {item.quantity}</p></div>
            <p style={{ fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '12px' }}>
          <h3>Shipping Address</h3>
          <p>{order.shippingAddress?.street}</p>
          <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
          <p>{order.shippingAddress?.country}</p>
          {order.trackingNumber && <p style={{ marginTop: '1rem' }}>Tracking: <strong>{order.trackingNumber}</strong></p>}
        </div>
        <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '12px' }}>
          <h3>Payment Summary</h3>
          {[['Subtotal', `$${order.itemsPrice?.toFixed(2)}`], ['Shipping', `$${order.shippingPrice?.toFixed(2)}`], ['Tax', `$${order.taxPrice?.toFixed(2)}`], ['Total', `$${order.totalPrice?.toFixed(2)}`]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: l !== 'Total' ? '1px solid #eee' : 'none', fontWeight: l === 'Total' ? 'bold' : 'normal' }}>
              <span>{l}</span><span>{v}</span>
            </div>
          ))}
          <p style={{ marginTop: '8px', color: order.isPaid ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
            {order.isPaid ? `✓ Paid on ${new Date(order.paidAt).toLocaleDateString()}` : '✗ Not Paid'}
          </p>
        </div>
      </div>
    </div>
  );
}
