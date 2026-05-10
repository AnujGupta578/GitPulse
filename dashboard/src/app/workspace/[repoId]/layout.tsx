"use client";

import RepoSidebar from "@/app/components/RepoSidebar";
import { RepositoryProvider, useRepository } from "@/app/context/RepositoryContext";
import { WorkspaceIntelligenceProvider } from "@/app/context/IntelligenceProvider";
import React from "react";

function WorkspaceContent({ children }: { children: React.ReactNode }) {
  const { repoId } = useRepository();
  
  if (!repoId) {
    return (
      <div style={{ 
        display: "flex", 
        height: "100%", 
        width: "100%", 
        alignItems: "center", 
        justifyContent: "center", 
        background: "var(--bg-primary)",
        flexDirection: "column",
        gap: "1rem"
      }}>
         <div className="spin" style={{ width: "40px", height: "40px", border: "4px solid var(--accent-cyan)", borderTopColor: "transparent", borderRadius: "50%" }} />
         <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: "600" }}>Initializing Workspace...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100%", width: "100%", overflow: "hidden" }}>
      <RepoSidebar />
      <div style={{ flex: 1, overflowY: "auto", position: "relative", background: "var(--bg-primary)" }}>
        {children}
      </div>
    </div>
  );
}

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RepositoryProvider>
      <WorkspaceIntelligenceProvider>
        <WorkspaceContent>{children}</WorkspaceContent>
      </WorkspaceIntelligenceProvider>
    </RepositoryProvider>
  );
}
