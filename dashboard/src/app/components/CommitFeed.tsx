"use client";

import React from "react";
import { motion } from "framer-motion";
import { GitCommit, ShieldAlert } from "lucide-react";

const CommitFeed = () => {
  const commits = [
    {
      id: "abc123d",
      author: "alex.dev",
      time: "2m ago",
      intent: "Implement PaymentService",
      severity: "High",
      rationale: "Core service for processing Stripe payments with retry logic.",
    },
    {
      id: "efg456h",
      author: "sarah.arch",
      time: "15m ago",
      intent: "Optimize DB Indexing",
      severity: "Medium",
      rationale: "Reduced latency for cross-container dependency queries.",
    }
  ];

  return (
    <div className="commit-feed">
      <h2 style={{ marginBottom: "1.5rem", fontSize: "1.2rem" }}>Commit Intent Feed</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {commits.map((commit, index) => (
          <motion.div
            key={commit.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card"
          >
            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{ color: commit.severity === "High" ? "var(--danger)" : "var(--accent-cyan)" }}>
                {commit.severity === "High" ? <ShieldAlert size={20} /> : <GitCommit size={20} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span className="accent-text" style={{ fontSize: "0.8rem" }}>{commit.id}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{commit.time}</span>
                </div>
                <h3 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>{commit.intent}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                  {commit.rationale}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CommitFeed;
