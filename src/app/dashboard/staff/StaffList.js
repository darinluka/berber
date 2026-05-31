"use client";

import { useState } from "react";
import { createStaff, updateStaff } from "@/app/actions/staff";

export default function StaffList({ initialStaff, salonId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for staff to immediately show updates
  const [staffList, setStaffList] = useState(initialStaff || []);

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (staff = null) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email") || undefined,
      role: formData.get("role"),
      image: formData.get("image") || undefined,
    };

    try {
      if (editingStaff) {
        const res = await updateStaff(editingStaff.id, data, salonId);
        if (res.success) {
          setStaffList(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...data } : s));
          setIsModalOpen(false);
          alert("Stafi u përditësua me sukses!");
        } else {
          alert(res.error || "Përditësimi dështoi.");
        }
      } else {
        const res = await createStaff(data, salonId);
        if (res.success) {
          const newStaffMember = {
            id: res.staff.id,
            name: res.staff.name,
            role: "Barber", 
            email: res.staff.email,
            phone: "I panjohur",
            bookings: 0,
            rating: 0,
            status: "Aktiv",
            image: res.staff.image || "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=200",
            salary: "60,000 L"
          };
          setStaffList(prev => [...prev, newStaffMember]);
          setIsModalOpen(false);
          alert("Stafi i ri u shtua me sukses!");
        } else {
          alert(res.error || "Shtimi dështoi.");
        }
      }
    } catch (error) {
      alert("Ndodhi një gabim gjatë ruajtjes.");
    } finally {
      setIsSaving(false);
    }
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
        
        {filteredStaff.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted">
            <p>Nuk u gjet asnjë berber. Shtoni një berber të ri.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="card modal-box fade-in" style={{ padding: '2.5rem' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 style={{ margin: 0 }}>{editingStaff ? "Edito Berberin" : "Shto Berber të Ri"}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>
            <form onSubmit={handleSaveStaff} className="grid gap-4">
              <div>
                <label className="text-muted" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem' }}>Emri i Plotë</label>
                <input type="text" name="name" className="card" style={{ width: '100%', padding: '0.8rem', background: 'var(--background)' }} defaultValue={editingStaff?.name || ""} required />
              </div>
              {!editingStaff && (
                <div>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem' }}>Email Adresa (Opsionale - për t'i dhënë akses)</label>
                  <input type="email" name="email" className="card" style={{ width: '100%', padding: '0.8rem', background: 'var(--background)' }} placeholder="berberi@email.com" />
                </div>
              )}
              <div>
                <label className="text-muted" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem' }}>Roli / Pozicioni</label>
                <input type="text" name="role" className="card" style={{ width: '100%', padding: '0.8rem', background: 'var(--background)' }} defaultValue={editingStaff?.role || "Master Barber"} required />
              </div>
              <div>
                <label className="text-muted" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem' }}>URL e Fotos (Opsionale)</label>
                <input type="text" name="image" className="card" style={{ width: '100%', padding: '0.8rem', background: 'var(--background)' }} defaultValue={editingStaff?.image || ""} placeholder="https://..." />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" className="btn btn-secondary flex-1" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Anulo</button>
                <button type="submit" className="btn btn-primary flex-1" disabled={isSaving}>
                  {isSaving ? "Duke Ruajtur..." : (editingStaff ? "Ruaj" : "Shto")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
