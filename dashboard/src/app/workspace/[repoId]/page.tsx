"use client";

import React, { useEffect, useState } from "react";
import RepoHeader from "../../components/RepoHeader";
import SyncControlPanel from "../../components/SyncControlPanel";
import { 
  Shield, Activity, Zap, Layers, AlertCircle, 
  GitCommit, Network, Boxes, Info, ArrowUpRight,
  TrendingUp, BarChart3, Fingerprint, RefreshCw,
  Search, Clock, ChevronRight, Binary, Cpu, CpuIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useRepository } from "../../context/RepositoryContext";

export default function RepoOverviewPage({ params }: { params: { repoId: string } }) {
  const repoId = params.repoId;
  const { branch } = useRepository();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!repoId || repoId === "_" || repoId === "undefined") return;
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/repositories/${repoId}/overview?branch=${branch}`);
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Failed to fetch repository overview");
      setData(result.data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (repoId && repoId !== "_" && repoId !== "undefined") {
        fetchData();
    }
  }, [repoId, branch]);

  const handleSync = async () => {
      if (!repoId || repoId === "_" || repoId === "undefined") return;
      try {
          await fetch(`http://localhost:8000/api/repositories/${repoId}/branches/${branch}/sync`, { method: 'POST' });
          fetchData();
      } catch (err) {
          console.error("Sync trigger failed", err);
      }
  };

  // Lifecycle States
  const isNeverSynced = !data?.branch || data.metrics?.indexedCommits === 0;
  const isSyncing = data?.syncStatus?.isSyncing;
  const isReady = data?.syncStatus?.current === 'READY' || data?.syncStatus?.current === 'COMPLETED';
  const isFailed = data?.syncStatus?.current === 'FAILED';

  const metrics = [
    { label: "Semantic Commits", value: data?.metrics?.indexedCommits || "0", icon: <Binary size={20} color="var(--accent-violet)" />, trend: "Analyzed History" },
    { label: "Architecture Nodes", value: data?.metrics?.componentCount || "0", icon: <Network size={20} color="var(--accent-cyan)" />, trend: "Topological Map" },
    { label: "Inferred Services", value: data?.metrics?.serviceCount || "0", icon: <Cpu size={20} color="var(--accent-violet)" />, trend: "Bounded Contexts" },
    { label: "Freshness", value: data?.metrics?.lastSync ? "Active" : "Stale", icon: <Activity size={20} color={isReady ? "var(--success)" : "var(--warning)"} />, trend: "Sync Status" },
  ];

  const StatCard = ({ label, value, icon, trend }: any) => (
    <motion.div 
      whileHover={{ y: -4, background: "rgba(255,255,255,0.05)" }}
      className="glass-card" 
      style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", transition: "0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ padding: "0.6rem", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid var(--glass-border)" }}>
          {icon}
        </div>
        <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {trend}
        </span>
      </div>
      <div>
        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "500" }}>{label}</div>
        <div style={{ fontSize: "1.75rem", fontWeight: "800", letterSpacing: "-0.02em" }}>{value}</div>
      </div>
    </motion.div>
  );

  if (isLoading && !data) {
    return (
      <div style={{ display: "flex", height: "100%", width: "100%", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", minHeight: "80vh" }}>
         <div className="spin" style={{ width: "40px", height: "40px", border: "4px solid var(--accent-cyan)", borderTopColor: "transparent", borderRadius: "50%" }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "radial-gradient(circle at 50% -20%, rgba(0, 242, 255, 0.05), transparent)" }}>
      <RepoHeader 
        repoName={repoId} 
        provider={data?.repository?.provider || "github"} 
        syncStatus={isSyncing ? "SYNCING" : isFailed ? "FAILED" : "IDLE"}
        lastIndexed={data?.metrics?.lastSync ? new Date(data.metrics.lastSync).toLocaleTimeString() : "Never"}
        onSync={handleSync}
      />

      <main style={{ padding: "2.5rem", maxWidth: "1600px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        
        <AnimatePresence mode="wait">
          {isLoading ? (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}
             >
                <RefreshCw size={48} color="var(--accent-cyan)" className="spin" />
             </motion.div>
          ) : isNeverSynced ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="glass-card" 
              style={{ padding: "4rem", textAlign: "center", background: "rgba(10, 14, 20, 0.4)", border: "1px solid var(--accent-cyan)", boxShadow: "0 0 50px rgba(0, 242, 255, 0.1)" }}
            >
              <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                <div style={{ 
                    width: "80px", height: "80px", borderRadius: "20px", background: "rgba(0, 242, 255, 0.1)", 
                    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem" 
                }}>
                  <Zap size={40} color="var(--accent-cyan)" />
                </div>
                <h2 style={{ fontSize: "2.5rem", fontWeight: "900", marginBottom: "1rem", letterSpacing: "-0.04em" }}>Initialize Repository Intelligence</h2>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "2.5rem", fontSize: "1.1rem" }}>
                  GitPulse hasn't analyzed the <strong>{branch}</strong> branch yet. Start the synchronization to build your architectural graph and engineering insights.
                </p>
                <button 
                  onClick={handleSync}
                  style={{ 
                      padding: "1rem 2.5rem", borderRadius: "12px", background: "var(--accent-cyan)", 
                      color: "var(--bg-primary)", fontWeight: "800", cursor: "pointer", border: "none",
                      fontSize: "1rem", boxShadow: "0 10px 30px rgba(0, 242, 255, 0.3)",
                      transition: "0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  Start Deep Analysis
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}
            >
              {/* Metrics Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                {metrics.map((m, i) => (
                  <StatCard key={i} {...m} />
                ))}
              </div>

              {/* Main Content Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "2rem", alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                  {/* Architecture Preview */}
                  <div className="glass-card" style={{ padding: "2.5rem", position: "relative", overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                        <div style={{ padding: "0.5rem", background: "rgba(0, 242, 255, 0.05)", borderRadius: "8px" }}>
                          <Network color="var(--accent-cyan)" size={24} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: "1.25rem", fontWeight: "800", margin: 0, letterSpacing: "-0.02em" }}>Architecture Snapshot</h3>
                          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>Topological map of detected service boundaries</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => window.location.href = `/workspace/${repoId}/architecture?branch=${branch}`}
                        style={{ 
                          background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)", 
                          padding: "0.5rem 1rem", borderRadius: "8px", color: "white",
                          fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer",
                          fontWeight: "600"
                        }}
                      >
                        Full Map <ArrowUpRight size={14} />
                      </button>
                    </div>
                    
                    <div style={{ 
                      height: "400px", background: "rgba(0,0,0,0.3)", borderRadius: "16px", 
                      border: "1px solid var(--glass-border)", position: "relative",
                      overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {data?.architectureSnapshot ? (
                        <div style={{ padding: "2rem", width: "100%", height: "100%" }}>
                           {/* Mini Map Visualization */}
                           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1.25rem" }}>
                             {data.topology?.nodes?.map((node: any) => (
                               <motion.div 
                                 key={node.id} 
                                 whileHover={{ scale: 1.02, borderColor: "var(--accent-cyan)" }}
                                 style={{ 
                                   padding: "1rem", background: "rgba(255,255,255,0.02)", 
                                   border: "1px solid var(--glass-border)", borderRadius: "12px",
                                   display: "flex", alignItems: "center", gap: "0.75rem"
                                 }}
                               >
                                 <div style={{ 
                                     width: "32px", height: "32px", borderRadius: "8px", 
                                     background: node.type === 'service' ? "rgba(0, 242, 255, 0.1)" : "rgba(139, 92, 246, 0.1)",
                                     display: "flex", alignItems: "center", justifyContent: "center"
                                 }}>
                                    <Boxes size={16} color={node.type === 'service' ? "var(--accent-cyan)" : "var(--accent-violet)"} />
                                 </div>
                                 <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>{node.label}</span>
                               </motion.div>
                             ))}
                           </div>
                           <div style={{ position: "absolute", bottom: "1.5rem", right: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.75rem", background: "rgba(0,0,0,0.5)", padding: "0.4rem 0.8rem", borderRadius: "20px", border: "1px solid var(--glass-border)" }}>
                             <Info size={12} />
                             Showing primary topological entities
                           </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                          <div style={{ position: "relative" }}>
                             <Fingerprint size={64} color="rgba(255,255,255,0.05)" />
                             <motion.div 
                               animate={{ rotate: 360 }} 
                               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                               style={{ position: "absolute", inset: -10, border: "2px dashed rgba(0, 242, 255, 0.1)", borderRadius: "50%" }}
                             />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                             <div style={{ color: "white", fontWeight: "700", fontSize: "1rem" }}>Scan Required</div>
                             <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>No architecture mapped for {branch}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Semantic Commits */}
                  <div className="glass-card" style={{ padding: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ padding: "0.5rem", background: "rgba(139, 92, 246, 0.05)", borderRadius: "8px" }}>
                          <GitCommit size={20} color="var(--accent-violet)" />
                        </div>
                        <h4 style={{ fontWeight: "800", fontSize: "1.1rem", margin: 0 }}>Semantic Timeline</h4>
                      </div>
                      <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--accent-violet)", background: "rgba(139, 92, 246, 0.05)", padding: "0.3rem 0.6rem", borderRadius: "6px" }}>{branch.toUpperCase()}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {data?.recentCommits?.length > 0 ? data.recentCommits.map((c: any, i: number) => (
                        <motion.div 
                          key={i} 
                          whileHover={{ x: 6, background: "rgba(255,255,255,0.03)" }}
                          style={{ 
                            padding: "1.25rem", background: "rgba(255,255,255,0.01)", 
                            border: "1px solid var(--glass-border)", borderRadius: "12px",
                            display: "flex", alignItems: "center", gap: "1.5rem",
                            transition: "0.2s"
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", minWidth: "90px" }}>
                            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "white" }}>{new Date(c.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>{new Date(c.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div style={{ height: "30px", width: "1px", background: "var(--glass-border)" }} />
                          <div style={{ flex: 1, fontWeight: "600", fontSize: "0.95rem", color: "rgba(255,255,255,0.9)" }}>{c.message}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                             <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--accent-violet)", color: "white", fontSize: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800" }}>
                                {c.author[0].toUpperCase()}
                             </div>
                             <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>@{c.author}</span>
                          </div>
                          <ChevronRight size={16} color="var(--text-secondary)" />
                        </motion.div>
                      )) : (
                        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)", border: "1px dashed var(--glass-border)", borderRadius: "12px" }}>
                           No commit history detected for this scope.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                  {/* Sync Panel Integration */}
                  <SyncControlPanel 
                    status={data?.syncStatus?.current || 'PENDING'} 
                    lastSync={data?.metrics?.lastSync ? new Date(data.metrics.lastSync).toLocaleDateString() : 'Never'}
                    onSync={handleSync}
                  />

                  {/* AI Intelligence Panel */}
                  <div className="glass-card" style={{ padding: "2rem", background: "rgba(10, 14, 20, 0.4)", border: "1px solid rgba(0, 242, 255, 0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                      <div style={{ padding: "0.5rem", background: "rgba(0, 242, 255, 0.1)", borderRadius: "8px" }}>
                        <Zap size={20} color="var(--accent-cyan)" />
                      </div>
                      <h4 style={{ fontWeight: "800", fontSize: "1rem", letterSpacing: "0.05em" }}>INTELLIGENCE SUMMARY</h4>
                    </div>
                    
                    <div style={{ background: "rgba(255,255,255,0.02)", padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--glass-border)", marginBottom: "1.5rem" }}>
                      <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.8)", lineHeight: "1.7", margin: 0 }}>
                        {data?.aiInsights?.summary}
                      </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--text-secondary)" }}>ANALYSIS CONFIDENCE</span>
                        <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-cyan)" }}>{data?.aiInsights?.readiness === 'COMPLETE' ? "98%" : "LOW"}</span>
                      </div>
                      <div style={{ height: "6px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: data?.aiInsights?.readiness === 'COMPLETE' ? "98%" : "15%" }}
                          style={{ height: "100%", background: "var(--accent-cyan)", boxShadow: "0 0 10px var(--accent-cyan)" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Velocity Preview */}
                  <div className="glass-card" style={{ padding: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
                      <BarChart3 size={20} color="var(--accent-cyan)" />
                      <h4 style={{ fontWeight: "800", fontSize: "1rem" }}>Commit Velocity</h4>
                    </div>
                    <div style={{ height: "140px", display: "flex", alignItems: "flex-end", gap: "0.5rem", padding: "0 0.5rem" }}>
                      {(data?.velocity || []).length > 0 ? (data.velocity as any[]).map((v, i) => {
                        const maxCount = Math.max(...(data.velocity as any[]).map(x => Number(x.count)), 1);
                        const h = (Number(v.count) / maxCount) * 100;
                        return (
                          <motion.div 
                            key={i} 
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(5, h)}%` }}
                            transition={{ delay: i * 0.05, duration: 0.5 }}
                            style={{ 
                                flex: 1, 
                                background: `linear-gradient(to top, var(--accent-cyan), var(--accent-violet))`, 
                                opacity: 0.3 + (h/100), 
                                borderRadius: "4px 4px 0 0" 
                            }} 
                          />
                        );
                      }) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--glass-border)", borderRadius: "8px", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                            Waiting for activity data...
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.65rem", fontWeight: "700" }}>
                        <span>14D AGO</span>
                        <span>TODAY</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style jsx>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
