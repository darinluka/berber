"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Logo from "../components/Logo";
import { loginUser, loginOrRegisterWithGoogle } from "../actions/auth";

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

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [approvedSalonName, setApprovedSalonName] = useState("");



  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await loginUser(email, password);

      if (!result.success) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      // If salon owner and just got approved (first login after approval)
      if (result.role === "SALON_OWNER" && result.salonApproved) {
        const key = `welcomed_${email}`;
        const alreadyWelcomed = typeof window !== "undefined" && localStorage.getItem(key);
        if (!alreadyWelcomed) {
          setApprovedSalonName(result.salonName || "");
          setShowWelcomePopup(true);
          if (typeof window !== "undefined") {
            localStorage.setItem(key, "1");
          }
          setIsLoading(false);
          return;
        }
      }

      router.push(result.redirectTo || "/");
    } catch (err) {
      setError("Gabim i papritur. Provo sërish.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const initGoogle = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: "128311836545-fomqs5niutugs5vv7fg564ll123mhi6t.apps.googleusercontent.com",
            callback: handleGoogleCredentialResponse,
          });

          window.google.accounts.id.renderButton(
            document.getElementById("realGoogleButton"),
            { 
              theme: "outline", 
              size: "large", 
              width: "100%", 
              text: "continue_with",
              shape: "rectangular"
            }
          );
        } else {
          setTimeout(initGoogle, 300);
        }
      };
      initGoogle();
    }
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    setIsLoading(true);
    setError("");
    try {
      const payload = parseJwt(response.credential);
      if (!payload) {
        setError("Dështoi dekodimi i të dhënave të Google.");
        setIsLoading(false);
        return;
      }

      const googleId = `google_id_${payload.sub}`;
      const result = await loginOrRegisterWithGoogle({
        googleId,
        email: payload.email,
        name: payload.name,
        image: payload.picture,
        role: "CLIENT", // Default role
      });

      if (!result.success) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (result.role === "SALON_OWNER" && result.salonApproved) {
        const key = `welcomed_${payload.email}`;
        const alreadyWelcomed = typeof window !== "undefined" && localStorage.getItem(key);
        if (!alreadyWelcomed) {
          setApprovedSalonName(result.salonName || "");
          setShowWelcomePopup(true);
          if (typeof window !== "undefined") {
            localStorage.setItem(key, "1");
          }
          setIsLoading(false);
          return;
        }
      }

      router.push(result.redirectTo || "/");
    } catch (err) {
      console.error(err);
      setError("Dështoi hyrja me Google. Provo përsëri.");
      setIsLoading(false);
    }
  };

  const handleWelcomeContinue = () => {
    setShowWelcomePopup(false);
    router.push("/dashboard");
  };



  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.logo} style={{ display: "flex", justifyContent: "center" }}>
          <Link href="/">
            <Logo initialTitle="Berber.al" />
          </Link>
        </div>

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className="input"
              placeholder="emri@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Fjalëkalimi</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              color: "#ef4444",
              fontSize: "0.875rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? "Duke hyrë..." : "Hyr në llogari"}
          </button>
        </form>

        <div style={{ margin: "1.5rem 0", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }}></div>
          <span className="text-muted" style={{ fontSize: "0.85rem", fontWeight: 500 }}>ose</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }}></div>
        </div>

        <div 
          id="realGoogleButton" 
          style={{ 
            width: "100%", 
            display: "flex", 
            justifyContent: "center", 
            marginBottom: "1rem" 
          }}
        ></div>

        <div className={styles.footer}>
          Nuk keni llogari?{" "}
          <Link href="/register-salon">Regjistro Sallonin Tënd</Link>
        </div>
      </div>

      {/* Welcome Popup - shown first time after salon approval */}
      {showWelcomePopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(9, 9, 11, 0.82)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "1.5rem",
            animation: "welcomeFadeIn 0.3s ease-out forwards"
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              background: "var(--surface, #1a1a1a)",
              border: "1px solid var(--border, #333)",
              borderRadius: "20px",
              padding: "2.5rem 2rem",
              textAlign: "center",
              boxShadow: "0 30px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(194,149,69,0.15)",
              animation: "welcomeSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
            }}
          >
            {/* Animated checkmark */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))",
              border: "2px solid rgba(16,185,129,0.3)",
              fontSize: "2.5rem",
              marginBottom: "1.5rem",
              animation: "welcomePulse 2s infinite ease-in-out"
            }}>
              ✅
            </div>

            <h2 style={{
              margin: "0 0 0.5rem 0",
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--foreground, #fff)",
              fontFamily: "var(--font-heading, sans-serif)"
            }}>
              Përshëndetje! Verifikimi u krye! 🎉
            </h2>

            <p style={{
              color: "#10b981",
              fontWeight: 600,
              fontSize: "0.95rem",
              margin: "0 0 1rem 0"
            }}>
              {approvedSalonName && `"${approvedSalonName}" është aktivizuar me sukses`}
            </p>

            <p style={{
              color: "var(--text-muted, #888)",
              fontSize: "0.9rem",
              lineHeight: 1.6,
              margin: "0 0 1.75rem 0"
            }}>
              Tani ju mund të përdorni të gjitha shërbimet e{" "}
              <strong style={{ color: "var(--primary, #c29545)" }}>Berber.al</strong> —
              menaxhoni stafin, rezervimet, shërbimet dhe shumë më tepër.
            </p>

            <div style={{
              background: "rgba(194,149,69,0.08)",
              border: "1px solid rgba(194,149,69,0.2)",
              borderRadius: "10px",
              padding: "1rem",
              marginBottom: "2rem",
              fontSize: "0.85rem",
              color: "var(--text-muted, #888)",
              lineHeight: 1.5
            }}>
              Na kontaktoni për çdo pakënaqësi ose shërbim që duhet shtuar
            </div>

            <button
              onClick={handleWelcomeContinue}
              style={{
                width: "100%",
                padding: "0.9rem 2rem",
                background: "linear-gradient(135deg, #c29545, #d4a855)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(194,149,69,0.4)",
                transition: "all 0.2s",
                letterSpacing: "0.01em"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(194,149,69,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(194,149,69,0.4)"; }}
            >
              Hap Dashboard-in →
            </button>
          </div>

          <style>{`
            @keyframes welcomeFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes welcomeSlideUp {
              from { transform: translateY(24px) scale(0.95); opacity: 0; }
              to { transform: translateY(0) scale(1); opacity: 1; }
            }
            @keyframes welcomePulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.06); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

