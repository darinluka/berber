"use client";

import { useState } from "react";
import { createService, updateService, deleteService } from "@/app/actions/services";
import ConfirmDialog from "@/app/components/ConfirmDialog";

export default function ServicesList({ initialServices, salonId }) {
  const [services, setServices] = useState(initialServices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "30",
    description: ""
  });

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        price: service.price.toString(),
        duration: service.duration.toString(),
        description: service.description || ""
      });
    } else {
      setEditingService(null);
      setFormData({
        name: "",
        price: "",
        duration: "30",
        description: ""
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (parseFloat(formData.price) <= 0) {
        alert("Çmimi duhet të jetë më i madh se 0.");
        setLoading(false);
        return;
      }
      if (parseInt(formData.duration) <= 0) {
        alert("Kohëzgjatja duhet të jetë më e madhe se 0.");
        setLoading(false);
        return;
      }

      const data = {
        name: formData.name,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        description: formData.description
      };

      let result;
      if (editingService) {
        result = await updateService(editingService.id, data);
      } else {
        result = await createService(salonId, data);
      }

      if (result && result.success) {
        window.location.reload();
      } else {
        alert("Gabim gjatë ruajtjes: " + (result?.error || "Unknown error"));
      }
    } catch (err) {
      alert("Cortex Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setServiceToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (serviceToDelete) {
      const result = await deleteService(serviceToDelete);
      if (result.success) {
        window.location.reload();
      } else {
        alert("Gabim gjatë fshirjes");
      }
    }
    setDeleteConfirmOpen(false);
    setServiceToDelete(null);
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ fontSize: '2rem' }}>Shërbimet & Çmimet</h1>
          <p className="text-muted">Menaxhoni menunë e shërbimeve që ofron salloni juaj.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Shto Shërbim</button>
      </div>

      <div className="grid grid-cols-3 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {services.map((service) => (
          <div key={service.id} className="card hover-row">
            <div className="flex justify-between items-start mb-4">
              <div style={{ 
                width: '50px', height: '50px', background: 'rgba(194, 149, 69, 0.1)', 
                borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem'
              }}>💈</div>
              <div className="text-right">
                <span className="text-primary" style={{ fontWeight: 700, fontSize: '1.25rem' }}>{service.price} L</span>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>{service.duration} min</p>
              </div>
            </div>
            <h3 className="mb-2" style={{ fontSize: '1.2rem' }}>{service.name}</h3>
            <p className="text-muted mb-6" style={{ fontSize: '0.875rem', height: '40px', overflow: 'hidden' }}>
              {service.description || "Shërbim profesional për kujdesin tuaj."}
            </p>
            <div className="flex gap-2">
              <button className="btn btn-secondary flex-1" onClick={() => openModal(service)}>Edito</button>
              <button className="btn btn-secondary flex-1" style={{ color: 'var(--error)' }} onClick={() => handleDelete(service.id)}>Fshi</button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL - Improved Centering and Overlay */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="card modal-box fade-in" style={{ padding: '2.5rem' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 style={{ margin: 0 }}>{editingService ? "Edito Shërbimin" : "Shto Shërbim"}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div>
                <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Emri i Shërbimit</label>
                <input 
                  type="text" className="card" style={{ width: '100%', padding: '1rem', background: 'var(--background)' }} 
                  required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Çmimi (Lek)</label>
                  <input 
                    type="number" className="card" style={{ width: '100%', padding: '1rem', background: 'var(--background)' }} 
                    required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Kohëzgjatja (min)</label>
                  <input 
                    type="number" className="card" style={{ width: '100%', padding: '1rem', background: 'var(--background)' }} 
                    required value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Përshkrimi</label>
                <textarea 
                  className="card" style={{ width: '100%', padding: '1rem', background: 'var(--background)', height: '100px' }} 
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="flex gap-4 mt-4">
                <button type="button" className="btn btn-secondary flex-1" onClick={closeModal}>Anulo</button>
                <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                  {loading ? "Duke u ruajtur..." : "Ruaj Ndryshimet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Fshi Shërbimin"
        message="A jeni i sigurt që dëshironi të fshini këtë shërbim? Ky veprim është i pakthyeshëm."
        confirmText="Fshi shërbimin"
        cancelText="Anulo"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setServiceToDelete(null);
        }}
      />
    </div>
  );
}
