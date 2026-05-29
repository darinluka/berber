"use client";

import { useState } from "react";
import { updateUserByAdmin } from "@/app/actions/users";

const ROLE_COLORS = {
  ADMIN:  { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
  SALON_OWNER:  { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  BARBER: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  CLIENT: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
};

export default function UsersList({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "CLIENT"
  });

  const openEdit = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: "", role: user.role });
  };

  const closeEdit = () => { setEditingUser(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateUserByAdmin(editingUser.id, formData);
    if (result.success) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...result.user } : u));
      closeEdit();
    } else {
      alert("Gabim: " + result.error);
    }
    setLoading(false);
  };

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <>
      <div className="fade-in">
        <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ fontSize: '2rem' }}>Menaxhimi i Përdoruesve</h1>
          <p className="text-muted">Të gjithë përdoruesit: Admin, Pronarë, Berberë dhe Klientë.</p>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--surface)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
          {users.length} përdorues gjithsej
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6" style={{ flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Kërko me emër ose email..."
          className="card"
          style={{ flex: 1, minWidth: '200px', background: 'var(--background)', padding: '0.7rem 1rem' }}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div className="flex gap-2">
          {["ALL", "ADMIN", "SALON_OWNER", "BARBER", "CLIENT"].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className="btn btn-secondary"
              style={{
                padding: '0.5rem 0.9rem', fontSize: '0.8rem',
                background: roleFilter === r ? 'var(--primary)' : '',
                color: roleFilter === r ? '#fff' : ''
              }}
            >
              {r === "ALL" ? "Të gjithë" : r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
              <th style={{ padding: '1.25rem' }}>Përdoruesi</th>
              <th style={{ padding: '1.25rem' }}>Email</th>
              <th style={{ padding: '1.25rem' }}>Telefon</th>
              <th style={{ padding: '1.25rem' }}>Roli</th>
              <th style={{ padding: '1.25rem' }}>Regjistruar</th>
              <th style={{ padding: '1.25rem', textAlign: 'right' }}>Veprime</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => {
              const rc = ROLE_COLORS[user.role] || ROLE_COLORS.CLIENT;
              return (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover-row">
                  <td style={{ padding: '1.25rem', fontWeight: 600 }}>{user.name}</td>
                  <td style={{ padding: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email}</td>
                  <td style={{ padding: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.phone || '—'}</td>
                  <td style={{ padding: '1.25rem' }}>
                    <span style={{ padding: '0.2rem 0.7rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, background: rc.bg, color: rc.color }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(user.createdAt).toLocaleDateString('sq-AL')}
                  </td>
                  <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
                      onClick={() => openEdit(user)}
                    >
                      ✏️ Edito
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Nuk u gjet asnjë përdorues.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="card modal-box fade-in" style={{ padding: '2.5rem', maxWidth: '480px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 style={{ margin: 0 }}>✏️ Edito Përdoruesin</h2>
              <button onClick={closeEdit} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>

            {/* User badge */}
            <div style={{ padding: '0.75rem 1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
                {editingUser.name[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{editingUser.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{editingUser.email}</div>
              </div>
            </div>

            <form onSubmit={handleSave} className="grid gap-4">
              <div>
                <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Emri i Plotë</label>
                <input
                  type="text" required
                  className="card"
                  style={{ width: '100%', background: 'var(--background)', padding: '0.8rem' }}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Email (Login)</label>
                <input
                  type="email" required
                  className="card"
                  style={{ width: '100%', background: 'var(--background)', padding: '0.8rem' }}
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>
                  Fjalëkalimi i Ri <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(lëre bosh nëse nuk dëshiron ta ndryshosh)</span>
                </label>
                <input
                  type="password"
                  className="card"
                  style={{ width: '100%', background: 'var(--background)', padding: '0.8rem' }}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Roli</label>
                <select
                  className="card"
                  style={{ width: '100%', background: 'var(--background)', padding: '0.8rem', cursor: 'pointer' }}
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="CLIENT">CLIENT — Klient</option>
                  <option value="BARBER">BARBER — Berber</option>
                  <option value="SALON_OWNER">SALON_OWNER — Pronar Salloni</option>
                  <option value="ADMIN">ADMIN — Super Admin</option>
                </select>
              </div>

              <div className="flex gap-4 mt-4">
                <button type="button" className="btn btn-secondary flex-1" onClick={closeEdit}>Anulo</button>
                <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                  {loading ? "Duke u ruajtur..." : "Ruaj Ndryshimet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
