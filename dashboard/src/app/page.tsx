"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Cpu, ExternalLink } from "lucide-react";
import ArchitectureGraph from "./components/ArchitectureGraph";
import CommitFeed from "./components/CommitFeed";
import AnalysisOverlay from "./components/AnalysisOverlay";
import ProcessVisualizer, { ISemanticSummary } from "./components/ProcessVisualizer";

export default function Home() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [semanticSummary, setSemanticSummary] = useState<ISemanticSummary | null>({
    processId: "PRC-904X",
    executiveSummary: "This update refactors the OrderService boundary, improving fault tolerance by cleanly decoupling Stripe dependencies.",
    technicalImpact: "Impacts 3 microservices. Requires careful rolling deployment due to schema changes in the persistence layer.",
    complexityScore: 6
  });


  const sampleMermaid = `
C4Context
    title Architecture Overview
    Boundary(b_PaymentService, "PaymentService", "Core service") {
      System(PaymentService, "PaymentService", "Processes world-class transactions.")
      System(StripeAdapter, "StripeAdapter", "External gateway.")
    }
    Boundary(b_OrderService, "OrderService", "Domain logic") {
      System(OrderService, "OrderService", "Manages product lifecycle.")
    }
    
    Rel(OrderService, PaymentService, "Uses")
    
    UpdateElementStyle(PaymentService, $bgColor="#d4edda", $borderColor="#28a745")
  `;

  return (
    <>
      <main className="main-view" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem", position: "relative" }}>
        <AnimatePresence>
          {isAnalyzing && (
            <AnalysisOverlay onClose={async () => {
              setIsAnalyzing(false);
              try {
                const res = await fetch('http://localhost:8000/summary');
                if (res.ok) {
                  const data = await res.json();
                  if (data && data.processId !== "PENDING") {
                    setSemanticSummary(data);
                  }
                }
              } catch (e) {
                console.error("Failed to fetch summary:", e);
              }
            }} />
          )}
        </AnimatePresence>

        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>System Architecture Overview</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Live Synthesis | Commit: <span className="accent-text">HEAD</span></p>
          </div>
          <div className="glass-card" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
            <span style={{ color: "var(--success)" }}>●</span> Engine Status: <span className="accent-text">Synchronized</span>
          </div>
        </header>
        
        <div style={{ flex: 1 }}>
          <ArchitectureGraph code={sampleMermaid} onComponentClick={(name) => setSelectedComponent(name)} />
        </div>

        {/* --- DRILL-DOWN DETAIL PANEL --- */}
        <AnimatePresence>
          {selectedComponent && (
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{ 
                position: "absolute", 
                top: 0, 
                right: 0, 
                width: "450px", 
                height: "100%", 
                background: "rgba(10, 14, 20, 0.95)",
                backdropFilter: "blur(20px)",
                borderLeft: "1px solid var(--glass-border)",
                padding: "2.5rem",
                zIndex: 100,
                boxShadow: "-10px 0 30px rgba(0,0,0,0.5)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <span className="accent-text" style={{ fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase" }}>Component Insight</span>
                <button onClick={() => setSelectedComponent(null)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>
                  <X size={24} />
                </button>
              </div>

              <h3 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>{selectedComponent}</h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: "1.6" }}>
                This component was recently synthesized by the Council of Agents. It represents a critical bounded context in your domain logic.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div className="glass-card" style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.75rem", color: "var(--accent-cyan)" }}>
                    <Cpu size={20} />
                    <span style={{ fontWeight: "bold" }}>Architectural Rationale</span>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                    Added to decouple payment processing from the core order state machine, improving system resiliency.
                  </p>
                </div>

                <div className="glass-card" style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.75rem", color: "var(--warning)" }}>
                    <Shield size={20} />
                    <span style={{ fontWeight: "bold" }}>Governance Analysis</span>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                    PASS: Encryption standards met. No sensitive leak detected in AST patterns.
                  </p>
                </div>

                {/* Dynamic Semantic Summary Injection */}
                {semanticSummary && (
                  <ProcessVisualizer summary={semanticSummary} />
                )}
              </div>

              <button style={{ 
                marginTop: "2rem", 
                width: "100%", 
                padding: "1rem", 
                borderRadius: "8px", 
                background: "var(--accent-cyan)", 
                color: "var(--bg-primary)", 
                fontWeight: "bold", 
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                cursor: "pointer"
              }}>
                <ExternalLink size={18} />
                Explore Source Logic
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <CommitFeed />
    </>
  );
}
