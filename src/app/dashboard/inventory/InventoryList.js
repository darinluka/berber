"use client";

import { useState } from "react";
import { updateStock } from "@/app/actions/inventory";

export default function InventoryList({ initialInventory }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [inventory, setInventory] = useState(initialInventory);

  const filteredItems = inventory.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStock = async (id, currentStock) => {
    const newStock = prompt("Vendosni sasinë e re të stokut:", currentStock);
    if (newStock !== null) {
      const res = await updateStock(id, parseInt(newStock));
      if (res.success) {
        setInventory(prev => prev.map(item => 
          item.id === id ? { ...item, stock: parseInt(newStock), status: parseInt(newStock) <= item.minStock ? "Low Stock" : "In Stock" } : item
        ));
      }
    }
  };

  return (
    <>
      {/* Search and Filters */}
      <div className="card mb-8">
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Kërko produktet..." 
            className="input" 
            style={{ flex: 1 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select className="input" style={{ width: '200px' }}>
            <option>Të gjitha kategoritë</option>
            <option>Kujdesi për Flokët</option>
            <option>Pajisje</option>
            <option>Produkte Mjekre</option>
          </select>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-4 gap-6 md:grid-cols-2">
        {filteredItems.map(item => (
          <div key={item.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '12px', 
                background: 'var(--surface-hover)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' 
              }}>
                📦
              </div>
              <span style={{ 
                padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700,
                background: item.status === "Low Stock" ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: item.status === "Low Stock" ? 'var(--error)' : 'var(--success)'
              }}>
                {item.status}
              </span>
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.name}</h3>
            <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>{item.category}</p>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>STOKU AKTUAL</p>
                <p style={{ fontWeight: 700, fontSize: '1.25rem' }}>{item.stock} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)' }}>copë</span></p>
              </div>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                onClick={() => handleUpdateStock(item.id, item.stock)}
              >
                Përditëso
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
