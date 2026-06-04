"use client";

import { useState, useEffect } from "react";
import styles from "../dashboard/layout.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../components/Logo";
import { logoutUser } from "../actions/auth";

export default function AdminLayoutClient({ children }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Përmbledhje", path: "/admin", icon: "🌍" },
    { name: "Sallonet", path: "/admin/salons", icon: "🏬" },
    { name: "Përdoruesit", path: "/admin/users", icon: "👥" },
    { name: "Cilësimet", path: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <div className={styles.dashboardContainer}>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div className={styles.mobileBackdrop} onClick={() => setIsMobileOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isMobileOpen ? styles.mobileOpen : ""}`} style={{ borderRight: '2px solid var(--primary)' }}>
        <div className={styles.logo} style={{ padding: '2rem 1.25rem' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Logo initialTitle="Berber.al" fontSize="1.9rem" />
          </Link>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navText}>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button 
            onClick={async () => {
              await logoutUser();
              window.location.href = "/login";
            }}
            className={styles.logoutBtn} 
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.8rem 1rem', width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span>🚪</span>
            <span>Dil nga Admin</span>
          </button>
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
              Super Admin Control Panel
            </div>
          </div>
          <div className={styles.userProfile}>
            <div className={styles.avatar} style={{ background: 'var(--primary)' }}>AD</div>
          </div>
        </header>
        <div className={styles.contentArea}>
          {children}
        </div>
      </main>
    </div>
  );
}
