"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ArchitectureGraph from "./components/ArchitectureGraph";
import CommitFeed from "./components/CommitFeed";
import OnboardingFlow from "./components/OnboardingFlow";

export default function Home() {
  const [connected, setConnected] = useState(false);
  const sampleMermaid = `
C4Context
    title Architecture Overview
    System(PaymentService, "PaymentService", "Core service for processing payments.")
    System(AuthService, "AuthService", "Handles user authentication.")
    System(OrderService, "OrderService", "Manages product orders.")
    
    Rel(OrderService, PaymentService, "Uses")
    Rel(OrderService, AuthService, "Authenticates")
    
    UpdateElementStyle(PaymentService, $bgColor="#d4edda", $borderColor="#28a745")
  `;

  if (!connected) {
    return <OnboardingFlow />;
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-view" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>System Architecture Overview</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>v2.3.1 | Commit: <span className="accent-text">abc123d</span></p>
          </div>
          <div className="glass-card" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
            <span style={{ color: "var(--success)" }}>●</span> Status: <span className="accent-text">Online</span>
          </div>
        </header>
        
        <div style={{ flex: 1 }}>
          <ArchitectureGraph code={sampleMermaid} />
        </div>
      </main>
      
      <CommitFeed />
    </div>
  );
}
