"use client";

import React from "react";
import { RefreshCw, Play, Settings, Database, Activity, Shield, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface SyncControlPanelProps {
  status: string;
  lastSync: string;
  onSync: () => void;
}

const SyncControlPanel = ({ status, lastSync, onSync }: SyncControlPanelProps) => {
  const isSyncing = status === 'SYNCING' || status === 'INDEXING' || status === 'ANALYZING';

  return (
    <div className="glass-card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Database size={20} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: "1rem", fontWeight: "700" }}>Sync Intelligence</h3>
        </div>
        <div style={{
          fontSize: "0.65rem",
          padding: "0.25rem 0.6rem",
          borderRadius: "20px",
          background: isSyncing ? "rgba(0, 242, 255, 0.1)" : "rgba(255,255,255,0.05)",
          color: isSyncing ? "var(--accent-cyan)" : "var(--text-secondary)",
          border: `1px solid ${isSyncing ? "var(--accent-cyan)" : "var(--glass-border)"}`,
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem"
        }}>
          {isSyncing && <RefreshCw size={10} className="spin" />}
          {status.toUpperCase()}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Progress Bar (Visual only if not syncing) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <span>Pipeline Progress</span>
            <span>{isSyncing ? "45%" : "100%"}</span>
          </div>
          <div style={{ height: "6px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: isSyncing ? "45%" : "100%" }}
              style={{ height: "100%", background: isSyncing ? "var(--accent-cyan)" : "var(--success)" }}
            />
          </div>
        </div>

        {/* Info Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
            <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Clock size={14} /> Last Update
            </span>
            <span style={{ fontWeight: "600" }}>{lastSync}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
            <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Activity size={14} /> Auto-Sync
            </span>
            <span style={{ color: "var(--success)", fontWeight: "700" }}>ENABLED</span>
          </div>
        </div>

        <div style={{ height: "1px", background: "var(--glass-border)" }} />

        {/* Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <button
            onClick={onSync}
            disabled={isSyncing}
            style={{
              padding: "0.6rem", borderRadius: "6px",
              background: isSyncing ? "rgba(255,255,255,0.02)" : "rgba(0, 242, 255, 0.1)",
              border: "1px solid var(--accent-cyan)",
              color: "var(--accent-cyan)", fontSize: "0.8rem", fontWeight: "700",
              cursor: isSyncing ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
            }}
          >
            <Play size={14} /> Trigger Sync
          </button>
          <button style={{
            padding: "0.6rem", borderRadius: "6px",
            background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)",
            color: "white", fontSize: "0.8rem", fontWeight: "600",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
          }}>
            <Settings size={14} /> Config
          </button>
        </div>
      </div>

      <style jsx>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SyncControlPanel;
