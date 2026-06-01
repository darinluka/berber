import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { getGlobalSettings } from "@/app/actions/settings";
import { getCurrentUser, logoutUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import Logo from "./Logo";

export default async function Navbar() {
  const settings = await getGlobalSettings();
  const user = await getCurrentUser();

  async function handleLogout() {
    "use server";
    await logoutUser();
    redirect("/");
  }

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(9, 8, 7, 0.8)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    }}>
      <div className="container flex items-center justify-between" style={{ padding: '0.75rem 1.5rem' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo initialTitle={settings?.siteTitle} />
        </Link>
        
        {/* Center Links (Visible on desktop) */}
        <div className="flex items-center gap-8 nav-links-desktop" style={{ display: 'flex' }}>
          <style dangerouslySetInnerHTML={{__html: `
            .nav-link-item {
              color: var(--text-muted);
              font-weight: 500;
              font-size: 0.95rem;
              transition: color 0.2s ease;
            }
            .nav-link-item:hover {
              color: var(--primary);
            }
            @media (max-width: 768px) {
              .nav-links-desktop {
                display: none !important;
              }
            }
          `}} />
          <Link href="/#sallonet" className="nav-link-item">Sallonet</Link>
          <Link href="/#sherbimet" className="nav-link-item">Shërbimet</Link>
          <Link href="/#harta" className="nav-link-item">Harta</Link>
        </div>
        
        <div className="flex gap-4 items-center">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img 
                  src={user.image || `https://i.pravatar.cc/150?u=${user.email}`} 
                  width="32" 
                  height="32" 
                  style={{ borderRadius: '50%', border: '2px solid var(--primary)', objectFit: 'cover' }} 
                  alt="Profile"
                />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--foreground)', display: 'none', md: 'inline' }} className="user-name-nav">
                  {user.name}
                </span>
              </div>

              {(user.role === "SALON_OWNER" || user.role === "ADMIN") && (
                <Link 
                  href={user.role === "ADMIN" ? "/admin" : "/dashboard"} 
                  className="btn btn-primary" 
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  Paneli 📊
                </Link>
              )}

              <form action={handleLogout} style={{ display: 'inline' }}>
                <button 
                  type="submit" 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)', cursor: 'pointer' }}
                >
                  Dil 🚪
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
              Hyrja në Llogari
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

