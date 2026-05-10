"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { 
  LayoutDashboard, Network, GitBranch, Settings, Database, 
  Activity, Share2, Library, ShieldCheck, Zap, 
  Boxes, Server, History, BrainCircuit, AlertTriangle
} from "lucide-react";

const RepoSidebar = () => {
  const pathname = usePathname();
  const params = useParams();
  const repoId = params.repoId as string;

  const menuItems = [
    { icon: <LayoutDashboard size={18} />, label: "Overview", href: `/workspace/${repoId}` },
    { icon: <GitBranch size={18} />, label: "Branches", href: `/workspace/${repoId}/branches` },
    { icon: <Network size={18} />, label: "Architecture", href: `/workspace/${repoId}/architecture` },
    { icon: <Activity size={18} />, label: "Architecture Drift", href: `/workspace/${repoId}/drift` },
    { icon: <History size={18} />, label: "Commits", href: `/workspace/${repoId}/commits` },
    { icon: <Database size={18} />, label: "Infrastructure", href: `/workspace/${repoId}/infrastructure` },
    { icon: <Boxes size={18} />, label: "Dependencies", href: `/workspace/${repoId}/dependencies` },
    { icon: <Server size={18} />, label: "Services", href: `/workspace/${repoId}/services` },
    { icon: <Share2 size={18} />, label: "Sync Center", href: `/workspace/${repoId}/sync` },
    { icon: <BrainCircuit size={18} />, label: "AI Insights", href: `/workspace/${repoId}/insights` },
    { icon: <AlertTriangle size={18} />, label: "Risk Analysis", href: `/workspace/${repoId}/risk` },
    { icon: <Settings size={18} />, label: "Settings", href: `/workspace/${repoId}/settings` },
  ];

  return (
    <div className="repo-sidebar" style={{
      width: "240px",
      height: "100%",
      background: "rgba(10, 14, 20, 0.4)",
      borderRight: "1px solid var(--glass-border)",
      display: "flex",
      flexDirection: "column",
      padding: "1.5rem 1rem",
      backdropFilter: "blur(12px)"
    }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: "bold", color: "var(--accent-cyan)", letterSpacing: "0.1em", marginBottom: "1rem" }}>
          REPOSITORY WORKSPACE
        </div>
        <div style={{ 
          padding: "0.75rem", 
          background: "rgba(255,255,255,0.03)", 
          borderRadius: "8px", 
          border: "1px solid var(--glass-border)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem"
        }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "4px", background: "var(--accent-cyan)", opacity: 0.8 }} />
          <div style={{ fontSize: "0.85rem", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {repoId || "Repository"}
          </div>
        </div>
      </div>
      
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", overflowY: "auto" }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.label}
              href={item.href}
              style={{ textDecoration: 'none' }}
            >
              <div 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.75rem", 
                  padding: "0.6rem 0.75rem", 
                  borderRadius: "6px",
                  cursor: "pointer",
                  color: isActive ? "white" : "var(--text-secondary)",
                  background: isActive ? "rgba(255, 255, 255, 0.05)" : "transparent",
                  transition: "0.2s"
                }}
              >
                <span style={{ color: isActive ? "var(--accent-cyan)" : "inherit" }}>
                  {item.icon}
                </span>
                <span style={{ fontWeight: isActive ? 600 : 400, fontSize: "0.9rem" }}>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default RepoSidebar;
