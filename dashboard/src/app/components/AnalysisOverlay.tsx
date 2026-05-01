"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, X, CheckCircle2, Loader2 } from "lucide-react";

interface AnalysisOverlayProps {
  onClose: () => void;
}

const AnalysisOverlay: React.FC<AnalysisOverlayProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const apiBase = "http://localhost:8000";

  useEffect(() => {
    const eventSource = new EventSource(`${apiBase}/analyze/stream?commit_sha=HEAD`);

    eventSource.onmessage = (event) => {
      if (event.data.includes("[COMPLETE]")) {
        setIsFinished(true);
        eventSource.close();
      } else {
        setLogs(prev => [...prev, event.data.replace("data: ", "")]);
      }
    };

    eventSource.onerror = () => {
      setLogs(prev => [...prev, "⚠️ Connection failed. Retrying..."]);
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      style={{ 
        position: "fixed", 
        inset: 0, 
        background: "rgba(10, 14, 20, 0.9)", 
        backdropFilter: "blur(15px)", 
        zIndex: 1000, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "2rem"
      }}
    >
      <div className="glass-card" style={{ maxWidth: "600px", width: "100%", padding: "3rem", textAlign: "center", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
          <X size={24} />
        </button>

        <div style={{ marginBottom: "2rem", color: "var(--accent-cyan)" }}>
          <Activity size={64} className={!isFinished ? "pulse-animation" : ""} />
        </div>

        <h2 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Architectural Synthesis</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Extracting structural intent from the local environment.</p>

        <div style={{ 
          background: "#000", 
          borderRadius: "12px", 
          padding: "1.5rem", 
          textAlign: "left", 
          height: "200px", 
          overflowY: "auto", 
          marginBottom: "2rem",
          fontFamily: "monospace",
          fontSize: "0.85rem",
          border: "1px solid var(--glass-border)"
        }}>
          {logs.map((log, i) => (
            <div key={i} style={{ marginBottom: "0.5rem", display: "flex", gap: "0.8rem" }}>
              <span style={{ color: "var(--accent-cyan)", fontWeight: "bold" }}>[CORE]</span>
              <span>{log}</span>
            </div>
          ))}
          {!isFinished && <div className="blink" style={{ color: "var(--accent-cyan)" }}>| Analyzing AST...</div>}
        </div>

        {isFinished && (
          <motion.button 
            initial={{ scale: 0.9 }} 
            animate={{ scale: 1 }} 
            onClick={onClose}
            style={{ 
              padding: "1rem 3rem", 
              borderRadius: "12px", 
              background: "var(--success)", 
              color: "white", 
              fontWeight: "bold", 
              border: "none", 
              cursor: "pointer" 
            }}
          >
            Return to Dashboard
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default AnalysisOverlay;
