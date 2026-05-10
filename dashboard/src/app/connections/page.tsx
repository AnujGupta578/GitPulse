"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderGit2, Link as LinkIcon, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";

const GithubIcon = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path>
    <path d="M12 22v-4"></path>
  </svg>
);

const GitlabIcon = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 13.29-3.33-10a.42.42 0 0 0-.14-.18.38.38 0 0 0-.22-.11.39.39 0 0 0-.23.07.42.42 0 0 0-.14.18l-2.26 6.67H8.32L6.1 3.26a.42.42 0 0 0-.1-.18.38.38 0 0 0-.26-.08.39.39 0 0 0-.23.07.42.42 0 0 0-.14.18L2 13.29a.74.74 0 0 0 .27.83L12 21l9.69-6.88a.71.71 0 0 0 .31-.83Z"></path>
  </svg>
);

export default function ConnectionsPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [provider, setProvider] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  
  const mockRepos = [
    { id: "repo-1", name: "core-orchestrator", branch: "main", status: "PENDING" },
    { id: "repo-2", name: "payment-gateway", branch: "develop", status: "PENDING" },
    { id: "repo-3", name: "frontend-dashboard", branch: "main", status: "PENDING" }
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("success") === "true") {
        setStep(2);
        setProvider("GITHUB");
      }
    }
  }, []);

  const handleProviderSelect = (p: string) => {
    setProvider(p);
    setIsConnecting(true);
    
    if (p === 'GITHUB') {
      window.location.href = 'http://localhost:8000/api/auth/github/connect';
    } else {
      setTimeout(() => {
        setIsConnecting(false);
        setStep(2);
      }, 1500);
    }
  };

  const toggleRepo = (id: string) => {
    setSelectedRepos(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const handleImport = () => {
    setStep(3);
    // Real implementation would POST to /api/repositories/import
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <header style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "1rem" }}>
          <FolderGit2 size={32} color="var(--accent-cyan)" />
          Repository Connections
        </h2>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
          Connect Git providers to build the semantic knowledge graph.
        </p>
      </header>

      {/* Stepper */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "3rem" }}>
        {[1, 2, 3].map((num) => (
          <div key={num} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ 
              height: "4px", 
              borderRadius: "2px", 
              background: step >= num ? "var(--accent-cyan)" : "var(--glass-border)",
              transition: "0.3s"
            }} />
            <span style={{ fontSize: "0.8rem", color: step >= num ? "var(--accent-cyan)" : "var(--text-secondary)", fontWeight: "bold" }}>
              STEP 0{num}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="glass-card" style={{ padding: "3rem", textAlign: "center" }}
          >
            <h3 style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>Select Identity Provider</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
              <button 
                onClick={() => handleProviderSelect('GITHUB')}
                disabled={isConnecting}
                style={{ 
                  padding: "2rem", borderRadius: "12px", background: "rgba(255,255,255,0.02)", 
                  border: "1px solid var(--glass-border)", cursor: "pointer", display: "flex", 
                  flexDirection: "column", alignItems: "center", gap: "1rem", transition: "0.2s" 
                }}
              >
                {isConnecting && provider === 'GITHUB' ? <Loader2 className="spin" size={48} /> : <GithubIcon size={48} />}
                <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>GitHub</span>
              </button>

              <button 
                onClick={() => handleProviderSelect('GITLAB')}
                disabled={isConnecting}
                style={{ 
                  padding: "2rem", borderRadius: "12px", background: "rgba(255,255,255,0.02)", 
                  border: "1px solid var(--glass-border)", cursor: "pointer", display: "flex", 
                  flexDirection: "column", alignItems: "center", gap: "1rem", transition: "0.2s" 
                }}
              >
                {isConnecting && provider === 'GITLAB' ? <Loader2 className="spin" size={48} /> : <GitlabIcon size={48} color="#FC6D26" />}
                <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>GitLab</span>
              </button>

              <button 
                style={{ 
                  padding: "2rem", borderRadius: "12px", background: "rgba(255,255,255,0.02)", 
                  border: "1px dashed var(--glass-border)", cursor: "not-allowed", display: "flex", 
                  flexDirection: "column", alignItems: "center", gap: "1rem", opacity: 0.5 
                }}
              >
                <LinkIcon size={48} />
                <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Bitbucket (Soon)</span>
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="glass-card" style={{ padding: "2rem" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1.5rem" }}>Select Workspaces</h3>
              <span style={{ color: "var(--text-secondary)" }}>{selectedRepos.length} selected</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {mockRepos.map(repo => (
                <div 
                  key={repo.id}
                  onClick={() => toggleRepo(repo.id)}
                  style={{ 
                    display: "flex", justifyContent: "space-between", alignItems: "center", 
                    padding: "1.5rem", borderRadius: "8px", 
                    background: selectedRepos.includes(repo.id) ? "rgba(0, 242, 255, 0.1)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${selectedRepos.includes(repo.id) ? "var(--accent-cyan)" : "var(--glass-border)"}`,
                    cursor: "pointer", transition: "0.2s"
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.25rem" }}>{repo.name}</h4>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Branch: <span style={{ color: "var(--accent-violet)" }}>{repo.branch}</span></span>
                  </div>
                  {selectedRepos.includes(repo.id) && <CheckCircle2 color="var(--accent-cyan)" />}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
              <button 
                onClick={handleImport}
                disabled={selectedRepos.length === 0}
                style={{ 
                  padding: "1rem 2rem", borderRadius: "8px", background: "var(--accent-cyan)", 
                  color: "var(--bg-primary)", fontWeight: "bold", border: "none", cursor: selectedRepos.length > 0 ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", gap: "0.5rem", opacity: selectedRepos.length > 0 ? 1 : 0.5
                }}
              >
                Import & Index <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="glass-card" style={{ padding: "4rem", textAlign: "center" }}
          >
            <CheckCircle2 size={64} color="var(--success)" style={{ margin: "0 auto 2rem auto" }} />
            <h3 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Repositories Indexed!</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", maxWidth: "500px", margin: "0 auto 2rem auto", lineHeight: "1.6" }}>
              The orchestration engine has successfully queued AST parsing workflows for your repositories. Semantic intelligence graphs are now building in the background.
            </p>
            <button 
              onClick={() => window.location.href = "/architecture"}
              style={{ padding: "1rem 2rem", borderRadius: "8px", background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid var(--glass-border)", cursor: "pointer" }}
            >
              Go to Architecture Explorer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}