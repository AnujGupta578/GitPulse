"use client";

import React, { useState, useEffect } from "react";
import { Lightbulb, TrendingUp, ShieldAlert, CheckCircle2, ChevronRight, Activity, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useRepository } from "@/app/context/RepositoryContext";

export default function InsightsPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const { branch } = useRepository();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`http://localhost:8000/api/repositories/${repoId}/insights?branch=${branch}`)
      .then(r => r.json())
      .then(result => {
        if (result.success) {
          setData(result.data);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [repoId, branch]);

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <header style={{ marginBottom: "3rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--accent-cyan)", marginBottom: "0.5rem" }}>
          <Lightbulb size={24} />
          <span style={{ fontWeight: "bold", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "2px" }}>Engineering Intelligence</span>
        </div>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "800" }}>Strategic Insights</h2>
        <p style={{ color: "var(--text-secondary)", marginTop: "1rem", fontSize: "1.1rem" }}>
            High-level architectural advice and structural health reporting for <b>{branch}</b>.
        </p>
      </header>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div className="spin" style={{ width: "40px", height: "40px", border: "4px solid var(--accent-cyan)", borderTopColor: "transparent", borderRadius: "50%" }} />
        </div>
      ) : !data || !data.insights || data.insights.length === 0 ? (
        <div className="glass-card" style={{ padding: "4rem", textAlign: "center" }}>
          <Activity size={48} color="var(--accent-cyan)" style={{ marginBottom: "1.5rem", opacity: 0.5 }} />
          <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Awaiting Analysis</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            Trigger a repository sync to generate engineering intelligence reports.
          </p>
          <button 
            onClick={() => window.location.href = `/workspace/${repoId}/sync`}
            style={{ marginTop: "1.5rem", padding: "0.75rem 1.5rem", borderRadius: "8px", background: "var(--accent-cyan)", color: "var(--bg-primary)", fontWeight: "bold", border: "none", cursor: "pointer" }}
          >
            Go to Sync Center
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Health Score */}
          <div className="glass-card" style={{ padding: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg, rgba(0, 242, 255, 0.05) 0%, rgba(0,0,0,0) 100%)" }}>
            <div>
              <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.5rem", fontWeight: "bold", textTransform: "uppercase" }}>Overall Repo Health</div>
              <div style={{ fontSize: "3.5rem", fontWeight: "900", color: "var(--accent-cyan)" }}>{data.overallScore}<span style={{ fontSize: "1.5rem", opacity: 0.5 }}>/100</span></div>
            </div>
            <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--success)" }}>Optimal Stability</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Based on last 100 commits</div>
            </div>
          </div>

          <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: "1rem" }}>Strategic Recommendations</h3>
          
          {data.insights.map((insight: any, idx: number) => (
            <motion.div 
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card" 
                style={{ padding: "2rem", borderLeft: insight.severity === 'CRITICAL' ? "4px solid var(--danger)" : "4px solid var(--accent-cyan)" }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ 
                            fontSize: "0.7rem", fontWeight: "900", padding: "0.2rem 0.5rem", borderRadius: "4px",
                            background: insight.severity === 'CRITICAL' ? "rgba(255, 50, 50, 0.1)" : "rgba(0, 242, 255, 0.1)",
                            color: insight.severity === 'CRITICAL' ? "var(--danger)" : "var(--accent-cyan)"
                        }}>{insight.severity}</span>
                        <h4 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{insight.title}</h4>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "bold" }}>{insight.category}</div>
                </div>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "1rem" }}>
                    {insight.content}
                </p>
                
                <div style={{ marginTop: "1.5rem", padding: "1.5rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--success)", fontWeight: "bold", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                        <TrendingUp size={16} /> RECOMMENDED ACTION
                    </div>
                    <div style={{ color: "white", fontSize: "0.95rem" }}>{insight.recommendation}</div>
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
