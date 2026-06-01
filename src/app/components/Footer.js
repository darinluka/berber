import Link from "next/link";
import { getGlobalSettings } from "@/app/actions/settings";
import Logo from "./Logo";

export default async function Footer() {
  const settings = await getGlobalSettings();
  const siteTitle = settings?.siteTitle?.replace('.al', '') || 'Berberi';

  return (
    <footer style={{
      backgroundColor: '#090807',
      padding: '3rem 0 3rem',
      borderTop: '1px solid var(--border)',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem'
        }}>
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Logo initialTitle={siteTitle + ".al"} />
          </div>

          {/* Copyright in Center */}
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', margin: '0 auto' }}>
            {settings?.footerText || `© ${new Date().getFullYear()} ${siteTitle}.al - Të gjitha të drejtat të rezervuara.`}
          </p>

          {/* Links on Right */}
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
            <Link href="/#sallonet" className="footer-link" style={{ color: 'var(--text-muted)' }}>Privatësia</Link>
            <Link href="/#sallonet" className="footer-link" style={{ color: 'var(--text-muted)' }}>Kushtet</Link>
            <Link href="/#sallonet" className="footer-link" style={{ color: 'var(--text-muted)' }}>Kontakt</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
