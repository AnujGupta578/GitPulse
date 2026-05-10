"use client";

import React from 'react';
import { GitBranch, ShieldAlert, CheckCircle2, Activity, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useRepository } from '@/app/context/RepositoryContext';

const mockCommits = [
    {
        sha: "a1b2c3d",
        author: "sarah.dev",
        intentSummary: "Refactored OrderService to decouple StripeAdapter dependency. Migrated synchronous calls to an event-driven queue.",
        riskScore: 3.2,
        architecturalImpact: 8.5,
        affectedServices: ['order-service', 'payment-adapter'],
        timestamp: new Date().toISOString()
    },
    {
        sha: "f9e8d7c",
        author: "alex.ops",
        intentSummary: "Dropped legacy user_sessions table from primary database. Requires immediate indexing update.",
        riskScore: 9.5,
        architecturalImpact: 5.0,
        affectedServices: ['auth-service', 'db-primary'],
        timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    },
    {
        sha: "4b5n6m7",
        author: "john.backend",
        intentSummary: "Added Prometheus metrics endpoint to API Gateway for enhanced observability.",
        riskScore: 1.2,
        architecturalImpact: 2.0,
        affectedServices: ['api-gateway'],
        timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
    }
];


export default function CommitsPage() {
    const params = useParams();
    const repoId = params.repoId;
    const { branch } = useRepository();
    const [commits, setCommits] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        setIsLoading(true);
        fetch(`http://localhost:8000/api/repositories/${repoId}/commits?branch=${branch}`)
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    setCommits(result.data || []);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [repoId, branch]);

    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <header style={{ marginBottom: "3rem" }}>
                <h2 style={{ fontSize: "2rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <History size={32} color="var(--accent-cyan)" />
                    {repoId} / Commit Intelligence
                </h2>
                <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                    Real-time AI analysis of commit intent, architectural impact, and risk vectors for branch: <b>{branch}</b>.
                </p>
            </header>

            {isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
                    <div className="spin" style={{ width: "40px", height: "40px", border: "4px solid var(--accent-cyan)", borderTopColor: "transparent", borderRadius: "50%" }} />
                </div>
            ) : commits.length === 0 ? (
                <div className="glass-card" style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    No commits indexed for this branch yet. Use the Sync Center to trigger analysis.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {commits.map((commit, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={commit.sha}
                            className="glass-card"
                            style={{ padding: "2rem", display: "flex", gap: "2rem" }}
                        >
                            {/* Timeline / SHA */}
                            <div style={{ width: "120px", flexShrink: 0, borderRight: "1px solid var(--glass-border)", paddingRight: "1rem" }}>
                                <div style={{ color: "var(--accent-cyan)", fontFamily: "monospace", fontSize: "1.1rem", fontWeight: "bold" }}>
                                    {commit.sha.substring(0, 7)}
                                </div>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                                    {new Date(commit.timestamp).toLocaleTimeString()}
                                </div>
                                <div style={{ fontSize: "0.85rem", marginTop: "1rem", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    @{commit.author}
                                </div>
                            </div>

                            {/* Intent & Services */}
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <Activity size={18} color="var(--accent-violet)" />
                                    {commit.intentSummary ? "Intent Synthesis" : "Raw Message"}
                                </h3>
                                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
                                    {commit.intentSummary || commit.message}
                                </p>

                                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                    {(commit.affectedServices || []).map((service: string) => (
                                        <span key={service} style={{
                                            padding: "0.25rem 0.75rem",
                                            borderRadius: "100px",
                                            background: "rgba(255,255,255,0.05)",
                                            border: "1px solid var(--glass-border)",
                                            fontSize: "0.8rem"
                                        }}>
                                            {service}
                                        </span>
                                    ))}
                                    {!commit.intentSummary && (
                                        <span style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", fontStyle: "italic", border: "1px dashed var(--accent-cyan)", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                                            Awaiting AI Synthesis...
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Risk & Impact Scores */}
                            <div style={{ width: "200px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <div style={{
                                    padding: "1rem",
                                    borderRadius: "8px",
                                    background: commit.riskScore > 7 ? "rgba(255,50,50,0.1)" : "rgba(50,255,50,0.05)",
                                    border: `1px solid ${commit.riskScore > 7 ? "var(--danger)" : "var(--success)"}`,
                                    opacity: commit.riskScore ? 1 : 0.3
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: commit.riskScore > 7 ? "var(--danger)" : "var(--success)" }}>
                                        {commit.riskScore > 7 ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
                                        <span style={{ fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase" }}>Risk Score</span>
                                    </div>
                                    <div style={{ fontSize: "1.5rem", fontWeight: "bold", marginTop: "0.5rem" }}>
                                        {commit.riskScore ? `${commit.riskScore.toFixed(1)}/10` : "TBD"}
                                    </div>
                                </div>

                                <div style={{
                                    padding: "1rem",
                                    borderRadius: "8px",
                                    background: "rgba(0, 242, 255, 0.05)",
                                    border: "1px solid var(--glass-border)",
                                    opacity: commit.archImpactScore ? 1 : 0.3
                                }}>
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "bold", textTransform: "uppercase" }}>Arch. Impact</div>
                                    <div style={{ fontSize: "1.2rem", color: "var(--accent-cyan)", fontWeight: "bold", marginTop: "0.5rem" }}>
                                        {commit.archImpactScore ? `${commit.archImpactScore.toFixed(1)}/10` : "TBD"}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
