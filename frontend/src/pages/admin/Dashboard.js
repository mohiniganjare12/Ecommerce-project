import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../utils/api';

const COLORS = ['#e94560', '#0f3460', '#16213e', '#533483', '#2ecc71'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);

  useEffect(() => {
    api.get('/analytics/dashboard').then(r => setStats(r.data));
    api.get('/analytics/revenue').then(r => setRevenue(r.data.map(d => ({
      name: `${d._id.year}-${String(d._id.month).padStart(2,'0')}`,
      revenue: d.revenue, orders: d.orders
    }))));
    api.get('/analytics/top-products').then(r => setTopProducts(r.data));
    api.get('/analytics/orders-status').then(r => setOrderStatus(r.data));
  }, []);

  if (!stats) return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;

  const cards = [
    { label: 'Total Revenue', value: `$${stats.totalRevenue?.toFixed(2)}`, sub: `+$${stats.monthRevenue?.toFixed(2)} this month`, color: '#e94560' },
    { label: 'Total Orders', value: stats.totalOrders, sub: `+${stats.monthOrders} this month`, color: '#0f3460' },
    { label: 'Total Users', value: stats.totalUsers, sub: `+${stats.monthUsers} this month`, color: '#533483' },
    { label: 'Products', value: stats.totalProducts, sub: `${stats.lowStockProducts} low stock`, color: '#2ecc71' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Admin Dashboard</h2>
        <div style={styles.navLinks}>
          <Link to="/admin/products" style={styles.navLink}>Products</Link>
          <Link to="/admin/orders" style={styles.navLink}>Orders</Link>
          <Link to="/admin/users" style={styles.navLink}>Users</Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.cards}>
        {cards.map(c => (
          <div key={c.label} style={{ ...styles.card, borderTop: `4px solid ${c.color}` }}>
            <p style={styles.cardLabel}>{c.label}</p>
            <p style={{ ...styles.cardValue, color: c.color }}>{c.value}</p>
            <p style={styles.cardSub}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div style={styles.chartBox}>
        <h3>Revenue Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(v) => [`$${v}`, 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="#e94560" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.row}>
        {/* Top Products */}
        <div style={styles.chartBox}>
          <h3>Top Selling Products</h3>
          {topProducts.slice(0, 5).map((p, i) => (
            <div key={p._id} style={styles.topItem}>
              <span style={styles.rank}>#{i + 1}</span>
              <span style={styles.topName}>{p.name}</span>
              <span style={styles.topSold}>{p.sold} sold</span>
              <span style={styles.topRating}>⭐ {p.rating?.toFixed(1)}</span>
            </div>
          ))}
        </div>

        {/* Orders by Status */}
        <div style={styles.chartBox}>
          <h3>Orders by Status</h3>
          <PieChart width={300} height={220}>
            <Pie data={orderStatus} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={e => `${e._id}: ${e.count}`}>
              {orderStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  navLinks: { display: 'flex', gap: '1rem' },
  navLink: { background: '#1a1a2e', color: '#fff', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.5rem', marginBottom: '2rem' },
  card: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  cardLabel: { color: '#888', fontSize: '0.85rem', marginBottom: '8px' },
  cardValue: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '4px' },
  cardSub: { color: '#aaa', fontSize: '0.8rem' },
  chartBox: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '1.5rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  topItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '10px 0', borderBottom: '1px solid #f0f0f0' },
  rank: { color: '#e94560', fontWeight: 'bold', width: '24px' },
  topName: { flex: 1, fontSize: '0.9rem' },
  topSold: { color: '#888', fontSize: '0.85rem' },
  topRating: { fontSize: '0.85rem' },
};
