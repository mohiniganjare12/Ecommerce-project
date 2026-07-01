import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => { api.get('/admin/users').then(r => setUsers(r.data)); }, []);

  const toggleRole = async (id, role) => {
    const newRole = role === 'admin' ? 'user' : 'admin';
    await api.put(`/admin/users/${id}`, { role: newRole });
    setUsers(u => u.map(x => x._id === id ? { ...x, role: newRole } : x));
    toast.success('Role updated');
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await api.delete(`/admin/users/${id}`);
    setUsers(u => u.filter(x => x._id !== id));
    toast.success('User deleted');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Manage Users ({users.length})</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <thead style={{ background: '#1a1a2e', color: '#fff' }}>
          <tr>{['Name','Email','Role','Joined','Actions'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem' }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u._id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
              <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{u.name}</td>
              <td style={{ padding: '12px 16px', color: '#555', fontSize: '0.9rem' }}>{u.email}</td>
              <td style={{ padding: '12px 16px' }}>
                <span style={{ background: u.role === 'admin' ? '#e94560' : '#eee', color: u.role === 'admin' ? '#fff' : '#555', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem' }}>
                  {u.role}
                </span>
              </td>
              <td style={{ padding: '12px 16px', color: '#888', fontSize: '0.85rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td style={{ padding: '12px 16px', display: 'flex', gap: '6px' }}>
                <button onClick={() => toggleRole(u._id, u.role)} style={{ padding: '6px 10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                  {u.role === 'admin' ? 'Make User' : 'Make Admin'}
                </button>
                <button onClick={() => deleteUser(u._id)} style={{ padding: '6px 10px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
