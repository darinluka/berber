"use client";

import { useState } from "react";

export default function Logo({ initialTitle, fontSize }) {
  const [error, setError] = useState(false);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
      {!error ? (
        <img 
          src="/logo.png" 
          alt="Berber.al Logo" 
          className="logo-img"
          style={{ width: 'auto', objectFit: 'contain' }}
          onError={() => setError(true)}
        />
      ) : (
        <span style={{ 
          fontFamily: 'var(--font-logo, "TypoGraphica", "Outfit", sans-serif)', 
          fontWeight: 900, 
          fontSize: fontSize || '2.6rem',
          letterSpacing: '0.02em',
          color: 'var(--foreground)',
          textTransform: 'uppercase'
        }}>
          {initialTitle?.replace('.al', '') || 'Berberi'}
          <span style={{ color: 'var(--primary)' }}>.al</span>
        </span>
      )}
    </div>
  );
}
