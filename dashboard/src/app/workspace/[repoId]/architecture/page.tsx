"use client";

import React, { useState, useEffect, useRef } from "react";
import { Network, ZoomIn, ZoomOut, Maximize2, Share2, Info, Activity, Database, Server, Globe, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { useRepository } from "@/app/context/RepositoryContext";

export default function ArchitecturePage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const { branch } = useRepository();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [zoom, setZoom] = useState(1);
  
  useEffect(() => {
    setIsLoading(true);
    fetch(`http://localhost:8000/api/repositories/${repoId}/architecture?branch=${branch}`)
      .then(r => r.json())
      .then(result => {
        if (result.success) {
            setData(result.data);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [repoId, branch]);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'gateway': return <Globe size={20} />;
      case 'service': return <Server size={20} />;
      case 'database': return <Database size={20} />;
      case 'module': return <Box size={20} />;
      default: return <Activity size={20} />;
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)", overflow: "hidden" }}>
      {/* Top Header */}
      <header style={{ padding: "1.5rem 2rem", borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(10, 14, 20, 0.8)", backdropFilter: "blur(20px)", zIndex: 10 }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Network size={24} color="var(--accent-cyan)" />
            Architecture Explorer
          </h2>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
             Semantic Call Graph & Infrastructure Topology • <b>{branch}</b>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: "1rem" }}>
           <div className="glass-card" style={{ display: "flex", padding: "0.5rem", gap: "0.5rem" }}>
             <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}><ZoomOut size={18} /></button>
             <span style={{ fontSize: "0.8rem", width: "40px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>{Math.round(zoom * 100)}%</span>
             <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}><ZoomIn size={18} /></button>
           </div>
           <button className="glass-card" style={{ padding: "0.5rem 1rem", color: "var(--accent-cyan)", fontWeight: "bold", fontSize: "0.85rem", border: "1px solid var(--accent-cyan)" }}>
             Export Diagram
           </button>
        </div>
      </header>

      {/* Main Graph Area */}
      <div style={{ flex: 1, position: "relative", cursor: "grab" }}>
        {isLoading ? (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="spin" style={{ width: "40px", height: "40px", border: "4px solid var(--accent-cyan)", borderTopColor: "transparent", borderRadius: "50%" }} />
          </div>
        ) : (
          <div style={{ 
            width: "100%", height: "100%", 
            transform: `scale(${zoom})`, 
            transition: "0.3s transform",
            display: "flex", alignItems: "center", justifyContent: "center" 
          }}>
            {/* Minimalist Grid Background */}
            <div style={{ 
              position: "absolute", inset: "-200%", 
              backgroundImage: "radial-gradient(rgba(0, 242, 255, 0.05) 1px, transparent 0)", 
              backgroundSize: "40px 40px" 
            }} />

            {/* Nodes Container */}
            <div style={{ position: "relative", width: "800px", height: "600px" }}>
                {(data?.topology?.nodes || []).map((node: any, i: number) => {
                    // Simple radial layout for demo
                    const angle = (i / data.topology.nodes.length) * Math.PI * 2;
                    const x = 400 + Math.cos(angle) * 200;
                    const y = 300 + Math.sin(angle) * 200;

                    return (
                        <motion.div
                            key={node.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(0, 242, 255, 0.3)" }}
                            onClick={() => setSelectedNode(node)}
                            style={{
                                position: "absolute", left: x, top: y,
                                width: "60px", height: "60px",
                                background: "rgba(10, 14, 20, 0.9)",
                                border: selectedNode?.id === node.id ? "2px solid var(--accent-cyan)" : "1px solid var(--glass-border)",
                                borderRadius: "12px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", color: "var(--accent-cyan)",
                                zIndex: 2
                            }}
                        >
                            {getNodeIcon(node.type)}
                            <div style={{ position: "absolute", top: "70px", width: "120px", textAlign: "center", color: "white", fontSize: "0.75rem", fontWeight: "600" }}>
                                {node.label}
                            </div>
                        </motion.div>
                    );
                })}

                {/* SVG Edges */}
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }}>
                    {(data?.topology?.edges || []).map((edge: any) => {
                        const sourceIdx = data.topology.nodes.findIndex((n: any) => n.id === edge.source);
                        const targetIdx = data.topology.nodes.findIndex((n: any) => n.id === edge.target);
                        if (sourceIdx === -1 || targetIdx === -1) return null;

                        const sAngle = (sourceIdx / data.topology.nodes.length) * Math.PI * 2;
                        const tAngle = (targetIdx / data.topology.nodes.length) * Math.PI * 2;
                        
                        const x1 = 430 + Math.cos(sAngle) * 200;
                        const y1 = 330 + Math.sin(sAngle) * 200;
                        const x2 = 430 + Math.cos(tAngle) * 200;
                        const y2 = 330 + Math.sin(tAngle) * 200;

                        return (
                            <motion.line 
                                key={edge.id}
                                x1={x1} y1={y1} x2={x2} y2={y2}
                                stroke="rgba(0, 242, 255, 0.2)"
                                strokeWidth="2"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                            />
                        );
                    })}
                </svg>
            </div>
          </div>
        )}
      </div>

      {/* Side Detail Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            style={{ 
                position: "absolute", right: 0, top: 0, bottom: 0, width: "380px",
                background: "rgba(10, 14, 20, 0.95)", borderLeft: "1px solid var(--glass-border)",
                backdropFilter: "blur(30px)", padding: "2.5rem", zIndex: 20,
                display: "flex", flexDirection: "column", gap: "2rem"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ padding: "0.75rem", background: "rgba(0, 242, 255, 0.05)", borderRadius: "12px", border: "1px solid var(--accent-cyan)", color: "var(--accent-cyan)" }}>
                    {getNodeIcon(selectedNode.type)}
                </div>
                <button onClick={() => setSelectedNode(null)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.5rem" }}>×</button>
            </div>

            <div>
                <h3 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>{selectedNode.label}</h3>
                <div style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", fontWeight: "bold", textTransform: "uppercase", marginTop: "0.5rem" }}>{selectedNode.type}</div>
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: "1.7" }}>
                {selectedNode.description}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="glass-card" style={{ padding: "1.2rem" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "bold", textTransform: "uppercase", marginBottom: "0.5rem" }}>Domain</div>
                    <div style={{ fontWeight: "600" }}>{selectedNode.domain}</div>
                </div>
                <div className="glass-card" style={{ padding: "1.2rem" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "bold", textTransform: "uppercase", marginBottom: "0.5rem" }}>Inbound Links</div>
                    <div style={{ fontWeight: "600" }}>{data.topology.edges.filter((e: any) => e.target === selectedNode.id).length} Active Connections</div>
                </div>
            </div>

            <div style={{ marginTop: "auto" }}>
                <button style={{ width: "100%", padding: "1rem", borderRadius: "10px", background: "var(--accent-cyan)", color: "var(--bg-primary)", fontWeight: "bold", border: "none", cursor: "pointer" }}>
                    View Module Internals
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Bar */}
      {data?.metrics && (
          <footer style={{ padding: "1rem 2rem", borderTop: "1px solid var(--glass-border)", background: "rgba(10, 14, 20, 0.4)", display: "flex", gap: "3rem", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Coupling Score:</span>
                  <span style={{ color: "var(--accent-cyan)", fontWeight: "bold" }}>{data.metrics.couplingScore.toFixed(1)}%</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Layer Integrity:</span>
                  <span style={{ color: "var(--success)", fontWeight: "bold" }}>{data.metrics.layerIntegrity}%</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Domain Count:</span>
                  <span style={{ color: "white", fontWeight: "bold" }}>{data.metrics.domainCount}</span>
              </div>
          </footer>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
