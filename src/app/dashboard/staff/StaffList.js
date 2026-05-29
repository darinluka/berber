"use client";

import { useState } from "react";

export default function StaffList({ initialStaff, salonId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const filteredStaff = initialStaff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (staff = null) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ fontSize: '2rem' }}>Menaxhimi i Stafit</h1>
          <p className="text-muted">Shtoni, edito dhe ndiqni performancën e berberëve tuaj.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Shto Berber të Ri</button>
      </div>

      {/* Search & Filter */}
      <div className="card mb-8">
        <div className="flex gap-4 items-center">
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            <input 
              type="text" 
              placeholder="Kërko berber me emër..." 
              className="input" 
              style={{ width: '100%', paddingLeft: '3rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="card" style={{ width: '200px', padding: '0.8rem' }}>
            <option>Të gjithë (Aktivë)</option>
            <option>Pushim</option>
          </select>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-3 gap-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {filteredStaff.map((member) => (
          <div key={member.id} className="card hover-row">
            <div className="flex flex-col items-center text-center mb-6">
              <div style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                backgroundImage: `url(${member.image || "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=200"})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '3px solid var(--border)',
                marginBottom: '1rem'
              }}></div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{member.name}</h3>
                <p className="text-primary" style={{ fontWeight: 600, fontSize: '0.85rem' }}>{member.role || "Master Barber"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 text-center" style={{ background: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <p className="text-muted" style={{ fontSize: '0.65rem', fontWeight: 700 }}>REZERVIME</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{member.bookings}</p>
              </div>
              <div className="p-3 text-center" style={{ background: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <p className="text-muted" style={{ fontSize: '0.65rem', fontWeight: 700 }}>RATING</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>⭐ {member.rating}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="btn btn-secondary flex-1" onClick={() => openModal(member)}>Edito</button>
              <button className="btn btn-secondary flex-1" onClick={() => alert("Hapja e analitikave...")}>Analitika</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="card modal-box fade-in" style={{ padding: '2.5rem' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 style={{ margin: 0 }}>{editingStaff ? "Edito Berberin" : "Shto Berber të Ri"}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); alert("Stafi u përditësua!"); }} className="grid gap-4">
              <div>
                <label className="text-muted" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem' }}>Emri i Plotë</label>
                <input type="text" className="card" style={{ width: '100%', padding: '0.8rem', background: 'var(--background)' }} defaultValue={editingStaff?.name || ""} required />
              </div>
              <div>
                <label className="text-muted" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem' }}>Roli / Pozicioni</label>
                <input type="text" className="card" style={{ width: '100%', padding: '0.8rem', background: 'var(--background)' }} defaultValue={editingStaff?.role || "Master Barber"} required />
              </div>
              <div>
                <label className="text-muted" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem' }}>URL e Fotos (Opsionale)</label>
                <input type="text" className="card" style={{ width: '100%', padding: '0.8rem', background: 'var(--background)' }} placeholder="https://..." />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" className="btn btn-secondary flex-1" onClick={() => setIsModalOpen(false)}>Anulo</button>
                <button type="submit" className="btn btn-primary flex-1">{editingStaff ? "Ruaj" : "Shto"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
