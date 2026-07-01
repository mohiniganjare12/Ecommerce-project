// Profile.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.put('/auth/profile', { name: form.name, phone: form.phone, ...(form.password && { password: form.password }) });
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '0 1rem' }}>
      <h2>My Profile</h2>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        <p style={{ color: '#888', marginBottom: '1.5rem' }}>Email: {user?.email}</p>
        <form onSubmit={handleSubmit}>
          {[['name','Name','text'],['phone','Phone','tel'],['password','New Password (optional)','password'],['confirm','Confirm Password','password']].map(([f, p, t]) => (
            <input key={f} type={t} placeholder={p} value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })}
              style={{ display: 'block', width: '100%', padding: '12px', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
          ))}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
