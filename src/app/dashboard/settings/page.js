"use client";

import { useState, useEffect } from "react";
import { updatePassword, getUserByEmail, updateUserAvatar } from "@/app/actions/users";
import { getSalon, updateSalon } from "@/app/actions/salons";

export default function DashboardSettings() {
  const [saving, setSaving] = useState(false);
  const [savingSection, setSavingSection] = useState(null);
  const [password, setPassword] = useState("");
  const [salon, setSalon] = useState(null);
  const [whatsapp, setWhatsapp] = useState("");
  const [heroImages, setHeroImages] = useState([null, null, null]);
  const [closedDays, setClosedDays] = useState([]);
  const [closedDates, setClosedDates] = useState([]);
  const [newClosedDate, setNewClosedDate] = useState("");
  const [userAvatar, setUserAvatar] = useState(null);
  const [socialMedia, setSocialMedia] = useState({
    instagram: "", facebook: "", tiktok: "", youtube: "", twitter: ""
  });

  useEffect(() => {
    async function loadSalon() {
      const email = "salon@berber.al"; // Hardcoded for demo MVP
      const [salonResult, userResult] = await Promise.all([
        getSalon(),
        getUserByEmail(email)
      ]);

      if (userResult.success && userResult.user) {
        setUserAvatar(userResult.user.image);
      }

      if (salonResult.success && salonResult.salon) {
        const salonData = salonResult.salon;
        setSalon(salonData);
        setWhatsapp(result.salon.whatsapp || "");
        setHeroImages([
          result.salon.heroImage1 || null,
          result.salon.heroImage2 || null,
          result.salon.heroImage3 || null
        ]);
        setClosedDays(result.salon.closedDays ? result.salon.closedDays.split(',') : []);
        setClosedDates(result.salon.closedDates ? result.salon.closedDates.split(',') : []);
        setSocialMedia({
          instagram: result.salon.instagram || "",
          facebook: result.salon.facebook || "",
          tiktok: result.salon.tiktok || "",
          youtube: result.salon.youtube || "",
          twitter: result.salon.twitter || "",
        });
      }
    }
    loadSalon();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updatePassword("salon@berber.al", password);
    if (result.success) {
      alert("Fjalëkalimi u ndryshua me sukses!");
      setPassword("");
    } else {
      alert("Gabim: " + result.error);
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Fotoja është shumë e madhe! Maksimumi është 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      setUserAvatar(reader.result);
      setSavingSection('avatar');
      const result = await updateUserAvatar("salon@berber.al", reader.result);
      if (result.success) {
        alert("Avatari u përditësua me sukses!");
      } else {
        alert("Gabim: " + result.error);
      }
      setSavingSection(null);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Fotoja është shumë e madhe! Maksimumi është 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newImages = [...heroImages];
      newImages[index] = reader.result;
      setHeroImages(newImages);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSalon = async (section) => {
    if (!salon) return;
    setSavingSection(section);
    
    const result = await updateSalon(salon.id, {
      ...salon,
      whatsapp: whatsapp.trim() || null,
      heroImage1: heroImages[0],
      heroImage2: heroImages[1],
      heroImage3: heroImages[2],
      closedDays: closedDays.join(','),
      closedDates: closedDates.join(','),
      instagram: socialMedia.instagram.trim() || null,
      facebook: socialMedia.facebook.trim() || null,
      tiktok: socialMedia.tiktok.trim() || null,
      youtube: socialMedia.youtube.trim() || null,
      twitter: socialMedia.twitter.trim() || null,
    });

    if (result.success) {
      alert("Profili i sallonit u përditësua!");
    } else {
      alert("Gabim: " + result.error);
    }
    setSavingSection(null);
  };

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 style={{ fontSize: '2rem' }}>Cilësimet e Sallonit</h1>
        <p className="text-muted">Menaxhoni profilin dhe sigurinë e llogarisë suaj.</p>
      </div>

      <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        {/* User Profile Section */}
        <div className="card">
          <h3 className="mb-6">👤 Profili i Përdoruesit</h3>
          <p className="text-muted mb-6" style={{ fontSize: '0.85rem' }}>
            Ndryshoni foton e profilit tuaj (Avatar). Kjo foto do të shfaqet në panelin e administrimit.
          </p>
          <div className="flex items-center gap-6 mb-6">
            <div style={{ 
              width: '100px', height: '100px', 
              borderRadius: '50%', background: 'var(--surface-hover)', 
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--border)'
            }}>
              {userAvatar ? (
                <img src={userAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '2.5rem' }}>👤</span>
              )}
            </div>
            <div>
              <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.5rem 1rem', display: 'inline-block' }}>
                {savingSection === 'avatar' ? 'Duke u ngarkuar...' : (userAvatar ? 'Ndrysho Foton' : 'Ngarko Foto')}
                <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} disabled={savingSection === 'avatar'} />
              </label>
              {userAvatar && (
                <button 
                  onClick={async () => {
                    if (confirm("Jeni të sigurt që doni ta fshini avatarin?")) {
                      setUserAvatar(null);
                      await updateUserAvatar("salon@berber.al", null);
                    }
                  }}
                  className="text-error block mt-2" 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
                >
                  Fshi foton
                </button>
              )}
            </div>
          </div>
        </div>

        {/* WhatsApp Settings */}
        <div className="card">
          <h3 className="mb-6">💬 Aktivizo WhatsApp</h3>
          <p className="text-muted mb-6" style={{ fontSize: '0.85rem' }}>
            Fusni numrin tuaj të WhatsApp (me kodin e shtetit). Ky numër do të përdoret për kontakt direkt nga klientët.
          </p>
          <div className="mb-6">
            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Numri i WhatsApp</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📱</span>
              <input
                type="tel"
                className="card"
                style={{ flex: 1, background: 'var(--background)', padding: '0.8rem', fontFamily: 'monospace', fontSize: '1rem' }}
                placeholder="+355 69 123 4567"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>
            <p className="text-muted mt-2" style={{ fontSize: '0.78rem' }}>
              Shembull: +355691234567 (pa hapësira). Klientët do të mund t'ju kontaktojnë direkt me 1 klik.
            </p>
          </div>
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary mb-6"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#25D366', color: '#fff', border: 'none' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              Testo Lidhjen WhatsApp
            </a>
          )}
          <button onClick={() => handleSaveSalon('whatsapp')} className="btn btn-primary w-full" disabled={savingSection !== null}>
            {savingSection === 'whatsapp' ? "Duke u ruajtur..." : "Ruaj Numrin e WhatsApp ✨"}
          </button>
        </div>

        {/* Salon Profile Section */}
        <div className="card">
          <h3 className="mb-6">🖼️ Foto Hero (Slider)</h3>
          <p className="text-muted mb-6" style={{ fontSize: '0.85rem' }}>
            Shtoni deri në 3 foto që do të shfaqen si slider në krye të faqes suaj. 
            Maksimumi 2MB për foto.
          </p>
          
          <div className="grid gap-4 mb-6">
            {[0, 1, 2].map((index) => (
              <div key={index} className="flex items-center gap-4 p-4" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
                <div style={{ 
                  width: '80px', 
                  height: '60px', 
                  background: 'var(--background)', 
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border)'
                }}>
                  {heroImages[index] ? (
                    <img src={heroImages[index]} alt={`Hero ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '1.5rem', opacity: 0.3 }}>📷</span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    {heroImages[index] ? "Ndrysho Foton" : "Ngarko Foto"}
                    <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(index, e)} />
                  </label>
                  {heroImages[index] && (
                    <button 
                      onClick={() => {
                        const newImages = [...heroImages];
                        newImages[index] = null;
                        setHeroImages(newImages);
                      }}
                      className="text-error ml-4" 
                      style={{ fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Hiqe
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => handleSaveSalon('hero')} className="btn btn-primary w-full" disabled={savingSection !== null}>
            {savingSection === 'hero' ? "Duke u ruajtur..." : "Ruaj Fotot e Hero-s ✨"}
          </button>
        </div>

        {/* Schedule & Vacation Section */}
        <div className="card">
          <h3 className="mb-6">📅 Ditët e Pushimit & Oraret</h3>
          
          <div className="mb-8">
            <h4 className="mb-4" style={{ fontSize: '1rem', fontWeight: 600 }}>Ditët e pushimit javor</h4>
            <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>Zgjidhni cilat ditë të javës salloni është vazhdimisht i mbyllur.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: "1", label: "E Hënë" }, { val: "2", label: "E Martë" },
                { val: "3", label: "E Mërkurë" }, { val: "4", label: "E Enjte" },
                { val: "5", label: "E Premte" }, { val: "6", label: "E Shtunë" },
                { val: "0", label: "E Diel" }
              ].map(day => (
                <label key={day.val} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', background: 'var(--background)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <input 
                    type="checkbox" 
                    checked={closedDays.includes(day.val)}
                    onChange={(e) => {
                      if (e.target.checked) setClosedDays([...closedDays, day.val]);
                      else setClosedDays(closedDays.filter(d => d !== day.val));
                    }}
                  />
                  <span style={{ fontSize: '0.9rem' }}>{day.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4" style={{ fontSize: '1rem', fontWeight: 600 }}>Pushime Specifike / Data të mbyllura</h4>
            <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>Shtoni data specifike kur salloni do të jetë i mbyllur përkohësisht.</p>
            
            <div className="flex gap-2 mb-4">
              <input 
                type="date" 
                className="card flex-1" 
                style={{ background: 'var(--background)', padding: '0.8rem' }}
                value={newClosedDate}
                onChange={(e) => setNewClosedDate(e.target.value)}
              />
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  if (newClosedDate && !closedDates.includes(newClosedDate)) {
                    setClosedDates([...closedDates, newClosedDate].sort());
                    setNewClosedDate("");
                  }
                }}
              >
                Shto
              </button>
            </div>

            {closedDates.length > 0 && (
              <div className="grid gap-2 mb-6">
                {closedDates.map(date => (
                  <div key={date} className="flex justify-between items-center p-3" style={{ background: 'var(--background)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{date}</span>
                    <button 
                      onClick={() => setClosedDates(closedDates.filter(d => d !== date))}
                      className="text-error" 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Hiqe
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => handleSaveSalon('schedule')} className="btn btn-primary w-full mt-4" disabled={savingSection !== null}>
            {savingSection === 'schedule' ? "Duke u ruajtur..." : "Ruaj Konfigurimet e Orareve ✨"}
          </button>
        </div>

        {/* Social Media Section */}
        <div className="card">
          <h3 className="mb-6">📱 Rrjetet Sociale</h3>
          <p className="text-muted mb-6" style={{ fontSize: '0.85rem' }}>
            Shtoni lidhjet e rrjeteve tuaja sociale. Ato do të shfaqen nëk artat e sallonit nëk faqen kryesore.
          </p>

          {[
            { key: 'instagram', label: 'Instagram', icon: '📸', placeholder: 'https://instagram.com/salloniyt' },
            { key: 'facebook',  label: 'Facebook',  icon: '👥', placeholder: 'https://facebook.com/salloniyt' },
            { key: 'tiktok',   label: 'TikTok',    icon: '🎵', placeholder: 'https://tiktok.com/@salloniyt' },
            { key: 'youtube',  label: 'YouTube',   icon: '▶️', placeholder: 'https://youtube.com/@salloniyt' },
            { key: 'twitter',  label: 'Twitter/X', icon: '🐦', placeholder: 'https://x.com/salloniyt' },
          ].map(({ key, label, icon, placeholder }) => (
            <div key={key} className="mb-4">
              <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                {icon} {label}
              </label>
              <input
                type="url"
                className="card"
                style={{ width: '100%', background: 'var(--background)', padding: '0.8rem', fontFamily: 'monospace', fontSize: '0.9rem' }}
                placeholder={placeholder}
                value={socialMedia[key]}
                onChange={(e) => setSocialMedia({ ...socialMedia, [key]: e.target.value })}
              />
            </div>
          ))}

          <button onClick={() => handleSaveSalon('social')} className="btn btn-primary w-full mt-4" disabled={savingSection !== null}>
            {savingSection === 'social' ? 'Duke u ruajtur...' : 'Ruaj Rrjetet Sociale ✨'}
          </button>
        </div>

        {/* Security Section */}
        <div className="card">
          <h3 className="mb-6">🔑 Ndrysho Fjalëkalimin</h3>
          <form onSubmit={handlePasswordChange} className="grid gap-6">
            <div>
              <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Fjalëkalimi i Ri</label>
              <input 
                type="password" 
                className="card" 
                style={{ width: '100%', background: 'var(--background)', padding: '0.8rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary" disabled={saving || !password}>
                {saving ? "Duke u ruajtur..." : "Përditëso Fjalëkalimin"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
