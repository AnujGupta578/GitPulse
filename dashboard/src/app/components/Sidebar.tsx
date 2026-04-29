"use client";

import React from "react";
import { LayoutDashboard, Network, GitBranch, Settings, Database } from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", active: true },
    { icon: <Network size={20} />, label: "Architecture" },
    { icon: <GitBranch size={20} />, label: "Commits" },
    { icon: <Database size={20} />, label: "Infrastructure" },
    { icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <div className="sidebar">
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))" }} />
        <h1 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Orchestrator</h1>
      </div>
      
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {menuItems.map((item) => (
          <div 
            key={item.label}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "1rem", 
              padding: "0.75rem 1rem", 
              borderRadius: "8px",
              cursor: "pointer",
              color: item.active ? "var(--accent-cyan)" : "var(--text-secondary)",
              background: item.active ? "rgba(0, 242, 255, 0.05)" : "transparent",
              transition: "0.2s"
            }}
          >
            {item.icon}
            <span style={{ fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
