"use client";

import { useState } from "react";

export default function Logo({ initialTitle }) {
  const [error, setError] = useState(false);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
      {!error ? (
        <img 
          src="/logo.png" 
          alt="Berberi.al Logo" 
          className="logo-img"
          style={{ height: '160px', width: 'auto', objectFit: 'contain' }}
          onError={() => setError(true)}
        />
      ) : (
        <span style={{ color: 'var(--foreground)', fontWeight: 'bold', fontSize: '1.5rem' }}>
          {initialTitle?.replace('.al', '') || 'Berberi'}
          <span style={{ color: 'var(--primary)' }}>.al</span>
        </span>
      )}
    </div>
  );
}
