"use client";

import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: true,
  theme: "dark",
  securityLevel: "loose", // Required to allow click events
  themeVariables: {
    primaryColor: "#8b5cf6",
    primaryTextColor: "#f8fafc",
    primaryBorderColor: "#00f2ff",
    lineColor: "#94a3b8",
    secondaryColor: "#1e293b",
    tertiaryColor: "#0a0e14",
  },
});

interface ArchitectureGraphProps {
  code: string;
  onComponentClick: (name: string) => void;
}

const ArchitectureGraph: React.FC<ArchitectureGraphProps> = ({ code, onComponentClick }) => {
  const graphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Attach callback to window for Mermaid to find it
    (window as any).showComponentDetail = (nodeId: string) => {
      onComponentClick(nodeId);
    };

    if (graphRef.current) {
      mermaid.contentLoaded();
    }
  }, [code, onComponentClick]);

  return (
    <div className="glass-card" style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto" }}>
      <div ref={graphRef} className="mermaid" style={{ minWidth: "100%" }}>
        {code}
      </div>
    </div>
  );
};

export default ArchitectureGraph;
