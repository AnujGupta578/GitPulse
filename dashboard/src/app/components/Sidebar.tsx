"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { 
  LayoutDashboard, Network, GitBranch, Settings, Database, 
  Activity, FolderGit2, Bot, Share2, Library, ShieldCheck, LogOut
} from "lucide-react";

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Home", href: "/" },
    { icon: <Activity size={20} />, label: "Repositories", href: "/repositories" },
    { icon: <FolderGit2 size={20} />, label: "Connections", href: "/connections" },
    { icon: <Bot size={20} />, label: "AI Agents", href: "/agents" },
    { icon: <Settings size={20} />, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="sidebar">
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))" }} />
        <h1 style={{ fontSize: "1.2rem", fontWeight: "700" }}>GitPulse</h1>
      </div>
      
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", overflowY: "auto", paddingRight: "0.5rem" }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          
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
                  gap: "1rem", 
                  padding: "0.75rem 1rem", 
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: isActive ? "var(--accent-cyan)" : "var(--text-secondary)",
                  background: isActive ? "rgba(0, 242, 255, 0.05)" : "transparent",
                  transition: "0.2s"
                }}
              >
                {item.icon}
                <span style={{ fontWeight: 500 }}>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div style={{ marginTop: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {/* User info + logout */}
        {user && (
          <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "0.75rem" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.name || user.email}
            </div>
            <button
              onClick={logout}
              style={{
                width: "100%", padding: "0.5rem 0.75rem",
                borderRadius: "7px", border: "1px solid rgba(239,68,68,0.3)",
                background: "rgba(239,68,68,0.08)", color: "#f87171",
                fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem"
              }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
