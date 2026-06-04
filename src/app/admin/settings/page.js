"use client";

import { useState, useEffect } from "react";
import { getGlobalSettings, updateGlobalSettings } from "@/app/actions/settings";
import { updatePassword } from "@/app/actions/users";
import { getCurrentUser } from "@/app/actions/auth";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteTitle: "Berber.al",
    headerText: "",
    footerText: "© 2026 Berber.al. Të gjitha të drejtat e rezervuara.",
    contactEmail: "info@berber.al"
  });
  const [adminEmail, setAdminEmail] = useState("lukadarin178@gmail.com");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const [data, user] = await Promise.all([
        getGlobalSettings(),
        getCurrentUser()
      ]);
      if (data) setSettings(data);
      if (user && user.email) setAdminEmail(user.email);
      setLoading(false);
    }
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateGlobalSettings(settings);
    if (result.success) {
      alert("Cilësimet u ruajtën me sukses!");
    } else {
      alert("Gabim gjatë ruajtjes.");
    }
    setSaving(false);
  };

  if (loading) return <div className="p-10">Duke u ngarkuar...</div>;

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 style={{ fontSize: '2rem' }}>Cilësimet Globale</h1>
        <p className="text-muted">Menaxhoni tekstet dhe konfigurimet kryesore të platformës Berber.al.</p>
      </div>

      <div className="grid gap-8" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        <div className="card">
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div>
              <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Titulli i Faqes (Site Title)</label>
              <input 
                type="text" className="card" style={{ width: '100%', background: 'var(--background)' }} 
                value={settings.siteTitle}
                onChange={(e) => setSettings({...settings, siteTitle: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Teksti i Footer (Kryesor)</label>
              <textarea 
                className="card" style={{ width: '100%', background: 'var(--background)', height: '80px' }} 
                value={settings.footerText}
                onChange={(e) => setSettings({...settings, footerText: e.target.value})}
              />
            </div>

            <div>
              <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email-i i Kontaktit</label>
              <input 
                type="email" className="card" style={{ width: '100%', background: 'var(--background)' }} 
                value={settings.contactEmail}
                onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
              />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '0.75rem 2rem' }}>
                {saving ? "Duke u ruajtur..." : "Ruaj Ndryshimet ✨"}
              </button>
            </div>
          </form>
        </div>

        <div className="card" style={{ background: 'var(--surface-hover)', border: '1px dashed var(--primary)' }}>
          <h3 className="mb-4">Informacion</h3>
          <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            Ndryshimet që bëni këtu do të pasqyrohen menjëherë në të gjithë platformën (Home, Dashboards, etj.). 
            <br /><br />
            Sigurohuni që tekstet të jenë profesionale dhe të saktë pasi ato ndikojnë në SEO të faqes.
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '2rem 0' }} />

          <h3 className="mb-4">🔑 Siguria (Fjalëkalimi)</h3>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const pass = e.target.password.value;
            if (!pass) return;
            const res = await updatePassword(adminEmail, pass);
            if (res.success) {
              alert("Fjalëkalimi u ndryshua me sukses!");
              e.target.reset();
            } else {
              alert("Gabim: " + res.error);
            }
          }} className="grid gap-4">
            <div>
              <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Fjalëkalimi i Ri</label>
              <input 
                name="password"
                type="password" className="card" style={{ width: '100%', background: 'var(--background)' }} 
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
              Ndrysho Fjalëkalimin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
