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
      backgroundColor: 'var(--background)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <div className="container flex items-center justify-between" style={{ padding: '0.5rem 1.5rem' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo initialTitle={settings?.siteTitle} />
        </Link>
        
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
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  Paneli 📊
                </Link>
              )}

              <form action={handleLogout} style={{ display: 'inline' }}>
                <button 
                  type="submit" 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
                >
                  Dil 🚪
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.6rem 1.25rem' }}>
              Hyrja në Llogari
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

