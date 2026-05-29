"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { sendVerificationCode, registerSalonOwner } from "@/app/actions/auth";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  // Step 1: enter email → send OTP
  // Step 2: fill salon details (after OTP verified)
  const stepParam = searchParams.get("step");
  const emailParam = searchParams.get("email") || "";
  const verified = searchParams.get("verified") === "1";

  const [step, setStep] = useState(stepParam === "2" && verified ? 2 : 1);

  const [email, setEmail] = useState(emailParam);
  const [formData, setFormData] = useState({
    ownerName: "",
    salonName: "",
    address: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    ownerName: false,
    salonName: false,
    address: false,
    password: false
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

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = formData.password.length >= 8;
  const isOwnerNameValid = formData.ownerName.trim().length >= 2;
  const isSalonNameValid = formData.salonName.trim().length >= 2;
  const isAddressValid = formData.address.trim().length >= 3;

  const getInputStyle = (fieldName, isValid, extraStyles = {}) => {
    const isFieldTouched = fieldName === "email" ? touched.email : touched[fieldName];
    const baseStyle = {
      width: "100%",
      padding: "1rem",
      background: "var(--background)",
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

  useEffect(() => {
    if (stepParam === "2" && verified && emailParam) {
      setStep(2);
      setEmail(emailParam);
    }
  }, [stepParam, verified, emailParam]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setTouched(prev => ({ ...prev, email: true }));
    
    if (!isEmailValid) {
      showToast("Ju lutem shkruani një email adresë të saktë.", "error");
      return;
    }

    setLoading(true);
    const result = await sendVerificationCode(email);
    if (result.success) {
      showToast("Kodi i verifikimit u dërgua me sukses!", "success");
      setTimeout(() => {
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      }, 1500);
    } else {
      showToast(result.error || "Gabim gjatë dërgimit të kodit.", "error");
    }
    setLoading(false);
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

  const handleSubmitSalon = async (e) => {
    e.preventDefault();
    
    setTouched({
      email: true,
      ownerName: true,
      salonName: true,
      address: true,
      password: true
    });

    if (!isOwnerNameValid) {
      showToast("Ju lutem shkruani një emër dhe mbiemër të saktë.", "error");
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

    if (!isPasswordValid) {
      showToast("Fjalëkalimi duhet të jetë të paktën 8 karaktere.", "error");
      return;
    }

    setLoading(true);
    const result = await registerSalonOwner({
      email,
      name: formData.ownerName,
      salonName: formData.salonName,
      address: formData.address,
      password: formData.password,
    });
    if (result.success) {
      showToast("Salloni u krijua me sukses! Po ju ridrejtojmë...", "success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } else {
      showToast(result.error || "Gabim gjatë regjistrimit.", "error");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--background)", padding: "2rem",
    }}>
      <div className="card fade-in" style={{ width: "100%", maxWidth: "520px", padding: "3rem" }}>

        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" style={{ fontSize: "2rem", fontWeight: 800, textDecoration: "none", color: "var(--foreground)" }}>
            Berberi<span className="text-primary">.al</span>
          </Link>
        </div>

        {/* Progress Indicator */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2.5rem", alignItems: "center", justifyContent: "center" }}>
          {[1, 2].map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: "0.85rem",
                background: step >= s ? "var(--primary)" : "var(--surface)",
                color: step >= s ? "#fff" : "var(--text-muted)",
                border: step >= s ? "none" : "2px solid var(--border)",
                transition: "all 0.3s",
              }}>{s}</div>
              {s < 2 && (
                <div style={{
                  width: "48px", height: "2px",
                  background: step > s ? "var(--primary)" : "var(--border)",
                  transition: "background 0.3s",
                }} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="fade-in">
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              🏬 Regjistro Sallonin Tënd
            </h1>
            <p className="text-muted" style={{ marginBottom: "2rem", fontSize: "0.9rem" }}>
              Futni emailin tuaj dhe do t'ju dërgojmë një kod verifikimi.
            </p>

            <form onSubmit={handleSendOtp} className="grid gap-4">
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>
                  Adresa Email
                </label>
                <input
                  type="email"
                  className="card"
                  style={getInputStyle("email", isEmailValid)}
                  placeholder="emri@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); }}
                  onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                  required
                  autoFocus
                />
                {touched.email && !isEmailValid && (
                  <p style={{ color: "var(--danger, #ef4444)", fontSize: "0.75rem", marginTop: "0.35rem", fontWeight: 500 }} className="fade-in">
                    ⚠️ Ju lutem shkruani një email adresë të saktë.
                  </p>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: "1rem", fontSize: "1rem" }} disabled={loading}>
                {loading ? "Duke dërguar kodin..." : "Dërgo Kodin e Verifikimit →"}
              </button>

              <div className="text-center">
                <Link href="/login" className="text-muted" style={{ fontSize: "0.85rem" }}>
                  Keni llogari? Hyni këtu
                </Link>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              ✅ Email u Verifikua!
            </h1>
            <p className="text-muted" style={{ marginBottom: "2rem", fontSize: "0.9rem" }}>
              Plotësoni detajet e sallonit tuaj për të vazhduar.
            </p>

            <form onSubmit={handleSubmitSalon} className="grid gap-4">
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>
                  Emri Juaj
                </label>
                <input
                  type="text"
                  className="card"
                  style={getInputStyle("ownerName", isOwnerNameValid)}
                  placeholder="Altin Duka"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  onBlur={() => setTouched(prev => ({ ...prev, ownerName: true }))}
                  required
                  autoFocus
                />
                {touched.ownerName && !isOwnerNameValid && (
                  <p style={{ color: "var(--danger, #ef4444)", fontSize: "0.75rem", marginTop: "0.35rem", fontWeight: 500 }} className="fade-in">
                    ⚠️ Emri duhet të ketë të paktën 2 karaktere.
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>
                  Emri i Sallonit
                </label>
                <input
                  type="text"
                  className="card"
                  style={getInputStyle("salonName", isSalonNameValid)}
                  placeholder="Salloni Elegant"
                  value={formData.salonName}
                  onChange={(e) => setFormData({ ...formData, salonName: e.target.value })}
                  onBlur={() => setTouched(prev => ({ ...prev, salonName: true }))}
                  required
                />
                {touched.salonName && !isSalonNameValid && (
                  <p style={{ color: "var(--danger, #ef4444)", fontSize: "0.75rem", marginTop: "0.35rem", fontWeight: 500 }} className="fade-in">
                    ⚠️ Emri i sallonit duhet të ketë të paktën 2 karaktere.
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>
                  Adresa
                </label>
                <input
                  type="text"
                  className="card"
                  style={getInputStyle("address", isAddressValid)}
                  placeholder="Rruga e Kavajës, Tiranë"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
                  required
                />
                {touched.address && !isAddressValid && (
                  <p style={{ color: "var(--danger, #ef4444)", fontSize: "0.75rem", marginTop: "0.35rem", fontWeight: 500 }} className="fade-in">
                    ⚠️ Adresa duhet të jetë e saktë (të paktën 3 karaktere).
                  </p>
                )}
              </div>

              {/* Fjalëkalimi */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600 }}>
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

              <button type="submit" className="btn btn-primary" style={{ padding: "1rem", fontSize: "1rem" }} disabled={loading}>
                {loading ? "Duke krijuar sallonin..." : "Hap Sallonin 🏬"}
              </button>
            </form>
          </div>
        )}

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

export default function Register() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
