"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Globe, CheckCircle2, ArrowRight, Activity, Terminal, AlertCircle, Loader2 } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: () => void;
}

import Notification from "./Notification";

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: "success" | "error"} | null>(null);
  const [step, setStep] = useState(1);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [isEngineFinished, setIsEngineFinished] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Auth Persistence Check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      // Auto-start local analysis if already authed
      setStep(3);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const endpoint = isLogin ? "/auth/login" : "/auth/register";

    try {
      const response = await fetch(`${apiBase}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication Failed");
      }

      if (isLogin) {
        localStorage.setItem("token", data.access_token);
        setIsAuthenticated(true);
        setNotification({ message: "Authentication Successful", type: "success" });
        // Transition directly to dashboard
        setTimeout(() => onComplete(), 500);
      } else {
        setIsLogin(true);
        setNotification({ message: "Registration Successful. Please Login.", type: "success" });
      }
    } catch (err: any) {
      setAuthError(err.message);
      setNotification({ message: err.message, type: "error" });
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="glass-card" style={{ maxWidth: "450px", margin: "6rem auto", padding: "3rem" }}>
        <Notification 
          message={notification?.message || null} 
          type={notification?.type || "success"} 
          onClose={() => setNotification(null)} 
        />
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>{isLogin ? "Enterprise Portal" : "Onboard Organization"}</h2>
          <p style={{ color: "var(--text-secondary)" }}>Access the world-class orchestration engine.</p>
        </div>

        {authError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", borderRadius: "8px", marginBottom: "1.5rem", display: "flex", gap: "0.5rem", color: "var(--danger)", fontSize: "0.85rem" }}
          >
            <AlertCircle size={18} />
            {authError}
          </motion.div>
        )}

        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Corporate Email</label>
            <input 
              name="email"
              type="email" 
              placeholder="admin@gitpulse.com"
              required
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--glass-border)", padding: "0.75rem", borderRadius: "8px", color: "white" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Secure Token / Password</label>
            <input 
              name="password"
              type="password" 
              placeholder="••••••••"
              required
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--glass-border)", padding: "0.75rem", borderRadius: "8px", color: "white" }}
            />
          </div>
          <button 
            type="submit"
            disabled={isAuthenticating}
            style={{ 
              marginTop: "1rem",
              padding: "1rem", 
              borderRadius: "8px", 
              background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))",
              color: "var(--bg-primary)",
              fontWeight: "700",
              border: "none",
              cursor: isAuthenticating ? "not-allowed" : "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            {isAuthenticating && <Loader2 size={20} className="animate-spin" />}
            {isLogin ? "Authenticate" : "Initialize Workspace"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: "none", border: "none", color: "var(--accent-cyan)", cursor: "pointer", fontSize: "0.9rem" }}
          >
            {isLogin ? "New organization? Register" : "Existing account? Log In"}
          </button>
        </div>
      </div>
    );
  }

  // Once authenticated, return null to allow parent (page.tsx) to render the dashboard immediately
  return null;
};

export default OnboardingFlow;
