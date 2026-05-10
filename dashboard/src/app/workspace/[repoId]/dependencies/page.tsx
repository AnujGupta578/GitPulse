"use client";

import React, { useState, useEffect } from "react";
import { Boxes, ShieldAlert, CheckCircle2, AlertTriangle, Search, Filter, ExternalLink, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useRepository } from "@/app/context/RepositoryContext";

export default function DependenciesPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const { branch } = useRepository();
  const [data, setData] = useState<any>({ dependencies: [], stats: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setIsLoading(true);
    fetch(`http://localhost:8000/api/repositories/${repoId}/dependencies?branch=${branch}`)
      .then(r => r.json())
      .then(result => {
        if (result.success) {
            setData(result.data || { dependencies: [], stats: { total: 0 } });
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [repoId, branch]);

  const filteredDeps = (data?.dependencies || []).filter((d: any) => 
    d.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "3rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--accent-cyan)", marginBottom: "0.5rem" }}>
          <Boxes size={24} />
          <span style={{ fontWeight: "bold", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "2px" }}>Supply Chain Intelligence</span>
        </div>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "800" }}>Dependencies</h2>
        <p style={{ color: "var(--text-secondary)", marginTop: "1rem", fontSize: "1.1rem" }}>
            Audit of library manifests, version health, and security vulnerabilities for <b>{branch}</b>.
        </p>
      </header>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div className="spin" style={{ width: "40px", height: "40px", border: "4px solid var(--accent-cyan)", borderTopColor: "transparent", borderRadius: "50%" }} />
        </div>
      ) : data.dependencies.length === 0 ? (
        <div className="glass-card" style={{ padding: "4rem", textAlign: "center" }}>
          <Activity size={48} color="var(--accent-cyan)" style={{ marginBottom: "1.5rem", opacity: 0.5 }} />
          <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>No Manifests Analyzed</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            Trigger a repository sync to scan package.json or go.mod files.
          </p>
          <button 
            onClick={() => window.location.href = `/workspace/${repoId}/sync`}
            style={{ marginTop: "1.5rem", padding: "0.75rem 1.5rem", borderRadius: "8px", background: "var(--accent-cyan)", color: "var(--bg-primary)", fontWeight: "bold", border: "none", cursor: "pointer" }}
          >
            Go to Sync Center
          </button>
        </div>
      ) : (
        <>
            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                {[
                    { label: "Total Packages", value: data.stats.total, color: "var(--accent-cyan)" },
                    { label: "Vulnerabilities", value: data.stats.vulnerable, color: "var(--danger)" },
                    { label: "Outdated", value: data.stats.outdated, color: "var(--warning)" },
                    { label: "Security Health", value: data.stats.vulnerable === 0 ? "100%" : "Critical", color: data.stats.vulnerable === 0 ? "var(--success)" : "var(--danger)" }
                ].map((stat, i) => (
                    <div key={i} className="glass-card" style={{ padding: "1.5rem" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "bold", textTransform: "uppercase", marginBottom: "0.5rem" }}>{stat.label}</div>
                        <div style={{ fontSize: "1.8rem", fontWeight: "900", color: stat.color }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                    <input 
                        type="text" 
                        placeholder="Search dependencies..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ 
                            width: "100%", padding: "0.75rem 1rem 0.75rem 3rem", borderRadius: "8px", 
                            background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", 
                            color: "white", outline: "none"
                        }}
                    />
                </div>
                <button style={{ 
                    padding: "0 1rem", borderRadius: "8px", background: "rgba(255,255,255,0.05)", 
                    border: "1px solid var(--glass-border)", color: "white", display: "flex", alignItems: "center", gap: "0.5rem" 
                }}>
                    <Filter size={18} /> Filter
                </button>
            </div>

            {/* Dependency Table */}
            <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
                <div style={{ 
                    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", 
                    padding: "1rem 1.5rem", background: "rgba(255,255,255,0.02)", 
                    borderBottom: "1px solid var(--glass-border)", fontSize: "0.8rem", fontWeight: "bold", color: "var(--text-secondary)", textTransform: "uppercase"
                }}>
                    <div>Package Name</div>
                    <div>Version</div>
                    <div>Type</div>
                    <div>Status</div>
                </div>
                <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                    {filteredDeps.map((dep: any, i: number) => (
                        <motion.div 
                            key={dep.name}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.01 }}
                            style={{ 
                                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", 
                                padding: "1rem 1.5rem", borderBottom: i === filteredDeps.length - 1 ? "none" : "1px solid var(--glass-border)",
                                fontSize: "0.95rem", alignItems: "center", transition: "0.2s"
                            }}
                        >
                            <div style={{ fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                {dep.name}
                                <ExternalLink size={14} style={{ opacity: 0.3, cursor: "pointer" }} />
                            </div>
                            <div style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--text-secondary)" }}>{dep.version}</div>
                            <div>
                                <span style={{ fontSize: "0.7rem", fontWeight: "900", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(255,255,255,0.05)" }}>
                                    {dep.type}
                                </span>
                            </div>
                            <div>
                                <div style={{ 
                                    display: "flex", alignItems: "center", gap: "0.5rem", 
                                    color: dep.status === 'VULNERABLE' ? "var(--danger)" : dep.status === 'OUTDATED' ? "var(--warning)" : "var(--success)",
                                    fontSize: "0.85rem", fontWeight: "bold"
                                }}>
                                    {dep.status === 'VULNERABLE' ? <ShieldAlert size={16} /> : 
                                     dep.status === 'OUTDATED' ? <AlertTriangle size={16} /> : 
                                     <CheckCircle2 size={16} />}
                                    {dep.status}
                                </div>
                                {dep.description && (
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{dep.description}</div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
