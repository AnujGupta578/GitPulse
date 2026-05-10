"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert, CheckCircle2, TrendingDown, Activity, Zap, History } from 'lucide-react';
import { useRepository } from '../../../context/RepositoryContext';

export default function RiskAnalysisPage() {
    const params = useParams();
    const repoId = params.repoId;
    const { branch } = useRepository();
    const [riskData, setRiskData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!repoId || repoId === "_" || repoId === "undefined") return;
        setIsLoading(true);
        fetch(`http://localhost:8000/api/repositories/${repoId}/risk?branch=${branch}`)
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    setRiskData(result.data);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [repoId, branch]);

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <div className="spin" style={{ width: "40px", height: "40px", border: "4px solid var(--accent-cyan)", borderTopColor: "transparent", borderRadius: "50%" }} />
            </div>
        );
    }

    const summary = riskData?.summary || {};
    const vectors = riskData?.vectors || {};

    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <header style={{ marginBottom: "3rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--danger)", marginBottom: "0.5rem" }}>
                    <AlertTriangle size={24} />
                    <span style={{ fontWeight: "bold", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "2px" }}>Risk Management</span>
                </div>
                <h2 style={{ fontSize: "2.5rem", fontWeight: "800" }}>Repository Risk Profile</h2>
                <p style={{ color: "var(--text-secondary)", marginTop: "1rem", fontSize: "1.1rem" }}>
                    Aggregated intelligence on architectural debt, commit volatility, and security boundaries.
                </p>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
                {/* Score Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div className="glass-card" style={{ padding: "2.5rem", textAlign: "center", background: "rgba(255,50,50,0.02)" }}>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "1px", marginBottom: "1rem" }}>Overall Risk Score</div>
                        <div style={{ fontSize: "4rem", fontWeight: "900", color: summary.level === 'HIGH' ? "var(--danger)" : "var(--warning)" }}>
                            {Math.round(summary.overallScore)}
                        </div>
                        <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: summary.level === 'HIGH' ? "var(--danger)" : "var(--warning)", marginTop: "0.5rem" }}>
                            {summary.level} SEVERITY
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: "1.5rem" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "1.5rem" }}>Risk Factors</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            {summary.factors?.map((f: any) => (
                                <div key={f.label}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                                        <span style={{ color: "var(--text-secondary)" }}>{f.label}</span>
                                        <span style={{ fontWeight: "bold" }}>{f.score}%</span>
                                    </div>
                                    <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${f.score}%` }}
                                            style={{ height: "100%", background: f.score > 80 ? "var(--success)" : "var(--warning)" }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Detail Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {/* Critical Commits */}
                    <div className="glass-card" style={{ padding: "2rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
                            <History size={20} color="var(--accent-violet)" />
                            <h3 style={{ fontWeight: "bold", fontSize: "1.2rem" }}>High-Risk Commits</h3>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {vectors.commits?.length > 0 ? vectors.commits.map((c: any) => (
                                <div key={c.sha} style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1rem", borderRadius: "8px", background: "rgba(255,50,50,0.05)", border: "1px solid rgba(255,50,50,0.1)" }}>
                                    <div style={{ padding: "0.5rem", borderRadius: "6px", background: "rgba(255,50,50,0.1)", color: "var(--danger)" }}>
                                        <ShieldAlert size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{c.message}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                                            SHA: {c.sha.substring(0, 7)} • Impact: {c.archImpactScore}/10
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontWeight: "bold", color: "var(--danger)" }}>{c.riskScore.toFixed(1)}</div>
                                        <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>SCORE</div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                                    No high-risk commits detected in history.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Architecture Integrity */}
                    <div className="glass-card" style={{ padding: "2rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                            <Zap size={20} color="var(--accent-cyan)" />
                            <h3 style={{ fontWeight: "bold", fontSize: "1.2rem" }}>Architectural Debt</h3>
                        </div>
                        <div style={{ padding: "1.5rem", borderRadius: "12px", background: "rgba(0, 242, 255, 0.03)", border: "1px dashed var(--accent-cyan)" }}>
                            <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", fontSize: "0.95rem" }}>
                                {vectors.architecture?.summary || "Analyzing topological coupling and service circularity. Initial synthesis suggests a healthy separation of concerns across service boundaries."}
                            </p>
                            <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-cyan)", fontSize: "0.85rem", fontWeight: "bold" }}>
                                <CheckCircle2 size={16} />
                                Verified by AI Council on {vectors.architecture?.timestamp ? new Date(vectors.architecture.timestamp).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
