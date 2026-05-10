"use client";

import React, { useState, useEffect } from "react";
import { 
  Server, Users, Globe, Zap, Box, Activity, ChevronRight, ShieldCheck, 
  History, Share2, Layers, AlertTriangle, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { useRepository } from "@/app/context/RepositoryContext";

export default function ServicesPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const { branch } = useRepository();
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<any>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`http://localhost:8000/api/repositories/${repoId}/services?branch=${branch}`)
      .then(r => r.json())
      .then(result => {
        if (result.success) {
          setServices(result.data || []);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [repoId, branch]);

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", position: "relative", minHeight: "100vh" }}>
      <header style={{ marginBottom: "3rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--accent-violet)", marginBottom: "0.5rem" }}>
          <Server size={24} />
          <span style={{ fontWeight: "bold", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "2px" }}>Domain Discovery</span>
        </div>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "800" }}>Service Catalog</h2>
        <p style={{ color: "var(--text-secondary)", marginTop: "1rem", fontSize: "1.1rem" }}>
            Real-time map of microservices, gateways, and domain boundaries discovered in <b>{branch}</b>.
        </p>
      </header>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div className="spin" style={{ width: "40px", height: "40px", border: "4px solid var(--accent-cyan)", borderTopColor: "transparent", borderRadius: "50%" }} />
        </div>
      ) : services.length === 0 ? (
        <div className="glass-card" style={{ padding: "4rem", textAlign: "center" }}>
          <Box size={48} color="var(--accent-violet)" style={{ marginBottom: "1.5rem", opacity: 0.5 }} />
          <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>No Services Detected</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            We haven't identified any microservices or major application boundaries in this branch yet.
          </p>
          <button 
            onClick={() => window.location.href = `/workspace/${repoId}/sync`}
            style={{ marginTop: "1.5rem", padding: "0.75rem 1.5rem", borderRadius: "8px", background: "var(--accent-cyan)", color: "var(--bg-primary)", fontWeight: "bold", border: "none", cursor: "pointer" }}
          >
            Run Discovery
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" }}>
            {services.map((svc, i) => (
                <motion.div 
                    key={svc.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card" 
                    style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{ padding: "0.75rem", background: "rgba(139, 92, 246, 0.05)", borderRadius: "12px", border: "1px solid var(--accent-violet)" }}>
                                {svc.type === 'gateway' ? <Globe size={24} color="var(--accent-cyan)" /> : <Server size={24} color="var(--accent-violet)" />}
                            </div>
                            <div>
                                <h4 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{svc.label}</h4>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "bold", textTransform: "uppercase" }}>{svc.type}</span>
                            </div>
                        </div>
                        <div style={{ padding: "0.25rem 0.75rem", borderRadius: "100px", background: "rgba(50, 255, 50, 0.1)", color: "var(--success)", fontSize: "0.7rem", fontWeight: "bold" }}>
                            ACTIVE
                        </div>
                    </div>

                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                        {svc.description}
                    </p>

                    <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "bold", textTransform: "uppercase", marginBottom: "0.25rem" }}>Domain</div>
                            <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>{svc.domain}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "bold", textTransform: "uppercase", marginBottom: "0.25rem" }}>Ownership</div>
                            <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--accent-cyan)" }}>Platform Team</div>
                        </div>
                    </div>

                    <div style={{ marginTop: "auto" }}>
                        <button 
                          onClick={() => setSelectedService(svc)}
                          style={{ 
                            width: "100%", padding: "0.75rem", borderRadius: "8px", background: "rgba(255,255,255,0.03)", 
                            border: "1px solid var(--glass-border)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                            fontSize: "0.85rem", fontWeight: "600", transition: "0.2s"
                        }}>
                            Service Intelligence <ChevronRight size={16} />
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
      )}

      {/* Service Detail Panel (Phase 18) */}
      <AnimatePresence>
        {selectedService && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            style={{ 
                position: "fixed", right: 0, top: 0, bottom: 0, width: "500px",
                background: "rgba(10, 14, 20, 0.98)", borderLeft: "1px solid var(--glass-border)",
                backdropFilter: "blur(30px)", padding: "3rem", zIndex: 100,
                boxShadow: "-20px 0 50px rgba(0,0,0,0.5)", overflowY: "auto"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                <div style={{ padding: "1rem", background: "rgba(139, 92, 246, 0.1)", borderRadius: "15px", border: "1px solid var(--accent-violet)", color: "var(--accent-violet)" }}>
                    <Server size={32} />
                </div>
                <button onClick={() => setSelectedService(null)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "2rem" }}>×</button>
            </div>

            <div style={{ marginBottom: "3rem" }}>
                <h3 style={{ fontSize: "2.2rem", fontWeight: "800", color: "white" }}>{selectedService.label}</h3>
                <p style={{ color: "var(--text-secondary)", marginTop: "1rem", fontSize: "1.1rem", lineHeight: "1.6" }}>
                    Advanced operational intelligence and dependency analysis for the <b>{selectedService.label}</b> module.
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                {/* Section: Operational Health */}
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.2rem", color: "var(--success)" }}>
                        <ShieldCheck size={20} />
                        <h4 style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "1px" }}>Operational Health</h4>
                    </div>
                    <div className="glass-card" style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Reliability Score</div>
                            <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "var(--success)" }}>98.2%</div>
                        </div>
                        <div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Active Alerts</div>
                            <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "var(--text-secondary)" }}>0</div>
                        </div>
                    </div>
                </div>

                {/* Section: Deployment History */}
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.2rem", color: "var(--accent-cyan)" }}>
                        <History size={20} />
                        <h4 style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "1px" }}>Recent Deployments</h4>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {[
                            { version: "v2.4.1", date: "2 hours ago", status: "SUCCESS" },
                            { version: "v2.4.0", date: "1 day ago", status: "SUCCESS" },
                            { version: "v2.3.9", date: "3 days ago", status: "FAILED" }
                        ].map((d, i) => (
                            <div key={i} style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{d.version}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{d.date}</div>
                                </div>
                                <div style={{ color: d.status === 'SUCCESS' ? "var(--success)" : "var(--danger)", fontSize: "0.75rem", fontWeight: "bold" }}>
                                    {d.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section: Call Graph */}
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.2rem", color: "var(--accent-violet)" }}>
                        <Share2 size={20} />
                        <h4 style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "1px" }}>Inter-Service Topology</h4>
                    </div>
                    <div className="glass-card" style={{ padding: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <span style={{ fontSize: "0.85rem" }}>Inbound Traffic</span>
                            <span style={{ color: "var(--accent-cyan)", fontWeight: "bold" }}>3 Streams</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.85rem" }}>Outbound Calls</span>
                            <span style={{ color: "var(--accent-violet)", fontWeight: "bold" }}>12 API Endpoints</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--glass-border)" }}>
                <button style={{ width: "100%", padding: "1rem", borderRadius: "10px", background: "rgba(255, 50, 50, 0.1)", color: "var(--danger)", fontWeight: "bold", border: "1px solid var(--danger)", cursor: "pointer" }}>
                    Trigger Emergency Rollback
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
