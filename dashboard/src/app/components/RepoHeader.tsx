"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Search, GitBranch, RefreshCw, Clock, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useRepository } from "../context/RepositoryContext";

interface BranchMetadata {
    id: string;
    name: string;
    isDefault: boolean;
    syncStatus: 'PENDING' | 'INDEXING' | 'ANALYZING' | 'READY' | 'FAILED';
    updatedAt: string;
}

const RepoHeader = ({ 
  repoName, 
  provider, 
  syncStatus, 
  lastIndexed,
  onSync
}: any) => {
  const { branch: currentBranch, setBranch, repoId, branches, isLoading } = useRepository();
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [branchSearch, setBranchSearch] = useState("");

  const filteredBranches = branches.filter(b => b.name.toLowerCase().includes(branchSearch.toLowerCase()));

  const StatusIcon = ({ status }: { status: string }) => {
      switch (status) {
          case 'READY': return <CheckCircle2 size={12} color="var(--success)" />;
          case 'FAILED': return <AlertCircle size={12} color="#ef4444" />;
          case 'INDEXING':
          case 'ANALYZING': return <RefreshCw size={12} color="var(--accent-cyan)" className="spin" />;
          default: return <Clock size={12} color="var(--text-secondary)" />;
      }
  };

  return (
    <header style={{
      padding: "0.75rem 2rem",
      background: "rgba(10, 14, 20, 0.8)",
      borderBottom: "1px solid var(--glass-border)",
      backdropFilter: "blur(20px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 4px 30px rgba(0,0,0,0.3)"
    }}>
      {/* Left: Breadcrumbs / Info */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ 
              padding: "0.5rem", 
              background: "linear-gradient(135deg, rgba(0,242,255,0.1), rgba(139,92,246,0.1))", 
              borderRadius: "8px", 
              border: "1px solid rgba(0,242,255,0.2)" 
          }}>
            <GitBranch size={20} color="var(--accent-cyan)" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "800", margin: 0, letterSpacing: "-0.02em" }}>{repoName?.split('-').pop()}</h2>
              <span style={{ 
                  fontSize: "0.65rem", 
                  padding: "0.15rem 0.4rem", 
                  borderRadius: "4px", 
                  background: "rgba(255,255,255,0.05)", 
                  color: "var(--text-secondary)", 
                  border: "1px solid var(--glass-border)",
                  textTransform: "uppercase",
                  fontWeight: "700"
              }}>
                {provider}
              </span>
            </div>
          </div>
        </div>

        <div style={{ height: "24px", width: "1px", background: "var(--glass-border)" }} />

        {/* Branch Selector */}
        <div style={{ position: "relative" }}>
          <button 
            onClick={() => setIsBranchOpen(!isBranchOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.5rem 0.85rem",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--glass-border)",
              borderRadius: "6px",
              cursor: "pointer",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              fontWeight: "600",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            <GitBranch size={16} color="var(--accent-violet)" />
            <span style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentBranch}
            </span>
            <ChevronDown size={14} style={{ transform: isBranchOpen ? "rotate(180deg)" : "none", transition: "0.3s" }} />
          </button>

          <AnimatePresence>
            {isBranchOpen && (
              <>
                <div 
                  onClick={() => setIsBranchOpen(false)} 
                  style={{ position: "fixed", inset: 0, zIndex: 90 }} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  style={{
                    position: "absolute",
                    top: "110%",
                    left: 0,
                    width: "280px",
                    background: "rgba(15, 20, 28, 0.98)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.7)",
                    backdropFilter: "blur(40px)",
                    zIndex: 100,
                    overflow: "hidden"
                  }}
                >
                  <div style={{ padding: "1rem", borderBottom: "1px solid var(--glass-border)" }}>
                    <div style={{ position: "relative" }}>
                      <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                      <input 
                        autoFocus
                        placeholder="Filter branches..."
                        value={branchSearch}
                        onChange={(e) => setBranchSearch(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.6rem 0.6rem 0.6rem 2.2rem",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "8px",
                          color: "white",
                          fontSize: "0.85rem",
                          outline: "none"
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ maxHeight: "300px", overflowY: "auto", padding: "0.5rem" }}>
                    {filteredBranches.map(b => (
                      <div 
                        key={b.id}
                        onClick={() => { setBranch(b.name); setIsBranchOpen(false); }}
                        style={{
                          padding: "0.75rem 1rem",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          color: b.name === currentBranch ? "var(--accent-cyan)" : "var(--text-primary)",
                          background: b.name === currentBranch ? "rgba(0, 242, 255, 0.05)" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "0.15s"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                           <StatusIcon status={b.syncStatus} />
                           <span style={{ fontWeight: b.name === currentBranch ? "700" : "500" }}>{b.name}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {b.isDefault && <span style={{ fontSize: "0.6rem", padding: "0.15rem 0.4rem", borderRadius: "4px", background: "var(--accent-cyan)", color: "var(--bg-primary)", fontWeight: "800" }}>DEFAULT</span>}
                        </div>
                      </div>
                    ))}
                    {filteredBranches.length === 0 && (
                        <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                            No branches found matching "{branchSearch}"
                        </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: Sync Status & Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", justifyContent: "flex-end" }}>
              <motion.span 
                animate={syncStatus === "SYNCING" ? { opacity: [1, 0.4, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ 
                  width: "8px", 
                  height: "8px", 
                  borderRadius: "50%", 
                  background: syncStatus === "IDLE" ? "var(--success)" : syncStatus === "SYNCING" ? "var(--accent-cyan)" : "#ef4444",
                  boxShadow: syncStatus === "SYNCING" ? "0 0 12px var(--accent-cyan)" : "none"
                }} 
              />
              <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)" }}>
                {syncStatus === "IDLE" ? "Analysis Ready" : syncStatus === "SYNCING" ? "Analyzing Branch..." : "Sync Failed"}
              </span>
            </div>
            <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: "0.2rem", display: "flex", alignItems: "center", gap: "0.3rem", justifyContent: "flex-end", fontWeight: "600" }}>
              <Clock size={10} />
              SYNCED {lastIndexed}
            </div>
          </div>
          <button 
            onClick={onSync}
            disabled={syncStatus === "SYNCING"}
            style={{
              padding: "0.6rem",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--glass-border)",
              borderRadius: "8px",
              cursor: syncStatus === "SYNCING" ? "not-allowed" : "pointer",
              color: "var(--text-secondary)",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Force Sync"
          >
            <RefreshCw size={18} className={syncStatus === "SYNCING" ? "spin" : ""} />
          </button>
        </div>
      </div>
      <style jsx>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </header>
  );
};

export default RepoHeader;
