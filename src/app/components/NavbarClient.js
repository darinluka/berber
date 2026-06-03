"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function NavbarClient({ user, handleLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change / resize
  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .hamburger-btn {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
          padding: 0;
          flex-shrink: 0;
        }
        .hamburger-btn span {
          display: block;
          width: 20px;
          height: 2px;
          background: #ffffff;
          border-radius: 2px;
          transition: all 0.3s ease;
        }
        .hamburger-btn.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .hamburger-btn.open span:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }
        .hamburger-btn.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }
        @media (max-width: 768px) {
          .hamburger-btn { display: flex !important; }
        }
        .mobile-drawer {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 999;
          display: flex;
          flex-direction: column;
        }
        .mobile-drawer-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }
        .mobile-drawer-panel {
          position: absolute;
          top: 0;
          right: 0;
          width: min(320px, 85vw);
          height: 100%;
          background: #0d0b09;
          border-left: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 2rem 1.5rem;
          gap: 0.5rem;
          animation: slideInRight 0.28s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .mobile-drawer-close {
          align-self: flex-end;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--foreground);
          font-size: 1.2rem;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-bottom: 1.5rem;
        }
        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-radius: var(--radius-md);
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }
        .mobile-nav-link:hover {
          background: rgba(212,175,55,0.06);
          border-color: rgba(212,175,55,0.2);
          color: var(--primary);
        }
        .mobile-nav-divider {
          height: 1px;
          background: var(--border);
          margin: 0.75rem 0;
        }
      ` }} />

      {/* Hamburger toggle button — only visible on mobile via CSS */}
      <button
        className={`hamburger-btn${menuOpen ? " open" : ""}`}
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="mobile-drawer" role="dialog" aria-modal="true">
          <div className="mobile-drawer-backdrop" onClick={() => setMenuOpen(false)} />
          <div className="mobile-drawer-panel">
            <button className="mobile-drawer-close" onClick={() => setMenuOpen(false)}>✕</button>

            <Link href="/#sallonet"   className="mobile-nav-link" onClick={() => setMenuOpen(false)}>✂️ Sallonet</Link>
            <Link href="/#sherbimet"  className="mobile-nav-link" onClick={() => setMenuOpen(false)}>💈 Shërbimet</Link>
            <Link href="/#harta"      className="mobile-nav-link" onClick={() => setMenuOpen(false)}>📍 Harta</Link>

            <div className="mobile-nav-divider" />

            {user ? (
              <>
                {(user.role === "SALON_OWNER" || user.role === "ADMIN") && (
                  <Link
                    href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                    className="mobile-nav-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    📊 Paneli
                  </Link>
                )}
                <form action={handleLogout} style={{ display: "block" }}>
                  <button type="submit" className="mobile-nav-link" style={{ width: "100%", cursor: "pointer", background: "none", border: "1px solid transparent", textAlign: "left", color: "var(--error)", fontWeight: 600, fontSize: "1rem", borderRadius: "var(--radius-md)", padding: "1rem 1.25rem", gap: "0.75rem", display: "flex", alignItems: "center" }}>
                    🚪 Dil
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="btn btn-primary" style={{ marginTop: "0.5rem", textAlign: "center", borderRadius: "var(--radius-full)", padding: "0.85rem 1.5rem", fontWeight: 700 }} onClick={() => setMenuOpen(false)}>
                Hyrja në Llogari
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
