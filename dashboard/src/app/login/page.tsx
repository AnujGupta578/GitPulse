"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../components/AuthProvider";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [particles, setParticles] = useState<{ x: number; y: number; size: number; delay: number }[]>([]);

  // Generate decorative particles client-side only
  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: i * 0.3,
    })));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name || undefined);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGitHub = () => {
    window.location.href = `${API}/api/auth/github/connect`;
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* Animated background gradient orbs */}
      <div style={{
        position: "absolute", top: "-20%", left: "-10%",
        width: "600px", height: "600px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,242,255,0.07) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: "-20%", right: "-10%",
        width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: "50%",
            background: i % 2 === 0 ? "rgba(0,242,255,0.4)" : "rgba(139,92,246,0.4)",
            pointerEvents: "none"
          }}
          animate={{ y: [-10, 10, -10], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4 + p.delay, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        />
      ))}

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          width: "100%", maxWidth: "440px", margin: "1.5rem",
          background: "rgba(10,14,20,0.85)",
          border: "1px solid rgba(0,242,255,0.15)",
          borderRadius: "20px",
          backdropFilter: "blur(24px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
          overflow: "hidden",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Top gradient bar */}
        <div style={{
          height: "3px",
          background: "linear-gradient(90deg, var(--accent-cyan), var(--accent-violet), var(--accent-cyan))",
          backgroundSize: "200% 100%",
          animation: "shimmer 3s linear infinite",
        }} />

        <div style={{ padding: "2.5rem" }}>
          {/* Logo + brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
            <div style={{
              width: "38px", height: "38px", borderRadius: "10px",
              background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem", flexShrink: 0
            }}>⚡</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>GitPulse</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", letterSpacing: "0.08em" }}>AI ORCHESTRATION PLATFORM</div>
            </div>
          </div>

          {/* Mode toggle */}
          <div style={{
            display: "flex", background: "rgba(255,255,255,0.04)",
            borderRadius: "10px", padding: "4px", marginBottom: "2rem",
            border: "1px solid var(--glass-border)"
          }}>
            {(["login", "register"] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                style={{
                  flex: 1, padding: "0.6rem", borderRadius: "7px",
                  border: "none", cursor: "pointer", fontWeight: 600,
                  fontSize: "0.85rem", transition: "all 0.2s",
                  background: mode === m ? "rgba(0,242,255,0.12)" : "transparent",
                  color: mode === m ? "var(--accent-cyan)" : "var(--text-secondary)",
                  boxShadow: mode === m ? "0 0 0 1px rgba(0,242,255,0.3)" : "none",
                }}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.35)",
                  borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1.25rem",
                  color: "#f87171", fontSize: "0.85rem", display: "flex", gap: "0.5rem", alignItems: "flex-start"
                }}
              >
                <span style={{ flexShrink: 0 }}>⚠</span>
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <AnimatePresence>
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem", fontWeight: 500 }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jane Smith"
                    style={{
                      width: "100%", padding: "0.75rem 1rem",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "8px", color: "var(--text-primary)",
                      fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
                      transition: "border-color 0.2s"
                    }}
                    onFocus={e => e.target.style.borderColor = "rgba(0,242,255,0.5)"}
                    onBlur={e => e.target.style.borderColor = "var(--glass-border)"}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem", fontWeight: 500 }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: "100%", padding: "0.75rem 1rem",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "8px", color: "var(--text-primary)",
                  fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = "rgba(0,242,255,0.5)"}
                onBlur={e => e.target.style.borderColor = "var(--glass-border)"}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem", fontWeight: 500 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{
                  width: "100%", padding: "0.75rem 1rem",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "8px", color: "var(--text-primary)",
                  fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = "rgba(0,242,255,0.5)"}
                onBlur={e => e.target.style.borderColor = "var(--glass-border)"}
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              style={{
                marginTop: "0.5rem",
                padding: "0.9rem",
                borderRadius: "10px",
                border: "none",
                background: loading
                  ? "rgba(0,242,255,0.2)"
                  : "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))",
                color: loading ? "var(--accent-cyan)" : "#000",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                letterSpacing: "0.02em",
              }}
            >
              {loading ? (
                <>
                  <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>↻</span>
                  {mode === "login" ? "Authenticating…" : "Creating Account…"}
                </>
              ) : (
                mode === "login" ? "Sign In →" : "Create Account →"
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.5rem 0" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", flexShrink: 0 }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }} />
          </div>

          {/* GitHub OAuth */}
          <button
            onClick={handleGitHub}
            style={{
              width: "100%", padding: "0.85rem",
              borderRadius: "10px", border: "1px solid var(--glass-border)",
              background: "rgba(255,255,255,0.04)",
              color: "var(--text-primary)", fontWeight: 600,
              fontSize: "0.9rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--glass-border)";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>

          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>

      <style>{`
        @keyframes shimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>
    </div>
  );
}
