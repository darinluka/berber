"use client";

import styles from "../dashboard/layout.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../components/ThemeToggle";
import Logo from "../components/Logo";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Global Overview", path: "/admin", icon: "🌍" },
    { name: "Sallonet", path: "/admin/salons", icon: "🏬" },
    { name: "Përdoruesit", path: "/admin/users", icon: "👥" },
    { name: "Cilësimet", path: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar} style={{ borderRight: '2px solid var(--primary)' }}>
        <div className={styles.logo} style={{ padding: '2rem 1rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Logo initialTitle="Berberi.al" />
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
                <span>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <Link href="/login" className="text-muted flex items-center gap-2" style={{ textDecoration: 'none' }}>
            🚪 Dil nga Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            Super Admin Control Panel
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
