import Link from "next/link";
import { getGlobalSettings } from "@/app/actions/settings";
import { getCurrentUser, logoutUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import Logo from "./Logo";
import NavbarMobileClient from "./NavbarMobileClient";

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
      backgroundColor: 'rgba(9, 8, 7, 0.85)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    }}>
      <div className="container flex items-center justify-between" style={{ padding: '0.75rem 1.5rem' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo initialTitle={settings?.siteTitle} />
        </Link>
        
        {/* Center Links — desktop only */}
        <div className="flex items-center gap-8 nav-links-desktop" style={{ display: 'flex' }}>
          <style dangerouslySetInnerHTML={{__html: `
            .nav-link-item {
              color: var(--text-muted);
              font-weight: 600;
              font-size: 0.95rem;
              letter-spacing: 0.01em;
              transition: color 0.2s ease;
              text-decoration: none;
            }
            .nav-link-item:hover { color: var(--primary); }
            @media (max-width: 768px) {
              .nav-links-desktop  { display: none !important; }
              .nav-right-desktop  { display: none !important; }
            }
          `}} />
          <Link href="/#sallonet"  className="nav-link-item">Sallonet</Link>
          <Link href="/#sherbimet" className="nav-link-item">Shërbimet</Link>
          <Link href="/#harta"     className="nav-link-item">Harta</Link>
        </div>
        
        {/* Right side — desktop only */}
        <div className="flex gap-4 items-center nav-right-desktop">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img 
                src={user.image || `https://i.pravatar.cc/150?u=${user.email}`} 
                width="32" height="32" 
                style={{ borderRadius: '50%', border: '2px solid var(--primary)', objectFit: 'cover' }} 
                alt="Profile"
              />
              {(user.role === "SALON_OWNER" || user.role === "ADMIN") && (
                <Link 
                  href={user.role === "ADMIN" ? "/admin" : "/dashboard"} 
                  className="btn btn-primary" 
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)' }}
                >
                  Paneli 📊
                </Link>
              )}
              <form action={handleLogout} style={{ display: 'inline' }}>
                <button type="submit" className="btn btn-secondary" 
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)', cursor: 'pointer' }}>
                  Dil 🚪
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary" 
              style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
              Hyrja në Llogari
            </Link>
          )}
        </div>

        {/* Mobile hamburger drawer — client component */}
        <NavbarMobileClient
          userName={user?.name || null}
          userRole={user?.role || null}
          userImage={user?.image || null}
          userEmail={user?.email || null}
          logoutAction={handleLogout}
        />
      </div>
    </nav>
  );
}
