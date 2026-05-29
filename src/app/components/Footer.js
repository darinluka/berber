import Link from "next/link";
import { getGlobalSettings } from "@/app/actions/settings";
import Logo from "./Logo";

export default async function Footer() {
  const settings = await getGlobalSettings();
  const siteTitle = settings?.siteTitle?.replace('.al', '') || 'Berberi';

  return (
    <footer style={{
      backgroundColor: 'var(--surface)',
      padding: '4rem 0 2rem',
      borderTop: '1px solid var(--border)',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem'
        }}>
          {/* Brand */}
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <Logo initialTitle={siteTitle} />
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Platforma
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { href: '/', label: 'Gjej Berberin' },
                { href: '/register-salon', label: 'Regjistro Sallonin' },
                { href: '/login', label: 'Hyrja' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Kontakt
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              📧 {settings?.contactEmail || 'info@berber.al'}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {settings?.footerText || `© ${new Date().getFullYear()} ${siteTitle}.al. Të gjitha të drejtat e rezervuara.`}
          </p>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Bërë me ❤️ në Shqipëri</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
