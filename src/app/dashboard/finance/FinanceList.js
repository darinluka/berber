"use client";

import { useState } from "react";
import { addTransaction, deleteTransaction } from "@/app/actions/finance";

export default function FinanceList({ initialFinances, salonId }) {
  const [filter, setFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("INCOME");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    type: "INCOME"
  });
  
  const filteredFinances = initialFinances.filter(f => {
    const typeMatch = filter === "ALL" || f.type === filter;
    const monthMatch = f.date.startsWith(monthFilter);
    return typeMatch && monthMatch;
  });

  // Calculate real stats
  const totalIncome = initialFinances
    .filter(f => f.type === "INCOME")
    .reduce((sum, f) => sum + f.rawAmount, 0);
  
  const totalExpense = initialFinances
    .filter(f => f.type === "EXPENSE")
    .reduce((sum, f) => sum + f.rawAmount, 0);
  
  const netProfit = totalIncome - totalExpense;

  const openModal = (type) => {
    setModalType(type);
    setFormData({
      amount: "",
      description: "",
      type: type
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await addTransaction({
        salonId,
        amount: parseFloat(formData.amount),
        description: formData.description,
        type: modalType
      });

      if (result.success) {
        window.location.reload();
      } else {
        alert("Gabim: " + result.error);
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("A jeni i sigurt që dëshironi të fshini këtë transaksion?")) {
      const result = await deleteTransaction(id);
      if (result.success) {
        window.location.reload();
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ["Data", "Përshkrimi", "Kategoria", "Lloji", "Shuma (Lek)"];
    
    const rows = filteredFinances.map(f => [
      f.date,
      `"${f.description.replace(/"/g, '""')}"`,
      f.category,
      f.type === "INCOME" ? "Hyrje" : "Dalje",
      f.rawAmount
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Transaksionet_${monthFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ fontSize: '2rem' }}>Pasqyra Financiare</h1>
          <p className="text-muted">Ndiqni hyrjet, daljet dhe fitimin neto të sallonit tuaj.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => openModal("EXPENSE")}>+ Shpenzim i Ri</button>
          <button className="btn btn-primary" onClick={() => openModal("INCOME")}>+ Të Ardhura</button>
        </div>
      </div>

      {/* Finance Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-muted mb-1">Të Ardhura Totale</p>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--success)' }}>+{totalIncome.toLocaleString()} L</h2>
        </div>
        <div className="card">
          <p className="text-muted mb-1">Shpenzime Totale</p>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--error)' }}>-{totalExpense.toLocaleString()} L</h2>
        </div>
        <div className="card" style={{ background: 'var(--primary)', color: 'white' }}>
          <p style={{ opacity: 0.8, marginBottom: '0.25rem' }}>Fitimi Neto</p>
          <h2 style={{ fontSize: '1.75rem' }}>{netProfit.toLocaleString()} L</h2>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {["ALL", "INCOME", "EXPENSE"].map((type) => (
            <button 
              key={type}
              onClick={() => setFilter(type)}
              className="btn btn-secondary"
              style={{ 
                padding: '0.5rem 1rem', 
                fontSize: '0.85rem',
                background: filter === type ? 'var(--primary)' : '',
                color: filter === type ? 'white' : ''
              }}
            >
              {type === "ALL" ? "Të gjitha" : type === "INCOME" ? "Hyrje" : "Dalje"}
            </button>
          ))}
        </div>
        <div className="flex gap-4">
          <input 
            type="month" className="input" 
            value={monthFilter} 
            onChange={(e) => setMonthFilter(e.target.value)} 
          />
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            Eksporto CSV
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
              <th style={{ padding: '1.25rem' }}>Data</th>
              <th style={{ padding: '1.25rem' }}>Përshkrimi</th>
              <th style={{ padding: '1.25rem' }}>Kategoria</th>
              <th style={{ padding: '1.25rem', textAlign: 'right' }}>Shuma</th>
              <th style={{ padding: '1.25rem', textAlign: 'right' }}>Veprime</th>
            </tr>
          </thead>
          <tbody>
            {filteredFinances.map(transaction => (
              <tr key={transaction.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover-row">
                <td style={{ padding: '1.25rem', fontSize: '0.9rem' }}>{transaction.date}</td>
                <td style={{ padding: '1.25rem', fontWeight: 500 }}>{transaction.description}</td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.6rem', 
                    borderRadius: 'var(--radius-full)', 
                    fontSize: '0.75rem',
                    background: 'var(--surface-hover)',
                    color: 'var(--text-muted)'
                  }}>{transaction.category}</span>
                </td>
                <td style={{ 
                  padding: '1.25rem', 
                  textAlign: 'right', 
                  fontWeight: 700,
                  color: transaction.type === "INCOME" ? 'var(--success)' : 'var(--error)'
                }}>
                  {transaction.amount}
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleDelete(transaction.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: '0.9rem' }}
                  >Fshi</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredFinances.length === 0 && (
          <div style={{ padding: '4rem', textAlign: 'center' }} className="text-muted">
            Asnjë transaksion i gjetur.
          </div>
        )}
      </div>

      {/* Modal for Add Transaction */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="card modal-box fade-in" style={{ padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <h2 className="mb-6">{modalType === "INCOME" ? "Shto Të Ardhura" : "Shto Shpenzim"}</h2>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <label className="text-muted mb-1 block text-sm">Shuma (Lek)</label>
                <input 
                  type="number" className="card w-full p-3" 
                  value={formData.amount} 
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label className="text-muted mb-1 block text-sm">Përshkrimi</label>
                <textarea 
                  className="card w-full p-3 h-24" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required 
                />
              </div>
              <div className="flex gap-4 mt-4">
                <button type="button" className="btn btn-secondary flex-1" onClick={() => setIsModalOpen(false)}>Anulo</button>
                <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
                  {loading ? "Duke u ruajtur..." : "Ruaj"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
}
