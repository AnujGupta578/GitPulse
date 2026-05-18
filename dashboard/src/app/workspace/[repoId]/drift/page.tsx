"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Plus, Minus, Edit3, ArrowRight, Network, 
  ShieldAlert, GitBranch, Search, ChevronDown, Zap,
  BarChart3, Layers, Boxes, RefreshCw
} from 'lucide-react';
import { useRepository } from '../../../context/RepositoryContext';

export default function ArchitectureDriftPage() {
    const { repoId, branch: activeBranch, compareBranch, setBranch, setCompareBranch, branches } = useRepository();
    
    const [drift, setDrift] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isSourceOpen, setIsSourceOpen] = useState(false);
    const [isTargetOpen, setIsTargetOpen] = useState(false);

    const fetchData = async () => {
        if (!repoId || !activeBranch || !compareBranch) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`http://localhost:8000/api/repositories/${repoId}/drift?source=${activeBranch}&target=${compareBranch}`);
            const result = await res.json();
            if (result.success) {
                setDrift(result.data);
            } else {
                setError(result.message || "Failed to analyze drift");
            }
        } catch (err: any) {
            console.error(err);
            setError("Connection failed. Ensure the analyzer is online.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (activeBranch && compareBranch) {
            fetchData();
        } else {
            setDrift(null);
        }
    }, [repoId, activeBranch, compareBranch]);

    const BranchDropdown = ({ label, current, onSelect, isOpen, setIsOpen }: any) => (
        <div style={{ position: "relative", flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.65rem", fontWeight: "800", color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.85rem 1.25rem",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "12px",
                    cursor: "pointer",
                    color: current ? "white" : "var(--text-secondary)",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    transition: "0.2s"
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <GitBranch size={16} color="var(--accent-cyan)" />
                    <span>{current || "Select branch..."}</span>
                </div>
                <ChevronDown size={16} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "0.3s" }} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div onClick={() => setIsOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 90 }} />
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            style={{
                                position: "absolute",
                                top: "110%",
                                left: 0,
                                right: 0,
                                background: "rgba(15, 20, 28, 0.98)",
                                border: "1px solid var(--glass-border)",
                                borderRadius: "12px",
                                boxShadow: "0 10px 40px rgba(0,0,0,0.7)",
                                backdropFilter: "blur(40px)",
                                zIndex: 100,
                                maxHeight: "250px",
                                overflowY: "auto",
                                padding: "0.5rem"
                            }}
                        >
                            {branches.map(b => (
                                <div 
                                    key={b.id}
                                    onClick={() => { onSelect(b.name); setIsOpen(false); }}
                                    style={{
                                        padding: "0.75rem 1rem",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontSize: "0.9rem",
                                        color: b.name === current ? "var(--accent-cyan)" : "white",
                                        background: b.name === current ? "rgba(0, 242, 255, 0.05)" : "transparent",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        transition: "0.15s"
                                    }}
                                >
                                    <span style={{ fontWeight: b.name === current ? "700" : "500" }}>{b.name}</span>
                                    {b.isDefault && <span style={{ fontSize: "0.55rem", padding: "0.1rem 0.3rem", borderRadius: "4px", background: "rgba(0, 242, 255, 0.1)", color: "var(--accent-cyan)", border: "1px solid rgba(0, 242, 255, 0.2)" }}>DEFAULT</span>}
                                </div>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );

    const ChangeCard = ({ type, items }: { type: 'added' | 'removed' | 'modified', items: any[] }) => {
        const config = {
            added: { icon: <Plus size={16} />, color: "var(--success)", label: "Added Components" },
            removed: { icon: <Minus size={16} />, color: "var(--danger)", label: "Removed Components" },
            modified: { icon: <Edit3 size={16} />, color: "var(--warning)", label: "Modified Topology" }
        };

        if (!items || items.length === 0) return null;

        return (
            <motion.div 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="glass-card" 
                style={{ padding: "1.5rem", borderLeft: `4px solid ${config[type].color}`, background: "rgba(255,255,255,0.01)" }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: config[type].color, marginBottom: "1.25rem" }}>
                    {config[type].icon}
                    <span style={{ fontWeight: "800", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "1px" }}>
                        {config[type].label}
                    </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {items.map((item: any) => (
                        <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Boxes size={16} color="var(--text-secondary)" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>{item.label}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{item.type} • {item.domain}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        );
    };

    return (
        <div style={{ padding: "2.5rem", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
            <header style={{ marginBottom: "3rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--accent-cyan)", marginBottom: "1rem" }}>
                    <Activity size={24} />
                    <span style={{ fontWeight: "900", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "2.5px" }}>ARCHITECTURE DRIFT ENGINE</span>
                </div>
                
                <div style={{ display: "flex", alignItems: "flex-end", gap: "1.5rem", background: "rgba(255,255,255,0.02)", padding: "2rem", borderRadius: "16px", border: "1px solid var(--glass-border)" }}>
                    <BranchDropdown 
                        label="Baseline Source" 
                        current={activeBranch} 
                        onSelect={setBranch}
                        isOpen={isSourceOpen}
                        setIsOpen={setIsSourceOpen}
                    />
                    
                    <div style={{ paddingBottom: "0.75rem", color: "var(--text-secondary)" }}>
                        <ArrowRight size={20} />
                    </div>

                    <BranchDropdown 
                        label="Comparison Target" 
                        current={compareBranch} 
                        onSelect={setCompareBranch}
                        isOpen={isTargetOpen}
                        setIsOpen={setIsTargetOpen}
                    />

                    <button 
                        onClick={fetchData}
                        disabled={!activeBranch || !compareBranch || isLoading}
                        style={{
                            height: "50px",
                            padding: "0 2rem",
                            borderRadius: "12px",
                            background: "var(--accent-cyan)",
                            color: "var(--bg-primary)",
                            fontWeight: "800",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            transition: "0.2s",
                            opacity: (!activeBranch || !compareBranch) ? 0.5 : 1
                        }}
                    >
                        {isLoading ? <RefreshCw className="spin" size={20} /> : <Zap size={20} />}
                        Analyze Drift
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {!activeBranch || !compareBranch ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="glass-card" style={{ padding: "5rem", textAlign: "center" }}
                    >
                        <Layers size={64} color="var(--text-secondary)" style={{ marginBottom: "2rem", opacity: 0.2 }} />
                        <h3 style={{ fontSize: "1.75rem", fontWeight: "900", marginBottom: "1rem" }}>Initialize Comparison</h3>
                        <p style={{ color: "var(--text-secondary)", maxWidth: "450px", margin: "0 auto", lineHeight: "1.7" }}>
                            Select two branches to analyze architectural divergence, dependency drift, and structural integrity deltas.
                        </p>
                    </motion.div>
                ) : isLoading ? (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        <div style={{ textAlign: "center" }}>
                            <RefreshCw size={48} color="var(--accent-cyan)" className="spin" style={{ marginBottom: "1.5rem" }} />
                            <div style={{ fontWeight: "700", color: "var(--text-secondary)" }}>Synthesizing Topological Differences...</div>
                        </div>
                    </motion.div>
                ) : error || drift?.status !== 'READY' ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="glass-card" style={{ padding: "4rem", textAlign: "center", border: "1px solid var(--warning)" }}
                    >
                        <ShieldAlert size={64} color="var(--warning)" style={{ marginBottom: "2rem", opacity: 0.5 }} />
                        <h3 style={{ fontSize: "1.5rem", fontWeight: "900" }}>{drift?.status?.replace(/_/g, ' ') || "Analysis Error"}</h3>
                        <p style={{ color: "var(--text-secondary)", marginTop: "1rem", maxWidth: "500px", margin: "1rem auto" }}>
                            {error || drift?.message || "Snapshots missing for the selected branches. Ensure both branches have been analyzed in the Sync Center."}
                        </p>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ display: "grid", gridTemplateColumns: "1fr 450px", gap: "2.5rem" }}
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                            <div style={{ background: "rgba(0, 242, 255, 0.05)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(0, 242, 255, 0.1)" }}>
                                <div style={{ fontWeight: "800", fontSize: "0.75rem", color: "var(--accent-cyan)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Synthesis Summary</div>
                                <div style={{ fontSize: "1.1rem", fontWeight: "600", lineHeight: "1.6" }}>{drift.summary}</div>
                            </div>

                            <ChangeCard type="added" items={drift.topologyChanges.added} />
                            <ChangeCard type="removed" items={drift.topologyChanges.removed} />
                            <ChangeCard type="modified" items={drift.topologyChanges.modified} />

                            {/* Dependency Drift Section */}
                            {(drift.dependencyChanges.added.length > 0 || drift.dependencyChanges.upgraded.length > 0) && (
                                <div className="glass-card" style={{ padding: "2rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                                        <div style={{ padding: "0.5rem", background: "rgba(139, 92, 246, 0.1)", borderRadius: "8px" }}>
                                            <Network size={20} color="var(--accent-violet)" />
                                        </div>
                                        <h4 style={{ fontWeight: "800", fontSize: "1rem" }}>SUPPLY CHAIN DRIFT</h4>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                        {drift.dependencyChanges.added.map((d: any) => (
                                            <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9rem" }}>
                                                <span style={{ color: "var(--success)", fontWeight: "600" }}>+ {d.name}</span>
                                                <span style={{ color: "var(--text-secondary)" }}>{d.version}</span>
                                            </div>
                                        ))}
                                        {drift.dependencyChanges.upgraded.map((d: any) => (
                                            <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9rem" }}>
                                                <span style={{ fontWeight: "600" }}>{d.name}</span>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                                    <span>{d.from}</span>
                                                    <ArrowRight size={12} />
                                                    <span style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>{d.to}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                            <div className="glass-card" style={{ 
                                padding: "2.5rem", 
                                background: drift.riskDelta === 'HIGH' ? "rgba(239, 68, 68, 0.05)" : "rgba(255, 255, 255, 0.02)",
                                border: drift.riskDelta === 'HIGH' ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid var(--glass-border)"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
                                    <ShieldAlert size={24} color={drift.riskDelta === 'HIGH' ? "#ef4444" : "var(--accent-cyan)"} />
                                    <h3 style={{ fontWeight: "900", fontSize: "1.25rem", letterSpacing: "-0.02em" }}>RISK DELTA</h3>
                                </div>
                                
                                <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                                    <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Drift Magnitude</div>
                                    <div style={{ fontSize: "4.5rem", fontWeight: "950", color: drift.riskDelta === 'HIGH' ? "#ef4444" : "var(--accent-cyan)", letterSpacing: "-0.05em", lineHeight: 1 }}>
                                        {drift.driftScore.toFixed(0)}
                                    </div>
                                    <div style={{ fontSize: "1rem", fontWeight: "800", marginTop: "1rem", color: drift.riskDelta === 'HIGH' ? "#ef4444" : "var(--accent-cyan)" }}>
                                        {drift.riskDelta} IMPACT
                                    </div>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                        <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>Structural Churn</span>
                                        <span style={{ fontWeight: "800" }}>{(drift.topologyChanges.added.length + drift.topologyChanges.removed.length)} units</span>
                                    </div>
                                    <div style={{ height: "4px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
                                        <div style={{ height: "100%", width: `${Math.min(100, drift.driftScore)}%`, background: drift.riskDelta === 'HIGH' ? "#ef4444" : "var(--accent-cyan)", borderRadius: "2px" }} />
                                    </div>
                                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.6", marginTop: "1rem" }}>
                                        This score represents the cumulative architectural deviation between selected branches, accounting for service additions, removals, and dependency upgrades.
                                    </p>
                                </div>
                            </div>

                            <div className="glass-card" style={{ padding: "2rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                                    <BarChart3 size={20} color="var(--accent-cyan)" />
                                    <h4 style={{ fontWeight: "800", fontSize: "1rem" }}>STABILITY INDEX</h4>
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                                    <div style={{ padding: "0.5rem 0.75rem", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)", fontSize: "0.75rem", fontWeight: "700" }}>
                                        COUPLING: {drift.driftScore > 50 ? 'UNSTABLE' : 'STABLE'}
                                    </div>
                                    <div style={{ padding: "0.5rem 0.75rem", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)", fontSize: "0.75rem", fontWeight: "700" }}>
                                        ENTROPY: {drift.topologyChanges.modified.length > 2 ? 'HIGH' : 'LOW'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
