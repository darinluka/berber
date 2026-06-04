"use client";

import { useState, useEffect } from "react";
import styles from "./layout.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../components/ThemeToggle";
import Logo from "../components/Logo";
import { getSalon } from "../actions/salons";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [salon, setSalon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSalon().then(r => {
      if (r.success) {
        setSalon(r.salon);
        if (r.salon?.whatsapp) setWhatsappNumber(r.salon.whatsapp);
      }
      setIsLoading(false);
    });
  }, []);

  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Kalendari", path: "/dashboard/calendar", icon: "📅" },
    { name: "Klientët", path: "/dashboard/crm", icon: "👥" },
    { name: "Shërbimet", path: "/dashboard/services", icon: "💈" },
    { name: "Stafi", path: "/dashboard/staff", icon: "✂️" },
    { name: "Financa", path: "/dashboard/finance", icon: "💰" },
    { name: "Inventari", path: "/dashboard/inventory", icon: "📦" },
    { name: "Cilësimet", path: "/dashboard/settings", icon: "⚙️" },
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isApproved = salon?.isApproved;

  return (
    <div className={styles.dashboardContainer}>
      {/* =========================================================
          APPROVAL OVERLAY — fixed, covers the ENTIRE viewport
          so it's always perfectly centered regardless of layout
      ========================================================= */}
      {!isApproved && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(9, 9, 11, 0.82)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "1.5rem",
            animation: "fadeInOverlay 0.5s ease-out"
          }}
        >
          <div style={{
            maxWidth: "480px",
            width: "100%",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            padding: "2.5rem",
            textAlign: "center",
            boxShadow: "0 30px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.1)",
            animation: "slideUpOverlay 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards"
          }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "rgba(245, 158, 11, 0.12)",
              border: "2px solid rgba(245,158,11,0.25)",
              color: "var(--warning)",
              fontSize: "2.5rem",
              marginBottom: "1.5rem",
              animation: "pulseIcon 2s infinite ease-in-out"
            }}>
              ⏳
            </div>

            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              fontFamily: "var(--font-heading)",
              color: "var(--foreground)",
              marginBottom: "1rem",
              marginTop: 0
            }}>
              Pritet Aprovimi i Sallonit
            </h2>

            <p style={{
              color: "var(--text-muted)",
              fontSize: "0.95rem",
              lineHeight: 1.7,
              marginBottom: "2rem",
              marginTop: 0
            }}>
              Salloni juaj <strong style={{ color: "var(--foreground)" }}>{salon?.name || "Berberi"}</strong> është regjistruar me sukses dhe është në proces verifikimi nga ekipi i <strong style={{ color: "var(--primary)" }}>Berber.al</strong>.
              <br /><br />
              Ju lutem prisni konfirmimin e administratorit. Do të njoftoheni me email sapo salloni juaj të aprovohet.
            </p>

            <div style={{
              background: "rgba(245,158,11,0.07)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: "10px",
              padding: "0.9rem 1.25rem",
              marginBottom: "1.75rem",
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              justifyContent: "center"
            }}>
              📧 Kontrolloni inbox-in tuaj pas aprovimit
            </div>

            <Link
              href="/login"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                width: "100%",
                padding: "0.85rem",
                background: "var(--surface-hover)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                color: "var(--foreground)",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                transition: "all 0.2s"
              }}
            >
              🚪 Dil nga llogaria
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div className={styles.mobileBackdrop} onClick={() => setIsMobileOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""} ${isMobileOpen ? styles.mobileOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <Link href="/" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              {isCollapsed ? (
                <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.5rem' }}>B.</div>
              ) : (
                <Logo initialTitle="Berber.al" fontSize="1.5rem" />
              )}
            </Link>
          </div>
          <button className={styles.collapseBtn} onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? "→" : "←"}
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={isApproved ? item.path : "#"}
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                title={item.name}
                style={!isApproved && item.path !== "/dashboard" ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                onClick={e => {
                  if (!isApproved && item.path !== "/dashboard") {
                    e.preventDefault();
                  }
                }}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {!isCollapsed && <span className={styles.navText}>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/login" className={styles.logoutBtn}>
            <span>🚪</span>
            {!isCollapsed && <span>Dil nga llogaria</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className={styles.mobileToggle} onClick={() => setIsMobileOpen(true)}>
              ☰
            </button>
            <div className={styles.headerTitle}>
              {navItems.find(i => i.path === pathname)?.name || "Dashboard"}
            </div>
          </div>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>SO</div>
          </div>
        </header>

        <div className={styles.contentArea}>
          {children}
        </div>
      </main>

      {/* Floating WhatsApp Button */}
      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Na kontaktoni në WhatsApp"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            background: '#25D366',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(37,211,102,0.5)',
            zIndex: 9999,
            textDecoration: 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,211,102,0.7)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.5)'; }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>
      )}

      <style>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpOverlay {
          from { transform: translateY(24px) scale(0.96); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes pulseIcon {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
