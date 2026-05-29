"use client";

import { useState } from "react";
import { createSalon, updateSalon, deleteSalon, approveSalon, toggleFeaturedSalon } from "@/app/actions/salons";
import ConfirmDialog from "@/app/components/ConfirmDialog";

export default function SalonsList({ initialSalons }) {
  const [salons, setSalons] = useState(initialSalons);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSalon, setEditingSalon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | PENDING | APPROVED
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [salonToDelete, setSalonToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    hours: "09:00 - 21:00",
    logo: "",
    coverImage: "",
    lat: "",
    lng: "",
    googleMapsLink: ""
  });

  const filteredSalons = salons.filter(s => {
    if (statusFilter === "PENDING") return !s.isApproved;
    if (statusFilter === "APPROVED") return s.isApproved;
    return true;
  });

  const pendingCount = salons.filter(s => !s.isApproved).length;

  const openModal = (salon = null) => {
    if (salon) {
      setEditingSalon(salon);
      setFormData({
        name: salon.name,
        address: salon.address || "",
        hours: salon.hours || "09:00 - 21:00",
        logo: salon.logo || "",
        coverImage: salon.coverImage || "",
        lat: salon.lat || "",
        lng: salon.lng || "",
        googleMapsLink: ""
      });
    } else {
      setEditingSalon(null);
      setFormData({ name: "", address: "", hours: "09:00 - 21:00", logo: "", coverImage: "", lat: "", lng: "", googleMapsLink: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSalon(null);
  };

  const searchAddress = async () => {
    if (!formData.address) {
      alert("Ju lutem shkruani një adresë më parë.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address + ", Tirana, Albania")}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setFormData({
          ...formData,
          lat: data[0].lat,
          lng: data[0].lon
        });
      } else {
        alert("Nuk u gjet asnjë koordinatë për këtë adresë. Provoni të jeni më specifik.");
      }
    } catch (error) {
      alert("Gabim gjatë kërkimit të adresës.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Fotoja është shumë e madhe! Maksimumi 3MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result }));
    reader.readAsDataURL(file);
  };

  const extractCoords = (url) => {
    if (!url) return null;
    // Regex for various Google Maps URL formats
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(regex);
    if (match) {
      return { lat: match[1], lng: match[2] };
    }
    
    // Check for place URLs: /place/Name/@lat,lng
    const placeRegex = /place\/[^/]+\/@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const placeMatch = url.match(placeRegex);
    if (placeMatch) {
      return { lat: placeMatch[1], lng: placeMatch[2] };
    }

    return null;
  };

  const handleGoogleMapsLink = (url) => {
    setFormData(prev => ({ ...prev, googleMapsLink: url }));
    const coords = extractCoords(url);
    if (coords) {
      setFormData(prev => ({ ...prev, lat: coords.lat, lng: coords.lng }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = editingSalon
      ? await updateSalon(editingSalon.id, { ...formData, lat: formData.lat ? parseFloat(formData.lat) : null, lng: formData.lng ? parseFloat(formData.lng) : null })
      : await createSalon({ ...formData, lat: formData.lat ? parseFloat(formData.lat) : null, lng: formData.lng ? parseFloat(formData.lng) : null });

    if (result.success) {
      window.location.reload();
    } else {
      alert("Gabim: " + result.error);
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setSalonToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (salonToDelete) {
      const result = await deleteSalon(salonToDelete);
      if (result.success) {
        window.location.reload();
      } else {
        alert("Gabim gjatë fshirjes");
      }
    }
    setDeleteConfirmOpen(false);
    setSalonToDelete(null);
  };

  const handleApprove = async (id, currentStatus) => {
    const result = await approveSalon(id, !currentStatus);
    if (result.success) {
      setSalons(prev => prev.map(s => s.id === id ? { ...s, isApproved: !currentStatus } : s));
    }
  };

  const handleFeature = async (id, currentStatus) => {
    const result = await toggleFeaturedSalon(id, !currentStatus);
    if (result.success) {
      setSalons(prev => prev.map(s => s.id === id ? { ...s, isFeatured: !currentStatus } : s));
    }
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ fontSize: '2rem' }}>Menaxhimi i Salloneve</h1>
          <p className="text-muted">
            Lista e plotë e salloneve të regjistruara.
            {pendingCount > 0 && (
              <span style={{
                marginLeft: '0.75rem', background: 'rgba(245,158,11,0.15)',
                color: 'var(--warning)', padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700
              }}>
                {pendingCount} në pritje
              </span>
            )}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Shto Sallon të Ri</button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "ALL", label: `Të gjitha (${salons.length})` },
          { key: "PENDING", label: `Në Pritje (${pendingCount})` },
          { key: "APPROVED", label: `Aprovuara (${salons.length - pendingCount})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className="btn btn-secondary"
            style={{
              padding: '0.5rem 1.25rem', fontSize: '0.875rem',
              background: statusFilter === tab.key ? 'var(--primary)' : '',
              color: statusFilter === tab.key ? 'white' : ''
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
              <th style={{ padding: '1.25rem' }}>Emri i Sallonit</th>
              <th style={{ padding: '1.25rem' }}>Adresa</th>
              <th style={{ padding: '1.25rem' }}>Stafi</th>
              <th style={{ padding: '1.25rem' }}>Rezervime</th>
              <th style={{ padding: '1.25rem' }}>Statusi</th>
              <th style={{ padding: '1.25rem' }}>Featured</th>
              <th style={{ padding: '1.25rem', textAlign: 'right' }}>Veprime</th>
            </tr>
          </thead>
          <tbody>
            {filteredSalons.map(salon => (
              <tr key={salon.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover-row">
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: 600 }}>{salon.name}</div>
                  {salon.isFeatured && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>⭐ Featured</span>
                  )}
                </td>
                <td style={{ padding: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{salon.address || '—'}</td>
                <td style={{ padding: '1.25rem' }}>{salon._count?.users ?? 0} berberë</td>
                <td style={{ padding: '1.25rem' }}>{salon._count?.bookings ?? 0} totale</td>
                <td style={{ padding: '1.25rem' }}>
                  <button
                    onClick={() => handleApprove(salon.id, salon.isApproved)}
                    style={{
                      padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                      background: salon.isApproved ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                      color: salon.isApproved ? 'var(--success)' : 'var(--warning)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {salon.isApproved ? '✓ Aprovuar' : '⏳ Aprovo'}
                  </button>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <button
                    onClick={() => handleFeature(salon.id, salon.isFeatured)}
                    style={{
                      padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                      background: salon.isFeatured ? 'rgba(194,149,69,0.15)' : 'var(--surface-hover)',
                      color: salon.isFeatured ? 'var(--primary)' : 'var(--text-muted)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {salon.isFeatured ? '⭐ Featured' : '☆ Feature'}
                  </button>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                  <div className="flex gap-2 justify-end">
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      onClick={() => openModal(salon)}
                    >
                      Edito
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--error)' }}
                      onClick={() => handleDelete(salon.id)}
                    >
                      Fshi
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSalons.length === 0 && (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nuk ka sallone {statusFilter === 'PENDING' ? 'në pritje' : statusFilter === 'APPROVED' ? 'të aprovuara' : ''}.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="card modal-box fade-in" style={{ padding: '2.5rem', margin: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 style={{ margin: 0 }}>{editingSalon ? "Edito Sallonin" : "Shto Sallon të Ri"}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Emri i Sallonit</label>
                <input type="text" className="card" style={{ width: '100%', background: 'var(--background)', padding: '0.8rem' }}
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div>
                <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Adresa (Rruga)</label>
                <input type="text" className="card" style={{ width: '100%', background: 'var(--background)', padding: '0.8rem' }}
                  value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required 
                  placeholder="Rruga Sami Frasheri" />
              </div>
              <div>
                <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Linku i Google Maps (për lokacionin)</label>
                <div className="flex gap-2">
                  <input type="text" className="card" style={{ flex: 1, background: 'var(--background)', padding: '0.8rem' }}
                    value={formData.googleMapsLink || ""} onChange={(e) => handleGoogleMapsLink(e.target.value)} 
                    placeholder="Ngjit linkun e Google Maps këtu..." />
                  <button type="button" className="btn btn-secondary" onClick={searchAddress} style={{ padding: '0.8rem' }} title="Kërko automatikisht">
                    📍 Gjej
                  </button>
                </div>
                {formData.lat && <p style={{ fontSize: '0.7rem', color: 'var(--success)', marginTop: '0.3rem' }}>✓ Lokacioni u gjet automatikisht</p>}
              </div>
              <div>
                <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Orari</label>
                <input type="text" className="card" style={{ width: '100%', background: 'var(--background)', padding: '0.8rem' }}
                  value={formData.hours} onChange={(e) => setFormData({...formData, hours: e.target.value})} />
              </div>
              <div>
                <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>📸 Foto Cover (Faqja Kryesore)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
                  {formData.coverImage ? (
                    <img src={formData.coverImage} alt="Cover" style={{ width: '80px', height: '52px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  ) : (
                    <div style={{ width: '80px', height: '52px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', opacity: 0.4 }}>🖼️</div>
                  )}
                  <div>
                    <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      {formData.coverImage ? 'Ndrysho Foton' : 'Ngarko Foton'}
                      <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload('coverImage', e)} />
                    </label>
                    {formData.coverImage && (
                      <button type="button" onClick={() => setFormData(p => ({...p, coverImage: ''}))} style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '0.8rem' }}>Hiqe</button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>🏷️ Logo e Sallonit</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    <div style={{ width: '52px', height: '52px', background: 'var(--surface)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', opacity: 0.4 }}>💈</div>
                  )}
                  <div>
                    <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      {formData.logo ? 'Ndrysho Logon' : 'Ngarko Logon'}
                      <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload('logo', e)} />
                    </label>
                    {formData.logo && (
                      <button type="button" onClick={() => setFormData(p => ({...p, logo: ''}))} style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '0.8rem' }}>Hiqe</button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" className="btn btn-secondary flex-1" onClick={closeModal}>Anulo</button>
                <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                  {loading ? "Duke u ruajtur..." : (editingSalon ? "Ruaj Ndryshimet" : "Shto Sallonin")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Fshi Sallonin"
        message="A jeni i sigurt që dëshironi të fshini këtë sallon? Ky veprim është i pakthyeshëm dhe do të fshijë të gjitha rezervimet, stafin dhe shërbimet e lidhura."
        confirmText="Fshi sallonin"
        cancelText="Anulo"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setSalonToDelete(null);
        }}
      />

    </div>
  );
}
