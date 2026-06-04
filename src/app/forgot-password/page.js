"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "../components/Logo";
import { sendPasswordResetCode, checkResetCode, resetPasswordWithCode } from "../actions/auth";

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const res = await sendPasswordResetCode(email);
      if (res.success) {
        setSuccess("Kodi i rivendosjes u dërgua me sukses në email-in tuaj.");
        setStep(2);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError("Gabim i papritur. Ju lutem provoni sërish.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const res = await checkResetCode(email, code);
      if (res.success) {
        setStep(3);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError("Gabim i papritur. Ju lutem provoni sërish.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (password !== confirmPassword) {
      setError("Fjalëkalimet nuk përputhen.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPasswordWithCode(email, code, password);
      if (res.success) {
        setSuccess("Fjalëkalimi u ndryshua me sukses! Po ju ridrejtojmë tek faqja e hyrjes...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError("Gabim i papritur. Ju lutem provoni sërish.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.logo} style={{ display: "flex", justifyContent: "center" }}>
          <Link href="/">
            <Logo initialTitle="Berber.al" />
          </Link>
        </div>

        <h2 style={{ 
          fontSize: '1.25rem', 
          textAlign: 'center', 
          marginBottom: '1.5rem', 
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          color: 'var(--foreground)'
        }}>
          {step === 1 && "Rivendosni Fjalëkalimin"}
          {step === 2 && "Verifikoni Kodin"}
          {step === 3 && "Krijoni Fjalëkalim të Ri"}
        </h2>

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

        {success && (
          <div style={{
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: "8px",
            padding: "0.75rem 1rem",
            color: "#10b981",
            fontSize: "0.875rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            ✅ {success}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendCode}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email i llogarisë tuaj</label>
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
            <button
              type="submit"
              className={`btn btn-primary ${styles.submitBtn}`}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? "Duke dërguar..." : "Dërgo Kodin e Verifikimit"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
              Një kod verifikimi 6-shifror është dërguar në <strong>{email}</strong>.
            </p>
            <div className={styles.formGroup}>
              <label className={styles.label}>Kodi i Verifikimit (OTP)</label>
              <input
                type="text"
                className="input"
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={isLoading}
                style={{ textAlign: 'center', letterSpacing: '0.2rem', fontSize: '1.2rem', fontWeight: 'bold' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '40%', padding: '0.875rem', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                onClick={() => setStep(1)}
                disabled={isLoading}
              >
                Mbrapa
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.875rem', borderRadius: 'var(--radius-md)' }}
                disabled={isLoading}
              >
                {isLoading ? "Duke verifikuar..." : "Vazhdo"}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Fjalëkalimi i ri</label>
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
            <div className={styles.formGroup}>
              <label className={styles.label}>Konfirmoni fjalëkalimin</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className={`btn btn-primary ${styles.submitBtn}`}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? "Duke ndryshuar..." : "Ndrysho Fjalëkalimin"}
            </button>
          </form>
        )}

        <div className={styles.footer}>
          Kthehu tek <Link href="/login">Hyrja në Llogari</Link>
        </div>
      </div>
    </div>
  );
}
