"use client";

import React, { useState, useEffect } from "react";
import { GitBranch, Search, Filter, RefreshCw, CheckCircle2, Clock, AlertCircle, ArrowRight, Activity, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { useRepository } from "@/app/context/RepositoryContext";

interface Branch {
  id: string;
  name: string;
  sha: string;
  isDefault: boolean;
  syncStatus: "PENDING" | "INDEXING" | "ANALYZING" | "READY" | "FAILED";
  updatedAt: string;
  syncMetadata?: {
    status: string;
    lastAnalyzedCommit: string;
    commitDrift: number;
  };
}

export default function BranchesPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const { branch: currentBranch, setBranch } = useRepository();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "INDEXED" | "PENDING">("ALL");

  const fetchBranches = async () => {
    if (!repoId || repoId === "_" || repoId === "undefined") return;
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/repositories/${repoId}/branches`);
      const result = await res.json();
      if (result.success) {
        setBranches(result.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch branches", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [repoId]);

  const handleSync = async (branchName: string) => {
    try {
      await fetch(`http://localhost:8000/api/repositories/${repoId}/branches/${branchName}/sync`, { method: "POST" });
      fetchBranches();
    } catch (err) {
      console.error("Sync failed", err);
    }
  };

  const filteredBranches = branches.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = 
      filter === "ALL" || 
      (filter === "INDEXED" && b.syncStatus === "READY") || 
      (filter === "PENDING" && b.syncStatus !== "READY");
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "READY": return "var(--success)";
      case "INDEXING":
      case "ANALYZING": return "var(--accent-cyan)";
      case "FAILED": return "var(--danger)";
      default: return "var(--text-secondary)";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "READY": return <CheckCircle2 size={16} />;
      case "INDEXING":
      case "ANALYZING": return <RefreshCw size={16} className="spin" />;
      case "FAILED": return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div style={{ padding: "2.5rem", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
      <header style={{ marginBottom: "3rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--accent-violet)", marginBottom: "0.5rem" }}>
            <GitBranch size={24} />
            <span style={{ fontWeight: "bold", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "2px" }}>Branch Intelligence</span>
          </div>
          <h2 style={{ fontSize: "2.5rem", fontWeight: "900", letterSpacing: "-0.04em" }}>Repository Branches</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontSize: "1.1rem" }}>
            Manage indexing, architectural snapshots, and sync status across your repository.
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "1rem" }}>
            <button 
                onClick={fetchBranches}
                style={{ 
                    padding: "0.75rem 1.25rem", borderRadius: "10px", background: "rgba(255,255,255,0.03)", 
                    border: "1px solid var(--glass-border)", color: "white", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "600"
                }}
            >
                <RefreshCw size={16} /> Refresh
            </button>
        </div>
      </header>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={18} style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
          <input 
            type="text" 
            placeholder="Search branches..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: "100%", padding: "1rem 1rem 1rem 3.5rem", borderRadius: "12px", 
              background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", 
              color: "white", fontSize: "1rem", outline: "none", transition: "0.2s"
            }}
          />
        </div>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", padding: "0.4rem", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
            {(["ALL", "INDEXED", "PENDING"] as const).map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                        padding: "0.6rem 1.25rem", borderRadius: "8px", border: "none",
                        background: filter === f ? "rgba(0, 242, 255, 0.1)" : "transparent",
                        color: filter === f ? "var(--accent-cyan)" : "var(--text-secondary)",
                        fontWeight: "700", cursor: "pointer", transition: "0.2s", fontSize: "0.85rem"
                    }}
                >
                    {f}
                </button>
            ))}
        </div>
      </div>

      {isLoading ? (
        <div style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="spin" style={{ width: "48px", height: "48px", border: "4px solid var(--accent-cyan)", borderTopColor: "transparent", borderRadius: "50%" }} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <AnimatePresence>
            {filteredBranches.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card"
                style={{ 
                    padding: "1.5rem 2rem", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 150px", 
                    alignItems: "center", gap: "2rem", border: b.name === currentBranch ? "1px solid var(--accent-cyan)" : "1px solid var(--glass-border)",
                    background: b.name === currentBranch ? "rgba(0, 242, 255, 0.02)" : "rgba(255,255,255,0.01)"
                }}
              >
                {/* Branch Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                  <div style={{ 
                      padding: "0.75rem", borderRadius: "10px", 
                      background: b.name === currentBranch ? "rgba(0, 242, 255, 0.1)" : "rgba(255,255,255,0.03)",
                      color: b.name === currentBranch ? "var(--accent-cyan)" : "white"
                  }}>
                    <GitBranch size={20} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontSize: "1.1rem", fontWeight: "800" }}>{b.name}</span>
                        {b.isDefault && <span style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem", background: "var(--accent-cyan)", color: "var(--bg-primary)", borderRadius: "4px", fontWeight: "900" }}>DEFAULT</span>}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem", fontFamily: "monospace" }}>
                        {b.sha.substring(0, 10)}
                    </div>
                  </div>
                </div>

                {/* Index Status */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: getStatusColor(b.syncStatus), fontWeight: "bold", fontSize: "0.85rem" }}>
                        {getStatusIcon(b.syncStatus)}
                        {b.syncStatus.toUpperCase()}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                        Updated {new Date(b.updatedAt).toLocaleString()}
                    </div>
                </div>

                {/* Freshness / Drift */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: "700" }}>
                        <Activity size={14} color="var(--accent-violet)" />
                        <span>{b.syncMetadata?.commitDrift || 0} commits behind</span>
                    </div>
                    <div style={{ height: "4px", width: "100px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(100, (b.syncMetadata?.commitDrift || 0) * 10)}%`, background: "var(--accent-violet)" }} />
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                    {b.name !== currentBranch ? (
                        <button 
                            onClick={() => setBranch(b.name)}
                            style={{ 
                                padding: "0.6rem 1rem", borderRadius: "8px", background: "rgba(255,255,255,0.05)", 
                                border: "1px solid var(--glass-border)", color: "white", cursor: "pointer", fontSize: "0.85rem", fontWeight: "700"
                            }}
                        >
                            Select
                        </button>
                    ) : (
                        <button 
                            disabled={b.syncStatus === "INDEXING" || b.syncStatus === "ANALYZING"}
                            onClick={() => handleSync(b.name)}
                            style={{ 
                                padding: "0.6rem 1rem", borderRadius: "8px", background: "var(--accent-cyan)", 
                                border: "none", color: "var(--bg-primary)", cursor: "pointer", fontSize: "0.85rem", fontWeight: "800",
                                display: "flex", alignItems: "center", gap: "0.5rem"
                            }}
                        >
                            <Zap size={14} /> Analyze
                        </button>
                    )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredBranches.length === 0 && (
              <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)" }}>
                  <Search size={48} style={{ marginBottom: "1rem", opacity: 0.2 }} />
                  <p>No branches found matching your criteria.</p>
              </div>
          )}
        </div>
      )}

      <style>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
