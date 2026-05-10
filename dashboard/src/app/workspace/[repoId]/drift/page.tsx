"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Plus, Minus, Edit3, ArrowRight, Network, ShieldAlert } from 'lucide-react';
import { useRepository } from '../../../context/RepositoryContext';

export default function ArchitectureDriftPage() {
    const params = useParams();
    const repoId = params.repoId;
    const { branch } = useRepository(); // This is our 'head' branch
    const [drift, setDrift] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Compare current branch against 'main' by default
        fetch(`http://localhost:8000/api/repositories/${repoId}/drift?base=main&head=${branch}`)
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    setDrift(result.data);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [repoId, branch]);

    const ChangeCard = ({ type, items }: { type: 'added' | 'removed' | 'modified', items: any[] }) => {
        const config = {
            added: { icon: <Plus size={16} />, color: "var(--success)", label: "Added Components" },
            removed: { icon: <Minus size={16} />, color: "var(--danger)", label: "Removed Components" },
            modified: { icon: <Edit3 size={16} />, color: "var(--warning)", label: "Modified Topology" }
        };

        if (items.length === 0) return null;

        return (
            <div className="glass-card" style={{ padding: "1.5rem", borderLeft: `4px solid ${config[type].color}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: config[type].color, marginBottom: "1rem" }}>
                    {config[type].icon}
                    <span style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "1px" }}>
                        {config[type].label}
                    </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {items.map((item: any) => (
                        <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontWeight: "600", fontSize: "1rem" }}>{item.label}</div>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{item.domain} • {item.type}</div>
                            </div>
                            <div style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)" }}>
                                {item.id}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const safeDrift = drift && !drift.error ? drift : { added: [], removed: [], modified: [], addedEdges: [], removedEdges: [] };
    const hasDrift = safeDrift.added.length > 0 || safeDrift.removed.length > 0 || safeDrift.modified.length > 0;
    const isError = drift?.error === 'Branches not found';

    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <header style={{ marginBottom: "3rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--accent-cyan)", marginBottom: "0.5rem" }}>
                    <Activity size={24} />
                    <span style={{ fontWeight: "bold", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "2px" }}>Topological Drift</span>
                </div>
                <h2 style={{ fontSize: "2.5rem", fontWeight: "800" }}>
                    main <ArrowRight size={24} style={{ margin: "0 0.5rem", verticalAlign: "middle", opacity: 0.5 }} /> {branch}
                </h2>
                <p style={{ color: "var(--text-secondary)", marginTop: "1rem", fontSize: "1.1rem" }}>
                    Comparing architectural snapshots to detect structural erosion and unintended service dependencies.
                </p>
            </header>

            {isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
                    <div className="spin" style={{ width: "40px", height: "40px", border: "4px solid var(--accent-cyan)", borderTopColor: "transparent", borderRadius: "50%" }} />
                </div>
            ) : isError || !drift ? (
                 <div className="glass-card" style={{ padding: "4rem", textAlign: "center" }}>
                    <ShieldAlert size={48} color="var(--warning)" style={{ marginBottom: "1.5rem", opacity: 0.5 }} />
                    <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Branch Not Indexed</h3>
                    <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem", maxWidth: "400px", margin: "0.5rem auto" }}>
                        We couldn't compare architectures because one or both branches haven't been indexed yet.
                    </p>
                    <button 
                        onClick={() => window.location.href = `/workspace/${repoId}/sync`}
                        style={{ marginTop: "1.5rem", padding: "0.75rem 1.5rem", borderRadius: "8px", background: "var(--accent-cyan)", color: "var(--bg-primary)", fontWeight: "bold", border: "none", cursor: "pointer" }}
                    >
                        Go to Sync Center
                    </button>
                </div>
            ) : !hasDrift ? (
                <div className="glass-card" style={{ padding: "4rem", textAlign: "center" }}>
                    <Network size={48} color="var(--success)" style={{ marginBottom: "1.5rem", opacity: 0.5 }} />
                    <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Architecture is Synced</h3>
                    <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                        No structural drift detected between <b>main</b> and <b>{branch}</b>.
                    </p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <ChangeCard type="added" items={safeDrift.added} />
                        <ChangeCard type="removed" items={safeDrift.removed} />
                        <ChangeCard type="modified" items={safeDrift.modified} />
                        
                        {(safeDrift.addedEdges.length > 0 || safeDrift.removedEdges.length > 0) && (
                            <div className="glass-card" style={{ padding: "1.5rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-violet)", marginBottom: "1rem" }}>
                                    <Network size={16} />
                                    <span style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "1px" }}>Connection Drift</span>
                                </div>
                                <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                                    Detected <b>{safeDrift.addedEdges.length}</b> added and <b>{safeDrift.removedEdges.length}</b> removed structural edges.
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="glass-card" style={{ padding: "2rem", background: "rgba(255, 50, 50, 0.02)", border: "1px solid rgba(255, 50, 50, 0.1)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--danger)", marginBottom: "1.5rem" }}>
                            <ShieldAlert size={24} />
                            <h3 style={{ fontWeight: "bold", fontSize: "1.2rem" }}>Integrity Impact</h3>
                        </div>
                        <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "0.95rem" }}>
                            {safeDrift.impactSummary || "Architecture drift analyzed. structural integrity measured against baseline."}
                        </p>
                        
                        <div style={{ marginTop: "2rem", padding: "1.5rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--glass-border)" }}>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem", textTransform: "uppercase", fontWeight: "bold" }}>Drift Risk Score</div>
                            <div style={{ fontSize: "3rem", fontWeight: "900", color: safeDrift.riskScore > 7 ? "var(--danger)" : "var(--warning)" }}>
                                {safeDrift.riskScore || "0.0"}
                            </div>
                            <div style={{ fontSize: "0.85rem", marginTop: "0.5rem", color: "var(--text-secondary)" }}>
                                Measured by structural complexity and dependency coupling.
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
