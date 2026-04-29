"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, Globe, CheckCircle2, ArrowRight } from "lucide-react";

const OnboardingFlow = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="glass-card" style={{ maxWidth: "600px", margin: "4rem auto", padding: "3rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Connect Your Ecosystem</h2>
        <p style={{ color: "var(--text-secondary)" }}>Initialize world-class architectural synthesis in seconds.</p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3rem", position: "relative" }}>
        {[1, 2, 3].map((s) => (
          <div key={s} style={{ 
            width: "40px", 
            height: "40px", 
            borderRadius: "50%", 
            background: step >= s ? "var(--accent-cyan)" : "var(--glass-border)",
            color: step >= s ? "var(--bg-primary)" : "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            zIndex: 1
          }}>
            {step > s ? <CheckCircle2 size={20} /> : s}
          </div>
        ))}
        <div style={{ position: "absolute", top: "20px", left: "0", right: "0", height: "2px", background: "var(--glass-border)", zIndex: 0 }} />
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 style={{ marginBottom: "1.5rem" }}>Select Integration</h3>
          <div style={{ display: "grid", gap: "1rem" }}>
            <button 
              onClick={() => setStep(2)}
              className="glass-card" 
              style={{ display: "flex", alignItems: "center", gap: "1.5rem", width: "100%", textAlign: "left", cursor: "pointer" }}
            >
              <GitBranch size={32} color="var(--accent-cyan)" />
              <div>
                <p style={{ fontWeight: "600" }}>GitHub Enterprise</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Connect via GitHub App (Recommended)</p>
              </div>
              <ArrowRight style={{ marginLeft: "auto" }} size={20} />
            </button>
            <button className="glass-card" style={{ display: "flex", alignItems: "center", gap: "1.5rem", width: "100%", textAlign: "left", opacity: 0.5 }}>
              <Globe size={32} />
              <div>
                <p style={{ fontWeight: "600" }}>Self-Hosted Git</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Connect via Webhooks & SSH</p>
              </div>
            </button>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 style={{ marginBottom: "1.5rem" }}>Select Repositories</h3>
          <div style={{ display: "grid", gap: "0.75rem", marginBottom: "2rem" }}>
            {["core-payment-engine", "auth-service-v3", "marketing-landing-page"].map((repo) => (
              <div key={repo} className="glass-card" style={{ display: "flex", justifyContent: "space-between", padding: "1rem" }}>
                <span>{repo}</span>
                <input type="checkbox" defaultChecked />
              </div>
            ))}
          </div>
          <button 
            onClick={() => setStep(3)}
            style={{ 
              width: "100%", 
              padding: "1rem", 
              borderRadius: "8px", 
              background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))",
              color: "var(--bg-primary)",
              fontWeight: "700",
              border: "none",
              cursor: "pointer"
            }}
          >
            Start Initial Synthesis
          </button>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "2rem", color: "var(--success)" }}>
            <CheckCircle2 size={64} style={{ margin: "0 auto" }} />
          </div>
          <h3 style={{ marginBottom: "1rem" }}>Engine Synchronized</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            The Council of Agents is performing a baseline analysis of your codebase. You'll be redirected to the dashboard shortly.
          </p>
          <div className="accent-text">Analyzing 1,240 commits...</div>
        </motion.div>
      )}
    </div>
  );
};

export default OnboardingFlow;
