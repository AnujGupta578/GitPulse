"use client";

import React from "react";
import { useParams, usePathname } from "next/navigation";
import { Info, Construction } from "lucide-react";
import RepoHeader from "@/app/components/RepoHeader";

export default function WorkspacePlaceholder() {
  const params = useParams();
  const pathname = usePathname();
  const repoId = params.repoId;
  const title = pathname?.split("/").pop()?.replace(/-/g, " ");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <RepoHeader
        repoName={repoId as string}
        provider="github"
        currentBranch="main"
        onBranchChange={() => { }}
        syncStatus="IDLE"
        lastIndexed="2 mins ago"
      />
      <div style={{ padding: "4rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
        <div style={{ padding: "1.5rem", borderRadius: "50%", background: "rgba(0,242,255,0.05)", border: "1px solid var(--accent-cyan)" }}>
          <Construction size={48} color="var(--accent-cyan)" />
        </div>
        <h2 style={{ fontSize: "2rem", fontWeight: "700", textTransform: "capitalize" }}>{title} Intelligence</h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: "500px", lineHeight: "1.6" }}>
          This module is currently being synthesized by the orchestration engine.
          Advanced {title} mapping and AI insights will be available once the repository indexing is complete.
        </p>
        <div className="glass-card" style={{ padding: "1rem 2rem", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Info size={16} color="var(--accent-cyan)" />
          Status: <span style={{ color: "var(--accent-cyan)", fontWeight: "bold" }}>AWAITING_AGENT_PROCESSING</span>
        </div>
      </div>
    </div>
  );
}
