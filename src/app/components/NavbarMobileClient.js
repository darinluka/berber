"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function NavbarMobileClient({ userName, userRole, userImage, userEmail, logoutAction }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const avatarUrl = userImage || (userEmail ? `https://i.pravatar.cc/150?u=${userEmail}` : null);

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
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
          padding: 0;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .hamburger-btn:hover { background: rgba(212,175,55,0.08); }
        .hamburger-btn span {
          display: block;
          width: 20px;
          height: 2px;
          background: var(--foreground);
          border-radius: 2px;
          transition: all 0.3s ease;
          transform-origin: center;
        }
        .hamburger-btn.hb-open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger-btn.hb-open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger-btn.hb-open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        @media (max-width: 768px) {
          .hamburger-btn { display: flex !important; }
        }
        .mob-drawer-wrap {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          pointer-events: all;
        }
        .mob-drawer-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }
        .mob-drawer-panel {
          position: absolute;
          top: 0;
          right: 0;
          width: min(300px, 82vw);
          height: 100%;
          background: #0d0b09;
          border-left: 1px solid rgba(212,175,55,0.2);
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          gap: 0.25rem;
          overflow-y: auto;
          animation: slideDrawer 0.28s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes slideDrawer {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .mob-drawer-close {
          align-self: flex-end;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--foreground);
          font-size: 1rem;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-bottom: 1.25rem;
          flex-shrink: 0;
        }
        .mob-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.9rem 1rem;
          border-radius: var(--radius-md);
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }
        .mob-nav-link:hover, .mob-nav-link:active {
          background: rgba(212,175,55,0.07);
          border-color: rgba(212,175,55,0.2);
          color: var(--primary);
        }
        .mob-nav-divider {
          height: 1px;
          background: var(--border);
          margin: 0.65rem 0;
        }
        .mob-user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          margin-bottom: 0.5rem;
        }
        .mob-user-name {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--foreground);
        }
        .mob-logout-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.9rem 1rem;
          border-radius: var(--radius-md);
          color: var(--error, #f87171);
          background: none;
          border: 1px solid transparent;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: all 0.2s;
        }
        .mob-logout-btn:hover {
          background: rgba(239,68,68,0.08);
          border-color: rgba(239,68,68,0.2);
        }
      ` }} />

      {/* Hamburger toggle — visible only on mobile via CSS */}
      <button
        className={`hamburger-btn${menuOpen ? " hb-open" : ""}`}
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Hap menynë"
        aria-expanded={menuOpen}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Slide-in drawer */}
      {menuOpen && (
        <div className="mob-drawer-wrap" role="dialog" aria-modal="true" aria-label="Menu kryesore">
          <div className="mob-drawer-backdrop" onClick={() => setMenuOpen(false)} />
          <div className="mob-drawer-panel">

            {/* Close button */}
            <button className="mob-drawer-close" onClick={() => setMenuOpen(false)} aria-label="Mbyll menynë">✕</button>

            {/* User info if logged in */}
            {userName && (
              <div className="mob-user-info">
                {avatarUrl && (
                  <img src={avatarUrl} width="36" height="36"
                    style={{ borderRadius: "50%", border: "2px solid var(--primary)", objectFit: "cover", flexShrink: 0 }}
                    alt="Avatar"
                  />
                )}
                <span className="mob-user-name">{userName}</span>
              </div>
            )}

            {/* Main nav links */}
            <Link href="/#sallonet"  className="mob-nav-link" onClick={() => setMenuOpen(false)}>✂️ &nbsp;Sallonet</Link>
            <Link href="/#sherbimet" className="mob-nav-link" onClick={() => setMenuOpen(false)}>💈 &nbsp;Shërbimet</Link>
            <Link href="/#harta"     className="mob-nav-link" onClick={() => setMenuOpen(false)}>📍 &nbsp;Harta</Link>

            <div className="mob-nav-divider" />

            {/* Auth links */}
            {userRole ? (
              <>
                {(userRole === "SALON_OWNER" || userRole === "ADMIN") && (
                  <Link
                    href={userRole === "ADMIN" ? "/admin" : "/dashboard"}
                    className="mob-nav-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    📊 &nbsp;Paneli
                  </Link>
                )}
                <form action={logoutAction}>
                  <button type="submit" className="mob-logout-btn">
                    🚪 &nbsp;Dil nga llogaria
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="btn btn-primary"
                style={{ marginTop: "0.5rem", textAlign: "center", borderRadius: "var(--radius-full)", padding: "0.9rem 1.5rem", fontWeight: 700, display: "block" }}
                onClick={() => setMenuOpen(false)}
              >
                Hyrja në Llogari
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
