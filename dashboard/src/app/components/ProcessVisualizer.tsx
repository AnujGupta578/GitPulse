"use client";

import { motion } from "framer-motion";
import { Activity, Zap, FileText, BarChart2 } from "lucide-react";

export interface ISemanticSummary {
    processId: string;
    executiveSummary: string;
    technicalImpact: string;
    complexityScore: number;
}

interface ProcessVisualizerProps {
    summary: ISemanticSummary;
}

export default function ProcessVisualizer({ summary }: ProcessVisualizerProps) {
    const scoreColor = summary.complexityScore > 7 ? "var(--danger)" : summary.complexityScore > 4 ? "var(--warning)" : "var(--success)";

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="process-visualizer-container"
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                width: "100%",
                marginTop: "1.5rem"
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)", paddingBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Activity size={20} color="var(--accent-violet)" />
                    <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-primary)" }}>Semantic Summary</h4>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    <span>ID: <span style={{ color: "var(--accent-cyan)", fontFamily: "monospace" }}>{summary.processId}</span></span>
                </div>
            </div>

            <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="glass-card" 
                style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}
            >
                <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: "var(--accent-cyan)" }} />
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <FileText size={20} color="var(--accent-cyan)" style={{ marginTop: "2px" }} />
                    <div>
                        <h5 style={{ fontWeight: "bold", color: "var(--text-primary)", marginBottom: "0.5rem" }}>Executive Summary</h5>
                        <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                            {summary.executiveSummary}
                        </p>
                    </div>
                </div>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <motion.div 
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="glass-card" 
                    style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}
                >
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "var(--accent-violet)" }}>
                        <Zap size={18} />
                        <span style={{ fontWeight: "600", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Technical Impact</span>
                    </div>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                        {summary.technicalImpact}
                    </p>
                </motion.div>

                <motion.div 
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="glass-card" 
                    style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", justifyContent: "center" }}
                >
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "var(--text-secondary)", width: "100%", justifyContent: "flex-start" }}>
                        <BarChart2 size={18} />
                        <span style={{ fontWeight: "600", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Complexity Score</span>
                    </div>
                    
                    <div style={{ position: "relative", width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--glass-border)" strokeWidth="8" />
                            <motion.circle 
                                cx="50" 
                                cy="50" 
                                r="40" 
                                fill="none" 
                                stroke={scoreColor} 
                                strokeWidth="8"
                                strokeDasharray="251.2"
                                initial={{ strokeDashoffset: 251.2 }}
                                animate={{ strokeDashoffset: 251.2 - (251.2 * (summary.complexityScore / 10)) }}
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div style={{ position: "absolute", fontSize: "1.5rem", fontWeight: "bold", color: scoreColor }}>
                            {summary.complexityScore}
                        </div>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Out of 10</span>
                </motion.div>
            </div>
        </motion.div>
    );
}
