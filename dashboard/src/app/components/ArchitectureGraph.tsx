"use client";

import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: true,
  theme: "dark",
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
}

const ArchitectureGraph: React.FC<ArchitectureGraphProps> = ({ code }) => {
  const graphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (graphRef.current) {
      mermaid.contentLoaded();
    }
  }, [code]);

  return (
    <div className="glass-card" style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div ref={graphRef} className="mermaid">
        {code}
      </div>
    </div>
  );
};

export default ArchitectureGraph;
