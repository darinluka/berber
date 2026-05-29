"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyOtpCode, sendVerificationCode } from "@/app/actions/auth";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const next = searchParams.get("next") || "/register?step=2";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);
    setError("");

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (cleaned && index === 5) {
      const code = [...newDigits.slice(0, 5), cleaned].join("");
      if (code.length === 6) handleVerify(code);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (codeOverride) => {
    const code = codeOverride || digits.join("");
    if (code.length < 6) {
      setError("Ju lutem plotësoni të gjitha 6 shifrat.");
      return;
    }
    setLoading(true);
    setError("");

    const result = await verifyOtpCode(email, code);
    if (result.success) {
      // Redirect to next step (register step 2)
      router.push(`/register?step=2&email=${encodeURIComponent(email)}&verified=1`);
    } else {
      setError(result.error || "Kodi është i pasaktë.");
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError("");
    const result = await sendVerificationCode(email);
    if (result.success) {
      setResendCooldown(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } else {
      setError(result.error || "Gabim gjatë ridërgimit.");
    }
    setResending(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--background)",
      padding: "2rem",
    }}>
      <div className="card fade-in" style={{ width: "100%", maxWidth: "480px", padding: "3rem" }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" style={{ fontSize: "2rem", fontWeight: 800, textDecoration: "none", color: "var(--foreground)" }}>
            Berberi<span className="text-primary">.al</span>
          </Link>
        </div>

        {/* Icon */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "50%",
            background: "rgba(194,149,69,0.12)", border: "2px solid var(--primary)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem",
          }}>✉️</div>
        </div>

        <h1 style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          Verifikoni Emailin
        </h1>
        <p className="text-muted" style={{ textAlign: "center", marginBottom: "2rem", fontSize: "0.9rem" }}>
          Kemi dërguar një kod 6-shifror tek<br />
          <strong style={{ color: "var(--foreground)" }}>{email}</strong>
        </p>

        {/* 6 Digit Inputs */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginBottom: "1.5rem" }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              autoFocus={i === 0}
              style={{
                width: "52px",
                height: "64px",
                textAlign: "center",
                fontSize: "1.75rem",
                fontWeight: 700,
                fontFamily: "monospace",
                borderRadius: "var(--radius-md)",
                border: error
                  ? "2px solid var(--error)"
                  : d
                  ? "2px solid var(--primary)"
                  : "2px solid var(--border)",
                background: "var(--surface)",
                color: "var(--foreground)",
                outline: "none",
                transition: "border-color 0.2s, transform 0.1s",
                transform: d ? "scale(1.05)" : "scale(1)",
              }}
            />
          ))}
        </div>

        {error && (
          <p style={{
            color: "var(--error, #ef4444)", textAlign: "center",
            fontSize: "0.875rem", marginBottom: "1rem",
            padding: "0.75rem", background: "rgba(239,68,68,0.08)",
            borderRadius: "var(--radius-md)", border: "1px solid rgba(239,68,68,0.2)"
          }}>
            ⚠️ {error}
          </p>
        )}

        <button
          onClick={() => handleVerify()}
          disabled={loading || digits.join("").length < 6}
          className="btn btn-primary w-full"
          style={{ padding: "1rem", fontSize: "1rem", marginBottom: "1rem" }}
        >
          {loading ? "Duke verifikuar..." : "Verifiko Kodin ✓"}
        </button>

        <div style={{ textAlign: "center" }}>
          <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>
            Nuk e morët kodin?
          </p>
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || resending}
            style={{
              background: "none", border: "none", cursor: resendCooldown > 0 ? "default" : "pointer",
              color: resendCooldown > 0 ? "var(--text-muted)" : "var(--primary)",
              fontWeight: 600, fontSize: "0.9rem",
            }}
          >
            {resending ? "Duke dërguar..." : resendCooldown > 0 ? `Ridërgo kodin (${resendCooldown}s)` : "Ridërgo Kodin"}
          </button>
        </div>

        <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)", textAlign: "center" }}>
          <Link href="/register" className="text-muted" style={{ fontSize: "0.85rem" }}>
            ← Kthehu tek Regjistrimi
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <VerifyForm />
    </Suspense>
  );
}
