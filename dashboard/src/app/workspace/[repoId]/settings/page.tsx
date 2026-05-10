"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, Shield, Zap, Webhook, Clock, Database, 
  Save, AlertTriangle, CheckCircle2, Trash2, RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";

export default function SettingsPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const [settings, setSettings] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [webhookLoading, setWebhookLoading] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8000/api/repositories/${repoId}/settings`)
      .then(r => r.json())
      .then(result => {
        if (result.success) {
            setSettings(result.data);
        }
      })
      .catch(console.error);
  }, [repoId]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const res = await fetch(`http://localhost:8000/api/repositories/${repoId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) setSaveStatus('success');
      else setSaveStatus('error');
    } catch (e) {
      setSaveStatus('error');
    }
    setIsSaving(false);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const registerWebhook = async () => {
    setWebhookLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/repositories/${repoId}/webhooks`, { method: 'POST' });
      if (res.ok) alert("Webhook registered successfully!");
      else alert("Failed to register webhook.");
    } catch (e) {
      alert("Error registering webhook.");
    }
    setWebhookLoading(false);
  };

  if (!settings) return null;

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <header style={{ marginBottom: "3rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--accent-cyan)", marginBottom: "0.5rem" }}>
            <Settings size={24} />
            <span style={{ fontWeight: "bold", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "2px" }}>Workspace Configuration</span>
            </div>
            <h2 style={{ fontSize: "2.5rem", fontWeight: "800" }}>Repository Settings</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "1rem", fontSize: "1.1rem" }}>
                Manage indexing rules, AI agent behavior, and synchronization schedules.
            </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          style={{ 
            padding: "0.75rem 1.5rem", borderRadius: "8px", background: "var(--accent-cyan)", 
            color: "var(--bg-primary)", fontWeight: "bold", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 0 20px rgba(0, 242, 255, 0.2)"
          }}
        >
          {isSaving ? <RefreshCw size={18} className="spin" /> : <Save size={18} />}
          {saveStatus === 'success' ? "Saved!" : "Save Changes"}
        </button>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Section 1: Indexing & Branches */}
        <section className="glass-card" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
            <Database size={24} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: "1.3rem", fontWeight: "bold" }}>Indexing & Discovery</h3>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: "bold" }}>Auto-sync on GitHub Push</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Automatically re-index the repository when new commits are detected.</div>
              </div>
              <Toggle active={settings?.autoSync ?? false} onClick={() => setSettings({...settings, autoSync: !settings.autoSync})} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ fontWeight: "bold" }}>Branch Pattern</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Glob pattern for branches to automatically index (e.g., main, release/*).</div>
              <input 
                type="text" 
                value={settings?.indexingRules?.branchPattern || ""}
                onChange={(e) => setSettings({...settings, indexingRules: {...(settings?.indexingRules || {}), branchPattern: e.target.value}})}
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)", padding: "0.75rem", borderRadius: "8px", color: "white" }}
              />
            </div>
          </div>
        </section>

        {/* Section 2: AI Agents */}
        <section className="glass-card" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
            <Zap size={24} color="var(--accent-violet)" />
            <h3 style={{ fontSize: "1.3rem", fontWeight: "bold" }}>Intelligence Agents</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {[
              { id: 'architecture', label: 'Architecture Engine', desc: 'Deep structural analysis and drift detection.' },
              { id: 'infra', label: 'Infrastructure Scanner', desc: 'IaC parsing for Docker, TF, and K8s.' },
              { id: 'commits', label: 'Commit Intelligence', desc: 'Intent synthesis and risk scoring.' },
              { id: 'dependencies', label: 'Supply Chain Auditor', desc: 'Vulnerability and version drift analysis.' }
            ].map(agent => (
              <div key={agent.id} style={{ padding: "1.5rem", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ maxWidth: "70%" }}>
                  <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>{agent.label}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{agent.desc}</div>
                </div>
                <Toggle active={settings?.agents?.[agent.id] ?? true} onClick={() => setSettings({...settings, agents: {...(settings?.agents || {}), [agent.id]: !settings?.agents?.[agent.id]}})} />
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Webhooks & Integration */}
        <section className="glass-card" style={{ padding: "2rem", border: "1px dashed var(--accent-cyan)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <Webhook size={24} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: "1.3rem", fontWeight: "bold" }}>Webhooks</h3>
            </div>
            <button 
              onClick={registerWebhook}
              disabled={webhookLoading}
              style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: "rgba(0, 242, 255, 0.1)", border: "1px solid var(--accent-cyan)", color: "var(--accent-cyan)", fontWeight: "bold", fontSize: "0.8rem", cursor: "pointer" }}
            >
              {webhookLoading ? "Registering..." : "Setup GitHub Webhook"}
            </button>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.6" }}>
            By setting up a webhook, GitPulse will receive real-time updates from GitHub. This enables instant architectural drift detection and automated risk analysis for every pull request and push event.
          </p>
        </section>

        {/* Section 4: Data Retention */}
        <section className="glass-card" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
            <Clock size={24} color="var(--text-secondary)" />
            <h3 style={{ fontSize: "1.3rem", fontWeight: "bold" }}>Data Retention</h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
             <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Retention Period: {settings.retentionDays} Days</div>
                <input 
                  type="range" min="7" max="365" step="7"
                  value={settings?.retentionDays ?? 30}
                  onChange={(e) => setSettings({...settings, retentionDays: parseInt(e.target.value)})}
                  style={{ width: "100%", accentColor: "var(--accent-cyan)" }}
                />
             </div>
             <div style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid var(--glass-border)", width: "300px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>STORAGE IMPACT</div>
                <div style={{ fontWeight: "bold" }}>Estimated: ~140 MB / month</div>
             </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="glass-card" style={{ padding: "2rem", border: "1px solid rgba(255, 50, 50, 0.2)", background: "rgba(255, 50, 50, 0.02)" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem", color: "var(--danger)" }}>
            <AlertTriangle size={24} />
            <h3 style={{ fontSize: "1.3rem", fontWeight: "bold" }}>Danger Zone</h3>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Deleting this repository will permanently remove all indexed commits, architectural snapshots, and intelligence data. This action cannot be undone.
          </p>
          <button style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", background: "rgba(255, 50, 50, 0.1)", border: "1px solid var(--danger)", color: "var(--danger)", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Trash2 size={18} /> Delete Repository
          </button>
        </section>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function Toggle({ active, onClick }: { active: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        width: "48px", height: "24px", background: active ? "var(--accent-cyan)" : "var(--glass-border)", 
        borderRadius: "12px", position: "relative", cursor: "pointer", transition: "0.3s" 
      }}
    >
      <div style={{ 
        position: "absolute", left: active ? "26px" : "2px", top: "2px", 
        width: "20px", height: "20px", background: "white", borderRadius: "50%", transition: "0.3s" 
      }} />
    </div>
  );
}
