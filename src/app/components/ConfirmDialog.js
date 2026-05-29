"use client";

import { useEffect } from "react";

export default function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Fshi", 
  cancelText = "Anulo", 
  isDestructive = true 
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(9, 9, 11, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "1.5rem",
        animation: "confirmFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards"
      }}
      onClick={onCancel}
    >
      <div 
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.15)",
          padding: "2rem",
          position: "relative",
          animation: "confirmSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          color: "var(--foreground)"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: isDestructive ? "rgba(239, 68, 68, 0.12)" : "rgba(194, 149, 69, 0.12)",
            color: isDestructive ? "var(--danger)" : "var(--primary)",
            fontSize: "1.75rem",
            marginBottom: "1.25rem"
          }}>
            {isDestructive ? "⚠️" : "❓"}
          </div>
          <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>
            {title}
          </h3>
          <p style={{ 
            marginTop: "0.75rem", 
            fontSize: "0.925rem", 
            color: "var(--text-muted)", 
            lineHeight: 1.5,
            margin: "0.75rem 0 0 0" 
          }}>
            {message}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem" }}>
          <button 
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "0.8rem 1.5rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--foreground)",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-hover)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            {cancelText}
          </button>
          <button 
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "0.8rem 1.5rem",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: isDestructive ? "var(--danger)" : "var(--primary)",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: isDestructive 
                ? "0 4px 14px rgba(239, 68, 68, 0.3)" 
                : "0 4px 14px rgba(194, 149, 69, 0.3)"
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            {confirmText}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes confirmFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes confirmSlideUp {
          from { transform: translateY(16px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
