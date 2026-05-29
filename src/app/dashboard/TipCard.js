"use client";

import { useState } from "react";

export default function TipCard({ attendanceRate }) {
  const [activated, setActivated] = useState(false);

  return (
    <div className="card" style={{ background: activated ? 'var(--success)' : 'var(--primary)', color: 'white', transition: 'all 0.3s ease' }}>
      <h3 className="mb-2" style={{ color: 'white' }}>Këshillë Business</h3>
      <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
        {activated 
          ? "Shërbimi WhatsApp është aktiv! Klientët do të marrin rikujtesa automatike."
          : `Shkalla e ardhjes është ${attendanceRate}%. Aktivizoni njoftimet në WhatsApp për t'u dërguar rikujtesa klientëve 1 orë para rezervimit.`
        }
      </p>
      <button 
        className="btn btn-secondary mt-6" 
        style={{ 
          width: '100%', 
          background: 'white', 
          border: 'none', 
          color: activated ? 'var(--success)' : 'var(--primary)', 
          fontWeight: 700 
        }}
        onClick={() => {
          if (!activated) {
            setActivated(true);
            alert("WhatsApp u aktivizua me sukses! ✅");
          }
        }}
      >
        {activated ? "Aktivizuar ✓" : "Aktivizo WhatsApp"}
      </button>
    </div>
  );
}
