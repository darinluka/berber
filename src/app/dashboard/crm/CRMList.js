"use client";

import { useState } from "react";
import { createCustomer, updateCustomer, deleteCustomer } from "@/app/actions/customers";

export default function CRMList({ initialCustomers }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [phoneWarning, setPhoneWarning] = useState("");

  const validateAlbanianPhone = (phone) => {
    const cleaned = phone.replace(/\s/g, "");
    if (!cleaned) return "";
    const albanian = /^(\+3556[7-9]\d{7}|06[7-9]\d{7})$/;
    if (!albanian.test(cleaned)) {
      return "⚠️ Numri nuk duket si numër shqiptar (p.sh. 0681234567 ose +355681234567).";
    }
    return "";
  };

  const filteredCustomers = initialCustomers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    c.phone.includes(searchTerm)
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await createCustomer(formData);
    if (result.success) {
      window.location.reload();
    } else {
      alert("Gabim: " + result.error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Fshini këtë klient?")) {
      const result = await deleteCustomer(id);
      if (result.success) window.location.reload();
    }
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ fontSize: '2rem' }}>CRM e Klientëve</h1>
          <p className="text-muted">Menaxhoni të dhënat dhe historikun e klientëve tuaj.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>+ Shto Klient të Ri</button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-muted mb-1">Total Klientë</p>
          <h2 style={{ fontSize: '1.75rem' }}>{initialCustomers.length}</h2>
        </div>
        <div className="card">
          <p className="text-muted mb-1">Vizita këtë Muaj</p>
          <h2 style={{ fontSize: '1.75rem' }}>0</h2>
        </div>
        <div className="card">
          <p className="text-muted mb-1">Klientë të Rinj</p>
          <h2 style={{ fontSize: '1.75rem' }}>+{initialCustomers.length}</h2>
        </div>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <input 
          type="text" placeholder="Kërko me emër, email ose telefon..." 
          className="input" style={{ width: '100%' }}
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', textAlign: 'left' }}>
              <th style={{ padding: '1.25rem' }}>Emri</th>
              <th style={{ padding: '1.25rem' }}>Kontakti</th>
              <th style={{ padding: '1.25rem' }}>WhatsApp</th>
              <th style={{ padding: '1.25rem' }}>Veprime</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover-row">
                <td style={{ padding: '1.25rem', fontWeight: 600 }}>{c.name}</td>
                <td style={{ padding: '1.25rem' }}>{c.phone}<br/><small className="text-muted">{c.email}</small></td>
                <td style={{ padding: '1.25rem' }}>
                  {c.phone && c.phone !== 'Pa telefon' ? (
                    <a
                      href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Hap WhatsApp me ${c.name}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: '#25D366',
                        color: '#fff',
                        textDecoration: 'none',
                        boxShadow: '0 2px 8px rgba(37,211,102,0.4)',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,211,102,0.6)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,211,102,0.4)'; }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </a>
                  ) : (
                    <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <button className="btn btn-secondary" style={{ marginRight: '0.5rem' }} onClick={() => setSelectedCustomer(c)}>Detajet</button>
                  <button className="btn btn-secondary" style={{ color: 'var(--error)' }} onClick={() => handleDelete(c.id)}>Fshi</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="card modal-box fade-in" style={{ padding: '2.5rem' }} onClick={e => e.stopPropagation()}>
            <h2 className="mb-6">Shto Klient</h2>
            <form onSubmit={handleAdd} className="grid gap-4">
              <input type="text" className="card" placeholder="Emri Mbiemri" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <div>
                <input
                  type="tel"
                  className="card"
                  style={{ width: "100%" }}
                  placeholder="0681234567 ose +355681234567"
                  required
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({...formData, phone: e.target.value});
                    setPhoneWarning(validateAlbanianPhone(e.target.value));
                  }}
                />
                {phoneWarning && (
                  <p style={{
                    fontSize: "0.8rem", marginTop: "0.4rem",
                    color: "#f59e0b", padding: "0.5rem 0.75rem",
                    background: "rgba(245,158,11,0.08)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid rgba(245,158,11,0.25)"
                  }}>{phoneWarning}</p>
                )}
              </div>
              <input type="email" className="card" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              <div className="flex gap-4 mt-4">
                <button type="button" className="btn btn-secondary flex-1" onClick={() => setIsAddModalOpen(false)}>Anulo</button>
                <button type="submit" className="btn btn-primary flex-1" disabled={loading}>{loading ? "Duke u ruajtur..." : "Shto Klient"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="card modal-box fade-in" style={{ padding: '2.5rem' }} onClick={e => e.stopPropagation()}>
            <h2 className="mb-6">Detajet e Klientit</h2>
            <p><strong>Emri:</strong> {selectedCustomer.name}</p>
            <p><strong>Email:</strong> {selectedCustomer.email}</p>
            <p><strong>Telefon:</strong> {selectedCustomer.phone}</p>
            <button className="btn btn-primary mt-8" style={{ width: '100%' }} onClick={() => setSelectedCustomer(null)}>Mbyll</button>
          </div>
        </div>
      )}
    </div>
  );
}
