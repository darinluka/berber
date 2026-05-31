"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSalonOwner } from "@/app/actions/auth";
import Logo from "../components/Logo";

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function RegisterSalon() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);

  useEffect(() => {
    if (step === 1 && typeof window !== "undefined") {
      const initGoogle = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: "128311836545-fomqs5niutugs5vv7fg564ll123mhi6t.apps.googleusercontent.com",
            callback: handleGoogleCredentialResponse,
          });

          window.google.accounts.id.renderButton(
            document.getElementById("realGoogleRegisterButton"),
            { 
              theme: "outline", 
              size: "large", 
              width: "100%", 
              text: "signup_with",
              shape: "rectangular"
            }
          );
        } else {
          setTimeout(initGoogle, 300);
        }
      };
      initGoogle();
    }
  }, [step]);

  const handleGoogleCredentialResponse = (response) => {
    setLoading(true);
    const payload = parseJwt(response.credential);
    if (!payload) {
      alert("Dështoi dekodimi i të dhënave të Google.");
      setLoading(false);
      return;
    }

    setIsGoogleAuth(true);
    setFormData(prev => ({
      ...prev,
      ownerName: payload.name,
      ownerEmail: payload.email
    }));
    setStep(2);
    setLoading(false);
  };

  const [formData, setFormData] = useState({
    salonName: "",
    address: "",
    phone: "",
    logo: "",
    ownerName: "",
    ownerEmail: "",
    password: ""
  });

  const [touched, setTouched] = useState({
    ownerName: false,
    ownerEmail: false,
    phone: false,
    password: false,
    salonName: false,
    address: false
  });

  const [toast, setToast] = useState({
    message: "",
    type: "error",
    visible: false
  });

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const showToast = (message, type = "error") => {
    setToast({ message, type, visible: true });
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail);
  const isPhoneValid = /^(\+3556[7-9]\d{7}|06[7-9]\d{7})$/.test(formData.phone.replace(/\s+/g, ""));
  const isPasswordValid = formData.password.length >= 8;
  const isOwnerNameValid = isGoogleAuth || formData.ownerName.trim().length >= 2;
  const isSalonNameValid = formData.salonName.trim().length >= 2;
  const isAddressValid = formData.address.trim().length >= 3;

  const getInputStyle = (fieldName, isValid, extraStyles = {}) => {
    const isFieldTouched = touched[fieldName];
    const baseStyle = {
      width: "100%",
      padding: "0.8rem",
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      fontSize: "1rem",
      outline: "none",
      color: "var(--foreground)",
      transition: "all 0.25s ease",
      ...extraStyles
    };

    if (!isFieldTouched) {
      return baseStyle;
    }

    if (isValid) {
      return {
        ...baseStyle,
        borderColor: "var(--success, #10b981)",
        boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.15)",
      };
    } else {
      return {
        ...baseStyle,
        borderColor: "var(--danger, #ef4444)",
        boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.15)",
      };
    }
  };

  const searchAddress = async (address) => {
    if (!address) return null;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", Tirana, Albania")}`);
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (error) {
      console.error("Location search failed", error);
    }
    return null;
  };

  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  const generateRandomPassword = () => {
    const length = 14;
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%*?&";
    
    let password = "";
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    setFormData(prev => ({ ...prev, password }));
    setShowPassword(true);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to trigger visual validation
    setTouched({
      ownerName: true,
      ownerEmail: true,
      phone: true,
      password: true,
      salonName: true,
      address: true
    });

    if (!isOwnerNameValid) {
      showToast("Ju lutem shkruani një emër dhe mbiemër të saktë.", "error");
      return;
    }

    if (!isEmailValid) {
      showToast("Ju lutem shkruani një email adresë të saktë.", "error");
      return;
    }

    if (!isPhoneValid) {
      showToast("Shkruani një numër celular shqiptar të saktë (+355 6X... ose 06X...).", "error");
      return;
    }

    if (!isPasswordValid) {
      showToast("Fjalëkalimi duhet të jetë të paktën 8 karaktere.", "error");
      return;
    }

    if (!isSalonNameValid) {
      showToast("Emri i sallonit duhet të ketë të paktën 2 karaktere.", "error");
      return;
    }

    if (!isAddressValid) {
      showToast("Adresa duhet të jetë e saktë (të paktën 3 karaktere).", "error");
      return;
    }

    setLoading(true);

    const salonResult = await registerSalonOwner({
      email: formData.ownerEmail,
      name: formData.ownerName,
      salonName: formData.salonName,
      address: formData.address,
      password: formData.password,
      phone: formData.phone
    });

    if (salonResult.success) {
      showToast("Salloni u regjistrua me sukses! Kërkesa juaj është në pritje të aprovimit nga administratori. Ju lutemi kontrolloni email-in tuaj.", "success");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } else {
      showToast("Gabim: " + salonResult.error, "error");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', padding: '2rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '650px', padding: '3.5rem', boxShadow: 'var(--shadow-xl)', background: 'var(--background)' }}>
        


        <div className="text-center mb-12">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <Logo initialTitle="Berber.al" />
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Regjistrim Salloni</h1>
          <p className="text-muted mt-3" style={{ fontSize: '1.1rem' }}>Shtoni sallonin tuaj në platformën më të madhe në Shqipëri.</p>
        </div>

        {step === 1 && (
          <div className="fade-in">
            <div className="grid gap-4">
              {/* Real Google Sign Up Button */}
              <div
                id="realGoogleRegisterButton"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', minHeight: '44px' }}
              ></div>
              
              <div style={{ margin: '2.5rem 0', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                <span className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 500 }}>ose manualisht</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', borderRadius: 'var(--radius-lg)' }}
                onClick={() => { setIsGoogleAuth(false); setStep(2); }}
              >
                Vazhdo me Email & Telefon
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="fade-in grid gap-8">
            
            {/* Section 1: Personal Info */}
            <div className="grid gap-6">
              <div className="flex items-center gap-3 mb-2">
                <span style={{ background: 'var(--primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>1</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Të dhënat Personale</h3>
              </div>
              
              {isGoogleAuth ? (
                <div className="p-4" style={{ background: 'rgba(194,149,69,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>Identifikuar përmes Google:</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700 }}>{formData.ownerEmail}</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-muted mb-2" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>Emri & Mbiemri</label>
                    <input type="text" className="card" style={getInputStyle("ownerName", isOwnerNameValid)} placeholder="Altin Duka" required 
                      value={formData.ownerName} 
                      onChange={e => setFormData({...formData, ownerName: e.target.value})}
                      onBlur={() => setTouched(prev => ({ ...prev, ownerName: true }))} />
                    {touched.ownerName && !isOwnerNameValid && (
                      <p style={{ color: "var(--danger, #ef4444)", fontSize: "0.75rem", marginTop: "0.35rem", fontWeight: 500 }} className="fade-in">
                        ⚠️ Emri duhet të ketë të paktën 2 karaktere.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-muted mb-2" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>Email Adresa</label>
                    <input type="email" className="card" style={getInputStyle("ownerEmail", isEmailValid)} placeholder="altin@gmail.com" required 
                      value={formData.ownerEmail} 
                      onChange={e => setFormData({...formData, ownerEmail: e.target.value})}
                      onBlur={() => setTouched(prev => ({ ...prev, ownerEmail: true }))} />
                    {touched.ownerEmail && !isEmailValid && (
                      <p style={{ color: "var(--danger, #ef4444)", fontSize: "0.75rem", marginTop: "0.35rem", fontWeight: 500 }} className="fade-in">
                        ⚠️ Ju lutem shkruani një email adresë të saktë.
                      </p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="text-muted mb-2" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>Numri i Telefonit</label>
                <input type="tel" className="card" style={getInputStyle("phone", isPhoneValid)} placeholder="+355 6X XX XX XXX" required 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  onBlur={() => setTouched(prev => ({ ...prev, phone: true }))} />
                {touched.phone && !isPhoneValid && (
                  <p style={{ color: "var(--danger, #ef4444)", fontSize: "0.75rem", marginTop: "0.35rem", fontWeight: 500 }} className="fade-in">
                    ⚠️ Shkruani një numër celular shqiptar të saktë (p.sh. +355 68 123 4567 ose 069 123 4567).
                  </p>
                )}
              </div>

              {/* Fjalëkalimi */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <label className="text-muted" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>
                    Fjalëkalimi për Hyrje
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--primary)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: 0,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      transition: "color 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.color = "var(--primary-hover)"}
                    onMouseLeave={(e) => e.target.style.color = "var(--primary)"}
                  >
                    ⚡ Gjenero të Sigurt
                  </button>
                </div>
                
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="card"
                    style={getInputStyle("password", isPasswordValid, { paddingRight: "3rem" })}
                    placeholder="••••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      fontSize: "1.1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "32px",
                      height: "32px",
                    }}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {touched.password && !isPasswordValid && (
                  <p style={{ color: "var(--danger, #ef4444)", fontSize: "0.75rem", marginTop: "0.35rem", fontWeight: 500 }} className="fade-in">
                    ⚠️ Fjalëkalimi duhet të jetë të paktën 8 karaktere.
                  </p>
                )}

                {passwordCopied && (
                  <p style={{
                    fontSize: "0.75rem",
                    color: "var(--success, #10b981)",
                    marginTop: "0.25rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }} className="fade-in">
                    ✅ Fjalëkalim i sigurt u gjenerua! Kopjoje dhe ruaje.
                  </p>
                )}

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div style={{ marginTop: "0.75rem" }}>
                    <div style={{ display: "flex", gap: "4px", marginBottom: "0.5rem" }}>
                      {[1, 2, 3, 4].map((bar) => {
                        const pw = formData.password || "";
                        const criteria = [
                          pw.length >= 8,
                          /[A-Z]/.test(pw),
                          /\d/.test(pw),
                          /[!@#$%*?&]/.test(pw)
                        ];
                        const score = criteria.filter(Boolean).length;
                        
                        let color = "var(--border)";
                        if (score >= bar) {
                          if (score === 1) color = "#ef4444"; // Red
                          else if (score === 2) color = "#f97316"; // Orange
                          else if (score === 3) color = "#eab308"; // Yellow
                          else color = "#10b981"; // Green
                        }
                        
                        return (
                          <div
                            key={bar}
                            style={{
                              flex: 1,
                              height: "4px",
                              backgroundColor: color,
                              borderRadius: "2px",
                              transition: "background-color 0.3s ease"
                            }}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Strength label */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)" }}>
                        Siguria e fjalëkalimit:
                      </span>
                      <span style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: (() => {
                          const pw = formData.password || "";
                          const criteria = [pw.length >= 8, /[A-Z]/.test(pw), /\d/.test(pw), /[!@#$%*?&]/.test(pw)];
                          const score = criteria.filter(Boolean).length;
                          if (score === 1) return "#ef4444";
                          if (score === 2) return "#f97316";
                          if (score === 3) return "#eab308";
                          if (score === 4) return "#10b981";
                          return "var(--text-muted)";
                        })()
                      }}>
                        {(() => {
                          const pw = formData.password || "";
                          const criteria = [pw.length >= 8, /[A-Z]/.test(pw), /\d/.test(pw), /[!@#$%*?&]/.test(pw)];
                          const score = criteria.filter(Boolean).length;
                          if (score === 1) return "Shumë i dobët";
                          if (score === 2) return "I dobët";
                          if (score === 3) return "Mesatar (I mirë)";
                          if (score === 4) return "Shumë i fortë (I shkëlqyer)";
                          return "Shkruani fjalëkalimin";
                        })()}
                      </span>
                    </div>

                    {/* Criteria checklist */}
                    <div style={{
                      marginTop: "0.5rem",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.25rem 0.75rem",
                      padding: "0.5rem",
                      backgroundColor: "rgba(128,128,128,0.03)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)"
                    }}>
                      {[
                        { label: "Të paktën 8 karaktere", met: formData.password?.length >= 8 },
                        { label: "Shkronjë të madhe (A-Z)", met: /[A-Z]/.test(formData.password || "") },
                        { label: "Të paktën një numër", met: /\d/.test(formData.password || "") },
                        { label: "Karakter special (!@#$%)", met: /[!@#$%*?&]/.test(formData.password || "") }
                      ].map((crit, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.68rem" }}>
                          <span style={{ color: crit.met ? "#10b981" : "var(--text-muted)" }}>
                            {crit.met ? "●" : "○"}
                          </span>
                          <span style={{ color: crit.met ? "var(--foreground)" : "var(--text-muted)", fontWeight: crit.met ? 500 : 400 }}>
                            {crit.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

            {/* Section 2: Salon Info */}
            <div className="grid gap-6">
              <div className="flex items-center gap-3 mb-2">
                <span style={{ background: 'var(--primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>2</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Detajet e Sallonit</h3>
              </div>

              <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                <div>
                  <label className="text-muted mb-2" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>Emri i Sallonit</label>
                  <input type="text" className="card" style={getInputStyle("salonName", isSalonNameValid)} placeholder="P.sh. Golden Scissors" required 
                    value={formData.salonName} 
                    onChange={e => setFormData({...formData, salonName: e.target.value})}
                    onBlur={() => setTouched(prev => ({ ...prev, salonName: true }))} />
                  {touched.salonName && !isSalonNameValid && (
                    <p style={{ color: "var(--danger, #ef4444)", fontSize: "0.75rem", marginTop: "0.35rem", fontWeight: 500 }} className="fade-in">
                      ⚠️ Emri i sallonit duhet të ketë të paktën 2 karaktere.
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-muted mb-2" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>Qyteti & Adresa</label>
                  <input type="text" className="card" style={getInputStyle("address", isAddressValid)} placeholder="Tiranë, Rruga..." required 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    onBlur={() => setTouched(prev => ({ ...prev, address: true }))} />
                  {touched.address && !isAddressValid && (
                    <p style={{ color: "var(--danger, #ef4444)", fontSize: "0.75rem", marginTop: "0.35rem", fontWeight: 500 }} className="fade-in">
                      ⚠️ Adresa duhet të jetë e saktë (të paktën 3 karaktere).
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '1rem' }} onClick={() => setStep(1)}>Mbrapa</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '1rem' }} disabled={loading}>
                {loading ? "Duke u krijuar..." : "Hap Sallonin Tënd 🚀"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-12 text-center" style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
          <p className="text-muted" style={{ fontSize: '1rem' }}>
            Keni një sallon? <Link href="/login" className="text-primary" style={{ fontWeight: 700 }}>Identifikohu këtu</Link>
          </p>
        </div>

        {/* Toast Notification */}
        <div style={{
          position: 'fixed',
          bottom: toast.visible ? '2.5rem' : '-5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: toast.visible ? 1 : 0,
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-lg, 12px)',
          background: 'var(--surface)',
          border: `1px solid ${toast.type === 'success' ? 'var(--success, #10b981)' : 'var(--danger, #ef4444)'}`,
          boxShadow: toast.type === 'success' 
            ? '0 10px 30px -5px rgba(16, 185, 129, 0.25), 0 0 1px 1px rgba(16, 185, 129, 0.1) inset'
            : '0 10px 30px -5px rgba(239, 68, 68, 0.25), 0 0 1px 1px rgba(239, 68, 68, 0.1) inset',
          color: 'var(--foreground)',
          maxWidth: '90vw',
          width: '450px',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}>
          <span style={{ fontSize: '1.25rem' }}>
            {toast.type === 'success' ? '✅' : '⚠️'}
          </span>
          <div style={{ flex: 1, fontSize: '0.925rem', fontWeight: 600, lineHeight: 1.4 }}>
            {toast.message}
          </div>
          <button 
            type="button" 
            onClick={() => setToast(prev => ({ ...prev, visible: false }))}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-muted)', 
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0 0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
